import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../hooks/useGamification';
import { useGoals } from '../hooks/useGoals';
import { useCreditCards } from '../hooks/useCreditCards';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trophy, Target, Settings, ArrowRight, Shield } from 'lucide-react';
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

  const xpNeeded = user.level * 150;
  const progressPercent = Math.min(100, Math.round((user.xp / xpNeeded) * 100) || 0);

  // SVG circular progress settings
  const radius = 60;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      
      {/* 1. Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 text-left">
        <div>
          <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
            System Operating Registry
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            System Profile
          </h1>
        </div>
      </div>

      {/* 2. Glass Backing Card with Large XP Ring */}
      <Card 
        glowColor="none" 
        clipCorners={false} 
        className="p-8 relative overflow-hidden flex flex-col justify-center items-center text-center bg-white/5 border border-white/5 rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.4)] backdrop-blur-xl group"
      >
        {/* Specular Glare Swipe */}
        {!prefersReducedMotion && (
          <motion.div
            animate={{ x: ['-100%', '220%'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
          />
        )}

        {/* Large Circular XP Progress Ring */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              stroke="rgba(255, 255, 255, 0.05)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="w-full h-full origin-center scale-[1.33]"
            />
            <circle
              stroke="#00C8FF"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset: strokeDashoffset * 1.33 }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="w-full h-full origin-center scale-[1.33] transition-all duration-700 ease-out"
            />
          </svg>

          {/* Central Avatar Frame */}
          <div className="absolute w-24 h-24 rounded-full overflow-hidden border border-white/10 bg-slate-900 shadow-lg flex items-center justify-center">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl text-[#00C8FF] font-black font-sans">
                {user.displayName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Floating Level Badge */}
          <div className="absolute -bottom-1 bg-[#00C8FF] text-slate-950 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-md">
            LV. {user.level}
          </div>
        </div>

        {/* Profile details */}
        <h2 className="text-2xl font-black text-white tracking-tight">
          {user.displayName}
        </h2>
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-[10px] font-sans font-bold text-slate-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {user.rankName}
          </span>
          <span className="text-[10px] font-sans font-bold text-slate-500 bg-white/2 border border-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {user.xp} / {xpNeeded} XP ({progressPercent}%)
          </span>
        </div>
      </Card>

      {/* 3. Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Left Card: Inventory stats */}
        <Card glowColor="none" className="p-6 bg-white/5 border border-white/5 rounded-2xl shadow-md backdrop-blur-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-blue" />
            Inventory & Achievements
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3.5 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-[#FACC15]" />
                <span className="text-xs font-bold text-slate-300 uppercase">Achievements Unlocked</span>
              </div>
              <span className="text-xs font-bold text-[#FACC15]">{unlockedCount} / {achievementsList.length}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-[#00C8FF]" />
                <span className="text-xs font-bold text-slate-300 uppercase">Active Savings Quests</span>
              </div>
              <span className="text-xs font-bold text-[#00C8FF]">{activeQuests} Active</span>
            </div>

            <div className="flex justify-between items-center p-3.5 bg-white/2 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span className="text-xs font-bold text-slate-300 uppercase">Equipped Card Relics</span>
              </div>
              <span className="text-xs font-bold text-[#22C55E]">{creditCards.length} Linked</span>
            </div>
          </div>
        </Card>

        {/* Right Card: Quick Actions */}
        <Card glowColor="none" className="p-6 bg-white/5 border border-white/5 rounded-2xl shadow-md backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-neon-purple" />
              Sovereign Console
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              Access settings to synchronize your cache data with Firebase servers or change your profile name and theme signatures.
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/achievements">
              <Button variant="primary" fullWidth={true} className="rounded-xl py-3 font-sans font-bold uppercase text-[10px] tracking-wider">
                <span>View Hall of Trophies</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="secondary" fullWidth={true} className="rounded-xl py-3 font-sans font-bold uppercase text-[10px] tracking-wider">
                <span>Modify System Config</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default Profile;
