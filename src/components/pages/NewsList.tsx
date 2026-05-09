import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Calendar, ArrowRight, ChevronDown, Check } from 'lucide-react';

import { fetchNoticiasByCategories, fetchNoticiasCategories } from '../../services/api';
import type { news } from '../../types/news';
import ImageWithPlaceholder from '../ImageWithPlaceholder';

// Cores específicas por categoria ID (matching versão legada)
const CATEGORY_COLORS_MAP: Record<number, string> = {
  15: 'bg-red-100 text-red-900',          // Incêndio - Vermelho
  23: 'bg-amber-100 text-amber-900',      // Datas Comemorativas - Ouro/Amarelo
  26: 'bg-blue-100 text-blue-900',        // História - Azul escuro
  13: 'bg-green-100 text-green-900',      // Meio Ambiente - Verde
  22: 'bg-purple-100 text-purple-900',    // Educação Financeira - Púrpura
  20: 'bg-orange-100 text-orange-900',    // Eventos - Laranja
  25: 'bg-teal-100 text-teal-900',        // Projetos - Teal
  1: 'bg-gray-100 text-gray-900',         // Uncategorized - Cinza
};

// Cores fallback para categorias não mapeadas
const CATEGORY_COLORS_FALLBACK = [
  'bg-red-100 text-red-900',
  'bg-blue-100 text-blue-900',
  'bg-green-100 text-green-900',
  'bg-amber-100 text-amber-900',
  'bg-purple-100 text-purple-900',
  'bg-pink-100 text-pink-900',
  'bg-teal-100 text-teal-900',
  'bg-orange-100 text-orange-900',
] as const;

type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

function getCategoryColor(id: number) {
  return CATEGORY_COLORS_MAP[id] || CATEGORY_COLORS_FALLBACK[id % CATEGORY_COLORS_FALLBACK.length];
}

// Extract first image URL from HTML
function extractImageFromHtml(html?: string): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']?([^"'>\s]+)["']?/i);
  return m ? m[1] : null;
}

export default function NewsList() {
  const [items, setItems] = useState<(news & { category_ids: number[] })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const preloadCount = 6;
  const hasFetched = useRef(false);
  const [anim, setAnim] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const animTimer = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const triggerAnim = useCallback(() => {
    setAnim(true);
    if (animTimer.current) {
      window.clearTimeout(animTimer.current);
      animTimer.current = null;
    }
    animTimer.current = window.setTimeout(() => {
      setAnim(false);
      animTimer.current = null;
    }, 500);
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await fetchNoticiasCategories();
      setCategories(cats);
      const data = await fetchNoticiasByCategories(cats.map((cat) => String(cat.id)));
      setItems(data);
    } catch (err) {
      console.error(err);
      setError('Não conseguimos carregar as notícias no momento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    load();
  }, []);

  const preparedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      imageUrl: extractImageFromHtml(item.content?.rendered),
    }));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return preparedItems;
    return preparedItems.filter((item) => item.category_ids.includes(selectedCategory));
  }, [preparedItems, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    preparedItems.forEach((item) => {
      item.category_ids.forEach((catId) => {
        const key = String(catId);
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return counts;
  }, [preparedItems]);

  useEffect(() => {
    const targets = preparedItems.slice(0, preloadCount);
    targets.forEach((item) => {
      if (!item.imageUrl) return;
      const img = new Image();
      img.src = item.imageUrl;
    });
  }, [preparedItems, preloadCount]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
    triggerAnim();
  }, [selectedCategory, triggerAnim]);

  useEffect(() => {
    triggerAnim();
  }, [page, triggerAnim]);

  useEffect(() => {
    return () => {
      if (animTimer.current) {
        window.clearTimeout(animTimer.current);
        animTimer.current = null;
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category: number | 'all') => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const getCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Todas as categorias';
    const match = categories.find((cat) => cat.id === selectedCategory);
    return match?.name || 'Categoria';
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 text-primary mb-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-sm font-medium text-neutral-600">Carregando notícias...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => (window.location.hash = '')}
            className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
            aria-label="Voltar para a página inicial"
          >
            <ArrowRight size={16} className="rotate-180" />
            Voltar
          </button>
        </div>

        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Todas as Notícias</h1>
          <p className="text-neutral-600 mb-6">Filtre por tema para encontrar o que procura</p>

          {/* Custom Dropdown com animação */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-3 bg-gradient-to-br from-neutral-50 to-neutral-100 px-6 py-4 rounded-xl border-2 border-neutral-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Filtrar por tema</span>
                <span className="text-base font-semibold text-neutral-900">{getCategoryLabel()}</span>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-primary ml-2 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl border-2 border-neutral-200 shadow-2xl z-50 animate-fade-in-up overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {/* Todas as categorias */}
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                      selectedCategory === 'all' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span className="font-medium text-neutral-900">Todas as categorias</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-semibold bg-neutral-100 px-2 py-1 rounded-full">
                        {items.length}
                      </span>
                      {selectedCategory === 'all' && <Check size={16} className="text-primary" />}
                    </div>
                  </button>

                  <div className="border-t border-neutral-200" />

                  {/* Categorias específicas */}
                  {categories.map((cat) => {
                    if (cat.slug === 'blog' || cat.slug === 'diversos') return null;
                    const count = categoryCounts[String(cat.id)] || 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                          selectedCategory === cat.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-block w-3 h-3 rounded-full ${getCategoryColor(cat.id).split(' ')[0]}`} />
                          <span className="font-medium text-neutral-900">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 font-semibold bg-neutral-100 px-2 py-1 rounded-full">
                            {count}
                          </span>
                          {selectedCategory === cat.id && <Check size={16} className="text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`grid md:grid-cols-3 gap-8 ${anim ? 'animate-fade-in-up' : ''}`}>
          {pagedItems.map((item) => {
            return (
              <article key={item.id} className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 card-anim flex flex-col">
                <ImageWithPlaceholder
                  src={item.imageUrl}
                  alt={item.title.rendered.replace(/<[^>]*>/g, '')}
                />

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Calendar size={16} />
                      <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {(() => {
                        // Remove Blog (14) e Diversos (18) das tags
                        let displayCats = item.category_ids.filter(id => id !== 14 && id !== 18);
                        
                        // Se ainda tiver mais de 2, limita a 2
                        displayCats = displayCats.slice(0, 2);
                        
                        return displayCats.map((catId) => {
                          const catInfo = categories.find((cat) => cat.id === catId);
                          if (!catInfo) return null;
                          return (
                            <span key={catId} className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(catId)}`}>
                              {catInfo.name}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <h3 
                    className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors line-clamp-2" 
                    dangerouslySetInnerHTML={{ __html: item.title.rendered }} 
                  />

                  <div 
                    className="text-neutral-600 mb-4 text-sm line-clamp-3" 
                    dangerouslySetInnerHTML={{ __html: item.excerpt.rendered }} 
                  />

                  <div className="flex-grow" />

                  <a
                    href={`#noticia-${item.id}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all mt-4"
                    aria-label={`Leia mais sobre ${item.title.rendered.replace(/<[^>]*>/g, '')}`}
                  >
                    Ler mais
                    <ArrowRight size={16} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">Nenhuma notícia encontrada neste tema.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredItems.length > pageSize && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button 
              className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="text-sm text-neutral-600 font-medium">Página {page} de {totalPages}</span>
            <button 
              className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
