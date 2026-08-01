import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatsHUD } from '../components/dashboard/StatsHUD';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { CreditOverviewWidget } from '../components/dashboard/CreditOverviewWidget';
import { MonthFilterWidget } from '../components/dashboard/MonthFilterWidget';
import { useCreditCards } from '../hooks/useCreditCards';
import { AlertTriangle, AlertCircle, Calendar, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { creditCards, statements } = useCreditCards();
  
  // Date selection state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [remindersExpanded, setRemindersExpanded] = useState(false);

  // Generate smart dashboard reminders
  const reminders = useMemo(() => {
    const alerts: Array<{ id: string; title: string; message: string; type: 'warning' | 'danger' | 'info'; icon: any }> = [];
    const today = new Date();

    creditCards.forEach((c) => {
      // 1. High utilization alert (>= 70%)
      const util = c.limit > 0 ? (c.balance / c.limit) * 100 : 0;
      if (util >= 70) {
        alerts.push({
          id: `util-${c.id}`,
          title: 'High Utilization Warning',
          message: `${c.bank || 'Bank'} ${c.name || 'Unnamed Card'} is ${Math.round(util)}% utilized. Consider paying early to lower utilization.`,
          type: 'warning',
          icon: AlertTriangle,
        });
      }

      // 2. Annual fee coming up (if created in this month of any year, and annualFee > 0)
      const createdDate = new Date(c.createdAt);
      if (c.annualFee > 0 && createdDate.getMonth() === today.getMonth()) {
        alerts.push({
          id: `fee-${c.id}`,
          title: 'Annual Fee Coming Up',
          message: `Annual fee of ${c.annualFee} G is due soon for ${c.bank || 'Bank'} ${c.name || 'Unnamed Card'}.`,
          type: 'warning',
          icon: Calendar,
        });
      }
    });

    statements.forEach((s) => {
      if (s.remainingAmount <= 0) return;
      const card = creditCards.find((c) => c.id === s.cardId);
      if (!card) return;

      const dueDate = new Date(s.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3. Payment due tomorrow or overdue
      if (diffDays <= 1) {
        alerts.push({
          id: `due-${s.id}`,
          title: diffDays < 0 ? 'Payment Overdue' : 'Payment Due Tomorrow',
          message: `${card.bank || 'Bank'} statement balance of ${s.remainingAmount.toLocaleString()} G is ${diffDays < 0 ? 'overdue' : 'due tomorrow'}.`,
          type: 'danger',
          icon: AlertCircle,
        });
      }
    });

    return alerts;
  }, [creditCards, statements]);

  if (!user) return null;

  return (
    <div className="space-y-6 w-full text-slate-100">
      {/* Smart Credit Card Reminders Banners */}
      {reminders.length > 0 && (
        <div className="space-y-2.5">
          {reminders.length > 1 ? (
            <div className="border border-red-500/25 bg-red-500/5 rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300">
              <button
                type="button"
                onClick={() => setRemindersExpanded(!remindersExpanded)}
                className="w-full p-3.5 flex items-center justify-between text-xs text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                  <div>
                    <h5 className="font-bold text-white uppercase tracking-wide">
                      System Alerts Detected ({reminders.length})
                    </h5>
                    <p className="mt-0.5 text-slate-400 text-[10px]">
                      Tap to toggle warning details.
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: remindersExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {remindersExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/5 bg-slate-950/40 divide-y divide-white/5 overflow-hidden"
                  >
                    {reminders.map((alert) => {
                      const Icon = alert.icon;
                      const iconColors = {
                        danger: 'text-red-400',
                        warning: 'text-amber-400',
                        info: 'text-[#00C8FF]',
                      }[alert.type];

                      return (
                        <div key={alert.id} className="p-3 flex items-start gap-2.5 text-[11px] text-left">
                          <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${iconColors}`} />
                          <div>
                            <h6 className="font-bold text-white uppercase tracking-wide text-[10px]">{alert.title}</h6>
                            <p className="mt-0.5 text-slate-400 leading-normal">{alert.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            reminders.map((alert) => {
              const Icon = alert.icon;
              const borderColors = {
                danger: 'border-red-500/25 bg-red-500/5 text-red-200',
                warning: 'border-amber-500/25 bg-amber-500/5 text-amber-200',
                info: 'border-[#00C8FF]/25 bg-[#00C8FF]/5 text-[#00C8FF]/20',
              }[alert.type];

              const iconColors = {
                danger: 'text-red-400',
                warning: 'text-amber-400',
                info: 'text-[#00C8FF]',
              }[alert.type];

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 border rounded-xl flex items-start gap-3 text-xs text-left backdrop-blur-md transition-all ${borderColors}`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColors}`} />
                  <div>
                    <h5 className="font-bold text-white uppercase tracking-wide">{alert.title}</h5>
                    <p className="mt-0.5 text-slate-400 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Monthly Active Horizon Filter */}
      <MonthFilterWidget selectedMonth={selectedMonth} onChange={setSelectedMonth} />

      {/* 1. Core Balances Statistics */}
      <StatsHUD selectedMonth={selectedMonth} />

      {/* 2. Split ledger list and Credit Overview side panel */}
      <div className="space-y-6">
        
        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/20 p-3 rounded-xl border border-white/5">
            <span className="text-xs font-sans font-bold text-white uppercase tracking-wider">
              Registry Logs
            </span>
          </div>

          <RecentTransactions selectedMonth={selectedMonth} />
        </div>

        {/* Credit Overview Widget */}
        <div>
          <CreditOverviewWidget />
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
