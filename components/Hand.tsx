import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Edit2, Check, ChevronRight, Save, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
import Card from './Card';
import { CardData, CardType, ThemeMode, MoveSuggestion } from '../types';
import { displayStat } from '../constants';

interface HandProps {
  hand: CardData[];
  editMode: boolean;
  selectedCardIdx: number | null;
  usedCardIds: Set<string>;
  suggestion: MoveSuggestion | null;
  isDark: boolean;
  theme: ThemeMode;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onSelectCard: (idx: number | null) => void;
  onToggleEditMode: () => void;
  onStatChange: (idx: number, stat: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
  onTypeChange: (idx: number, type: CardType) => void;
  isCardSelectable: (idx: number) => boolean;
  onLoadDeck: (newHand: CardData[]) => void;
}

const Hand: React.FC<HandProps> = ({
  hand,
  editMode,
  selectedCardIdx,
  usedCardIds,
  suggestion,
  isDark,
  theme,
  onDragStart,
  onSelectCard,
  onToggleEditMode,
  onStatChange,
  onTypeChange,
  isCardSelectable,
  onLoadDeck,
}) => {
  const handleSaveDeck = () => {
    localStorage.setItem('ff14-cardpvp-deck', JSON.stringify(hand));
    // Optional: Show a toast or feedback
    alert('牌組已儲存！');
  };

  const handleLoadDeck = () => {
    const saved = localStorage.getItem('ff14-cardpvp-deck');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        onLoadDeck(parsed);
      } catch (e) {
        console.error('Failed to load deck', e);
      }
    } else {
      alert('找不到儲存的牌組！');
    }
  };

  return (
    <section
      className={clsx(
        'w-80 border-r flex flex-col relative overflow-hidden transition-colors duration-500',
        isDark ? 'border-amber-900/20 bg-black/40' : 'border-slate-200 bg-slate-50/50'
      )}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className={clsx(
            "absolute -right-20 top-20 w-64 h-64 rounded-full blur-3xl",
            isDark ? "bg-amber-500" : "bg-blue-500"
        )} />
      </div>

      {/* Header */}
      <div className="p-6 pb-4 flex flex-col gap-4 z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={clsx(
                    "p-1.5 rounded-lg shadow-inner",
                    isDark ? "bg-amber-900/20 text-amber-500 shadow-black/40" : "bg-white text-blue-600 shadow-slate-200"
                )}>
                    <Shield size={18} />
                </div>
                 <div>
                    <h2 className={clsx(
                        "text-xs font-bold tracking-[0.2em] uppercase",
                        isDark ? "text-amber-100" : "text-slate-800"
                    )}>
                    牌組配置
                    </h2>
                    <p className={clsx(
                        "text-[10px] font-medium opacity-50",
                        isDark ? "text-amber-200" : "text-slate-500"
                    )}>
                        {editMode ? '編輯模式' : '準備戰鬥'}
                    </p>
                </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleEditMode}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm backdrop-blur-sm',
                editMode
                  ? (isDark ? 'bg-amber-500 text-black border-amber-400 shadow-amber-900/20' : 'bg-blue-600 text-white border-blue-500 shadow-blue-200')
                  : (isDark ? 'bg-amber-900/10 text-amber-500 border-amber-900/30 hover:bg-amber-900/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
              )}
            >
               {editMode ? <Check size={12} strokeWidth={3} /> : <Edit2 size={12} strokeWidth={3} />}
              {editMode ? '完成' : '編輯'}
            </motion.button>
        </div>

        {/* Deck Tools */}
        {editMode && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <button
              onClick={handleSaveDeck}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-bold border transition-colors",
                isDark ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/10" : "border-slate-300 text-slate-600 hover:bg-slate-100"
              )}
            >
              <Save size={12} />
              儲存牌組
            </button>
            <button
              onClick={handleLoadDeck}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-bold border transition-colors",
                isDark ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/10" : "border-slate-300 text-slate-600 hover:bg-slate-100"
              )}
            >
              <FolderOpen size={12} />
              讀取牌組
            </button>
          </motion.div>
        )}
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar z-10">
        <AnimatePresence mode='popLayout'>
            {hand.map((card, idx) => {
            const isSuggested = suggestion?.cardIdx === idx;
            const isUsed = usedCardIds.has(card.id);
            const selectable = isCardSelectable(idx);
            const isSelected = selectedCardIdx === idx;

            return (
                <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className={clsx(
                    'group relative rounded-lg border transition-all duration-300 overflow-hidden',
                    editMode ? 'p-3' : 'p-2 flex items-center gap-3',
                    isUsed 
                        ? (isDark ? 'opacity-30 grayscale border-transparent bg-white/5' : 'opacity-30 grayscale border-slate-100 bg-slate-100')
                        : selectable
                            ? isSelected
                                ? (isDark ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-blue-400 bg-blue-50 shadow-md')
                                : (isDark ? 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10' : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm')
                            : 'opacity-50 cursor-not-allowed border-dashed'
                )}
                >
                
                {/* Suggestion Indicator */}
                {isSuggested && !isUsed && !editMode && (
                    <motion.div 
                        layoutId="suggestion-glow"
                        className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none z-20 opacity-50"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}

                {/* Card Preview */}
                <div 
                    className={clsx(
                        "relative z-10 transition-transform duration-300",
                        !selectable || editMode ? '' : 'cursor-grab active:cursor-grabbing group-hover:scale-105',
                        editMode ? 'flex items-center gap-4 mb-3' : ''
                    )}
                    onClick={() => !editMode && selectable && onSelectCard(isSelected ? null : idx)}
                >
                    <Card 
                        card={card} 
                        theme={theme} 
                        size="sm" 
                        isSelected={isSelected} 
                        draggable={selectable && !editMode} 
                        onDragStart={(e) => onDragStart(e, idx)} 
                    />
                    
                    {editMode && (
                        <div className="flex-1 min-w-0">
                            <h3 className={clsx("text-xs font-bold truncate", isDark ? "text-amber-100" : "text-slate-900")}>
                                {card.name}
                            </h3>
                             <p className={clsx("text-[10px] opacity-60", isDark ? "text-amber-200" : "text-slate-500")}>
                                編號: {card.id}
                            </p>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 relative z-10">
                    {editMode ? (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            {/* Stat Grid */}
                             <div className="grid grid-cols-3 gap-2 place-items-center bg-black/20 p-2 rounded-md">
                                <div className="col-start-2">
                                    <StatInput 
                                        value={displayStat(card.stats.top)} 
                                        onChange={(v) => onStatChange(idx, 'top', v)}
                                        label="上"
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="col-start-1 row-start-2">
                                    <StatInput 
                                        value={displayStat(card.stats.left)} 
                                        onChange={(v) => onStatChange(idx, 'left', v)}
                                        label="左"
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="col-start-3 row-start-2">
                                    <StatInput 
                                        value={displayStat(card.stats.right)} 
                                        onChange={(v) => onStatChange(idx, 'right', v)}
                                        label="右"
                                        isDark={isDark}
                                    />
                                </div>
                                <div className="col-start-2 row-start-3">
                                    <StatInput 
                                        value={displayStat(card.stats.bottom)} 
                                        onChange={(v) => onStatChange(idx, 'bottom', v)}
                                        label="下"
                                        isDark={isDark}
                                    />
                                </div>
                            </div>

                            {/* Type Selector */}
                            <div className="relative">
                                <select 
                                    value={card.type} 
                                    onChange={(e) => onTypeChange(idx, e.target.value as CardType)} 
                                    className={clsx(
                                        "w-full h-8 px-2 text-[10px] font-bold rounded border appearance-none outline-none cursor-pointer transition-colors",
                                        isDark 
                                            ? "bg-white/5 border-white/10 text-amber-200 focus:border-amber-500" 
                                            : "bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-500"
                                    )}
                                >
                                    {Object.values(CardType).map(t => (
                                        <option key={t} value={t} className={isDark ? 'bg-slate-900' : ''}>{t}</option>
                                    ))}
                                </select>
                                <ChevronRight 
                                    size={12} 
                                    className={clsx(
                                        "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 rotate-90",
                                        isDark ? "text-amber-200" : "text-slate-500"
                                    )}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col justify-center h-full pl-2">
                            <div className="flex items-center justify-between mb-0.5">
                                <h3 className={clsx(
                                    "text-xs font-bold tracking-wider truncate", 
                                    isSelected ? (isDark ? "text-amber-300" : "text-blue-700") : (isDark ? "text-amber-50" : "text-slate-800")
                                )}>
                                    {card.name}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={clsx(
                                    "text-[9px] font-medium px-1.5 rounded-sm border",
                                    isDark ? "border-amber-500/20 text-amber-500" : "border-slate-300 text-slate-500"
                                )}>
                                    {card.type}
                                </span>
                                 {isSuggested && !isUsed && (
                                    <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">
                                        最佳選項
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                </motion.div>
            );
            })}
        </AnimatePresence>
      </div>
    </section>
  );
};

// Subcomponent for cleaner inputs
const StatInput = ({ value, onChange, label, isDark }: { value: string, onChange: (v: string) => void, label: string, isDark: boolean }) => (
    <div className="relative group">
        <input 
            type="text" 
            maxLength={2} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className={clsx(
                "w-full h-8 text-center text-xs font-bold rounded border bg-transparent outline-none transition-all",
                isDark 
                    ? "border-white/10 focus:border-amber-500 text-amber-100 placeholder-white/20 hover:border-white/20" 
                    : "border-slate-200 focus:border-blue-500 text-slate-700 placeholder-slate-300 hover:border-slate-300"
            )}
        />
        <span className={clsx(
            "absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wider px-1 transition-colors",
            isDark ? "bg-[#111116] text-amber-500/50" : "bg-white text-slate-400"
        )}>
            {label}
        </span>
    </div>
);

export default Hand;
