import { Award, Calendar, TrendingUp, Users, type LucideIcon } from 'lucide-react';

export default function Impact() {
  const services: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
  }> = [
    {
      icon: Calendar,
      title: '17+ Lançamentos',
      description: 'Páginas e seções prontas para apresentar sua empresa e serviços.',
      color: 'from-primary to-primary-dark',
    },
    {
      icon: Users,
      title: '120+ Usuários atendidos',
      description: 'Experiência otimizada para visitantes e equipes internas.',
      color: 'from-primary to-primary-dark',
    },
    {
      icon: Award,
      title: '8+ Componentes',
      description: 'Blocos de conteúdo reutilizáveis para acelerar suas entregas.',
      color: 'from-primary to-primary-dark',
    },
    {
      icon: TrendingUp,
      title: 'Performance de topo',
      description: 'Estrutura veloz, leve e preparada para builds rápidos.',
      color: 'from-primary to-primary-dark',
    },
  ];

  return (
    <section id="impacto" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-badge-bg text-badge-text px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Nosso Impacto
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">
            Métricas que importam
          </h2>
          <p className="text-lg text-neutral-600">
            Uma base pronta para ajudar você a apresentar resultados, serviços e objetivos de forma clara e atraente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon className="text-white" size={32} />
              </div>

              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {service.title}
              </h3>

              <p className="text-neutral-600 leading-relaxed mb-4">
                {service.description}
              </p>

              <a
                href="#contato"
                className="text-primary font-semibold text-sm hover:gap-2 inline-flex items-center gap-1 transition-all group-hover:gap-2 hover:text-primary-hover"
                onClick={(e) => {
                  const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
                  if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.slice(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      window.history.pushState(null, '', href);
                    }
                  }
                }}
              >
                Saiba mais
                <span>→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
