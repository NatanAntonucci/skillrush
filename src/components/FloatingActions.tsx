import { Instagram, MessageCircle, Volume2, VolumeX, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
// import LogoMuseu from '../assets/images/logo.png';

export default function FloatingActions() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  const handleToggle = () => {
    if (isExpanded) {
      // animação de saída antes de esconder
      setIsClosing(true);
      setTimeout(() => {
        setIsExpanded(false);
        setIsClosing(false);
      }, 200); // precisa combinar com a duração da animação de saída
    } else {
      setIsExpanded(true);
    }
  };

  const showItems = isExpanded || isClosing;

  return (
    <div className="fixed left-6 bottom-6 z-40 flex flex-col items-start gap-3">
      <audio
        ref={audioRef}
        src="https://radio2.cbm.df.gov.br/;stream.mp3"
        preload="none"
        crossOrigin="anonymous"
      />

      {showItems && (
        <>
          <a
            href="https://museu.cbm.df.gov.br/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 bg-white text-neutral-900 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 fab-item ${isClosing ? 'fab-item-close' : 'fab-item-open'}`}
            style={{ animationDelay: '0s' }}
          >
            <img
              src={LogoMuseu}
              alt="Organization Logo"
              className="w-7 h-7 rounded-full object-contain"
            />
            <span className="text-sm font-semibold whitespace-nowrap text-sm">Museu do Fogo</span>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 fab-item ${isClosing ? 'fab-item-close' : 'fab-item-open'}`}
            style={{ animationDelay: '0.05s' }}
          >
            <span className="text-sm font-semibold whitespace-nowrap">Instagram</span>
            <Instagram size={20} />
          </a>

          <a
            href="https://wa.me/5561993823763"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 fab-item ${isClosing ? 'fab-item-close' : 'fab-item-open'}`}
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-sm font-semibold whitespace-nowrap">WhatsApp</span>
            <MessageCircle size={20} />
          </a>

          <button
            onClick={toggleRadio}
            className={`flex items-center gap-3 ${
              isMuted ? 'bg-neutral-600' : 'bg-blue-600'
            } text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 fab-item ${isClosing ? 'fab-item-close' : 'fab-item-open'}`}
            style={{ animationDelay: '0.15s' }}
            title={isMuted ? 'Ativar Rádio' : 'Desativar Rádio'}
          >
            <span className="text-sm font-semibold whitespace-nowrap">Rádio</span>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </>
      )}

      <button
        onClick={handleToggle}
        className={`bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-[100]
        transform transition-all duration-500 ease-out
        hover:scale-110 hover:shadow-2xl hover:-translate-y-1
        active:scale-95
        ${
          isExpanded
            ? 'bg-neutral-600 hover:bg-neutral-700'
            : 'bg-primary hover:bg-primary-dark'
        }`}
        aria-label={isExpanded ? 'Fechar ações flutuantes' : 'Abrir ações flutuantes'}
      >
        {isExpanded ? (
          <span className="text-2xl leading-none font-bold">✕</span>
        ) : (
          <Plus className="w-6 h-6 block" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
