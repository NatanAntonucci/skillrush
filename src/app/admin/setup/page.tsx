'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!email || !password) {
      setError('Preencha email e senha.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // Faz requisição ao endpoint do servidor
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar usuário');
        return;
      }

      setSuccess(true);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">⚙️ Admin Setup</h1>
        <p className="text-slate-400 mb-6">
          ⚠️ Esta página é apenas para desenvolvimento. Use para criar usuários de teste.
        </p>

        <form onSubmit={handleCreateUser} className="bg-slate-900 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full p-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full p-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-600 p-3 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-600 p-3 rounded-lg">
              <p className="text-green-400 text-sm">✅ Usuário criado com sucesso!</p>
              <p className="text-green-300 text-xs mt-1">Você pode fazer login com este email agora.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white p-2 font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Usuário Admin'}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <a
            href="/admin/debug"
            className="block text-center bg-cyan-600 text-white p-2 font-bold rounded-lg hover:bg-cyan-700"
          >
            ← Ver Debug Info
          </a>
          <a
            href="/admin"
            className="block text-center bg-slate-800 text-white p-2 font-bold rounded-lg hover:bg-slate-700"
          >
            ← Voltar ao Login
          </a>
        </div>
      </div>
    </div>
  );
}
