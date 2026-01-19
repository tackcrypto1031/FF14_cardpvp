import { BoardSlot, CardData, CardType, GameRules, LogEntry, MoveSuggestion } from '../types';

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

  // Value clamped between 1 and 10 (A)
  return Math.max(1, Math.min(10, val));
};

// Determine if Attacker flips Defender based on Basic/Reverse/FallenAce
const checksFlip = (attackVal: number, defendVal: number, rules: GameRules): boolean => {
  // Fallen Ace (Ace Killer): 1 beats A (10). 
  if (rules.fallenAce) {
     if (!rules.reverse && attackVal === 1 && defendVal === 10) return true;
     // If Reverse is also active: A (10) beats 1.
     if (rules.reverse && attackVal === 10 && defendVal === 1) return true;
  }

  if (rules.reverse) {
    // In Reverse, A (10) is the weakest, 1 is the strongest.
    // However, if Fallen Ace is also active, A beats 1 (handled above).
    // For other cases:
    return attackVal < defendVal;
  } else {
    return attackVal > defendVal;
  }
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

  // 1. Recalculate type counts after placement
  const typeCounts = getBoardTypeCounts(newBoard);

  // Queue for Combo chain. Stores index of card that just flipped others.
  const comboQueue: number[] = []; 
  
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

    // SAME triggers if 2 or more sides match
    if (matches.length >= 2) {
      let triggered = false;
      matches.forEach(idx => {
        if (newBoard[idx]!.owner !== placedCard.owner) {
          if (!triggered) {
            logs.push({ message: `觸發「同數 (Same)」規則！`, type: 'info' });
            triggered = true;
          }
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
        let triggered = false;
        indices.forEach(idx => {
          if (newBoard[idx]!.owner !== placedCard.owner) {
            if (!triggered) {
              logs.push({ message: `觸發「加算 (Plus)」規則 (總和 ${sumVal})！`, type: 'info' });
              triggered = true;
            }
            if (!flippedBySpecial.has(idx)) {
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
      // Note: In FF14, basic flips do NOT trigger Combo unless it's a chain from Same/Plus.
      // Wait, actually, the rule says "符合條件的對方卡牌被己方佔有後... 則可達成連擊條件「連攜」".
      // Usually "Combo" follows Same/Plus. Basic flips do NOT start a Combo chain.
    }
  });


  // --- COMBO Processing ---
  let comboIdx = 0;
  while (comboIdx < comboQueue.length) {
    const currentIdx = comboQueue[comboIdx];
    comboIdx++;
    
    const currentCard = newBoard[currentIdx]!;
    const cAdj = ADJACENCY[currentIdx];
    
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
    const firstUnusedIdx = hand.findIndex(c => !usedCardIds.has(c.id));
    if (firstUnusedIdx !== -1) {
      validCardsIndices = [firstUnusedIdx];
    }
  } else {
    validCardsIndices = hand.map((_, i) => i).filter(i => !usedCardIds.has(hand[i].id));
  }

  for (const cIdx of validCardsIndices) {
    const card = hand[cIdx];
    
    for (const slotIdx of availableSlots) {
      let simBoard = [...currentBoard];
      simBoard[slotIdx] = { ...card, owner: 'blue' }; // Ensure blue owner for simulation

      const result = resolvePlacement(simBoard, slotIdx, rules);
      const finalBoard = result.newBoard;

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
