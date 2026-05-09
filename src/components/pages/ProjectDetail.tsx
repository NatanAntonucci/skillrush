import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { fetchProjeto } from '../../services/api';
import type { Project } from '../../types/projects';
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

export default function ProjectDetail({ id }: Props) {
  const [item, setItem] = useState<Project | null>(null);
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
        const data = await fetchProjeto(id);
        setItem(data);
      } catch (err) {
        console.error(err);
        setError('Não conseguimos carregar o projeto.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Processa conteúdo: extrai imagens e limpa HTML
  const { galleryImages, cleanContent } = useMemo(() => {
    if (!item) return { galleryImages: [], cleanContent: '' };

    // Prioriza galeria ACF se existir
    if (item.acf?.project_gallery && Array.isArray(item.acf.project_gallery)) {
      const acfImages = item.acf.project_gallery
        .map(img => typeof img === 'object' && img.url ? img.url : '')
        .filter(Boolean);
      
      if (acfImages.length > 0) {
        return {
          galleryImages: acfImages,
          cleanContent: item.content?.rendered || item.excerpt?.rendered || '',
        };
      }
    }

    // Fallback: extrai imagens do conteúdo HTML
    const contentHtml = item.content?.rendered || item.excerpt?.rendered || '';
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
            Carregando projeto...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-red-600 mb-4">{error || 'Projeto não encontrado'}</div>
          <button
            onClick={() => window.location.hash = '#projetos'}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para projetos
          </button>
        </div>
      </div>
    );
  }

  const currentUrl = window.location.href;
  const title = item.title.rendered.replace(/<[^>]*>/g, '');
  const heroImage = item.acf?.project_featured_image;

  return (
    <DetailLayout
      titleHtml={item.title.rendered}
      featuredImage={heroImage ? { src: heroImage, alt: title } : undefined}
    >
      {item.acf?.impacto && (
        <div className="mb-8 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border-l-4 border-primary shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-primary/20 rounded-lg">
              <TrendingUp size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
                Impacto do Projeto
              </h3>
              <p className="text-lg font-semibold text-neutral-900 leading-relaxed">
                {item.acf.impacto}
              </p>
            </div>
          </div>
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

      {galleryImages.length > 0 && (
        <ImageGallery images={galleryImages} />
      )}

      <ShareButtons url={currentUrl} title={title} />

      <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
        <h3 className="text-xl font-bold text-neutral-900 mb-3">
          Apoie nossos projetos
        </h3>
        <p className="text-neutral-700 mb-6">
          Sua colaboração é essencial para levarmos mais iniciativas como esta para a comunidade. Faça parte da transformação!
        </p>
        <a
          href="#colabore"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          Como colaborar
          <ChevronRight size={20} />
        </a>
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200">
        <button
          onClick={() => window.location.hash = '#projetos'}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          <ArrowLeft size={20} />
          Ver todos os projetos
        </button>
      </div>
    </DetailLayout>
  );
}
