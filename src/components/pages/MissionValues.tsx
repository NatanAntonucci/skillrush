import { ArrowLeft, Target, Heart, Lightbulb, Users, Shield, Zap } from 'lucide-react';

export default function MissionValues() {
  const values = [
    {
      icon: Target,
      title: 'Excelência',
      description: 'Buscamos a excelência em todas as nossas ações, apoiando iniciativas que elevem a qualidade dos serviços prestados e fortaleçam a atuação do Corpo de Bombeiros Militar do Distrito Federal.',
    },
    {
      icon: Heart,
      title: 'Humanidade',
      description: 'Colocamos as pessoas no centro das decisões, valorizando a vida, a dignidade humana, o respeito e a solidariedade em todas as nossas iniciativas.',
    },
    {
      icon: Lightbulb,
      title: 'Inovação',
      description: 'Incentivamos a criatividade e a busca contínua por soluções que contribuam para a prevenção, o desenvolvimento institucional e o aprimoramento das atividades apoiadas.',
    },
    {
      icon: Users,
      title: 'Colaboração',
      description: 'Acreditamos na força das parcerias e do trabalho conjunto entre sociedade, instituições e o Corpo de Bombeiros Militar do Distrito Federal para alcançar resultados relevantes.',
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Priorizamos a segurança das pessoas e das comunidades, apoiando ações baseadas em boas práticas, prevenção de riscos e protocolos adequados.',
    },
    {
      icon: Zap,
      title: 'Eficiência',
      description: 'Atuamos com responsabilidade e planejamento, buscando a melhor aplicação dos recursos para maximizar o impacto social e institucional de nossas ações.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-8">Missão e Valores</h1>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">Nossa Missão</h2>
          <div className="bg-white rounded-2xl p-8 shadow-md border-l-4 border-primary">
            <p className="text-lg text-neutral-700 leading-relaxed">
            Apoiar, fortalecer e potencializar as atividades do Corpo de Bombeiros Militar do Distrito Federal, por meio do desenvolvimento de projetos e ações institucionais nas áreas socioambiental, preventiva, cultural, educacional e desportiva, contribuindo para a segurança, a prevenção e o bem-estar da sociedade.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">Nossa Visão</h2>
          <div className="bg-white rounded-2xl p-8 shadow-md border-l-4 border-primary">
            <p className="text-lg text-neutral-700 leading-relaxed">
            Ser reconhecida como uma instituição de apoio estratégica e confiável ao Corpo de Bombeiros Militar do Distrito Federal, fortalecendo a integração com a sociedade e ampliando o impacto social de ações voltadas à prevenção, à cidadania e à valorização da Corporação.            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Nossos Valores</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-icon-bg rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-icon-fg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">{value.title}</h3>
                      <p className="text-neutral-600 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
