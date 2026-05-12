'use client';

interface MapHotspotProps {
  label: string;
  x: number;
  y: number;
  onClick: () => void;
}

export function MapHotspot({ label, x, y, onClick }: MapHotspotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-cyan-500/90 text-xs text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      title={label}
    >
      <span className="font-semibold leading-none">{label}</span>
    </button>
  );
}