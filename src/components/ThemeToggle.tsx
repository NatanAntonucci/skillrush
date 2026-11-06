'use client';

import { useEffect, useState } from 'react';

type Theme = 'cyan' | 'rush';

const STORAGE_KEY = 'skillrush:theme';

const options: { value: Theme; label: string; color: string }[] = [
  { value: 'cyan', label: 'Tema ciano', color: '#06b6d4' },
  { value: 'rush', label: 'Tema Skillrush', color: '#e63a4b' },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('cyan');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setTheme(stored === 'rush' ? 'rush' : 'cyan');
    } catch {
      // localStorage indisponível
    }
  }, []);

  function apply(next: Theme) {
    setTheme(next);

    if (next === 'rush') {
      document.documentElement.dataset.theme = 'rush';
    } else {
      delete document.documentElement.dataset.theme;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignora
    }
  }

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/70 p-1"
      role="group"
      aria-label="Tema de cores"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => apply(option.value)}
          title={option.label}
          aria-label={option.label}
          aria-pressed={theme === option.value}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
            theme === option.value
              ? 'bg-slate-800 ring-2 ring-accent-400/70'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          <span
            className="animate-theme-pop h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: option.color }}
          />
        </button>
      ))}
    </div>
  );
}
