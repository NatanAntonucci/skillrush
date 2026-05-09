import { GraduationCap, Flame, Users, Lightbulb, type LucideIcon } from 'lucide-react';

export default function Services() {
  const stats: Array<{
    icon: LucideIcon;
    label: string;
    description: string;
  }> = [
    {
      icon: GraduationCap,
      label: 'Desenvolvimento Ágil',
      description: 'Componentes prontos para acelerar a criação de interfaces responsivas e modernas.',
    },
    {
      icon: Users,
      label: 'Experiência do Usuário',
      description: 'Layouts claros, acessíveis e projetados para melhorar a conversão e a confiança do visitante.',
    },
    {
      icon: Lightbulb,
      label: 'Design Flexível',
      description: 'Seções moduláveis que podem ser adaptadas para exposição de serviços, produtos e equipe.',
    },
    {
      icon: Flame,
      label: 'Performance Otimizada',
      description: 'Uso de Vite e Tailwind para garantir carregamento rápido e boa experiência em qualquer dispositivo.',
    },
  ];

  return (
    <section id="areas" className="relative py-20 bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_20%),_radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_35%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Funcionalidades Principais
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Recursos prontos para o seu próximo projeto
          </h2>
          <p className="text-lg text-white/80">
            Estrutura modular que permite criar páginas institucionais, landing pages e portfólios com rapidez.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <stat.icon size={28} />
              </div>

              <div className="text-lg font-semibold mb-2">{stat.label}</div>

              <div className="text-sm text-white/80">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
