import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthFilterWidgetProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export const MonthFilterWidget: React.FC<MonthFilterWidgetProps> = ({ selectedMonth, onChange }) => {
  const { transactions } = useTransactions();

  // Convert "YYYY-MM" to active navigation numbers
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const monthDate = new Date(year, month - 1);
  const displayMonth = monthDate.toLocaleString('default', { month: 'long' }).toUpperCase();

  // Calculations for this specific month
  const monthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const income = monthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;

  return (
    <Card glowColor="blue" clipCorners={true} className="p-3 bg-slate-950/40 border border-white/5">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Previous Month Button */}
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2.5 rounded border border-white/5 hover:border-neon-blue bg-slate-900/40 hover:bg-neon-blue/15 text-slate-400 hover:text-neon-blue transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center: Month Name Display & Net Yield Badge */}
        <div className="text-center flex-grow flex flex-col items-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
            Active Horizon
          </span>
          <span className="text-xl font-display font-black text-neon-blue text-glow-blue tracking-wider block mt-0.5 leading-none">
            {displayMonth} {year}
          </span>
          {/* Net Yield Pill */}
          <span className={`inline-block mt-1.5 px-2 py-0.5 border rounded-full text-[8px] font-mono font-bold uppercase tracking-wider ${
            net >= 0 
              ? 'bg-neon-green/10 border-neon-green/20 text-neon-green text-glow-green' 
              : 'bg-neon-red/10 border-neon-red/20 text-neon-red text-glow-red'
          }`}>
            Net: {net >= 0 ? '+' : ''}{net.toLocaleString()}g
          </span>
        </div>

        {/* Right: Next Month Button */}
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2.5 rounded border border-white/5 hover:border-neon-blue bg-slate-900/40 hover:bg-neon-blue/15 text-slate-400 hover:text-neon-blue transition-all cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </Card>
  );
};
export default MonthFilterWidget;
