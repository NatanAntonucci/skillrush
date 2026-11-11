'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, Copy, Link2, Share2 } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  path: string;
  align?: 'left' | 'right';
}

interface Position {
  top: number;
  left: number;
}

const MENU_WIDTH = 240;
const MENU_HEIGHT = 300;

export function ShareMenu({ title, path, align = 'right' }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(path);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  // Posiciona o menu com coordenadas fixas: assim ele escapa de qualquer
  // container com overflow (modal, lista com scroll) e não fica cortado.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 8;

    let left = align === 'right' ? rect.right - MENU_WIDTH : rect.left;
    left = Math.min(Math.max(margin, left), window.innerWidth - MENU_WIDTH - margin);

    let top = rect.bottom + margin;
    if (top + MENU_HEIGHT > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - MENU_HEIGHT - margin);
    }

    setPosition({ top, left });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    function close() {
      setOpen(false);
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard bloqueado
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // cancelado
      }
    }
  }

  const text = encodeURIComponent(`${title} — Skillrush`);
  const link = encodeURIComponent(url);

  const targets = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${link}` },
    { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${text}&url=${link}` },
    { label: 'Telegram', href: `https://t.me/share/url?url=${link}&text=${text}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
  ];

  return (
    <div className="inline-flex">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-accent-400 hover:text-white active:scale-[0.98]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Share2 size={13} />
        Compartilhar
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          className="animate-fade-in fixed z-[80] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl"
        >
          {targets.map((target) => (
            <a
              key={target.label}
              href={target.href}
              target="_blank"
              rel="noreferrer noopener"
              className="block px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-accent-300"
              onClick={() => setOpen(false)}
            >
              {target.label}
            </a>
          ))}

          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-2 border-t border-slate-800 px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-accent-300"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={nativeShare}
              className="flex w-full items-center gap-2 border-t border-slate-800 px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-900 hover:text-accent-300"
            >
              <Link2 size={14} />
              Mais opções…
            </button>
          )}

          <p className="border-t border-slate-800 px-4 py-2 text-[11px] leading-snug text-slate-500">
            Instagram não aceita link direto — use “copiar link”.
          </p>
        </div>
      )}
    </div>
  );
}
