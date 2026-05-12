'use client';

import { useLineupStore } from '@/stores/lineupStore';
import { AgentSelect } from '@/features/agents/AgentSelect';
import { MapSelect } from '@/features/maps/MapSelect';
import { LineupFilterPanel } from '@/components/lineup/LineupFilterPanel';
import InteractiveMap from '@/components/map/InteractiveMap';
import LineupList from '@/features/lineups/LineupList';
import { SectionHeader } from '@/components/ui/SectionHeader';
import LineupDetails from '@/components/lineup/LineupDetails';

export default function HomePage() {
  const { selectedLineup } = useLineupStore();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:px-8">
        <div className="space-y-4" id="inicio">
          <SectionHeader
            title="Lineups interativas de Valorant"
            description="Selecione agente, mapa e habilidade para explorar jogadas anotadas diretamente no mapa."
          />
          <p className="max-w-3xl text-slate-300 sm:text-lg">
            Crie um fluxo tático claro e imediato para visualizar posicionamentos, utilitários e o contexto das jogadas em segundos.
          </p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* LEFT: Agents & Maps - narrow column on md+ */}
          <aside className="w-full md:w-1/4 lg:w-1/5 space-y-6">
            <AgentSelect />
            <MapSelect />
          </aside>

          {/* CENTER: Filters, Map, Lineups - main content */}
          <main className="w-full md:w-1/2 lg:w-3/5 space-y-6">
            <LineupFilterPanel />
            <InteractiveMap />
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
              <SectionHeader title="Lineups disponíveis" description="Filtre e clique para selecionar." />
              <div className="mt-4 max-h-96 overflow-y-auto">
                <LineupList />
              </div>
            </div>
          </main>

          {/* RIGHT: Lineup Details - stays visible on larger screens */}
          <aside className="w-full md:w-1/4 lg:w-1/5 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
              <LineupDetails />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
