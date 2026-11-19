import type { DifficultyId, GameTypeId } from '../../game/types';

export const REGIONS = ['América do Sul', 'América do Norte', 'Europa', 'Ásia / Global'];

export const GAME_TYPES: { id: GameTypeId; label: string }[] = [
  { id: 'supremacy', label: 'Supremacia' },
  { id: 'conquest', label: 'Conquista' },
  { id: 'lightning', label: 'Relâmpago' },
  { id: 'deathmatch', label: 'Combate Mortal' },
  { id: 'regicide', label: 'Regicídio' },
];

export const AI_DIFFS: { id: DifficultyId; label: string }[] = [
  { id: 'easy', label: 'Fácil' },
  { id: 'normal', label: 'Normal' },
  { id: 'hard', label: 'Difícil' },
  { id: 'titan', label: 'Titã' },
];

export function formatMsgTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getStoredValue(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
