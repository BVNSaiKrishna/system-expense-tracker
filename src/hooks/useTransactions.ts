import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { Transaction, CreditCard } from '../types';
import { useNotification } from '../components/layout/NotificationSystem';

export const useTransactions = () => {
  const { user, updateUserStats } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const userId = user?.uid || '';
  const isGuest = user?.isGuest ?? true;

  // QUERY: Fetch transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => dbService.getTransactions(userId, isGuest),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // MUTATION: Add transaction
  const addTransactionMutation = useMutation({
    mutationFn: async (t: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
      if (!userId) throw new Error('User not logged in');
      return dbService.addTransaction(userId, isGuest, t);
    },
    onSuccess: async (newTx) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });

      // Financial balance & XP updates
      if (newTx.type === 'expense') {
        if (newTx.cardId) {
          // Charged to Credit Card Relic
          try {
            const cards = queryClient.getQueryData<CreditCard[]>(['creditCards', userId]) || 
                          await dbService.getCreditCards(userId, isGuest);
            const targetCard = cards.find((c) => c.id === newTx.cardId);
            if (targetCard) {
              const updatedCard = {
                ...targetCard,
                balance: targetCard.balance + newTx.amount,
              };
              await dbService.updateCreditCard(userId, isGuest, updatedCard);
              queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
            }
          } catch (e) {
            console.error('Error updating credit card balance:', e);
          }
          // Award XP, Gold remains unchanged
          await updateUserStats(10, 0);
          addNotification({
            title: 'Card Charge Recorded',
            message: `Charged ${newTx.amount}g to relic [${newTx.description}]. +10 XP!`,
            type: 'success',
            xpGained: 10,
          });
        } else {
          // Cash/Wallet Expense
          await updateUserStats(10, -newTx.amount);
          addNotification({
            title: 'Gold Expended',
            message: `Spent ${newTx.amount}g on [${newTx.description}]. +10 XP!`,
            type: 'success',
            xpGained: 10,
          });
        }
      } else {
        // Income
        await updateUserStats(15, newTx.amount);
        addNotification({
          title: 'Loot Acquired!',
          message: `Earned ${newTx.amount}g from [${newTx.description}]. +15 XP!`,
          type: 'success',
          xpGained: 15,
        });
      }
    },
  });

  // MUTATION: Delete transaction
  const deleteTransactionMutation = useMutation({
    mutationFn: async (tx: Transaction) => {
      if (!userId) throw new Error('User not logged in');
      const wasDeleted = await dbService.deleteTransaction(userId, isGuest, tx.id);
      return { tx, wasDeleted };
    },
    onSuccess: async ({ tx: deletedTx, wasDeleted }) => {
      if (!wasDeleted) return;

      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });

      // Adjust wallet/card state back
      if (deletedTx.type === 'expense') {
        if (deletedTx.cardId) {
          // Refund Credit Card Relic
          try {
            const cards = queryClient.getQueryData<CreditCard[]>(['creditCards', userId]) || 
                          await dbService.getCreditCards(userId, isGuest);
            const targetCard = cards.find((c) => c.id === deletedTx.cardId);
            if (targetCard) {
              const updatedCard = {
                ...targetCard,
                balance: Math.max(0, targetCard.balance - deletedTx.amount),
              };
              await dbService.updateCreditCard(userId, isGuest, updatedCard);
              queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
            }
          } catch (e) {
            console.error('Error refunding credit card balance:', e);
          }
          addNotification({
            title: 'Relic Charge Reversed',
            message: `Removed ${deletedTx.amount}g charge from card relic.`,
            type: 'info',
          });
        } else {
          // Refund Wallet Gold
          await updateUserStats(0, deletedTx.amount);
          addNotification({
            title: 'Gold Returned',
            message: `Reversed wallet expense. +${deletedTx.amount}g restored.`,
            type: 'info',
          });
        }
      } else {
        // Subtract Income from Wallet Gold
        await updateUserStats(0, -deletedTx.amount);
        addNotification({
          title: 'Loot Forfeited',
          message: `Reversed income transaction. -${deletedTx.amount}g deducted.`,
          type: 'info',
        });
      }
    },
  });

  return {
    transactions,
    isLoading,
    addTransaction: addTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
  };
};
export default useTransactions;
