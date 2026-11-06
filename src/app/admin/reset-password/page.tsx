'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/services/supabase/client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'resetting' | 'success'>('idle');
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    // Verifica se há um código de reset na URL
    const code = searchParams.get('code');
    const type = searchParams.get('type');
    
    console.log('Reset page params:', { code, type, url: window.location.href });
    
    if (!code || type !== 'recovery') {
      setError('Link de reset inválido ou expirado. Parâmetros da URL não encontrados.');
      setLoading(false);
      return;
    }

    // Aguarda o Supabase processar o código
    const processReset = async () => {
      try {
        // Tenta trocar o código por uma sessão
        console.log('Tentando trocar código por sessão...');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Exchange error:', exchangeError);
          setError(`Erro ao processar link: ${exchangeError.message}`);
          setLoading(false);
          return;
        }

        if (data.session) {
          console.log('Sessão obtida com sucesso');
          setHasValidSession(true);
          setLoading(false);
        } else {
          setError('Não foi possível estabelecer sessão. Tente novamente.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError(`Erro ao processar link de reset: ${err instanceof Error ? err.message : 'Desconhecido'}`);
        setLoading(false);
      }
    };

    processReset();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('resetting');

    if (!hasValidSession) {
      setError('Sessão inválida. Solicite um novo email de reset.');
      setStatus('idle');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Preencha todos os campos.');
      setStatus('idle');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setStatus('idle');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setStatus('idle');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        setStatus('idle');
        return;
      }

      setStatus('success');
      setTimeout(() => {
        router.push('/admin');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar senha.');
      setStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Processando link de reset...</p>
      </div>
    );
  }

  if (error && status !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="space-y-4 w-80 text-center">
          <h2 className="text-lg font-semibold text-red-400">Erro ao resetar senha</h2>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => router.push('/admin/forgot-password')}
            className="w-full bg-accent-500 text-black p-2 font-bold rounded-lg hover:bg-accent-400"
          >
            Solicitar novo email
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="w-full bg-slate-800 text-white p-2 font-bold rounded-lg hover:bg-slate-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="space-y-4 w-80 text-center">
          <p className="text-green-400 font-semibold text-lg">Senha resetada com sucesso! 🎉</p>
          <p className="text-slate-400">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="space-y-4 w-80 text-center">
          <p className="text-red-400">Sessão não validada</p>
          <button
            onClick={() => router.push('/admin/forgot-password')}
            className="w-full bg-accent-500 text-black p-2 font-bold rounded-lg hover:bg-accent-400"
          >
            Solicitar novo email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h1 className="text-xl font-bold">Resetar Senha</h1>

        <input
          className="w-full p-2 bg-slate-900 rounded-lg"
          placeholder="Nova senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status === 'resetting'}
        />

        <input
          className="w-full p-2 bg-slate-900 rounded-lg"
          placeholder="Confirmar senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={status === 'resetting'}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status === 'resetting'}
          className="w-full bg-accent-500 text-black p-2 font-bold rounded-lg hover:bg-accent-400 disabled:opacity-50"
        >
          {status === 'resetting' ? 'Resetando...' : 'Resetar Senha'}
        </button>
      </form>
    </div>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p>Carregando página de reset...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
