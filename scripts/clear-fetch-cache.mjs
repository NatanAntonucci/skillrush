#!/usr/bin/env node
/**
 * O Next guarda respostas de fetch em `.next/cache/fetch-cache` e reaproveita
 * entre builds. Em um site cujo conteúdo muda no banco (novo agente, lineup
 * nova), isso faria o HTML pré-renderizado sair desatualizado.
 *
 * Roda automaticamente antes de `npm run build` (hook `prebuild`).
 */

import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const cacheDir = path.join(process.cwd(), '.next', 'cache', 'fetch-cache');

if (existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true });
  console.log('cache de fetch limpo');
}
