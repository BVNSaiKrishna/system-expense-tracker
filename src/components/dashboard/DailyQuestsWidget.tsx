import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNotification } from '../layout/NotificationSystem';
import { Shield, Swords, Coins, CheckCircle, Flame } from 'lucide-react';

export const DailyQuestsWidget: React.FC = () => {
  const { user, updateUserStats } = useAuth();
  const { transactions } = useTransactions();
  const { addNotification } = useNotification();

  const userId = user?.uid || '';
  const todayStr = new Date().toISOString().split('T')[0];

  // Load claimed quests from local storage
  const [claimedQuests, setClaimedQuests] = useState<number[]>([]);

  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(`rpg_claims_${userId}_${todayStr}`);
    if (saved) {
      setClaimedQuests(JSON.parse(saved));
    }
  }, [userId, todayStr]);

  if (!user) return null;

  // 1. Calculate stats for today
  const todayTxs = transactions.filter((t) => t.date === todayStr);
  const todayExpense = todayTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayIncome = todayTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Define Quests
  const quests = [
    {
      id: 0,
      title: 'Shield Wall (Budget Defense)',
      desc: 'Keep daily upkeep expenses below 500 Gold.',
      progress: Math.min(500, todayExpense),
      target: 500,
      isCompleted: todayExpense <= 500,
      isInverseProgress: true, // less is better
      goldReward: 100,
      xpReward: 50,
      icon: Shield,
      color: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5',
      glow: 'blue' as const,
    },
    {
      id: 1,
      title: 'Dungeon Raid (Log Upkeep)',
      desc: 'Log at least 1 upkeep expense or guild cost today.',
      progress: todayTxs.filter(t => t.type === 'expense').length,
      target: 1,
      isCompleted: todayTxs.filter(t => t.type === 'expense').length >= 1,
      goldReward: 30,
      xpReward: 40,
      icon: Swords,
      color: 'text-neon-red border-neon-red/20 bg-neon-red/5',
      glow: 'red' as const,
    },
    {
      id: 2,
      title: 'Loot Hunt (Acquire Wealth)',
      desc: 'Log at least 1 income source or bonus loot today.',
      progress: todayTxs.filter(t => t.type === 'income').length,
      target: 1,
      isCompleted: todayTxs.filter(t => t.type === 'income').length >= 1,
      goldReward: 50,
      xpReward: 60,
      icon: Coins,
      color: 'text-neon-green border-neon-green/20 bg-neon-green/5',
      glow: 'green' as const,
    },
  ];

  const handleClaim = async (questId: number, gold: number, xp: number, title: string) => {
    if (claimedQuests.includes(questId)) return;

    try {
      // Award XP & Gold to user context
      await updateUserStats(xp, gold);

      // Save claim locally
      const updatedClaims = [...claimedQuests, questId];
      setClaimedQuests(updatedClaims);
      localStorage.setItem(`rpg_claims_${userId}_${todayStr}`, JSON.stringify(updatedClaims));

      // Trigger premium holographic notification
      addNotification({
        title: 'Daily Quest Claimed!',
        message: `Discharged [${title}]. Awarded +${gold}g Gold & +${xp} XP!`,
        type: 'achievement',
        xpGained: xp,
      });
    } catch (e) {
      console.error('Error claiming quest reward:', e);
    }
  };

  // Time remaining until reset (midnight)
  const getHoursUntilReset = () => {
    const now = new Date();
    const mid = new Date();
    mid.setHours(24, 0, 0, 0);
    const diff = mid.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <Card glowColor="none" className="p-4 flex flex-col h-full bg-slate-950/50">
      
      {/* Widget Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
        <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Flame className="w-4 h-4 text-neon-amber animate-pulse" />
          Active Daily Quests
        </h3>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
          Resets in: {getHoursUntilReset()}
        </span>
      </div>

      {/* Quests Container */}
      <div className="space-y-3.5 flex-grow">
        {quests.map((quest) => {
          const Icon = quest.icon;
          const isClaimed = claimedQuests.includes(quest.id);
          const canClaim = quest.isCompleted && !isClaimed;

          // Progress bar calculations
          let percentage = 0;
          if (quest.isInverseProgress) {
            // inverse logic: green if 0, red if > target
            percentage = Math.round((quest.progress / quest.target) * 100);
          } else {
            percentage = Math.round((quest.progress / quest.target) * 100);
          }
          if (percentage > 100) percentage = 100;

          return (
            <div
              key={quest.id}
              className="p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
            >
              <div className="flex gap-3 items-start flex-grow">
                {/* Icon Circle */}
                <div className={`p-2.5 rounded-lg border flex-shrink-0 ${quest.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Quest details */}
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider leading-none">
                    {quest.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 leading-relaxed">
                    {quest.desc}
                  </p>
                  
                  {/* Quest progress slider */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-grow bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quest.isInverseProgress
                            ? quest.progress >= quest.target
                              ? 'bg-neon-red'
                              : 'bg-neon-blue'
                            : quest.isCompleted
                            ? 'bg-neon-green'
                            : 'bg-neon-purple'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest min-w-[50px] text-right">
                      {quest.isInverseProgress 
                        ? `${quest.progress}g / ${quest.target}g` 
                        : `${quest.progress} / ${quest.target}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0 text-right">
                {isClaimed ? (
                  <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1 justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                    Claimed
                  </div>
                ) : (
                  <Button
                    variant={canClaim ? 'success' : 'secondary'}
                    size="sm"
                    glow={canClaim}
                    disabled={!canClaim}
                    onClick={() => handleClaim(quest.id, quest.goldReward, quest.xpReward, quest.title)}
                    className="w-full md:w-auto min-w-[70px] uppercase font-mono text-[9px] tracking-widest"
                  >
                    {canClaim ? 'Claim' : 'Locked'}
                  </Button>
                )}
                <div className="text-[8px] font-mono text-slate-600 mt-1 uppercase tracking-wider text-center md:text-right">
                  +{quest.goldReward}g | +{quest.xpReward}xp
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
export default DailyQuestsWidget;
