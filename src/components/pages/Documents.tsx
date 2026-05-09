import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FileText, Download, Folder, RotateCw } from 'lucide-react';
import PageLoader from '../PageLoader';
import { fetchDocumentosInstitucionais } from '../../services/api';
import type { Documento } from '../../types/documents';
import { formatFileSize } from '../../utils/format';
import { extractDocumentFile } from '../../lib/wordpress-utils';

export default function Documents() {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDocumentosInstitucionais();
      setDocuments(data);
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
      setError('Não conseguimos carregar os documentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadDocuments();
  }, []);

  const getTipoDocumentoNome = (doc: Documento): string => {
    const tipoTerm = doc._embedded?.['wp:term']?.[0]?.find(
      (term) => term.taxonomy === 'tipo_documento'
    );

    if (tipoTerm?.name) {
      return tipoTerm.name;
    }

    const tipoId = doc.tipo_documento?.[0];
    if (tipoId === 4) return 'Documentos Institucionais';
    if (tipoId === 3) return 'Prestação de Contas';
    if (tipoId === 2) return 'Edital';

    return 'Outros';
  };

  const groupedByType = documents.reduce((acc, doc) => {
    const category = getTipoDocumentoNome(doc);
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Documento[]>);

  Object.values(groupedByType).forEach((docs) => {
    docs.sort((a, b) => {
      const aDate = a.acf?.data_publicacao || a.date || '';
      const bDate = b.acf?.data_publicacao || b.date || '';
      return bDate.localeCompare(aDate);
    });
  });

  if (loading) {
    return <PageLoader message="Carregando documentos..." />;
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

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Documentos</h1>
        <p className="text-xl text-neutral-600 mb-16">
          Access documents, manuals, standards and organizational procedures.
        </p>

        {error && (
          <div className="mb-10 max-w-2xl bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-red-700 font-medium mb-2">{error}</p>
              <button
                onClick={loadDocuments}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCw size={16} />
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {!error && (
          <div className="space-y-12">
            {Object.entries(groupedByType).map(([category, docs]) => (
              <section key={category}>
                {(() => {
                  const displayCategory = category === 'Documentos Institucionais'
                    ? 'Documentos de Transparência'
                    : category;

                  return (
                <div className="flex items-center gap-3 mb-6">
                  <Folder size={28} className="text-icon-fg" />
                  <h2 className="text-2xl font-bold text-neutral-900">{displayCategory}</h2>
                </div>
                  );
                })()}
                <div className="grid md:grid-cols-2 gap-4">
                  {docs.map((doc) => {
                    const file = extractDocumentFile(doc);
                    const fileSize = file.filesize
                      ? formatFileSize(file.filesize)
                      : 'PDF';
                    const year = doc.acf?.data_publicacao
                      ? doc.acf.data_publicacao.substring(0, 4)
                      : doc.date?.substring(0, 4) || 'N/A';

                    return (
                      <div
                        key={doc.id}
                        className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText size={20} className="text-icon-fg flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">
                              {doc.title.rendered}
                            </p>
                            {'descricao_curta' in (doc.acf || {}) && doc.acf?.descricao_curta && (
                              <p className="text-sm text-neutral-600 line-clamp-1">
                                {doc.acf.descricao_curta}
                              </p>
                            )}
                            <p className="text-xs text-neutral-500">
                              {fileSize} • {year}
                            </p>
                          </div>
                        </div>
                        {file.url ? (
                          <a
                            href={file.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover transition-colors flex-shrink-0 ml-3"
                            aria-label={`Baixar ${doc.title.rendered}`}
                            title="Baixar documento"
                          >
                            <Download size={20} />
                          </a>
                        ) : (
                          <span className="text-neutral-400 opacity-60 flex-shrink-0 ml-3" title="Arquivo não disponível">
                            <Download size={20} />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {!error && documents.length === 0 && (
          <section className="bg-white rounded-2xl p-8 md:p-10 shadow-md border border-neutral-100 text-center mb-12">
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Nenhum documento disponível</h3>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-6">
              Ainda não encontramos documentos de transparência publicados nesta área. Se precisar de um arquivo específico,
              nossa equipe pode ajudar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:documentos@fundacao193.org.br?subject=Solicitação%20de%20Documento"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
              >
                Solicitar por E-mail
              </a>
              <button
                onClick={loadDocuments}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
              >
                <RotateCw size={16} />
                Atualizar lista
              </button>
            </div>
          </section>
        )}

        {/* Conteudo institucional hardcoded */}
        <section className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Solicitação de Documentos</h3>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Não encontrou o documento que procura? Você pode solicitar cópias de documentos específicos através do formulário eletrônico.
            </p>
            <a href="mailto:documentos@fundacao193.org.br?subject=Solicitação%20de%20Documento" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors" aria-label="Solicitar documento">
              Solicitar Documento
            </a>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Lei de Acesso à Informação</h3>
            <p className="text-opacity-90 leading-relaxed mb-6">
              Access to public information is guaranteed according to applicable transparency laws.
            </p>
            <a href="mailto:documentos@fundacao193.org.br?subject=Solicitação%20LAI" className="inline-block px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-neutral-100 transition-colors" aria-label="Fazer solicitação LAI">
              Fazer Solicitação LAI
            </a>
          </div>
        </section>

        <section className="mt-12 bg-white rounded-2xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">Informações Adicionais</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-neutral-900 mb-2">Versões de Documentos</h4>
              <p className="text-neutral-600">
                Os documentos são atualizados regularmente. Consulte a data de publicação para garantir que você possui a versão mais recente.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-2">Acesso Restrito</h4>
              <p className="text-neutral-600">
                Alguns documentos requerem acesso restrito por motivos de segurança ou confidencialidade. Para acessá-los, entre em contato com o departamento responsável.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-2">Formatos Disponíveis</h4>
              <p className="text-neutral-600">
                Todos os documentos estão disponíveis em formato PDF. Documentos de grande volume podem ser solicitados em outros formatos.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 bg-neutral-100 rounded-xl p-6">
          <h4 className="font-bold text-neutral-900 mb-2">Precisa de ajuda?</h4>
          <p className="text-neutral-600 mb-2">Email: contato@fundacao193.org.br</p>
          <p className="text-neutral-600">Telefone: (61) 99382-3763</p>
        </div>
      </div>
    </div>
  );
}
