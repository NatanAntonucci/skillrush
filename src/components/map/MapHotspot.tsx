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
          ? 'h-10 w-10 border-2 border-cyan-400 bg-cyan-500/95 shadow-cyan-500/40'
          : 'h-6 w-6 border border-cyan-500 bg-cyan-500/80 shadow-cyan-500/20 hover:h-8 hover:w-8 hover:bg-cyan-400'
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
          className="h-5 w-5 rounded-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-white">•</span>
      )}
    </button>
  );
}