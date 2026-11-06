'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, LogOut, Upload, Search } from 'lucide-react';

import { supabase } from '@/services/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { ThemeToggle } from '@/components/ThemeToggle';

const publicNav = [
  { label: 'Início', href: '/' },
  { label: 'Mapas', href: '/maps' },
  { label: 'Agentes', href: '/agents' },
  { label: 'Painel', href: '/painel' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, loading } = useAdmin();

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
            <Image src="/logo.svg" alt="Skillrush" width={220} height={102} priority className="h-16 w-auto" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-medium text-slate-200 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/buscar"
              aria-label="Buscar"
              className="rounded-full border border-slate-800 p-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Search size={16} />
            </Link>

            <ThemeToggle />

            {!loading && isAdmin && (
              <>
                <Link
                  href="/admin/upload"
                  className="rounded-2xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-accent-400"
                >
                  Upload
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </>
            )}
          </nav>

          <button
            type="button"
            className="rounded-md p-2 text-slate-200 hover:text-white lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 lg:hidden">
          <div className="space-y-2">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-slate-200 hover:bg-slate-900 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/buscar"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-slate-200 hover:bg-slate-900 hover:text-white"
            >
              <Search size={16} />
              Buscar
            </Link>

            <div className="flex items-center justify-between rounded-2xl px-4 py-3 text-slate-300">
              <span className="text-sm">Tema</span>
              <ThemeToggle />
            </div>

            {!loading && isAdmin && (
              <>
                <Link
                  href="/admin/upload"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-2xl bg-accent-500 px-4 py-3 font-semibold text-slate-950"
                >
                  <Upload size={16} />
                  Subir lineup
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-slate-400 hover:bg-slate-900 hover:text-white"
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
