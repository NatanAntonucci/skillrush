'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Link2, Share2 } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  path: string;
  align?: 'left' | 'right';
}

export function ShareMenu({ title, path, align = 'right' }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(path);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  useEffect(() => {
    if (!open) return;

    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard bloqueado
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // usuário cancelou
      }
    }
  }

  const text = encodeURIComponent(`${title} — Skillrush`);
  const link = encodeURIComponent(url);

  const targets = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${link}`, color: 'hover:text-emerald-300' },
    { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${text}&url=${link}`, color: 'hover:text-slate-100' },
    { label: 'Telegram', href: `https://t.me/share/url?url=${link}&text=${text}`, color: 'hover:text-sky-300' },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${link}`, color: 'hover:text-blue-300' },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500 active:scale-[0.98]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Share2 size={13} />
        Compartilhar
      </button>

      {open && (
        <div
          role="menu"
          className={`animate-fade-up absolute z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {targets.map((target) => (
            <a
              key={target.label}
              href={target.href}
              target="_blank"
              rel="noreferrer noopener"
              className={`block px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-900 ${target.color}`}
              onClick={() => setOpen(false)}
            >
              {target.label}
            </a>
          ))}

          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-2 border-t border-slate-800 px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-900"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={nativeShare}
              className="flex w-full items-center gap-2 border-t border-slate-800 px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-900"
            >
              <Link2 size={14} />
              Mais opções…
            </button>
          )}

          <p className="border-t border-slate-800 px-4 py-2 text-[11px] leading-snug text-slate-500">
            Instagram não aceita link direto — use “copiar link” e cole no story ou na bio.
          </p>
        </div>
      )}
    </div>
  );
}
