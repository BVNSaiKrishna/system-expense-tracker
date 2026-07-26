import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { CreditCard, RarityType } from '../types';
import { useNotification } from '../components/layout/NotificationSystem';

export const useCreditCards = () => {
  const { user, updateUserStats } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const userId = user?.uid || '';
  const isGuest = user?.isGuest ?? true;

  // QUERY: Fetch Credit Cards
  const { data: creditCards = [], isLoading } = useQuery<CreditCard[]>({
    queryKey: ['creditCards', userId],
    queryFn: () => dbService.getCreditCards(userId, isGuest),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Helper to determine card rarity tier based on limit
  const getCardRarity = (limit: number): RarityType => {
    if (limit < 2000) return 'common';
    if (limit < 7500) return 'rare';
    if (limit < 20000) return 'epic';
    return 'legendary';
  };

  // MUTATION: Forge Credit Card (Add Card)
  const addCreditCardMutation = useMutation({
    mutationFn: async (c: Omit<CreditCard, 'id' | 'userId' | 'createdAt' | 'rarity'>) => {
      if (!userId) throw new Error('User not logged in');
      const rarity = getCardRarity(c.limit);
      return dbService.addCreditCard(userId, isGuest, { ...c, rarity });
    },
    onSuccess: async (newCard) => {
      queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
      await updateUserStats(30, 0); // Award XP for forging
      addNotification({
        title: 'Relic Card Forged',
        message: `Successfully equipped [${newCard.name}] (${newCard.rarity.toUpperCase()}). +30 XP!`,
        type: 'success',
        xpGained: 30,
      });
    },
  });

  // MUTATION: Pay Card (Discharge Statement Debt)
  const payCardMutation = useMutation({
    mutationFn: async ({ card, amount }: { card: CreditCard; amount: number }) => {
      if (!userId) throw new Error('User not logged in');
      if (!user) throw new Error('No user context');

      if (user.currencyGold < amount) {
        throw new Error('Insufficient gold in wallet to clear this debt!');
      }

      if (amount <= 0 || card.balance < amount) {
        throw new Error('Invalid payment amount!');
      }

      // 1. Log a payment transaction (which will reduce wallet gold and add XP via transactional flow)
      const payTx = await dbService.addTransaction(userId, isGuest, {
        amount,
        type: 'expense',
        category: 'Debt Repayment',
        description: `Discharged statement for [${card.name}]`,
        date: new Date().toISOString().split('T')[0],
        cardId: null, // wallet cash flow, not card charge
      });

      // 2. Reduce the card balance
      const updatedCard = {
        ...card,
        balance: Math.max(0, card.balance - amount),
      };
      await dbService.updateCreditCard(userId, isGuest, updatedCard);

      return { payTx, updatedCard, amount };
    },
    onSuccess: async ({ updatedCard, amount }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });

      // Payoff rewards extra XP (+30 XP for debt clearance, in addition to transaction base XP)
      await updateUserStats(30, -amount);

      addNotification({
        title: 'Debt Discharged!',
        message: `Paid ${amount}g off statement for [${updatedCard.name}]. +30 XP!`,
        type: 'success',
        xpGained: 30,
      });
    },
  });

  // MUTATION: Delete Credit Card (Dismantle Relic)
  const deleteCreditCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      if (!userId) throw new Error('User not logged in');
      await dbService.deleteCreditCard(userId, isGuest, cardId);
      return cardId;
    },
    onSuccess: (cardId) => {
      queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
      // Invalidate transactions because some might be linked to this card
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      
      addNotification({
        title: 'Relic Card Dismantled',
        message: 'The card relic has been returned to the void.',
        type: 'info',
      });
    },
  });

  return {
    creditCards,
    isLoading,
    addCreditCard: addCreditCardMutation.mutateAsync,
    payCard: payCardMutation.mutateAsync,
    deleteCreditCard: deleteCreditCardMutation.mutateAsync,
  };
};
export default useCreditCards;
