import React from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../../hooks/useTransactions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowUpRight, ArrowDownRight, Trash2, Calendar, Tag, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RecentTransactions: React.FC = () => {
  const { transactions, deleteTransaction, isLoading } = useTransactions();

  const recentTxs = transactions.slice(0, 5);

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const prefix = type === 'income' ? '+' : '-';
    return `${prefix}${amount.toLocaleString()}G`;
  };

  const getCategoryIcon = (category: string) => {
    // Simple mock categorization icons
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('loot') || lowerCat.includes('salary') || lowerCat.includes('income')) return ArrowUpRight;
    return ArrowDownRight;
  };

  return (
    <Card glowColor="none" clipCorners={true} className="flex flex-col h-full">
      <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
        <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-3 bg-neon-blue inline-block animate-pulse" />
          Recent Operations
        </h3>
        <Link to="/transactions">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-900/50 border border-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : recentTxs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-slate-900 rounded-lg">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">No operations logged.</p>
          <p className="text-[10px] text-slate-600 font-mono mt-1">Start by adding custom expenses or income loot.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {recentTxs.map((tx) => {
              const Icon = getCategoryIcon(tx.category);
              const isIncome = tx.type === 'income';
              
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 rounded-lg group transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    
                    {/* Direction Icon Badge */}
                    <div className={`p-2 rounded border ${
                      isIncome
                        ? 'border-neon-green/30 bg-neon-green/5 text-neon-green'
                        : 'border-neon-red/30 bg-neon-red/5 text-neon-red'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Transaction Metadata */}
                    <div>
                      <h4 className="text-xs font-display font-bold text-white leading-none uppercase tracking-wide">
                        {tx.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5 text-slate-600" />
                          {tx.category}
                        </span>
                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5 text-slate-600" />
                          {tx.date}
                        </span>
                        {(tx.paymentMethod || tx.cardId) && (
                          <>
                            <span className="w-1 h-1 bg-slate-800 rounded-full" />
                            <span className="flex items-center gap-0.5 text-neon-blue font-semibold">
                              <CreditCard className="w-2.5 h-2.5 text-neon-blue/80" />
                              {tx.paymentMethod || 'Credit Card'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial amount & Actions */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-black ${
                      isIncome ? 'text-neon-green text-glow-green' : 'text-neon-red text-glow-red'
                    }`}>
                      {formatAmount(tx.amount, tx.type)}
                    </span>
                    
                    {/* Delete Action button */}
                    <button
                      onClick={() => deleteTransaction(tx)}
                      className="p-1 rounded border border-slate-900 hover:border-neon-red bg-slate-950/20 hover:bg-neon-red/10 text-slate-600 hover:text-neon-red cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};
export default RecentTransactions;
