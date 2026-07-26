import React from 'react';
import { useGamification } from '../../hooks/useGamification';
import { Card } from '../ui/Card';
import { Trophy, ShieldAlert, Coins, Flame, Sparkles, Lock } from 'lucide-react';

export const AchievementGrid: React.FC = () => {
  const { achievementsList } = useGamification();

  // Helper to map badge icons
  const getBadgeIcon = (iconSlug: string, unlocked: boolean) => {
    const className = `w-6 h-6 ${unlocked ? 'text-neon-amber' : 'text-slate-600'}`;
    switch (iconSlug) {
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'Coins':
        return <Coins className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {achievementsList.map((ach) => (
        <Card
          key={ach.id}
          glowColor={ach.unlocked ? 'gold' : 'none'}
          clipCorners={true}
          className={`flex gap-4 items-center p-4 transition-all duration-300 ${
            ach.unlocked
              ? 'bg-slate-900/40 border-neon-amber/50 shadow-[0_0_15px_rgba(255,183,3,0.15)]'
              : 'bg-slate-950/20 border-slate-900/60 opacity-60'
          }`}
        >
          {/* Badge slot */}
          <div className={`p-3 rounded-full border flex items-center justify-center flex-shrink-0 relative ${
            ach.unlocked
              ? 'border-neon-amber/30 bg-neon-amber/5'
              : 'border-slate-800 bg-slate-950/50'
          }`}>
            {ach.unlocked ? (
              getBadgeIcon(ach.badgeIcon, true)
            ) : (
              <Lock className="w-6 h-6 text-slate-700" />
            )}
            
            {/* Spinning background effect for unlocked badges */}
            {ach.unlocked && (
              <div className="absolute inset-0 rounded-full border border-dashed border-neon-amber/20 animate-spin-slow pointer-events-none" />
            )}
          </div>

          {/* Achievement Description */}
          <div className="flex-grow min-w-0">
            <h4 className={`text-xs font-display font-black uppercase tracking-wider ${
              ach.unlocked ? 'text-white' : 'text-slate-500'
            }`}>
              {ach.name}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wide truncate">
              {ach.description}
            </p>
            <span className={`inline-block mt-2 text-[8px] font-mono border px-1.5 py-0.5 rounded ${
              ach.unlocked
                ? 'border-neon-amber/40 bg-neon-amber/15 text-neon-amber font-semibold'
                : 'border-slate-800 bg-slate-900 text-slate-600'
            }`}>
              Reward: +{ach.xpReward} XP
            </span>
          </div>

        </Card>
      ))}
    </div>
  );
};
export default AchievementGrid;
