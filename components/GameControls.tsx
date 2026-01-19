import React from 'react';
import { Sun, Moon, Lightbulb, RotateCcw, AlertCircle } from 'lucide-react';

interface GameControlsProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onCalculateBestMove: () => void;
  onResetBoard: () => void;
  onResetAll: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  isDark,
  onToggleTheme,
  onCalculateBestMove,
  onResetBoard,
  onResetAll,
}) => {
  return (
    <header className={`px-8 py-4 border-b flex items-center justify-between transition-colors duration-500 backdrop-blur-md z-50 ${
      isDark 
        ? 'border-amber-900/20 bg-[#0d0d1a]/60 text-amber-50' 
        : 'border-slate-200/60 bg-white/60 text-slate-800'
    }`}>
      {/* Brand / Title */}
      <div className="flex items-center gap-4 select-none">
        <h1 className={`text-2xl font-serif tracking-widest uppercase font-bold bg-clip-text text-transparent bg-gradient-to-r ${
          isDark 
            ? 'from-amber-200 via-amber-500 to-amber-700' 
            : 'from-slate-700 via-slate-900 to-slate-700'
        }`}>
          塔克小工具
          <span className={`block md:inline md:ml-3 text-xs md:text-sm font-normal tracking-wide opacity-60 font-sans italic ${
            isDark ? 'text-amber-400' : 'text-slate-500'
          }`}>
            九宮幻卡模擬器
          </span>
        </h1>
      </div>

      {/* Control Group */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className={`p-2.5 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
            isDark 
              ? 'border-amber-500/30 bg-black/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60 shadow-amber-900/20' 
              : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200'
          }`}
          aria-label="切換主題"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Divider */}
        <div className={`w-px h-8 mx-1 transition-colors ${
          isDark ? 'bg-gradient-to-b from-transparent via-amber-800/40 to-transparent' : 'bg-gradient-to-b from-transparent via-slate-300 to-transparent'
        }`}></div>

        {/* Action Buttons */}
        <button 
          onClick={onCalculateBestMove} 
          className={`group flex items-center gap-2 px-5 py-2 rounded-md border text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md ${
            isDark 
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/50 shadow-amber-900/10' 
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-slate-200'
          }`}
        >
          <Lightbulb size={14} className={`transition-transform duration-300 group-hover:rotate-12 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <span>戰術分析</span>
        </button>

        <button 
          onClick={onResetBoard} 
          className={`group flex items-center gap-2 px-5 py-2 rounded-md border text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md ${
            isDark 
              ? 'border-amber-800/30 bg-black/40 text-amber-500 hover:bg-amber-900/20 hover:border-amber-700/50 hover:text-amber-300 shadow-amber-900/10' 
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-slate-200'
          }`}
        >
          <RotateCcw size={14} className="transition-transform duration-500 group-hover:-rotate-180" />
          <span>重置盤面</span>
        </button>

        <button 
          onClick={onResetAll} 
          className={`group flex items-center gap-2 px-5 py-2 rounded-md border text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md ${
            isDark 
              ? 'border-red-900/40 bg-red-900/10 text-red-400 hover:bg-red-900/20 hover:border-red-700/50 hover:text-red-300 shadow-red-900/10' 
              : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 shadow-red-200'
          }`}
        >
          <AlertCircle size={14} className="transition-transform duration-300 group-hover:scale-110" />
          <span>初始化系統</span>
        </button>
      </div>
    </header>
  );
};

export default GameControls;
