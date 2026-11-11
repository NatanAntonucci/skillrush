import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Archivo, Archivo_Black, Inter, Space_Grotesk } from 'next/font/google';

import './globals.css';

import Header from '@/components/Header';
import BackToTopButton from '@/components/BackToTopButton';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { Preloader } from '@/components/motion/Preloader';
import { RouteProgress } from '@/components/motion/RouteProgress';
import { siteUrl } from '@/utils/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

// Tema coral: par Archivo Black (títulos) + Archivo (texto)
const archivo = Archivo({ subsets: ['latin'], variable: '--font-rush-sans', display: 'swap' });
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-rush-display',
  display: 'swap',
});

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
    <html
      lang="pt-BR"
      className={`${inter.variable} ${display.variable} ${archivo.variable} ${archivoBlack.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* aplica o tema salvo antes do primeiro paint, evitando flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('skillrush:theme');if(t==='rush'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen font-sans text-slate-100 antialiased">
        <Preloader />
        <RouteProgress />
        <MotionProvider />
        <Header />
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
