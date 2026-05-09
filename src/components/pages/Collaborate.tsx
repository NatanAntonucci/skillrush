import { ArrowLeft, Heart, QrCode } from 'lucide-react';
import { useState } from 'react';

export default function Collaborate() {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Colabore</h1>
          <p className="text-xl text-neutral-600">
            Sua contribuição é fundamental para continuarmos realizando nossas ações.
          </p>
        </div>

        <section className="grid lg:grid-cols-2 gap-12 mb-20 items-start">
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">Doações</h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  Desenvolver o hábito de doar é uma forma concreta de contribuir para um futuro mais justo e solidário. Mais do que a quantidade ou o tipo de doação, esse gesto está relacionado ao incentivo de práticas de consumo consciente, empatia e responsabilidade social, valores que podem ser cultivados em nós e transmitidos às próximas gerações.
                </p>
                <p>
                  Todos podem contribuir para o benefício do meio ambiente e da coletividade. As doações podem assumir diferentes formas, como tempo, conhecimento, trabalho voluntário, sangue, leite materno, roupas, agasalhos, brinquedos, alimentos ou recursos financeiros, entre outras possibilidades.
                </p>
                <p>
                  A doação é uma atitude que impacta diretamente a sociedade, fortalecendo ações voltadas à prevenção, à cidadania e ao cuidado com as pessoas em situação de vulnerabilidade.
                </p>
                <p>
                  Our organization develops social projects to support communities. We welcome contributions to these initiatives.
                </p>
                <p>
                  For financial donations, our organization acts as a nonprofit entity, ensuring all funds are transparently allocated to support our mission and programs.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Sua doação estará contribuindo para:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#1d4f42] font-bold text-xl">•</span>
                  <span className="text-neutral-700">Preservar o meio ambiente</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1d4f42] font-bold text-xl">•</span>
                  <span className="text-neutral-700">Prevenir acidentes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1d4f42] font-bold text-xl">•</span>
                  <span className="text-neutral-700">Prevenir incêndios</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1d4f42] font-bold text-xl">•</span>
                  <span className="text-neutral-700">Preserve organizational legacy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1d4f42] font-bold text-xl">•</span>
                  <span className="text-neutral-700">Incentivar a pesquisa em incêndios e explosões</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-xl">•</span>
                  <span className="text-neutral-700">Desenvolvimento de atividades sociais, culturais e desportivas</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-8">
              <div 
                className="relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Imagem de fundo com AVIF + WebP + JPG */}
                <picture>
                  <source srcSet="/images/colabore.avif" type="image/avif" />
                  <source srcSet="/images/colabore.webp" type="image/webp" />
                  <img
                    src="/images/colabore.jpg"
                    alt="Support our organization"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    width="300"
                    height="400"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                
                {/* Overlay escurecido (aparece no hover) */}
                <div 
                  className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
                    isHovering ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                
                {/* QR Code (aparece no hover) */}
                <div 
                  className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${
                    isHovering 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                  }`}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 justify-center">
                      <QrCode size={24} className="text-primary" />
                      <span className="font-bold text-lg text-neutral-900">Doe via PIX</span>
                    </div>
                    <img
                      src="/qrcode-pix-300x300.png"
                      alt="QR Code PIX para doação"
                      className="w-48 h-48 rounded-lg"
                      width="192"
                      height="192"
                      loading="lazy"
                      decoding="async"
                    />
                    <p className="text-center text-sm text-neutral-600 mt-4 font-medium">
                      Escaneie com seu app de banco
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-primary font-semibold text-sm">
                <Heart size={16} />
                <span>Ajude-nos a salvar vidas</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 rounded-2xl p-12 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">Doação PIX</h2>
              <p className="text-lg text-neutral-700 mb-8">
                Sua contribuição é muito importante para que possamos realizar nossas ações.
              </p>

              <div className="space-y-2 mb-8">
                <p className="text-neutral-700 font-semibold">
                  Your Organization – Nonprofit Name
                </p>
                <p className="text-neutral-600">
                  CNPJ: 49.021.024/0001-16
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">Formas de Doação</h3>
                <ul className="space-y-2 text-neutral-700 text-sm">
                  <li>• PIX Copia e Cola</li>
                  <li>• PIX QR Code (veja ao lado)</li>
                  <li>• Transferência Bancária</li>
                  <li>• Depósito em Conta</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200 qr-card">
                <QrCode size={32} className="text-neutral-400 mb-4 mx-auto" />
                <img
                  src="/qrcode-pix-300x300.png"
                  alt="QR Code PIX"
                  className="w-64 h-64 rounded-lg"
                  width="256"
                  height="256"
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Add small hover interaction for visual feedback */}
                <style>{`.qr-card { transition: transform 180ms ease, box-shadow 180ms ease; } .qr-card:hover { transform: scale(1.03); box-shadow: 0 8px 30px rgba(23,23,23,0.08); }`}</style>
                <p className="text-center text-sm text-neutral-600 mt-4">
                  Escaneie com seu app de banco
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Outras Formas de Colaborar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-primary rounded-xl p-8 text-white">
              <div className="text-3xl font-bold mb-3">01</div>
              <h3 className="text-xl font-bold mb-3">Voluntariado</h3>
              <p className="text-opacity-90">
                Disponibilize seu tempo e habilidades para apoiar nossas atividades e projetos.
              </p>
            </div>

            <div className="bg-primary rounded-xl p-8 text-white">
              <div className="text-3xl font-bold mb-3">02</div>
              <h3 className="text-xl font-bold mb-3">Parcerias Corporativas</h3>
              <p className="text-opacity-90">
                Sua empresa pode se tornar parceira em nossas iniciativas e contribuir para causas sociais.
              </p>
            </div>

            <div className="bg-primary rounded-xl p-8 text-white">
              <div className="text-3xl font-bold mb-3">03</div>
              <h3 className="text-xl font-bold mb-3">Doações em Espécie</h3>
              <p className="text-opacity-90">
                Contribua com materiais, equipamentos ou recursos específicos para nossos projetos.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-primary rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Dúvidas?</h2>
          <p className="text-lg text-opacity-90 mb-6">
            Entre em contato conosco para saber mais sobre as formas de colaboração.
          </p>
          <a
              href="mailto:contato@fundacao193.org.br?subject=Quero%20Colaborar%20com%20a%20Fundação%20193&body=Olá,%0A%0ATenho%20interesse%20em%20colaborar%20com%20a%20Fundação%20193.%20Gostaria%20de%20mais%20informações%20sobre:%0A%0A( )%20Voluntariado%0A( )%20Parcerias%20Corporativas%0A( )%20Doações%20em%20Espécie%0A%0APor%20favor,%20me%20retorne%20com%20mais%20detalhes.%0A%0AObrigado!"
              className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-50 transition-colors">
              Enviar E-mail
          </a>
        </section>
      </div>
    </div>
  );
}
