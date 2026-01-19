import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Activity, Zap, ShieldAlert, Layers, ArrowUpCircle, ArrowDownCircle, ListOrdered, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { GameRules, LogEntry } from '../types';

interface GameInfoProps {
  rules: GameRules;
  logs: LogEntry[];
  isDark: boolean;
  onToggleRule: (rule: keyof GameRules) => void;
}

const RULE_CONFIG: Record<keyof GameRules, { label: string; icon: React.ReactNode; color: string; activeColor: string; description: string }> = {
  reverse: { 
    label: "逆轉", 
    icon: <Zap size={14} />, 
    color: "text-red-400", 
    activeColor: "bg-red-500/20 border-red-500/50 text-red-100",
    description: "數值大小的勝負關係翻轉。較小的數值將勝過較大的數值。"
  },
  fallenAce: { 
    label: "王牌殺手", 
    icon: <ShieldAlert size={14} />, 
    color: "text-orange-400", 
    activeColor: "bg-orange-500/20 border-orange-500/50 text-orange-100",
    description: "數值最強的「A」會被數值最弱的「1」反殺。其他勝負關係保持不變。"
  },
  same: { 
    label: "同數", 
    icon: <Layers size={14} />, 
    color: "text-cyan-400", 
    activeColor: "bg-cyan-500/20 border-cyan-500/50 text-cyan-100",
    description: "放置卡片時，若兩條以上邊的數值與相鄰卡片相同，則可翻轉相鄰卡片（連鎖反應有效）。"
  },
  plus: { 
    label: "加算", 
    icon: <Activity size={14} />, 
    color: "text-green-400", 
    activeColor: "bg-green-500/20 border-green-500/50 text-green-100",
    description: "放置卡片時，若兩條以上邊與相鄰卡片數值之和相等，則可翻轉相鄰卡片（連鎖反應有效）。"
  },
  ascension: { 
    label: "同類強化", 
    icon: <ArrowUpCircle size={14} />, 
    color: "text-purple-400", 
    activeColor: "bg-purple-500/20 border-purple-500/50 text-purple-100",
    description: "場上每存在一張同類型的卡片，該類型卡片的所有數值皆 +1。"
  },
  descension: { 
    label: "同類弱化", 
    icon: <ArrowDownCircle size={14} />, 
    color: "text-pink-400", 
    activeColor: "bg-pink-500/20 border-pink-500/50 text-pink-100",
    description: "場上每存在一張同類型的卡片，該類型卡片的所有數值皆 -1。"
  },
  order: { 
    label: "秩序", 
    icon: <ListOrdered size={14} />, 
    color: "text-blue-400", 
    activeColor: "bg-blue-500/20 border-blue-500/50 text-blue-100",
    description: "必須按照牌組設定的順序依次出牌。無法自由選擇出牌順序。"
  },
};

const GameInfo: React.FC<GameInfoProps> = ({ rules, logs, isDark, onToggleRule }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [infoRule, setInfoRule] = useState<keyof GameRules | null>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`w-80 flex flex-col h-full border-l backdrop-blur-md transition-colors relative overflow-hidden ${
        isDark 
          ? 'border-amber-500/10 bg-black/40' 
          : 'border-slate-200 bg-white/60'
      }`}
    >
      {/* Holographic Scanline Overlay (Subtle) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(transparent 50%, black 50%)', backgroundSize: '100% 4px' }}></div>

      {/* Rules Module */}
      <div className="p-6 border-b border-inherit relative z-10">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-[0.2em] uppercase opacity-80">
          <Settings size={14} className={isDark ? "text-amber-500" : "text-slate-600"} />
          <span className={isDark ? "text-amber-100" : "text-slate-800"}>系統規則</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(RULE_CONFIG).map(([key, config]) => {
            const ruleKey = key as keyof GameRules;
            const isActive = rules[ruleKey];
            
            return (
              <div key={key} className="relative group">
                <motion.button
                  onClick={() => onToggleRule(ruleKey)}
                  whileHover={{ scale: 1.02, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative w-full overflow-hidden px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300
                    ${isActive 
                      ? (isDark 
                          ? `${config.activeColor} shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)]` 
                          : "bg-blue-500 border-blue-600 text-white shadow-md")
                      : (isDark 
                          ? 'border-white/5 bg-white/5 text-white/30 hover:text-white/60' 
                          : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600')
                    }
                  `}
                >
                  {/* Active Indicator Pulse */}
                  {isActive && (
                    <motion.div 
                      className={`absolute inset-0 opacity-10 ${isDark ? 'bg-white' : 'bg-blue-400'}`}
                      animate={{ opacity: [0.05, 0.15, 0.05] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                  
                  <span className={`z-10 transition-colors duration-300 ${isActive ? (isDark ? config.color : 'text-white') : ''}`}>{config.icon}</span>
                  <span className="z-10 relative truncate">{config.label}</span>
                </motion.button>
                
                {/* Info Icon Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoRule(ruleKey);
                  }}
                  className={clsx(
                    "absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    isActive ? (isDark ? "text-white/60 hover:text-white" : "text-white/60 hover:text-white") : (isDark ? "text-white/20 hover:text-white/60" : "text-slate-400 hover:text-slate-600")
                  )}
                >
                  <Info size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Sliding Panel */}
      <AnimatePresence>
        {infoRule && (
          <>
            {/* Backdrop for closing */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoRule(null)}
              className="absolute inset-0 bg-black/20 z-40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={clsx(
                "absolute top-0 right-0 w-3/4 h-full z-50 shadow-2xl border-l p-6 flex flex-col",
                isDark ? "bg-[#0a0a10] border-amber-900/30" : "bg-white border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className={clsx(
                     "p-2 rounded-lg",
                     isDark ? "bg-amber-900/20 text-amber-500" : "bg-blue-50 text-blue-600"
                   )}>
                      {RULE_CONFIG[infoRule].icon}
                   </div>
                   <h3 className={clsx("text-sm font-bold tracking-widest", isDark ? "text-amber-100" : "text-slate-900")}>
                    {RULE_CONFIG[infoRule].label}
                   </h3>
                </div>
                <button 
                  onClick={() => setInfoRule(null)}
                  className={clsx(
                    "p-1.5 rounded-full transition-colors",
                    isDark ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  )}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <div className={clsx(
                  "text-xs leading-relaxed tracking-wide",
                  isDark ? "text-amber-100/70" : "text-slate-600"
                )}>
                  {RULE_CONFIG[infoRule].description}
                </div>
                
                {/* Decorative Element */}
                <div className={clsx(
                  "pt-6 border-t",
                  isDark ? "border-amber-900/10" : "border-slate-100"
                )}>
                  <p className={clsx("text-[9px] italic opacity-40", isDark ? "text-amber-50" : "text-slate-900")}>
                    * 此規則將會影響戰鬥數據的即時演算結果。
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInfoRule(null)}
                className={clsx(
                  "mt-auto w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all",
                  isDark 
                    ? "bg-amber-900/20 text-amber-500 border border-amber-900/30 hover:bg-amber-500 hover:text-black hover:border-amber-400" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                我知道了
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Battle Log Module */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase opacity-80">
            <Activity size={14} className={isDark ? "text-blue-400" : "text-blue-600"} />
            <span className={isDark ? "text-blue-100" : "text-slate-800"}>戰鬥日誌</span>
          </div>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-400'}`}>
            {logs.length.toString().padStart(3, '0')}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 custom-scrollbar mask-image-gradient">
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                 className="h-full flex flex-col items-center justify-center text-center opacity-20"
              >
                <div className={`w-12 h-12 mb-2 rounded-full border-2 border-dashed animate-[spin_10s_linear_infinite] ${isDark ? 'border-white' : 'border-slate-900'}`}></div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-mono">系統待命</span>
                <span className="text-[8px] tracking-wider font-mono mt-1">等待戰鬥數據...</span>
              </motion.div>
            ) : (
              logs.map((log, i) => (
                <motion.div
                  key={`${i}-${log.message.substring(0, 5)}`}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className={`
                    relative pl-3 py-2 text-[10px] font-mono leading-relaxed border-l-2 backdrop-blur-sm rounded-r-sm
                    ${log.type === 'combo' 
                      ? (isDark ? 'border-amber-500 bg-amber-500/10 text-amber-100' : 'border-amber-500 bg-amber-50 text-amber-800')
                      : log.type === 'flip' 
                        ? (isDark ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100' : 'border-blue-500 bg-blue-50 text-blue-800')
                        : (isDark ? 'border-white/10 bg-white/5 text-white/60' : 'border-slate-200 bg-slate-50 text-slate-600')
                    }
                  `}
                >
                  <span className="opacity-50 mr-2 text-[8px]">[{new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                  {log.message}
                </motion.div>
              ))
            )}
            <div ref={logsEndRef} />
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default GameInfo;
