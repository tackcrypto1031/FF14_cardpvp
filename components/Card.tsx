import React from 'react';
import { CardData } from '../types';
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

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`
        relative rounded-lg shadow-lg border-2 transition-all duration-200
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
      
      {/* Central Type Icon (Optional Placeholder) */}
      {card.type !== 'None' && (
        <div className="absolute opacity-20 text-[0.6rem] uppercase tracking-wider font-bold">
          {card.type}
        </div>
      )}

      {/* Stats Diamond Layout */}
      <div className="relative w-full h-full pointer-events-none">
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
      <div className="absolute bottom-6 w-full text-center text-[0.5rem] opacity-60 truncate px-1 pointer-events-none">
        {card.name}
      </div>
    </div>
  );
};

export default Card;