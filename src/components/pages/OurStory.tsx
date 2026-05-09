import { ArrowLeft } from 'lucide-react';

export default function OurStory() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-8">Nossa História Completa</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Origem e Fundação</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Our organization was founded to support community initiatives and institutional goals. Its creation was conceived as part of a strategic plan with the objective of expanding support to our programs and strengthening relationships with society.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-4">
              The organization was officially established with clear governance structures, approved by relevant authorities. From its inception, it was established as a civil entity, non-profit, with private law status, and autonomous administrative, financial, and patrimonial management.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              Our name symbolizes our commitment to providing relevant services to society and our mission of service and support.
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Estruturação Institucional (2022–2023)</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Nos primeiros momentos após sua constituição, a organização concentrou esforços na estruturação
              administrativa, jurídica e institucional, estabelecendo bases sólidas para sua atuação. Esse período foi
              marcado pela organização interna, definição de diretrizes estratégicas e alinhamento com as finalidades
              estatutárias.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Entre as prioridades desse momento destacam-se:
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2 mb-4">
              <li>Consolidação da governança institucional;</li>
              <li>Definição de programas e áreas de atuação;</li>
              <li>Fortalecimento do vínculo institucional com o CBMDF;</li>
              <li>Planejamento de ações voltadas ao interesse público e social.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Atuação e Desenvolvimento</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              A organização atua no apoio a programas, projetos e ações, com foco em iniciativas de interesse
              coletivo, especialmente nas áreas de:
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2 mb-4">
              <li>Preservação e conservação do meio ambiente;</li>
              <li>
                Prevenção de incêndios e acidentes, por meio do desenvolvimento da consciência comunitária;
              </li>
              <li>Difusão do conhecimento científico e tecnológico;</li>
              <li>
                Preservação, recuperação e divulgação da história, tradição e valores do Corpo de Bombeiros;
              </li>
              <li>Promoção da qualidade de vida dos bombeiros militares e de seus familiares;</li>
              <li>Desenvolvimento de atividades culturais, educacionais, sociais e desportivas.</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              Sua atuação busca sempre complementar e fortalecer as atividades institucionais, respeitando os
              princípios da legalidade, transparência e responsabilidade social.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Presente e Futuro</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Atualmente, a organização consolida-se como um elo estratégico entre suas operações e a sociedade, contribuindo para o fortalecimento institucional e para a promoção da
              cidadania.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Com foco no futuro, a Fundação mantém o compromisso de ampliar seu impacto social por meio de:
            </p>
            <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2 mb-4">
              <li>Desenvolvimento de novos projetos e parcerias institucionais;</li>
              <li>Incentivo a ações de prevenção e educação comunitária;</li>
              <li>Promoção da sustentabilidade e da responsabilidade socioambiental;</li>
              <li>Valorização dos profissionais do CBMDF e de sua história.</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              Guiada por princípios como ética, transparência, solidariedade e responsabilidade social, a Fundação 193
              segue comprometida em apoiar o CBMDF e contribuir para uma sociedade mais segura, conscienteorganização
              segue comprometida em apoiar sua comunidade
          </section>
        </div>
      </div>
    </div>
  );
}
