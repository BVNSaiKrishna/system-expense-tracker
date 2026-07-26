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
            <SoloLevelingAvatar level={user.level} />
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

interface SoloLevelingAvatarProps {
  level: number;
  className?: string;
}

export const SoloLevelingAvatar: React.FC<SoloLevelingAvatarProps> = ({ level, className = "w-full h-full" }) => {
  const isHighLevel = level >= 26;
  const isMidLevel = level >= 8 && level < 26;
  
  // Dynamic Solo Leveling visual progressions
  let eyeColor = '#00f0ff'; // E-Rank: System Cyan
  let bgStart = '#0f172a';
  let bgEnd = '#1e293b';
  let auraOpacity = 0;

  if (isHighLevel) {
    eyeColor = '#9d4edd'; // S-Rank: Monarch Shadow Purple
    bgStart = '#18072b';
    bgEnd = '#030008';
    auraOpacity = 0.7;
  } else if (isMidLevel) {
    eyeColor = '#ff0055'; // B/A-Rank: Crimson Rage Red
    bgStart = '#240615';
    bgEnd = '#080104';
    auraOpacity = 0.25;
  }

  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`avatarGrad-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgStart} />
          <stop offset="100%" stopColor={bgEnd} />
        </linearGradient>
        <filter id={`eyeGlow-${level}`}>
          <feGaussianBlur stdDeviation="1.8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id={`auraGlow-${level}`}>
          <feGaussianBlur stdDeviation="3" result="auraBlur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.8"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Base Background Shield */}
      <circle cx="50" cy="50" r="48" fill={`url(#avatarGrad-${level})`} />

      {/* Cyber Shading Grid Overlay */}
      <path d="M 0,50 L 100,50 M 50,0 L 50,100" stroke="#ffffff" strokeWidth="0.1" opacity="0.06" />

      {/* Shadow sovereign magic aura flares */}
      {auraOpacity > 0 && (
        <g opacity={auraOpacity} filter={`url(#auraGlow-${level})`}>
          <path 
            d="M 50,10 C 30,10 25,35 25,50 C 25,65 35,70 50,70 C 65,70 75,65 75,50 C 75,35 70,10 50,10 Z" 
            fill={eyeColor} 
            opacity="0.15"
          />
          {/* Flame-like tendril trails */}
          <path d="M 40,30 Q 30,15 35,5 Q 42,15 45,28 Z" fill={eyeColor} opacity="0.25" />
          <path d="M 60,30 Q 70,15 65,5 Q 58,15 55,28 Z" fill={eyeColor} opacity="0.25" />
        </g>
      )}

      {/* Shoulders and collar */}
      <path d="M 15,92 C 18,72 30,62 50,62 C 70,62 82,72 85,92 Z" fill="#030712" />

      {/* Head and Neck */}
      <path d="M 50,34 C 41,34 39,43 41,50 C 39,52 42,56 44,58 C 45,60 48,62 50,62 C 52,62 55,60 56,58 C 58,56 61,52 59,50 C 61,43 59,34 50,34" fill="#030712" />

      {/* Spikey hunter hair strands */}
      <path d="M 40,36 L 43,26 L 46,30 L 50,22 L 54,30 L 57,26 L 60,36 L 56,40 L 50,37 L 44,40 Z" fill="#030712" />
      <path d="M 37,42 L 40,37 L 42,42 Z" fill="#030712" />
      <path d="M 63,42 L 60,37 L 58,42 Z" fill="#030712" />

      {/* Glowing Slit Eyes */}
      <ellipse cx="44" cy="47" rx="3.5" ry="1.2" fill={eyeColor} filter={`url(#eyeGlow-${level})`} />
      <ellipse cx="56" cy="47" rx="3.5" ry="1.2" fill={eyeColor} filter={`url(#eyeGlow-${level})`} />
    </svg>
  );
};

export default LevelHUD;
