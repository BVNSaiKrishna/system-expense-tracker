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
    <Card glowColor="blue" clipCorners={true} className="p-4 bg-slate-950/50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Interactive Month Switcher */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2.5 rounded border border-slate-800 hover:border-neon-blue bg-slate-950 text-slate-400 hover:text-neon-blue transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center min-w-[160px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
              Active Horizon
            </span>
            <span className="text-2xl font-display font-black text-neon-blue text-glow-blue tracking-wider block mt-0.5">
              {displayMonth} {year}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2.5 rounded border border-slate-800 hover:border-neon-blue bg-slate-950 text-slate-400 hover:text-neon-blue transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Net yield, Loot, Upkeep summary */}
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto flex-grow max-w-lg font-mono text-center">
          
          <div className="p-2 bg-slate-950/60 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 block uppercase tracking-wider">Loot (In)</span>
            <span className="text-xs font-bold text-neon-green mt-1 block">+{income.toLocaleString()}g</span>
          </div>

          <div className="p-2 bg-slate-950/60 border border-slate-900 rounded">
            <span className="text-[8px] text-slate-500 block uppercase tracking-wider">Upkeep (Out)</span>
            <span className="text-xs font-bold text-neon-red mt-1 block">-{expense.toLocaleString()}g</span>
          </div>

          <div className={`p-2 border rounded bg-slate-950/60 ${net >= 0 ? 'border-neon-green/20' : 'border-neon-red/20'}`}>
            <span className="text-[8px] text-slate-500 block uppercase tracking-wider">Net Yield</span>
            <span className={`text-xs font-bold mt-1 block ${net >= 0 ? 'text-neon-green text-glow-green' : 'text-neon-red text-glow-red'}`}>
              {net >= 0 ? '+' : ''}{net.toLocaleString()}g
            </span>
          </div>

        </div>

      </div>
    </Card>
  );
};
export default MonthFilterWidget;
