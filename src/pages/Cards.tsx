import React, { useState, useMemo } from 'react';
import { useCreditCards } from '../hooks/useCreditCards';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CreditCardStatement, Transaction } from '../types';
import { useTransactions } from '../hooks/useTransactions';
import { PremiumGlassCard } from '../components/cards/PremiumGlassCard';
import { CreditCardModal } from '../components/cards/CreditCardModal';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import {
  PlusCircle,
  Sparkles,
  ArrowLeft,
  Calendar,
  Award,
  Activity,
  Settings as SettingsIcon,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Percent,
  SearchCode,
  DollarSign,
  Shield,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Cards: React.FC = () => {
  const { user } = useAuth();
  const {
    creditCards,
    statements,
    isLoading,
    payCard,
    payStatement,
    deleteCreditCard,
    getCardHealth
  } = useCreditCards();
  const { transactions } = useTransactions();

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'statements' | 'payments' | 'rewards' | 'analytics' | 'settings'>('overview');
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);

  // Quick Pay Form State
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);
  const [targetStatement, setTargetStatement] = useState<CreditCardStatement | null>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Find active card object
  const activeCard = useMemo(() => {
    return creditCards.find((c) => c.id === activeCardId) || null;
  }, [creditCards, activeCardId]);

  // Card utilization calculation
  const utilization = useMemo(() => {
    if (!activeCard) return 0;
    return activeCard.limit > 0 ? Math.round((activeCard.balance / activeCard.limit) * 100) : 0;
  }, [activeCard]);

  // Active card transactions
  const cardTransactions = useMemo(() => {
    if (!activeCardId) return [];
    return transactions.filter((t) => t.cardId === activeCardId);
  }, [transactions, activeCardId]);

  // Filtered transactions for search
  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return cardTransactions;
    const term = searchTerm.toLowerCase();
    return cardTransactions.filter((t) => {
      return (
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.date.includes(term) ||
        t.amount.toString().includes(term)
      );
    });
  }, [cardTransactions, searchTerm]);

  // Active card statements
  const cardStatements = useMemo(() => {
    if (!activeCardId) return [];
    return statements.filter((s) => s.cardId === activeCardId).sort((a, b) => b.statementMonth.localeCompare(a.statementMonth));
  }, [statements, activeCardId]);

  // Card Payments compiled from all statements
  const cardPayments = useMemo(() => {
    if (!activeCardId) return [];
    const paymentsList: Array<{ id: string; amount: number; date: string; paymentMethod: string; statementMonth: string }> = [];
    cardStatements.forEach((stmt) => {
      stmt.payments.forEach((p) => {
        paymentsList.push({
          ...p,
          statementMonth: stmt.statementMonth
        });
      });
    });
    return paymentsList.sort((a, b) => b.date.localeCompare(a.date));
  }, [cardStatements, activeCardId]);

  // Rewards metrics
  const rewardsSummary = useMemo(() => {
    if (!activeCard) return { points: 0, cashback: 0, value: 0 };
    const points = activeCard.rewardPoints || 0;
    // Assume 1 point = 0.1 Gold value
    const val = parseFloat((points * 0.1).toFixed(1));
    return {
      points,
      cashback: activeCard.cashbackEarned || 0,
      value: val
    };
  }, [activeCard]);

  // CSV Exporter helper
  const handleExportCSV = () => {
    if (!activeCard) return;
    if (cardTransactions.length === 0) {
      alert('No transactions found to export.');
      return;
    }
    const headers = ['Date', 'Description', 'Category', 'Amount (Gold)', 'Type'];
    const rows = cardTransactions.map((t) => [
      t.date,
      t.description,
      t.category,
      t.amount,
      t.type
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(activeCard.bank || 'Bank').replace(/\s+/g, '_')}_Transactions_Summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Summary (simulated PDF)
  const handlePrintSummary = () => {
    window.print();
  };

  // Card health score
  const health = useMemo(() => {
    if (!activeCard) return { score: 100, rating: 'Excellent' as const };
    return getCardHealth(activeCard);
  }, [activeCard, getCardHealth]);

  // Analytics helper data
  const monthlyComparisonData = useMemo(() => {
    if (cardTransactions.length === 0) return [];
    // Group transactions by YYYY-MM
    const groups: { [key: string]: number } = {};
    cardTransactions.forEach((t) => {
      const month = t.date.substring(0, 7);
      if (t.type === 'expense') {
        groups[month] = (groups[month] || 0) + t.amount;
      }
    });

    return Object.keys(groups)
      .sort()
      .map((month) => ({
        month,
        Spend: groups[month]
      }));
  }, [cardTransactions]);

  const categoryPieData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    cardTransactions.forEach((t) => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return Object.keys(categories).map((cat) => ({
      name: cat,
      value: categories[cat]
    }));
  }, [cardTransactions]);

  const COLORS = ['#00C8FF', '#9d4edd', '#FACC15', '#ec4899', '#22C55E', '#EF4444', '#cbd5e1'];

  // Handle payoff statement
  const handlePayClick = (stmt: CreditCardStatement) => {
    setTargetStatement(stmt);
    setPayAmount(stmt.remainingAmount.toString());
    setPayError('');
    setPaySuccess(false);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');
    setPaySuccess(false);

    if (!activeCard) return;
    const amount = parseFloat(payAmount);

    if (isNaN(amount) || amount <= 0) {
      setPayError('Please input a valid amount.');
      return;
    }

    if (user && user.currencyGold < amount) {
      setPayError('Insufficient Gold in your wallet!');
      return;
    }

    try {
      if (targetStatement) {
        // Pay targeted billing statement
        await payStatement({
          card: activeCard,
          statement: targetStatement,
          amount,
          paymentMethod: payMethod
        });
      } else {
        // General early payment
        await payCard({
          card: activeCard,
          amount
        });
      }
      setPaySuccess(true);
      setPayAmount('');
      setTargetStatement(null);
    } catch (err: any) {
      setPayError(err?.message || 'Repayment failed.');
    }
  };

  const handleDeleteCard = async () => {
    if (!activeCard) return;
    if (window.confirm(`Dismantle card relic [${activeCard.name}]? All transaction links will be disconnected.`)) {
      try {
        await deleteCreditCard(activeCard.id);
        setActiveCardId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 w-full text-slate-100">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-xl">
        <div className="flex items-center gap-3">
          {activeCardId && (
            <button
              onClick={() => setActiveCardId(null)}
              className="p-2.5 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-sans font-bold text-[#00C8FF] uppercase tracking-wider block">
              Credit Operations Registry
            </span>
            <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-0.5">
              {activeCardId && activeCard ? `${activeCard.bank || 'Unknown Bank'} Wallet` : 'My Credit Cards'}
            </h1>
          </div>
        </div>

        {!activeCardId && (
          <Button
            variant="primary"
            glow={false}
            onClick={() => setIsAddCardOpen(true)}
            className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-[10px] uppercase font-bold tracking-wider"
          >
            <PlusCircle className="w-4 h-4" />
            Add Credit Card
          </Button>
        )}
      </div>

      {/* 2. Wallet view vs Details View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="aspect-[1.586/1] bg-slate-900/50 border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !activeCardId ? (
        /* WALLET VIEW (Card Deck stacked) */
        creditCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
            <CreditCardModal onSuccess={() => setIsAddCardOpen(false)} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Desktop Vertical Stack & Mobile Scroll Row */}
            <div>
              <p className="text-xs font-sans text-slate-500 uppercase tracking-widest mb-4">
                Active Deck ({creditCards.length})
              </p>

              {/* Mobile Horizontal Carousel Slider */}
              <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-5 pb-6 scrollbar-thin scrollbar-thumb-slate-800">
                {creditCards.map((card) => (
                  <div key={card.id} className="min-w-[290px] w-[85vw] snap-center">
                    <PremiumGlassCard
                      card={card}
                      onClick={() => {
                        setActiveCardId(card.id);
                        setActiveTab('overview');
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Desktop overlapping vertical stack (Apple Wallet style) */}
              <div className="hidden md:flex flex-col items-center select-none pt-4 max-w-xl mx-auto">
                {creditCards.map((card, idx) => {
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setActiveCardId(card.id);
                        setActiveTab('overview');
                      }}
                      className="w-full transition-transform duration-300 hover:-translate-y-6 cursor-pointer"
                      style={{
                        marginTop: idx === 0 ? '0px' : '-130px',
                        zIndex: idx + 1
                      }}
                    >
                      <PremiumGlassCard card={card} isInteractive={false} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick summary stats of entire credit wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {(() => {
                const totalOutstanding = creditCards.reduce((sum, c) => sum + c.balance, 0);
                const totalLimit = creditCards.reduce((sum, c) => sum + c.limit, 0);
                const totalAvailable = totalLimit - totalOutstanding;
                const totalPoints = creditCards.reduce((sum, c) => sum + c.rewardPoints, 0);

                return (
                  <>
                    <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                      <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider block">Total Outstanding Debt</span>
                      <span className="text-base font-mono font-black text-white mt-1 block">{totalOutstanding.toLocaleString()} G</span>
                    </div>
                    <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                      <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider block">Total Available Credit</span>
                      <span className="text-base font-mono font-black text-[#22C55E] mt-1 block">{totalAvailable.toLocaleString()} G</span>
                    </div>
                    <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                      <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider block">Total Reward Points</span>
                      <span className="text-base font-mono font-black text-[#FACC15] mt-1 block">{totalPoints.toLocaleString()} PTS</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )
      ) : (
        /* ACTIVE CARD DETAIL VIEW */
        activeCard && (
          <div className="space-y-6">
            
            {/* Top Section: Glass Card display & Navigation Tabs */}
            <div className="space-y-4">
              <PremiumGlassCard card={activeCard} isInteractive={true} />

              {/* Horizontal Scroll Sub-tabs menu */}
              <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-2xl scrollbar-none snap-x">
                {([
                  { id: 'overview', label: 'Overview', icon: Shield },
                  { id: 'transactions', label: 'Tx Log', icon: SearchCode },
                  { id: 'statements', label: 'Bills', icon: Calendar },
                  { id: 'payments', label: 'History', icon: CheckCircle2 },
                  { id: 'rewards', label: 'Rewards', icon: Award },
                  { id: 'analytics', label: 'Analytics', icon: Activity },
                  { id: 'settings', label: 'Settings', icon: SettingsIcon }
                ] as const).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer snap-center ${
                        isActive
                          ? 'bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/20 shadow-[0_0_10px_rgba(0,200,255,0.1)]'
                          : 'text-slate-400 hover:text-white bg-slate-950/20'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Section: Tab Content Panels */}
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4 min-h-[400px]">
              
              {/* Tab Panel: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 text-left">
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
                    Credit Overview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Radial utilization ring gauge */}
                    <div className="flex flex-col items-center p-4 bg-slate-950/20 rounded-xl border border-white/5">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Track */}
                          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="none" />
                          {/* Meter progress */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={
                              utilization >= 70
                                ? '#EF4444' // Red
                                : utilization >= 30
                                ? '#FACC15' // Yellow
                                : '#22C55E' // Green
                            }
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * Math.min(utilization, 100)) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-xl font-mono font-black text-white">{utilization}%</span>
                          <span className="text-[8px] font-sans text-slate-500 uppercase tracking-widest mt-0.5">Utilization</span>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider">Available credit</span>
                        <p className="text-sm font-mono font-bold text-[#22C55E] mt-0.5">
                          {(activeCard.limit - activeCard.balance).toLocaleString()} G Remaining
                        </p>
                      </div>
                    </div>

                    {/* Payoff panel */}
                    <div className="bg-slate-950/20 p-5 rounded-xl border border-white/5 space-y-4">
                      <div>
                        <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider block">Outstanding balance</span>
                        <span className="text-lg font-mono font-black text-white mt-1 block">
                          {activeCard.balance.toLocaleString()} G
                        </span>
                      </div>

                      {/* Payoff Form */}
                      <form onSubmit={handlePaySubmit} className="space-y-3 pt-2">
                        {payError && <div className="text-[10px] text-red-400 bg-red-950/20 p-2 rounded-lg border border-red-900/30">{payError}</div>}
                        {paySuccess && <div className="text-[10px] text-green-400 bg-green-950/20 p-2 rounded-lg border border-green-900/30">Repayment logged successfully!</div>}
                        
                        <div>
                          <label className="block text-[8px] font-sans text-slate-500 uppercase tracking-wider mb-1">
                            Discharge amount
                          </label>
                          <input
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 font-mono text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-sans text-slate-500 uppercase tracking-wider mb-1">
                            Payment channel
                          </label>
                          <select
                            value={payMethod}
                            onChange={(e) => setPayMethod(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                          >
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Wallet">Wallet</option>
                            <option value="Bank Account">Bank Account</option>
                          </select>
                        </div>

                        <Button
                          type="submit"
                          variant="success"
                          fullWidth={true}
                          glow={false}
                          disabled={activeCard.balance === 0}
                          className="rounded-xl py-2.5 text-[9px] uppercase tracking-wider font-bold mt-2"
                        >
                          Discharge Balance
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Due dates details */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs font-sans text-slate-400">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Billing date</span>
                      <span className="font-semibold text-slate-200 mt-1 block">Day {activeCard.statementDate} of every month</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Payment due date</span>
                      <span className="font-semibold text-slate-200 mt-1 block">Day {activeCard.dueDate} of every month</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Panel: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                      Card Charger Logs
                    </h3>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-white/5 bg-slate-950/20 hover:bg-slate-900 rounded-lg text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                  </div>

                  {/* Search filter input */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="text"
                      placeholder="Search card charges by merchant, category, date..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none placeholder-slate-600"
                    />
                  </div>

                  {/* Ledger list */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-10 text-xs font-mono text-slate-500 uppercase tracking-wider">
                        No transactions found for search filter.
                      </div>
                    ) : (
                      filteredTransactions.map((t) => (
                        <div
                          key={t.id}
                          className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-slate-950/10 hover:bg-slate-900/35 transition-all text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-200">{t.description}</p>
                            <div className="flex gap-2 items-center mt-1 text-[10px] text-slate-500">
                              <span>{t.date}</span>
                              <span className="w-1 h-1 bg-slate-600 rounded-full" />
                              <span className="uppercase tracking-wider">{t.category}</span>
                            </div>
                          </div>

                          {/* Refined amounts: remove harsh red, keep it neutral white/slate-200 */}
                          <span className="font-mono font-bold text-slate-200">
                            -{t.amount.toLocaleString()} G
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab Panel: STATEMENTS */}
              {activeTab === 'statements' && (
                <div className="space-y-4 text-left">
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
                    Statement Ledger cycles
                  </h3>

                  {cardStatements.length === 0 ? (
                    <div className="text-center py-12 text-xs font-mono text-slate-500 uppercase tracking-wider">
                      No statement generated yet. Statements will auto-generate once the Statement Date day ({activeCard.statementDate}th) passes.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {cardStatements.map((stmt) => {
                        const statusColors = {
                          Paid: 'bg-green-500/10 border-green-500/30 text-green-400',
                          Upcoming: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                          'Due Soon': 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                          Overdue: 'bg-red-500/10 border-red-500/30 text-red-400',
                          'Statement Generated': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                          'Payment Processing': 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        }[stmt.status || 'Upcoming'];

                        return (
                          <div
                            key={stmt.id}
                            className="p-4 rounded-xl border border-white/5 bg-slate-950/10 hover:bg-slate-900/35 transition-all text-xs"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-mono font-bold text-slate-200">Cycle: {stmt.statementMonth}</span>
                              <span className={`px-2 py-0.5 border rounded-full text-[8px] font-sans font-bold uppercase tracking-wider ${statusColors}`}>
                                {stmt.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] text-slate-400">
                              <div>
                                <span>Statement Amt</span>
                                <p className="font-mono font-bold text-white mt-0.5">{stmt.statementAmount.toLocaleString()} G</p>
                              </div>
                              <div>
                                <span>Min Due</span>
                                <p className="font-mono font-bold text-white mt-0.5">{stmt.minimumDue.toLocaleString()} G</p>
                              </div>
                              <div>
                                <span>Remaining Due</span>
                                <p className="font-mono font-bold text-white mt-0.5">{stmt.remainingAmount.toLocaleString()} G</p>
                              </div>
                              <div className="flex items-end justify-end">
                                {stmt.remainingAmount > 0 ? (
                                  <button
                                    onClick={() => handlePayClick(stmt)}
                                    className="px-3 py-1.5 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 rounded-lg font-sans font-bold uppercase tracking-wider text-[8px] cursor-pointer"
                                  >
                                    Pay Statement
                                  </button>
                                ) : (
                                  <span className="text-[#22C55E] font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Full Paid
                                  </span>
                                )}
                              </div>
                            </div>

                            {stmt.payments.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/5">
                                <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-1.5">Payments History</span>
                                <div className="space-y-1">
                                  {stmt.payments.map((p) => (
                                    <div key={p.id} className="flex justify-between text-[9px] font-mono text-slate-500">
                                      <span>{p.date} via {p.paymentMethod}</span>
                                      <span className="text-slate-300">+{p.amount.toLocaleString()} G</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Panel: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-4 text-left">
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
                    Payments History ledger
                  </h3>

                  {cardPayments.length === 0 ? (
                    <div className="text-center py-12 text-xs font-mono text-slate-500 uppercase tracking-wider">
                      No payments recorded on this card.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {cardPayments.map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-slate-950/15 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-200">Discharged Statement</p>
                            <div className="flex gap-2 items-center mt-1 text-[10px] text-slate-500">
                              <span>{p.date}</span>
                              <span className="w-1 h-1 bg-slate-600 rounded-full" />
                              <span>Cycle: {p.statementMonth}</span>
                              <span className="w-1 h-1 bg-slate-600 rounded-full" />
                              <span>via {p.paymentMethod}</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-[#22C55E]">
                            +{p.amount.toLocaleString()} G
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Panel: REWARDS & HEALTH */}
              {activeTab === 'rewards' && (
                <div className="space-y-6 text-left">
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
                    Rewards & Health Registry
                  </h3>

                  {/* Reward Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/20 p-4 border border-white/5 rounded-xl">
                      <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider">Reward Points</span>
                      <p className="text-lg font-mono font-black text-[#FACC15] mt-1">{rewardsSummary.points.toLocaleString()}</p>
                      <span className="text-[8px] font-mono text-slate-500 mt-1 block">Est Value: {rewardsSummary.value} G</span>
                    </div>
                    <div className="bg-slate-950/20 p-4 border border-white/5 rounded-xl">
                      <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider">Cashback Accumulation</span>
                      <p className="text-lg font-mono font-black text-[#22C55E] mt-1">{rewardsSummary.cashback.toLocaleString()} G</p>
                    </div>
                    <div className="bg-slate-950/20 p-4 border border-white/5 rounded-xl">
                      <span className="text-[9px] font-sans text-slate-400 uppercase tracking-wider">Program Name</span>
                      <p className="text-xs font-sans font-semibold text-slate-200 mt-2 truncate">{activeCard.rewardProgramName || 'Points System'}</p>
                    </div>
                  </div>

                  {/* Card Health Score */}
                  <div className="bg-slate-950/20 p-5 border border-white/5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-sans font-bold text-white uppercase">Card Health Score</h4>
                      <p className="text-[10px] text-slate-400">
                        Evaluated automatically based on on-time payments, lack of overdue billing statements, and keeping overall card utilization below 30%.
                      </p>
                      <div className="flex gap-2.5 pt-2">
                        <span className="text-[9px] font-mono text-[#00C8FF] border border-[#00C8FF]/20 bg-[#00C8FF]/5 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                          Rating: {health.rating}
                        </span>
                      </div>
                    </div>

                    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={
                            health.score >= 90
                              ? '#22C55E'
                              : health.score >= 70
                              ? '#FACC15'
                              : '#EF4444'
                          }
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * health.score) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute font-mono font-black text-lg text-white">
                        {health.score}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Panel: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 text-left">
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
                    Yearly Spending Analytics
                  </h3>

                  {monthlyComparisonData.length === 0 ? (
                    <div className="text-center py-12 text-xs font-mono text-slate-500 uppercase tracking-wider">
                      No analytics data available. Link expenses to this card to plot spending trends.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Spending Trend Area Chart */}
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyComparisonData}>
                            <defs>
                              <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00C8FF" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00C8FF" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#475569" fontSize={9} tickLine={false} />
                            <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                background: 'rgba(17, 24, 39, 0.8)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)',
                                fontSize: '10px'
                              }}
                            />
                            <Area type="monotone" dataKey="Spend" stroke="#00C8FF" strokeWidth={1.5} fillOpacity={1} fill="url(#cardGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie chart category breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="h-36 w-full flex justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={45}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {categoryPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  background: 'rgba(17, 24, 39, 0.8)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '12px',
                                  fontSize: '10px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-sans text-slate-500 uppercase tracking-wider block mb-1">Categories Breakdown</span>
                          {categoryPieData.map((entry, idx) => (
                            <div key={entry.name} className="flex justify-between items-center text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="text-slate-300 font-semibold">{entry.name}</span>
                              </div>
                              <span className="font-mono text-slate-400">{entry.value.toLocaleString()} G</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                      Card configurations
                    </h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditCardOpen(true)}
                      className="rounded-xl px-3.5 py-1 text-[8.5px] uppercase font-bold tracking-wider"
                    >
                      Edit Card Details
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                      <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-500 uppercase">Annual Fee</span>
                        <p className="text-white font-bold font-mono mt-0.5">{activeCard.annualFee} G / Year</p>
                      </div>
                      <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-500 uppercase">Interest APR</span>
                        <p className="text-white font-bold font-mono mt-0.5">{activeCard.interestRate ? `${activeCard.interestRate}%` : 'N/A'}</p>
                      </div>
                      <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-500 uppercase">Statement Cycle</span>
                        <p className="text-white font-semibold mt-0.5">{activeCard.statementCycle || 'Monthly'}</p>
                      </div>
                      <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-500 uppercase">Card Code (Last 4)</span>
                        <p className="text-white font-mono font-bold mt-0.5">•••• {activeCard.last4Digits}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-xs font-sans font-bold text-red-400 uppercase mb-2">Danger zone</h4>
                      <p className="text-[10px] text-slate-500 mb-4">
                        Dismantling this card relic is irreversible. All linked ledger operations will lose their card link attributes, and statement cycles will be deleted permanently.
                      </p>
                      <Button
                        variant="danger"
                        glow={false}
                        onClick={handleDeleteCard}
                        className="rounded-xl px-4 py-2 text-[9px] uppercase font-bold tracking-wider"
                      >
                        Dismantle Card Relic
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )
      )}

      {/* MODAL: Add Credit Card */}
      <Modal isOpen={isAddCardOpen} onClose={() => setIsAddCardOpen(false)} title="Forge Credit Card Relic">
        <CreditCardModal onSuccess={() => setIsAddCardOpen(false)} />
      </Modal>

      {/* MODAL: Edit Credit Card */}
      <Modal isOpen={isEditCardOpen} onClose={() => setIsEditCardOpen(false)} title="Reforge Credit Card Relic">
        {activeCard && (
          <CreditCardModal card={activeCard} onSuccess={() => setIsEditCardOpen(false)} />
        )}
      </Modal>

    </div>
  );
};

export default Cards;
