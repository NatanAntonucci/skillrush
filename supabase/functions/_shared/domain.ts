/** Provider boundaries: unknown JSON is normalized before it reaches the browser. */
export type JsonObject = Record<string, any>;
export const object = (value: unknown): JsonObject =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
export const list = (value: unknown): JsonObject[] =>
  Array.isArray(value) ? value.map(object) : [];
export const text = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;
export const number = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;
export const nullableNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
export function parseRiotId(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length > 100 ||
    /[\x00-\x1f/\\?]/.test(value)
  )
    throw new Error("Informe o Riot ID no formato Nome#TAG.");
  const parts = value.trim().split("#");
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim())
    throw new Error("Informe o Riot ID no formato Nome#TAG.");
  return { name: parts[0].trim(), tag: parts[1].trim() };
}
export function positiveId(value: unknown): number {
  if (!/^\d{1,12}$/.test(String(value)) || Number(value) < 1)
    throw new Error("Identificador inválido.");
  return Number(value);
}
export function safeStream(
  raw: unknown,
): { url: string; provider: "twitch" | "youtube"; embedId: string } | null {
  try {
    const url = new URL(text(raw));
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.split("/").filter(Boolean);
    if (
      host === "twitch.tv" &&
      path.length === 1 &&
      /^[a-zA-Z0-9_]{1,25}$/.test(path[0])
    )
      return { url: url.href, provider: "twitch", embedId: path[0] };
    const id =
      host === "youtu.be"
        ? path[0]
        : host === "youtube.com"
          ? url.searchParams.get("v") ||
            (["embed", "live"].includes(path[0]) ? path[1] : "")
          : "";
    if (id && /^[\w-]{11}$/.test(id))
      return { url: url.href, provider: "youtube", embedId: id };
  } catch {
    /* Invalid / untrusted URL: no iframe. */
  }
  return null;
}
export interface PlayerMatch {
  id: string;
  date: string;
  season: string;
  seasonId: string;
  map: string;
  agent: string;
  agentId: string;
  queue: string;
  result: "win" | "loss" | "draw";
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  damage: number;
  received: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
  teamScore: number;
  opponentScore: number;
  minutes: number;
  firstKills: number | null;
  firstDeaths: number | null;
  multikills: number | null;
}
export function normalizeMatches(raw: unknown, puuid: string): PlayerMatch[] {
  const unique = new Map<string, PlayerMatch>();
  for (const match of list(raw)) {
    const meta = object(match.metadata);
    if (meta.is_completed !== true || !text(meta.match_id)) continue;
    const player = list(match.players).find((p) => p.puuid === puuid);
    if (!player || !player.stats) continue;
    const stats = object(player.stats),
      damage = object(stats.damage);
    const own = list(match.teams).find((t) => t.team_id === player.team_id);
    const enemy = list(match.teams).find((t) => t.team_id !== player.team_id);
    if (!own || !enemy) continue;
    const won = number(object(own.rounds).won),
      lost = number(object(enemy.rounds).won);
    const hasKills = Array.isArray(match.kills);
    const first = new Map<number, JsonObject>();
    const killsPerRound = new Map<number, number>();
    for (const kill of list(match.kills)) {
      if (object(kill.killer).team === object(kill.victim).team) continue;
      const round = number(kill.round);
      if (
        !first.has(round) ||
        number(kill.time_in_round_in_ms) <
          number(first.get(round)!.time_in_round_in_ms)
      )
        first.set(round, kill);
      if (object(kill.killer).puuid === puuid)
        killsPerRound.set(round, (killsPerRound.get(round) || 0) + 1);
    }
    unique.set(meta.match_id, {
      id: meta.match_id,
      date: text(meta.started_at),
      season: text(object(meta.season).short, "Ato não informado"),
      seasonId: text(object(meta.season).id),
      map: text(object(meta.map).name, "Mapa não informado"),
      agent: text(object(player.agent).name, "Agente não informado"),
      agentId: text(object(player.agent).id),
      queue: text(object(meta.queue).id),
      result: won === lost ? "draw" : own.won === true ? "win" : "loss",
      rounds: won + lost,
      kills: number(stats.kills),
      deaths: number(stats.deaths),
      assists: number(stats.assists),
      score: number(stats.score),
      damage: number(damage.dealt),
      received: number(damage.received),
      headshots: number(stats.headshots),
      bodyshots: number(stats.bodyshots),
      legshots: number(stats.legshots),
      teamScore: won,
      opponentScore: lost,
      minutes: number(meta.game_length_in_ms) / 60000,
      firstKills: hasKills
        ? [...first.values()].filter((k) => object(k.killer).puuid === puuid)
            .length
        : null,
      firstDeaths: hasKills
        ? [...first.values()].filter((k) => object(k.victim).puuid === puuid)
            .length
        : null,
      multikills: hasKills
        ? [...killsPerRound.values()].filter((n) => n >= 2).length
        : null,
    });
  }
  return [...unique.values()].sort((a, b) => b.date.localeCompare(a.date));
}
export function aggregate(matches: PlayerMatch[]) {
  const sum = (
    key:
      | "kills"
      | "deaths"
      | "assists"
      | "rounds"
      | "score"
      | "damage"
      | "received"
      | "headshots"
      | "bodyshots"
      | "legshots"
      | "minutes",
  ) => matches.reduce((n, m) => n + m[key], 0);
  const kills = sum("kills"),
    deaths = sum("deaths"),
    rounds = sum("rounds");
  const hits = sum("headshots") + sum("bodyshots") + sum("legshots");
  const wins = matches.filter((m) => m.result === "win").length;
  return {
    count: matches.length,
    wins,
    losses: matches.filter((m) => m.result === "loss").length,
    kills,
    deaths,
    assists: sum("assists"),
    kd: deaths ? kills / deaths : null,
    winrate: matches.length ? (wins / matches.length) * 100 : null,
    acs: rounds ? sum("score") / rounds : null,
    adr: rounds ? sum("damage") / rounds : null,
    delta: rounds ? (sum("damage") - sum("received")) / rounds : null,
    hs: hits ? (sum("headshots") / hits) * 100 : null,
    hours: sum("minutes") / 60,
  };
}
export function groupStats(matches: PlayerMatch[], key: "agent" | "map") {
  const groups = new Map<string, PlayerMatch[]>();
  for (const match of matches)
    groups.set(match[key], [...(groups.get(match[key]) || []), match]);
  return [...groups]
    .map(([name, rows]) => ({ name, ...aggregate(rows) }))
    .sort((a, b) => b.count - a.count);
}
export function normalizeRank(raw: unknown, history: unknown) {
  const rank = object(raw),
    current = object(rank.current),
    peak = object(rank.peak);
  return {
    tier: text(object(current.tier).name, "Não informado"),
    rr: nullableNumber(current.rr),
    change: nullableNumber(current.last_change),
    peak: text(object(peak.tier).name, "Não informado"),
    peakSeason: text(object(peak.season).short),
    seasons: list(rank.seasonal).map((s) => ({
      id: text(object(s.season).id),
      name: text(object(s.season).short),
      tier: text(object(s.end_tier).name),
      wins: number(s.wins),
      games: number(s.games),
    })),
    history: list(object(history).history).map((h) => ({
      date: text(h.date),
      rr: nullableNumber(h.rr),
      change: nullableNumber(h.last_change),
      tier: text(object(h.tier).name),
      map: text(object(h.map).name),
    })),
  };
}
export interface Team {
  id: number;
  name: string;
  acronym: string;
}
export function normalizeTeam(raw: unknown): Team {
  const t = object(raw);
  return {
    id: number(t.id),
    name: text(t.name, "A definir"),
    acronym: text(t.acronym),
  };
}
export function normalizeEsportsMatch(raw: unknown) {
  const m = object(raw);
  return {
    id: number(m.id),
    name: text(m.name, "Partida"),
    date: text(m.scheduled_at || m.begin_at),
    status: text(m.status),
    bestOf: number(m.number_of_games),
    tournamentId: number(object(m.tournament).id),
    tournament: text(object(m.tournament).name),
    league: text(object(m.league).name),
    opponents: list(m.opponents).map((o) => ({
      ...normalizeTeam(o.opponent),
      score: nullableNumber(
        list(m.results).find((r) => r.team_id === object(o.opponent).id)?.score,
      ),
    })),
    winnerId: number(m.winner_id),
    streams: list(m.streams_list).flatMap((s) => {
      const safe = safeStream(s.raw_url);
      return safe
        ? [
            {
              ...safe,
              language: text(s.language, "Transmissão"),
              official: s.official === true,
            },
          ]
        : [];
    }),
  };
}
export type EsportsMatch = ReturnType<typeof normalizeEsportsMatch>;
export function normalizeTournament(raw: unknown) {
  const t = object(raw);
  return {
    id: number(t.id),
    name: text(t.name),
    league: text(object(t.league).name),
    serie: text(object(t.serie).full_name || object(t.serie).name),
    start: text(t.begin_at),
    end: text(t.end_at),
    prize: text(t.prizepool),
    tier: text(t.tier),
    hasBracket: t.has_bracket === true,
  };
}
export type Tournament = ReturnType<typeof normalizeTournament>;
export interface BracketNode {
  id: number;
  previous: { id: number; type: "winner" | "loser" }[];
  match: EsportsMatch;
}
export function normalizeBracket(raw: unknown): BracketNode[] {
  return list(raw).map((m) => ({
    id: number(m.id),
    match: normalizeEsportsMatch(m),
    previous: list(m.previous_matches).map((p) => ({
      id: number(p.match_id),
      type: p.type === "loser" ? ("loser" as const) : ("winner" as const),
    })),
  }));
}
/** DAG depth preserves both winner and loser paths; no guessed advancement. */
export function bracketColumns(nodes: BracketNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depths = new Map<number, number>();
  function depth(id: number, visiting = new Set<number>()): number {
    if (depths.has(id)) return depths.get(id)!;
    if (visiting.has(id))
      throw new Error("Chaveamento inconsistente na fonte.");
    visiting.add(id);
    const previous = byId.get(id)?.previous.filter((p) => byId.has(p.id)) || [];
    const d = previous.length
      ? Math.max(...previous.map((p) => depth(p.id, new Set(visiting)))) + 1
      : 0;
    depths.set(id, d);
    return d;
  }
  const columns: BracketNode[][] = [];
  for (const node of nodes) {
    const d = depth(node.id);
    (columns[d] ||= []).push(node);
  }
  return columns;
}
