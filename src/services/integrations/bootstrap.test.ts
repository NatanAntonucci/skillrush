import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const user='11111111-1111-4111-8111-111111111111';
const admin='22222222-2222-4222-8222-222222222222';
const agent='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const map='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ability=`${agent}-Ability1`;
const installer=readFileSync('supabase/INSTALAR_SKILLRUSH_BANCO_NOVO.sql','utf8');
const insert=(status:string,title:string)=>`insert into public.lineups(title,description,video_url,agent_id,map_id,ability_id,ability_name,hotspot_x,hotspot_y,hotspot_label,author_id,status) values ('${title}','Descricao valida para teste','https://youtu.be/dQw4w9WgXcQ','${agent}','${map}','${ability}','Flecha',50,50,'A','${user}','${status}') returning id,slug,status`;
beforeAll(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated,service_role;
 grant execute on function auth.uid() to anon,authenticated,service_role;
 insert into auth.users values('${user}','user@example.test'),('${admin}','admin@example.test');`);
 await db.exec(installer);
 await db.exec(`set role service_role;
 insert into public.agents(id,display_name) values('${agent}','Sova');
 insert into public.maps(id,display_name,is_competitive,tactical_description) values('${map}','Bind',true,'A/B Sites');
 insert into public.abilities(id,agent_id,slot,display_name) values('${ability}','${agent}','Ability1','Flecha');
 reset role;update public.profiles set role='admin' where id='${admin}';`);
},30000);
afterAll(()=>db.close());
describe('fresh Supabase project installation',()=>{
 it('creates all required tables and unambiguous text ability relationships',async()=>{
  const tables=await db.query<{name:string}>(`select tablename as name from pg_tables where schemaname='public' order by tablename`);
  expect(tables.rows.map(r=>r.name)).toEqual(['abilities','agents','integration_cache','integration_limits','lineups','maps','profiles','tracker_consents']);
  const fks=await db.query(`select count(*)::int as count from pg_constraint where conrelid='public.lineups'::regclass and contype='f'`);
  expect(fks.rows).toEqual([{count:3}]);
  const type=await db.query(`select data_type from information_schema.columns where table_schema='public' and table_name='abilities' and column_name='id'`);
  expect(type.rows).toEqual([{data_type:'text'}]);
 });
 it('allows public catalogue reads without relying on Supabase default grants',async()=>{
  await db.exec('set role anon');
  expect((await db.query('select display_name from public.agents')).rows).toEqual([{display_name:'Sova'}]);
  expect((await db.query('select * from public.lineups')).rows).toEqual([]);
  await expect(db.exec(`insert into public.agents(id,display_name) values(gen_random_uuid(),'Forbidden')`)).rejects.toThrow();
  await expect(db.query('select * from public.integration_cache')).rejects.toThrow();
  await db.exec('reset role');
 });
 it('lets signed-in users submit pending content and denies self-promotion',async()=>{
  await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${user}',false)`);
  const row=await db.query<{slug:string;status:string}>(insert('pending','Envio pendente'));
  expect(row.rows[0].status).toBe('pending');expect(row.rows[0].slug).toMatch(/^envio-pendente-/);
  await expect(db.query(insert('approved','Publicacao indevida'))).rejects.toThrow();
  await db.exec(`update public.profiles set role='admin' where id='${user}'`);
  expect((await db.query('select role from public.profiles')).rows).toEqual([{role:'user'}]);
  await db.exec('reset role');
 });
 it('allows admin publication and keeps pending submissions hidden from visitors',async()=>{
  await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false)`);
  await db.query(insert('approved','Lineup publicada'));
  await db.exec('reset role;set role anon');
  expect((await db.query('select title,status from public.lineups')).rows).toEqual([{title:'Lineup publicada',status:'approved'}]);
  await db.exec('reset role');
 });
 it('rejects repeated full installation without changing existing moderation state',async()=>{
  await expect(db.exec(installer)).rejects.toThrow(/schema base ja existe/);
  await db.exec('rollback');
  expect((await db.query(`select status from public.lineups where title='Envio pendente'`)).rows).toEqual([{status:'pending'}]);
 });
});
