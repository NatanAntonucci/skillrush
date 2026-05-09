import { useState } from 'react';

type ImageWithPlaceholderProps = {
  src?: string | null;
  alt: string;
  containerClassName?: string;
  width?: string | number;
  height?: string | number;
};

export default function ImageWithPlaceholder({
  src,
  alt,
  containerClassName = 'aspect-[16/10]',
  width,
  height,
}: ImageWithPlaceholderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;
  const showPlaceholder = !showImage || !isLoaded;

  return (
    <div 
      className={`${containerClassName} relative overflow-hidden bg-white`}
      style={{ width, height }}
    >
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <img
            src="/logo-reduzida.png"
            alt="Organization Logo"
            className="h-12 w-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {showImage && (
        <img
          src={src!}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
