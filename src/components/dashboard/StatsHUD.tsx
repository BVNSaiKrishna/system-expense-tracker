import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useGoals } from '../../hooks/useGoals';
import { Card } from '../ui/Card';
import { Coins, ArrowUpRight, ArrowDownRight, Archive } from 'lucide-react';

interface StatsHUDProps {
  selectedMonth: string;
}

export const StatsHUD: React.FC<StatsHUDProps> = ({ selectedMonth }) => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { goals } = useGoals();

  if (!user) return null;

  // Filter transactions for this month
  const monthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const monthlyIncome = monthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Format month label (e.g., "2026-07" -> "Jul 2026")
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthName = new Date(parseInt(yearStr), parseInt(monthStr) - 1).toLocaleString('default', { month: 'short' });
  const displayLabel = `${monthName} ${yearStr}`;

  const stats = [
    {
      label: 'Wallet Gold (Balance)',
      value: `${user.currencyGold.toLocaleString()}G`,
      subtext: 'Ready Capital',
      icon: Coins,
      color: 'gold' as const,
      textColor: 'text-neon-amber',
    },
    {
      label: 'Acquired Loot (Income)',
      value: `+${monthlyIncome.toLocaleString()}G`,
      subtext: `In ${displayLabel}`,
      icon: ArrowUpRight,
      color: 'green' as const,
      textColor: 'text-neon-green',
    },
    {
      label: 'System Upkeep (Expense)',
      value: `-${monthlyExpense.toLocaleString()}G`,
      subtext: `In ${displayLabel}`,
      icon: ArrowDownRight,
      color: 'red' as const,
      textColor: 'text-neon-red',
    },
    {
      label: 'Vault Reserves (Savings)',
      value: `${totalSavings.toLocaleString()}G`,
      subtext: 'Across Active Quests',
      icon: Archive,
      color: 'blue' as const,
      textColor: 'text-neon-blue',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={i}
            glowColor={stat.color}
            clipCorners={true}
            className="flex flex-col relative overflow-hidden"
          >
            {/* Soft decorative background glow */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-16 h-16 rounded-full bg-slate-900 filter blur-xl opacity-30" />

            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                {stat.label}
              </span>
              <Icon className={`w-4 h-4 ${stat.textColor}`} />
            </div>

            <div className={`text-2xl font-display font-black tracking-wide ${stat.textColor} text-glow-${stat.color}`}>
              {stat.value}
            </div>

            <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
              {stat.subtext}
            </span>
          </Card>
        );
      })}
    </div>
  );
};
export default StatsHUD;
