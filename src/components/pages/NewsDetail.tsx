import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';
import { fetchNoticia } from '../../services/api';
import type { news } from '../../types/news';
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

// Remove imagens do HTML (para não duplicar no conteúdo)
function removeImagesFromHtml(html: string): string {
  return html.replace(/<img[^>]*>/gi, '');
}

// Calcula tempo estimado de leitura
function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}

export default function NewsDetail({ id }: Props) {
  const [item, setItem] = useState<news | null>(null);
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
        const data = await fetchNoticia(id);
        setItem(data);
      } catch (err) {
        console.error(err);
        setError('Não conseguimos carregar a notícia.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Processa conteúdo: extrai imagens e limpa HTML
  const { heroImage, galleryImages, cleanContent, readingTime } = useMemo(() => {
    if (!item) return { heroImage: null, galleryImages: [], cleanContent: '', readingTime: 0 };

    const contentHtml = item.content?.rendered || item.excerpt.rendered || '';
    const images = extractImagesFromHtml(contentHtml);
    
    return {
      heroImage: images[0] || null,
      galleryImages: images.slice(1), // Galeria com todas menos a primeira
      cleanContent: removeImagesFromHtml(contentHtml),
      readingTime: estimateReadingTime(contentHtml),
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
            Carregando notícia...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-red-600 mb-4">{error || 'Notícia não encontrada'}</div>
          <button
            onClick={() => window.location.hash = '#noticias'}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para notícias
          </button>
        </div>
      </div>
    );
  }

  const currentUrl = window.location.href;
  const title = item.title.rendered.replace(/<[^>]*>/g, '');

  return (
    <DetailLayout
      titleHtml={item.title.rendered}
      meta={(
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 pb-8 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <time dateTime={item.date}>
              {new Date(item.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span>{readingTime} min de leitura</span>
          </div>
        </div>
      )}
      featuredImage={heroImage ? { src: heroImage, alt: title } : undefined}
    >
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

      {galleryImages.length > 0 && (
        <ImageGallery images={galleryImages} />
      )}

      <ShareButtons url={currentUrl} title={title} />

      <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
        <h3 className="text-xl font-bold text-neutral-900 mb-3">
          Gostou dessa notícia?
        </h3>
        <p className="text-neutral-700 mb-6">
          Be part of the transformation! Collaborate with us and help support our mission.
        </p>
        <a
          href="#colabore"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          Saiba como colaborar
          <ChevronRight size={20} />
        </a>
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200">
        <button
          onClick={() => window.location.hash = '#noticias'}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          <ArrowLeft size={20} />
          Ver todas as notícias
        </button>
      </div>
    </DetailLayout>
  );
}
