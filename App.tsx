import React, { useState, useEffect } from 'react';
import { CardData, CardType, GameRules, BoardSlot, LogEntry, ThemeMode, MoveSuggestion, Deck } from './types';
import { INITIAL_HAND, INITIAL_RULES, parseStat, STORAGE_KEY_DECKS, STORAGE_KEY_ACTIVE_DECK_ID, MAX_DECKS } from './constants';
import { resolvePlacement, getBestMove } from './services/gameLogic';
import GameControls from './components/GameControls';
import Hand from './components/Hand';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import EnemyModal from './components/EnemyModal';
import EnemyHand from './components/EnemyHand';

const App: React.FC = () => {
  // State
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [hand, setHand] = useState<CardData[]>(INITIAL_HAND);
  const [board, setBoard] = useState<BoardSlot[]>(Array(9).fill(null));

  // Deck Management State
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DECKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Validate structure minimally
          if (parsed[0].cards && parsed[0].id) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse decks', e);
    }
    return [{ id: 'default', name: '預設牌組', cards: INITIAL_HAND }];
  });

  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_DECK_ID) || 'default';
  });

  // Sync hand with active deck on load
  useEffect(() => {
    const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0];
    if (activeDeck) {
      setHand(activeDeck.cards);
      if (activeDeck.id !== activeDeckId) setActiveDeckId(activeDeck.id);
    }
  }, [activeDeckId, decks]);

  // Persist decks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_DECK_ID, activeDeckId);
  }, [activeDeckId]);

  const updateActiveDeckCards = (newCards: CardData[]) => {
    setDecks(prev => prev.map(d => d.id === activeDeckId ? { ...d, cards: newCards } : d));
    setHand(newCards);
  };

  const handleAddDeck = () => {
    if (decks.length >= MAX_DECKS) {
      alert(`最多只能擁有 ${MAX_DECKS} 組牌組`);
      return;
    }
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name: `新牌組 ${decks.length + 1}`,
      cards: JSON.parse(JSON.stringify(INITIAL_HAND))
    };
    setDecks([...decks, newDeck]);
    setActiveDeckId(newDeck.id);
  };

  const handleDeleteDeck = (id: string) => {
    if (decks.length <= 1) {
      alert('至少需要保留一組牌組');
      return;
    }
    const newDecks = decks.filter(d => d.id !== id);
    setDecks(newDecks);
    if (activeDeckId === id) {
      setActiveDeckId(newDecks[0].id);
    }
  };

  const handleRenameDeck = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setDecks(decks.map(d => d.id === id ? { ...d, name: newName } : d));
  };

  const [rules, setRules] = useState<GameRules>(INITIAL_RULES);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<MoveSuggestion | null>(null);
  const [dragOverSlotIdx, setDragOverSlotIdx] = useState<number | null>(null);

  // Enemy Input Modal State
  const [showEnemyModal, setShowEnemyModal] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const [enemyStats, setEnemyStats] = useState({ top: '', right: '', bottom: '', left: '' });
  const [enemyType, setEnemyType] = useState<CardType>(CardType.NONE);

  // New Feature: Play Again / Last Opponent Memory
  const [lastEnemyCards, setLastEnemyCards] = useState<CardData[]>([]);

  // On mount check if we have saved enemy cards? (Optional, per request: "save current opponent for next game")
  // For now, in-memory state is sufficient for "Play Again".

  const usedCardIds = new Set(board.filter((c) => c !== null).map((c) => c!.id));
  const firstUnusedHandIdx = hand.findIndex(c => !usedCardIds.has(c.id));
  const isDark = theme === 'dark';

  const isCardSelectable = (idx: number) => {
    if (editMode) return true;
    if (usedCardIds.has(hand[idx].id)) return false;
    if (rules.order && idx !== firstUnusedHandIdx) return false;
    return true;
  };

  const handleStatChange = (cardIdx: number, stat: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const val = parseStat(value);
    const newHand = [...hand];
    newHand[cardIdx].stats[stat] = val as any;
    updateActiveDeckCards(newHand);
    setSuggestion(null);
  };

  const handleTypeChange = (cardIdx: number, type: CardType) => {
    const newHand = [...hand];
    newHand[cardIdx].type = type;
    updateActiveDeckCards(newHand);
    setSuggestion(null);
  };

  const toggleRule = (rule: keyof GameRules) => {
    setRules(prev => ({ ...prev, [rule]: !prev[rule] }));
    setSuggestion(null);
  };

  const calculateBestMove = (currentBoard: BoardSlot[] = board) => {
    const best = getBestMove(currentBoard, hand, rules, lastEnemyCards);
    setSuggestion(best);
    if (best) {
      setLogs(prev => [{ message: `戰術建議：將「${hand[best.cardIdx].name}」放置於 ${best.slotIdx + 1} 號位`, type: 'info' }, ...prev]);
    }
  };

  const handleDragStart = (e: React.DragEvent, idx: number, source: 'hand' | 'enemy' = 'hand') => {
    if (source === 'hand' && (!isCardSelectable(idx) || editMode)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardIdx', idx.toString());
    e.dataTransfer.setData('source', source);
    if (source === 'hand') {
      setSelectedCardIdx(idx);
    }
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (board[slotIdx] === null) e.dataTransfer.dropEffect = 'move';
    setDragOverSlotIdx(slotIdx);
  };

  const handleDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    setDragOverSlotIdx(null);
    const cardIdx = parseInt(e.dataTransfer.getData('cardIdx'), 10);
    const source = e.dataTransfer.getData('source');

    if (!isNaN(cardIdx) && board[slotIdx] === null) {
      if (source === 'enemy') {
        const enemyCard = lastEnemyCards[cardIdx];
        if (enemyCard) {
          placeCardOnBoard(slotIdx, enemyCard);
          // Do NOT remove from enemy hand to ensure persistence even if board is reset.
          // This allows users to place multiple copies (which is fine for simulation) 
          // and guarantees "Known Cards" are never lost during gameplay manipulation.
          setSuggestion(null);
        }
      } else if (isCardSelectable(cardIdx)) {
        placeCardOnBoard(slotIdx, hand[cardIdx]);
        setSelectedCardIdx(null);
        setSuggestion(null);
      }
    }
  };

  const handleBoardClick = (slotIdx: number) => {
    if (board[slotIdx] !== null) return;
    if (selectedCardIdx !== null && isCardSelectable(selectedCardIdx)) {
      placeCardOnBoard(slotIdx, hand[selectedCardIdx]);
      setSelectedCardIdx(null);
      setSuggestion(null);
    } else {
      setTargetSlot(slotIdx);
      setEnemyStats({ top: '', right: '', bottom: '', left: '' });
      setEnemyType(CardType.NONE);
      setShowEnemyModal(true);
    }
  };

  const placeCardOnBoard = (slotIdx: number, card: CardData) => {
    let newBoard = [...board];
    // Ensure originalOwner is set if not already
    const cardWithOriginalOwner = {
      ...card,
      originalOwner: card.originalOwner || card.owner
    };
    newBoard[slotIdx] = cardWithOriginalOwner;
    const result = resolvePlacement(newBoard, slotIdx, rules);
    setBoard(result.newBoard);

    const placementLog: LogEntry = {
      message: `${card.owner === 'blue' ? '玩家' : '敵方'}放置了「${card.name}」於 ${slotIdx + 1} 號位`,
      type: 'info'
    };

    setLogs(prev => [placementLog, ...result.logs, ...prev]);
    return result.newBoard;
  };

  const confirmEnemyPlacement = () => {
    if (targetSlot === null) return;
    const newEnemyCard: CardData = {
      id: `enemy-${Date.now()}`,
      name: '敵方單位',
      type: enemyType,
      owner: 'red',
      originalOwner: 'red',
      stats: {
        top: parseStat(enemyStats.top) as any,
        right: parseStat(enemyStats.right) as any,
        bottom: parseStat(enemyStats.bottom) as any,
        left: parseStat(enemyStats.left) as any,
      }
    };
    const updatedBoard = placeCardOnBoard(targetSlot, newEnemyCard);

    // Live Save: Immediately add this manually input card to known enemies
    // (Deduplicate only if exact ID already exists, but for manual input we likely want to add it as "seen")
    // If we want to avoid duplicates by NAME for live tracking, we can do that, but user said "Every card played".
    // We'll just add it. `handlePlayAgain` deals with merging later.
    setLastEnemyCards(prev => [...prev, newEnemyCard]);

    setShowEnemyModal(false);
    setTimeout(() => calculateBestMove(updatedBoard), 100);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setLogs([]);
    setSuggestion(null);
  };

  const handlePlayAgain = () => {
    // 1. Identify all Red/Enemy cards currently on board (checking original owner to catch captured ones)
    const currentEnemies = board.filter(c =>
      c !== null && (c.originalOwner === 'red' || (c.owner === 'red' && !c.originalOwner))
    ) as CardData[];

    // Restore their owner to 'red' for the next game (in case they were captured/blue)
    const restoredEnemies = currentEnemies.map(c => ({ ...c, owner: 'red' as const }));

    // Deduplicate: Keep new cards only if their name is not already in lastEnemyCards
    const uniqueNewEnemies = restoredEnemies.filter(newCard =>
      !lastEnemyCards.some(existing => existing.name === newCard.name)
    );

    const mergedEnemies = [...lastEnemyCards, ...uniqueNewEnemies];

    if (mergedEnemies.length > 0) {
      setLastEnemyCards(mergedEnemies);
      setLogs(prev => [{
        message: `對手資訊更新：新增 ${uniqueNewEnemies.length} 張，目前共已知 ${mergedEnemies.length} 張卡牌。`,
        type: 'success'
      }, ...prev]);
    } else if (lastEnemyCards.length > 0) {
      setLogs(prev => [{
        message: `載入已知的對手資訊 (${lastEnemyCards.length} 張卡牌)...`,
        type: 'info'
      }, ...prev]);
    } else {
      setLogs(prev => [{ message: '目前沒有對手卡牌資訊可供重玩', type: 'warning' }, ...prev]);
      return;
    }

    // 2. Reset Board & Restore Hand
    resetBoard();
    const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0];
    if (activeDeck) {
      setHand(JSON.parse(JSON.stringify(activeDeck.cards)));
    }

    // 3. (Optional) Could automatically place them? 
    // The request said: "Save opponent's card info... so I can play against them again".
    // It implies we should probably be ready to place them or highlight them. 
    // For this version, we'll keep them in `lastEnemyCards`.
    // When clicking empty slot, if we have `lastEnemyCards`, maybe we can suggest them?

    // NOTE: The user prompt says "Save opponent's card info for this round, so I can cope and play again".
    // It doesn't strictly say "Auto-place". 
    // We will show a toast/log.
  };

  // Modified Board Click to potentially use historical enemy data
  const handleBoardClickWithHistory = (slotIdx: number) => {
    if (board[slotIdx] !== null) return;

    if (selectedCardIdx !== null && isCardSelectable(selectedCardIdx)) {
      placeCardOnBoard(slotIdx, hand[selectedCardIdx]);
      setSelectedCardIdx(null);
      setSuggestion(null);
    } else {
      // Logic: If we have lastEnemyCards, maybe fill the modal with one of them?
      // Or just open the modal normally. The prompt was "Prompt on screen" too.
      // Let's stick to normal behavior but maybe show a "Load Last Enemy" option in the future.
      // Currently, just open modal.
      setTargetSlot(slotIdx);
      setEnemyStats({ top: '', right: '', bottom: '', left: '' });
      setEnemyType(CardType.NONE);
      setShowEnemyModal(true);
    }
  };

  const resetAll = () => {
    if (window.confirm("確定要初始化系統嗎？這將清除盤面與歷史紀錄，但保留您的牌組。")) {
      resetBoard();
      // Do NOT reset decks or hand here as per requirements ("Initializing system must not clear player card info")
      // Just reset game state
      setRules(INITIAL_RULES);
      setEditMode(false);
      setLastEnemyCards([]); // Clear opponent memory
      setLogs([{ message: '系統已初始化 (牌組得以保留)', type: 'info' }]);
    }
  };

  const cardsPlayedByMe = 5 - hand.filter(c => c !== null).length; // Filter nulls just in case, though hand is CardData[]
  const totalOnBoard = board.filter(c => c !== null).length;
  const cardsPlayedByEnemy = totalOnBoard - cardsPlayedByMe;
  const isPlayerTurn = cardsPlayedByMe <= cardsPlayedByEnemy;

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans flex items-center justify-center p-4 ${isDark ? 'bg-[#030305] text-amber-50' : 'bg-slate-50 text-slate-900'
      }`}>
      {/* ... effects ... */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isDark ? 'opacity-30' : 'opacity-5'}`}
        style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
          backgroundSize: '200px'
        }}
      />

      {/* Main App Container */}
      <div className={`
        relative w-full max-w-[1500px] h-[900px] flex flex-col rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border transition-all duration-500
        ${isDark
          ? 'bg-[#0a0a10]/90 border-amber-900/20 shadow-[0_0_80px_-20px_rgba(0,0,0,0.6)]'
          : 'bg-white/80 border-slate-200 shadow-[0_20px_60px_-10px_rgba(148,163,184,0.3)]'}
      `}>

        {/* Navigation & Controls */}
        <GameControls
          isDark={isDark}
          onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
          onCalculateBestMove={() => calculateBestMove()}
          onPlayAgain={handlePlayAgain}
          onResetBoard={resetBoard}
          onResetAll={resetAll}
          analysisDisabled={!isPlayerTurn}
        />

        {/* Game Workspace */}
        <main className="flex-1 flex overflow-hidden relative">

          {/* Left Panel: Hand */}
          <Hand
            hand={hand}
            editMode={editMode}
            selectedCardIdx={selectedCardIdx}
            usedCardIds={usedCardIds}
            suggestion={suggestion}
            isDark={isDark}
            theme={theme}
            onDragStart={handleDragStart}
            onSelectCard={(idx) => setSelectedCardIdx(idx)}
            onToggleEditMode={() => setEditMode(!editMode)}
            onStatChange={handleStatChange}
            onTypeChange={handleTypeChange}
            isCardSelectable={isCardSelectable}
            onLoadDeck={(newHand) => setHand(newHand)}
            decks={decks}
            activeDeckId={activeDeckId}
            onAddDeck={handleAddDeck}
            onDeleteDeck={handleDeleteDeck}
            onRenameDeck={handleRenameDeck}
            onSelectDeck={setActiveDeckId}
          />

          {/* Center Panel: Board */}
          <section className="flex-1 flex flex-col relative z-0">
            {/* Center Background Glow */}
            <div className={`absolute inset-0 pointer-events-none opacity-20 ${isDark
              ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent'
              : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent'
              }`} />

            <Board
              board={board}
              suggestion={suggestion}
              dragOverSlotIdx={dragOverSlotIdx}
              selectedCardIdx={selectedCardIdx}
              isDark={isDark}
              theme={theme}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBoardClickWithHistory}
            />

            {/* Footer Legend */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 opacity-50 pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.5)] rotate-45"></div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">玩家 (藍方)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.5)] rotate-45"></div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">敵方 (紅方)</span>
              </div>
            </div>
          </section>

          {/* Right Panel: Enemy Hand */}
          <EnemyHand
            cards={lastEnemyCards}
            isDark={isDark}
            theme={theme}
            onDragStart={(e, idx) => handleDragStart(e, idx, 'enemy')}
            usedCardIds={usedCardIds}
          />

          {/* Info & Logs Panel */}
          <GameInfo
            rules={rules}
            logs={logs}
            isDark={isDark}
            onToggleRule={toggleRule}
          />

        </main>

        {/* Modals */}
        <EnemyModal
          isOpen={showEnemyModal}
          stats={enemyStats}
          type={enemyType}
          isDark={isDark}
          onClose={() => setShowEnemyModal(false)}
          onStatChange={(stat, val) => setEnemyStats(prev => ({ ...prev, [stat]: val }))}
          onTypeChange={(t) => setEnemyType(t)}
          onConfirm={confirmEnemyPlacement}
        />

      </div>
    </div>
  );
};

export default App;