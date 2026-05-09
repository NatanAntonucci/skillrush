import { Share2, Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-t border-neutral-200">
      <div className="flex items-center gap-2 text-neutral-700 font-medium">
        <Share2 size={20} />
        <span>Compartilhar:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#0c63d4] transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-[#1877F2]"
          aria-label="Compartilhar no Facebook"
        >
          <Facebook size={18} fill="currentColor" />
          <span className="text-sm font-medium hidden sm:inline">Facebook</span>
        </a>

        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-black"
          aria-label="Compartilhar no Twitter"
        >
          <Twitter size={18} fill="currentColor" />
          <span className="text-sm font-medium hidden sm:inline">Twitter</span>
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-[#0A66C2]"
          aria-label="Compartilhar no LinkedIn"
        >
          <Linkedin size={18} fill="currentColor" />
          <span className="text-sm font-medium hidden sm:inline">LinkedIn</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-neutral-400"
          aria-label="Copiar link"
        >
          {copied ? (
            <>
              <Check size={18} className="text-green-600" />
              <span className="text-sm font-medium text-green-600">Copiado!</span>
            </>
          ) : (
            <>
              <Link2 size={18} />
              <span className="text-sm font-medium hidden sm:inline">Copiar link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
