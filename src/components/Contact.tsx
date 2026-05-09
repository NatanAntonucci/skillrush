import { MapPin, Phone, Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState, FormEvent, ChangeEvent } from 'react';

interface FormData {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    assunto: '',
    mensagem: '',
  });

  const [status, setStatus] = useState<FormStatus>({
    type: 'idle',
    message: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (status.type === 'error') {
      setStatus({ type: 'idle', message: '' });
    }
  };

  const validateForm = (): string | null => {
    if (formData.nome.trim().length < 3) {
      return 'Nome deve ter no mínimo 3 caracteres';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'E-mail inválido';
    }
    if (formData.assunto.trim().length < 5) {
      return 'Assunto deve ter no mínimo 5 caracteres';
    }
    if (formData.mensagem.trim().length < 10) {
      return 'Mensagem deve ter no mínimo 10 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://example.com/api';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }

      setStatus({
        type: 'success',
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      });

      setFormData({
        nome: '',
        email: '',
        assunto: '',
        mensagem: '',
      });

      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao enviar mensagem. Tente novamente.',
      });
    }
  };

  return (
    <section id="contato" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-badge-bg text-badge-text px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Entre em Contato
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">
            Vamos trabalhar juntos
          </h2>
          <p className="text-lg text-neutral-600">
            Tem uma dúvida ou deseja iniciar um novo projeto? Estamos prontos para ajudar.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="space-y-8 mb-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-icon-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-icon-fg" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Endereço</h3>
                  <p className="text-neutral-600">
                    Rua do Projeto, 1234
                    <br />
                    Centro - Cidade, Estado
                    <br />
                    CEP: 00000-000
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-icon-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-icon-fg" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Telefone</h3>
                  <p className="text-neutral-600">
                    (00) 0000-0000
                    <br />
                    Seg à Sex: 9h às 18h
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-icon-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-icon-fg" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">E-mail</h3>
                  <p className="text-neutral-600">
                    contato@seudominio.com
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6">
              <h3 className="font-bold text-neutral-900 mb-4">Horário de Atendimento</h3>
              <div className="space-y-2 text-neutral-600">
                <p>Segunda a Sexta: 9h às 18h</p>
                <p>Sábado e Domingo: Fechado</p>
                <p className="text-sm text-neutral-500 mt-4">
                  Use o formulário para enviar sua proposta ou solicitar informações.
                </p>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-xl p-8">
              {status.type !== 'idle' && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    status.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : status.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  {status.type === 'success' && <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />}
                  {status.type === 'error' && <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />}
                  {status.type === 'loading' && <Loader2 size={20} className="flex-shrink-0 mt-0.5 animate-spin" />}
                  <p className="text-sm font-medium">{status.message || 'Enviando mensagem...'}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="nome" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    disabled={status.type === 'loading'}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status.type === 'loading'}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="assunto" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Assunto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    disabled={status.type === 'loading'}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Como podemos ajudar?"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Mensagem <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="mensagem"
                    rows={5}
                    value={formData.mensagem}
                    onChange={handleChange}
                    disabled={status.type === 'loading'}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Escreva sua mensagem..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status.type === 'loading'}
                  className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/30 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {status.type === 'loading' ? (
                    <>
                      Enviando...
                      <Loader2 size={20} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      Enviar mensagem
                      <Send size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
