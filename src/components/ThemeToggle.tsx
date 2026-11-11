'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';

type Theme = 'light' | 'cyan' | 'rush';

const STORAGE_KEY = 'skillrush:theme';

const OPTIONS: { value: Theme; label: string; swatch: string }[] = [
  { value: 'light', label: 'Branco', swatch: '#ffffff' },
  { value: 'cyan', label: 'Ciano', swatch: '#06b6d4' },
  { value: 'rush', label: 'Coral', swatch: '#e63a4b' },
];

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'rush') return stored;
  } catch {
    // ignora
  }
  return 'cyan';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('cyan');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function apply(next: Theme) {
    setTheme(next);
    setOpen(false);

    const update = () => {
      if (next === 'cyan') {
        delete document.documentElement.dataset.theme;
      } else {
        document.documentElement.dataset.theme = next;
      }
    };

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };

    // Transição premium: o navegador faz um crossfade/wipe do tema inteiro.
    if (doc.startViewTransition && !prefersReduced) {
      doc.startViewTransition(update);
    } else {
      update();
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignora
    }
  }

  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[1];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Tema: ${current.label}`}
        className="flex items-center gap-1.5 rounded-full border border-slate-800 px-2.5 py-2 text-sm text-slate-300 transition hover:border-accent-400 hover:text-white"
      >
        <Palette size={15} />
        <span className="hidden xl:inline">Tema</span>
        <span
          className="h-2.5 w-2.5 rounded-full ring-1 ring-black/20"
          style={{ backgroundColor: current.swatch }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-up absolute right-0 top-full z-[60] mt-2 w-44 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.value}
              onClick={() => apply(option.value)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/30"
                style={{ backgroundColor: option.swatch }}
              />
              <span className="flex-1">{option.label}</span>
              {theme === option.value && <Check size={14} className="text-accent-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
