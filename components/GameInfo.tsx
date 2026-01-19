import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Activity, Zap, ShieldAlert, Layers, ArrowUpCircle, ArrowDownCircle, ListOrdered } from 'lucide-react';
import { GameRules, LogEntry } from '../types';

interface GameInfoProps {
  rules: GameRules;
  logs: LogEntry[];
  isDark: boolean;
  onToggleRule: (rule: keyof GameRules) => void;
}

const RULE_CONFIG: Record<keyof GameRules, { label: string; icon: React.ReactNode; color: string }> = {
  reverse: { label: "逆轉", icon: <Zap size={14} />, color: "text-red-400" },
  fallenAce: { label: "王牌殺手", icon: <ShieldAlert size={14} />, color: "text-orange-400" },
  same: { label: "同數", icon: <Layers size={14} />, color: "text-cyan-400" },
  plus: { label: "加算", icon: <Activity size={14} />, color: "text-green-400" },
  ascension: { label: "同類強化", icon: <ArrowUpCircle size={14} />, color: "text-purple-400" },
  descension: { label: "同類弱化", icon: <ArrowDownCircle size={14} />, color: "text-pink-400" },
  order: { label: "秩序", icon: <ListOrdered size={14} />, color: "text-blue-400" },
};

const GameInfo: React.FC<GameInfoProps> = ({ rules, logs, isDark, onToggleRule }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

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
              <motion.button
                key={key}
                onClick={() => onToggleRule(ruleKey)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative overflow-hidden group px-3 py-2 rounded-sm border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300
                  ${isActive 
                    ? (isDark 
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : 'border-blue-500/50 bg-blue-500/10 text-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.1)]')
                    : (isDark 
                        ? 'border-white/5 bg-white/5 text-white/30 hover:bg-white/10 hover:border-white/10' 
                        : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600')
                  }
                `}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className={`absolute inset-0 opacity-20 ${isDark ? 'bg-amber-400' : 'bg-blue-400'}`}
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                )}
                
                <span className={`z-10 ${isActive ? config.color : ''}`}>{config.icon}</span>
                <span className="z-10 relative">{config.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

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
