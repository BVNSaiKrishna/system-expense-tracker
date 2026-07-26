import React from 'react';
import { AchievementGrid } from '../components/achievements/AchievementGrid';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Trophy, Star, Shield } from 'lucide-react';

export const Achievements: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            System hall of records
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Achievement Badges
          </h1>
        </div>
      </div>

      {/* Ranks & Progression Overview */}
      <Card glowColor="none" className="p-5 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neon-amber/10 border border-neon-amber/40 rounded-full flex items-center justify-center text-neon-amber">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
              {user.rankName}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">
              Active Tier Class status
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-center">
          <div className="px-4 py-2 bg-slate-950 border border-slate-900 rounded">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Character Level</span>
            <span className="text-lg font-display font-black text-neon-blue mt-0.5 block">LVL {user.level}</span>
          </div>
          <div className="px-4 py-2 bg-slate-950 border border-slate-900 rounded">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Active Streak</span>
            <span className="text-lg font-display font-black text-neon-amber mt-0.5 block">{user.streak} DAYS</span>
          </div>
        </div>
      </Card>

      {/* primary Achievements list */}
      <AchievementGrid />
    </div>
  );
};
export default Achievements;
