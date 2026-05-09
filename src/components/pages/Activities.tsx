import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Calendar, ArrowRight, MapPin } from 'lucide-react';
import { fetchNoticias, fetchEventos, fetchProjetos } from '../../services/api';
import type { news } from '../../types/news';
import type { Event } from '../../types/events';
import type { Project } from '../../types/projects';
import ImageWithPlaceholder from '../ImageWithPlaceholder';

type Filter = 'all' | 'news' | 'events' | 'projects';

// Helper to extract first image src from HTML string
function extractImageFromHtml(html?: string): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']?([^"'>\s]+)["']?/i);
  return m ? m[1] : null;
}

// Convert YMD "YYYYMMDD" to ISO "YYYY-MM-DD" for Date parsing
function ymdToIso(ymd?: string): string | null {
  if (!ymd) return null;
  if (/^\d{8}$/.test(ymd)) {
    return `${ymd.substring(0,4)}-${ymd.substring(4,6)}-${ymd.substring(6,8)}`;
  }
  return ymd;
}

export default function Activities() {
  const [newsItems, setNewsItems] = useState<news[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [anim, setAnim] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const preloadCount = 6;
  const animTimer = useRef<number | null>(null);

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [n, e, p] = await Promise.all([fetchNoticias(), fetchEventos(), fetchProjetos()]);
        setNewsItems(n);
        setEvents(e);
        setProjects(p);
      } catch (err) {
        console.error(err);
        setError('Não conseguimos carregar as atividades no momento.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const items = useMemo(() => {
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
      date: ymdToIso(ev.acf?.event_start_date) || ev.date || '',
      location: ev.acf?.event_location || '',
      image: ev.acf?.event_featured_image || null,
    }));

    const projectCards = projects.map((p) => ({
      id: `projeto-${p.id}`,
      type: 'project' as const,
      title: p.title.rendered,
      excerpt: p.excerpt?.rendered || '',
      date: ymdToIso(p.acf?.project_start_date) || '',
      image: p.acf?.project_featured_image || null,
    }));

    const all = [...newsCards, ...eventCards, ...projectCards].sort((a, b) => {
      const ad = new Date(a.date).getTime() || 0;
      const bd = new Date(b.date).getTime() || 0;
      return bd - ad;
    });

    if (filter === 'news') return all.filter(i => i.type === 'news');
    if (filter === 'events') return all.filter(i => i.type === 'event');
    if (filter === 'projects') return all.filter(i => i.type === 'project');
    return all;
  }, [newsItems, events, projects, filter]);

  useEffect(() => {
    const targets = items.slice(0, preloadCount);
    targets.forEach((item) => {
      if (!item.image) return;
      const img = new Image();
      img.src = item.image;
    });
  }, [items, preloadCount]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
    triggerAnim();
  }, [filter, triggerAnim]);

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

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 text-primary mb-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-sm font-medium text-neutral-600">Carregando atividades...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen py-20 bg-white"><div className="max-w-6xl mx-auto px-4 text-center text-red-600">{error}</div></div>
  );

  return (
    <div className="min-h-screen py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {}
        <div className="mb-6">
          <button
            onClick={() => (window.location.hash = '')}
            className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
            aria-label="Voltar para a página inicial"
          >
            <ArrowRight size={16} className="rotate-180" />
            Voltar
          </button>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Acompanhe nossas atividades</h1>
            <p className="text-neutral-600 mt-2">Filtre por tipo clicando nos rótulos abaixo.</p>

            <div className="mt-4 inline-flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out ${filter === 'all' ? 'bg-primary text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-sm'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('news')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out ${filter === 'news' ? 'bg-badge-bg text-badge-text shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-sm'}`}
              >
                Notícias
              </button>
              <button
                onClick={() => setFilter('events')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out ${filter === 'events' ? 'bg-badge-event-bg text-badge-event-text shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-sm'}`}
              >
                Eventos
              </button>
              <button
                onClick={() => setFilter('projects')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out ${filter === 'projects' ? 'bg-pink-100 text-pink-800 shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-sm'}`}
              >
                Projetos
              </button>
            </div>
          </div>
        </div>

        <div className={`grid md:grid-cols-3 gap-8 ${anim ? 'animate-fade-in-up' : ''}`} key={filter}>
          {pagedItems.map((it) => (
            <article key={it.id} className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 card-anim flex flex-col">
              <ImageWithPlaceholder
                src={it.image}
                alt={it.title.replace(/<[^>]*>/g, '')}
              />
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-neutral-500 inline-flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{it.date ? new Date(it.date).toLocaleDateString('pt-BR') : 'Data a definir'}</span>
                  </div>

                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                    it.type === 'news' ? 'bg-badge-bg text-badge-text' : 
                    it.type === 'event' ? 'bg-badge-event-bg text-badge-event-text' : 
                    'bg-pink-100 text-pink-800'
                  }`}>
                    {it.type === 'news' ? 'Notícia' : it.type === 'event' ? 'Evento' : 'Projeto'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-neutral-900 mb-3" dangerouslySetInnerHTML={{ __html: it.title }} />
                <p className="text-neutral-600 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: it.excerpt }} />

                {it.type === 'event' && it.location && (
                  <div className="mb-4 text-sm text-neutral-600 flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{it.location}</span>
                  </div>
                )}

                <div className="flex-grow" />

                <a href={`#${it.id}`} className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all" aria-label={`Leia mais sobre ${it.title.replace(/<[^>]*>/g, '')}`}>
                  {it.type === 'news' ? 'Ler mais' : it.type === 'event' ? 'Saiba mais' : 'Ver projeto'}
                  <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="px-4 py-2 rounded bg-neutral-100" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
          <span className="text-neutral-500">Página {page} de {totalPages}</span>
          <button className="px-4 py-2 rounded bg-neutral-100" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</button>
        </div>
      </div>
    </div>
  );
}
