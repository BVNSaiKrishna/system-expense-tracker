import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatsHUD } from '../components/dashboard/StatsHUD';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { CreditOverviewWidget } from '../components/dashboard/CreditOverviewWidget';
import { useCreditCards } from '../hooks/useCreditCards';
import { AlertTriangle, AlertCircle, Calendar, Info } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { creditCards, statements } = useCreditCards();
  
  // Date selection state (pinned to current month)
  const now = new Date();
  const selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
          {reminders.map((alert) => {
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
          })}
        </div>
      )}

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

          <RecentTransactions />
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
