import React, { useState } from 'react';
import { Settings, RotateCcw, AlertCircle, Play, X, Sword, Shield, Lightbulb, Calculator } from 'lucide-react';
import Card from './components/Card';
import { CardData, CardType, GameRules, BoardSlot, LogEntry } from './types';
import { INITIAL_HAND, INITIAL_RULES, parseStat, displayStat } from './constants';
import { resolvePlacement, getBestMove, MoveSuggestion } from './services/gameLogic';

const App: React.FC = () => {
  // State
  const [hand, setHand] = useState<CardData[]>(INITIAL_HAND);
  const [board, setBoard] = useState<BoardSlot[]>(Array(9).fill(null));
  const [rules, setRules] = useState<GameRules>(INITIAL_RULES);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [editMode, setEditMode] = useState<boolean>(true);
  
  // Suggestion State
  const [suggestion, setSuggestion] = useState<MoveSuggestion | null>(null);

  // Drag and Drop State
  const [dragOverSlotIdx, setDragOverSlotIdx] = useState<number | null>(null);

  // Enemy Input Modal State
  const [showEnemyModal, setShowEnemyModal] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const [enemyStats, setEnemyStats] = useState({ top: '', right: '', bottom: '', left: '' });

  // Mapping for Rules Display
  const RULE_NAMES: Record<keyof GameRules, string> = {
    reverse: "逆轉 (Reverse)",
    fallenAce: "王牌殺手 (Fallen Ace)",
    same: "同數 (Same)",
    plus: "加算 (Plus)",
    ascension: "同類強化 (Ascension)",
    descension: "同類弱化 (Descension)",
    order: "秩序 (Order)"
  };

  // Derive used cards
  const usedCardIds = new Set(board.filter((c) => c !== null).map((c) => c!.id));
  
  // Calculate valid cards for Order rule
  const firstUnusedHandIdx = hand.findIndex(c => !usedCardIds.has(c.id));

  // Helper to check if a card is selectable
  const isCardSelectable = (idx: number) => {
    if (editMode) return false;
    if (usedCardIds.has(hand[idx].id)) return false;
    if (rules.order && idx !== firstUnusedHandIdx) return false;
    return true;
  };

  // --- Actions ---

  const handleStatChange = (cardIdx: number, stat: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const val = parseStat(value);
    const newHand = [...hand];
    newHand[cardIdx].stats[stat] = val as any;
    setHand(newHand);
    setSuggestion(null);
  };

  const toggleRule = (rule: keyof GameRules) => {
    setRules(prev => ({ ...prev, [rule]: !prev[rule] }));
    setSuggestion(null);
  };

  // --- Solver ---
  const calculateBestMove = (currentBoard: BoardSlot[]) => {
    const best = getBestMove(currentBoard, hand, rules);
    setSuggestion(best);
    if (best) {
      setLogs(prev => [...prev, { message: `系統建議：使用卡牌 ${hand[best.cardIdx].name} 放置於位置 ${best.slotIdx + 1}`, type: 'info' }]);
    } else {
      const isBoardFull = currentBoard.every(slot => slot !== null);
      if (!isBoardFull) {
         setLogs(prev => [...prev, { message: `無可用建議 (手牌可能已用盡)`, type: 'info' }]);
      }
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (!isCardSelectable(idx)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardIdx', idx.toString());
    e.dataTransfer.effectAllowed = 'move';
    setSelectedCardIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault(); 
    if (board[slotIdx] === null) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragEnter = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (board[slotIdx] === null) {
      setDragOverSlotIdx(slotIdx);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlotIdx(null);
  };

  const handleDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    setDragOverSlotIdx(null);

    const cardIdxStr = e.dataTransfer.getData('cardIdx');
    if (!cardIdxStr) return;

    const cardIdx = parseInt(cardIdxStr, 10);
    if (isNaN(cardIdx) || board[slotIdx] !== null) return;
    
    if (!isCardSelectable(cardIdx)) return;

    placeCardOnBoard(slotIdx, hand[cardIdx]);
    setSelectedCardIdx(null);
    setSuggestion(null); 
  };


  // --- Click Handlers ---
  const handleBoardClick = (slotIdx: number) => {
    if (board[slotIdx] !== null) return; 

    // Placing My Card
    if (selectedCardIdx !== null) {
      if (!isCardSelectable(selectedCardIdx)) return;

      const cardToPlace = hand[selectedCardIdx];
      placeCardOnBoard(slotIdx, cardToPlace);
      setSelectedCardIdx(null);
      setSuggestion(null);
    } 
    // Placing Enemy Card
    else {
      setTargetSlot(slotIdx);
      setEnemyStats({ top: '', right: '', bottom: '', left: '' });
      setShowEnemyModal(true);
    }
  };

  const placeCardOnBoard = (slotIdx: number, card: CardData) => {
    let newBoard = [...board];
    newBoard[slotIdx] = card;
    const result = resolvePlacement(newBoard, slotIdx, rules);
    setBoard(result.newBoard);
    setLogs(prev => [...prev, ...result.logs]);
    return result.newBoard;
  };

  const handleEnemyStatInput = (stat: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    setEnemyStats(prev => ({ ...prev, [stat]: value }));
  };

  const confirmEnemyPlacement = () => {
    if (targetSlot === null) return;

    const newEnemyCard: CardData = {
      id: `enemy-${Date.now()}`,
      name: 'Enemy',
      type: CardType.NONE,
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
    setTargetSlot(null);

    // Auto-Calculate Best Move after enemy placement
    setTimeout(() => {
        calculateBestMove(updatedBoard);
    }, 100);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setLogs([]);
    setSelectedCardIdx(null);
    setDragOverSlotIdx(null);
    setSuggestion(null);
  };

  const resetAll = () => {
    resetBoard();
    setHand(INITIAL_HAND);
    setRules(INITIAL_RULES);
    setEditMode(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 md:p-8 relative">
      
      {/* Enemy Input Modal */}
      {showEnemyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border-2 border-red-500 rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowEnemyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
              <Sword size={24} /> 登錄敵方卡牌
            </h3>
            <p className="text-sm text-gray-400 mb-6">請輸入敵方放置在該位置的數值</p>

            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-3 gap-2 w-48">
                {/* Top */}
                <div className="col-start-2">
                  <input 
                    autoFocus
                    type="text" maxLength={2}
                    value={enemyStats.top}
                    onChange={(e) => handleEnemyStatInput('top', e.target.value)}
                    className="w-full h-12 bg-gray-900 border-2 border-red-500/50 rounded text-center text-xl font-bold focus:border-red-400 outline-none"
                    placeholder="上"
                  />
                </div>
                {/* Left */}
                <div className="col-start-1 row-start-2">
                  <input 
                    type="text" maxLength={2}
                    value={enemyStats.left}
                    onChange={(e) => handleEnemyStatInput('left', e.target.value)}
                    className="w-full h-12 bg-gray-900 border-2 border-red-500/50 rounded text-center text-xl font-bold focus:border-red-400 outline-none"
                    placeholder="左"
                  />
                </div>
                {/* Right */}
                <div className="col-start-3 row-start-2">
                  <input 
                    type="text" maxLength={2}
                    value={enemyStats.right}
                    onChange={(e) => handleEnemyStatInput('right', e.target.value)}
                    className="w-full h-12 bg-gray-900 border-2 border-red-500/50 rounded text-center text-xl font-bold focus:border-red-400 outline-none"
                    placeholder="右"
                  />
                </div>
                {/* Bottom */}
                <div className="col-start-2 row-start-3">
                  <input 
                    type="text" maxLength={2}
                    value={enemyStats.bottom}
                    onChange={(e) => handleEnemyStatInput('bottom', e.target.value)}
                    className="w-full h-12 bg-gray-900 border-2 border-red-500/50 rounded text-center text-xl font-bold focus:border-red-400 outline-none"
                    placeholder="下"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={confirmEnemyPlacement}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors shadow-lg"
            >
              確認放置 (敵方)
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header */}
        <header className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between border-b border-gray-700 pb-4 mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500 tracking-wider">九宮幻卡 <span className="text-sm text-gray-400 font-normal ml-2">攻略小幫手</span></h1>
            <p className="text-gray-500 text-sm">NPC 對戰計算 / 實時解法</p>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={() => calculateBestMove(board)}
              className="flex items-center gap-2 px-4 py-2 bg-green-800 hover:bg-green-700 rounded text-sm transition-colors text-green-100"
            >
              <Lightbulb size={16} /> 取得建議
            </button>
             <button 
              onClick={resetBoard} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
            >
              <RotateCcw size={16} /> 重置盤面
            </button>
            <button 
              onClick={resetAll} 
              className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800 rounded text-sm transition-colors text-red-200"
            >
              <AlertCircle size={16} /> 新局開始
            </button>
          </div>
        </header>

        {/* Left Column: Deck Editor & Rules */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          
          {/* Deck Configuration */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                <Shield size={20}/> 我方手牌
              </h2>
              <button 
                onClick={() => setEditMode(!editMode)}
                className="text-xs uppercase tracking-wide text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded"
              >
                {editMode ? '完成設定' : '修改數值'}
              </button>
            </div>

            <div className="space-y-3">
              {hand.map((card, idx) => {
                const isSuggested = suggestion?.cardIdx === idx;
                const isUsed = usedCardIds.has(card.id);
                const selectable = isCardSelectable(idx);
                
                return (
                  <div key={card.id} className={`
                    relative flex items-center gap-4 p-3 rounded-lg border transition-all duration-300
                    ${isUsed 
                      ? 'bg-gray-900/20 border-gray-800 opacity-50 grayscale pointer-events-none' 
                      : !selectable && !editMode
                        ? 'bg-gray-900/20 border-gray-800 opacity-60' // Dim if disabled by Order
                        : isSuggested 
                          ? 'bg-green-900/30 border-green-500 ring-2 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] z-20' 
                          : selectedCardIdx === idx 
                            ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500 shadow-blue-500/20 shadow-lg scale-105 z-10' 
                            : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800'
                    }
                  `}>
                    {isSuggested && !isUsed && selectable && (
                       <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow rotate-[-90deg]">
                         推薦
                       </div>
                    )}
                    
                    {isUsed && (
                       <div className="absolute right-2 top-2 bg-gray-800 text-gray-500 text-[10px] font-bold px-2 py-1 rounded border border-gray-600">
                         已使用
                       </div>
                    )}
                    
                    {!isUsed && !selectable && !editMode && (
                        <div className="absolute right-2 top-2 bg-gray-800 text-gray-500 text-[10px] font-bold px-2 py-1 rounded border border-gray-600">
                          {rules.order ? '順序鎖定' : '不可用'}
                        </div>
                    )}

                    {/* Card Preview / Selector */}
                    <div 
                      className={`${!selectable ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
                      onClick={() => selectable && !editMode && setSelectedCardIdx(idx === selectedCardIdx ? null : idx)}
                    >
                      <Card 
                        card={card} 
                        size="sm" 
                        isSelected={selectedCardIdx === idx}
                        className="shrink-0"
                        draggable={selectable && !editMode}
                        onDragStart={(e) => handleDragStart(e, idx)}
                      />
                    </div>

                    {/* Inputs (Only visible in Edit Mode) */}
                    {editMode ? (
                      <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                        <div className="col-start-2">
                          <input 
                            disabled={isUsed}
                            type="text" maxLength={2} 
                            value={displayStat(card.stats.top)}
                            onChange={(e) => handleStatChange(idx, 'top', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded text-center text-sm focus:border-yellow-500 outline-none p-1 disabled:opacity-50"
                            placeholder="上"
                          />
                        </div>
                        <div className="col-start-1 row-start-2">
                          <input 
                            disabled={isUsed}
                            type="text" maxLength={2} 
                            value={displayStat(card.stats.left)}
                            onChange={(e) => handleStatChange(idx, 'left', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded text-center text-sm focus:border-yellow-500 outline-none p-1 disabled:opacity-50"
                            placeholder="左"
                          />
                        </div>
                        <div className="col-start-3 row-start-2">
                          <input 
                            disabled={isUsed}
                            type="text" maxLength={2} 
                            value={displayStat(card.stats.right)}
                            onChange={(e) => handleStatChange(idx, 'right', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded text-center text-sm focus:border-yellow-500 outline-none p-1 disabled:opacity-50"
                            placeholder="右"
                          />
                        </div>
                        <div className="col-start-2 row-start-3">
                          <input 
                            disabled={isUsed}
                            type="text" maxLength={2} 
                            value={displayStat(card.stats.bottom)}
                            onChange={(e) => handleStatChange(idx, 'bottom', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded text-center text-sm focus:border-yellow-500 outline-none p-1 disabled:opacity-50"
                            placeholder="下"
                          />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`flex-1 h-full flex flex-col justify-center pl-2 ${!selectable ? 'cursor-default' : 'cursor-pointer'}`}
                        onClick={() => selectable && setSelectedCardIdx(idx === selectedCardIdx ? null : idx)}
                      >
                        <div className={`font-bold mb-1 ${isUsed ? 'text-gray-500' : isSuggested && selectable ? 'text-green-400' : selectedCardIdx === idx ? 'text-blue-300' : 'text-gray-400'}`}>
                          {isUsed ? '已放置' : isSuggested && selectable ? '建議使用此卡' : selectedCardIdx === idx ? '已選擇' : `卡牌 ${card.name}`}
                        </div>
                        <div className="text-xs text-gray-600">
                          {isUsed 
                            ? '無法再次使用' 
                            : !selectable 
                              ? (rules.order ? '需按順序出牌' : '不可選取') 
                              : selectedCardIdx === idx 
                                ? '拖曳至盤面或點擊放置' 
                                : '點擊選取或直接拖曳'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rules Card */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-300">
              <Settings size={20} /> 當前規則
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(rules).map((key) => (
                <label key={key} className={`
                  flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border select-none
                  ${rules[key as keyof GameRules] ? 'bg-blue-900/40 border-blue-500 text-blue-200' : 'bg-gray-700/30 border-gray-600 text-gray-500'}
                `}>
                  <input 
                    type="checkbox" 
                    checked={rules[key as keyof GameRules]} 
                    onChange={() => toggleRule(key as keyof GameRules)}
                    className="hidden"
                  />
                  <span className="capitalize font-medium text-sm">
                    {RULE_NAMES[key as keyof GameRules] || key}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Center: The Board */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-6 pt-4 order-1 lg:order-2">
          
          <div className="relative">
            {/* Board Background */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-2xl border-4 border-gray-700">
              <div className="grid grid-cols-3 gap-3">
                {board.map((slot, idx) => {
                  const isSuggestedSlot = suggestion?.slotIdx === idx;
                  return (
                    <div 
                      key={idx}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnter={(e) => handleDragEnter(e, idx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                      onClick={() => handleBoardClick(idx)}
                      className={`
                        w-20 h-28 sm:w-24 sm:h-32 
                        relative rounded-lg border-2 border-dashed bg-gray-900/50
                        flex items-center justify-center transition-all duration-300
                        ${slot === null 
                          ? (isSuggestedSlot 
                              ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-105 z-10' // Suggestion Highlight
                              : dragOverSlotIdx === idx
                                ? 'bg-blue-500/30 border-blue-400 scale-105' 
                                : selectedCardIdx !== null 
                                  ? 'border-blue-500/50 hover:bg-blue-900/20 hover:border-blue-400 cursor-pointer' 
                                  : 'border-red-500/30 hover:bg-red-900/20 hover:border-red-400 cursor-pointer group')
                          : 'border-gray-600/50'}
                      `}
                    >
                      {isSuggestedSlot && slot === null && (
                         <div className="absolute top-2 right-2 text-green-400 animate-pulse">
                            <Lightbulb size={24} fill="currentColor" className="text-green-500/50"/>
                         </div>
                      )}

                      {slot ? (
                        <Card card={slot} size="md" className="!w-full !h-full pointer-events-none" />
                      ) : (
                        <>
                          <span className={`text-gray-700 font-bold text-2xl transition-opacity ${dragOverSlotIdx === idx ? 'opacity-0' : 'opacity-20 group-hover:opacity-0'}`}>
                            {idx + 1}
                          </span>
                          
                          {/* Suggestion Text */}
                          {isSuggestedSlot && (
                             <div className="absolute bottom-2 text-green-400 text-xs font-bold bg-gray-900/80 px-2 py-1 rounded">
                               推薦位置
                             </div>
                          )}

                          {/* Hover Hint (Only if not dragging my card and not selected) */}
                          {selectedCardIdx === null && dragOverSlotIdx === null && !isSuggestedSlot && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-400 text-xs font-bold text-center px-2 pointer-events-none">
                              <Sword size={16} className="mb-1 mx-auto"/>
                              記錄敵方
                            </div>
                          )}
                          {/* Drag Hint */}
                           {dragOverSlotIdx === idx && (
                            <div className="absolute inset-0 flex items-center justify-center text-blue-200 text-xs font-bold pointer-events-none">
                              放置
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700 max-w-sm">
            <h3 className="text-gray-300 text-sm font-bold uppercase tracking-widest border-b border-gray-700 pb-2 mb-2">操作指引</h3>
            <ul className="text-xs text-gray-400 text-left space-y-2 list-disc pl-4">
              <li>
                <span className="text-blue-400 font-bold">我方行動：</span> 系統會在您輸入敵方卡牌後，自動推薦最佳步數 (綠色光暈)。
              </li>
              <li>
                <span className="text-red-400 font-bold">敵方行動：</span> 點擊空白處輸入數值。
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Logs */}
        <div className="lg:col-span-3 h-full order-3">
           <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-full flex flex-col min-h-[300px]">
              <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
                <Play size={20} /> 對戰紀錄
              </h2>
              <div className="flex-1 overflow-y-auto bg-gray-900 rounded p-4 text-sm font-mono space-y-2 max-h-[500px]">
                {logs.length === 0 && (
                  <span className="text-gray-600 italic">等待行動...</span>
                )}
                {logs.map((log, i) => (
                  <div key={i} className={`
                    border-l-2 pl-2 py-1 leading-relaxed
                    ${log.type === 'combo' ? 'border-yellow-500 text-yellow-200' : ''}
                    ${log.type === 'flip' ? 'border-blue-500 text-blue-200' : ''}
                    ${log.type === 'info' ? 'border-gray-500 text-gray-400' : ''}
                  `}>
                    {log.message}
                  </div>
                ))}
                <div id="log-end" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;