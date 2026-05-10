'use client';

import { ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BackToTopButtonProps {
  threshold?: number;
  className?: string;
}

/**
 * Botão "Voltar ao Topo" reutilizável
 * Aparece automaticamente quando o usuário scrollar para baixo
 *
 * @param threshold - Pixels de scroll para mostrar o botão (padrão: 300)
 * @param className - Classes Tailwind customizadas (opcional)
 */
export default function BackToTopButton({ threshold = 300, className = '' }: BackToTopButtonProps) {
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

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-[100]
        transform transition-all duration-500 ease-out
        hover:scale-110 hover:shadow-2xl hover:-translate-y-1
        active:scale-95
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 scale-75 translate-y-16 pointer-events-none'
        }
        ${className}`}
      aria-label="Voltar ao topo"
    >
      <ChevronUp size={24} />
    </button>
  );
}
