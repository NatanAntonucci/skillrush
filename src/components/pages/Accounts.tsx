import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, TrendingUp, BarChart3, RotateCw } from 'lucide-react';
import PageLoader from '../PageLoader';
import { fetchPrestacaoContas } from '../../services/api';
import type { Documento } from '../../types/documents';
import { formatFileSize } from '../../utils/format';
import { extractDocumentFile } from '../../lib/wordpress-utils';

export default function Accounts() {
  const [contas, setContas] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const loadContas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrestacaoContas();
      setContas(data);
    } catch (err) {
      console.error('Erro ao carregar prestação de contas:', err);
      setError('Não conseguimos carregar os relatórios. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadContas();
  }, []);

  const extractYear = (doc: Documento): number => {
    const acfDate = doc.acf?.data_publicacao;
    if (acfDate && acfDate.length >= 4) {
      return Number(acfDate.substring(0, 4));
    }

    const parsed = new Date(doc.date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getFullYear();
    }

    return new Date().getFullYear();
  };

  const groupedByYear = contas.reduce((acc, conta) => {
    const year = extractYear(conta);
    if (!acc[year]) acc[year] = [];
    acc[year].push(conta);
    return acc;
  }, {} as Record<number, Documento[]>);

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const financialMetrics = [
    { label: 'Relatórios Financeiros Publicados', value: String(contas.length) },
    { label: 'Anos com prestação disponível', value: String(sortedYears.length) },
  ];

  if (loading) {
    return <PageLoader message="Carregando relatórios..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Transparência e Prestação de Contas</h1>
        <p className="text-xl text-neutral-600 mb-12">
          This organization prioritizes transparency in resource management, disclosure of results, and institutional governance.
        </p>

        {error && (
          <div className="mb-10 max-w-2xl bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-red-700 font-medium mb-2">{error}</p>
              <button
                onClick={loadContas}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCw size={16} />
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Conteudo parcialmente hardcoded ate consolidacao completa dos indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {financialMetrics.map((metric) => (
            <div key={metric.label} className="bg-white rounded-xl p-6 shadow-md">
              <p className="text-neutral-600 text-sm font-medium mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-primary">{metric.value}</p>
            </div>
          ))}
        </div>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={28} className="text-icon-fg" />
            <h2 className="text-3xl font-bold text-neutral-900">Relatórios Financeiros por Ano</h2>
          </div>

          {!error && sortedYears.length > 0 && (
            <div className="space-y-8">
              {sortedYears.map((year) => {
                const yearDocs = groupedByYear[year];
                return (
                  <div key={year} className="bg-white rounded-xl p-8 shadow-md">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-6">Ano {year}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {yearDocs.map((doc) => {
                        const file = extractDocumentFile(doc);
                        const fileSize = file.filesize
                          ? formatFileSize(file.filesize)
                          : 'PDF';

                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-neutral-900 truncate">{doc.title.rendered}</p>
                              <p className="text-sm text-neutral-500">{fileSize}</p>
                            </div>
                            {file.url ? (
                              <a
                                href={file.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-hover transition-colors ml-3"
                                aria-label={`Baixar ${doc.title.rendered}`}
                              >
                                <Download size={22} />
                              </a>
                            ) : (
                              <span className="text-neutral-400 opacity-60 ml-3" title="Arquivo não disponível">
                                <Download size={22} />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!error && sortedYears.length === 0 && (
            <section className="bg-white rounded-2xl p-8 md:p-10 shadow-md border border-neutral-100 text-center">
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">Nenhum relatório disponível</h3>
              <p className="text-neutral-600 max-w-2xl mx-auto mb-6">
                Ainda não encontramos relatórios de prestação de contas publicados nesta área. Se precisar de informações
                financeiras específicas, entre em contato com a equipe responsável.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="mailto:finance@example.com?subject=Financial%20Report%20Request"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Solicitar por E-mail
                </a>
                <button
                  onClick={loadContas}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                >
                  <RotateCw size={16} />
                  Atualizar lista
                </button>
              </div>
            </section>
          )}
        </section>

        {/* Conteudo institucional hardcoded */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={24} className="text-icon-fg" />
              <h3 className="text-2xl font-bold text-neutral-900">Política de Alocação de Recursos</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-6">
              This organization follows a rigorous resource allocation policy, ensuring maximum efficiency:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-neutral-900">60% - Projetos e Capacitação</p>
                  <p className="text-sm text-neutral-600">Investimento direto em programas de impacto</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-neutral-900">20% - Infraestrutura e Equipamentos</p>
                  <p className="text-sm text-neutral-600">Manutenção e modernização de recursos</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-neutral-900">15% - Administração</p>
                  <p className="text-sm text-neutral-600">Custos operacionais e gestão</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-neutral-900">5% - Contingência</p>
                  <p className="text-sm text-neutral-600">Reserva para situações emergenciais</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Certificações e Auditorias</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-1">Auditoria Independente Anual</p>
                <p className="text-opacity-80 text-sm">Realizada por firma auditora externa certificada</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Conformidade com Lei 12.527/2011</p>
                <p className="text-opacity-80 text-sm">Lei de Acesso à Informação - 100% compliante</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Certificação ISO 9001:2015</p>
                <p className="text-opacity-80 text-sm">Gestão de Qualidade</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Registro no CNAS</p>
                <p className="text-opacity-80 text-sm">Conselho Nacional de Assistência Social</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">Informações de Contato para Dúvidas</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-neutral-600 mb-2">
                Email:{' '}
                <a
                  href="mailto:contact@example.com"
                  className="text-primary hover:text-primary-hover underline transition-colors"
                >
                  contact@example.com
                </a>
              </p>
              <p className="text-neutral-600">Telefone: (61) 99382-3763</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
