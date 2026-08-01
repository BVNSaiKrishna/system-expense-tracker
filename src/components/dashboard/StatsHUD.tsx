import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useGoals } from '../../hooks/useGoals';
import { Card } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Archive } from 'lucide-react';

interface StatsHUDProps {
  selectedMonth: string;
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 900; // ms
    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * (end - start) + start);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const Sparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  if (values.length <= 1) {
    // Return empty placeholder path
    return (
      <svg className="w-24 h-8 opacity-25" viewBox="0 0 100 30">
        <line x1="0" y1="15" x2="100" y2="15" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    );
  }

  const width = 100;
  const height = 30;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = values.map((val, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return { x, y };
  });
  
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg className="w-24 h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const StatsHUD: React.FC<StatsHUDProps> = ({ selectedMonth }) => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { goals } = useGoals();

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const cardWidth = containerRef.current.scrollWidth / 3;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveCardIndex(Math.min(Math.max(index, 0), 2));
  };

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

  // Get data values for sparklines
  // 1. Income sparkline data (last 8 income transaction amounts this month)
  const incomeValues = monthTxs
    .filter((t) => t.type === 'income')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => t.amount)
    .slice(-8);

  // 2. Expense sparkline data (last 8 expense transaction amounts this month)
  const expenseValues = monthTxs
    .filter((t) => t.type === 'expense')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => t.amount)
    .slice(-8);

  // 3. Savings progress data
  const savingsValues = goals
    .map((g) => g.currentAmount)
    .slice(-8);

  const stats = [
    {
      label: 'Income Yield',
      value: monthlyIncome,
      prefix: '+',
      subtext: `Earned in ${displayLabel}`,
      icon: ArrowUpRight,
      color: '#22C55E',
      glowColor: 'green' as const,
      sparkData: incomeValues,
    },
    {
      label: 'Expenses Load',
      value: monthlyExpense,
      prefix: '-',
      subtext: `Spent in ${displayLabel}`,
      icon: ArrowDownRight,
      color: '#EF4444',
      glowColor: 'red' as const,
      sparkData: expenseValues,
    },
    {
      label: 'Savings Vault',
      value: totalSavings,
      prefix: '',
      subtext: 'Accumulated in active goals',
      icon: Archive,
      color: '#00C8FF',
      glowColor: 'blue' as const,
      sparkData: savingsValues,
    },
  ];

  return (
    <div className="w-full">
      {/* Scrollable container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 w-full overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              glowColor={stat.glowColor}
              clipCorners={true}
              className="flex-shrink-0 w-[85%] snap-center flex flex-col relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-2xl hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group"
            >
              {/* Ambient Background Hover Glow */}
              <div 
                className="absolute -right-6 -top-6 w-20 h-20 rounded-full filter blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ backgroundColor: stat.color }}
              />

              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>

              <div className="flex justify-between items-end mt-2">
                <div>
                  <span className="text-2xl font-black tracking-tight text-white font-sans">
                    {stat.prefix}<AnimatedNumber value={stat.value} />
                    <span className="text-sm font-bold text-slate-500 ml-1">G</span>
                  </span>
                  <span className="text-[9px] font-sans text-slate-500 mt-1 block uppercase tracking-wider">
                    {stat.subtext}
                  </span>
                </div>
                
                <div className="pb-1.5">
                  <Sparkline values={stat.sparkData} color={stat.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {stats.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeCardIndex === idx 
                ? 'bg-neon-blue w-3.5 shadow-[0_0_8px_rgba(0,200,255,0.8)]' 
                : 'bg-white/15'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsHUD;
