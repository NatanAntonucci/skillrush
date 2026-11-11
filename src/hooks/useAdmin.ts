'use client';

import { useEffect, useState } from 'react';

export type AdminRole = 'user' | 'moderator' | 'admin';

export interface AdminState {
  loading: boolean;
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
  role: AdminRole | null;
}

const initialState: AdminState = {
  loading: true,
  isAdmin: false,
  userId: null,
  email: null,
  role: null,
};

/**
 * Lê a sessão atual e o papel do usuário em `profiles`.
 *
 * Serve apenas para a interface (esconder/mostrar telas). A autorização real
 * é feita pelo RLS do Postgres · o cliente nunca é a última linha de defesa.
 */
export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>(initialState);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { supabase } = await import('@/services/supabase/client');
        if (!active) return;
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (active) setState({ ...initialState, loading: false });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Não foi possível ler o perfil:', error.message);
        }

        const role = (profile?.role as AdminRole | undefined) ?? null;

        if (active) {
          setState({
            loading: false,
            isAdmin: role === 'admin' || role === 'moderator',
            userId: session.user.id,
            email: session.user.email ?? null,
            role,
          });
        }
      } catch (error) {
        console.error('Falha ao verificar o acesso:', error);
        if (active) setState({ ...initialState, loading: false });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
