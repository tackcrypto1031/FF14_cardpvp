
import { CardData, CardType, GameRules } from './types';

export const INITIAL_RULES: GameRules = {
  reverse: false,
  fallenAce: false,
  same: false,
  plus: false,
  ascension: false,
  descension: false,
  order: false,
};

export const INITIAL_HAND: CardData[] = [
  { id: 'c1', name: 'A', stats: { top: 1, right: 2, bottom: 3, left: 4 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c2', name: 'B', stats: { top: 5, right: 5, bottom: 5, left: 5 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c3', name: 'C', stats: { top: 8, right: 8, bottom: 2, left: 3 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c4', name: 'D', stats: { top: 1, right: 9, bottom: 9, left: 1 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c5', name: 'E', stats: { top: 10, right: 10, bottom: 1, left: 1 }, type: CardType.NONE, owner: 'blue' },
];

// Helper to convert input string "A" to 10
export const parseStat = (val: string): number => {
  if (val.toUpperCase() === 'A') return 10;
  const num = parseInt(val, 10);
  if (isNaN(num)) return 1;
  return Math.max(1, Math.min(10, num));
};

export const displayStat = (val: number): string => {
  return val === 10 ? 'A' : val.toString();
};
