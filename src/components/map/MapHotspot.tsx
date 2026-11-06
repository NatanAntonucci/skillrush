'use client';

interface MapHotspotProps {
  abilityIcon?: string | null;
  x: number;
  y: number;
  label?: string;
  isSelected?: boolean;
  onClick: () => void;
}

export function MapHotspot({
  abilityIcon,
  x,
  y,
  label,
  isSelected = false,
  onClick,
}: MapHotspotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all ${
        isSelected
          ? 'h-12 w-12 border-2 border-cyan-300 bg-cyan-500 shadow-cyan-500/50'
          : 'h-11 w-11 border border-cyan-400/80 bg-cyan-500/85 shadow-cyan-500/30 hover:bg-cyan-400'
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      title={label ? `Hotspot ${label} — clique para ver a lineup` : 'Clique para ver a lineup'}
      aria-label={label ? `Hotspot ${label}` : 'Hotspot'}
    >
      {abilityIcon ? (
        <img src={abilityIcon} alt="" className="h-6 w-6 rounded-full object-contain" />
      ) : (
        <span className="text-sm font-bold text-slate-950">{label ?? '•'}</span>
      )}
    </button>
  );
}
