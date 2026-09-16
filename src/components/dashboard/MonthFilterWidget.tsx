import React, { useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthFilterWidgetProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export const MonthFilterWidget: React.FC<MonthFilterWidgetProps> = ({ selectedMonth, onChange }) => {
  const { transactions } = useTransactions();

  // Compute available specific months from transactions + current month
  const availableMonths = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthsSet = new Set<string>([currentMonth]);

    if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
      monthsSet.add(selectedMonth);
    }

    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        const m = t.date.slice(0, 7);
        if (/^\d{4}-\d{2}$/.test(m)) {
          monthsSet.add(m);
        }
      }
    });

    // Sort descending (most recent first)
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [transactions, selectedMonth]);

  const currentIndex = availableMonths.indexOf(selectedMonth);

  const handlePrevMonth = () => {
    // Navigate to older month (higher index in descending array)
    if (currentIndex >= 0 && currentIndex < availableMonths.length - 1) {
      onChange(availableMonths[currentIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    // Navigate to newer month (lower index in descending array)
    if (currentIndex > 0) {
      onChange(availableMonths[currentIndex - 1]);
    }
  };

  // Calculations for this specific month
  const monthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const expense = monthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const canGoPrev = currentIndex >= 0 && currentIndex < availableMonths.length - 1;
  const canGoNext = currentIndex > 0;

  return (
    <Card glowColor="blue" clipCorners={true} className="p-3 bg-slate-950/40 border border-white/5">
      <div className="flex items-center justify-between gap-3 md:gap-4">
        
        {/* Left: Previous Month Button */}
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          title={canGoPrev ? 'Older Month' : 'No older records'}
          className={`p-2.5 rounded border transition-all cursor-pointer ${
            canGoPrev
              ? 'border-white/5 hover:border-neon-blue bg-slate-900/40 hover:bg-neon-blue/15 text-slate-400 hover:text-neon-blue active:scale-95'
              : 'border-white/5 bg-slate-950/20 text-slate-700 cursor-not-allowed opacity-40'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center: Interactive Month Dropdown & Net Yield Badge */}
        <div className="text-center flex-grow flex flex-col items-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
            Active Horizon
          </span>

          <div className="relative inline-flex items-center">
            <select
              value={selectedMonth}
              onChange={(e) => onChange(e.target.value)}
              className="bg-slate-900/90 border border-neon-blue/30 hover:border-neon-blue rounded-xl px-3.5 py-1.5 text-sm md:text-base font-display font-black text-neon-blue text-glow-blue tracking-wider focus:outline-none focus:ring-1 focus:ring-neon-blue/50 cursor-pointer appearance-none pr-8 transition-all"
            >
              {availableMonths.map((m) => {
                const [yStr, mStr] = m.split('-');
                const d = new Date(parseInt(yStr), parseInt(mStr) - 1);
                const displayLabel = d.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
                return (
                  <option key={m} value={m} className="bg-slate-950 text-slate-200 font-sans text-xs">
                    {displayLabel}
                  </option>
                );
              })}
            </select>
            <Calendar className="w-4 h-4 text-neon-blue absolute right-2.5 pointer-events-none opacity-80" />
          </div>

          {/* Expenses Pill */}
          <span className="inline-block mt-1.5 px-2.5 py-0.5 border border-neon-red/20 bg-neon-red/10 text-neon-red text-glow-red rounded-full text-[8px] font-mono font-bold uppercase tracking-wider">
            Upkeep: -{expense.toLocaleString()}g
          </span>
        </div>

        {/* Right: Next Month Button */}
        <button
          type="button"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          title={canGoNext ? 'Newer Month' : 'Latest month'}
          className={`p-2.5 rounded border transition-all cursor-pointer ${
            canGoNext
              ? 'border-white/5 hover:border-neon-blue bg-slate-900/40 hover:bg-neon-blue/15 text-slate-400 hover:text-neon-blue active:scale-95'
              : 'border-white/5 bg-slate-950/20 text-slate-700 cursor-not-allowed opacity-40'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </Card>
  );
};

export default MonthFilterWidget;
