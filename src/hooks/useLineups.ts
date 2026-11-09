'use client';

import { useEffect, useState } from 'react';
import type { Lineup } from '@/types';

interface UseLineupsOptions {
  agentId?: string;
  mapId?: string;
}

export function useLineups(options?: UseLineupsOptions) {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const agentId = options?.agentId;
  const mapId = options?.mapId;

  useEffect(() => {
    const controller = new AbortController();
    async function loadLineups() {
      setLoading(true);
      setError(null);
      try {
        const { fetchLineups } = await import('@/services/supabase/lineups');
        if (controller.signal.aborted) return;
        const data = await fetchLineups({ agentId, mapId, signal: controller.signal });
        if (!controller.signal.aborted) setLineups(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar lineups');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadLineups();
    return () => controller.abort();
  }, [agentId, mapId]);

  return { lineups, loading, error };
}
