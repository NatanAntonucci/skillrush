import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, RotateCw } from 'lucide-react';

import { fetchProjetos } from '../../services/api';
import type { Project } from '../../types/projects';
import ImageWithPlaceholder from '../ImageWithPlaceholder';
import PageLoader from '../PageLoader';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protecao contra dupla execucao no StrictMode
  const hasFetched = useRef(false);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjetos();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Não conseguimos carregar os projetos no momento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadProjects();
  }, []);

  // Estado de loading
  if (loading) {
    return <PageLoader message="Carregando projetos..." />;
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-8 flex items-center gap-4">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar projetos</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={loadProjects}
              aria-label="Recarregar projetos"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-white"
            >
              <RotateCw size={16} />
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Voltar */}
        <button
          onClick={() => (window.location.hash = '')}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {/* Cabecalho */}
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          Nossos Projetos
        </h1>
        <p className="text-xl text-neutral-600 mb-16">
          Iniciativas estratégicas que fortalecem a capacidade operacional e o
          impacto social.
        </p>

        {/* Lista de projetos */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1 group flex flex-col h-full"
            >
              <ImageWithPlaceholder
                src={project.acf?.project_featured_image}
                alt={project.title.rendered.replace(/<[^>]*>/g, '')}
                containerClassName="aspect-[16/9]"
              />

                <div className="p-8 flex flex-col flex-grow">
                  {/* Titulo */}
                  <h3
                    className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors"
                    dangerouslySetInnerHTML={{
                      __html: project.title.rendered,
                    }}
                  />

                  {/* Resumo */}
                  {project.excerpt?.rendered && (
                    <p
                      className="text-neutral-600 leading-relaxed mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: project.excerpt.rendered,
                      }}
                    />
                  )}

                  {/* Impacto */}
                  {project.acf?.impacto && (
                    <div className="border-t border-neutral-200 pt-4 mt-4 mb-6">
                      <p className="text-primary font-semibold">
                        {project.acf.impacto}
                      </p>
                    </div>
                  )}

                  {/* Saiba Mais Link */}
                  <a
                    href={`#projeto-${project.id}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all mt-auto"
                    aria-label={`Saiba mais sobre ${project.title.rendered.replace(/<[^>]*>/g, '')}`}
                  >
                    Saiba Mais
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            )
          )}
        </div>

        {/* Projetos em desenvolvimento */}
        <section className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Projetos em Desenvolvimento
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-6">
              <h4 className="text-xl font-bold text-neutral-900 mb-2">
                Plataforma Digital de Gerenciamento de Emergências
              </h4>
              <p className="text-neutral-600">
                Sistema integrado para otimização de respostas, análise de dados
                em tempo real e coordenação interagências.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h4 className="text-xl font-bold text-neutral-900 mb-2">
                Centro de Pesquisa e Inovação
              </h4>
              <p className="text-neutral-600">
                Laboratório dedicado à pesquisa de novas tecnologias,
                metodologias de resgate e equipamentos especializados.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h4 className="text-xl font-bold text-neutral-900 mb-2">
                Parcerias Internacionais de Cooperação Técnica
              </h4>
              <p className="text-neutral-600">
                Colaboração com instituições internacionais para
                compartilhamento de conhecimento e melhores práticas globais.
              </p>
            </div>
          </div>
        </section>

        {/* Como contribuir */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Como Contribuir com Nossos Projetos
          </h3>
          <p className="leading-relaxed mb-6">
            A fundação depende do apoio de parceiros públicos, privados e da
            sociedade civil para executar seus projetos.
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li>Investimentos diretos em projetos específicos</li>
            <li>Patrocínio de eventos e capacitações</li>
            <li>Doações de equipamentos e tecnologia</li>
            <li>Parcerias técnicas e consultoria</li>
            <li>Programas de voluntariado corporativo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
