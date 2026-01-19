import React from 'react';
import { CardData, CardType } from '../types';
import { displayStat } from '../constants';

interface CardProps {
  card: CardData;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  isSelected, 
  size = 'md', 
  className = '',
  draggable = false,
  onDragStart
}) => {
  const isBlue = card.owner === 'blue';
  
  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-20 text-[10px]',
    md: 'w-24 h-32 text-xs',
    lg: 'w-32 h-44 text-base',
  };

  const statBaseClass = "absolute font-bold drop-shadow-md select-none";

  // Type Icon/Badge Color mapping
  const getTypeColor = (type: CardType) => {
    switch (type) {
      case CardType.PRIMAL: return 'text-red-400 border-red-400/50 bg-red-900/50';
      case CardType.SCION: return 'text-blue-300 border-blue-400/50 bg-blue-900/50';
      case CardType.GARLEAN: return 'text-gray-400 border-gray-400/50 bg-gray-700/50';
      case CardType.BEASTMAN: return 'text-yellow-600 border-yellow-600/50 bg-yellow-900/50';
      default: return 'text-transparent';
    }
  };

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`
        relative rounded-lg shadow-lg border-2 transition-all duration-200 overflow-hidden
        ${sizeClasses[size]}
        ${isBlue ? 'bg-blue-900 border-blue-400 text-blue-100' : 'bg-red-900 border-red-400 text-red-100'}
        ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-2' : 'hover:scale-105'}
        ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${className}
        flex items-center justify-center
      `}
    >
      {/* Background decoration */}
      <div className={`absolute inset-1 border ${isBlue ? 'border-blue-700' : 'border-red-700'} opacity-50 rounded`}></div>
      
      {/* Card Type Badge (Top Right) */}
      {card.type !== CardType.NONE && (
        <div className={`absolute top-1 right-1 px-1 rounded border text-[0.5rem] font-bold uppercase tracking-tighter z-10 ${getTypeColor(card.type)}`}>
          {card.type}
        </div>
      )}

      {/* Stats Diamond Layout */}
      <div className="relative w-full h-full pointer-events-none z-10">
        {/* Top */}
        <span className={`${statBaseClass} top-1 left-1/2 -translate-x-1/2`}>
          {displayStat(card.stats.top)}
        </span>
        
        {/* Right */}
        <span className={`${statBaseClass} top-1/2 right-1 -translate-y-1/2`}>
          {displayStat(card.stats.right)}
        </span>
        
        {/* Bottom */}
        <span className={`${statBaseClass} bottom-1 left-1/2 -translate-x-1/2`}>
          {displayStat(card.stats.bottom)}
        </span>
        
        {/* Left */}
        <span className={`${statBaseClass} top-1/2 left-1 -translate-y-1/2`}>
          {displayStat(card.stats.left)}
        </span>
      </div>

      {/* Name (Tiny) */}
      <div className="absolute bottom-4 w-full text-center text-[0.5rem] opacity-60 truncate px-1 pointer-events-none">
        {card.name}
      </div>
    </div>
  );
};

export default Card;