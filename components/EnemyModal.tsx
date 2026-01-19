import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Crosshair, Cpu } from 'lucide-react';
import { CardType } from '../types';

interface EnemyModalProps {
  isOpen: boolean;
  stats: { top: string; right: string; bottom: string; left: string };
  type: CardType;
  isDark: boolean;
  onClose: () => void;
  onStatChange: (stat: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
  onTypeChange: (type: CardType) => void;
  onConfirm: () => void;
}

const EnemyModal: React.FC<EnemyModalProps> = ({
  isOpen,
  stats,
  type,
  isDark,
  onClose,
  onStatChange,
  onTypeChange,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`relative w-full max-w-xs overflow-hidden rounded-xl border-2 shadow-2xl ${
              isDark 
                ? 'bg-[#0a0a12] border-red-900/40 shadow-red-900/20' 
                : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}
          >
            {/* Tech Decoration Lines */}
            <div className={`absolute top-0 left-0 w-full h-1 ${isDark ? 'bg-gradient-to-r from-red-900 via-red-500 to-red-900' : 'bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200'}`} />
            <div className="absolute top-0 left-4 w-px h-16 bg-gradient-to-b from-red-500/50 to-transparent" />
            <div className="absolute top-0 right-4 w-px h-16 bg-gradient-to-b from-red-500/50 to-transparent" />

            {/* Header */}
            <div className={`relative px-6 py-4 flex items-center justify-between border-b ${
              isDark ? 'border-red-900/20 bg-gradient-to-b from-red-950/20 to-transparent' : 'border-slate-100'
            }`}>
               <div>
                <h3 className={`text-lg font-bold tracking-widest uppercase flex items-center gap-2 ${
                  isDark ? 'text-red-100' : 'text-slate-800'
                }`}>
                  <Crosshair className={isDark ? "text-red-500" : "text-slate-600"} size={20} />
                  <span>敵人情報</span>
                </h3>
                <p className={`text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 ${
                  isDark ? 'text-red-300' : 'text-slate-500'
                }`}>
                  手動輸入數據
                </p>
              </div>
              <button 
                onClick={onClose}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col items-center">
              
              {/* Card Stat Input Visualization (Diamond Layout) */}
              <div className="relative mb-6 p-4">
                {/* Background Decoration */}
                <div className={`absolute inset-0 rotate-45 border-2 opacity-20 rounded-xl ${
                  isDark ? 'border-red-500 bg-red-900/10' : 'border-slate-300 bg-slate-100'
                }`} />
                
                <div className="relative grid grid-cols-3 grid-rows-3 gap-1 w-40 h-40">
                   {/* Left Input (Tab Order: 1) */}
                   <div className="col-start-1 row-start-2 flex justify-end items-center">
                    <StatInput 
                      value={stats.left} 
                      onChange={(v) => onStatChange('left', v)} 
                      placeholder="左"
                      isDark={isDark}
                      autoFocus
                    />
                  </div>

                   {/* Top Input (Tab Order: 2) */}
                  <div className="col-start-2 row-start-1 flex justify-center items-end">
                    <StatInput 
                      value={stats.top} 
                      onChange={(v) => onStatChange('top', v)} 
                      placeholder="上"
                      isDark={isDark}
                    />
                  </div>

                  {/* Center Icon */}
                  <div className={`col-start-2 row-start-2 flex items-center justify-center opacity-30 ${
                    isDark ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    <Sword size={24} />
                  </div>

                  {/* Right Input (Tab Order: 3) */}
                  <div className="col-start-3 row-start-2 flex justify-start items-center">
                    <StatInput 
                      value={stats.right} 
                      onChange={(v) => onStatChange('right', v)} 
                      placeholder="右"
                      isDark={isDark}
                    />
                  </div>

                  {/* Bottom Input (Tab Order: 4) */}
                  <div className="col-start-2 row-start-3 flex justify-center items-start">
                    <StatInput 
                      value={stats.bottom} 
                      onChange={(v) => onStatChange('bottom', v)} 
                      placeholder="下"
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>

               {/* Type Selection */}
              <div className="w-full mb-6">
                <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest ${
                  isDark ? 'text-red-400/60' : 'text-slate-400'
                }`}>
                  <Cpu size={14} />
                  <span>卡牌類型</span>
                </div>
                <div className="relative">
                  <select 
                    value={type} 
                    onChange={(e) => onTypeChange(e.target.value as CardType)}
                    className={`w-full h-10 px-3 text-sm rounded-lg border-2 appearance-none outline-none font-bold tracking-wide transition-all ${
                      isDark 
                        ? 'bg-[#0f0f1a] border-red-900/30 text-red-100 focus:border-red-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-slate-400'
                    }`}
                  >
                    {Object.values(CardType).map(t => (
                      <option key={t} value={t} className={isDark ? 'bg-[#0d0d1a]' : ''}>{t}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

               {/* Action Button */}
              <button 
                onClick={onConfirm}
                className={`group relative w-full overflow-hidden rounded-lg py-3 font-bold uppercase tracking-[0.25em] transition-all active:scale-[0.98] ${
                  isDark 
                    ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-500' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  確認新增 <span className="text-[10px] opacity-60">///</span>
                </span>
              </button>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Sub-component for individual stat inputs
const StatInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  isDark: boolean;
  autoFocus?: boolean;
}> = ({ value, onChange, placeholder, isDark, autoFocus }) => (
  <div className="relative group">
    <div className={`absolute -inset-1 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm ${
      isDark ? 'bg-red-500' : 'bg-slate-400'
    }`} />
    <input
      autoFocus={autoFocus}
      type="text"
      maxLength={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`relative w-12 h-12 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all ${
        isDark 
          ? 'bg-[#0a0a12] border-red-900/40 text-red-100 focus:border-red-500 placeholder-red-900/30' 
          : 'bg-white border-slate-200 text-slate-800 focus:border-slate-400 placeholder-slate-200'
      }`}
      placeholder={placeholder}
    />
  </div>
);

export default EnemyModal;