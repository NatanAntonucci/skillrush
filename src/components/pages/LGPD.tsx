import { ArrowLeft, Lock, Eye, Users, Shield } from 'lucide-react';

export default function LGPD() {
  const principles = [
    {
      icon: Lock,
      title: 'Confidencialidade',
      description: 'Protegemos dados pessoais através de criptografia, controle de acesso e políticas rigorosas.',
    },
    {
      icon: Eye,
      title: 'Transparência',
      description: 'Informamos claramente como coletamos, usamos e protegemos dados pessoais.',
    },
    {
      icon: Users,
      title: 'Autonomia',
      description: 'Garantimos direitos como acesso, correção, exclusão e portabilidade de dados.',
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Implementamos medidas técnicas e administrativas para proteger contra abusos.',
    },
  ];

  const userRights = [
    'Confirmar se possuímos seus dados pessoais',
    'Ter acesso aos dados pessoais que temos sobre você',
    'Corrigir dados pessoais inexatos ou incompletos',
    'Solicitar a exclusão de seus dados pessoais',
    'Obter uma cópia de seus dados em formato estruturado',
    'Revogar consentimento para tratamento de dados',
    'Contestar decisões automatizadas',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">LGPD - Lei Geral de Proteção de Dados</h1>
        <p className="text-xl text-neutral-600 mb-16">
          Informações sobre proteção de dados pessoais e direitos sob a LGPD.
        </p>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Nossos Compromissos com Privacidade</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">{principle.title}</h3>
                      <p className="text-neutral-600 leading-relaxed">{principle.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Coleta e Uso de Dados</h2>
          <div className="bg-white rounded-2xl p-8 shadow-md space-y-6">
            <div>
              <h4 className="text-lg font-bold text-neutral-900 mb-3">Quais dados coletamos?</h4>
              <ul className="list-disc list-inside text-neutral-600 space-y-2">
                <li>Informações de contato (nome, email, telefone)</li>
                <li>Dados de identificação (CPF, CNPJ)</li>
                <li>Informações profissionais (cargo, empresa, formação)</li>
                <li>Dados de navegação e cookies (em nosso website)</li>
                <li>Histórico de participação em eventos e programas</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-neutral-900 mb-3">Para que usamos seus dados?</h4>
              <ul className="list-disc list-inside text-neutral-600 space-y-2">
                <li>Executar programas de capacitação e treinamento</li>
                <li>Comunicação sobre eventos e oportunidades</li>
                <li>Processamento de inscrições e candidaturas</li>
                <li>Análise de efetividade de programas</li>
                <li>Cumprimento de obrigações legais e regulatórias</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Seus Direitos</h2>
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <p className="text-neutral-600 leading-relaxed mb-6">
              Sob a LGPD, você tem o direito de:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {userRights.map((right) => (
                <div key={right} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
                  <div className="w-5 h-5 bg-primary rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-neutral-700">{right}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Como Exercer Seus Direitos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">Solicitação de Dados</h4>
              <ol className="list-decimal list-inside text-neutral-600 space-y-2 mb-6">
                <li>Send email to contact@example.com</li>
                <li>Descreva claramente qual dado você deseja acessar</li>
                <li>Inclua informações para verificação de identidade</li>
                <li>Receberá resposta em até 30 dias</li>
              </ol>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-8 text-white">
              <h4 className="text-lg font-bold mb-4">Exclusão de Dados</h4>
              <ol className="list-decimal list-inside text-opacity-90 space-y-2 mb-6">
                <li>Envie solicitação de exclusão por email</li>
                <li>Especifique quais dados deseja remover</li>
                <li>Confirme sua identidade</li>
                <li>Processaremos em até 30 dias úteis</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Segurança de Dados</h2>
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <p className="text-neutral-600 leading-relaxed mb-6">
              This organization implements rigorous technical and administrative measures to protect your data:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-primary pl-6">
                <h4 className="font-bold text-neutral-900 mb-2">Medidas Técnicas</h4>
                <ul className="list-disc list-inside text-neutral-600 space-y-1">
                  <li>Criptografia de dados em trânsito</li>
                  <li>Armazenamento seguro</li>
                  <li>Firewalls e IDS/IPS</li>
                  <li>Backups regulares</li>
                </ul>
              </div>
              <div className="border-l-4 border-primary pl-6">
                <h4 className="font-bold text-neutral-900 mb-2">Medidas Administrativas</h4>
                <ul className="list-disc list-inside text-neutral-600 space-y-1">
                  <li>Controle de acesso restrito</li>
                  <li>Treinamento de funcionários</li>
                  <li>Acordos de confidencialidade</li>
                  <li>Auditoria regular de segurança</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Compartilhamento de Dados</h2>
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <p className="text-neutral-600 leading-relaxed mb-6">
              This organization does not share your personal data with third parties without express consent, except when:
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2 mb-6">
              <li>Obrigado por lei ou ordem judicial</li>
              <li>Necessário para executar um serviço que você solicitou</li>
              <li>Com parceiros que assinaram acordos de confidencialidade</li>
              <li>Para cumprir obrigações regulatórias</li>
            </ul>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">
                <strong>Parceiros de Confiança:</strong> Utilizamos provedores de email, hospedagem e outros serviços que se comprometem com LGPD.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6">Contato - Encarregado de Proteção de Dados</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="font-semibold text-neutral-900 mb-2">Email</p>
              <p className="text-neutral-600">contact@example.com</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-900 mb-2">Telefone</p>
              <p className="text-neutral-600">(61) 99382-3763</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600">
              <strong>Mailing address:</strong> Data Protection Officer, Address, City, Country
            </p>
          </div>
        </section>

        <div className="mt-12 p-6 bg-neutral-100 rounded-xl">
          <p className="text-neutral-700 font-semibold mb-2">Última Atualização: Janeiro de 2024</p>
          <p className="text-sm text-neutral-600">
            Esta política de LGPD será revisada periodicamente. Alterações importantes serão comunicadas por email.
          </p>
        </div>
      </div>
    </div>
  );
}
