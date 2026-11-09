// Run: deno test --no-config --node-modules-dir=manual --allow-env index_test.ts
Deno.env.set("SUPABASE_URL", "http://localhost:54321");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
Deno.env.set("ALLOWED_ORIGINS", "http://localhost:3000");
Deno.env.set("HENRIKDEV_API_KEY", "test-henrik-key");
Deno.env.set("PANDASCORE_API_KEY", "test-panda-key");
function assert(value: unknown, message = "Assertion failed"): asserts value {
  if (!value) throw new Error(message);
}
function equal(a: unknown, b: unknown) {
  assert(
    JSON.stringify(a) === JSON.stringify(b),
    `${JSON.stringify(a)} !== ${JSON.stringify(b)}`,
  );
}
const originalFetch = globalThis.fetch;
const cache = new Map<string, Record<string, unknown>>();
const upstreamCalls: string[] = [];
let quotaAllowed = true,
  databaseError = false,
  providerStatus = 200;
let game = "valorant";
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
function reset() {
  cache.clear();
  upstreamCalls.length = 0;
  quotaAllowed = true;
  databaseError = false;
  providerStatus = 200;
  game = "valorant";
}
globalThis.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url = new URL(String(input));
  const method = init?.method || "GET";
  if (url.hostname === "localhost") {
    if (url.pathname === "/auth/v1/user") {
      const token = new Headers(init?.headers).get("authorization");
      return token === "Bearer user-a"
        ? response({
            id: "11111111-1111-4111-8111-111111111111",
            email: "test@example.test",
          })
        : token === "Bearer user-b"
          ? response({ id: "22222222-2222-4222-8222-222222222222" })
          : response({ message: "Invalid token" }, 401);
    }
    if (databaseError) return response({ message: "offline" }, 500);
    if (url.pathname.endsWith("/rpc/reserve_integration_quota"))
      return response(quotaAllowed);
    if (url.pathname.endsWith("/integration_cache")) {
      if (method === "GET") {
        const key = url.searchParams.get("cache_key")?.slice(3) || "";
        return response(cache.get(key) || null);
      }
      if (method === "POST") {
        const data = JSON.parse(String(init?.body));
        cache.set(data.cache_key, data);
        return new Response(null, { status: 201 });
      }
      if (method === "DELETE") {
        const owner = url.searchParams.get("owner_id")?.slice(3);
        for (const [key, row] of cache)
          if (row.owner_id === owner) cache.delete(key);
        return new Response(null, { status: 204 });
      }
    }
    if (url.pathname.endsWith("/tracker_consents"))
      return new Response(null, { status: method === "DELETE" ? 204 : 201 });
    throw new Error(`Unexpected DB URL ${url.pathname}`);
  }
  upstreamCalls.push(url.pathname);
  if (providerStatus !== 200)
    return response(
      { message: "upstream detail must never leak" },
      providerStatus,
    );
  if (url.hostname === "api.henrikdev.xyz") {
    if (url.pathname.includes("/account/"))
      return response({
        data: {
          puuid: "self",
          name: "PãoDeMel",
          tag: "linda",
          account_level: 100,
        },
      });
    if (url.pathname.includes("/matches/"))
      return response({
        data: [
          {
            metadata: {
              match_id: "a",
              is_completed: true,
              map: { name: "Bind" },
              queue: { id: "competitive" },
            },
            players: [
              {
                puuid: "self",
                team_id: "Red",
                agent: { name: "Sova" },
                stats: { kills: 10, deaths: 5 },
              },
            ],
            teams: [
              { team_id: "Red", won: true, rounds: { won: 13 } },
              { team_id: "Blue", won: false, rounds: { won: 5 } },
            ],
          },
        ],
      });
    if (url.pathname.includes("/mmr-history/"))
      return response({ data: { history: [] } });
    return response({
      data: { current: { tier: { name: "Gold 1" }, rr: 25 }, seasonal: [] },
    });
  }
  if (url.pathname === "/tournaments/42")
    return response({
      id: 42,
      name: "Test",
      has_bracket: true,
      videogame: { slug: game },
    });
  if (url.pathname === "/tournaments/42/matches")
    return response([{ id: 123, name: "A vs B", status: "running" }]);
  if (url.pathname.endsWith("/brackets"))
    return response([
      { id: 123, previous_matches: [{ match_id: 122, type: "winner" }] },
    ]);
  if (url.pathname.endsWith("/standings"))
    return response([{ rank: 1, team: { id: 1, name: "A" } }]);
  if (url.pathname.includes("/valorant/tournaments/"))
    return response([{ id: 42, name: "Test" }]);
  if (url.pathname.includes("/valorant/matches/"))
    return response([
      {
        id: 123,
        name: "A vs B",
        streams_list: [{ raw_url: "https://twitch.tv/valorant_br" }],
      },
    ]);
  throw new Error(`Unexpected provider URL ${url.pathname}`);
};
const { handleRequest } = await import("./index.ts");
function request(body: unknown, token = "", origin = "http://localhost:3000") {
  return new Request("http://localhost/functions/v1/integrations", {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
const tracker = {
  action: "tracker",
  riotId: "PãoDeMel#linda",
  region: "br",
  platform: "pc",
  mode: "competitive",
  consent: true,
};
Deno.test(
  "tracker requires verified application session and explicit consent before contacting providers",
  async () => {
    reset();
    equal((await handleRequest(request(tracker))).status, 401);
    equal(
      (await handleRequest(request({ ...tracker, consent: false }, "user-a")))
        .status,
      400,
    );
    equal(upstreamCalls.length, 0);
  },
);
Deno.test(
  "invalid action, IDs and hostile origins do not contact providers",
  async () => {
    reset();
    equal(
      (
        await handleRequest(
          request({ action: "esports-tournament", id: "1/matches" }),
        )
      ).status,
      400,
    );
    equal((await handleRequest(request({ action: "anything" }))).status, 400);
    equal(
      (
        await handleRequest(
          request({ action: "esports-list" }, "", "https://evil.test"),
        )
      ).status,
      403,
    );
    equal(upstreamCalls.length, 0);
  },
);
Deno.test(
  "tracker returns personal normalized stats and scopes all caches to the session owner",
  async () => {
    reset();
    const a = await handleRequest(request(tracker, "user-a"));
    equal(a.status, 200);
    const payload = await a.json();
    equal(payload.matches[0].agent, "Sova");
    assert(!JSON.stringify(payload).includes("puuid"));
    equal(payload.rank.rr, 25);
    const calls = upstreamCalls.length;
    equal((await handleRequest(request(tracker, "user-a"))).status, 200);
    equal(upstreamCalls.length, calls);
    equal((await handleRequest(request(tracker, "user-b"))).status, 200);
    assert(upstreamCalls.length > calls);
    equal(
      (await handleRequest(request({ action: "tracker-revoke" }, "user-a")))
        .status,
      200,
    );
    assert(
      [...cache.values()].every(
        (row) => row.owner_id !== "11111111-1111-4111-8111-111111111111",
      ),
    );
    assert(
      [...cache.values()].some(
        (row) => row.owner_id === "22222222-2222-4222-8222-222222222222",
      ),
    );
  },
);
Deno.test(
  "esports is public, cached, and includes bracket dependencies",
  async () => {
    reset();
    const a = await handleRequest(
      request({ action: "esports-list", status: "running" }),
    );
    equal(a.status, 200);
    const payload = await a.json();
    equal(payload.matches[0].streams[0].provider, "twitch");
    const calls = upstreamCalls.length;
    await handleRequest(request({ action: "esports-list", status: "running" }));
    equal(upstreamCalls.length, calls);
    const detail = await handleRequest(
      request({ action: "esports-tournament", id: 42 }),
    );
    equal(detail.status, 200);
    equal((await detail.json()).brackets[0].previous, [
      { id: 122, type: "winner" },
    ]);
  },
);
Deno.test(
  "cross-game IDs are rejected before fetching bracket or match data",
  async () => {
    reset();
    game = "cs-go";
    equal(
      (await handleRequest(request({ action: "esports-tournament", id: 42 })))
        .status,
      404,
    );
    equal(upstreamCalls, ["/tournaments/42"]);
  },
);
Deno.test(
  "quotas and DB failures fail closed without upstream requests",
  async () => {
    reset();
    quotaAllowed = false;
    const r = await handleRequest(request({ action: "esports-list" }));
    equal(r.status, 429);
    equal(r.headers.get("retry-after"), "60");
    equal(upstreamCalls.length, 0);
    reset();
    databaseError = true;
    equal(
      (await handleRequest(request({ action: "esports-list" }))).status,
      503,
    );
    equal(upstreamCalls.length, 0);
  },
);
Deno.test(
  "upstream permission and rate-limit errors are sanitized",
  async () => {
    reset();
    providerStatus = 403;
    let r = await handleRequest(request({ action: "esports-list" }));
    equal(r.status, 503);
    assert(!(await r.text()).includes("upstream detail"));
    reset();
    providerStatus = 429;
    r = await handleRequest(request({ action: "esports-list" }));
    equal(r.status, 429);
    equal(r.headers.get("retry-after"), "60");
  },
);
Deno.test(
  "missing credentials report activation state without provider calls",
  async () => {
    reset();
    Deno.env.delete("PANDASCORE_API_KEY");
    const r = await handleRequest(request({ action: "esports-list" }));
    equal(r.status, 503);
    assert((await r.json()).error.includes("ativação"));
    equal(upstreamCalls.length, 0);
    Deno.env.set("PANDASCORE_API_KEY", "test-panda-key");
  },
);
Deno.test("cleanup mocked fetch", () => {
  globalThis.fetch = originalFetch;
});
