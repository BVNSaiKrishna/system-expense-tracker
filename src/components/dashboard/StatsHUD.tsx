import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useCreditCards } from '../../hooks/useCreditCards';
import { Card } from '../ui/Card';
import { ArrowDownRight, CreditCard, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { creditCards } = useCreditCards();

  const [activeExpandedCard, setActiveExpandedCard] = useState<'expense' | 'outstanding' | null>(null);

  if (!user) return null;

  // Filter transactions for this month
  const monthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const monthlyExpense = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutstanding = creditCards.reduce((sum, c) => sum + c.balance, 0);

  // Group month expenses by category (cleaned of parentheticals) sorted descending
  const expenseGrouped = useMemo(() => {
    const groups: Record<string, number> = {};
    monthTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = (t.category || 'Other').replace(/\s*\(.*\)/, '').trim();
        groups[cat] = (groups[cat] || 0) + t.amount;
      });
    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {} as Record<string, number>);
  }, [monthTxs]);

  // Format month label (e.g., "2026-07" -> "Jul 2026")
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthName = new Date(parseInt(yearStr), parseInt(monthStr) - 1).toLocaleString('default', { month: 'short' });
  const displayLabel = `${monthName} ${yearStr}`;

  // Get data values for sparklines
  // 1. Overall expense values
  const expenseValues = monthTxs
    .filter((t) => t.type === 'expense')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => t.amount)
    .slice(-8);

  // 2. Card-specific transaction trend
  const cardTxs = monthTxs
    .filter((t) => t.type === 'expense' && t.cardId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => t.amount)
    .slice(-8);

  const stats = [
    {
      key: 'expense' as const,
      label: 'Expenses Load',
      value: monthlyExpense,
      prefix: '',
      subtext: `Spent in ${displayLabel}`,
      icon: ArrowDownRight,
      color: '#EF4444',
      glowColor: 'red' as const,
      sparkData: expenseValues,
    },
    {
      key: 'outstanding' as const,
      label: 'Card Outstanding',
      value: totalOutstanding,
      prefix: '',
      subtext: 'Total outstanding balances',
      icon: CreditCard,
      color: '#FACC15',
      glowColor: 'gold' as const,
      sparkData: cardTxs.length > 0 ? cardTxs : expenseValues,
    },
  ];

  return (
    <div className="w-full">
      {/* Side-by-side cards grid */}
      <div className="grid grid-cols-2 gap-4 w-full mb-1">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isSelected = activeExpandedCard === stat.key;
          return (
            <Card
              key={i}
              glowColor={stat.glowColor}
              clipCorners={true}
              onClick={() => {
                setActiveExpandedCard(isSelected ? null : stat.key);
              }}
              className={`w-full flex flex-col relative overflow-hidden bg-slate-900/40 border transition-all duration-300 group cursor-pointer ${
                isSelected 
                  ? 'border-[#00C8FF]/50 shadow-[0_0_15px_rgba(0,200,255,0.15)] bg-slate-900/70' 
                  : 'border-white/5 hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
              }`}
            >
              {/* Ambient Background Hover Glow */}
              <div 
                className="absolute -right-6 -top-6 w-20 h-20 rounded-full filter blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ backgroundColor: stat.color }}
              />

              <div className="flex justify-between items-start mb-2 text-left">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-end mt-2 text-left gap-3">
                <div>
                  <span className="text-xl md:text-2xl font-black tracking-tight text-white font-sans">
                    {stat.prefix}<AnimatedNumber value={stat.value} />
                    <span className="text-xs font-bold text-slate-500 ml-1">G</span>
                  </span>
                  <span className="text-[9px] font-sans text-slate-500 mt-1 block uppercase tracking-wider">
                    {stat.subtext}
                  </span>
                </div>
                
                <div className="pb-1.5 flex-shrink-0">
                  <Sparkline values={stat.sparkData} color={stat.color} />
                </div>
              </div>

              {/* Bottom Interactive Expand Indicator */}
              <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                <span>Details</span>
                <span className={`transition-transform duration-200 text-[#00C8FF] font-sans font-extrabold ${isSelected ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dynamic Detail Panel */}
      <AnimatePresence>
        {activeExpandedCard && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full overflow-hidden text-left"
          >
            <Card 
              glowColor={activeExpandedCard === 'expense' ? 'red' : 'gold'} 
              clipCorners={true} 
              className="p-4 bg-slate-950/60 border border-white/15"
            >
              <h4 className="text-[9px] font-mono uppercase tracking-widest text-[#94A3B8] border-b border-white/5 pb-2 mb-3.5 font-bold">
                {activeExpandedCard === 'expense' && 'Monthly Upkeep Breakdown'}
                {activeExpandedCard === 'outstanding' && 'Outstanding Card Balances'}
              </h4>

              {activeExpandedCard === 'expense' && (
                <div className="space-y-3">
                  {Object.keys(expenseGrouped).length === 0 ? (
                    <p className="text-[9px] font-sans text-slate-500 uppercase tracking-wider text-center py-4">No operations registered in selected month</p>
                  ) : (
                    Object.entries(expenseGrouped).map(([cat, amount]) => {
                      const percentage = Math.round((amount / monthlyExpense) * 100) || 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-sans">
                            <span className="text-slate-300 font-bold uppercase tracking-wider">{cat}</span>
                            <span className="text-white font-mono font-bold">{amount.toLocaleString()} G ({percentage}%)</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeExpandedCard === 'outstanding' && (
                <div className="space-y-3">
                  {creditCards.length === 0 ? (
                    <p className="text-[9px] font-sans text-slate-500 uppercase tracking-wider text-center py-4">No credit cards equipped</p>
                  ) : (
                    creditCards.map((card) => {
                      const utilPercent = card.limit > 0 ? Math.round((card.balance / card.limit) * 100) : 0;
                      return (
                        <div key={card.id} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-sans">
                            <span className="text-slate-300 font-bold uppercase tracking-wider">{card.name}</span>
                            <span className="text-white font-mono font-bold">{card.balance.toLocaleString()} G ({utilPercent}% limit)</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min(utilPercent, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Removed available credit details */}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatsHUD;
