'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNav } from '@/components/admin/AdminNav';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/services/supabase/client';

interface TeamMember {
  id: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  display_name: string | null;
  created_at: string;
}

const roleOptions: { value: TeamMember['role']; label: string }[] = [
  { value: 'user', label: 'Usuário' },
  { value: 'moderator', label: 'Moderador' },
  { value: 'admin', label: 'Administrador' },
];

function TeamManager() {
  const admin = useAdmin();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const canManage = admin.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('list_profiles');

      if (rpcError) throw new Error(rpcError.message);

      setMembers((data ?? []) as TeamMember[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar a equipe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManage) load();
  }, [canManage, load]);

  async function changeRole(member: TeamMember, role: TeamMember['role']) {
    setSavingId(member.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', member.id);

      if (updateError) throw new Error(updateError.message);

      setMembers((current) =>
        current.map((item) => (item.id === member.id ? { ...item, role } : item)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Erro ao salvar o papel.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen text-slate-100">
      <AdminNav />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold">Equipe</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/lineups"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500"
            >
              Lineups
            </Link>
            <Link
              href="/admin/upload"
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-400"
            >
              Nova lineup
            </Link>
          </div>
        </header>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">Como criar uma conta nova</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-400">
            <li>
              Supabase → <strong>Authentication → Users → Add user</strong> (marque “Auto Confirm”).
            </li>
            <li>Volte aqui: a pessoa aparece na lista já como <em>Usuário</em>.</li>
            <li>Troque o papel para <em>Administrador</em> ou <em>Moderador</em>.</li>
          </ol>
        </div>

        {!canManage && (
          <p className="rounded-2xl border border-amber-700/40 bg-amber-950/20 p-4 text-sm text-amber-200">
            Apenas administradores podem alterar papéis. Moderadores podem publicar e editar lineups.
          </p>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{member.email}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {member.display_name ?? 'sem nome'} · desde{' '}
                    {new Date(member.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <select
                  value={member.role}
                  disabled={!canManage || savingId === member.id}
                  onChange={(event) => changeRole(member, event.target.value as TeamMember['role'])}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent-500 disabled:opacity-50"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function TeamPage() {
  return (
    <AdminGuard>
      <TeamManager />
    </AdminGuard>
  );
}
