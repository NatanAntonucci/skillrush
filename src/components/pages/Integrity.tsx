import { ArrowLeft, ExternalLink, FileText, ShieldCheck } from 'lucide-react';

type IntegrityDocument = {
  title: string;
  description: string;
  href: string;
};

const INTEGRITY_DOCUMENTS: IntegrityDocument[] = [
  {
    title: 'Código de Ética',
    description: 'Ethical guidelines and organizational conduct policies.',
    href: '/pdfs/integridade/Codigo-de-Etica.pdf',
  },
  {
    title: 'Estatuto Social',
    description: 'Normas de organização e funcionamento institucional.',
    href: '/pdfs/integridade/Estatuto-Registrado-Fundacao-193.pdf',
  },
  {
    title: 'Identidade Visual',
    description: 'Manual de aplicação da marca e padronização visual.',
    href: '/pdfs/integridade/Manual-de-identidade-visual-Fundacao-193-v2.pdf',
  },
  {
    title: 'Regimento Interno',
    description: 'Regras internas de governança, estrutura e processos.',
    href: '/pdfs/integridade/Regimento-Interno-Fundacao-193.pdf',
  },
  {
    title: 'Política de Segurança',
    description: 'Política institucional de segurança e conformidade.',
    href: '/pdfs/integridade/PolSeg-Fundacao-193.pdf',
  },
  {
    title: 'Política de Denúncias',
    description: 'Recebimento e tratamento de denúncias institucionais.',
    href: '/pdfs/integridade/Politica-de-Recebimento-e-Tratamento-de-Denuncias.pdf',
  },
  {
    title: 'Regulamento Eleitoral Interno',
    description: 'Regras do processo eleitoral para Diretoria Executiva.',
    href: '/pdfs/integridade/Regulamento-do-processo-eleitoral-interno-da-Fundacao-193-para-os-cargos-da-Diretoria-Executiva-2.pdf',
  },
  {
    title: 'Planejamento Estratégico',
    description: 'Versão resumida do planejamento estratégico institucional.',
    href: '/pdfs/integridade/Diagramacao-Planejamento-Estrategico-Fundacao-193-versao-resumida.pdf',
  },
  {
    title: 'Manual de Compras',
    description: 'Purchasing and contracting procedures.'
    href: '/pdfs/integridade/Manual-de-Compras.pdf',
  },
];

export default function Integrity() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => {
            window.location.hash = '';
          }}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <section className="mb-10 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="inline-flex items-center gap-2 bg-white/80 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-primary/20">
            <ShieldCheck size={16} />
            Programa de Integridade
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Integridade</h1>
          <p className="text-lg text-neutral-700 max-w-4xl leading-relaxed mb-6">
            Our activities are guided by legality, impartiality, morality, transparency,
            eficiência, transparência e ética. Nesta página, você encontra os principais documentos oficiais do programa
            de integridade.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-white border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
            <FileText size={16} className="text-primary" />
            {INTEGRITY_DOCUMENTS.length} documentos oficiais disponíveis
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INTEGRITY_DOCUMENTS.map((document) => (
            <a
              key={document.href}
              href={document.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all"
              aria-label={`Abrir ${document.title} em PDF`}
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary/80 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                <FileText size={13} />
                Documento
              </div>
              <p className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                {document.title}
              </p>
              <p className="text-sm text-neutral-600 mb-5 min-h-[48px]">{document.description}</p>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm">
                Abrir PDF
                <ExternalLink size={15} />
              </span>
            </a>
          ))}
        </section>
      </div>
    </div>
  );
}
