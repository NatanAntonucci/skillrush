import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, AlertCircle, RotateCw } from 'lucide-react';

import { fetchEventos } from '../../services/api';
import type { Event } from '../../types/events';
import PageLoader from '../PageLoader';

/**
 * Parse Ymd (20260122) to Date using noon to avoid timezone shift
 */
function parseYmdToDate(ymd?: string): Date | null {
  if (!ymd || ymd.length !== 8) return null;

  const year = Number(ymd.substring(0, 4));
  const month = Number(ymd.substring(4, 6)) - 1;
  const day = Number(ymd.substring(6, 8));

  // Noon prevents UTC timezone offset issues
  return new Date(year, month, day, 12, 0, 0);
}

/**
 * Format event date: prefer ACF event_start_date, fallback to post date
 */
function formatEventDate(eventStartDate?: string, postDate?: string): string {
  if (eventStartDate) {
    const d = parseYmdToDate(eventStartDate);
    return d ? d.toLocaleDateString('pt-BR') : 'Data a definir';
  }
  if (postDate) {
    const d = new Date(postDate);
    return d.toLocaleDateString('pt-BR');
  }
  return 'Data a definir';
}

/**
 * Normalize date to start of day
 */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEventos();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError('Não conseguimos carregar os eventos no momento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) {
    return <PageLoader message="Carregando eventos..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-8 flex items-center gap-4">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar eventos</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={loadEvents}
              aria-label="Recarregar eventos"
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

  const today = startOfDay(new Date());

  // Separa eventos por data: usa event_start_date se disponível, senão usa post date
  const upcomingEvents = events
    .filter(event => {
      const eventDate = event.acf?.event_start_date ? parseYmdToDate(event.acf.event_start_date) : new Date(event.date);
      return eventDate && startOfDay(eventDate) >= today;
    })
    .sort((a, b) => {
      const aDate = a.acf?.event_start_date ? parseYmdToDate(a.acf?.event_start_date) : new Date(a.date);
      const bDate = b.acf?.event_start_date ? parseYmdToDate(b.acf?.event_start_date) : new Date(b.date);
      return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
    });

  const pastEvents = events
    .filter(event => {
      const eventDate = event.acf?.event_start_date ? parseYmdToDate(event.acf.event_start_date) : new Date(event.date);
      return eventDate && startOfDay(eventDate) < today;
    })
    .sort((a, b) => {
      const aDate = a.acf?.event_start_date ? parseYmdToDate(a.acf?.event_start_date) : new Date(a.date);
      const bDate = b.acf?.event_start_date ? parseYmdToDate(b.acf?.event_start_date) : new Date(b.date);
      return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
    });

  const cardClass =
    'bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border-l-4 border-primary';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => (window.location.hash = '')}
          className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          Eventos
        </h1>

        <p className="text-xl text-neutral-600 mb-16">
          Encontros, seminários e atividades que promovem conhecimento e participação.
        </p>

        {/* Upcoming events */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Próximos Eventos
          </h2>

          {upcomingEvents.length === 0 ? (
            <div className="flex items-center justify-center py-16 px-4">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Nenhum evento próximo no momento
                </h3>
                <p className="text-neutral-600 mb-6">
                  Estamos preparando novidades. Acompanhe nossa página para saber quando os próximos eventos serão anunciados.
                </p>
                <a
                  href="mailto:contato@fundacao193.org.br"
                  className="inline-block text-primary font-medium hover:underline"
                >
                  Entre em contato para mais informações
                </a>
              </div>
            </div>
          ) : null}

          <div className="space-y-6">
            {upcomingEvents.map(event => (
              <div key={event.id} className={cardClass}>
                <div className="p-6">
                  <h3
                    className="text-2xl font-bold text-neutral-900 mb-2"
                    dangerouslySetInnerHTML={{ __html: event.title.rendered }}
                  />

                  <p className="text-neutral-600 leading-relaxed mb-4">
                    {event.acf?.event_summary || 'Descrição não informada.'}
                  </p>

                  <div className="flex flex-col md:flex-row gap-6 text-neutral-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-icon-fg" />
                      <span>{formatEventDate(event.acf?.event_start_date, event.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-icon-fg" />
                      <span>{event.acf?.event_location || 'Local a definir'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {event.acf?.event_registration_url && (
                      <a
                        href={event.acf.event_registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                      >
                        Inscrever-se
                      </a>
                    )}

                    <a
                      href={`#evento-${event.id}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all px-4 py-2"
                      aria-label={`Saiba mais sobre ${event.title.rendered.replace(/<[^>]*>/g, '')}`}
                    >
                      Saiba mais
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past events */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Eventos Realizados
          </h2>

          {pastEvents.length === 0 ? (
            <div className="flex items-center justify-center py-16 px-4">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Histórico de eventos em breve
                </h3>
                <p className="text-neutral-600">
                  Aqui você acompanhará todos os eventos que já realizamos e o impacto que geramos na comunidade.
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-6">
            {pastEvents.map(event => (
              <div key={event.id} className={cardClass}>
                <div className="p-6">
                  <h3
                    className="text-2xl font-bold text-neutral-900 mb-2"
                    dangerouslySetInnerHTML={{ __html: event.title.rendered }}
                  />

                  <p className="text-neutral-600 mb-4">
                    {event.acf?.event_summary || 'Descrição não informada.'}
                  </p>

                  <div className="flex flex-col md:flex-row gap-6 text-neutral-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-icon-fg" />
                      <span>{formatEventDate(event.acf?.event_start_date, event.date)}</span>
                    </div>

                    {event.acf?.event_location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-icon-fg" />
                        <span>{event.acf.event_location}</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={`#evento-${event.id}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
                    aria-label={`Saiba mais sobre ${event.title.rendered.replace(/<[^>]*>/g, '')}`}
                  >
                    Saiba mais
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4 mb-6">
            <Users size={32} />
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Deseja Participar ou Patrocinar?
              </h3>
              <p>
                Entre em contato para apoiar ou participar dos proximos eventos.
              </p>
            </div>
          </div>

            <a
              href="https://api.whatsapp.com/send/?phone=5561993823763&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer">
              <button className="px-6 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors">
                Entre em Contato
              </button>
            </a>
        </div>
      </div>
    </div>
  );
}
