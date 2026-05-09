import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Loader } from 'lucide-react';
import { searchAll, SearchResults, getTypeLabel, type SearchResultItem } from '../services/search';

interface SearchBarProps {
  onResultClick?: () => void;
}

export default function SearchBar({ onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const shouldFocusOnOpenRef = useRef(false);

  // Escape key para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Realiza a busca com debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchAll(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Erro ao buscar:', error);
        setResults({ query, results: [], total: 0 });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Focus no input quando abre (especialmente no mobile)
  useEffect(() => {
    if (isOpen && !isClosing && inputRef.current && shouldFocusOnOpenRef.current) {
      shouldFocusOnOpenRef.current = false;
      inputRef.current.focus();
    }
  }, [isOpen, isClosing]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setQuery('');
      setResults(null);
    }, 200);
  };

  const handleResultClick = (result?: SearchResultItem) => {
    if (!result) {
      console.warn('Resultado vazio:', result);
      return;
    }

    const rawLink = (result.link || '').trim();
    let hashLink = '';

    if (rawLink.startsWith('#')) {
      hashLink = rawLink;
    } else if (rawLink.startsWith('http://') || rawLink.startsWith('https://')) {
      try {
        const url = new URL(rawLink);
        hashLink = url.hash || '';
      } catch {
        hashLink = '';
      }
    }

    if (!hashLink) {
      hashLink = `#${result.type}-${result.id}`;
    }

    
    // Fechar modal e navegar imediatamente
    window.location.hash = hashLink;
    handleClose();
    onResultClick?.();
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setLoading(false);
    inputRef.current?.focus();
  };

  // Retorna cor da badge por tipo
  const getTypeBadgeColor = (type: SearchResultItem['type']): string => {
    const colors: Record<SearchResultItem['type'], string> = {
      noticia: 'bg-badge-bg text-badge-text',
      projeto: 'bg-pink-100 text-pink-800',
      evento: 'bg-badge-event-bg text-badge-event-text',
      capacitacao: 'bg-purple-500 text-white',
      parceiro: 'bg-pink-500 text-white',
      pagina: 'bg-neutral-200 text-neutral-800',
    };
    return colors[type] || 'bg-neutral-500 text-white';
  };

  return (
    <div className="relative">
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeOutScale {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        .search-palette-enter {
          animation: fadeInScale 200ms ease-out forwards;
        }

        .search-palette-exit {
          animation: fadeOutScale 150ms ease-in forwards;
        }
      `}</style>

      {/* Botão ícone - Usa cor do tema */}
      <button
        onClick={() => {
          // Registra intenção de focar o input logo após abrir (melhor para mobile/iOS)
          shouldFocusOnOpenRef.current = true;
          setIsOpen(true);
        }}
        className={`p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center hover:bg-neutral-100 ${
          isOpen ? 'text-primary' : 'text-neutral-700 hover:text-institutional'
        }`}
        aria-label="Abrir busca"
        title="Busca (Press ⌘K)"
      >
        <Search size={20} />
      </button>

      {isOpen && typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
                isClosing ? 'opacity-0' : 'opacity-100'
              }`}
              onClick={handleClose}
            />

            {/* Command Palette Modal */}
            <div
              className={`fixed top-4 sm:top-[92px] left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-[60] w-auto sm:w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-92px-1rem)] ${
                isClosing ? 'search-palette-exit' : 'search-palette-enter'
              }`}
            >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-sm font-semibold text-neutral-900">Busca</span>
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium leading-none text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded-md"
              aria-label="Fechar busca"
              title="Fechar"
            >
              <X size={14} />
              Fechar
            </button>
          </div>

          {/* Input com borda arredondada e cor do tema */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 border-2 border-primary/30 rounded-lg focus-within:border-primary transition-colors">
              <Search size={18} className="flex-shrink-0 text-primary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar notícias, projetos, eventos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                // text-base (16px) evita zoom automático no iOS ao focar
                className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-base sm:text-sm"
                autoFocus={isOpen}
              />
              {loading && (
                <Loader size={18} className="flex-shrink-0 animate-spin text-primary" />
              )}
              {query && !loading && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-neutral-100 rounded flex-shrink-0"
                  aria-label="Limpar"
                >
                  <X size={16} className="text-neutral-600 hover:text-neutral-900" />
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div className="max-h-96 overflow-y-auto">
            {results && results.results.length > 0 ? (
              <div>
                {results.results.slice(0, 8).map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      handleResultClick(result);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors active:bg-neutral-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-neutral-900 line-clamp-1">
                          {result.title}
                        </div>
                        {result.excerpt && (
                          <div className="text-xs text-neutral-600 line-clamp-1 mt-0.5">
                            {result.excerpt}
                          </div>
                        )}
                      </div>
                      <span className={`inline-block text-xs font-semibold py-1 px-3 rounded-full flex-shrink-0 ${getTypeBadgeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                  </button>
                ))}

                {results.total > 8 && (
                  <div className="px-4 py-3 text-center text-xs text-neutral-600 bg-neutral-50">
                    +{results.total - 8} resultados. <a href={`#busca/${encodeURIComponent(query)}`} className="text-primary hover:underline" onClick={() => handleClose()}>Ver todos</a>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-600">
                Buscando...
              </div>
            ) : query ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-600">
                Nenhum resultado para "{query}"
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-neutral-600">
                Digite para buscar
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-neutral-200 px-4 py-2 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50">
            <span>Navegue com ↑↓ Enter para selecionar</span>
            <span>ESC para fechar</span>
          </div>
            </div>
          </>
          , document.body
        )}
    </div>
  );
}
