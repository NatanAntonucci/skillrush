import { MouseEvent } from 'react';
import { ArrowRight, Heart } from 'lucide-react';

export default function Hero() {
  const handleScrollClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;

    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', href);
    }
  };

  return (
    <section id="inicio" className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.35),_transparent_35%),_radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.25),_transparent_40%)]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <Heart size={16} className="text-cyan-300" />
            <span className="text-sm font-medium text-white">Template Web Genérico</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Crie projetos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-400">
              modernos e escaláveis
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 mb-8 leading-relaxed">
            Base React + TypeScript + Vite pronta para ser adaptada em sites institucionais, landing pages e aplicações corporativas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#sobre"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/60 hover:scale-105"
              onClick={(event) => handleScrollClick(event, '#sobre')}
            >
              Sobre o template
              <ArrowRight size={20} />
            </a>
            <a
              href="#areas"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all shadow-md hover:shadow-xl hover:shadow-white/20 hover:scale-105"
              onClick={(event) => handleScrollClick(event, '#areas')}
            >
              Explore recursos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
