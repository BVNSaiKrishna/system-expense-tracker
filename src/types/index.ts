export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  level: number;
  xp: number;
  streak: number;
  lastActive: string; // ISO date string YYYY-MM-DD
  rankName: string;
  currencyGold: number; // Current Wallet Balance
  isGuest: boolean;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  cardId: string | null; // Linked Credit Card Relic ID
  paymentMethod?: string; // e.g. 'Cash', 'UPI', 'Debit Card', 'Amex'
  createdAt: number; // timestamp
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string; // YYYY-MM-DD
  createdAt: number;
  status: 'active' | 'completed';
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  limit: number;
  balance: number;
  dueDate: number; // Day of month (e.g. 15)
  statementDate: number; // Day of month (e.g. 5)
  color: 'blue' | 'purple' | 'amber' | 'pink' | 'green';
  rarity: RarityType;
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badgeIcon: string; // Icon slug (e.g. 'frugal-warrior')
  xpReward: number;
  unlocked: boolean;
  unlockedAt: number | null;
}
