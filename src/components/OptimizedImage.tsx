import { ImgHTMLAttributes, useState } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Nome do arquivo sem extensão (ex: 'HeroImgLine') */
  imageName: string;
  /** Alt text para acessibilidade */
  alt: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Width em pixels ou CSS (ex: '100%', '400px') */
  width?: string | number;
  /** Height em pixels ou CSS (ex: 'auto', '300px') */
  height?: string | number;
  /** Callback quando a imagem carregar */
  onLoad?: () => void;
  /** Callback quando houver erro */
  onError?: () => void;
}

/**
 * Componente de imagem otimizada com suporte a WebP e fallback para JPG/PNG
 * Usa <picture> para carregar WebP em navegadores compatíveis
 */
export default function OptimizedImage({
  imageName,
  alt,
  className = '',
  width,
  height,
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  // Importação dinâmica não funciona bem com Vite, então vamos usar caminhos absolutos
  const webpSrc = `/images/${imageName}.webp`;
  const fallbackSrc = `/images/${imageName}.jpg`;

  if (hasError) {
    return (
      <div className={`bg-neutral-100 flex items-center justify-center ${className}`} style={{ width, height }}>
        <img
          src="/logo-reduzida.png"
          alt="Organization Logo"
          className="h-12 w-auto opacity-50"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <picture>
      {/* WebP source para navegadores compatíveis */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* Fallback JPG para navegadores antigos */}
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </picture>
  );
}
