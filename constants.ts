
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
  { id: 'c1', name: '九宮幻卡 1', stats: { top: 1, right: 2, bottom: 3, left: 4 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c2', name: '九宮幻卡 2', stats: { top: 5, right: 5, bottom: 5, left: 5 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c3', name: '九宮幻卡 3', stats: { top: 8, right: 8, bottom: 2, left: 3 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c4', name: '九宮幻卡 4', stats: { top: 1, right: 9, bottom: 9, left: 1 }, type: CardType.NONE, owner: 'blue' },
  { id: 'c5', name: '九宮幻卡 5', stats: { top: 10, right: 10, bottom: 1, left: 1 }, type: CardType.NONE, owner: 'blue' },
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

export const STORAGE_KEY_DECKS = 'ff14-cardpvp-decks';
export const STORAGE_KEY_ACTIVE_DECK_ID = 'ff14-cardpvp-active-deck-id';
export const MAX_DECKS = 10;

