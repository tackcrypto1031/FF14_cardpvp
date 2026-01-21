import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CardData, CardType, ThemeMode } from '../types';
import { displayStat } from '../constants';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  card: CardData;
  theme: ThemeMode;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  theme,
  onClick,
  isSelected,
  size = 'md',
  className,
  draggable = false,
  onDragStart
}) => {
  const isBlue = card.owner === 'blue';
  const isDark = theme === 'dark';
  const hasOwner = !!card.owner;

  // Size configurations
  const sizeConfig = {
    sm: {
      dim: 'w-16 h-20',
      text: 'text-[10px]',
      statSize: 'text-xs',
      badge: 'scale-50',
      name: 'text-[6px]'
    },
    md: {
      dim: 'w-24 h-32',
      text: 'text-sm',
      statSize: 'text-base',
      badge: 'scale-75',
      name: 'text-[8px]'
    },
    lg: {
      dim: 'w-36 h-48',
      text: 'text-lg',
      statSize: 'text-xl',
      badge: 'scale-100',
      name: 'text-[10px]'
    },
  };

  const currentSize = sizeConfig[size];

  // Visual Palette based on Owner and Theme
  const palette = useMemo(() => {
    if (isBlue) {
      return {
        bg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950',
        border: 'border-blue-400/30',
        glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]',
        accent: 'text-blue-200',
        statBg: 'bg-blue-950/50',
        frame: 'from-blue-400 via-blue-600 to-indigo-800'
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-slate-900 via-red-900 to-rose-950',
        border: 'border-red-400/30',
        glow: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]',
        accent: 'text-red-200',
        statBg: 'bg-red-950/50',
        frame: 'from-red-400 via-red-600 to-rose-800'
      };
    }
  }, [isBlue]);

  // Type Icon Colors
  const getTypeStyles = (type: CardType) => {
    switch (type) {
      case CardType.PRIMAL: return 'bg-red-900/80 text-red-200 border-red-500';
      case CardType.SCION: return 'bg-blue-900/80 text-blue-200 border-blue-500';
      case CardType.GARLEAN: return 'bg-slate-700/80 text-slate-200 border-slate-400';
      case CardType.BEASTMAN: return 'bg-amber-900/80 text-amber-200 border-amber-500';
      default: return 'hidden';
    }
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      initial={false}
      whileHover={draggable ? { scale: 1.05, y: -4, rotateX: 5, zIndex: 50 } : {}}
      whileTap={draggable ? { scale: 0.95 } : {}}
      animate={{
        scale: isSelected ? 1.1 : 1,
        boxShadow: isSelected
          ? `0 0 25px ${isBlue ? 'rgba(59,130,246,0.6)' : 'rgba(239,68,68,0.6)'}`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      className={cn(
        'relative rounded-lg select-none transition-colors duration-300',
        currentSize.dim,
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
        className
      )}
      style={{ perspective: '1000px' }}
    >
      {/* Main Card Container with 3D Border Effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg overflow-hidden border-[1px]",
        palette.border,
        palette.bg,
        // Texture overlay using CSS gradients instead of external image
        "before:absolute before:inset-0 before:opacity-20 before:mix-blend-overlay",
        "before:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] before:from-white/10 before:to-transparent"
      )}>

        {/* Inner Frame / Metallic Rim */}
        <div className={cn(
          "absolute inset-1 rounded-md border border-white/10 shadow-inner",
          "bg-gradient-to-br from-white/5 to-transparent opacity-50"
        )} />

        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-lg" />

        {/* Center Grid Pattern (Holographic feel) */}
        <div className="absolute inset-4 opacity-10"
          style={{
            backgroundImage: `radial-gradient(${isBlue ? '#60a5fa' : '#f87171'} 1px, transparent 1px)`,
            backgroundSize: '12px 12px'
          }}
        />

        {/* Card Content Wrapper */}
        <div className="relative h-full flex flex-col items-center justify-between py-2 z-10">

          {/* Top Label / Type - Absolute Positioned to not affect flex layout */}
          <div className="absolute top-2 left-0 w-full flex justify-between px-2 items-start h-6 pointer-events-none">
            {/* Rank/Level placeholder or just decorative dots */}
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${isBlue ? 'bg-cyan-400' : 'bg-red-400'} opacity-60`} />
              ))}
            </div>

            {/* Type Badge moved to center */}
          </div>

          {/* Stats Cluster (The Heart) */}
          <div className="relative w-full flex-1 flex items-center justify-center">
            {/* Background Diamond/Cross graphic */}
            <div className={cn(
              "absolute w-16 h-16 rotate-45 border border-white/10 shadow-lg backdrop-blur-sm",
              palette.statBg
            )} />

            <div className="relative grid grid-cols-3 grid-rows-3 gap-0.5 w-16 h-16 items-center justify-items-center">
              {/* Top */}
              <div className="col-start-2 row-start-1">
                <StatValueDisplay value={card.stats.top} className={currentSize.statSize} />
              </div>

              {/* Left */}
              <div className="col-start-1 row-start-2">
                <StatValueDisplay value={card.stats.left} className={currentSize.statSize} />
              </div>

              {/* Center (Element or Icon placeholder) */}
              <div className="col-start-2 row-start-2 z-20 flex items-center justify-center">
                {card.type !== CardType.NONE ? (
                  <div className={cn(
                    //"w-full text-center text-[7px] font-bold uppercase tracking-wider text-shadow-sm",
                    "px-1 py-0.5 rounded-[2px] text-[6px] font-bold uppercase tracking-widest border shadow-[0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-md min-w-[30px] text-center",
                    getTypeStyles(card.type)
                  )}>
                    {card.type}
                  </div>
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${isBlue ? 'bg-cyan-400' : 'bg-red-400'} opacity-30`} />
                )}
              </div>

              {/* Right */}
              <div className="col-start-3 row-start-2">
                <StatValueDisplay value={card.stats.right} className={currentSize.statSize} />
              </div>

              {/* Bottom */}
              <div className="col-start-2 row-start-3">
                <StatValueDisplay value={card.stats.bottom} className={currentSize.statSize} />
              </div>
            </div>
          </div>

          {/* Bottom Name Plate */}
          <div className={cn(
            "w-[90%] mx-auto mt-auto py-1 text-center border-t border-white/10",
            "bg-gradient-to-r from-transparent via-black/20 to-transparent"
          )}>
            <span className={cn(
              "font-serif tracking-widest uppercase text-white/90 truncate block shadow-black drop-shadow-md",
              currentSize.name
            )}>
              {card.name}
            </span>
          </div>
        </div>

        {/* Selection / Active State Overlay */}
        {isSelected && (
          <motion.div
            layoutId="selection-ring"
            className={cn(
              "absolute inset-[-2px] rounded-lg z-[-1]",
              "bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200",
              "opacity-60 blur-sm"
            )}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
};

// Helper component for individual stats
const StatValueDisplay = ({ value, className }: { value: number; className?: string }) => {
  const isAce = value === 10;
  return (
    <span className={cn(
      "font-bold font-serif drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
      isAce ? "text-amber-400" : "text-slate-100",
      className
    )}>
      {displayStat(value)}
    </span>
  );
};

export default Card;
