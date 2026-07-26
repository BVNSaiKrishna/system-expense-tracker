import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { CreditCard } from '../../types';
import { Shield, Sparkles } from 'lucide-react';

interface PremiumGlassCardProps {
  card: CreditCard;
  onClick?: () => void;
  className?: string;
  isInteractive?: boolean;
}

export const PremiumGlassCard: React.FC<PremiumGlassCardProps> = ({
  card,
  onClick,
  className = '',
  isInteractive = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

  // Framer Motion spring rotation states
  const rotateX = useSpring(useMotionValue(0), { damping: 25, stiffness: 220 });
  const rotateY = useSpring(useMotionValue(0), { damping: 25, stiffness: 220 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coords relative to card center (-1 to 1 range)
    const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
    const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

    // Apply rotation
    rotateX.set(-mouseY * 12); // Max tilt 12 degrees
    rotateY.set(mouseX * 12);

    // Specular Glare position tracking
    const glareX = ((e.clientX - rect.left) / width) * 100;
    const glareY = ((e.clientY - rect.top) / height) * 100;
    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 60%)`,
    });
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setGlareStyle({
      background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%)',
      transition: 'all 0.5s ease',
    });
  };

  // HSL gradient themes matching card colors
  const themes = {
    blue: 'from-blue-900/60 via-indigo-950/40 to-slate-950/80 border-[#00C8FF]/20 shadow-blue-500/5 hover:border-[#00C8FF]/40',
    purple: 'from-purple-900/60 via-fuchsia-950/40 to-slate-950/80 border-[#9d4edd]/20 shadow-purple-500/5 hover:border-[#9d4edd]/40',
    amber: 'from-amber-900/40 via-yellow-950/30 to-slate-950/80 border-[#FACC15]/20 shadow-amber-500/5 hover:border-[#FACC15]/40',
    pink: 'from-pink-900/50 via-rose-950/40 to-slate-950/80 border-[#ec4899]/20 shadow-pink-500/5 hover:border-[#ec4899]/40',
    green: 'from-emerald-950/60 via-green-950/40 to-slate-950/80 border-[#22C55E]/20 shadow-green-500/5 hover:border-[#22C55E]/40',
    red: 'from-rose-950/60 via-red-950/40 to-slate-950/80 border-[#EF4444]/20 shadow-red-500/5 hover:border-[#EF4444]/40',
    silver: 'from-slate-800/50 via-slate-900/35 to-slate-950/80 border-slate-400/20 shadow-slate-500/5 hover:border-slate-400/40',
    gold: 'from-yellow-950/40 via-amber-950/50 to-slate-950/90 border-[#fbbf24]/20 shadow-yellow-500/5 hover:border-[#fbbf24]/40',
  }[card.color || 'blue'];

  // Network text/logos mapping
  const networkName = card.network || 'Visa';

  const utilization = card.limit > 0 ? Math.round((card.balance / card.limit) * 100) : 0;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative aspect-[1.586/1] w-full rounded-[24px] bg-gradient-to-br p-6 border text-white shadow-2xl backdrop-blur-xl cursor-pointer select-none transition-all duration-300 ${themes} ${className}`}
    >
      {/* Parallax Specular Reflection Layer */}
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none z-10 transition-opacity duration-300"
        style={glareStyle}
      />

      {/* Card Content Layout */}
      <div className="h-full flex flex-col justify-between relative z-20 pointer-events-none" style={{ transform: 'translateZ(20px)' }}>
        
        {/* Bank & Network row */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-mono tracking-widest text-[#00C8FF]/90 font-bold uppercase">
              {(card.bank || 'Unknown Bank').toUpperCase()}
            </span>
            <span className="text-[11px] font-sans font-medium tracking-wide text-slate-300 mt-0.5">
              {card.name || 'Unnamed Card'}
            </span>
          </div>

          <div className="text-sm font-sans font-black italic tracking-wider opacity-90">
            {networkName}
          </div>
        </div>

        {/* Card Chip & Wireless Row */}
        <div className="flex justify-between items-center my-1">
          {/* SVG Smart Chip */}
          <svg className="w-9 h-7 text-amber-400/80 fill-current opacity-80" viewBox="0 0 100 80">
            <rect width="100" height="80" rx="10" fill="url(#chip-grad)" />
            <defs>
              <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3f4f6" />
                <stop offset="50%" stopColor="#d1d5db" />
                <stop offset="100%" stopColor="#9ca3af" />
              </linearGradient>
            </defs>
            <path d="M10 20 H90 V60 H10 Z" fill="none" stroke="#4b5563" strokeWidth="2" />
            <path d="M30 20 V60 M70 V60 M50 20 V60 M10 40 H90" stroke="#4b5563" strokeWidth="2" />
          </svg>

          {/* Sparkles / Rarity status */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[8px] font-mono tracking-widest text-slate-400">
            <Sparkles className="w-2.5 h-2.5 text-[#00C8FF]" />
            {(card.rarity || 'common').toUpperCase()}
          </div>
        </div>

        {/* Card number representation */}
        <div className="font-mono text-base tracking-widest text-slate-100 flex items-center gap-1 mt-1">
          <span>••••</span>
          <span>••••</span>
          <span>••••</span>
          <span className="text-white font-bold">{card.last4Digits || '0000'}</span>
        </div>

        {/* Card Footer detail */}
        <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
          <div>
            <span className="text-[7.5px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
              Outstanding
            </span>
            <span className="text-xs font-mono font-bold text-slate-100 mt-0.5 block">
              {card.balance.toLocaleString()} G
            </span>
          </div>

          <div className="text-right">
            <span className="text-[7.5px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
              Limit
            </span>
            <span className="text-xs font-mono font-semibold text-slate-300 mt-0.5 block">
              {card.limit.toLocaleString()} G
            </span>
          </div>

          <div className="text-right">
            <span className="text-[7.5px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
              Utilization
            </span>
            <span className={`text-xs font-mono font-bold mt-0.5 block ${
              utilization >= 70 ? 'text-red-400' : utilization >= 30 ? 'text-amber-400' : 'text-green-400'
            }`}>
              {utilization}%
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default PremiumGlassCard;
