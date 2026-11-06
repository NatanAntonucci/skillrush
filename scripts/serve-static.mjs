#!/usr/bin/env node
/**
 * Servidor estático simples para testar o conteúdo de `out/` antes de subir.
 * Simula o comportamento do Apache: pasta → index.html e barra final.
 *
 * Uso: npm run preview   (depois de npm run build)
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const ROOT = path.resolve('out');
const PORT = Number(process.env.PORT ?? 4321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(ROOT)) {
  console.error('Pasta `out/` não encontrada. Rode `npm run build` antes.');
  process.exit(1);
}

function send(response, status, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  response.writeHead(status, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
}

createServer((request, response) => {
  const url = decodeURIComponent((request.url ?? '/').split('?')[0]);
  const target = path.join(ROOT, url);
  const relative = path.relative(ROOT, target);

  if (relative.startsWith('..')) {
    response.writeHead(403).end('403');
    return;
  }

  if (existsSync(target) && statSync(target).isFile()) {
    send(response, 200, target);
    return;
  }

  if (existsSync(target) && statSync(target).isDirectory()) {
    if (!url.endsWith('/')) {
      response.writeHead(301, { Location: `${url}/` }).end();
      return;
    }

    const index = path.join(target, 'index.html');
    if (existsSync(index)) {
      send(response, 200, index);
      return;
    }
  }

  const html = `${target.replace(/\/$/, '')}.html`;
  if (existsSync(html)) {
    send(response, 200, html);
    return;
  }

  const notFound = path.join(ROOT, '404.html');
  if (existsSync(notFound)) {
    send(response, 404, notFound);
    return;
  }

  response.writeHead(404).end('404');
}).listen(PORT, () => {
  console.log(`Pré-visualização estática em http://localhost:${PORT}`);
});
