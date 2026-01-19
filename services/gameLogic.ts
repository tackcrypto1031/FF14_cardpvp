import { BoardSlot, CardData, CardType, GameRules, LogEntry } from '../types';

// Grid Adjacency Mapping (Index 0-8)
// 0 1 2
// 3 4 5
// 6 7 8
const ADJACENCY = [
  { u: null, d: 3, l: null, r: 1 },    // 0
  { u: null, d: 4, l: 0, r: 2 },       // 1
  { u: null, d: 5, l: 1, r: null },    // 2
  { u: 0, d: 6, l: null, r: 4 },       // 3
  { u: 1, d: 7, l: 3, r: 5 },          // 4
  { u: 2, d: 8, l: 4, r: null },       // 5
  { u: 3, d: null, l: null, r: 7 },    // 6
  { u: 4, d: null, l: 6, r: 8 },       // 7
  { u: 5, d: null, l: 7, r: null },    // 8
];

// Helper: Calculate type counts on the board for Ascension/Descension
const getBoardTypeCounts = (board: BoardSlot[]): Map<CardType, number> => {
  const counts = new Map<CardType, number>();
  board.forEach(card => {
    if (card && card.type !== CardType.NONE) {
      counts.set(card.type, (counts.get(card.type) || 0) + 1);
    }
  });
  return counts;
};

// Helper: Get effective stat based on rules and board state
const getEffectiveStat = (
  card: CardData, 
  side: 'top' | 'right' | 'bottom' | 'left', 
  typeCounts: Map<CardType, number>, 
  rules: GameRules
): number => {
  let val = card.stats[side];
  
  if ((rules.ascension || rules.descension) && card.type !== CardType.NONE) {
    const count = typeCounts.get(card.type) || 0;
    if (rules.ascension) val += count;
    if (rules.descension) val -= count;
  }

  return Math.max(1, Math.min(10, val));
};

// Determine if Attacker flips Defender based on Basic/Reverse/FallenAce
const checksFlip = (attackVal: number, defendVal: number, rules: GameRules): boolean => {
  let wins = false;
  
  // Fallen Ace: 1 beats A (10). Reverse Fallen Ace: A (10) beats 1.
  if (rules.fallenAce) {
     if (!rules.reverse && attackVal === 1 && defendVal === 10) return true;
     if (rules.reverse && attackVal === 10 && defendVal === 1) return true;
  }

  if (rules.reverse) {
    wins = attackVal < defendVal;
  } else {
    wins = attackVal > defendVal;
  }
  return wins;
};

// Main resolution function
export const resolvePlacement = (
  board: BoardSlot[],
  placedCardIndex: number,
  rules: GameRules
): { newBoard: BoardSlot[]; logs: LogEntry[] } => {
  const newBoard = [...board];
  const logs: LogEntry[] = [];
  const placedCard = newBoard[placedCardIndex];

  if (!placedCard) return { newBoard, logs };

  // Calculate buffs for the current board state (placed card is already in newBoard)
  const typeCounts = getBoardTypeCounts(newBoard);

  // Queue for Combo chain. Stores index of card that just flipped others.
  const comboQueue: number[] = []; 
  
  // 1. Check Special Rules (Same / Plus) immediate trigger
  // These rules only apply to the card JUST placed.
  const adjIds = ADJACENCY[placedCardIndex];
  
  // Helper to construct neighbor info with effective stats
  const getNeighborInfo = (dir: 'u'|'d'|'l'|'r', idx: number | null, atkSide: 'top'|'bottom'|'left'|'right', defSide: 'top'|'bottom'|'left'|'right') => {
    if (idx === null) return null;
    const target = newBoard[idx];
    if (!target) return null;
    
    return {
      idx,
      card: target,
      atkStat: getEffectiveStat(placedCard, atkSide, typeCounts, rules),
      defStat: getEffectiveStat(target, defSide, typeCounts, rules)
    };
  };

  const activeNeighbors = [
    getNeighborInfo('u', adjIds.u, 'top', 'bottom'),
    getNeighborInfo('d', adjIds.d, 'bottom', 'top'),
    getNeighborInfo('l', adjIds.l, 'left', 'right'),
    getNeighborInfo('r', adjIds.r, 'right', 'left'),
  ].filter((n): n is NonNullable<typeof n> => n !== null);

  const flippedBySpecial = new Set<number>();

  // --- SAME Rule Logic ---
  if (rules.same) {
    const matches: number[] = [];
    activeNeighbors.forEach(n => {
      if (n.atkStat === n.defStat) {
        matches.push(n.idx);
      }
    });

    if (matches.length >= 2) {
      logs.push({ message: `觸發「同數 (Same)」規則！`, type: 'info' });
      matches.forEach(idx => {
        if (newBoard[idx]!.owner !== placedCard.owner) {
          newBoard[idx] = { ...newBoard[idx]!, owner: placedCard.owner };
          logs.push({ message: `卡牌因「同數」翻面`, type: 'flip' });
          flippedBySpecial.add(idx);
          comboQueue.push(idx); // Trigger Combo
        }
      });
    }
  }

  // --- PLUS Rule Logic ---
  if (rules.plus) {
    const sums = new Map<number, number[]>();
    activeNeighbors.forEach(n => {
      const sum = n.atkStat + n.defStat;
      if (!sums.has(sum)) sums.set(sum, []);
      sums.get(sum)!.push(n.idx);
    });

    sums.forEach((indices, sumVal) => {
      if (indices.length >= 2) {
        logs.push({ message: `觸發「加算 (Plus)」規則 (總和 ${sumVal})！`, type: 'info' });
        indices.forEach(idx => {
          if (!flippedBySpecial.has(idx)) {
            if (newBoard[idx]!.owner !== placedCard.owner) {
              newBoard[idx] = { ...newBoard[idx]!, owner: placedCard.owner };
              logs.push({ message: `卡牌因「加算」翻面`, type: 'flip' });
              flippedBySpecial.add(idx);
              comboQueue.push(idx);
            }
          }
        });
      }
    });
  }

  // --- Basic Rule Logic (Direct Neighbors) ---
  activeNeighbors.forEach(n => {
    if (flippedBySpecial.has(n.idx)) return; // Already handled
    if (n.card.owner === placedCard.owner) return; // Don't attack friends with basic rule

    // Check basic flip using effective stats
    if (checksFlip(n.atkStat, n.defStat, rules)) {
      newBoard[n.idx] = { ...newBoard[n.idx]!, owner: placedCard.owner };
      logs.push({ message: `卡牌因數值比拼被佔領`, type: 'flip' });
    }
  });


  // --- COMBO Processing ---
  let comboIdx = 0;
  while (comboIdx < comboQueue.length) {
    const currentIdx = comboQueue[comboIdx];
    comboIdx++;
    
    const currentCard = newBoard[currentIdx]!;
    const cAdj = ADJACENCY[currentIdx];
    
    // Recalculate neighbors for combo propagation (using current board state counts)
    const getComboNeighbor = (idx: number | null, atkSide: 'top'|'bottom'|'left'|'right', defSide: 'top'|'bottom'|'left'|'right') => {
        if (idx === null) return null;
        const target = newBoard[idx];
        if (!target) return null;
        return {
            idx,
            target,
            atk: getEffectiveStat(currentCard, atkSide, typeCounts, rules),
            def: getEffectiveStat(target, defSide, typeCounts, rules)
        };
    };

    const cNeighbors = [
      getComboNeighbor(cAdj.u, 'top', 'bottom'),
      getComboNeighbor(cAdj.d, 'bottom', 'top'),
      getComboNeighbor(cAdj.l, 'left', 'right'),
      getComboNeighbor(cAdj.r, 'right', 'left'),
    ].filter((n): n is NonNullable<typeof n> => n !== null);

    cNeighbors.forEach(cn => {
      if (cn.target.owner === currentCard.owner) return; // Already ours

      if (checksFlip(cn.atk, cn.def, rules)) {
        newBoard[cn.idx] = { ...newBoard[cn.idx]!, owner: currentCard.owner };
        logs.push({ message: `連攜 (Combo)！觸發連鎖佔領。`, type: 'combo' });
        comboQueue.push(cn.idx); // Chain continues
      }
    });
  }

  return { newBoard, logs };
};

// --- SOLVER / AI SUGGESTION ---

export interface MoveSuggestion {
  cardIdx: number;
  slotIdx: number;
  score: number;
  flippedCount: number;
}

export const getBestMove = (
  currentBoard: BoardSlot[],
  hand: CardData[],
  rules: GameRules
): MoveSuggestion | null => {
  let bestMove: MoveSuggestion | null = null;
  let maxScore = -999;

  // Identify available slots
  const availableSlots = currentBoard
    .map((slot, idx) => (slot === null ? idx : null))
    .filter((idx): idx is number => idx !== null);

  // Identify used cards
  const usedCardIds = new Set(
    currentBoard
      .filter((slot): slot is CardData => slot !== null)
      .map(card => card.id)
  );

  // Filter valid cards based on ORDER rule
  let validCardsIndices: number[] = [];
  
  if (rules.order) {
    // If Order rule is active, find the FIRST unused card. That is the ONLY valid move.
    const firstUnusedIdx = hand.findIndex(c => !usedCardIds.has(c.id));
    if (firstUnusedIdx !== -1) {
      validCardsIndices = [firstUnusedIdx];
    }
  } else {
    // Otherwise, all unused cards are valid
    validCardsIndices = hand.map((_, i) => i).filter(i => !usedCardIds.has(hand[i].id));
  }

  for (const cIdx of validCardsIndices) {
    const card = hand[cIdx];
    
    for (const slotIdx of availableSlots) {
      // 1. Simulate placement
      let simBoard = [...currentBoard];
      simBoard[slotIdx] = card; // Place card

      const result = resolvePlacement(simBoard, slotIdx, rules);
      const finalBoard = result.newBoard;

      // 2. Score the board
      let blueCount = 0;
      finalBoard.forEach(c => {
        if (c && c.owner === 'blue') blueCount++;
      });

      const score = blueCount;

      if (score > maxScore) {
        maxScore = score;
        bestMove = {
          cardIdx: cIdx,
          slotIdx: slotIdx,
          score: score,
          flippedCount: blueCount
        };
      }
    }
  }

  return bestMove;
};