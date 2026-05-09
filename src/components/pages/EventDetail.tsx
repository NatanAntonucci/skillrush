import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowLeft, Calendar, MapPin, ChevronRight, ExternalLink } from 'lucide-react';
import { fetchEvento } from '../../services/api';
import type { Event } from '../../types/events';
import DetailLayout from '../DetailLayout';
import ImageGallery from '../ImageGallery';
import ShareButtons from '../ShareButtons';

interface Props { id: number }

// Extrai todas as imagens do HTML
function extractImagesFromHtml(html: string): string[] {
  const imgRegex = /<img[^>]+src=["']?([^"'>\s]+)["']?[^>]*>/gi;
  const matches: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

// Remove imagens do HTML
function removeImagesFromHtml(html: string): string {
  return html.replace(/<img[^>]*>/gi, '');
}

function parseYmdToDateStr(ymd?: string): string | null {
  if (!ymd) return null;
  if (/^\d{8}$/.test(ymd)) {
    const year = Number(ymd.substring(0,4));
    const month = Number(ymd.substring(4,6)) - 1;
    const day = Number(ymd.substring(6,8));
    return new Date(year, month, day, 12,0,0).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
  try {
    return new Date(ymd).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function EventDetail({ id }: Props) {
  const [item, setItem] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvento(id);
        setItem(data);
      } catch (err) {
        console.error(err);
        setError('Não conseguimos carregar o evento.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Processa conteúdo: extrai imagens e limpa HTML
  const { galleryImages, cleanContent } = useMemo(() => {
    if (!item) return { galleryImages: [], cleanContent: '' };

    const contentHtml = item.content?.rendered || '';
    const images = extractImagesFromHtml(contentHtml);
    
    return {
      galleryImages: images,
      cleanContent: removeImagesFromHtml(contentHtml),
    };
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-primary mb-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div
              className="w-3 h-3 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="w-3 h-3 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
          <p className="text-sm font-medium text-neutral-600">
            Carregando evento...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-red-600 mb-4">{error || 'Evento não encontrado'}</div>
          <button
            onClick={() => window.location.hash = '#eventos'}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para eventos
          </button>
        </div>
      </div>
    );
  }

  const start = parseYmdToDateStr(item.acf.event_start_date);
  const end = parseYmdToDateStr(item.acf.event_end_date);
  const currentUrl = window.location.href;
  const title = item.title.rendered.replace(/<[^>]*>/g, '');
  const heroImage = item.acf.event_featured_image;

  return (
    <DetailLayout
      titleHtml={item.title.rendered}
      meta={(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 border-b border-neutral-200">
          {start && (
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Calendar size={24} className="text-primary flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                  Data{end ? 's' : ''}
                </div>
                <div className="text-neutral-900 font-semibold">
                  {start}
                  {end && end !== start && (
                    <>
                      <br />
                      <span className="text-sm text-neutral-600">até {end}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {item.acf.event_location && (
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <MapPin size={24} className="text-primary flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                  Local
                </div>
                <div className="text-neutral-900 font-semibold">
                  {item.acf.event_location}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      featuredImage={heroImage ? { src: heroImage, alt: title } : undefined}
    >
      {item.acf.event_summary && (
        <div className="mb-8">
          <div 
            className="text-lg text-neutral-700 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: item.acf.event_summary }}
          />
        </div>
      )}

      {cleanContent && (
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-neutral-900 prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-neutral-900 prose-strong:font-semibold
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-neutral-700 prose-li:my-2
            prose-blockquote:border-l-4 prose-blockquote:border-primary
            prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6
            prose-blockquote:italic prose-blockquote:text-neutral-700"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      )}

      {item.acf.event_registration_url && (
        <div className="mt-8 p-6 bg-gradient-to-r from-primary to-primary-hover rounded-xl text-center shadow-lg">
          <p className="text-white font-medium mb-4">
            Não perca essa oportunidade!
          </p>
          <a
            href={item.acf.event_registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-neutral-100 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-white text-lg"
          >
            Inscreva-se agora
            <ExternalLink size={20} />
          </a>
        </div>
      )}

      {galleryImages.length > 0 && (
        <ImageGallery images={galleryImages} />
      )}

      <ShareButtons url={currentUrl} title={title} />

      <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
        <h3 className="text-xl font-bold text-neutral-900 mb-3">
          Fique por dentro dos nossos eventos
        </h3>
        <p className="text-neutral-700 mb-6">
          Keep up with our calendar and participate in our initiatives.
        </p>
        <button
          onClick={() => window.location.hash = '#eventos'}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          Ver todos os eventos
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200">
        <button
          onClick={() => window.location.hash = '#eventos'}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          <ArrowLeft size={20} />
          Ver todos os eventos
        </button>
      </div>
    </DetailLayout>
  );
}
