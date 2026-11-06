'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = value.trim();
    router.push(term ? `/buscar?q=${encodeURIComponent(term)}` : '/buscar');
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar agente, mapa ou lineup…"
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-4 pl-12 pr-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-accent-500"
      />
    </form>
  );
}
