import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Search,
  Trash2,
  Download,
  CreditCard,
  Utensils,
  ShoppingBag,
  FileText,
  HeartPulse,
  Car,
  Beer,
  Coins,
  Swords,
  Briefcase,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Category to Icon Mapper
const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('food') || normalized.includes('provisions') || normalized.includes('dine')) return Utensils;
  if (normalized.includes('gear') || normalized.includes('equip') || normalized.includes('shop') || normalized.includes('purchase')) return ShoppingBag;
  if (normalized.includes('medical') || normalized.includes('elixir') || normalized.includes('health')) return HeartPulse;
  if (normalized.includes('travel') || normalized.includes('transport') || normalized.includes('ride') || normalized.includes('cab')) return Car;
  if (normalized.includes('tavern') || normalized.includes('game') || normalized.includes('beer') || normalized.includes('entertainment')) return Beer;
  if (normalized.includes('salary') || normalized.includes('paycheck')) return Briefcase;
  if (normalized.includes('loot') || normalized.includes('dungeon') || normalized.includes('swords')) return Swords;
  if (normalized.includes('investment') || normalized.includes('yield') || normalized.includes('interest')) return Coins;
  return FileText;
};

const getCategoryColor = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('food') || normalized.includes('provisions')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  if (normalized.includes('gear') || normalized.includes('equip') || normalized.includes('shop')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (normalized.includes('bill') || normalized.includes('rent')) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (normalized.includes('medical') || normalized.includes('elixir')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (normalized.includes('travel') || normalized.includes('transport')) return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  if (normalized.includes('tavern') || normalized.includes('game')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
  if (normalized.includes('salary')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
  if (normalized.includes('loot') || normalized.includes('dungeon')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

export const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction, isLoading } = useTransactions();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Derive unique categories
  const categories = ['all', ...Array.from(new Set(transactions.map((tx) => tx.category)))];

  // Filter transactions
  const filteredTxs = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          tx.category.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, categoryFilter]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    filteredTxs.forEach((tx) => {
      const cat = tx.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tx);
    });
    return groups;
  }, [filteredTxs]);

  // Sum categories
  const categorySums = useMemo(() => {
    const sums: Record<string, number> = {};
    Object.keys(groupedByCategory).forEach((cat) => {
      sums[cat] = groupedByCategory[cat].reduce((sum, tx) => {
        return sum + (tx.type === 'expense' ? -tx.amount : tx.amount);
      }, 0);
    });
    return sums;
  }, [groupedByCategory]);

  const categoryOrder = useMemo(() => {
    return Object.keys(groupedByCategory).sort((a, b) => a.localeCompare(b));
  }, [groupedByCategory]);

  const toggleCategory = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // CSV Export Engine
  const handleCSVExport = () => {
    if (filteredTxs.length === 0) return;
    const headers = ['ID', 'Date', 'Description', 'Type', 'Category', 'Linked Card Relic ID', 'Amount (Gold)'];
    const rows = filteredTxs.map((tx) => [
      tx.id,
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.type.toUpperCase(),
      `"${tx.category.replace(/"/g, '""')}"`,
      tx.cardId || 'NONE',
      tx.amount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card glowColor="none" clipCorners={false} className="flex flex-col h-full w-full bg-white/5 border border-white/5 rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)] backdrop-blur-xl">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-4 border-b border-white/5 mb-6">
        <div className="text-left">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-3 bg-[#00C8FF] inline-block rounded-full animate-pulse" />
            Registry Operations Ledger
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1 block">
            Archived logs: {filteredTxs.length} entries matching parameters
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCSVExport}
          disabled={filteredTxs.length === 0}
          className="w-full md:w-auto rounded-xl py-2 px-4 text-[9px] font-sans font-bold uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          Export CSV Registry
        </Button>
      </div>

      {/* 2. Search and Category filter chips */}
      <div className="space-y-4 mb-6 sticky top-0 z-20 bg-slate-950/10 backdrop-blur-md pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF]/20"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Scrollable Type Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
          {[
            { key: 'all', label: 'All Operations' },
            { key: 'expense', label: 'Expenses' },
            { key: 'income', label: 'Income' },
          ].map((type) => {
            const isActive = typeFilter === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => setTypeFilter(type.key as any)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00C8FF]/15 text-[#00C8FF] border-[#00C8FF]/30'
                    : 'bg-white/5 text-slate-400 border-transparent hover:border-white/10 hover:text-slate-200'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
          {categories.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider border whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-white/5 text-slate-500 border-transparent hover:border-white/5 hover:text-slate-300'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat.replace(/\s*\(.*\)/, '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Log Records grouped lists in Accordion dropdowns */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5 py-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredTxs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/2">
          <p className="text-xs font-sans text-slate-500 uppercase tracking-widest">No entries found matching filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-grow">
          {categoryOrder.map((group) => {
            const items = groupedByCategory[group];
            if (!items || items.length === 0) return null;

            const isExpanded = !!expandedCategories[group];
            const catSum = categorySums[group];
            const CatIcon = getCategoryIcon(group);
            const catBadgeColor = getCategoryColor(group);

            return (
              <div key={group} className="border border-white/5 bg-slate-900/20 rounded-xl overflow-hidden transition-all duration-200">
                {/* Collapsible Accordion Header */}
                <div
                  onClick={() => toggleCategory(group)}
                  className="px-4 py-3 bg-slate-900/50 hover:bg-slate-900/70 flex items-center justify-between cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${catBadgeColor}`}>
                      <CatIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                        {group.replace(/\s*\(.*\)/, '')}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5 block">
                        {items.length} operation{items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold ${
                      catSum >= 0 ? 'text-[#22C55E]' : 'text-slate-200'
                    }`}>
                      {catSum >= 0 ? '+' : ''}{catSum.toLocaleString()} G
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Dropdown Items (Animate Height) */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="border-t border-white/5 bg-slate-950/20 divide-y divide-white/5"
                    >
                      <div className="p-2 space-y-1.5">
                        {items.map((tx) => {
                          const isIncome = tx.type === 'income';
                          return (
                            <div key={tx.id} className="relative overflow-hidden rounded-lg">
                              {/* Underneath desaturated swipe-delete background indicator */}
                              <div className="absolute inset-0 bg-rose-950/20 border border-rose-900/30 text-rose-400 flex items-center justify-end px-6 rounded-lg">
                                <div className="flex flex-col items-center justify-center gap-1 opacity-90">
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-rose-400">Delete</span>
                                </div>
                              </div>

                              {/* Swipe-able top card */}
                              <motion.div
                                drag="x"
                                dragConstraints={{ left: -75, right: 0 }}
                                dragElastic={0.12}
                                onDragEnd={(_, info) => {
                                  if (info.offset.x < -60) {
                                    deleteTransaction(tx);
                                  }
                                }}
                                className="relative flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-lg group transition-all select-none cursor-grab active:cursor-grabbing text-xs text-left"
                              >
                                <div>
                                  <p className="font-semibold text-slate-200">{tx.description}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                                    <span>{tx.date}</span>
                                    {tx.paymentMethod && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-0.5 text-[#00C8FF] font-sans">
                                          <CreditCard className="w-2.5 h-2.5" />
                                          {tx.paymentMethod.replace('Card: ', '')}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <span className={`font-mono font-bold ${
                                  isIncome ? 'text-[#22C55E]' : 'text-slate-200'
                                }`}>
                                  {isIncome ? '+' : '-'}{tx.amount.toLocaleString()} G
                                </span>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default TransactionList;
