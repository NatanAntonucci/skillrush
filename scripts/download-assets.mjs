#!/usr/bin/env node
/**
 * Baixa ícones/mapas do Valorant, otimiza para WebP e gera o manifest
 * `src/data/assets.json` (URL remota → caminho local).
 *
 * Uso:
 *   npm run assets              # baixa o que falta
 *   npm run assets -- --force   # rebaiхa e reprocessa tudo
 *
 * O app usa `resolveImage()` para preferir o arquivo local e cair na URL
 * remota quando não existir. Assim o build funciona mesmo sem rodar o script.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public', 'assets', 'valorant');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'assets.json');
const FORCE = process.argv.includes('--force');

let sharp = null;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.warn('sharp não instalado — as imagens serão salvas sem otimização.');
}

function loadEnv() {
  if (!existsSync('.env.local')) return;

  const content = readFileSync('.env.local', 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!process.env[key]) {
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
}

function extensionFrom(url) {
  const clean = url.split('?')[0];
  const ext = path.extname(clean).toLowerCase();
  return ext === '.webp' || ext === '.png' || ext === '.jpg' || ext === '.jpeg' ? ext : '.png';
}

async function processImage(url, target, size) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} em ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync(path.dirname(target), { recursive: true });

  if (!sharp) {
    writeFileSync(target, buffer);
    return buffer.length;
  }

  const optimized = await sharp(buffer)
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  writeFileSync(target, optimized);
  return optimized.length;
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Lendo metadata do banco…');

  const [agents, abilities, maps] = await Promise.all([
    supabase.from('agents').select('id, display_icon'),
    supabase.from('abilities').select('id, display_icon'),
    supabase.from('maps').select('id, display_icon, list_view_icon'),
  ]);

  for (const result of [agents, abilities, maps]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const targets = [];

  for (const row of agents.data ?? []) {
    if (row.display_icon) {
      targets.push({ url: row.display_icon, folder: 'agents', name: `${row.id}-icon`, size: 160 });
    }
  }

  for (const row of abilities.data ?? []) {
    if (row.display_icon) {
      targets.push({ url: row.display_icon, folder: 'abilities', name: `${row.id}-icon`, size: 96 });
    }
  }

  for (const row of maps.data ?? []) {
    if (row.display_icon) {
      targets.push({ url: row.display_icon, folder: 'maps', name: `${row.id}-display`, size: 1024 });
    }
    if (row.list_view_icon) {
      targets.push({ url: row.list_view_icon, folder: 'maps', name: `${row.id}-list`, size: 320 });
    }
  }

  console.log(`${targets.length} imagens para verificar${sharp ? ' (otimizando para WebP)' : ''}…`);

  const manifest = {};
  let processed = 0;
  let skipped = 0;
  let bytes = 0;
  const failures = [];

  const queue = [...targets];

  async function worker() {
    for (;;) {
      const item = queue.shift();
      if (!item) return;

      const ext = sharp ? '.webp' : extensionFrom(item.url);
      const relative = `/assets/valorant/${item.folder}/${item.name}${ext}`;
      const target = path.join(PUBLIC_DIR, item.folder, `${item.name}${ext}`);

      if (!FORCE && existsSync(target) && statSync(target).size > 0) {
        manifest[item.url] = relative;
        skipped += 1;
        continue;
      }

      try {
        bytes += await processImage(item.url, target, item.size);
        manifest[item.url] = relative;
        processed += 1;
      } catch (error) {
        failures.push(`${item.name}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: 8 }, () => worker()));

  mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(
    MANIFEST_PATH,
    `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`,
  );

  console.log(
    `processadas: ${processed} · reaproveitadas: ${skipped} · ${(bytes / 1024 / 1024).toFixed(1)} MB gerados`,
  );
  console.log(`manifest: ${path.relative(ROOT, MANIFEST_PATH)} (${Object.keys(manifest).length} entradas)`);

  if (failures.length > 0) {
    console.warn(`\n${failures.length} falha(s):`);
    for (const failure of failures.slice(0, 10)) console.warn(`  - ${failure}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
