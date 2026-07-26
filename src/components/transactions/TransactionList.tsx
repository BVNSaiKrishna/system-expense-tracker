import React, { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Download,
  Calendar,
  Filter,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction, isLoading } = useTransactions();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Derive unique categories from transactions for the filter dropdown
  const categories = ['all', ...Array.from(new Set(transactions.map((tx) => tx.category)))];

  // Filter transactions
  const filteredTxs = transactions
    .filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTxs = filteredTxs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // CSV EXPORT ENGINE
  const handleCSVExport = () => {
    if (filteredTxs.length === 0) return;

    // Headers
    const headers = ['ID', 'Date', 'Description', 'Type', 'Category', 'Linked Card Relic ID', 'Amount (Gold)'];
    
    // Row Mapping
    const rows = filteredTxs.map((tx) => [
      tx.id,
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.type.toUpperCase(),
      `"${tx.category.replace(/"/g, '""')}"`,
      tx.cardId || 'NONE',
      tx.amount,
    ]);

    // Construct CSV String
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    // Virtual Download Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_operations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card glowColor="none" clipCorners={true} className="flex flex-col h-full w-full">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-4 border-b border-slate-900 mb-6">
        <div>
          <h2 className="text-base font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-blue inline-block animate-pulse" />
            Registry Operations Log
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1 block">
            Archived logs: {filteredTxs.length} entries matching parameters
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCSVExport}
          disabled={filteredTxs.length === 0}
          className="w-full md:w-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV Registry
        </Button>
      </div>

      {/* 2. Filtering Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-4 py-2 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
          />
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Type Filter Select */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as any);
            setCurrentPage(1);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-neon-blue cursor-pointer font-mono uppercase"
        >
          <option value="all">Filter Type: ALL</option>
          <option value="income">Type: LOOT (INCOME)</option>
          <option value="expense">Type: UPKEEP (EXPENSE)</option>
        </select>

        {/* Category Filter Select */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-neon-blue cursor-pointer font-mono uppercase"
        >
          <option value="all">Filter Category: ALL</option>
          {categories.slice(1).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Sorting Dropdown */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as any);
            setCurrentPage(1);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-neon-blue cursor-pointer font-mono uppercase"
        >
          <option value="desc">Order: LATEST TENTATIVE</option>
          <option value="asc">Order: CHRONOLOGICAL</option>
        </select>

      </div>

      {/* 3. Log Records table list */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-slate-900/50 border border-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : paginatedTxs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-900 rounded-lg">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">No entries found matching filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 flex-grow">
          <AnimatePresence mode="popLayout">
            {paginatedTxs.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 rounded-lg group transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Visual marker badge */}
                    <div className={`p-2 rounded border hidden sm:block ${
                      isIncome
                        ? 'border-neon-green/30 bg-neon-green/5 text-neon-green'
                        : 'border-neon-red/30 bg-neon-red/5 text-neon-red'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                        {tx.description}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {tx.category}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {tx.date}
                        </span>
                        {(tx.paymentMethod || tx.cardId) && (
                          <span className="flex items-center gap-0.5 text-neon-blue font-bold">
                            <CreditCard className="w-2.5 h-2.5" />
                            {tx.paymentMethod || 'Relic charge'}
                          </span>
                        )}
                        <span className="text-[8px] text-slate-600">ID: {tx.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-2.5 sm:pt-0 border-t border-slate-900/60 sm:border-t-0">
                    <span className={`text-sm font-mono font-black ${
                      isIncome ? 'text-neon-green text-glow-green' : 'text-neon-red text-glow-red'
                    }`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString()}G
                    </span>

                    <button
                      onClick={() => deleteTransaction(tx)}
                      className="p-1.5 rounded border border-slate-900 hover:border-neon-red bg-slate-950/20 hover:bg-neon-red/10 text-slate-600 hover:text-neon-red cursor-pointer transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 4. Pagination HUD Footer */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-900 font-mono text-[10px] text-slate-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </Card>
  );
};
export default TransactionList;
