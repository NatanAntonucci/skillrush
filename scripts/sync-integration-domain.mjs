#!/usr/bin/env node
// The browser imports src; Supabase deployments bundle only functions/.
// Keep a generated Edge copy and verify equality in the unit tests.
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'supabase/functions/_shared');
mkdirSync(target, { recursive: true });
copyFileSync(path.join(root, 'src/lib/integrations/domain.ts'), path.join(target, 'domain.ts'));
console.log('Módulo compartilhado das integrações sincronizado.');
