import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Skillrush',
  description: 'Skillrush — plataforma interativa de lineups e jogadas com filtros, mapa e hotspots.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100">
        <Header />
        {children}
      </body>
    </html>
  );
}
