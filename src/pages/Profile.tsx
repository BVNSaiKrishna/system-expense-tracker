import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../hooks/useGamification';
import { useGoals } from '../hooks/useGoals';
import { useCreditCards } from '../hooks/useCreditCards';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trophy, Target, Sparkles, Settings, ArrowRight, Shield } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { achievementsList } = useGamification();
  const { goals } = useGoals();
  const { creditCards } = useCreditCards();
  const prefersReducedMotion = useReducedMotion();

  if (!user) return null;

  const unlockedCount = achievementsList.filter((a) => a.unlocked).length;
  const activeQuests = goals.filter((g) => g.status === 'active').length;

  // Custom visual throne title based on level
  const getThroneTitle = (level: number) => {
    if (level < 5) return 'GUEST WANDERER';
    if (level < 10) return 'GUILD PROTECTOR';
    if (level < 15) return 'SENTINEL SOVEREIGN';
    return 'WEALTH REIGN LORD';
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            Character sovereign registry
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Character Throne
          </h1>
        </div>
      </div>

      {/* 2. Cinematic Throne Room Backdrop */}
      <Card glowColor="blue" clipCorners={true} className="p-6 relative overflow-hidden min-h-[300px] flex flex-col justify-center items-center text-center">
        
        {/* Throne Room Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950 pointer-events-none -z-10" />

        {/* Floating background grids and circles */}
        <motion.div
          animate={prefersReducedMotion ? {} : { rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute w-56 h-56 rounded-full border border-dashed border-neon-blue/10 pointer-events-none"
        />

        {/* Central Throne Room Graphic */}
        <div className="relative flex justify-center items-center h-40 w-full mb-4">
          
          {/* Floating neon energy elements */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-2 h-2 rounded-full bg-neon-blue/80 top-[10%] left-[30%] shadow-[0_0_8px_#00f0ff]"
              />
              <motion.div
                animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-2.5 h-2.5 rounded-full bg-neon-purple/80 bottom-[20%] right-[30%] shadow-[0_0_8px_#9d4edd]"
              />
            </>
          )}

          {/* SVG Throne Silhouette Shape */}
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="z-10 w-28 h-28 flex items-center justify-center drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            <svg className="w-full h-full text-neon-blue fill-current" viewBox="0 0 100 100">
              {/* Backrest of the Throne */}
              <polygon points="50,5 65,30 50,20 35,30" opacity="0.9" />
              {/* Side Spires */}
              <line x1="25" y1="20" x2="35" y2="40" stroke="#00f0ff" strokeWidth="2" opacity="0.6" />
              <line x1="75" y1="20" x2="65" y2="40" stroke="#00f0ff" strokeWidth="2" opacity="0.6" />
              {/* Armrests and Base */}
              <path d="M 28 50 L 32 40 L 68 40 L 72 50 L 70 85 L 30 85 Z" opacity="0.8" />
              <rect x="35" y="45" width="30" height="30" opacity="0.2" fill="#000000" />
              <polygon points="30,85 50,75 70,85 50,95" opacity="0.95" />
            </svg>
          </motion.div>

          {/* Glowing Aura ring */}
          <div className="absolute w-20 h-20 bg-neon-blue/10 rounded-full filter blur-xl animate-pulse" />
        </div>

        {/* Character Title */}
        <span className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.25em]">
          {getThroneTitle(user.level)}
        </span>
        <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mt-1 text-glow-blue">
          {user.displayName}
        </h2>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1.5">
          Guild Class Level {user.level} // Rarity: Paladin
        </p>

      </Card>

      {/* 3. Stats Summary Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Inventory stats */}
        <Card glowColor="none" className="p-5">
          <h3 className="text-xs font-display font-black text-white uppercase tracking-widest pb-3 border-b border-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-blue" />
            Inventory & Achievements
          </h3>

          <div className="space-y-4">
            {/* Stat Row */}
            <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-neon-amber" />
                <span className="text-xs font-display font-bold text-slate-300 uppercase">Achievements Unlocked</span>
              </div>
              <span className="text-sm font-mono font-black text-neon-amber">{unlockedCount} / {achievementsList.length}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-neon-blue" />
                <span className="text-xs font-display font-bold text-slate-300 uppercase">Active Savings Quests</span>
              </div>
              <span className="text-sm font-mono font-black text-neon-blue">{activeQuests} Active</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-neon-green" />
                <span className="text-xs font-display font-bold text-slate-300 uppercase">Equipped Card Relics</span>
              </div>
              <span className="text-sm font-mono font-black text-neon-green">{creditCards.length} Equipped</span>
            </div>
          </div>
        </Card>

        {/* Right Card: Quick Actions */}
        <Card glowColor="none" className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest pb-3 border-b border-slate-900 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-neon-purple" />
              Sovereign Console
            </h3>
            <p className="text-xs font-mono text-slate-400 uppercase leading-relaxed mb-6">
              Access settings to synchronize your cache data with Firebase servers or change your profile name and theme signatures.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link to="/achievements">
              <Button variant="primary" fullWidth={true}>
                <span>View Hall of Trophies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="secondary" fullWidth={true}>
                <span>Modify System Config</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

      </div>

    </div>
  );
};
export default Profile;
