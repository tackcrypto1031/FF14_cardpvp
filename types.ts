
export enum CardType {
  NONE = "無",
  PRIMAL = "蠻族",
  SCION = "血盟",
  BEASTMAN = "獸人",
  GARLEAN = "帝國",
}

export type StatValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface CardStats {
  top: StatValue;
  right: StatValue;
  bottom: StatValue;
  left: StatValue;
}

export interface CardData {
  id: string;
  name: string; // "A", "B", "C", "D", "E"
  stats: CardStats;
  type: CardType;
  owner: 'blue' | 'red'; // Blue = Player, Red = Opponent (simulated)
}

export type BoardSlot = CardData | null;

export interface GameRules {
  reverse: boolean;
  fallenAce: boolean;
  same: boolean;
  plus: boolean;
  ascension: boolean;
  descension: boolean;
  order: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface LogEntry {
  message: string;
  type: 'info' | 'combo' | 'flip';
}

export interface MoveSuggestion {
  cardIdx: number;
  slotIdx: number;
  score: number;
  flippedCount: number;
}
