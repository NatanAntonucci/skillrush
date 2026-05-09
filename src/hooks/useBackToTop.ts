import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar a funcionalidade de "voltar ao topo"
 * Monitora o scroll e retorna o estado de visibilidade e função de scroll
 *
 * @param threshold - Distância em pixels para mostrar o botão (padrão: 300)
 * @returns { isVisible: boolean, scrollToTop: () => void }
 */
export function useBackToTop(threshold: number = 300) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { isVisible, scrollToTop };
}
