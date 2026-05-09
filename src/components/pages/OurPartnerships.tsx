import { ArrowLeft, Building2, Users, Zap, ExternalLink } from 'lucide-react';

export default function OurPartnerships() {
  type PartnershipItem = {
    id: string;
    name: string;
    description: string;
    projects: string[];
    website?: string;
    logo?: string; // arquivo em /images/
    status?: 'validar' | 'ativo';
  };

  type PartnershipGroup = {
    category: string;
    icon: typeof Building2;
    description: string;
    items: PartnershipItem[];
  };

  const partnerGroups: PartnershipGroup[] = [
    {
      category: 'Parcerias Governamentais',
      icon: Building2,
      description:
        'Cooperação institucional com órgãos públicos para fortalecer ações, projetos e iniciativas de interesse social.',
      items: [
        {
          id: 'strategic-partner',
          name: 'Strategic Partner Organization',
          description:
            'Parceria institucional que orienta prioridades e apoia a execução de iniciativas ligadas ao fortalecimento das operações e à capacitação.',
          projects: ['Capacitações e treinamentos', 'Apoio a iniciativas de prevenção', 'Eventos institucionais'],
          status: 'ativo',
        },
        {
          id: 'defesa-civil',
          name: 'Defesa Civil',
          description:
            'Articulação para ações de prevenção e preparação, incluindo apoio a campanhas educativas e iniciativas de redução de riscos.',
          projects: ['Ações comunitárias e educativas', 'Integração em iniciativas de prevenção'],
          status: 'ativo',
        },
        {
          id: 'pmdf',
          name: 'Polícia Militar',
          description:
            'Cooperação para iniciativas conjuntas de interesse público e apoio a eventos e ações de segurança e bem-estar.',
          projects: ['Apoio a eventos institucionais', 'Ações integradas de interesse social'],
          status: 'ativo',
        },
        {
          id: 'cldf',
          name: 'Câmara Legislativa do Distrito Federal',
          description:
            'Relacionamento institucional para fortalecimento de iniciativas de transparência, governança e impacto social.',
          projects: ['Ações de transparência e governança', 'Apoio institucional a iniciativas sociais'],
          status: 'ativo',
        },
      ],
    },
    {
      category: 'Setor Privado',
      icon: Zap,
      description:
        'Parcerias com empresas e apoiadores para viabilizar projetos, fornecer recursos, serviços e tecnologia, e ampliar o impacto das ações.',
      items: [
        {
          id: 'egestor',
          name: 'uGestor',
          description: 'Apoio com soluções e serviços para fortalecer a gestão e a eficiência operacional.',
          projects: ['Suporte à gestão', 'Aprimoramento de processos'],
          website: 'https://www.ugestor.com.br/',
          logo: 'egestor.png',
          status: 'ativo',
        },
        {
          id: 'bonamix',
          name: 'Bona Mix Atacarejo',
          description: 'Apoio a iniciativas institucionais e ações de impacto social.',
          projects: ['Ações sociais e comunitárias', 'Apoio a campanhas e eventos'],
          website: 'https://bonamixatacarejo.com.br/',
          logo: 'bonamix.png',
          status: 'ativo',
        },
        {
          id: 'sasbio',
          name: 'SasBio',
          description: 'Colaboração com foco em soluções e insumos para projetos e ações institucionais.',
          projects: ['Apoio a projetos institucionais', 'Parceria técnica'],
          website: 'https://www.sasbio.com.br/',
          logo: 'sasbio.png',
          status: 'ativo',
        },
        {
          id: 'brasimpex',
          name: 'Brasimpex',
          description: 'Parceria voltada ao apoio institucional e a ações de fortalecimento da infraestrutura.',
          projects: ['Apoio a projetos estruturantes', 'Parceria em iniciativas institucionais'],
          logo: 'brasimpex.png',
          status: 'ativo',
        },
        {
          id: 'hospital-santa-marta',
          name: 'Hospital Santa Marta',
          description: 'Instituição de saúde parceira em iniciativas relacionadas à qualidade de vida e bem-estar.',
          projects: ['Ações de promoção de saúde', 'Apoio a campanhas institucionais'],
          logo: 'hospitalsantamaria.png',
          status: 'ativo',
        },
        {
          id: 'instituidor',
          name: 'Instituidor Pessoa Física: CEL. Lisandro Paixão dos Santos',
          description: 'Strategic founder and supporter, strengthening our institutional base.',
          projects: ['Institutional support', 'Program development and consolidation'],
          logo: 'instituidor.png',
          status: 'ativo',
        },
      ],
    },
    {
      category: 'Organizações Sociais, Academia e Associações',
      icon: Users,
      description:
        'Articulação com ONGs, universidades, associações e outras fundações para ações comunitárias, educação preventiva e projetos conjuntos.',
      items: [
        {
          id: 'ongs',
          name: 'Organizações Sociais (ONGs)',
          description:
            'Parcerias para ampliar alcance e capilaridade de ações comunitárias e educativas.',
          projects: ['Educação preventiva', 'Conscientização', 'Ações comunitárias'],
          status: 'ativo',
        },
        {
          id: 'universidades',
          name: 'Universidades e instituições de ensino',
          description:
            'Colaborações para desenvolvimento de pesquisas aplicadas, cursos e iniciativas de capacitação.',
          projects: ['Formação técnica', 'Seminários', 'Workshops'],
          status: 'ativo',
        },
        {
          id: 'associacoes',
          name: 'Associações e entidades representativas',
          description:
            'Cooperação com associações para ações de interesse público e iniciativas alinhadas à missão institucional.',
          projects: ['Projetos conjuntos', 'Campanhas e iniciativas sociais'],
          status: 'ativo',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <button
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-6 sm:mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-2 sm:mb-4">Parcerias Estratégicas</h1>
        <p className="text-sm sm:text-base lg:text-xl text-neutral-600 mb-8 sm:mb-12 lg:mb-16">
          Our work is strengthened by partnerships. On this page, we organize collaborations by category, with information about each partnership and examples of joint projects, following best practices for institutional transparency.
        </p>

        <div className="space-y-6 sm:space-y-8 lg:space-y-10 mb-12 lg:mb-16">
          {partnerGroups.map((group) => {
            const Icon = group.icon;
            return (
              <section key={group.category} className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 bg-icon-bg rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">{group.category}</h2>
                      <p className="text-sm sm:text-base text-neutral-600 mt-2">{group.description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {group.items.map((item) => {
                    const logoSrc = item.logo ? `/images/${item.logo}` : '';
                    return (
                      <article
                        key={item.id}
                        className="border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow flex flex-col"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-neutral-900 line-clamp-2">{item.name}</h3>
                            <p className="text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-2">{item.description}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
                            {item.status === 'validar' && (
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 whitespace-nowrap">
                                Validar
                              </span>
                            )}
                            {item.website && (
                              <a
                                href={item.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover whitespace-nowrap"
                                aria-label={`Visitar site de ${item.name}`}
                                title="Abrir site"
                              >
                                Site
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>

                        {logoSrc ? (
                          <div className="mt-3 sm:mt-5 bg-white border border-slate-100 rounded-lg p-3 sm:p-4 flex items-center justify-center">
                            <img
                              src={logoSrc}
                              alt={`Logo ${item.name}`}
                              className="h-12 sm:h-14 w-auto object-contain"
                              width="120"
                              height="56"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : null}

                        <div className="mt-3 sm:mt-5 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-neutral-900 mb-2">Projetos conjuntos</p>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {item.projects.map((p) => (
                              <li key={p} className="flex items-start gap-2 sm:gap-3">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-neutral-600">{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">Benefícios das Parcerias</h2>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full mt-1 sm:mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-neutral-900">Compartilhamento de Expertise</p>
                  <p className="text-xs sm:text-sm text-neutral-600">Acesso a conhecimento especializado e melhores práticas globais</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full mt-1 sm:mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-neutral-900">Sinergia de Recursos</p>
                  <p className="text-xs sm:text-sm text-neutral-600">Otimização e potencialização de investimentos conjuntos</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full mt-1 sm:mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-neutral-900">Inovação Tecnológica</p>
                  <p className="text-xs sm:text-sm text-neutral-600">Acesso a soluções inovadoras e tecnologia de ponta</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full mt-1 sm:mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-neutral-900">Alcance Ampliado</p>
                  <p className="text-xs sm:text-sm text-neutral-600">Expansão de atuação e impacto em diferentes regiões</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6">Proposta de Parceria</h2>
            <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              We are always open to new strategic partnerships aligned with our mission and values.
            </p>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div>
                <p className="font-semibold mb-2 text-sm sm:text-base">Tipos de Parcerias:</p>
                <ul className="list-disc list-inside text-opacity-90 space-y-1 text-xs sm:text-sm">
                  <li>Governamentais</li>
                  <li>Setor privado</li>
                  <li>Organizações sociais (ONGs)</li>
                  <li>Universidades e associações</li>
                </ul>
              </div>
            </div>
            <a
              href="#contato"
              className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 bg-white text-primary rounded-lg font-semibold text-sm sm:text-base hover:bg-neutral-100 transition-colors"
            >
              Propor Parceria
            </a>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">Transparência nas Parcerias</h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="border-l-4 border-primary pl-3 sm:pl-6">
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-1 sm:mb-2">Logos, descrição e projetos conjuntos</h4>
              <p className="text-xs sm:text-sm text-neutral-600">
                Cada parceria deve apresentar, sempre que possível, o logotipo, a descrição do vínculo e exemplos de projetos realizados em conjunto, reforçando a credibilidade e a rastreabilidade das ações.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-3 sm:pl-6">
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-1 sm:mb-2">Empresas específicas (não genérico)</h4>
              <p className="text-xs sm:text-sm text-neutral-600">
                Para o setor privado, a lista deve priorizar empresas específicas (e não categorias genéricas), com detalhes do apoio prestado e resultados quando aplicável.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-3 sm:pl-6">
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-1 sm:mb-2">Atualização contínua</h4>
              <p className="text-xs sm:text-sm text-neutral-600">
                This page is updated as new partnerships are formalized and published through our official channels.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
