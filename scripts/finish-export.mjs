import { existsSync, readFileSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Next 14 exige um parâmetro mesmo para um catálogo vazio. No Apache essas
// URLs devem receber o 404 real do site, sem HTML de placeholder no export.
const out = fileURLToPath(new URL('../out/', import.meta.url));
for (const route of ['maps/__empty__/__empty__', 'maps/__empty__', 'agents/__empty__', 'lineups/__empty__']) {
  const dir = path.join(out, route);
  const html = path.join(dir, 'index.html');
  if (existsSync(html) && readFileSync(html, 'utf8').includes('NEXT_NOT_FOUND')) {
    unlinkSync(html);
    const flight = path.join(dir, 'index.txt');
    if (existsSync(flight)) unlinkSync(flight);
  }
  if (existsSync(dir) && readdirSync(dir).length === 0) rmdirSync(dir);
}
