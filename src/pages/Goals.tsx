import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { PlusCircle, Target, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const Goals: React.FC = () => {
  const { goals, isLoading } = useGoals();
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const activeQuests = goals.filter((g) => g.status === 'active');
  const completedQuests = goals.filter((g) => g.status === 'completed');

  // Calculate overall savings progress
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalPercent = Math.round((totalSaved / totalTarget) * 100) || 0;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            Quest log journal
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Savings Quests
          </h1>
        </div>
        <Button
          variant="primary"
          glow={true}
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Launch Savings Quest
        </Button>
      </div>

      {/* 1. Valley of Crystal Reserves Graphic (Glowing Valley and guardians) */}
      <Card glowColor="purple" clipCorners={true} className="p-6 relative overflow-hidden min-h-[220px] flex flex-col justify-center">
        
        {/* Valley Ambient Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/15 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center z-10">
          
          {/* Left: Stats details */}
          <div className="text-center md:text-left flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Reserves Valley status</span>
            <span className="text-2xl font-display font-black text-white uppercase tracking-wider block mt-1">
              Crystal Sanctuary
            </span>
            <span className="text-xs font-mono text-neon-purple uppercase mt-1 block">
              Aggregate Savings: {totalSaved.toLocaleString()}g / {totalTarget.toLocaleString()}g
            </span>
            <p className="text-[10px] font-mono text-slate-500 uppercase mt-2.5 leading-relaxed">
              Spectral guardians watch over the vault crystal. Add contributions to nourish the crystal core.
            </p>
          </div>

          {/* Center: Glowing Floating Crystal & Guardians Scene */}
          <div className="flex justify-center items-center relative h-36">
            
            {/* Rotating Progress Ring behind the crystal */}
            <motion.div
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute w-24 h-24 rounded-full border border-dashed border-neon-purple/40 flex items-center justify-center"
              style={{
                boxShadow: '0 0 15px rgba(157, 78, 221, 0.1)',
              }}
            >
              {/* Inner accent ring */}
              <div className="w-20 h-20 rounded-full border border-double border-neon-blue/20" />
            </motion.div>

            {/* Left Guardian Silhouette */}
            <div className="absolute left-[20%] bottom-4 opacity-40">
              <svg className="w-6 h-10 fill-neon-purple" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2.2" />
                <path d="M12,8 Q8,12 12,18 L10,24 L12,24 L14,19 L16,24 L18,24 Z" />
                <line x1="6" y1="2" x2="6" y2="22" stroke="#9d4edd" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Right Guardian Silhouette */}
            <div className="absolute right-[20%] bottom-4 opacity-40">
              <svg className="w-6 h-10 fill-neon-blue" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2.2" />
                <path d="M12,8 Q16,12 12,18 L14,24 L12,24 L10,19 L8,24 L6,24 Z" />
                <line x1="18" y1="2" x2="18" y2="22" stroke="#00f0ff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Floating rotating Crystal core */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, -6, 0],
                      rotateY: [0, 360],
                    }
              }
              transition={{
                y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
              }}
              className="z-10 w-12 h-16 flex items-center justify-center drop-shadow-[0_0_15px_rgba(0,240,255,0.7)]"
            >
              {/* Crystal SVG shape */}
              <svg className="w-full h-full text-neon-blue fill-current" viewBox="0 0 100 130">
                <polygon points="50,10 85,50 50,120 15,50" opacity="0.8" />
                <polygon points="50,10 50,120 85,50" opacity="0.3" fill="#ffffff" />
                <polygon points="50,10 50,120 15,50" opacity="0.1" fill="#000000" />
              </svg>
            </motion.div>

            {/* Pulse light behind crystal */}
            <div className="absolute w-12 h-12 bg-neon-blue/20 rounded-full filter blur-xl animate-pulse" />

          </div>

          {/* Right: Big Progress Number */}
          <div className="text-center md:text-right flex flex-col justify-center pr-0 md:pr-6 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Overall Sanctuary Health</span>
            <span className="text-4xl font-display font-black text-neon-purple text-glow-purple mt-1 block">
              {totalPercent}%
            </span>
            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider block">
              Capacity Complete
            </span>
          </div>

        </div>
      </Card>

      {/* 2. Active Quests Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-3 bg-neon-blue inline-block animate-pulse" />
          Active Quests ({activeQuests.length})
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1].map((i) => (
              <div key={i} className="h-56 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activeQuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-900 rounded-lg bg-slate-950/20">
            <Target className="w-8 h-8 text-slate-700 animate-pulse mb-3" />
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">No active savings quests.</p>
            <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase">Launch a savings quest to secure target funds.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeQuests.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}
      </div>

      {/* 3. Completed Quests Section */}
      {completedQuests.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-display font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-green inline-block" />
            Completed Archives ({completedQuests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuests.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Launch Savings Quest */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Launch Savings Quest">
        <GoalForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};
export default Goals;
