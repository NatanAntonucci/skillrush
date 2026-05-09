import { Shield, Target, Eye } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function About() {
  const { elementRef, isVisible } = useScrollAnimation(0.15);

  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={elementRef} className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="inline-block bg-badge-bg text-badge-text px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Quem Somos
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">
              Template React + Vite pronto para novos projetos
            </h2>
            <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
              Esta estrutura serve como ponto de partida para sites modernos, responsivos e fáceis de personalizar.
            </p>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              Inclui navegação, componentes reutilizáveis e uma hierarquia de seções criada para acelerar entregas de frontend.
            </p>
            <a
              href="#areas"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all hover:text-primary-hover"
            >
              Veja como funciona
              <span>→</span>
            </a>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-100 flex items-center justify-center">
              <div className="text-center px-6 py-10">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">Placeholder</p>
                <h3 className="text-2xl font-semibold text-slate-900">Imagem Genérica</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Substitua por uma imagem ou ilustração que represente seu projeto.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-xl shadow-xl">
              <p className="text-4xl font-bold mb-1">Fast</p>
              <p className="text-sm">Layout pronto</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className={`bg-neutral-50 p-8 rounded-xl hover:shadow-lg transition-all ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: isVisible ? '50ms' : '0ms', transitionDuration: '600ms' }}>
            <div className="w-14 h-14 bg-icon-bg rounded-lg flex items-center justify-center mb-4">
              <Target className="text-icon-fg" size={28} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Missão</h3>
            <p className="text-neutral-600 leading-relaxed">
              Fornecer uma base de frontend moderna e escalável para projetos web comerciais e institucionais.
            </p>
          </div>

          <div className={`bg-neutral-50 p-8 rounded-xl hover:shadow-lg transition-all ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: isVisible ? '100ms' : '0ms', transitionDuration: '600ms' }}>
            <div className="w-14 h-14 bg-icon-bg rounded-lg flex items-center justify-center mb-4">
              <Eye className="text-icon-fg" size={28} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Visão</h3>
            <p className="text-neutral-600 leading-relaxed">
              Ser a escolha ideal para iniciar projetos rápidos com design profissional e performance otimizada.
            </p>
          </div>

          <div className={`bg-neutral-50 p-8 rounded-xl hover:shadow-lg transition-all ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: isVisible ? '150ms' : '0ms', transitionDuration: '600ms' }}>
            <div className="w-14 h-14 bg-icon-bg rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-icon-fg" size={28} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Valores</h3>
            <p className="text-neutral-600 leading-relaxed">
              Simplicidade, flexibilidade, performance e boa experiência para desenvolvedores e usuários finais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
