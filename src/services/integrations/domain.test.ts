import { describe, expect, it } from "vitest";
import {
  aggregate,
  bracketColumns,
  normalizeBracket,
  normalizeEsportsMatch,
  normalizeMatches,
  normalizeRank,
  parseRiotId,
  positiveId,
  safeStream,
} from "@/lib/integrations/domain";
const match = (id: string, score = 200, rounds = 10) => ({
  metadata: {
    match_id: id,
    is_completed: true,
    started_at: "2026-11-01T00:00:00Z",
    map: { name: "Bind" },
    season: { id: "act", short: "Ato" },
    queue: { id: "competitive" },
    game_length_in_ms: 600000,
  },
  players: [
    {
      puuid: "self",
      team_id: "Red",
      agent: { name: "Sova" },
      stats: {
        kills: 10,
        deaths: 5,
        assists: 3,
        score,
        headshots: 10,
        bodyshots: 20,
        legshots: 10,
        damage: { dealt: 1000, received: 500 },
      },
    },
  ],
  teams: [
    { team_id: "Red", won: true, rounds: { won: rounds } },
    { team_id: "Blue", won: false, rounds: { won: 0 } },
  ],
});
describe("Tracker provider boundary", () => {
  it("preserves accented Riot IDs and rejects malformed / path input", () => {
    expect(parseRiotId(" PãoDeMel#linda ")).toEqual({
      name: "PãoDeMel",
      tag: "linda",
    });
    for (const id of [
      "name",
      "name#tag#extra",
      "#tag",
      "name#",
      "name/x#tag",
      "name\n#tag",
    ])
      expect(() => parseRiotId(id)).toThrow();
  });
  it("does not include other players, incomplete games or duplicate matches", () => {
    const a = match("a");
    a.players.push({ ...a.players[0], puuid: "other" });
    expect(
      normalizeMatches(
        [
          a,
          a,
          {
            ...match("b"),
            metadata: { ...match("b").metadata, is_completed: false },
          },
          match("c"),
        ],
        "self",
      ),
    ).toHaveLength(2);
    expect(normalizeMatches([a], "unknown")).toEqual([]);
    expect(normalizeMatches([a], "self")[0]).not.toHaveProperty("puuid");
  });
  it("weights ACS, damage and headshot percentage by rounds/hits, not by per-match averages", () => {
    const stats = aggregate(
      normalizeMatches([match("a", 100, 10), match("b", 900, 30)], "self"),
    );
    expect(stats.acs).toBe(25);
    expect(stats.adr).toBe(50);
    expect(stats.hs).toBe(25);
    expect(stats.kd).toBe(2);
    expect(stats.winrate).toBe(100);
  });
  it("does not invent values when there are no matches or deaths", () => {
    expect(aggregate([])).toMatchObject({
      count: 0,
      acs: null,
      kd: null,
      hs: null,
      winrate: null,
    });
    const a = match("a");
    a.players[0].stats.deaths = 0;
    expect(aggregate(normalizeMatches([a], "self")).kd).toBeNull();
  });
  it("computes first engagements chronologically, ignores team kills and counts multikill rounds", () => {
    const a: any = match("a");
    a.kills = [
      {
        round: 0,
        time_in_round_in_ms: 200,
        killer: { puuid: "other", team: "Red" },
        victim: { puuid: "self", team: "Red" },
      },
      {
        round: 0,
        time_in_round_in_ms: 500,
        killer: { puuid: "self", team: "Red" },
        victim: { puuid: "enemy", team: "Blue" },
      },
      {
        round: 0,
        time_in_round_in_ms: 100,
        killer: { puuid: "self", team: "Red" },
        victim: { puuid: "enemy2", team: "Blue" },
      },
    ];
    expect(normalizeMatches([a], "self")[0]).toMatchObject({
      firstKills: 1,
      firstDeaths: 0,
      multikills: 1,
    });
    expect(normalizeMatches([match("b")], "self")[0].firstKills).toBeNull();
  });
  it("uses documented v3 rank and v2 history fields without exposing elo as hidden MMR", () => {
    const rank = normalizeRank(
      {
        current: {
          tier: { name: "Gold 1" },
          rr: 0,
          last_change: -15,
          elo: 999,
        },
        peak: { tier: { name: "Platinum 1" }, season: { short: "e9a1" } },
      },
      {
        history: [
          {
            rr: 20,
            last_change: 10,
            date: "2026-01-01",
            tier: { name: "Gold 1" },
          },
        ],
      },
    );
    expect(rank).toMatchObject({
      tier: "Gold 1",
      rr: 0,
      change: -15,
      peak: "Platinum 1",
    });
    expect(rank).not.toHaveProperty("elo");
    expect(rank.history[0].change).toBe(10);
  });
});
describe("esports provider boundary", () => {
  it("only embeds allowlisted HTTPS hosts and valid video/channel identifiers", () => {
    expect(safeStream("https://www.twitch.tv/valorant_br")?.embedId).toBe(
      "valorant_br",
    );
    expect(
      safeStream("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.provider,
    ).toBe("youtube");
    expect(safeStream("https://youtu.be/dQw4w9WgXcQ")?.embedId).toBe(
      "dQw4w9WgXcQ",
    );
    for (const url of [
      "javascript:alert(1)",
      "http://twitch.tv/x",
      "https://twitch.tv.evil.com/x",
      "https://twitch.tv@evil.com/x",
      "https://twitch.tv:444/x",
      "https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ",
    ])
      expect(safeStream(url)).toBeNull();
  });
  it("preserves zero scores and excludes unsafe streams", () => {
    expect(
      normalizeEsportsMatch({
        opponents: [{ opponent: { id: 1, name: "Equipe" } }],
        results: [{ team_id: 1, score: 0 }],
        streams_list: [
          { raw_url: "javascript:alert(1)" },
          { raw_url: "https://twitch.tv/valorant", language: "pt" },
        ],
      }),
    ).toMatchObject({
      opponents: [{ id: 1, name: "Equipe", score: 0 }],
      streams: [{ provider: "twitch", language: "pt" }],
    });
  });
  it("lays out a double elimination DAG including loser progression independent of input order", () => {
    const nodes = normalizeBracket([
      {
        id: 4,
        previous_matches: [
          { match_id: 3, type: "winner" },
          { match_id: 2, type: "winner" },
        ],
      },
      {
        id: 3,
        previous_matches: [
          { match_id: 1, type: "loser" },
          { match_id: 2, type: "loser" },
        ],
      },
      { id: 2 },
      { id: 1 },
    ]);
    expect(bracketColumns(nodes).map((c) => c.map((n) => n.id))).toEqual([
      [2, 1],
      [3],
      [4],
    ]);
    expect(nodes.find((n) => n.id === 3)?.previous[0].type).toBe("loser");
  });
  it("rejects a cyclic bracket instead of recursing forever", () => {
    expect(() =>
      bracketColumns(
        normalizeBracket([
          { id: 1, previous_matches: [{ match_id: 2 }] },
          { id: 2, previous_matches: [{ match_id: 1 }] },
        ]),
      ),
    ).toThrow();
  });
  it("does not allow query/path injection in tournament identifiers", () => {
    expect(positiveId("123")).toBe(123);
    for (const id of [0, -1, "12/matches", "1?foo", "Infinity", 1.1])
      expect(() => positiveId(id)).toThrow();
  });
});
