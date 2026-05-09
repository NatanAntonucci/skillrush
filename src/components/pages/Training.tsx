import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { fetchCapacitacoes } from '../../services/api';
import type { Training } from '../../types/training';

/* =====================
   Utils
===================== */

const normalizeStatus = (v?: string) =>
  v
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '_') || '';

const STATUS_MAP: Record<
  string,
  { label: string; className: string; canSignup: boolean }
> = {
  planejada: {
    label: 'Planejada',
    className: 'bg-gray-100 text-gray-700',
    canSignup: false,
  },
  finalizada: {
    label: 'Finalizada',
    className: 'bg-gray-800 text-white',
    canSignup: false,
  },
  inscricoes_abertas: {
    label: 'Inscrições abertas',
    className: 'bg-green-100 text-green-800',
    canSignup: true,
  },
  inscricoes_encerradas: {
    label: 'Inscrições encerradas',
    className: 'bg-red-100 text-red-700',
    canSignup: false,
  },
};

const USE_HARDCODED_TRAINING = true;
const SHOW_TRAINING_CARDS = false;

const HARDCODED_TRAININGS: Training[] = [
  {
    id: 1,
    title: { rendered: 'Primeiros Socorros e Atendimento Inicial' },
    acf: {
      cap_summary:
        'Formacao basica para resposta rapida e suporte a vitimas em situacoes de emergencia.',
      cap_workload: '20h',
      cap_start_date: '2026-03-10',
      cap_end_date: '2026-03-14',
      cap_status: 'Inscricoes abertas',
      cap_signup_link: 'https://example.com',
    },
  },
  {
    id: 2,
    title: { rendered: 'Gestao de Riscos e Prevencao de Incendios' },
    acf: {
      cap_summary:
        'Curso focado em analise de riscos, planos de contingencia e protocolos operacionais.',
      cap_workload: '32h',
      cap_start_date: '2026-04-05',
      cap_end_date: '2026-04-12',
      cap_status: 'Planejada',
    },
  },
  {
    id: 3,
    title: { rendered: 'Operacoes Integradas em Desastres' },
    acf: {
      cap_summary:
        'Treinamento avancado para coordenacao de equipes em cenarios complexos.',
      cap_workload: '40h',
      cap_start_date: '2026-05-18',
      cap_end_date: '2026-05-25',
      cap_status: 'Inscricoes encerradas',
    },
  },
];

const formatFriendlyDate = (start?: string, end?: string) => {
  if (!start) return '';

  const parse = (d: string) => {
    if (/^\d{8}$/.test(d)) {
      return new Date(
        Number(d.slice(0, 4)),
        Number(d.slice(4, 6)) - 1,
        Number(d.slice(6, 8))
      );
    }
    return new Date(d);
  };

  const s = parse(start);
  const e = end ? parse(end) : null;

  const fmtShort = (d: Date) =>
    d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });

  const fmtMonthYear = (d: Date) =>
    d.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });

  if (!e) {
    return fmtMonthYear(s);
  }

  if (
    s.getMonth() === e.getMonth() &&
    s.getFullYear() === e.getFullYear()
  ) {
    return `${fmtShort(s)} – ${fmtShort(e)} ${s.getFullYear()}`;
  }

  return `${fmtShort(s)} – ${fmtShort(e)}`;
};

const extractImageUrl = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    const API_URL = import.meta.env.VITE_WP_API_URL;
    return `${API_URL}/wp-json/wp/v2/media/${value}`;
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.url === 'string') return obj.url;
  }
  return '';
};

/* =====================
   Component
===================== */

export default function Training() {
  const [trainings, setTrainings] = useState<Training[]>(
    USE_HARDCODED_TRAINING ? HARDCODED_TRAININGS : []
  );
  const [loading, setLoading] = useState(!USE_HARDCODED_TRAINING);
  const [error, setError] = useState<string | null>(null);

  const loadCapacitacoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCapacitacoes();
      setTrainings(data);
    } catch (err) {
      console.error(err);
      setError('Não conseguimos carregar as capacitações no momento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (USE_HARDCODED_TRAINING) {
      return;
    }
    loadCapacitacoes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-badge-text">
            <div className="w-2 h-2 bg-badge-text rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">Carregando capacitações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-8 flex items-center gap-4">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar capacitações</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={loadCapacitacoes}
              aria-label="Recarregar capacitações"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-white"
            >
              <RotateCw size={16} />
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">

        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-primary font-medium mb-8 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary hover:text-primary-hover"
          aria-label="Voltar para página anterior"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1 className="text-4xl font-bold mb-4">
          Programas de Capacitação
        </h1>

        <p className="text-xl text-neutral-600 mb-16">
          Desenvolvimento profissional contínuo através de programas
          internacionais e metodologias inovadoras.
        </p>

        {SHOW_TRAINING_CARDS && (
          <>
            {/* Fonte principal: API. Mantido hardcoded apenas como fallback opcional de desenvolvimento. */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {trainings.map(training => {
                const acf = training.acf;
                const statusKey = normalizeStatus(acf?.cap_status);
                const status =
                  STATUS_MAP[statusKey] ?? {
                    label: acf?.cap_status || 'Status',
                    className: 'bg-gray-200 text-gray-700',
                    canSignup: false,
                  };

                const imageUrl = extractImageUrl(acf?.cap_feature_image);
                const dateLabel = formatFriendlyDate(
                  acf?.cap_start_date,
                  acf?.cap_end_date
                );

                const showSignup =
                  status.canSignup && Boolean(acf?.cap_signup_link);

                return (
                  <div
                    key={training.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
                  >
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={training.title?.rendered}
                        className="h-40 w-full object-cover"
                      />
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold mb-2">
                        {training.title?.rendered}
                      </h3>

                      <p className="text-sm text-neutral-600 mb-4">
                        {acf?.cap_summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          {acf?.cap_workload && (
                            <span className="flex items-center gap-1">
                              <Clock size={16} className="text-icon-fg" />
                              {acf.cap_workload}
                            </span>
                          )}

                          {dateLabel && (
                            <span className="flex items-center gap-1">
                              <Calendar size={16} className="text-icon-fg" />
                              {dateLabel}
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {showSignup && (
                        <a
                          href={acf?.cap_signup_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            mt-auto
                            text-center
                            px-4
                            py-2
                            bg-primary
                            text-white
                            rounded-md
                            text-sm
                            font-medium
                            hover:bg-primary-hover
                            transition
                          "
                        >
                          Inscrever-se
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {trainings.length === 0 && (
              <div className="bg-white rounded-xl p-8 shadow-md text-center text-neutral-600 mb-16">
                Nenhuma capacitação disponível no momento.
              </div>
            )}
          </>
        )}

        {/* Blocos estáticos */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <section className="bg-white rounded-2xl p-8 shadow-md">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-icon-bg rounded-lg flex items-center justify-center">
                <BookOpen size={24} className="text-icon-fg" />
              </div>
              <h3 className="text-2xl font-bold">Metodologia de Ensino</h3>
            </div>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Aulas teóricas com instrutores especializados</li>
              <li>Prática em ambientes simulados realísticos</li>
              <li>Exercícios de campo com cenários reais</li>
              <li>Mentorias individualizadas</li>
              <li>Avaliações contínuas de desempenho</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-md">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-icon-bg rounded-lg flex items-center justify-center">
                <Award size={24} className="text-icon-fg" />
              </div>
              <h3 className="text-2xl font-bold">Certificações</h3>
            </div>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Institutional certificates</li>
              <li>Professional credentialing</li>
              <li>Certificações internacionais em parceria</li>
              <li>Renovação periódica de qualificações</li>
              <li>Reconhecimento de expertise especializada</li>
            </ul>
          </section>
        </div>

        <section className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Próximos Cursos e Inscrições
          </h3>
          <p className="mb-6">
            Para informações sobre cronograma de cursos e vagas disponíveis:
          </p>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <p className="font-semibold">contact@example.com</p>
            <p className="font-semibold">(61) 99557-8286</p>
          </div>
        </section>
      </div>
    </div>
  );
}
