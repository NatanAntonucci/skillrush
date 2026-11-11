'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, LogOut, Menu, Search, Upload, X } from 'lucide-react';

import { useAdmin } from '@/hooks/useAdmin';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Painel', href: '/painel' },
  { label: 'Tracker', href: '/tracker' },
  { label: 'Campeonatos', href: '/campeonatos' },
];

const catalogItems = [
  { label: 'Mapas', href: '/maps', hint: 'Arte, sites e lineups por mapa' },
  { label: 'Agentes', href: '/agents', hint: 'Habilidades e lineups por agente' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const { isAdmin, loading } = useAdmin();
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCatalogOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!catalogRef.current?.contains(event.target as Node)) setIsCatalogOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsCatalogOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isCatalogOpen]);

  async function handleLogout() {
    const { supabase } = await import('@/services/supabase/client');
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="-ml-2 flex shrink-0 items-center transition-opacity hover:opacity-90 sm:-ml-4"
        >
          <Image
            src="/logo.svg"
            alt="Skillrush"
            width={220}
            height={102}
            priority
            className="logo-on-dark h-12 w-auto sm:h-16"
          />
          <Image
            src="/logo-dark.png"
            alt="Skillrush"
            width={521}
            height={241}
            priority
            className="logo-on-light h-12 w-auto sm:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-4 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-base font-medium text-slate-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          <div className="relative" ref={catalogRef}>
            <button
              type="button"
              onClick={() => setIsCatalogOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={isCatalogOpen}
              className="flex items-center gap-1 whitespace-nowrap text-base font-medium text-slate-300 transition-colors hover:text-white"
            >
              Catálogo
              <ChevronDown size={14} className={`transition ${isCatalogOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatalogOpen && (
              <div
                role="menu"
                className="animate-fade-up absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl"
              >
                {catalogItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsCatalogOpen(false)}
                    className="block rounded-lg px-3 py-2 transition hover:bg-slate-900"
                  >
                    <span className="block text-sm font-medium text-slate-200">{item.label}</span>
                    <span className="block text-xs text-slate-500">{item.hint}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/buscar"
            aria-label="Buscar"
            className="rounded-full border border-slate-800 p-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <Search size={16} />
          </Link>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {!loading && isAdmin && (
            <>
              <Link
                href="/admin/upload"
                className="hidden whitespace-nowrap rounded-xl bg-accent-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-accent-400 sm:inline-block"
              >
                Upload
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-1.5 whitespace-nowrap text-sm text-slate-400 transition-colors hover:text-white lg:flex"
              >
                <LogOut size={16} />
                Sair
              </button>
            </>
          )}

          <button
            type="button"
            className="rounded-md p-2 text-slate-200 hover:text-white lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-3 lg:hidden">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-slate-200 hover:bg-slate-900 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <p className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Catálogo
            </p>

            {catalogItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-slate-200 hover:bg-slate-900 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/buscar"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-slate-200 hover:bg-slate-900 hover:text-white"
            >
              <Search size={16} />
              Buscar
            </Link>

            <div className="flex items-center justify-between px-3 py-2.5 text-slate-300">
              <span className="text-sm">Tema</span>
              <ThemeToggle />
            </div>

            {!loading && isAdmin && (
              <>
                <Link
                  href="/admin/upload"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-xl bg-accent-500 px-3 py-2.5 font-semibold text-slate-950"
                >
                  <Upload size={16} />
                  Subir lineup
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-slate-400 hover:bg-slate-900 hover:text-white"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
