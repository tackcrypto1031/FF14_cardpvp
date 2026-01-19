import React, { useState } from 'react';
import { CardData, CardType, GameRules, BoardSlot, LogEntry, ThemeMode } from './types';
import { INITIAL_HAND, INITIAL_RULES, parseStat } from './constants';
import { resolvePlacement, getBestMove, MoveSuggestion } from './services/gameLogic';
import GameControls from './components/GameControls';
import Hand from './components/Hand';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import EnemyModal from './components/EnemyModal';

const App: React.FC = () => {
  // State
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [hand, setHand] = useState<CardData[]>(INITIAL_HAND);
  const [board, setBoard] = useState<BoardSlot[]>(Array(9).fill(null));
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
    setHand(newHand);
    setSuggestion(null);
  };

  const handleTypeChange = (cardIdx: number, type: CardType) => {
    const newHand = [...hand];
    newHand[cardIdx].type = type;
    setHand(newHand);
    setSuggestion(null);
  };

  const toggleRule = (rule: keyof GameRules) => {
    setRules(prev => ({ ...prev, [rule]: !prev[rule] }));
    setSuggestion(null);
  };

  const calculateBestMove = (currentBoard: BoardSlot[] = board) => {
    const best = getBestMove(currentBoard, hand, rules);
    setSuggestion(best);
    if (best) {
      setLogs(prev => [{ message: `戰術建議：將「${hand[best.cardIdx].name}」放置於 ${best.slotIdx + 1} 號位`, type: 'info' }, ...prev]);
    }
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (!isCardSelectable(idx) || editMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardIdx', idx.toString());
    setSelectedCardIdx(idx);
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
    if (!isNaN(cardIdx) && board[slotIdx] === null && isCardSelectable(cardIdx)) {
      placeCardOnBoard(slotIdx, hand[cardIdx]);
      setSelectedCardIdx(null);
      setSuggestion(null);
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
    newBoard[slotIdx] = card;
    const result = resolvePlacement(newBoard, slotIdx, rules);
    setBoard(result.newBoard);
    setLogs(prev => [...result.logs, ...prev]);
    return result.newBoard;
  };

  const confirmEnemyPlacement = () => {
    if (targetSlot === null) return;
    const newEnemyCard: CardData = {
      id: `enemy-${Date.now()}`,
      name: '敵方單位',
      type: enemyType,
      owner: 'red',
      stats: {
        top: parseStat(enemyStats.top) as any,
        right: parseStat(enemyStats.right) as any,
        bottom: parseStat(enemyStats.bottom) as any,
        left: parseStat(enemyStats.left) as any,
      }
    };
    const updatedBoard = placeCardOnBoard(targetSlot, newEnemyCard);
    setShowEnemyModal(false);
    setTimeout(() => calculateBestMove(updatedBoard), 100);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setLogs([]);
    setSuggestion(null);
  };

  const resetAll = () => {
    resetBoard();
    setHand(INITIAL_HAND);
    setRules(INITIAL_RULES);
    setEditMode(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans flex items-center justify-center p-4 ${
      isDark ? 'bg-[#030305] text-amber-50' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Cinematic Background Texture */}
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
          onResetBoard={resetBoard}
          onResetAll={resetAll}
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
          />

          {/* Center Panel: Board */}
          <section className="flex-1 flex flex-col relative z-0">
             {/* Center Background Glow */}
             <div className={`absolute inset-0 pointer-events-none opacity-20 ${
               isDark 
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
               onClick={handleBoardClick}
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

          {/* Right Panel: Info & Logs */}
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