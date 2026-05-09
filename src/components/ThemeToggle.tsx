import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

type Theme = 'red' | 'green' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('red');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme || 'red';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'red') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', newTheme);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  const themes = [
    { value: 'red' as Theme, label: 'Vermelho', color: '#c11827' },
    { value: 'green' as Theme, label: 'Verde', color: '#3d685d' },
    { value: 'dark' as Theme, label: 'Escuro', color: '#1e272e' },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div className="relative">
        {/* Theme Options */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-neutral-200 p-2 min-w-[160px] animate-scale-in">
            <div className="text-xs font-semibold text-neutral-500 px-3 py-1 mb-1">
              Escolha o Tema
            </div>
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => handleThemeChange(t.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  theme === t.value
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-sm">{t.label}</span>
                {theme === t.value && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white hover:bg-neutral-50 text-neutral-700 p-4 rounded-full shadow-lg border border-neutral-200 transition-all hover:scale-105 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Alternar tema"
          title="Alternar tema"
        >
          <Palette size={24} />
        </button>
      </div>
    </div>
  );
}
