'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email) {
      setError('Preencha seu email.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email de reset.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="space-y-4 w-80 text-center">
          <h2 className="text-xl font-bold text-green-400">Email enviado! ✅</h2>
          <p className="text-slate-300">
            Verifique seu email e clique no link para resetar sua senha.
          </p>
          <p className="text-sm text-slate-400">
            O link expira em 24 horas.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="w-full bg-accent-500 text-black p-2 font-bold rounded-lg hover:bg-accent-400"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <div>
          <h1 className="text-xl font-bold mb-2">Recuperar Senha</h1>
          <p className="text-sm text-slate-400 mb-4">
            Insira seu email para receber um link de reset de senha.
          </p>
        </div>

        <input
          className="w-full p-2 bg-slate-900 rounded-lg border border-slate-800 focus:border-accent-500 focus:outline-none"
          placeholder="seu@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-500 text-black p-2 font-bold rounded-lg hover:bg-accent-400 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Email de Reset'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="w-full text-accent-400 p-2 font-medium hover:text-accent-300"
        >
          Voltar ao Login
        </button>
      </form>
    </div>
  );
}
