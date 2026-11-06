const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

const SIDE_LABELS: Record<string, string> = {
  attack: 'Ataque',
  defense: 'Defesa',
};

const STATUS_LABELS: Record<string, string> = {
  approved: 'Publicada',
  pending: 'Em análise',
  rejected: 'Rejeitada',
};

function label(map: Record<string, string>, value?: string | null) {
  if (!value) return '';
  return map[value] ?? value;
}

export function labelDifficulty(value?: string | null) {
  return label(DIFFICULTY_LABELS, value);
}

export function labelSide(value?: string | null) {
  return label(SIDE_LABELS, value);
}

export function labelStatus(value?: string | null) {
  return label(STATUS_LABELS, value);
}
