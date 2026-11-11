"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRetryCountdown } from "@/hooks/useRetryCountdown";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import {
  integration,
  IntegrationError,
  type TrackerResult,
  type PlayerMatch,
} from "@/services/integrations/client";
import {
  aggregate,
  groupStats,
  parseRiotId,
} from "@/lib/integrations/domain";
import {
  buttonClass,
  inputClass,
  Notice,
  Metric,
  Timestamp,
  fixed,
  formatDate,
} from "@/features/integrations/Shared";
import { slugify } from "@/utils/slug";

export function Tracker() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [riotId, setRiotId] = useState("");
  const [region, setRegion] = useState("br");
  const [platform, setPlatform] = useState("pc");
  const [mode, setMode] = useState("competitive");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<TrackerResult | null>(null);
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [start, setStart] = useState(0);
  const [season, setSeason] = useState("");
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wait, startCooldown] = useRetryCountdown();
  const request = useRef<AbortController | null>(null);
  const userRef = useRef<string | null>(null);
  const identityRef = useRef("");
  useEffect(() => {
    let active = true;
    const apply = (id: string | null) => {
      if (!active) return;
      if (userRef.current !== id) {
        request.current?.abort();
        userRef.current = id;
        setResult(null);
        setMatches([]);
        setConsent(false);
        setBusy(false);
        setError("");
      }
      setUserId(id);
      setAuthLoading(false);
    };
    supabase.auth
      .getSession()
      .then(({ data }) => apply(data.session?.user.id || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      apply(session?.user.id || null),
    );
    return () => {
      active = false;
      request.current?.abort();
      data.subscription.unsubscribe();
    };
  }, []);
  const filtered = useMemo(
    () => matches.filter((m) => !season || m.seasonId === season),
    [matches, season],
  );
  const stats = useMemo(() => aggregate(filtered), [filtered]);
  const seasons = useMemo(
    () => [...new Map(matches.map((m) => [m.seasonId, m.season])).entries()],
    [matches],
  );
  function changed() {
    request.current?.abort();
    setBusy(false);
    setResult(null);
    setMatches([]);
    setSeason("");
    setStart(0);
    setError("");
  }
  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/tracker/` },
    });
    if (error)
      setError(
        "Não foi possível enviar o link de acesso. Tente novamente ou fale com o suporte.",
      );
    else
      setAuthMessage(
        "Enviamos um link para seu e-mail. Abra-o neste navegador para continuar.",
      );
    setBusy(false);
  }
  async function loginGoogle() {
    setBusy(true);
    setError("");
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/tracker/` },
    });
    if (error) {
      setError(
        "O login com Google ainda não está ativo. Use o link por e-mail enquanto isso.",
      );
      setBusy(false);
    }
  }
  async function search(event?: FormEvent, more = false) {
    event?.preventDefault();
    if (!consent || !userId || wait) return;
    try {
      parseRiotId(riotId);
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const identity = `${userId}:${riotId}:${region}:${platform}:${mode}`;
    identityRef.current = identity;
    const offset = more ? start + 10 : 0;
    setBusy(true);
    setError("");
    if (!more) {
      setResult(null);
      setMatches([]);
      setSeason("");
    }
    try {
      const data = await integration<TrackerResult>(
        {
          action: "tracker",
          riotId,
          region,
          platform,
          mode,
          consent,
          start: offset,
        },
        controller.signal,
      );
      if (
        controller.signal.aborted ||
        identityRef.current !== identity ||
        userRef.current !== userId
      )
        return;
      setMatches((old) =>
        [
          ...new Map(
            (more ? [...old, ...data.matches] : data.matches).map((m) => [
              m.id,
              m,
            ]),
          ).values(),
        ].sort((a, b) => b.date.localeCompare(a.date)),
      );
      setStart(offset);
      setResult(data);
    } catch (e) {
      if (controller.signal.aborted) return;
      setError((e as Error).message);
      if (e instanceof IntegrationError && e.retryAfter) {
        startCooldown(e.retryAfter);
      }
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  async function revoke() {
    request.current?.abort();
    setBusy(true);
    setError("");
    try {
      await integration({ action: "tracker-revoke" });
      setResult(null);
      setMatches([]);
      setConsent(false);
      setRiotId("");
      setAuthMessage("Autorização revogada e consultas armazenadas apagadas.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-7 px-4 py-10 sm:px-6">
      <header>
        <p className="flex items-center gap-2 text-sm text-accent-300">
          <Activity size={18} /> Skillrush Tracker
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Conheça seu jogo
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Seu desempenho, seus agentes e suas partidas em um só lugar.
          Estatísticas calculadas sobre as partidas recuperadas.
        </p>
      </header>
      {error && (
        <Notice error>
          {error}
          {wait > 0 && ` Tente novamente em ${wait}s.`}
        </Notice>
      )}
      {authMessage && <Notice>{authMessage}</Notice>}
      {authLoading ? (
        <Notice>Verificando acesso…</Notice>
      ) : !userId ? (
        <section className="grid gap-8 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:grid-cols-2">
          <div>
            <ShieldCheck className="text-accent-300" />
            <h2 className="mt-3 text-xl font-semibold">
              Entre para consultar suas estatísticas
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Usamos seu e-mail para acessar o Skillrush. A consulta é privada.
              Não pedimos a senha da sua conta Riot.
            </p>
            <Link
              href="/privacidade"
              className="mt-4 inline-block text-sm text-accent-300"
            >
              Como seus dados são usados →
            </Link>
          </div>
          <form onSubmit={login} className="space-y-3">
            <button
              type="button"
              onClick={loginGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 disabled:opacity-60"
            >
              <span aria-hidden="true" className="text-base font-bold">G</span>
              Entrar com Google
            </button>

            <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-widest text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              ou
              <span className="h-px flex-1 bg-slate-800" />
            </div>

            <label htmlFor="tracker-email" className="block text-sm">
              E-mail
            </label>
            <input
              id="tracker-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="voce@exemplo.com"
            />
            <button className={buttonClass} disabled={busy}>
              {busy ? "Enviando…" : "Receber link por e-mail"}
            </button>
          </form>
        </section>
      ) : (
        <>
          <form
            onSubmit={(e) => search(e)}
            className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6"
          >
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
              <label className="space-y-2 text-sm">
                <span>Seu Riot ID</span>
                <input
                  required
                  maxLength={100}
                  placeholder="Nome#TAG"
                  value={riotId}
                  onChange={(e) => {
                    changed();
                    setRiotId(e.target.value);
                  }}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Região</span>
                <select
                  value={region}
                  onChange={(e) => {
                    changed();
                    setRegion(e.target.value);
                  }}
                  className={inputClass}
                >
                  {[
                    ["br", "Brasil"],
                    ["latam", "América Latina"],
                    ["na", "América do Norte"],
                    ["eu", "Europa"],
                    ["ap", "Ásia-Pacífico"],
                    ["kr", "Coreia"],
                  ].map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span>Plataforma</span>
                <select
                  value={platform}
                  onChange={(e) => {
                    changed();
                    setPlatform(e.target.value);
                  }}
                  className={inputClass}
                >
                  <option value="pc">PC</option>
                  <option value="console">Console</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span>Modo</span>
                <select
                  value={mode}
                  onChange={(e) => {
                    changed();
                    setMode(e.target.value);
                  }}
                  className={inputClass}
                >
                  <option value="competitive">Competitivo</option>
                  <option value="unrated">Sem classificação</option>
                  <option value="swiftplay">Disputa rápida</option>
                </select>
              </label>
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
              />
              <span>
                Confirmo que tenho autorização para consultar esta conta e
                autorizo o Skillrush a processar os dados pela HenrikDev. Esta
                declaração não verifica a titularidade da conta Riot.{" "}
                <Link href="/privacidade" className="text-accent-300 underline">
                  Privacidade
                </Link>
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button
                className={buttonClass}
                disabled={busy || !consent || wait > 0}
              >
                {busy
                  ? "Consultando…"
                  : wait > 0
                    ? `Aguarde ${wait}s`
                    : "Consultar estatísticas"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={revoke}
                className="text-sm text-slate-400 underline disabled:opacity-50"
              >
                Revogar autorização e apagar consultas
              </button>
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="ml-auto text-sm text-slate-400"
              >
                Sair
              </button>
            </div>
          </form>
          {busy && !result && (
            <Notice>
              Buscando suas partidas. Esta consulta pode levar alguns segundos…
            </Notice>
          )}
          {result && (
            <>
              <section className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {result.account.name}
                    <span className="text-slate-500">
                      #{result.account.tag}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Nível {result.account.level ?? "-"} · {region.toUpperCase()}{" "}
                    · {platform.toUpperCase()} · Fonte: HenrikDev
                  </p>
                </div>
                <Timestamp value={result.fetchedAt} />
              </section>
              {result.warnings.map((w) => (
                <Notice key={w}>{w}</Notice>
              ))}
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Rank atual informado"
                  value={result.rank?.tier || null}
                />
                <Metric
                  label="Pontos de rank (RR)"
                  value={result.rank?.rr ?? null}
                />
                <Metric
                  label="Pico informado"
                  value={
                    result.rank
                      ? `${result.rank.peak} ${result.rank.peakSeason}`
                      : null
                  }
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <nav aria-label="Estatísticas" className="flex flex-wrap gap-2">
                  {[
                    ["overview", "Visão geral"],
                    ["matches", "Partidas"],
                    ["agents", "Agentes"],
                    ["maps", "Mapas"],
                    ["rank", "Evolução de rank"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      aria-pressed={tab === id}
                      className={`rounded-xl px-4 py-2 text-sm ${tab === id ? "bg-accent-500/15 text-accent-200" : "text-slate-400 hover:bg-slate-900"}`}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  Ato
                  <select
                    aria-label="Filtrar ato das partidas recuperadas"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-2"
                  >
                    <option value="">Todos recuperados</option>
                    {seasons.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Notice>
                {stats.count} partidas na seleção · {result.scope} Headshot %
                considera acertos, não eliminações. O filtro de ato aplica-se às
                partidas e aos resumos; o rank atual não muda.
              </Notice>
              {tab === "overview" && (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Metric label="K/D" value={fixed(stats.kd, 2)} />
                    <Metric
                      label="Vitórias"
                      value={fixed(stats.winrate)}
                      suffix="%"
                    />
                    <Metric label="ACS" value={fixed(stats.acs)} />
                    <Metric label="Dano / round" value={fixed(stats.adr)} />
                    <Metric
                      label="Headshots"
                      value={fixed(stats.hs)}
                      suffix="%"
                    />
                    <Metric
                      label="Delta de dano / round"
                      value={fixed(stats.delta)}
                    />
                    <Metric
                      label="Vitórias / derrotas"
                      value={`${stats.wins} / ${stats.losses}`}
                    />
                    <Metric
                      label="Tempo na amostra"
                      value={fixed(stats.hours)}
                      suffix=" h"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">Partidas recentes</h3>
                  <MatchTable matches={filtered.slice(0, 5)} />
                </>
              )}
              {tab === "matches" && <MatchTable matches={filtered} />}
              {(tab === "agents" || tab === "maps") && (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        {[
                          tab === "agents" ? "Agente" : "Mapa",
                          "Partidas",
                          "Vitórias",
                          "K/D",
                          "ACS",
                          "Dano/round",
                        ].map((c) => (
                          <th key={c} className="p-4">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupStats(
                        filtered,
                        tab === "agents" ? "agent" : "map",
                      ).map((s) => (
                        <tr key={s.name} className="border-t border-slate-800">
                          <td className="p-4">
                            <Link
                              className="text-accent-300"
                              href={`/${tab === "agents" ? "agents" : "maps"}/${slugify(s.name)}`}
                            >
                              {s.name} ↗
                            </Link>
                          </td>
                          <td className="p-4">{s.count}</td>
                          <td className="p-4">{fixed(s.winrate)}%</td>
                          <td className="p-4">{fixed(s.kd, 2) ?? "-"}</td>
                          <td className="p-4">{fixed(s.acs) ?? "-"}</td>
                          <td className="p-4">{fixed(s.adr) ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filtered.length && (
                    <p className="p-6 text-slate-400">
                      Sem partidas nessa seleção.
                    </p>
                  )}
                </div>
              )}
              {tab === "rank" && (
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Alterações recentes informadas pelo provedor
                  </h3>
                  {!result.rank?.history.length && (
                    <Notice>Nenhuma alteração de RR disponível.</Notice>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {result.rank?.history.map((h, i) => (
                      <article
                        key={`${h.date}-${i}`}
                        className="rounded-2xl border border-slate-800 p-4"
                      >
                        <p className="text-xs text-slate-500">
                          {formatDate(h.date)} · {h.map}
                        </p>
                        <p className="mt-2 font-medium">
                          {h.tier} · {h.rr ?? "-"} RR
                        </p>
                        <p
                          className={
                            h.change !== null && h.change >= 0
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }
                        >
                          {h.change === null
                            ? "-"
                            : `${h.change >= 0 ? "+" : ""}${h.change}`}{" "}
                          RR
                        </p>
                      </article>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold">Atos informados</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.rank?.seasons.map((s) => (
                      <article
                        className="rounded-2xl border border-slate-800 p-4"
                        key={s.id}
                      >
                        <p>
                          {s.name} · {s.tier}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {s.wins} vitórias em {s.games} partidas informadas
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {result.hasMore && (
                <button
                  onClick={() => search(undefined, true)}
                  disabled={busy || wait > 0}
                  className={`${buttonClass} flex items-center gap-2`}
                >
                  {busy ? "Carregando…" : "Buscar mais 10 partidas"}
                  <ArrowRight size={16} />
                </button>
              )}
            </>
          )}
        </>
      )}
      <p className="text-xs text-slate-500">
        O Skillrush não é endossado pela Riot Games. Histórico, rank e
        disponibilidade dependem do provedor. Não exibimos MMR oculto nem
        Tracker Score.
      </p>
    </main>
  );
}
function MatchTable({ matches }: { matches: PlayerMatch[] }) {
  if (!matches.length)
    return <Notice>Nenhuma partida recuperada para esta seleção.</Notice>;
  return (
    <div className="space-y-3">
      {matches.map((m) => (
        <details
          key={m.id}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
        >
          <summary className="cursor-pointer">
            <span
              className={`mr-3 inline-block rounded-lg px-2 py-1 text-xs ${m.result === "win" ? "bg-emerald-500/10 text-emerald-300" : m.result === "loss" ? "bg-rose-500/10 text-rose-300" : "bg-slate-800"}`}
            >
              {m.result === "win"
                ? "Vitória"
                : m.result === "loss"
                  ? "Derrota"
                  : "Empate"}
            </span>
            <span className="font-semibold">
              {m.map} · {m.teamScore}–{m.opponentScore}
            </span>
            <span className="ml-3 text-sm text-slate-400">
              {m.agent} · {m.kills}/{m.deaths}/{m.assists}
            </span>
            <span className="mt-2 block text-xs text-slate-500">
              {formatDate(m.date)} · {m.season}
            </span>
          </summary>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="ACS"
              value={m.rounds ? fixed(m.score / m.rounds) : null}
            />
            <Metric
              label="Dano/round"
              value={m.rounds ? fixed(m.damage / m.rounds) : null}
            />
            <Metric
              label="Primeiras kills / mortes"
              value={
                m.firstKills === null
                  ? null
                  : `${m.firstKills} / ${m.firstDeaths}`
              }
            />
            <Metric label="Rounds com multikill" value={m.multikills} />
          </div>
        </details>
      ))}
    </div>
  );
}
