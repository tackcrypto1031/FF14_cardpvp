import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, GripVertical } from 'lucide-react';
import clsx from 'clsx';
import Card from './Card';
import { CardData, ThemeMode } from '../types';

interface EnemyHandProps {
    cards: CardData[];
    isDark: boolean;
    theme: ThemeMode;
    onDragStart: (e: React.DragEvent, idx: number) => void;
    usedCardIds: Set<string>;
}

const EnemyHand: React.FC<EnemyHandProps> = ({
    cards,
    isDark,
    theme,
    onDragStart,
    usedCardIds,
}) => {
    return (
        <section
            className={clsx(
                'w-64 border-l flex flex-col relative overflow-hidden transition-colors duration-500',
                isDark ? 'border-amber-900/20 bg-black/40' : 'border-slate-200 bg-slate-50/50'
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-dashed border-opacity-20 flex items-center gap-2 z-10 shrink-0"
                style={{ borderColor: isDark ? '#d97706' : '#94a3b8' }}>
                <div className={clsx(
                    "p-1.5 rounded-lg shadow-inner",
                    isDark ? "bg-red-900/20 text-red-500 shadow-black/40" : "bg-red-50 text-red-600 shadow-slate-200"
                )}>
                    <Swords size={16} />
                </div>
                <div>
                    <h2 className={clsx(
                        "text-xs font-bold tracking-[0.2em] uppercase",
                        isDark ? "text-amber-100" : "text-slate-800"
                    )}>
                        對手手牌
                    </h2>
                    <p className={clsx(
                        "text-[9px] font-medium opacity-50",
                        isDark ? "text-amber-200" : "text-slate-500"
                    )}>
                        {cards.length > 0 ? `已知 ${cards.length} 張` : '沒有已知的卡牌'}
                    </p>
                </div>
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar z-10">
                <AnimatePresence mode='popLayout'>
                    {cards.map((card, idx) => {
                        const isUsed = usedCardIds.has(card.id);
                        return (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: isUsed ? 0.5 : 1, x: 0, filter: isUsed ? 'grayscale(100%)' : 'none' }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative group"
                            >
                                <div
                                    className={clsx(
                                        "relative transition-transform duration-200",
                                        isUsed ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing hover:scale-105"
                                    )}
                                    draggable={!isUsed}
                                    onDragStart={(e) => !isUsed && onDragStart(e, idx)}
                                >
                                    {/* Drag Handle Overlay */}
                                    {!isUsed && (
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
                                            <GripVertical size={12} className={isDark ? "text-amber-500" : "text-slate-400"} />
                                        </div>
                                    )}

                                    <Card
                                        card={card}
                                        theme={theme}
                                        size="sm"
                                        className="shadow-md"
                                    />
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {cards.length === 0 && (
                    <div className={clsx(
                        "h-32 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed rounded-lg px-4 gap-2",
                        isDark ? "border-amber-900/30 text-amber-500" : "border-slate-300 text-slate-400"
                    )}>
                        <span className="text-[10px] uppercase font-bold tracking-widest">等待資料</span>
                        <p className="text-[9px]">點選「再來一局」或手動輸入對手資訊</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EnemyHand;
