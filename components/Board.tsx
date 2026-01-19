import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Card from './Card';
import { BoardSlot, MoveSuggestion, ThemeMode } from '../types';

// Utility
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BoardProps {
  board: BoardSlot[];
  suggestion: MoveSuggestion | null;
  dragOverSlotIdx: number | null;
  selectedCardIdx: number | null;
  isDark: boolean;
  theme: ThemeMode;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDrop: (e: React.DragEvent, idx: number) => void;
  onClick: (idx: number) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  suggestion,
  dragOverSlotIdx,
  selectedCardIdx,
  isDark,
  theme,
  onDragOver,
  onDrop,
  onClick
}) => {
  return (
    <div className="relative flex items-center justify-center p-8 lg:p-12">
      {/* 
        Main Board Physical Object 
        - Simulates a heavy, high-end game board sitting on the table
        - Uses multiple layers of shadows and borders for depth
      */}
      <div 
        className={cn(
          "relative rounded-xl p-6 transition-all duration-500",
          // Base material
          isDark 
            ? "bg-[#1a1a24] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border border-white/5" 
            : "bg-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-300",
          // Metallic rim effect
          "before:absolute before:inset-0 before:rounded-xl before:border-[1px] before:border-white/10 before:pointer-events-none",
          // Inner glow/atmosphere
          isDark 
            ? "after:absolute after:inset-0 after:bg-gradient-to-br after:from-amber-900/5 after:to-blue-900/10 after:rounded-xl after:pointer-events-none"
            : "after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/50 after:to-slate-100/20 after:rounded-xl after:pointer-events-none"
        )}
      >
        {/* Corner Ornaments (Screws/Runes) */}
        {[
          'top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'
        ].map((pos, i) => (
          <div key={i} className={cn(
            "absolute w-2 h-2 rounded-full shadow-inner", 
            pos,
            isDark ? "bg-[#0a0a0f] border border-white/20" : "bg-slate-300 border border-slate-400"
          )} />
        ))}

        {/* The Grid Container - Recessed into the board */}
        <div className={cn(
          "relative grid grid-cols-3 gap-3 p-3 rounded-lg",
          isDark ? "bg-[#05050a] shadow-inner border border-white/5" : "bg-slate-300 shadow-inner border border-slate-400/50"
        )}>
          {board.map((slot, idx) => {
            const isSuggestedSlot = suggestion?.slotIdx === idx;
            const isTarget = dragOverSlotIdx === idx;
            const canInteract = !slot && selectedCardIdx !== null;

            return (
              <div
                key={idx}
                onDragOver={(e) => onDragOver(e, idx)}
                onDrop={(e) => onDrop(e, idx)}
                onClick={() => onClick(idx)}
                className={cn(
                  "relative w-28 h-36 sm:w-32 sm:h-44 rounded-md transition-all duration-300 group",
                  // Slot Base Style (Empty)
                  !slot && (isDark 
                    ? "bg-[#0a0a10] border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" 
                    : "bg-slate-200/50 border border-slate-400/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"),
                  // Interactive States
                  canInteract && "cursor-pointer hover:bg-opacity-80",
                  // Hover Effects for Empty Slots
                  !slot && canInteract && (isDark ? "hover:border-amber-500/30 hover:shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]" : "hover:border-blue-400/50 hover:shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]"),
                  // Drag Over Highlight
                  isTarget && "scale-[1.02] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] z-10",
                  // Suggestion Highlight
                  isSuggestedSlot && !slot && "ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                )}
              >
                {/* Decorative Grid Lines inside empty slot */}
                {!slot && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className={cn("w-16 h-16 border border-dashed rounded-full", isDark ? "border-white" : "border-black")} />
                    <div className={cn("absolute w-full h-[1px]", isDark ? "bg-white/10" : "bg-black/10")} />
                    <div className={cn("absolute h-full w-[1px]", isDark ? "bg-white/10" : "bg-black/10")} />
                  </div>
                )}

                {/* Slot Number (subtle) */}
                {!slot && (
                  <span className={cn(
                    "absolute top-2 left-3 text-[10px] font-mono font-bold opacity-20",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                )}

                 {/* Suggestion Indicator */}
                {isSuggestedSlot && !slot && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold tracking-widest text-blue-500 animate-pulse bg-blue-500/10 px-2 py-1 rounded">
                      戰術推薦
                    </span>
                  </div>
                )}

                {/* The Card */}
                <AnimatePresence mode="wait">
                  {slot ? (
                    <motion.div
                      key={`card-${idx}`}
                      initial={{ scale: 1.2, opacity: 0, rotateX: 20, z: 50 }}
                      animate={{ scale: 1, opacity: 1, rotateX: 0, z: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-full h-full"
                    >
                      <Card 
                        card={slot} 
                        theme={theme} 
                        size="md" 
                        className="!w-full !h-full pointer-events-none shadow-md" 
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Drag Over Overlay */}
                {isTarget && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-amber-500/10 rounded-md border-2 border-amber-500/30 z-20 pointer-events-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;
