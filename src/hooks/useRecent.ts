'use client';

import { useCallback, useEffect, useState } from 'react';

export interface RecentEntry {
  mapSlug: string;
  mapName: string;
  agentSlug?: string;
  agentName?: string;
  at: number;
}

const STORAGE_KEY = 'skillrush:recent';
const MAX_ITEMS = 3;

function read(): RecentEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

/** Guarda o último mapa/agente consultado para o atalho "continuar". */
export function useRecent() {
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecent(read());
    setReady(true);
  }, []);

  const remember = useCallback((entry: Omit<RecentEntry, 'at'>) => {
    const next: RecentEntry = { ...entry, at: Date.now() };

    setRecent((current) => {
      const filtered = current.filter(
        (item) => !(item.mapSlug === next.mapSlug && item.agentSlug === next.agentSlug),
      );
      const updated = [next, ...filtered].slice(0, MAX_ITEMS);

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // localStorage indisponível (modo privado) — ignora
      }

      return updated;
    });
  }, []);

  return { recent, remember, ready };
}
