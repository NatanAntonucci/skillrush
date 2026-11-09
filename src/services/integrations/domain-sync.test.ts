import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
it('keeps the independently deployable Edge copy equal to the canonical frontend domain', () => {
  expect(readFileSync('supabase/functions/_shared/domain.ts', 'utf8')).toBe(
    readFileSync('src/lib/integrations/domain.ts', 'utf8'),
  );
});
