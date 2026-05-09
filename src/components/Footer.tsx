import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Impacto', href: '#impacto' },
    { label: 'Contato', href: '#contato' },
  ];

  return (
    <footer className="bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">React Template Base</h3>
            <p className="text-neutral-400 leading-relaxed mb-6">
              Base pronta para novos projetos web modernos, responsivos e acessíveis.
              Inclui estrutura de navegação, seções utilitárias e um contato inicial funcional.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#inicio"
                className="text-neutral-400 hover:text-primary transition-colors"
              >
                Voltar ao topo
              </a>
              <span className="text-neutral-600">•</span>
              <a
                href="#contato"
                className="text-neutral-400 hover:text-primary transition-colors"
              >
                Fale com a gente
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-[0.2em] text-neutral-400 mb-4">
              Navegação rápida
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-neutral-800 pt-8">
          <p className="text-neutral-500 text-sm">
            © {currentYear} React Template Base. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="YouTube">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
