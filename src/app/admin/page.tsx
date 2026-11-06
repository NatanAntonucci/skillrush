'use client';

import { useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mensagem de erro mais clara
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique seus dados.');
        } else {
          setError(error.message);
        }
        return;
      }

      router.push('/admin/upload');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <form onSubmit={handleLogin} className="space-y-4 w-80">
        <div>
          <h1 className="text-xl font-bold mb-1">Admin Login</h1>
          <p className="text-sm text-slate-400">Acesso restrito para administradores</p>
        </div>

        <input
          className="w-full p-2 bg-slate-900 rounded-lg border border-slate-800 focus:border-accent-500 focus:outline-none"
          placeholder="seu@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          className="w-full p-2 bg-slate-900 rounded-lg border border-slate-800 focus:border-accent-500 focus:outline-none"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-500 text-black p-2 font-bold rounded-lg hover:bg-accent-400 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="pt-2 border-t border-slate-800">
          <Link
            href="/admin/forgot-password"
            className="block text-center text-accent-400 hover:text-accent-300 text-sm font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>
      </form>
    </div>
  );
}