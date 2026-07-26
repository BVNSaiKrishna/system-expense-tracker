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
  bank: string;
  last4Digits: string;
  limit: number;
  balance: number; // outstanding balance
  dueDate: number; // day of month (e.g. 25)
  statementDate: number; // day of month (e.g. 5)
  statementCycle: string; // e.g. "Monthly"
  interestRate?: number; // annual interest rate % (optional)
  annualFee: number;
  rewardProgramName: string;
  color: 'blue' | 'purple' | 'amber' | 'pink' | 'green' | 'red' | 'silver' | 'gold';
  rarity: RarityType;
  network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay';
  rewardPoints: number;
  cashbackEarned: number;
  milesEarned: number;
  vouchersEarned: number;
  createdAt: number;
}

export interface CreditCardPayment {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: string;
}

export interface CreditCardStatement {
  id: string;
  cardId: string;
  userId: string;
  statementMonth: string; // e.g. "2026-07"
  statementDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  statementAmount: number;
  minimumDue: number;
  totalDue: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Paid' | 'Upcoming' | 'Due Soon' | 'Overdue' | 'Statement Generated' | 'Payment Processing';
  payments: CreditCardPayment[];
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
