import { AgentSelect } from '@/features/agents/AgentSelect';
import { MapSelect } from '@/features/maps/MapSelect';
import { LineupFilterPanel } from '@/components/lineup/LineupFilterPanel';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { LineupList } from '@/features/lineups/LineupList';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:px-8">
        <div className="space-y-4">
          <SectionHeader
            title="Lineups interativas de Valorant"
            description="Selecione agente, mapa e habilidades para explorar jogadas anotadas diretamente sobre o mapa."
          />
          <p className="max-w-3xl text-slate-300 sm:text-lg">
            Crie uma experiência rápida e visual para consultar o posicionamento de utilitários e entender o contexto da jogada em segundos.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
            <div className="grid gap-4 md:grid-cols-2">
              <AgentSelect />
              <MapSelect />
            </div>
            <LineupFilterPanel />
            <InteractiveMap />
          </div>

          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
            <SectionHeader title="Lineups disponíveis" description="Filtre o conjunto de jogadas e clique no hotspot para ver detalhes ou vídeo." />
            <LineupList />
          </div>
        </div>
      </section>
    </main>
  );
}
