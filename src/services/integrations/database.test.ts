import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
const uid = "11111111-1111-4111-8111-111111111111";
beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key); insert into auth.users values('${uid}');`);
  await db.exec(
    readFileSync("supabase/migrations/0011_integrations.sql", "utf8"),
  );
}, 30000);
afterAll(() => db.close());
describe("integration database authorization and quotas", () => {
  it("enforces atomic quota reservations and rejects excess cost", async () => {
    const reserve = () =>
      db.query<{ allowed: boolean }>(
        `select public.reserve_integration_quota('test',60,3,1) as allowed`,
      );
    const results = await Promise.all([
      reserve(),
      reserve(),
      reserve(),
      reserve(),
    ]);
    expect(results.map((r) => r.rows[0].allowed)).toEqual([
      true,
      true,
      true,
      false,
    ]);
    expect(
      (
        await db.query<{ allowed: boolean }>(
          `select public.reserve_integration_quota('oversized',60,3,4) as allowed`,
        )
      ).rows[0].allowed,
    ).toBe(false);
  });
  it("prevents browser roles reading provider caches or invoking quota functions", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await expect(
        db.query("select * from public.integration_cache"),
      ).rejects.toThrow();
      await expect(
        db.query("select * from public.tracker_consents"),
      ).rejects.toThrow();
      await expect(
        db.query(`select public.reserve_integration_quota('bypass',60,99,1)`),
      ).rejects.toThrow();
      await db.exec("reset role");
    }
  });
  it("revoking consent deletes private cache and rejects late writes while preserving public esports cache", async () => {
    await db.exec(`insert into public.tracker_consents(user_id,riot_id) values('${uid}','Nome#TAG');
      insert into public.integration_cache(cache_key,owner_id,payload,expires_at) values('private','${uid}','{}',now()+interval '1 hour');
      insert into public.integration_cache(cache_key,payload,expires_at) values('esports','{}',now()+interval '1 hour');
      delete from public.tracker_consents where user_id='${uid}';`);
    expect(
      (await db.query("select cache_key from public.integration_cache")).rows,
    ).toEqual([{ cache_key: "esports" }]);
    await expect(
      db.exec(
        `insert into public.integration_cache(cache_key,owner_id,payload,expires_at) values('late','${uid}','{}',now())`,
      ),
    ).rejects.toThrow();
  });
  it("rollback removes only the integration objects", async () => {
    await db.exec(
      readFileSync("supabase/rollback/0011_integrations.sql", "utf8"),
    );
    expect(
      (await db.query("select count(*)::int as count from auth.users")).rows,
    ).toEqual([{ count: 1 }]);
    await db.exec(
      readFileSync("supabase/migrations/0011_integrations.sql", "utf8"),
    );
  });
});
