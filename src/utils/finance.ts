import { Transaction } from '../types';

/**
 * Checks if a category string represents a Card Bill Payment.
 */
export const isCardBillPaymentCategory = (category?: string): boolean => {
  if (!category) return false;
  const cleaned = category.replace(/\s*\(.*\)/, '').trim().toLowerCase();
  return (
    cleaned === 'card bill payments' ||
    cleaned === 'card bill payment' ||
    cleaned === 'credit card payment' ||
    cleaned === 'credit card bill' ||
    cleaned.includes('card bill')
  );
};

/**
 * Cleans parentheticals and whitespace from category names.
 * e.g., "Provisions (Food)" -> "Provisions"
 */
export const cleanCategoryName = (category?: string): string => {
  if (!category) return 'Uncategorized';
  const cleaned = category.replace(/\s*\(.*\)/, '').trim();
  return cleaned || 'Uncategorized';
};

/**
 * Calculates total expenses excluding Card Bill Payments (which are debt settlements).
 */
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'expense' && !isCardBillPaymentCategory(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculates total card bill payments made in a set of transactions.
 */
export const calculateCardBillPayments = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'expense' && isCardBillPaymentCategory(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
};
