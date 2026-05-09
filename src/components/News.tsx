import { useEffect, useState, useMemo } from 'react';
import { Calendar, ArrowRight, AlertCircle, RotateCw, MapPin } from 'lucide-react';

import { fetchNoticias, fetchEventos } from '../services/api';
import type { news } from '../types/news';
import type { Event } from '../types/events';
import ImageWithPlaceholder from './ImageWithPlaceholder';

// Extract first image from HTML
function extractImageFromHtml(html?: string): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']?([^"'>\s]+)["']?/i);
  return m ? m[1] : null;
}

// Convert YMD to ISO for Date parsing
function ymdToIso(ymd?: string): string | null {
  if (!ymd) return null;
  if (/^\d{8}$/.test(ymd)) {
    return `${ymd.substring(0,4)}-${ymd.substring(4,6)}-${ymd.substring(6,8)}`;
  }
  return ymd;
}

export default function News() {
  const [newsItems, setNewsItems] = useState<news[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [n, e] = await Promise.all([fetchNoticias(), fetchEventos()]);
      setNewsItems(n);
      setEvents(e);
    } catch (err) {
      console.error(err);
      setError('Não conseguimos carregar as notícias no momento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mix news and events, show at least 1 of each, sort by date desc, max 3
  const mixedCards = useMemo(() => {
    const newsCards = newsItems.map((n) => ({
      id: `noticia-${n.id}`,
      type: 'news' as const,
      title: n.title.rendered,
      excerpt: n.excerpt.rendered,
      date: n.date,
      image: extractImageFromHtml(n.content?.rendered) || extractImageFromHtml(n.excerpt?.rendered) || null,
    }));

    const eventCards = events.map((ev) => ({
      id: `evento-${ev.id}`,
      type: 'event' as const,
      title: ev.title.rendered,
      excerpt: ev.acf?.event_summary || '',
      date: ymdToIso(ev.acf?.event_start_date) || '',
      location: ev.acf?.event_location || '',
      image: ev.acf?.event_featured_image || null,
    }));

    // Sort all by date desc
    const all = [...newsCards, ...eventCards].sort((a, b) => {
      const ad = new Date(a.date).getTime() || 0;
      const bd = new Date(b.date).getTime() || 0;
      return bd - ad;
    });

    // Ensure at least 1 news + 1 event, then fill remaining slots with most recent (3 total)
    const result: typeof all = [];
    const newsOnly = all.filter(c => c.type === 'news');
    const eventsOnly = all.filter(c => c.type === 'event');

    if (newsOnly.length > 0) result.push(newsOnly[0]);
    if (eventsOnly.length > 0) result.push(eventsOnly[0]);

    // Add remaining most recent items up to 3 total
    for (const item of all) {
      if (result.length >= 3) break;
      if (!result.find(r => r.id === item.id)) result.push(item);
    }

    return result;
  }, [newsItems, events]);

  useEffect(() => {
    mixedCards.forEach((item) => {
      if (!item.image) return;
      const img = new Image();
      img.src = item.image;
    });
  }, [mixedCards]);

  // Estados visuais basicos
  if (loading) {
    return (
      <section id="noticias" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-badge-text">
              <div className="w-2 h-2 bg-badge-text rounded-full animate-pulse"></div>
              <p className="text-sm font-medium">Carregando atividades...</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-neutral-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-neutral-200 rounded w-1/3" />
                  <div className="h-5 bg-neutral-200 rounded w-4/5" />
                  <div className="h-3 bg-neutral-200 rounded w-full" />
                  <div className="h-8 bg-neutral-200 rounded w-1/2 mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="noticias" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 flex items-center gap-4">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar notícias</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                onClick={loadData}
                aria-label="Recarregar notícias"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-white"
              >
                <RotateCw size={16} />
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="noticias" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>

            <div className="inline-block bg-badge-bg text-badge-text px-4 py-2 rounded-full text-sm font-semibold mb-4">Atividades</div>

            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Acompanhe nossas atividades
            </h2>
          </div>
          <a href="#atividades" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all hover:text-primary-hover" aria-label="Ver todas as atividades">
            Ver todas
            <ArrowRight size={20} />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {mixedCards.map((item) => (
            <article
              key={item.id}
              className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 card-anim flex flex-col"
            >
              <ImageWithPlaceholder
                src={item.image}
                alt={item.title.replace(/<[^>]*>/g, '')}
              />

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Calendar size={16} />
                    <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${item.type === 'news' ? 'bg-badge-bg text-badge-text' : 'bg-badge-event-bg text-badge-event-text'}`}>
                    {item.type === 'news' ? 'Notícia' : 'Evento'}
                  </span>
                </div>

                <h3
                  className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />

                <p
                  className="text-sm text-neutral-600 mb-4 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: item.excerpt }}
                />

                {item.type === 'event' && item.location && (
                  <div className="text-xs text-neutral-600 flex items-center gap-1 mb-4">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>
                )}

                <div className="flex-grow" />

                <a
                  href={`#${item.id}`}
                  aria-label={`${item.type === 'news' ? 'Leia' : 'Saiba'} mais sobre ${item.title.replace(/<[^>]*>/g, '')}`}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all hover:text-primary-hover"
                >
                  {item.type === 'news' ? 'Ler mais' : 'Saiba mais'}
                  <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <a href="#atividades" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all hover:text-primary-hover" aria-label="Ver todas as atividades">
            Ver todas
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
