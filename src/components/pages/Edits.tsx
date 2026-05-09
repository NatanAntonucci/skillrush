import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Calendar, FileText, Download, RotateCw } from 'lucide-react';
import PageLoader from '../PageLoader';
import { fetchEditais } from '../../services/api';
import type { Documento } from '../../types/documents';
import { extractDocumentFile } from '../../lib/wordpress-utils';

export default function Edits() {
  const [editais, setEditais] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const loadEditais = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEditais();
      setEditais(data);
    } catch (err) {
      console.error('Erro ao carregar editais:', err);
      setError('Não conseguimos carregar os editais. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadEditais();
  }, []);

  const groupedByYear = editais.reduce((acc, edital) => {
    const dateStr = edital.acf?.data_publicacao || edital.date;
    const year = dateStr ? parseInt(dateStr.substring(0, 4), 10) : new Date().getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(edital);
    return acc;
  }, {} as Record<number, Documento[]>);

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const featuredEdit = editais.find((e) => e.acf?.status_edital === 'Aberto');
  const featuredFile = featuredEdit ? extractDocumentFile(featuredEdit) : { url: '', filesize: null };

  const formatYmdDate = (ymd?: string): string => {
    if (!ymd || ymd.length !== 8) return '';
    const year = ymd.substring(0, 4);
    const month = ymd.substring(4, 6);
    const day = ymd.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Aberto') {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-neutral-100 text-neutral-600';
  };

  if (loading) {
    return <PageLoader message="Carregando editais..." />;
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

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Editais</h1>
        <p className="text-xl text-neutral-600 mb-16">
          Public calls, selections and participation opportunities in our programs.
        </p>

        {error && (
          <div className="mb-10 max-w-2xl bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-red-700 font-medium mb-2">{error}</p>
              <button
                onClick={loadEditais}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCw size={16} />
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {!error && featuredEdit && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8 bg-white rounded-xl p-6 shadow-md">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-700 font-bold">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 truncate">{featuredEdit.title.rendered}</p>
                {featuredEdit.acf?.descricao_curta && (
                  <p className="text-sm text-neutral-600 truncate">{featuredEdit.acf.descricao_curta}</p>
                )}
              </div>
              {featuredFile.url && (
                <a
                  href={featuredFile.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Acessar
                </a>
              )}
            </div>
          </div>
        )}

        {!error && sortedYears.length > 0 && (
          <div className="space-y-12">
            {sortedYears.map((year) => {
              const yearEdits = groupedByYear[year];
              return (
                <section key={year}>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Calendar size={28} className="text-icon-fg" />
                    Ano {year}
                  </h2>
                  <div className="space-y-4">
                    {yearEdits.map((edital) => {
                      const file = extractDocumentFile(edital);
                      const status = edital.acf?.status_edital || 'Encerrado';
                      const publishDate = edital.acf?.data_publicacao
                        ? `Publicado em: ${formatYmdDate(edital.acf.data_publicacao)}`
                        : '';

                      return (
                        <div
                          key={edital.id}
                          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText size={20} className="text-icon-fg" />
                                <h4 className="text-lg font-bold text-neutral-900">
                                  {edital.title.rendered}
                                </h4>
                              </div>
                              {edital.acf?.descricao_curta && (
                                <p className="text-neutral-600 mb-3">{edital.acf.descricao_curta}</p>
                              )}
                              {publishDate && (
                                <p className="text-sm text-neutral-500">{publishDate}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(status)}`}
                              >
                                {status}
                              </span>
                              {file.url ? (
                                <a
                                  href={file.url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary-hover transition-colors"
                                  aria-label={`Baixar ${edital.title.rendered}`}
                                  title="Baixar edital"
                                >
                                  <Download size={20} />
                                </a>
                              ) : (
                                <span className="text-neutral-400 opacity-60" title="Arquivo não disponível">
                                  <Download size={20} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {!error && sortedYears.length === 0 && (
          <section className="bg-white rounded-2xl p-8 md:p-10 shadow-md border border-neutral-100 text-center">
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Nenhum edital disponível</h3>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-6">
              Ainda não encontramos editais publicados nesta área. Para receber orientações sobre processos seletivos,
              fale com nossa equipe.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:contato@fundacao193.org.br?subject=Informações%20sobre%20Editais"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
              >
                Solicitar por E-mail
              </a>
              <button
                onClick={loadEditais}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                <RotateCw size={16} />
                Atualizar lista
              </button>
            </div>
          </section>
        )}

        {/* Conteudo institucional hardcoded */}
        <section className="mt-16 bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Como Participar de Nossos Editais</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Passo 1: Consulte os Requisitos</h4>
              <p className="text-opacity-90 leading-relaxed">
                Leia cuidadosamente o edital e verifique se sua instituição ou projeto atende aos critérios de elegibilidade.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Passo 2: Prepare a Documentação</h4>
              <p className="text-opacity-90 leading-relaxed">
                Reúna todos os documentos necessários conforme listado no edital (CNPJ, comprovantes, plano de trabalho, etc).
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Passo 3: Submeta Sua Proposta</h4>
              <p className="text-opacity-90 leading-relaxed">
                Envie sua proposta pelos canais indicados antes da data limite de inscrição.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Passo 4: Acompanhe o Processo</h4>
              <p className="text-opacity-90 leading-relaxed">
                Monitor the status of your proposal through our official portal.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-white rounded-2xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">Dúvidas Frequentes</h3>
          <div className="space-y-6">
            <div className="border-b border-neutral-200 pb-6 last:border-0">
              <h4 className="font-bold text-neutral-900 mb-2">Quando são publicados novos editais?</h4>
              <p className="text-neutral-600">
                Publicamos editais regularmente ao longo do ano, conforme a necessidade de novos projetos e parcerias. Recomendamos se inscrever em nossa newsletter para receber notificações.
              </p>
            </div>
            <div className="border-b border-neutral-200 pb-6 last:border-0">
              <h4 className="font-bold text-neutral-900 mb-2">Qual é a documentação necessária?</h4>
              <p className="text-neutral-600">
                A documentação varia conforme o edital. Cada chamada especifica exatamente o que é necessário. Todos os editais disponibilizam modelos e templates.
              </p>
            </div>
            <div className="border-b border-neutral-200 pb-6 last:border-0">
              <h4 className="font-bold text-neutral-900 mb-2">Como posso acompanhar minha proposta?</h4>
              <p className="text-neutral-600">
                Após submeter sua proposta, você receberá um número de protocolo. Use este número para acompanhar o status em nosso portal online.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 bg-neutral-100 rounded-xl p-6">
          <p className="text-neutral-700 font-medium mb-4">Para mais informações sobre editais:</p>
          <p className="text-neutral-600">Email: contato@fundacao193.org.br | Telefone: (61) 99382-3763</p>
        </div>
      </div>
    </div>
  );
}
