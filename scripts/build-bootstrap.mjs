#!/usr/bin/env node
/** Build the single, atomic SQL Editor installer for a NEW Supabase project. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'supabase/migrations');
const files = readdirSync(dir).filter(name => /^\d{4}_.+\.sql$/.test(name)).sort();
const guard = `-- SKILLRUSH: INSTALAÇÃO PARA PROJETO SUPABASE NOVO
-- Cole este arquivo inteiro no SQL Editor e execute uma vez.
-- Não contém chaves, não cria usuários admin e não insere lineups fictícias.
begin;
do $$
begin
  if to_regclass('public.agents') is not null
    or to_regclass('public.maps') is not null
    or to_regclass('public.abilities') is not null
    or to_regclass('public.lineups') is not null then
    raise exception 'Instalacao cancelada: schema base ja existe. Nao execute este instalador novamente; aplique somente as migrations pendentes.';
  end if;
end;
$$;
`;
const sql = files.map(name => {
  const content = readFileSync(path.join(dir, name), 'utf8')
    .replace(/^\s*(begin|commit);\s*$/gim, '');
  return `\n-- ARQUIVO: ${name}\n${content}\n`;
}).join('');
const output = path.join(root, 'supabase/INSTALAR_SKILLRUSH_BANCO_NOVO.sql');
writeFileSync(output, `${guard}${sql}\nnotify pgrst, 'reload schema';\ncommit;\n`);
console.log(`Instalador gerado com ${files.length} migrations.`);
