'use client';

interface MapHotspotProps {
  abilityIcon?: string | null;
  x: number;
  y: number;
  isSelected?: boolean;
  onClick: () => void;
}

export function MapHotspot({ abilityIcon, x, y, isSelected = false, onClick }: MapHotspotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition shadow-lg ${ 
        isSelected
          ? 'h-12 w-12 border-2 border-cyan-400 bg-cyan-500/95 shadow-cyan-500/40'
          : 'h-8 w-8 border-2 border-cyan-500 bg-cyan-500/80 shadow-cyan-500/20 hover:h-10 hover:w-10 hover:bg-cyan-400'
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      title="Clique para selecionar"
    >
      {abilityIcon ? (
        <img
          src={abilityIcon}
          alt="Habilidade"
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-white">•</span>
      )}
    </button>
  );
}