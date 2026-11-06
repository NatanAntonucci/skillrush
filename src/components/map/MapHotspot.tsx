'use client';

interface MapHotspotProps {
  abilityIcon?: string | null;
  x: number;
  y: number;
  label?: string;
  isSelected?: boolean;
  onClick: () => void;
}

/**
 * Alvo de toque de 44px com círculo visual menor (~30px), para não cobrir
 * lineups vizinhas no mapa.
 */
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
      className="group absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      style={{ left: `${x}%`, top: `${y}%` }}
      title={label ? `Hotspot ${label} — clique para ver a lineup` : 'Clique para ver a lineup'}
      aria-label={label ? `Hotspot ${label}` : 'Hotspot'}
    >
      <span
        className={`flex items-center justify-center rounded-full border transition-all duration-200 ${
          isSelected
            ? 'h-9 w-9 border-2 border-accent-200 bg-accent-400 shadow-lg shadow-accent-500/50'
            : 'h-7 w-7 border border-accent-300/70 bg-accent-500/85 shadow-md shadow-accent-900/40 group-hover:h-9 group-hover:w-9 group-hover:bg-accent-400'
        }`}
      >
        {abilityIcon ? (
          <img src={abilityIcon} alt="" className="h-4 w-4 rounded-full object-contain" />
        ) : (
          <span className="text-[11px] font-bold text-slate-950">{label ?? '•'}</span>
        )}
      </span>
    </button>
  );
}
