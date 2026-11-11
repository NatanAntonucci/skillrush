"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRetryCountdown } from "@/hooks/useRetryCountdown";
import { ArrowLeft, ExternalLink, Radio, Trophy } from "lucide-react";
import {
  integration,
  IntegrationError,
  type EsportsList,
  type TournamentResult,
  type EsportsMatch,
  type BracketNode,
} from "@/services/integrations/client";
import {
  bracketColumns,
  positiveId,
} from "@/lib/integrations/domain";
import {
  buttonClass,
  inputClass,
  Notice,
  Timestamp,
  formatDate,
} from "@/features/integrations/Shared";

const statusLabels: Record<string, string> = {
  running: "Em andamento",
  not_started: "Agendada",
  finished: "Encerrada",
  canceled: "Cancelada",
  postponed: "Adiada",
};
export function Championships() {
  const [status, setStatus] = useState("running");
  const [page, setPage] = useState(1);
  const [id, setId] = useState<number | null | undefined>(undefined);
  const [data, setData] = useState<EsportsList | null>(null);
  const [detail, setDetail] = useState<TournamentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [match, setMatch] = useState<EsportsMatch | null>(null);
  const [tab, setTab] = useState("matches");
  const [retry, setRetry] = useState(0);
  const [wait, startCooldown] = useRetryCountdown();
  const generation = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const navigate = useCallback((next: number | null, replace = false) => {
    activeRequest.current?.abort();
    generation.current++;
    setId(next);
    setMatch(null);
    setDetail(null);
    setTab("matches");
    setError("");
    const path = next ? `/campeonatos/?id=${next}` : "/campeonatos/";
    if (replace) window.history.replaceState(null, "", path);
    else window.history.pushState(null, "", path);
  }, []);
  useEffect(() => {
    function read() {
      const value = new URLSearchParams(window.location.search).get("id");
      if (!value) {
        setId(null);
        return;
      }
      try {
        setId(positiveId(value));
      } catch {
        setError("Campeonato inválido no link.");
        setId(null);
      }
      setMatch(null);
      setDetail(null);
    }
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  useEffect(() => {
    if (id === undefined) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    const current = ++generation.current;
    setLoading(true);
    setError("");
    setMatch(null);
    async function load() {
      try {
        if (id) {
          const result = await integration<TournamentResult>(
            { action: "esports-tournament", id },
            controller.signal,
          );
          if (current === generation.current && !controller.signal.aborted)
            setDetail(result);
        } else {
          const result = await integration<EsportsList>(
            { action: "esports-list", status, page },
            controller.signal,
          );
          if (current === generation.current && !controller.signal.aborted)
            setData(result);
        }
      } catch (e) {
        if (controller.signal.aborted || current !== generation.current) return;
        setError((e as Error).message);
        if (e instanceof IntegrationError && e.retryAfter) {
          startCooldown(e.retryAfter);
        }
      } finally {
        if (!controller.signal.aborted && current === generation.current)
          setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [id, status, page, retry, startCooldown]);
  useEffect(() => {
    if (error || loading) return;
    const timer = setInterval(
      () => {
        if (document.visibilityState === "visible" && !match && wait === 0)
          setRetry((v) => v + 1);
      },
      id || status === "running" ? 120000 : 300000,
    );
    return () => clearInterval(timer);
  }, [error, loading, match, wait, id, status]);
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const tournaments =
    data?.tournaments.filter((t) =>
      normalize(`${t.name} ${t.league} ${t.serie}`).includes(normalize(query)),
    ) || [];
  const matches =
    (id ? detail?.matches : data?.matches)?.filter((m) =>
      normalize(
        `${m.name} ${m.league} ${m.opponents.map((o) => o.name).join(" ")}`,
      ).includes(normalize(query)),
    ) || [];
  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-7 px-4 py-10 sm:px-6">
      <header>
        <p className="flex items-center gap-2 text-sm text-accent-300">
          <Trophy size={18} /> Skillrush Esports
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          O campeonato, de perto
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Acompanhe partidas, descubra o próximo confronto e assista às
          transmissões disponíveis.
        </p>
      </header>
      {error && (
        <Notice error>
          <p>{error}</p>
          <button
            disabled={wait > 0 || loading}
            onClick={() => setRetry((v) => v + 1)}
            className="mt-3 text-accent-300 underline disabled:opacity-50"
          >
            {wait > 0 ? `Tente novamente em ${wait}s` : "Tentar novamente"}
          </button>
        </Notice>
      )}
      <button
        disabled={loading || wait > 0}
        onClick={() => setRetry((v) => v + 1)}
        className="text-sm text-accent-300 underline disabled:opacity-40"
      >
        {loading ? "Atualizando…" : "Atualizar dados"}
      </button>
      {id && (
        <button
          onClick={() => navigate(null)}
          className="flex items-center gap-2 text-sm text-slate-400"
        >
          <ArrowLeft size={16} /> Todos os campeonatos
        </button>
      )}
      {!id && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex gap-2" aria-label="Estado dos campeonatos">
            {[
              ["running", "Em andamento"],
              ["upcoming", "Próximos"],
              ["past", "Encerrados"],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={status === value}
                onClick={() => {
                  setData(null);
                  setPage(1);
                  setStatus(value);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm transition duration-200 ease-out active:scale-[0.97] ${
                  status === value
                    ? "bg-accent-500/15 text-accent-200 ring-1 ring-accent-500/40"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {loading && status === value && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-400/40 border-t-accent-400" />
                )}
                {label}
              </button>
            ))}
          </nav>
          <label className="sr-only" htmlFor="event-search">
            Filtrar os resultados desta página
          </label>
          <input
            id="event-search"
            className={`${inputClass} max-w-sm`}
            placeholder="Filtrar evento ou equipe nesta página"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      {loading && (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-900">
            <div className="pixel-bar h-full w-1/2 animate-pulse" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      )}
      {!loading && !error && !id && data && (
        <>
          <Timestamp value={data.fetchedAt} />
          <section>
            <h2 className="mb-4 text-xl font-semibold">Campeonatos</h2>
            {!tournaments.length && (
              <Notice>Nenhum campeonato encontrado nesta seleção.</Notice>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/campeonatos/?id=${t.id}`}
                  onClick={(e) => {
                    if (
                      e.button === 0 &&
                      !e.metaKey &&
                      !e.ctrlKey &&
                      !e.shiftKey &&
                      !e.altKey
                    ) {
                      e.preventDefault();
                      navigate(t.id);
                    }
                  }}
                  className="group rounded-3xl border border-slate-800 bg-slate-900/50 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-accent-500/60"
                >
                  <p className="text-xs uppercase tracking-wider text-accent-300">
                    {t.league || "Valorant"}
                    {t.tier ? ` · Tier ${t.tier.toUpperCase()}` : ""}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold group-hover:text-accent-200">
                    {t.name || t.serie}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{t.serie}</p>
                  <p className="mt-5 text-xs text-slate-500">
                    {formatDate(t.start)}
                  </p>
                  <p className="mt-4 text-sm text-accent-300">
                    Ver partidas e chaveamento →
                  </p>
                </Link>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Partidas{" "}
              {status === "running"
                ? "em andamento"
                : status === "upcoming"
                  ? "agendadas"
                  : "recentes"}
            </h2>
            <MatchList matches={matches} onSelect={setMatch} />
          </section>
          <div className="flex items-center justify-between gap-3">
            <button
              className="rounded-xl border border-slate-700 px-4 py-2 disabled:opacity-30"
              disabled={page === 1}
              onClick={() => {
                setData(null);
                setPage((p) => p - 1);
              }}
            >
              Anterior
            </button>
            <span className="text-sm text-slate-400">Página {page}</span>
            <button
              className="rounded-xl border border-slate-700 px-4 py-2 disabled:opacity-30"
              disabled={
                page >= 20 || (!data.moreMatches && !data.moreTournaments)
              }
              onClick={() => {
                setData(null);
                setPage((p) => p + 1);
              }}
            >
              Próxima
            </button>
          </div>
        </>
      )}
      {!loading && !error && id && detail && (
        <>
          <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
            <p className="text-sm text-accent-300">
              {detail.tournament.league} · {detail.tournament.serie}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {detail.tournament.name}
            </h2>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
              <span>Início: {formatDate(detail.tournament.start)}</span>
              {detail.tournament.prize && (
                <span>Premiação: {detail.tournament.prize}</span>
              )}
            </div>
            <div className="mt-4">
              <Timestamp value={detail.fetchedAt} />
            </div>
          </section>
          {detail.warnings.map((w) => (
            <Notice key={w}>{w}</Notice>
          ))}
          {detail.partial && (
            <Notice>
              Lista de partidas parcial. A fonte atingiu o limite de paginação
              desta consulta.
            </Notice>
          )}
          <nav
            className="flex flex-wrap gap-2 border-b border-slate-800 pb-4"
            aria-label="Campeonato"
          >
            {[
              ["matches", "Partidas"],
              ["bracket", "Chaveamento"],
              ["standings", "Classificação"],
              ["teams", "Equipes"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                aria-pressed={tab === value}
                className={`rounded-xl px-4 py-2 text-sm ${tab === value ? "bg-accent-500/15 text-accent-200" : "text-slate-400"}`}
              >
                {label}
              </button>
            ))}
          </nav>
          {tab === "matches" && (
            <MatchList matches={matches} onSelect={setMatch} />
          )}
          {tab === "bracket" &&
            (detail.brackets.length ? (
              <Bracket
                nodes={detail.brackets}
                matches={detail.matches}
                onSelect={setMatch}
              />
            ) : (
              <Notice>
                {detail.tournament.hasBracket
                  ? "O chaveamento ainda não está disponível na fonte."
                  : "Esta fase não possui chave eliminatória informada. Consulte as partidas e a classificação."}
              </Notice>
            ))}
          {tab === "standings" &&
            (detail.standings.length ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      {[
                        "Posição",
                        "Equipe",
                        "Vitórias",
                        "Derrotas",
                        "Empates",
                      ].map((s) => (
                        <th key={s} className="p-4">
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.standings.map((s, i) => (
                      <tr
                        key={`${s.team.id}-${i}`}
                        className="border-t border-slate-800"
                      >
                        <td className="p-4">{s.rank ?? "—"}</td>
                        <td className="p-4 font-medium">{s.team.name}</td>
                        <td className="p-4">{s.wins ?? "—"}</td>
                        <td className="p-4">{s.losses ?? "—"}</td>
                        <td className="p-4">{s.ties ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Notice>
                Classificação não disponibilizada pela fonte para esta fase.
              </Notice>
            ))}
          {tab === "teams" && <Teams detail={detail} />}
        </>
      )}
      {match && <MatchViewer match={match} onClose={() => setMatch(null)} />}
      <footer className="space-y-2 border-t border-slate-800 pt-6 text-xs text-slate-500">
        <p>
          Dados: PandaScore. Cobertura e transmissões variam por evento. Os
          horários seguem o fuso do seu dispositivo.
        </p>
        <p>
          O status “em andamento” não representa um placar round a round. Não há
          feed de estatísticas ao vivo nesta versão.
        </p>
      </footer>
    </main>
  );
}
function MatchList({
  matches,
  onSelect,
}: {
  matches: EsportsMatch[];
  onSelect: (m: EsportsMatch) => void;
}) {
  if (!matches.length)
    return <Notice>Nenhuma partida disponível nesta seleção.</Notice>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {matches.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left transition hover:border-accent-500/60"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span
              className={
                m.status === "running" ? "text-emerald-300" : "text-slate-400"
              }
            >
              {m.status === "running" && "● "}
              {statusLabels[m.status] || m.status}
            </span>
            <span className="text-slate-500">
              {m.bestOf ? `MD${m.bestOf}` : ""}
            </span>
          </div>
          <div className="my-4 space-y-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`flex justify-between gap-3 ${m.winnerId && m.opponents[i]?.id === m.winnerId ? "font-semibold text-accent-200" : ""}`}
              >
                <span>{m.opponents[i]?.name || "A definir"}</span>
                <span>{m.opponents[i]?.score ?? "—"}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {m.league} {m.tournament} · {formatDate(m.date)}
          </p>
          {m.streams.length > 0 && (
            <p className="mt-3 flex items-center gap-2 text-xs text-accent-300">
              <Radio size={13} /> Transmissões disponíveis
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
function Teams({ detail }: { detail: TournamentResult }) {
  const teams = [
    ...new Map(
      [...detail.teams, ...detail.matches.flatMap((m) => m.opponents)]
        .filter((t) => t.id)
        .map((t) => [t.id, t]),
    ).values(),
  ];
  return teams.length ? (
    <div className="grid gap-3 sm:grid-cols-3">
      {teams.map((t) => (
        <article
          key={t.id}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <p className="text-xs text-accent-300">{t.acronym}</p>
          <h3 className="mt-2 font-semibold">{t.name}</h3>
        </article>
      ))}
    </div>
  ) : (
    <Notice>Equipes ainda não informadas.</Notice>
  );
}
function Bracket({
  nodes,
  matches,
  onSelect,
}: {
  nodes: BracketNode[];
  matches: EsportsMatch[];
  onSelect: (m: EsportsMatch) => void;
}) {
  const layout = useMemo(() => {
    try {
      return { columns: bracketColumns(nodes), error: "" };
    } catch {
      return {
        columns: [],
        error:
          "A fonte retornou um chaveamento inconsistente. Consulte a lista de partidas.",
      };
    }
  }, [nodes]);
  if (layout.error) return <Notice error>{layout.error}</Notice>;
  const columns = layout.columns;
  const positions = new Map<number, { x: number; y: number }>();
  columns.forEach((column, c) =>
    column.forEach((node, r) =>
      positions.set(node.id, { x: c * 310, y: r * 200 + 40 }),
    ),
  );
  const width = Math.max(300, columns.length * 310 - 20),
    height = Math.max(...columns.map((c) => c.length)) * 200 + 40;
  const selected = (node: BracketNode) =>
    matches.find((m) => m.id === node.id) || node.match;
  return (
    <section className="space-y-3">
      <p className="text-sm text-slate-400">
        Avanços de vencedores em linha contínua; de perdedores em linha
        tracejada. Role na horizontal para acompanhar os confrontos.
      </p>
      <div
        tabIndex={0}
        role="region"
        aria-label="Chaveamento do campeonato, com rolagem horizontal"
        className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4"
      >
        <div className="relative" style={{ width, height }}>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            width={width}
            height={height}
          >
            {nodes.flatMap((node) =>
              node.previous.map((p, i) => {
                const a = positions.get(p.id),
                  b = positions.get(node.id);
                if (!a || !b) return null;
                const x = a.x + 270,
                  y = a.y + 75;
                return (
                  <path
                    key={`${node.id}-${p.id}-${i}`}
                    d={`M ${x} ${y} H ${b.x - 20} V ${b.y + 75} H ${b.x}`}
                    fill="none"
                    stroke={p.type === "loser" ? "#f59e0b" : "#475569"}
                    strokeWidth="1.5"
                    strokeDasharray={p.type === "loser" ? "5 4" : undefined}
                  />
                );
              }),
            )}
          </svg>
          {columns.map((column, c) => (
            <div key={c}>
              <p
                className="absolute text-xs uppercase tracking-wider text-slate-500"
                style={{ left: c * 310, top: 0 }}
              >
                Etapa {c + 1}
              </p>
              {column.map((node) => {
                const m = selected(node),
                  pos = positions.get(node.id)!;
                return (
                  <button
                    key={node.id}
                    style={{ left: pos.x, top: pos.y, width: 270, height: 170 }}
                    onClick={() => onSelect(m)}
                    className="absolute overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-3 text-left hover:border-accent-400"
                  >
                    <p className="truncate text-[11px] text-slate-400">
                      #{node.id} · {statusLabels[m.status] || m.status}
                    </p>
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className={`mt-2 flex justify-between gap-2 text-sm ${m.winnerId && m.opponents[i]?.id === m.winnerId ? "text-accent-200" : "text-slate-200"}`}
                      >
                        <span className="truncate">
                          {m.opponents[i]?.name || "A definir"}
                        </span>
                        <span>{m.opponents[i]?.score ?? "—"}</span>
                      </div>
                    ))}
                    <div className="mt-2 text-[10px] text-slate-500">
                      {node.previous.map((p, i) => (
                        <p key={i}>
                          {p.type === "loser" ? "Perdedor" : "Vencedor"} de #
                          {p.id}
                        </p>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function MatchViewer({
  match,
  onClose,
}: {
  match: EsportsMatch;
  onClose: () => void;
}) {
  const [stream, setStream] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const elements = container.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a[href],iframe,select",
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  const selected = match.streams[stream];
  const embed =
    selected?.provider === "twitch"
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(selected.embedId)}&parent=${typeof window !== "undefined" ? encodeURIComponent(window.location.hostname) : "localhost"}&autoplay=false`
      : selected
        ? `https://www.youtube.com/embed/${selected.embedId}?autoplay=0`
        : "";
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/90 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={container}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        className="max-h-[95vh] w-full max-w-4xl space-y-5 overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-accent-300">
              {statusLabels[match.status] || match.status} ·{" "}
              {formatDate(match.date)}
            </p>
            <h2 id="match-title" className="mt-2 text-xl font-semibold">
              {match.opponents.map((o) => o.name).join(" × ") || match.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {match.league} · {match.tournament}
              {match.bestOf ? ` · MD${match.bestOf}` : ""}
            </p>
          </div>
          <button
            ref={closeButton}
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm"
          >
            Fechar
          </button>
        </div>
        <div className="flex justify-center gap-6 text-3xl font-semibold">
          {match.opponents.map((o) => (
            <span key={o.id}>{o.score ?? "—"}</span>
          ))}
        </div>
        {match.streams.length ? (
          <>
            <label className="block space-y-2 text-sm">
              <span>Escolher transmissão</span>
              <select
                className={inputClass}
                value={stream}
                onChange={(e) => setStream(Number(e.target.value))}
              >
                {match.streams.map((s, i) => (
                  <option key={`${s.url}-${i}`} value={i}>
                    {s.language.toUpperCase()} · {s.provider}
                    {s.official ? " · Oficial" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div
              className={
                selected.provider === "twitch"
                  ? "overflow-x-auto rounded-2xl border border-slate-800 bg-black"
                  : "aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-black"
              }
            >
              <iframe
                key={embed}
                src={embed}
                title={`Transmissão de ${match.name}`}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                className={
                  selected.provider === "twitch"
                    ? "aspect-video min-h-[300px] min-w-[400px] w-full"
                    : "h-full w-full"
                }
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <a
              href={selected.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent-300"
            >
              Abrir no canal <ExternalLink size={14} />
            </a>
            <p className="text-xs text-slate-500">
              Se o player estiver indisponível, abra o canal. A transmissão pode
              ainda não ter começado ou ter sido encerrada.
            </p>
          </>
        ) : (
          <Notice>
            Transmissão não informada pela fonte para esta partida.
          </Notice>
        )}
      </div>
    </div>
  );
}
