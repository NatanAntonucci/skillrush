import Link from 'next/link';

const columns = [
  {
    title: 'Jogar',
    links: [
      { label: 'Início', href: '/' },
      { label: 'Painel completo', href: '/painel' },
      { label: 'Mapas', href: '/maps' },
      { label: 'Agentes', href: '/agents' },
    ],
  },
  {
    title: 'Ferramentas',
    links: [
      { label: 'Buscar lineup', href: '/buscar' },
      { label: 'Tracker', href: '/tracker' },
      { label: 'Campeonatos', href: '/campeonatos' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Entrar', href: '/admin' },
      { label: 'Equipe', href: '/admin/equipe' },
      { label: 'Privacidade', href: '/privacidade' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-800/80">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg font-bold tracking-wide text-slate-100">SKILLRUSH</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Lineups e spots de Valorant para consultar em segundos — mapa, agente e ponto exato.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Feito para quem joga, não para quem só assiste.
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-accent-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-800/80 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Skillrush. Todos os direitos reservados.</p>
          <p className="max-w-md sm:text-right">
            Skillrush não é afiliado à Riot Games. VALORANT e os assets do jogo pertencem à Riot Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
