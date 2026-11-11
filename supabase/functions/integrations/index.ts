import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import {
  list,
  object,
  text,
  parseRiotId,
  positiveId,
  normalizeMatches,
  normalizeRank,
  normalizeEsportsMatch,
  normalizeTournament,
  normalizeBracket,
  normalizeTeam,
} from "../_shared/domain.ts";

const env = (key: string) => Deno.env.get(key) || "";
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter = 0,
  ) {
    super(message);
  }
}
const origins = env("ALLOWED_ORIGINS")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
async function quota(bucket: string, seconds: number, limit: number, cost = 1) {
  const { data, error } = await db.rpc("reserve_integration_quota", {
    p_bucket: bucket,
    p_seconds: seconds,
    p_limit: limit,
    p_cost: cost,
  });
  if (error)
    throw new HttpError(
      503,
      "Não foi possível validar o limite de consultas. Tente novamente.",
    );
  if (!data)
    throw new HttpError(
      429,
      "Limite de consultas atingido. Aguarde antes de tentar novamente.",
      seconds,
    );
}
async function cached(
  key: string,
  ttl: number,
  owner: string | null,
  load: () => Promise<unknown>,
) {
  const { data, error } = await db
    .from("integration_cache")
    .select("payload,expires_at")
    .eq("cache_key", key)
    .maybeSingle();
  if (error)
    throw new HttpError(
      503,
      "O armazenamento da integração ainda não está disponível.",
    );
  if (data && new Date(data.expires_at).getTime() > Date.now())
    return data.payload;

  // Cache vencido: responde na hora com o valor antigo e revalida em segundo plano.
  // Evita pagar a latência do provedor em toda visita.
  if (data) {
    const refresh = (async () => {
      try {
        const value = await load();
        await db.from("integration_cache").upsert({
          cache_key: key,
          owner_id: owner,
          payload: value,
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
        });
      } catch {
        /* mantém o cache antigo se a revalidação falhar */
      }
    })();

    const runtime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } })
      .EdgeRuntime;

    if (runtime?.waitUntil) runtime.waitUntil(refresh);
    else await refresh;

    return data.payload;
  }
  const value = await load();
  const { error: saveError } = await db
    .from("integration_cache")
    .upsert({
      cache_key: key,
      owner_id: owner,
      payload: value,
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
    });
  if (saveError)
    throw new HttpError(
      503,
      "Não foi possível salvar a consulta. Tente novamente.",
    );
  return value;
}
async function upstream(provider: "henrik" | "panda", path: string, cost = 1) {
  const key = env(
    provider === "henrik" ? "HENRIKDEV_API_KEY" : "PANDASCORE_API_KEY",
  );
  if (!key)
    throw new HttpError(
      503,
      provider === "henrik"
        ? "O tracker está aguardando ativação. Volte em breve."
        : "Os campeonatos estão aguardando ativação. Volte em breve.",
    );
  await quota(
    `provider:${provider}`,
    provider === "henrik" ? 60 : 3600,
    provider === "henrik" ? 28 : 900,
    cost,
  );
  let response: Response;
  try {
    response = await fetch(
      (provider === "henrik"
        ? "https://api.henrikdev.xyz"
        : "https://api.pandascore.co") + path,
      {
        headers: {
          Authorization: provider === "henrik" ? key : `Bearer ${key}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      },
    );
  } catch {
    throw new HttpError(
      502,
      "O provedor demorou para responder. Tente novamente.",
    );
  }
  if (!response.ok) {
    if (response.status === 429)
      throw new HttpError(
        429,
        "O provedor atingiu o limite temporário de consultas.",
        Math.min(
          3600,
          Math.max(60, Number(response.headers.get("retry-after")) || 60),
        ),
      );
    if (response.status === 404)
      throw new HttpError(
        404,
        "Não encontrado no provedor para a região e plataforma selecionadas.",
      );
    if ([401, 403].includes(response.status))
      throw new HttpError(
        503,
        "A integração precisa de liberação pelo provedor.",
      );
    throw new HttpError(502, "Não foi possível consultar o provedor agora.");
  }
  try {
    return await response.json();
  } catch {
    throw new HttpError(502, "Resposta inválida do provedor.");
  }
}
async function pandaPages(path: string, maxPages = 10) {
  const rows: unknown[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const batch = await upstream(
      "panda",
      `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
    );
    if (!Array.isArray(batch))
      throw new HttpError(502, "Formato de campeonato inválido na fonte.");
    rows.push(...batch);
    if (batch.length < 100) return { rows, partial: false };
  }
  return { rows, partial: true };
}
async function userId(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token)
    throw new HttpError(
      401,
      "Entre no Skillrush para consultar suas estatísticas.",
    );
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user)
    throw new HttpError(401, "Sua sessão expirou. Entre novamente.");
  return data.user.id;
}
async function handle(req: Request, body: Record<string, any>) {
  const action = text(body.action);
  if (action === "tracker" || action === "tracker-revoke") {
    const uid = await userId(req);
    await quota(`tracker-user:${uid}`, 60, 6);
    if (action === "tracker-revoke") {
      const { error } = await db
        .from("integration_cache")
        .delete()
        .eq("owner_id", uid);
      if (error)
        throw new HttpError(503, "Não foi possível apagar as consultas.");
      const { error: consentError } = await db
        .from("tracker_consents")
        .delete()
        .eq("user_id", uid);
      if (consentError)
        throw new HttpError(503, "Não foi possível revogar a autorização.");
      return { revoked: true };
    }
    if (body.consent !== true)
      throw new HttpError(
        400,
        "Confirme a autorização para consultar seus dados.",
      );
    const { name, tag } = parseRiotId(body.riotId);
    const region = text(body.region),
      platform = text(body.platform),
      mode = text(body.mode);
    if (
      !["br", "latam", "na", "eu", "ap", "kr"].includes(region) ||
      !["pc", "console"].includes(platform) ||
      !["competitive", "unrated", "swiftplay"].includes(mode)
    )
      throw new HttpError(400, "Região, plataforma ou modo inválido.");
    const start = Number(body.start ?? 0);
    if (!Number.isInteger(start) || start < 0 || start > 90 || start % 10)
      throw new HttpError(400, "Página de histórico inválida.");
    const identity = `${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
    const ownerKey = `tracker:${uid}:${region}:${platform}:${identity}`;
    // Binding is a declaration of permission, not verified Riot account ownership.
    const { error: consentError } = await db
      .from("tracker_consents")
      .upsert({
        user_id: uid,
        riot_id: `${name}#${tag}`,
        accepted_at: new Date().toISOString(),
      });
    if (consentError)
      throw new HttpError(503, "Não foi possível registrar a autorização.");
    const scope = `${region}/${platform}/${identity}`;

    return await cached(`${ownerKey}:${mode}:${start}`, 300, uid, async () => {
      // Conta, partidas e rank são independentes: em paralelo, o tracker espera
      // uma rodada de rede em vez de três em sequência.
      const [accountResult, matchesResult, rankResult] = await Promise.allSettled([
        cached(`${ownerKey}:account`, 3600, uid, async () =>
          object(await upstream("henrik", `/valorant/v2/account/${identity}`, 2)).data,
        ),
        upstream("henrik", `/valorant/v4/matches/${scope}?mode=${mode}&size=10&start=${start}`, 12),
        cached(`${ownerKey}:rank`, 600, uid, async () => {
          const mmr = object(await upstream("henrik", `/valorant/v3/mmr/${scope}`, 2)).data;
          let history = null;
          try {
            history = object(await upstream("henrik", `/valorant/v2/mmr-history/${scope}`, 2)).data;
          } catch {
            /* Rank is still usable if RR history is temporarily unavailable. */
          }
          return normalizeRank(mmr, history);
        }),
      ]);

      if (accountResult.status === "rejected") {
        throw accountResult.reason instanceof HttpError
          ? accountResult.reason
          : new HttpError(502, "Não foi possível consultar a conta no provedor.");
      }

      const account = object(accountResult.value);

      if (!text(account.puuid))
        throw new HttpError(
          502,
          "O provedor não retornou a identificação da conta.",
        );

      if (matchesResult.status === "rejected") {
        throw matchesResult.reason instanceof HttpError
          ? matchesResult.reason
          : new HttpError(502, "Não foi possível consultar o histórico agora.");
      }

      const matchesRaw = object(matchesResult.value);

      if (!Array.isArray(matchesRaw.data))
        throw new HttpError(
          502,
          "O provedor não retornou o histórico esperado.",
        );

      const warnings: string[] = [];
      let rank = null;

      if (rankResult.status === "fulfilled") {
        rank = rankResult.value;
      } else {
        warnings.push(
          "Rank indisponível nesta consulta. O histórico de partidas continua disponível.",
        );
      }
      return {
        account: {
          name: text(account.name, name),
          tag: text(account.tag, tag),
          level: account.account_level ?? null,
          region,
          platform,
        },
        rank,
        matches: normalizeMatches(matchesRaw.data, account.puuid),
        hasMore: matchesRaw.data.length === 10 && start < 90,
        fetchedAt: new Date().toISOString(),
        warnings,
        source: "HenrikDev",
        scope:
          "Amostra das partidas recuperadas; não representa todo o histórico da conta.",
      };
    });
  }
  if (action === "esports-list") {
    const status = text(body.status, "running"),
      page = Number(body.page ?? 1);
    if (
      !["running", "upcoming", "past"].includes(status) ||
      !Number.isInteger(page) ||
      page < 1 ||
      page > 20
    )
      throw new HttpError(400, "Filtro de campeonatos inválido.");
    return await cached(
      `esports:list:${status}:${page}`,
      status === "running" ? 60 : 300,
      null,
      async () => {
        // Duas chamadas independentes: disparar em paralelo corta uma ida ao provedor.
        const [tournaments, matches] = await Promise.all([
          upstream("panda", `/valorant/tournaments/${status}?per_page=12&page=${page}`),
          upstream("panda", `/valorant/matches/${status}?per_page=30&page=${page}`),
        ]);
        if (!Array.isArray(tournaments) || !Array.isArray(matches))
          throw new HttpError(502, "Resposta de campeonatos inválida.");
        return {
          tournaments: tournaments.map(normalizeTournament),
          matches: matches.map(normalizeEsportsMatch),
          moreTournaments: tournaments.length === 12,
          moreMatches: matches.length === 30,
          fetchedAt: new Date().toISOString(),
        };
      },
    );
  }
  if (action === "esports-tournament") {
    const id = positiveId(body.id);
    return await cached(`esports:tournament:${id}`, 120, null, async () => {
      const raw = object(await upstream("panda", `/tournaments/${id}`));
      if (
        object(raw.videogame).slug !== "valorant" &&
        object(raw.videogame).name !== "Valorant"
      )
        throw new HttpError(404, "Campeonato de Valorant não encontrado.");
      const matches = await pandaPages(`/tournaments/${id}/matches`);
      const warnings: string[] = [];
      let brackets: unknown[] = [],
        standings: unknown[] = [];

      // Chaveamento e classificação são independentes entre si e das partidas:
      // rodar em paralelo evita três esperas em série.
      const [bracketResult, standingsResult] = await Promise.allSettled([
        raw.has_bracket ? pandaPages(`/tournaments/${id}/brackets`, 4) : Promise.resolve(null),
        pandaPages(`/tournaments/${id}/standings`, 3),
      ]);

      if (bracketResult.status === "fulfilled" && bracketResult.value) {
        brackets = bracketResult.value.rows;
        if (bracketResult.value.partial)
          warnings.push("Chaveamento parcial: limite de paginação atingido.");
      } else if (raw.has_bracket) {
        warnings.push("O chaveamento não está disponível nesta consulta.");
      }

      if (standingsResult.status === "fulfilled") {
        standings = standingsResult.value.rows;
      } else {
        warnings.push("A classificação não está disponível nesta consulta.");
      }
      return {
        tournament: normalizeTournament(raw),
        matches: matches.rows.map(normalizeEsportsMatch),
        brackets: normalizeBracket(brackets),
        partial: matches.partial,
        teams: list(raw.teams).map(normalizeTeam),
        standings: list(standings).map((s) => ({
          rank: s.rank ?? null,
          team: normalizeTeam(s.team),
          wins: s.wins ?? null,
          losses: s.losses ?? null,
          ties: s.ties ?? null,
        })),
        fetchedAt: new Date().toISOString(),
        warnings,
      };
    });
  }
  throw new HttpError(400, "Operação inválida.");
}
export async function handleRequest(req: Request) {
  const origin = req.headers.get("origin") || "";
  const cors = {
    "Access-Control-Allow-Origin": origins.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  };
  if (origin && !origins.includes(origin))
    return new Response(JSON.stringify({ error: "Origem não autorizada." }), {
      status: 403,
      headers: cors,
    });
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "Método não permitido." }), {
      status: 405,
      headers: cors,
    });
  try {
    if (Number(req.headers.get("content-length")) > 4096)
      throw new HttpError(413, "Solicitação muito grande.");
    const raw = await req.text();
    if (raw.length > 4096)
      throw new HttpError(413, "Solicitação muito grande.");
    let body;
    try {
      body = object(JSON.parse(raw));
    } catch {
      throw new HttpError(400, "Solicitação inválida.");
    }
    // Shared circuit-breaker also bounds cache reads from non-browser clients.
    await quota("edge:global", 60, 1200);
    const result = await handle(req, body);
    return new Response(JSON.stringify(result), { headers: cors });
  } catch (e) {
    const error =
      e instanceof HttpError
        ? e
        : new HttpError(
            400,
            e instanceof Error ? e.message : "Solicitação inválida.",
          );
    return new Response(
      JSON.stringify({ error: error.message, retryAfter: error.retryAfter }),
      {
        status: error.status,
        headers: {
          ...cors,
          ...(error.retryAfter
            ? { "Retry-After": String(error.retryAfter) }
            : {}),
        },
      },
    );
  }
}

if (import.meta.main) Deno.serve(handleRequest);
