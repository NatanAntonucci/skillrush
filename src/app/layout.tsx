import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

import Header from '@/components/Header';
import BackToTopButton from '@/components/BackToTopButton';
import { siteUrl } from '@/utils/site';

// Builds de staging usam NEXT_PUBLIC_NOINDEX=true para não competir com o domínio final no Google.
const noindex = process.env.NEXT_PUBLIC_NOINDEX === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Skillrush — lineups e jogadas de Valorant',
    template: '%s | Skillrush',
  },
  description:
    'Consulta rápida de lineups de Valorant: escolha mapa, agente e habilidade, veja os hotspots e assista à execução.',
  openGraph: {
    type: 'website',
    siteName: 'Skillrush',
    locale: 'pt_BR',
    url: '/',
    title: 'Skillrush — lineups e jogadas de Valorant',
    description:
      'Escolha mapa, agente e habilidade, veja os hotspots no mapa e assista à execução.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skillrush — lineups de Valorant',
    description: 'Lineups de Valorant com mapa interativo e vídeos.',
  },
  robots: noindex
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100">
        <Header />
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
