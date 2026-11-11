'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll suave + revelações no scroll (GSAP ScrollTrigger + Lenis).
 * Importado dinamicamente para não pesar no bundle inicial nem quebrar no SSR.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function setup() {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

      if (prefersReduced) {
        for (const element of elements) {
          element.style.opacity = '1';
          element.style.transform = 'none';
        }
        return;
      }

      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add('motion-ready');

      const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      let frame = 0;

      const raf = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };

      frame = requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);

      const context = gsap.context(() => {
        for (const element of elements) {
          // estado inicial aplicado por JS: se algo falhar, o conteúdo segue visível
          gsap.set(element, { opacity: 0, y: 18 });

          gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            delay: Number(element.dataset.revealDelay ?? 0),
            scrollTrigger: {
              trigger: element,
              start: 'top 92%',
              once: true,
            },
          });
        }
      });

      ScrollTrigger.refresh();

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoad);

      // se imagens/fontes mudarem a altura depois, recalcula as posições
      const safety = window.setTimeout(() => ScrollTrigger.refresh(), 1200);

      cleanup = () => {
        window.clearTimeout(safety);
        window.removeEventListener('load', onLoad);
        cancelAnimationFrame(frame);
        context.revert();
        lenis.destroy();
        document.documentElement.classList.remove('motion-ready');
      };
    }

    setup();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
