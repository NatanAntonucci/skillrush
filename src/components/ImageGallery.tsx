import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  if (images.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    const newIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedIndex(newIndex);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    const newIndex = (selectedIndex + 1) % images.length;
    setSelectedIndex(newIndex);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  // Grid responsivo baseado na quantidade de imagens
  const gridClass = images.length === 1 
    ? 'grid-cols-1' 
    : images.length === 2 
    ? 'grid-cols-2' 
    : 'grid-cols-2 md:grid-cols-3';

  return (
    <>
      <div className="mt-12 mb-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">
          Galeria de Imagens
        </h3>
        <div className={`grid ${gridClass} gap-4`}>
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-video overflow-hidden rounded-lg group cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              aria-label={`Ver imagem ${index + 1} em tamanho real`}
            >
              {/* Placeholder */}
              {!loadedImages.has(index) && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <img
                    src="/logo-reduzida.png"
                    alt="Organization Logo"
                    className="h-8 w-auto"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              
              <img
                src={img}
                alt={`Imagem ${index + 1}`}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  loadedImages.has(index)
                    ? 'opacity-100 group-hover:scale-110'
                    : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
                onLoad={() => handleImageLoad(index)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de imagem"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 hover:scale-110 focus:outline-2 focus:outline-offset-2 focus:outline-white z-[10000]"
            aria-label="Fechar visualizador"
          >
            <X size={28} className="text-white drop-shadow-lg" strokeWidth={2.5} />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-white"
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={32} className="text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-white"
                aria-label="Próxima imagem"
              >
                <ChevronRight size={32} className="text-white" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Main Image */}
          <img
            src={images[selectedIndex]}
            alt={`Imagem ${selectedIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
}
