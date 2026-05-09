import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import PresidenteDeHonraCarlosAlberto from '../../assets/teams/Presidente De Honra CARLOS ALBERTO DO NASCIMENTO.jpeg';
import PresidenteWelingtonAlves from '../../assets/teams/Presidente WELINGTON ALVES DE OLIVEIRA.jpeg';
import PresidenteMoisésAlves from '../../assets/teams/Presidente MOISÉS ALVES BARCELOS, Comandante-Geral.png';
import DiretorExecutivoFranciscoRoberto from '../../assets/teams/Diretor Executivo FRANCISCO ROBERTO DE MATOS GUEDES.jpeg';
import DiretorProjetosMauroAndre from '../../assets/teams/Diretor de Projetos MAURO ANDRÉ KAISER CABRAL.jpeg';
import DiretorComunicacaoCleonioDourado from '../../assets/teams/Diretor de Comunicação CLEONIO DOURADO DE SOUZA.jpeg';
import DiretorAdministrativoEnzoPereira from '../../assets/teams/Diretor Administrativo ENZO PEREIRA TEIXEIRA.jpeg';
import DiretorTecnologiaHelonVieira from '../../assets/teams/Diretor de Tecnologia e Inovação HELON VIEIRA FLORINDO.jpeg';
import ComplianceMauricioSilva from '../../assets/teams/Compliance MAURICIO SILVA DE OLIVEIRA.jpeg';
import MembroMarianaSirimarco from '../../assets/teams/Membro MARIANA SIRIMARCO FERNANDES.png';
import MembroWanderleiSantos from '../../assets/teams/Membro WANDERLEI SANTOS DA SILVA.jpeg';
import MembroFernandoBeggiato from '../../assets/teams/Membro FERNANDO BEGGIATO BARROS.png';
import MembroRaimundoSilva from '../../assets/teams/Membro RAIMUNDO DA SILVA RIBEIRO NETO.jpeg';
import MembroDomingosMarcio from '../../assets/teams/Membro DOMINGOS MÁRCIO FERREIRA DA SILVA.jpeg';
import MembroEnzoKleberJustino from '../../assets/teams/Membro KLEBER JUSTINO OLIVEIRA.jpeg';
import MembroFlavioMurilo from '../../assets/teams/Membro FLÁVIO MURILO NUNES PEREIRA.jpeg';
import MembroLisandroPaixao from '../../assets/teams/Membro LISANDRO PAIXÃO DOS SANTOS.png';
import MembroAthosAlexandre from '../../assets/teams/Membro ATHOS ALEXANDRE FERREIRA CAMARGO.jpeg';
import MembroPatriciaRaquel from '../../assets/teams/Membro PATRÍCIA RAQUEL BRAGA DINIZ PEVIDOR.jpeg';
import SuplenteRosangelaFortaleza from '../../assets/teams/Suplente ROSÂNGELA FORTALEZA DE MIRANDA.jpeg';
import SuplenteEsequielRosa from '../../assets/teams/Suplente ESEQUIEL ROSA EDUARDO.jpeg';
import SuplenteEvertonRocha from '../../assets/teams/Suplente EVÉRTON ROCHA DA SILVEIRA.png';
import SuplenteFlavioCosta from '../../assets/teams/Suplente FLÁVIO DA COSTA PORTELA.jpeg';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  level: 'executive' | 'director' | 'council';
}

interface Department {
  id: string;
  title: string;
  description: string;
  members: TeamMember[];
}

function OrgChartCard({ member, size = 'normal' }: { member: TeamMember; size?: 'large' | 'normal' | 'small' }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const sizeClasses = {
    large: 'w-72',
    normal: 'w-60',
    small: 'w-52',
  };

  const imageHeightClasses = {
    large: 'h-64',
    normal: 'h-56',
    small: 'h-48',
  };

  return (
    <div className={`group ${sizeClasses[size]} mx-auto`}>
      <article className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className={`relative overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 ${imageHeightClasses[size]}`}>
          {/* Placeholder */}
          {!isImageLoaded && !hasImageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
              <img
                src="/logo-reduzida.png"
                alt="Organization Logo"
                className="h-8 w-auto"
                width="32"
                height="32"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          
          <img
            src={member.image}
            alt={member.name}
            className={`w-full h-full object-cover object-center transition-all duration-500 ${
              isImageLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setHasImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="p-4 text-center">
          <h3 className="text-base font-bold text-neutral-900 mb-1 group-hover:text-primary transition-colors">
            {member.name}
          </h3>
          <p className="text-sm font-semibold text-primary">{member.role}</p>
        </div>
      </article>
    </div>
  );
}

function VerticalConnector({ height = 'h-12' }: { height?: string }) {
  return <div className={`w-0.5 bg-gradient-to-b from-slate-300 to-slate-400 mx-auto ${height}`} />;
}

function TreeConnector({ branches = 3 }: { branches?: number }) {
  return (
    <div className="relative w-full h-16 my-4">
      <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-gradient-to-b from-slate-300 to-slate-400 -translate-x-1/2" />

      <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />

      {Array.from({ length: branches }).map((_, idx) => {
        const position = `${((idx + 1) / (branches + 1)) * 100}%`;
        return (
          <div
            key={idx}
            className="absolute top-8 w-0.5 h-8 bg-gradient-to-b from-slate-400 to-slate-300"
            style={{ left: position, transform: 'translateX(-50%)' }}
          />
        );
      })}
    </div>
  );
}

export default function Team() {
  const executives: TeamMember[] = [
    {
      id: 'president',
      name: 'Carlos Alberto do Nascimento',
      role: 'Presidente de Honra',
      bio: 'Leadership that inspires and guides strategic organizational direction.'
      image: PresidenteDeHonraCarlosAlberto,
      level: 'executive',
    },
    {
      id: 'ceo',
      name: 'Moisés Alves Barcelos',
      role: 'Presidente',
      bio: 'Responsible for executive leadership and strategic implementation.'
      image: PresidenteMoisésAlves,
      level: 'executive',
    },
  ];

  const directors: TeamMember[] = [
    {
      id: 'coo',
      name: 'Francisco Roberto de Matos Guedes',
      role: 'Diretor Executivo',
      bio: 'Responsável pela coordenação geral das ações executivas e alinhamento estratégico da Fundação.',
      image: DiretorExecutivoFranciscoRoberto,
      level: 'director',
    },
    {
      id: 'cpo',
      name: 'Mauro André Kaiser Cabral',
      role: 'Diretor de Projetos',
      bio: 'Responsável pela estruturação, desenvolvimento e acompanhamento dos projetos institucionais.',
      image: DiretorProjetosMauroAndre,
      level: 'director',
    },
    {
      id: 'cio',
      name: 'Cleonio Dourado de Souza',
      role: 'Diretor de Comunicação',
      bio: 'Oversees communication and institutional relations strategy.'
      image: DiretorComunicacaoCleonioDourado,
      level: 'director',
    },
    {
      id: 'administrativo',
      name: 'Enzo Pereira Teixeira',
      role: 'Diretor Administrativo',
      bio: 'Responsável pela gestão administrativa e suporte às áreas estratégicas da Fundação.',
      image: DiretorAdministrativoEnzoPereira,
      level: 'director',
    },
    {
      id: 'tecnologia-inovacao',
      name: 'Helon Vieira Florindo',
      role: 'Diretor de Tecnologia e Inovação',
      bio: 'Responsável pela modernização tecnológica e iniciativas de inovação institucional.',
      image: DiretorTecnologiaHelonVieira,
      level: 'director',
    },
    {
      id: 'compliance',
      name: 'Mauricio Silva de Oliveira',
      role: 'Compliance',
      bio: 'Responsável pela integridade, conformidade e boas práticas de governança da Fundação.',
      image: ComplianceMauricioSilva,
      level: 'director',
    },
  ];

  const departments: Department[] = [
    {
      id: 'board-curators',
      title: 'Conselho de Curadores',
      description:
        'Órgão máximo de governança, responsável por zelar pela missão institucional e pelos princípios da Fundação.',
      members: [
        {
          id: 'curator-1',
          name: 'Moisés Alves Barcelos',
          role: 'Presidente do Conselho',
          bio: 'Responsável pela liderança e supervisão estratégica do Conselho de Curadores.',
          image: PresidenteMoisésAlves,
          level: 'council',
        },
        {
          id: 'curator-2',
          name: 'Athos Alexandre Ferreira Camargo',
          role: 'Membro',
          bio: 'Atuação na governança institucional e acompanhamento das diretrizes da Fundação.',
          image: MembroAthosAlexandre,
          level: 'council',
        },
        {
          id: 'curator-3',
          name: 'Domingos Márcio Ferreira da Silva',
          role: 'Membro',
          bio: 'Conselheiro responsável por apoiar a tomada de decisões estratégicas.',
          image: MembroDomingosMarcio,
          level: 'council',
        },
        {
          id: 'curator-4',
          name: 'Fernando Beggiato Barros',
          role: 'Membro',
          bio: 'Institutional representation and governance.'
          image: MembroFernandoBeggiato,
          level: 'council',
        },
        {
          id: 'curator-5',
          name: 'Mariana Sirimarco Fernandes',
          role: 'Membro',
          bio: 'Participa da definição e acompanhamento das diretrizes estratégicas da Fundação.',
          image: MembroMarianaSirimarco,
          level: 'council',
        },
        {
          id: 'curator-6',
          name: 'Patrícia Raquel Braga Diniz Pevidor',
          role: 'Membro',
          bio: 'Conselheira atuante em temas de impacto social e desenvolvimento institucional.',
          image: MembroPatriciaRaquel,
          level: 'council',
        },
        {
          id: 'curator-7',
          name: 'Raimundo da Silva Ribeiro Neto',
          role: 'Membro',
          bio: 'Contribui com a governança e acompanhamento das ações estratégicas.',
          image: MembroRaimundoSilva,
          level: 'council',
        },
        {
          id: 'fiscal-1',
          name: 'Flávio Murilo Nunes Pereira',
          role: 'Membro',
          bio: 'Fiscal and financial oversight.'
          image: MembroFlavioMurilo,
          level: 'council',
        },
        {
          id: 'fiscal-2',
          name: 'Lisandro Paixão dos Santos',
          role: 'Membro',
          bio: 'Responsável pelo acompanhamento contábil e financeiro da instituição.',
          image: MembroLisandroPaixao,
          level: 'council',
        },
        {
          id: 'fiscal-5',
          name: 'Rosângela Fortaleza de Miranda',
          role: 'Suplente',
          bio: 'Apoia as atividades do Conselho Fiscal sempre que necessário.',
          image: SuplenteRosangelaFortaleza,
          level: 'council',
        },
        {
          id: 'fiscal-7',
          name: 'Evérton Rocha da Silveira',
          role: 'Suplente',
          bio: 'Suplente no Conselho Fiscal, contribuindo com o controle financeiro.',
          image: SuplenteEvertonRocha,
          level: 'council',
        },
        {
          id: 'fiscal-8',
          name: 'Flávio da Costa Portela',
          role: 'Suplente',
          bio: 'Apoia o Conselho Fiscal na análise e fiscalização das contas.',
          image: SuplenteFlavioCosta,
          level: 'council',
        },
      ],
    },
    {
      id: 'board-fiscal',
      title: 'Conselho Fiscal',
      description: 'Responsável pela fiscalização econômico-financeira e pela transparência na aplicação dos recursos.',
      members: [
        {
          id: 'curator-1',
          name: 'Welington Alves de Oliveira',
          role: 'Presidente do Conselho',
          bio: 'Responsável pela liderança e supervisão estratégica do Conselho de Curadores.',
          image: PresidenteWelingtonAlves,
          level: 'council',
        },
        {
          id: 'fiscal-6',
          name: 'Esequiel Rosa Eduardo',
          role: 'Membro',
          bio: 'Atua como suplente nas atividades de acompanhamento fiscal.',
          image: SuplenteEsequielRosa,
          level: 'council',
        },
        {
        id: 'curator-8',
        name: 'Wanderlei Santos da Silva',
        role: 'Membro',
        bio: 'Atua na supervisão das ações institucionais e na proteção da missão da Fundação.',
        image: MembroWanderleiSantos,
        level: 'council',
      },
      {
        id: 'fiscal-4',
        name: 'Kleber Justino Oliveira',
        role: 'Membro',
        bio: 'Atua na análise das contas e na conformidade financeira da Fundação.',
        image: MembroEnzoKleberJustino,
        level: 'council',
      },
      ],
    },
  ];

  const [activeDepartmentId, setActiveDepartmentId] = useState<string>(departments[0]?.id ?? '');

  const activeDepartment = departments.find((dept) => dept.id === activeDepartmentId) ?? departments[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Nossa Equipe</h1>
        <p className="text-xl text-neutral-600 mb-16">
          Profissionais dedicados e experientes comprometidos com a excelência e o impacto social.
        </p>

        <div className="mb-24 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-lg">
          <div className="mb-8 text-center">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              Nível 1 - Presidência
            </span>
          </div>

          <OrgChartCard member={executives[0]} size="large" />

          <VerticalConnector />

          <div className="mb-8 text-center">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              Nível 2 - Presidência Executiva
            </span>
          </div>

          <OrgChartCard member={executives[1]} size="large" />

          <TreeConnector branches={3} />

          <div className="mb-8 text-center">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              Nível 3 - Diretoria Executiva
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {directors.map((member) => (
              <OrgChartCard key={member.id} member={member} size="normal" />
            ))}
          </div>
        </div>

        <div className="my-24 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="mb-20">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Órgãos de Governança</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Conselhos independentes que garantem transparência, fiscalização e conformidade institucional.
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full mx-auto mt-6" />
          </div>

          {/* Abas dos Conselhos */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {departments.map((dept) => {
              const isActive = dept.id === activeDepartmentId;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setActiveDepartmentId(dept.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200
                    ${isActive ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-neutral-700 border-slate-200 hover:border-primary/60 hover:text-primary'}`}
                >
                  {dept.title}
                </button>
              );
            })}
          </div>

          {/* Card do Conselho ativo */}
          <section className="group bg-white rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl max-w-5xl mx-auto">
            <div className="bg-primary p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">
                {activeDepartment.title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">{activeDepartment.description}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {activeDepartment.members.map((member, idx) => (
                  <div key={member.id}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all duration-300 group/item">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover rounded-lg group-hover/item:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 text-sm group-hover/item:text-primary transition-colors truncate">
                          {member.name}
                        </h4>
                        <p className="text-primary font-medium text-xs mb-1">{member.role}</p>
                        <p className="text-neutral-600 text-xs line-clamp-1">{member.bio}</p>
                      </div>
                    </div>
                    {idx < activeDepartment.members.length - 1 && (
                      <div className="w-0.5 h-2 bg-slate-200 mx-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">Desenvolvimento Contínuo</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full mb-8" />

          <p className="text-neutral-700 leading-relaxed mb-8 text-lg">
            We believe our greatest asset is our team. That's why we invest continuously in
            desenvolvimento profissional e pessoal de cada membro da organização.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'Capacitação Profissional', desc: 'Programas contínuos e educação corporativa de excelência' },
              { title: 'Parcerias Acadêmicas', desc: 'Colaborações com instituições de ensino de renome' },
              { title: 'Mentoria Especializada', desc: 'Guia com especialistas internacionais e locais' },
              { title: 'Desenvolvimento de Carreira', desc: 'Oportunidades de crescimento e desenvolvimento pessoal' },
              { title: 'Bem-estar Integral', desc: 'Programa completo de qualidade de vida e saúde' },
              { title: 'Inclusão e Colaboração', desc: 'Ambiente inclusivo que valoriza diversidade e trabalho em equipe' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5 rounded-lg bg-white border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm md:text-base mb-1">{item.title}</h3>
                  <p className="text-neutral-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
