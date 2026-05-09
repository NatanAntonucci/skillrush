'use client';

import { MouseEvent, useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Impacto', href: '#impacto' },
  { label: 'Contato', href: '#contato' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();

    const targetId = href.slice(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', href);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur transition-shadow duration-200 ${isScrolled ? 'shadow-xl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a
            href="#inicio"
            className="flex items-center gap-4 text-white transition-opacity hover:opacity-90 focus:outline-2 focus:outline-offset-2 focus:outline-cyan-400"
            onClick={(event) => handleNavClick(event, '#inicio')}
          >
            <img src="/logo.svg" alt="Skillrush" className="h-16 w-auto max-w-[160px]" />
            <span className="text-base font-medium tracking-[0.02em] text-slate-100">Lineups Valorant</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className="text-slate-200 hover:text-white transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contato"
              onClick={(event) => handleNavClick(event, '#contato')}
              className="rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              Vamos começar
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-slate-200 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-cyan-400"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className="block rounded-2xl px-4 py-3 text-slate-200 hover:bg-slate-900 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
