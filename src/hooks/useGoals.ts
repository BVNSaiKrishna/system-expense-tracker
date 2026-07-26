import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { SavingsGoal } from '../types';
import { useNotification } from '../components/layout/NotificationSystem';

export const useGoals = () => {
  const { user, updateUserStats } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const userId = user?.uid || '';
  const isGuest = user?.isGuest ?? true;

  // QUERY: Fetch Goals
  const { data: goals = [], isLoading } = useQuery<SavingsGoal[]>({
    queryKey: ['goals', userId],
    queryFn: () => dbService.getGoals(userId, isGuest),
    enabled: !!userId,
  });

  // MUTATION: Add Goal
  const addGoalMutation = useMutation({
    mutationFn: async (g: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'status'>) => {
      if (!userId) throw new Error('User not logged in');
      return dbService.addGoal(userId, isGuest, g);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
      addNotification({
        title: 'New Quest Logged',
        message: 'A new savings goal has been created in your registry.',
        type: 'success',
      });
    },
  });

  // MUTATION: Contribute / Update Goal
  const contributeToGoalMutation = useMutation({
    mutationFn: async ({ goal, amount }: { goal: SavingsGoal; amount: number }) => {
      if (!userId) throw new Error('User not logged in');
      if (!user) throw new Error('No user context');
      
      if (user.currencyGold < amount) {
        throw new Error('Insufficient Gold in your wallet!');
      }

      const nextAmount = goal.currentAmount + amount;
      const isCompletedNow = nextAmount >= goal.targetAmount;

      const updatedGoal: SavingsGoal = {
        ...goal,
        currentAmount: Math.min(goal.targetAmount, nextAmount),
        status: isCompletedNow ? 'completed' : goal.status,
      };

      await dbService.updateGoal(userId, isGuest, updatedGoal);
      return { updatedGoal, amount, isCompletedNow };
    },
    onSuccess: async ({ updatedGoal, amount, isCompletedNow }) => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });

      if (isCompletedNow) {
        // Quest Completed: Deduct contribution, reward +200 XP
        await updateUserStats(200, -amount);
        addNotification({
          title: 'Quest Completed!',
          message: `Saved ${updatedGoal.targetAmount}g for [${updatedGoal.name}]. +200 XP!`,
          type: 'achievement',
          xpGained: 200,
        });
      } else {
        // Standard Contribution: Deduct contribution, no level up unless XP triggered elsewhere
        await updateUserStats(0, -amount);
        addNotification({
          title: 'Quest Contribution',
          message: `Transferred ${amount}g into [${updatedGoal.name}] vault.`,
          type: 'success',
        });
      }
    },
  });

  // MUTATION: Delete Goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (goal: SavingsGoal) => {
      if (!userId) throw new Error('User not logged in');
      const wasDeleted = await dbService.deleteGoal(userId, isGuest, goal.id);
      return { goal, wasDeleted };
    },
    onSuccess: async ({ goal: deletedGoal, wasDeleted }) => {
      if (!wasDeleted) return;

      queryClient.invalidateQueries({ queryKey: ['goals', userId] });

      // If the goal was deleted and had active contributions, refund the gold back to the wallet
      if (deletedGoal.currentAmount > 0 && deletedGoal.status !== 'completed') {
        await updateUserStats(0, deletedGoal.currentAmount);
        addNotification({
          title: 'Quest Dismantled',
          message: `Refunded ${deletedGoal.currentAmount}g from [${deletedGoal.name}] vault to wallet.`,
          type: 'info',
        });
      } else {
        addNotification({
          title: 'Quest Cleared',
          message: `Goal [${deletedGoal.name}] has been removed.`,
          type: 'info',
        });
      }
    },
  });

  return {
    goals,
    isLoading,
    addGoal: addGoalMutation.mutateAsync,
    contributeToGoal: contributeToGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
  };
};
export default useGoals;
