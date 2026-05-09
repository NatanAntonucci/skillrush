import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { searchAll, SearchResults, getTypeLabel, type SearchResultItem } from '../../services/search';
import { COLORS } from '../../constants/ui';

interface SearchPageProps {
  query?: string;
}

export default function SearchPage({ query }: SearchPageProps) {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setError('Digite um termo válido para buscar (mínimo 2 caracteres)');
      setLoading(false);
      return;
    }

    async function loadResults() {
      try {
        setLoading(true);
        setError(null);
        if (!query) {
          setError('Digite um termo válido para buscar (mínimo 2 caracteres)');
          setLoading(false);
          return;
        }
        const searchResults = await searchAll(query);
        setResults(searchResults);
      } catch (err) {
        setError('Erro ao buscar resultados. Tente novamente.');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [query]);

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'noticia':
        return '#3b82f6'; // blue
      case 'projeto':
        return '#10b981'; // green
      case 'evento':
        return '#f59e0b'; // amber
      case 'capacitacao':
        return '#8b5cf6'; // purple
      case 'parceiro':
        return '#ec4899'; // pink
      default:
        return COLORS.primary;
    }
  };

  const handleResultClick = (link?: string) => {
    if (link) {
      window.location.hash = link;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header com botão voltar */}
        <button
          onClick={() => (window.location.hash = '')}
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
            Resultados da busca
          </h1>
          {query && (
            <p className="text-lg text-neutral-600">
              Para: <span className="text-primary font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {/* Estado: Carregando */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div
                className="h-8 w-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"
              />
            </div>
            <p className="text-neutral-600 mt-4">Buscando...</p>
          </div>
        )}

        {/* Estado: Erro */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Estado: Nenhum resultado */}
        {!loading && results && results.results.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <MapPin className="mx-auto mb-4 text-blue-600" size={40} />
            <p className="text-lg text-neutral-700">
              Nenhum resultado encontrado para <strong>"{query}"</strong>
            </p>
            <p className="text-neutral-600 mt-2">Tente usar outros termos de busca</p>
          </div>
        )}

        {/* Resultados */}
        {!loading && results && results.results.length > 0 && (
          <div>
            <p className="text-neutral-600 mb-6">
              {results.total} resultado{results.total !== 1 ? 's' : ''} encontrado{results.total !== 1 ? 's' : ''}
            </p>

            <div className="space-y-4">
              {results.results.map((result: SearchResultItem) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.link)}
                  className="block w-full text-left bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badge de tipo */}
                      <div className="inline-block">
                        <span
                          className="text-xs font-semibold text-white px-3 py-1 rounded-full mb-2"
                          style={{ backgroundColor: getTypeColor(result.type) }}
                        >
                          {getTypeLabel(result.type)}
                        </span>
                      </div>

                      {/* Título */}
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mt-2 mb-2 line-clamp-2">
                        {result.title}
                      </h3>

                      {/* Excerpt */}
                      {result.excerpt && (
                        <p className="text-neutral-600 text-sm sm:text-base line-clamp-3">
                          {result.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Imagem (se houver) */}
                    {result.image && (
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
