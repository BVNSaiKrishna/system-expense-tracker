import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '../ui/ProgressBar';
import { Shield, Sparkles, Sword } from 'lucide-react';

export const LevelHUD: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const xpNeeded = user.level * 150;
  const xpPercentage = Math.round((user.xp / xpNeeded) * 100);

  // Avatar placeholder background color selector based on level tier
  const getAvatarColor = () => {
    if (user.level < 5) return 'from-cyan-900 to-slate-900 border-neon-blue';
    if (user.level < 10) return 'from-purple-900 to-slate-900 border-neon-purple';
    return 'from-amber-900 to-slate-900 border-neon-amber';
  };

  return (
    <div className="glass-panel border border-slate-800/80 p-5 rounded-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-md">
      
      {/* Decorative Scanner Glow Line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-pulse" />

      {/* 1. Holographic RPG Avatar Frame */}
      <div className="relative flex-shrink-0">
        
        {/* Outer Rotating Hexagon Ring */}
        <div className="absolute -inset-2 rounded-full border border-dashed border-neon-blue/30 animate-spin-slow pointer-events-none" />

        {/* Profile Avatar Container */}
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor()} border-2 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,240,255,0.15)] overflow-hidden`}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-white font-display select-none">
              {user.isGuest ? (
                <Sword className="w-8 h-8 text-neon-blue animate-pulse" />
              ) : (
                <Shield className="w-8 h-8 text-neon-purple animate-pulse" />
              )}
            </div>
          )}
          {/* Subtle grid cover on avatar */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        </div>

        {/* Level Badge Overlay */}
        <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-800 text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-md z-10 flex items-center gap-0.5">
          <span className="text-neon-blue">LV.</span>
          <span className="font-display font-extrabold">{user.level}</span>
        </div>
      </div>

      {/* 2. Character Stats Details */}
      <div className="flex-grow w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1">
          <h2 className="text-lg font-display font-black text-white uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
            {user.displayName}
            {user.level >= 10 && <Sparkles className="w-4 h-4 text-neon-amber animate-bounce" />}
          </h2>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest bg-neon-blue/10 px-2 py-0.5 border border-neon-blue/20 rounded">
            {user.rankName}
          </span>
        </div>

        <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">
          Class: {user.isGuest ? 'GUEST WANDERER' : 'REGISTERED PALADIN'}
        </p>

        {/* XP Status Gauge */}
        <div className="mt-4">
          <ProgressBar
            value={user.xp}
            max={xpNeeded}
            color={user.level >= 10 ? 'amber' : user.level >= 5 ? 'purple' : 'blue'}
            label="Experience (XP)"
            subLabel={`${user.xp} / ${xpNeeded} XP (${xpPercentage}%)`}
            size="sm"
            glow={true}
          />
        </div>
      </div>
    </div>
  );
};
export default LevelHUD;
