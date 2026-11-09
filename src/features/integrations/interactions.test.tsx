/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tracker } from "@/features/tracker/Tracker";
import { Championships } from "@/features/esports/Championships";
const mocked = vi.hoisted(() => ({
  session: null as any,
  listener: null as any,
  call: vi.fn(),
  otp: vi.fn(),
  out: vi.fn(),
}));
vi.mock("@/services/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: mocked.session } }),
      onAuthStateChange: (fn: any) => {
        mocked.listener = fn;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      signInWithOtp: mocked.otp,
      signOut: mocked.out,
    },
  },
}));
vi.mock("@/services/integrations/client", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/services/integrations/client")>();
  return { ...original, integration: (...args: any[]) => mocked.call(...args) };
});
const date = "2026-11-07T01:00:00Z";
const pm = {
  id: "a",
  date,
  season: "Ato de teste",
  seasonId: "act",
  map: "Bind",
  agent: "Sova",
  agentId: "sova",
  queue: "competitive",
  result: "win",
  rounds: 20,
  kills: 20,
  deaths: 10,
  assists: 5,
  score: 4000,
  damage: 3000,
  received: 2000,
  headshots: 20,
  bodyshots: 30,
  legshots: 10,
  teamScore: 13,
  opponentScore: 7,
  minutes: 30,
  firstKills: 2,
  firstDeaths: 1,
  multikills: 3,
};
const tracker = {
  account: {
    name: "PãoDeMel",
    tag: "linda",
    level: 100,
    region: "br",
    platform: "pc",
  },
  rank: {
    tier: "Gold 1",
    rr: 25,
    change: 15,
    peak: "Platinum 1",
    peakSeason: "e9a1",
    history: [],
    seasons: [],
  },
  matches: [pm],
  hasMore: true,
  fetchedAt: date,
  warnings: [],
  scope: "Amostra de partidas.",
};
const match = {
  id: 11,
  name: "Equipe A vs Equipe B",
  date,
  status: "running",
  bestOf: 3,
  tournamentId: 42,
  tournament: "Playoffs",
  league: "Evento de teste",
  opponents: [
    { id: 1, name: "Equipe A", acronym: "A", score: 1 },
    { id: 2, name: "Equipe B", acronym: "B", score: 0 },
  ],
  winnerId: 0,
  streams: [
    {
      url: "https://www.twitch.tv/valorant_br",
      provider: "twitch",
      embedId: "valorant_br",
      language: "pt",
      official: true,
    },
  ],
};
const tournament = {
  id: 42,
  name: "Playoffs de teste",
  league: "Evento de teste",
  serie: "Série",
  start: date,
  end: "",
  prize: "",
  tier: "a",
  hasBracket: true,
};
const esports = {
  tournaments: [tournament],
  matches: [match],
  moreTournaments: false,
  moreMatches: false,
  fetchedAt: date,
};
const detail = {
  tournament,
  matches: [match],
  brackets: [
    { id: 11, previous: [], match },
    {
      id: 12,
      previous: [{ id: 11, type: "loser" }],
      match: { ...match, id: 12 },
    },
  ],
  teams: [],
  standings: [
    { rank: 1, team: { id: 1, name: "Equipe A" }, wins: 2, losses: 0, ties: 0 },
  ],
  warnings: [],
  partial: false,
  fetchedAt: date,
};
beforeEach(() => {
  mocked.session = null;
  mocked.listener = null;
  mocked.call.mockReset();
  mocked.otp.mockReset().mockResolvedValue({ error: null });
  mocked.out.mockReset();
  window.history.replaceState(null, "", "/");
  mocked.call.mockImplementation(async (body: any) =>
    body.action === "tracker"
      ? {
          ...tracker,
          matches: [{ ...pm, id: body.start ? "b" : "a" }],
          hasMore: !body.start,
        }
      : body.action === "tracker-revoke"
        ? { revoked: true }
        : body.action === "esports-tournament"
          ? detail
          : esports,
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
async function signedInTracker() {
  mocked.session = { user: { id: "user-a" } };
  render(<Tracker />);
  await screen.findByLabelText("Seu Riot ID");
  fireEvent.change(screen.getByLabelText("Seu Riot ID"), {
    target: { value: "PãoDeMel#linda" },
  });
}
async function consult() {
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(
    screen.getByRole("button", { name: "Consultar estatísticas" }),
  );
  await screen.findByRole("heading", { name: /PãoDeMel.*linda/ });
}
describe("Tracker interaction contract", () => {
  it("requires app login, sends an email link and never requests Riot credentials", async () => {
    render(<Tracker />);
    await screen.findByRole("heading", {
      name: "Entre para consultar suas estatísticas",
    });
    expect(screen.queryByLabelText("Seu Riot ID")).toBeNull();
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "test@example.test" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Receber link de acesso" }),
    );
    await screen.findByText(/Enviamos um link/);
    expect(mocked.otp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.test" }),
    );
    expect(mocked.call).not.toHaveBeenCalled();
  });
  it("requires consent, renders derived stats, switches tabs and deduplicates paginated matches", async () => {
    await signedInTracker();
    expect(
      (
        screen.getByRole("button", {
          name: "Consultar estatísticas",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await consult();
    expect(mocked.call.mock.calls[0][0]).toMatchObject({
      action: "tracker",
      consent: true,
      start: 0,
      riotId: "PãoDeMel#linda",
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Agentes" }),
    );
    expect(
      (await screen.findByRole("link", { name: "Sova ↗" })).getAttribute(
        "href",
      ),
    ).toBe("/agents/sova");
    fireEvent.click(
      screen.getByRole("button", { name: "Buscar mais 10 partidas" }),
    );
    await screen.findByText(/2 partidas na seleção/);
    fireEvent.click(
      screen.getByRole("button", { name: "Partidas" }),
    );
    expect(screen.getAllByText("Bind · 13–7")).toHaveLength(2);
  });
  it("clears stale data when selection changes and deletes results after revocation", async () => {
    await signedInTracker();
    await consult();
    fireEvent.change(screen.getByLabelText("Seu Riot ID"), {
      target: { value: "Outro#TAG" },
    });
    expect(
      screen.queryByRole("heading", { name: /PãoDeMel.*linda/ }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Consultar estatísticas" }),
    );
    await screen.findByRole("heading", { name: /PãoDeMel.*linda/ });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Revogar autorização e apagar consultas",
      }),
    );
    await screen.findByText(
      "Autorização revogada e consultas armazenadas apagadas.",
    );
    expect(
      screen.queryByRole("heading", { name: /PãoDeMel.*linda/ }),
    ).toBeNull();
  });
  it("discards an in-flight private response after signout", async () => {
    await signedInTracker();
    let resolve: any;
    mocked.call.mockImplementation(() => new Promise((r) => (resolve = r)));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: "Consultar estatísticas" }),
    );
    await act(async () => {
      mocked.listener("SIGNED_OUT", null);
      resolve(tracker);
    });
    await screen.findByRole("heading", {
      name: "Entre para consultar suas estatísticas",
    });
    expect(
      screen.queryByRole("heading", { name: /PãoDeMel.*linda/ }),
    ).toBeNull();
  });
});
describe("Championship interaction contract", () => {
  it("opens shared event links, draws loser progression and shows standings", async () => {
    window.history.replaceState(null, "", "/campeonatos/?id=42");
    const { container } = render(<Championships />);
    await screen.findByRole("heading", { name: "Playoffs de teste" });
    expect(mocked.call.mock.calls.map(([body]) => body.action)).toEqual(["esports-tournament"]);
    fireEvent.click(
      screen.getByRole("button", { name: "Chaveamento" }),
    );
    await screen.findByText("Perdedor de #11");
    expect(container.querySelectorAll("path[stroke-dasharray]")).toHaveLength(
      1,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Classificação" }),
    );
    await screen.findByRole("cell", { name: "Equipe A" });
  });
  it("opens an allowlisted stream player, focuses the dialog and closes with Escape", async () => {
    render(<Championships />);
    await screen.findByRole("heading", { name: "Playoffs de teste" });
    fireEvent.click(screen.getByRole("button", { name: /Equipe A/ }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector("iframe")?.getAttribute("src")).toContain(
      "parent=localhost",
    );
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "Fechar" }),
    );
    fireEvent.keyDown(document, { key: "Escape", bubbles: true });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
  it("shows provider failures, retries and displays empty results without fake matches", async () => {
    mocked.call.mockRejectedValueOnce(new Error("Provedor indisponível"));
    render(<Championships />);
    await screen.findByRole("alert");
    mocked.call.mockResolvedValue({
      tournaments: [],
      matches: [],
      moreTournaments: false,
      moreMatches: false,
      fetchedAt: date,
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );
    await screen.findByText("Nenhum campeonato encontrado nesta seleção.");
    expect(screen.queryByText("Equipe A")).toBeNull();
  });
});
