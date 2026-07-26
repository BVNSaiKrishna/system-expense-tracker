import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUpCircle, CheckCircle, AlertTriangle, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export type NotificationType = 'info' | 'success' | 'warning' | 'level-up' | 'achievement';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  xpGained?: number;
  duration?: number;
}

interface NotificationContextProps {
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  triggerLevelUpCelebration: (level: number, rankName: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [levelUpData, setLevelUpData] = useState<{ level: number; rankName: string } | null>(null);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    ({ title, message, type, xpGained, duration = 4000 }: Omit<SystemNotification, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      // Dynamic sparks color selection
      const sparksColors = {
        success: ['#39ff14', '#00ff66'],
        warning: ['#ff3c00', '#ff0055'],
        'level-up': ['#00f0ff', '#bd00ff'],
        achievement: ['#ffb703', '#bd00ff', '#00f0ff'],
        info: ['#00e5ff', '#ffffff'],
      }[type];

      // Fire spark particles from the top right corner where notification slides in
      confetti({
        particleCount: type === 'achievement' ? 70 : 15,
        spread: type === 'achievement' ? 55 : 25,
        origin: { x: 0.9, y: 0.08 }, // near top-right corner where card mounts
        colors: sparksColors,
      });

      setNotifications((prev) => [...prev, { id, title, message, type, xpGained, duration }]);

      // Dispatch global window events to trigger full-screen shockwaves (EnergyWave)
      const eventName = 
        type === 'success' ? 'rpg-operation-logged' : 
        type === 'achievement' ? 'rpg-achievement-unlocked' :
        type === 'warning' ? 'rpg-settings-saved' : 'rpg-settings-saved';

      window.dispatchEvent(new CustomEvent(eventName));

      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification]
  );

  const triggerLevelUpCelebration = useCallback((level: number, rankName: string) => {
    setLevelUpData({ level, rankName });
    window.dispatchEvent(new CustomEvent('rpg-level-up'));
    
    // Play intense level up confetti burst
    const end = Date.now() + 2 * 1000;
    const colors = ['#00f0ff', '#39ff14', '#9d4edd', '#ffb703'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        triggerLevelUpCelebration,
      }}
    >
      {children}
      
      {/* 1. Holographic System Alert Banners */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: -30, scale: 0.85, x: 80 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 60, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full glass-panel clip-hud-corners border p-4 relative overflow-hidden flex flex-col gap-2 shadow-lg card-energy-border"
              style={{
                borderColor: 
                  n.type === 'level-up' ? 'var(--color-neon-blue)' :
                  n.type === 'achievement' ? 'var(--color-neon-amber)' :
                  n.type === 'success' ? 'var(--color-neon-green)' :
                  n.type === 'warning' ? 'var(--color-neon-red)' :
                  'var(--color-neon-cyan)',
                boxShadow: `0 0 20px ${
                  n.type === 'level-up' ? 'rgba(0, 240, 255, 0.2)' :
                  n.type === 'achievement' ? 'rgba(255, 183, 3, 0.2)' :
                  n.type === 'success' ? 'rgba(57, 255, 20, 0.2)' :
                  n.type === 'warning' ? 'rgba(255, 60, 0, 0.2)' :
                  'rgba(0, 229, 255, 0.1)'
                }`,
              }}
            >
              {/* Holographic Header Bar */}
              <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-slate-500 uppercase pb-1.5 border-b border-slate-900">
                <span>━━━━━━━━ SYSTEM UPDATE ━━━━━━━━</span>
                <button
                  onClick={() => removeNotification(n.id)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Message Details */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 flex items-center justify-center pt-0.5">
                  {n.type === 'level-up' && <ArrowUpCircle className="w-5 h-5 text-neon-blue animate-bounce" />}
                  {n.type === 'achievement' && <Trophy className="w-5 h-5 text-neon-amber" />}
                  {n.type === 'success' && <CheckCircle className="w-5 h-5 text-neon-green" />}
                  {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-neon-red" />}
                  {n.type === 'info' && <Sparkles className="w-5 h-5 text-neon-cyan" />}
                </div>

                <div className="flex-grow">
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 font-mono">{n.message}</p>
                  
                  {n.xpGained && (
                    <span className="inline-block mt-2 text-[9px] font-mono bg-neon-blue/15 text-neon-blue border border-neon-blue/30 px-2 py-0.5 rounded font-semibold tracking-wider uppercase animate-pulse">
                      +{n.xpGained} EXP RECORDED
                    </span>
                  )}
                </div>
              </div>

              {/* Holographic Footer Bar */}
              <div className="text-[7px] font-mono text-slate-600 uppercase tracking-widest text-right mt-1 border-t border-slate-900/60 pt-1">
                SECURE_SYS_LOG // OK
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. Full-Screen level Up Celebration Overlay */}
      <AnimatePresence>
        {levelUpData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            {/* Pulsing shockwave lines on level up */}
            <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none animate-grid-move" />

            <motion.div
              initial={{ scale: 0.8, y: 55, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } }}
              exit={{ scale: 0.8, y: -50, opacity: 0 }}
              className="max-w-md w-full mx-4 p-8 glass-panel clip-hud-corners border-2 border-neon-blue text-center relative shadow-[0_0_60px_rgba(0,240,255,0.45)] card-energy-border"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neon-blue/20 text-neon-blue border border-neon-blue/60 font-display text-sm tracking-widest px-5 py-1.5 rounded-full uppercase text-glow-blue animate-pulse">
                System Announcement
              </div>

              <div className="flex justify-center mb-5">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-neon-blue/40 scale-125"
                  />
                  <div className="w-20 h-20 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.35)]">
                    <ArrowUpCircle className="w-10 h-10 text-neon-blue animate-bounce" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-display font-black text-white uppercase tracking-wider text-glow-blue">
                Level Up!
              </h2>

              <p className="font-mono text-slate-400 mt-2.5 text-xs tracking-wide">
                Your character class has advanced to the next tier.
              </p>

              <div className="my-6 py-5 px-6 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">New Level reached</span>
                <span className="text-4xl font-display font-black text-neon-green text-glow-green block mt-1.5">
                  LVL {levelUpData.level}
                </span>
                <span className="text-xs font-display text-neon-amber uppercase tracking-wider block mt-2.5">
                  Rank: {levelUpData.rankName}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLevelUpData(null)}
                className="w-full py-3.5 bg-neon-blue text-slate-950 font-display font-bold uppercase tracking-widest clip-hud-corners cursor-pointer transition-all hover:bg-neon-cyan"
              >
                Accept Rewards
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};
export default NotificationProvider;
