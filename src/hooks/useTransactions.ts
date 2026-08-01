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
            title: 'SYSTEM UPDATED',
            message: 'Expense Recorded Successfully',
            type: 'success',
            xpGained: 10,
          });
        } else {
          // Cash/Wallet Expense
          await updateUserStats(10, -newTx.amount);
          addNotification({
            title: 'SYSTEM UPDATED',
            message: 'Expense Recorded Successfully',
            type: 'success',
            xpGained: 10,
          });
        }
      } else {
        // Income
        await updateUserStats(15, newTx.amount);
        addNotification({
          title: 'SYSTEM UPDATED',
          message: 'Income Recorded Successfully',
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

  // MUTATION: Update transaction
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ oldTx, newTx }: { oldTx: Transaction; newTx: Transaction }) => {
      if (!userId) throw new Error('User not logged in');
      await dbService.updateTransaction(userId, isGuest, newTx);
      return { oldTx, newTx };
    },
    onSuccess: async ({ oldTx, newTx }) => {
      // Invalidate query caches
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });

      let netGoldChange = 0;

      // 1. Reverse the effect of the OLD transaction
      if (oldTx.type === 'expense') {
        if (oldTx.cardId) {
          // Decrement old card outstanding balance
          try {
            const cards = queryClient.getQueryData<CreditCard[]>(['creditCards', userId]) || 
                          await dbService.getCreditCards(userId, isGuest);
            const targetCard = cards.find((c) => c.id === oldTx.cardId);
            if (targetCard) {
              const updatedCard = {
                ...targetCard,
                balance: Math.max(0, targetCard.balance - oldTx.amount),
              };
              await dbService.updateCreditCard(userId, isGuest, updatedCard);
            }
          } catch (e) {
            console.error('Error reversing old card charge:', e);
          }
        } else {
          // Cash expense reversed (refunded to wallet)
          netGoldChange += oldTx.amount;
        }
      } else {
        // Income reversed (subtracted from wallet)
        netGoldChange -= oldTx.amount;
      }

      // 2. Apply the effect of the NEW transaction
      if (newTx.type === 'expense') {
        if (newTx.cardId) {
          // Increment new card outstanding balance
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
            }
          } catch (e) {
            console.error('Error applying new card charge:', e);
          }
        } else {
          // Cash expense applied (deducted from wallet)
          netGoldChange -= newTx.amount;
        }
      } else {
        // Income applied (added to wallet)
        netGoldChange += newTx.amount;
      }

      // Commit wallet changes
      if (netGoldChange !== 0) {
        await updateUserStats(0, netGoldChange);
      }

      addNotification({
        title: 'LOG REFORGED',
        message: 'Operation records modified successfully.',
        type: 'success',
      });
    }
  });

  return {
    transactions,
    isLoading,
    addTransaction: addTransactionMutation.mutateAsync,
    updateTransaction: updateTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
  };
};
export default useTransactions;
