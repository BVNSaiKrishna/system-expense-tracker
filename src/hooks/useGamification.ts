import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/layout/NotificationSystem';
import { Transaction, CreditCard, SavingsGoal, Achievement } from '../types';

export const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'frugal_warrior',
    name: 'Frugal Warrior',
    description: 'Keep monthly spending below 60% of income',
    badgeIcon: 'ShieldAlert',
    xpReward: 100,
  },
  {
    id: 'gold_hoarder',
    name: 'Gold Hoarder',
    description: 'Accumulate more than 1,000g in wallet gold',
    badgeIcon: 'Coins',
    xpReward: 150,
  },
  {
    id: 'consistency_scroll',
    name: 'Consistency Scroll',
    description: 'Maintain a 5+ day daily tracking streak',
    badgeIcon: 'Flame',
    xpReward: 100,
  },
  {
    id: 'debt_defeater',
    name: 'Debt Defeater',
    description: 'Keep all credit card relics discharged (0 balance)',
    badgeIcon: 'Sparkles',
    xpReward: 200,
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Complete at least one active savings goal quest',
    badgeIcon: 'Trophy',
    xpReward: 250,
  },
];

export const useGamification = () => {
  const { user, updateUserStats } = useAuth();
  const { addNotification } = useNotification();

  // Load unlocked achievement IDs
  const getUnlockedAchievements = useCallback((): string[] => {
    if (!user) return [];
    const key = `rpg_achievements_${user.uid}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }, [user]);

  // Check and unlock new achievements
  const evaluateAchievements = useCallback(
    async (
      txs: Transaction[],
      cards: CreditCard[],
      goals: SavingsGoal[]
    ) => {
      if (!user) return;

      const unlockedIds = getUnlockedAchievements();
      const newlyUnlocked: string[] = [];

      for (const ach of ACHIEVEMENTS_LIST) {
        if (unlockedIds.includes(ach.id)) continue;

        let isEligible = false;

        switch (ach.id) {
          case 'frugal_warrior': {
            // Get current month transactions
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const monthTxs = txs.filter((t) => t.date.startsWith(currentMonthStr));
            
            const income = monthTxs
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0);
            const expenses = monthTxs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);

            // Need at least some income and expenses to qualify, and expense < 60% of income
            if (income > 0 && expenses > 0 && expenses / income < 0.6) {
              isEligible = true;
            }
            break;
          }

          case 'gold_hoarder':
            if (user.currencyGold >= 1000) {
              isEligible = true;
            }
            break;

          case 'consistency_scroll':
            if (user.streak >= 5) {
              isEligible = true;
            }
            break;

          case 'debt_defeater':
            // Must have at least one card, and all card balances are 0
            if (cards.length > 0 && cards.every((c) => c.balance === 0)) {
              isEligible = true;
            }
            break;

          case 'goal_crusher':
            if (goals.some((g) => g.status === 'completed' || g.currentAmount >= g.targetAmount)) {
              isEligible = true;
            }
            break;

          default:
            break;
        }

        if (isEligible) {
          newlyUnlocked.push(ach.id);
          
          // Trigger reward
          await updateUserStats(ach.xpReward, 0);

          // Add System Alert
          addNotification({
            title: 'Achievement Unlocked!',
            message: `You earned the title [${ach.name}]. Reward: +${ach.xpReward} XP!`,
            type: 'achievement',
            xpGained: ach.xpReward,
          });
        }
      }

      if (newlyUnlocked.length > 0) {
        const key = `rpg_achievements_${user.uid}`;
        const updated = [...unlockedIds, ...newlyUnlocked];
        localStorage.setItem(key, JSON.stringify(updated));
      }
    },
    [user, getUnlockedAchievements, updateUserStats, addNotification]
  );

  return {
    achievementsList: ACHIEVEMENTS_LIST.map((ach) => ({
      ...ach,
      unlocked: getUnlockedAchievements().includes(ach.id),
      unlockedAt: null, // Simple visual list, doesn't need timestamp details
    })),
    evaluateAchievements,
  };
};
export default useGamification;
