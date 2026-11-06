'use client';

import { useEffect, useRef } from 'react';

import { useLineupStore } from '@/stores/lineupStore';
import { slugify } from '@/utils/slug';

/**
 * Espelha mapa e agente selecionados na URL (`?mapa=bind&agente=sova`),
 * tornando a seleção compartilhável e resistente a F5.
 * Lê `window.location` dentro do efeito para não exigir Suspense/CSR bailout.
 */
export function UrlSync() {
  const selectedMap = useLineupStore((state) => state.selectedMap);
  const selectedAgent = useLineupStore((state) => state.selectedAgent);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (selectedMap) {
      params.set('mapa', slugify(selectedMap.displayName));
    }

    if (selectedAgent) {
      params.set('agente', slugify(selectedAgent.displayName));
    }

    const query = params.toString();
    // Preserva a rota atual: em /painel o refresh precisa continuar em /painel.
    const pathname = window.location.pathname;
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [selectedMap, selectedAgent]);

  return null;
}
