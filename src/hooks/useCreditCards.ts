import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { CreditCard, RarityType, CreditCardStatement } from '../types';
import { useNotification } from '../components/layout/NotificationSystem';
import { useEffect } from 'react';

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
    staleTime: 1000 * 60 * 5,
  });

  // QUERY: Fetch Credit Card Statements
  const { data: statements = [], isLoading: isStatementsLoading } = useQuery<CreditCardStatement[]>({
    queryKey: ['statements', userId],
    queryFn: () => dbService.getStatements(userId, isGuest),
    enabled: !!userId,
  });

  // Auto-generate statements on mount
  useEffect(() => {
    if (userId) {
      dbService.generateBillingStatements(userId, isGuest).then(() => {
        queryClient.invalidateQueries({ queryKey: ['statements', userId] });
      });
    }
  }, [userId, isGuest, queryClient]);

  // Helper to determine card rarity tier based on limit
  const getCardRarity = (limit: number): RarityType => {
    if (limit < 2000) return 'common';
    if (limit < 7500) return 'rare';
    if (limit < 20000) return 'epic';
    return 'legendary';
  };

  // MUTATION: Forge Credit Card (Add Card)
  const addCreditCardMutation = useMutation({
    mutationFn: async (c: Omit<CreditCard, 'id' | 'userId' | 'createdAt' | 'rarity' | 'rewardPoints' | 'cashbackEarned' | 'milesEarned' | 'vouchersEarned'>) => {
      if (!userId) throw new Error('User not logged in');
      const rarity = getCardRarity(c.limit);
      return dbService.addCreditCard(userId, isGuest, { 
        ...c, 
        rarity,
        rewardPoints: 0,
        cashbackEarned: 0,
        milesEarned: 0,
        vouchersEarned: 0,
      });
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

  // MUTATION: Pay general amount / Early payment
  const payCardMutation = useMutation({
    mutationFn: async ({ card, amount }: { card: CreditCard; amount: number }) => {
      if (!userId) throw new Error('User not logged in');
      if (!user) throw new Error('No user context');
      if (user.currencyGold < amount) throw new Error('Insufficient gold');

      // 1. Log payment transaction
      await dbService.addTransaction(userId, isGuest, {
        amount,
        type: 'expense',
        category: 'Credit Card Payment',
        description: `Early payment for [${card.name}]`,
        date: new Date().toISOString().split('T')[0],
        cardId: null,
        paymentMethod: 'Cash',
      });

      // 2. Reduce the card balance
      const updatedCard = {
        ...card,
        balance: Math.max(0, card.balance - amount),
      };
      await dbService.updateCreditCard(userId, isGuest, updatedCard);

      return { amount };
    },
    onSuccess: async ({ amount }) => {
      queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      await updateUserStats(30, -amount);
      addNotification({
        title: 'EARLY PAYMENT SUCCESS',
        message: `Paid off ${amount}g early. +30 XP!`,
        type: 'success',
        xpGained: 30,
      });
    },
  });

  // MUTATION: Pay Statement (Partial, early, full, or overpayments)
  const payStatementMutation = useMutation({
    mutationFn: async ({
      card,
      statement,
      amount,
      paymentMethod,
    }: {
      card: CreditCard;
      statement: CreditCardStatement;
      amount: number;
      paymentMethod: string;
    }) => {
      if (!userId) throw new Error('User not logged in');
      if (!user) throw new Error('No user context');
      if (user.currencyGold < amount) throw new Error('Insufficient gold in wallet');

      // 1. Update the statement
      const newPayment = {
        id: Math.random().toString(36).substring(2, 9),
        amount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
      };

      const updatedStatement: CreditCardStatement = {
        ...statement,
        paidAmount: statement.paidAmount + amount,
        remainingAmount: Math.max(0, statement.remainingAmount - amount),
        payments: [...statement.payments, newPayment],
        status: (statement.paidAmount + amount) >= statement.totalDue ? 'Paid' : 'Payment Processing',
      };

      await dbService.saveStatement(userId, isGuest, updatedStatement);

      // 2. Reduce the card balance
      const updatedCard = {
        ...card,
        balance: Math.max(0, card.balance - amount),
        rewardPoints: card.rewardPoints + Math.floor(amount * 0.05), // Reward points: 5% of payoff amount
      };
      await dbService.updateCreditCard(userId, isGuest, updatedCard);

      // 3. Log ledger transaction
      await dbService.addTransaction(userId, isGuest, {
        amount,
        type: 'expense',
        category: 'Credit Card Payment',
        description: `Statement payoff: [${card.name}]`,
        date: new Date().toISOString().split('T')[0],
        cardId: null,
        paymentMethod,
      });

      return { amount, cardName: card.name };
    },
    onSuccess: async ({ amount, cardName }) => {
      queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
      queryClient.invalidateQueries({ queryKey: ['statements', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      await updateUserStats(30, -amount);
      addNotification({
        title: 'STATEMENT DISCHARGED',
        message: `Successfully paid ${amount}g on statement for ${cardName}. +30 XP!`,
        type: 'success',
        xpGained: 30,
      });
    },
  });

  // MUTATION: Update Credit Card (Reforge Details)
  const updateCreditCardMutation = useMutation({
    mutationFn: async (card: CreditCard) => {
      if (!userId) throw new Error('User not logged in');
      await dbService.updateCreditCard(userId, isGuest, card);
      return card;
    },
    onSuccess: (card) => {
      queryClient.invalidateQueries({ queryKey: ['creditCards', userId] });
      addNotification({
        title: 'Relic Card Reforged',
        message: `Successfully updated configurations for [${card.name}].`,
        type: 'success',
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
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      addNotification({
        title: 'Relic Card Dismantled',
        message: 'The card relic has been returned to the void.',
        type: 'info',
      });
    },
  });

  // Calculate Credit Health Score (0-100)
  const getCardHealth = (card: CreditCard) => {
    const cardStatements = statements.filter((s) => s.cardId === card.id);
    const utilization = card.limit > 0 ? (card.balance / card.limit) * 100 : 0;
    
    let utilScore = 100;
    if (utilization >= 70) utilScore = 10;
    else if (utilization >= 30) utilScore = 60;

    const hasOverdue = cardStatements.some((s) => s.status === 'Overdue');
    const paymentScore = hasOverdue ? 0 : 100;

    const score = Math.round(utilScore * 0.4 + paymentScore * 0.6);
    
    let rating: 'Excellent' | 'Good' | 'Average' | 'Needs Attention' = 'Excellent';
    if (score < 40) rating = 'Needs Attention';
    else if (score < 70) rating = 'Average';
    else if (score < 90) rating = 'Good';

    return { score, rating };
  };

  return (
    {
      creditCards,
      statements,
      isLoading: isLoading || isStatementsLoading,
      addCreditCard: addCreditCardMutation.mutateAsync,
      updateCreditCard: updateCreditCardMutation.mutateAsync,
      payCard: payCardMutation.mutateAsync,
      payStatement: payStatementMutation.mutateAsync,
      deleteCreditCard: deleteCreditCardMutation.mutateAsync,
      getCardHealth,
    }
  );
};

export default useCreditCards;
