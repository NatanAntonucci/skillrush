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

  useEffect(() => {
    async function loadLineups() {
      setLoading(true);
      setError(null);
      try {
        const { fetchLineups } = await import('@/services/supabase/lineups');
        const data = await fetchLineups({
          agentId: options?.agentId,
          mapId: options?.mapId,
        });
        setLineups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar lineups');
      } finally {
        setLoading(false);
      }
    }

    loadLineups();
  }, [options?.agentId, options?.mapId]);

  return { lineups, loading, error };
}
