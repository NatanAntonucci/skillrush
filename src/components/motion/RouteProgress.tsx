'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Barra fina no topo indicando navegação entre páginas. */
export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 700);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[70] h-[2px] bg-accent-500 shadow-[0_0_10px_rgb(var(--accent-500))] transition-all duration-300 ease-out ${
        active ? 'w-full opacity-100' : 'w-0 opacity-0'
      }`}
    />
  );
}
