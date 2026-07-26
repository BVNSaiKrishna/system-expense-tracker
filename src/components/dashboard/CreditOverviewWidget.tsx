import React, { useState, useMemo } from 'react';
import { useCreditCards } from '../../hooks/useCreditCards';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Shield, CreditCard, Award, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CreditOverviewWidget: React.FC = () => {
  const { user } = useAuth();
  const { creditCards, statements, payStatement } = useCreditCards();

  const [selectedStmtId, setSelectedStmtId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Compute aggregate stats
  const totals = useMemo(() => {
    let outstanding = 0;
    let limit = 0;
    let points = 0;

    creditCards.forEach((c) => {
      outstanding += c.balance;
      limit += c.limit;
      points += c.rewardPoints || 0;
    });

    const available = limit - outstanding;
    const utilization = limit > 0 ? Math.round((outstanding / limit) * 100) : 0;

    return { outstanding, limit, available, points, utilization };
  }, [creditCards]);

  // Find statements due soon or overdue
  const activeDueStatements = useMemo(() => {
    return statements.filter((s) => s.remainingAmount > 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [statements]);

  const targetStatement = useMemo(() => {
    return statements.find((s) => s.id === selectedStmtId) || null;
  }, [statements, selectedStmtId]);

  const targetCard = useMemo(() => {
    if (!targetStatement) return null;
    return creditCards.find((c) => c.id === targetStatement.cardId) || null;
  }, [creditCards, targetStatement]);

  const handleQuickPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!targetStatement || !targetCard) {
      setError('Please choose a statement.');
      return;
    }

    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Input a valid amount.');
      return;
    }

    if (user && user.currencyGold < amt) {
      setError('Insufficient Gold in your wallet!');
      return;
    }

    try {
      await payStatement({
        card: targetCard,
        statement: targetStatement,
        amount: amt,
        paymentMethod: payMethod,
      });
      setSuccess(true);
      setPayAmount('');
      setSelectedStmtId('');
    } catch (err: any) {
      setError(err?.message || 'Repayment failed.');
    }
  };

  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-5 text-left h-full flex flex-col justify-between">
      
      {/* Widget Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#00C8FF]" />
          <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">
            Credit Overview
          </h4>
        </div>
        <span className={`px-2 py-0.5 border rounded-full text-[8px] font-sans font-bold uppercase tracking-wider ${
          totals.utilization >= 70
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : totals.utilization >= 30
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          {totals.utilization}% Utilized
        </span>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
          <span className="text-[8px] text-slate-500 uppercase tracking-wider">Total Outstanding</span>
          <p className="font-mono font-black text-white mt-0.5">{totals.outstanding.toLocaleString()} G</p>
        </div>
        <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
          <span className="text-[8px] text-slate-500 uppercase tracking-wider">Available Credit</span>
          <p className="font-mono font-bold text-[#22C55E] mt-0.5">{(totals.limit - totals.outstanding).toLocaleString()} G</p>
        </div>
        <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
          <span className="text-[8px] text-slate-500 uppercase tracking-wider">Total Rewards</span>
          <p className="font-mono font-bold text-[#FACC15] mt-0.5">{totals.points.toLocaleString()} PTS</p>
        </div>
        <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5">
          <span className="text-[8px] text-slate-500 uppercase tracking-wider">Bills Due</span>
          <p className="font-mono font-bold text-red-400 mt-0.5">{activeDueStatements.length} Statement(s)</p>
        </div>
      </div>

      {/* Quick Pay / Active bills Section */}
      <div className="bg-slate-950/25 p-4 rounded-xl border border-white/5 space-y-3 flex-grow flex flex-col justify-between">
        <span className="text-[8px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
          Quick Pay Console
        </span>

        {activeDueStatements.length === 0 ? (
          <div className="text-center py-6 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex-grow flex items-center justify-center">
            All statements cleared!
          </div>
        ) : (
          <form onSubmit={handleQuickPay} className="space-y-2 text-left flex-grow">
            {error && <div className="text-[8px] text-red-400 bg-red-950/20 p-1.5 rounded border border-red-900/30">{error}</div>}
            {success && <div className="text-[8px] text-green-400 bg-green-950/20 p-1.5 rounded border border-green-900/30">Payment registered!</div>}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[7.5px] text-slate-500 uppercase mb-0.5">Bill Month</label>
                <select
                  value={selectedStmtId}
                  onChange={(e) => {
                    setSelectedStmtId(e.target.value);
                    const found = activeDueStatements.find((s) => s.id === e.target.value);
                    if (found) setPayAmount(found.remainingAmount.toString());
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                >
                  <option value="">-- Select Bill --</option>
                  {activeDueStatements.map((s) => {
                    const card = creditCards.find((c) => c.id === s.cardId);
                    return (
                      <option key={s.id} value={s.id}>
                        {card ? `${card.bank || 'Bank'} (${s.statementMonth})` : s.statementMonth} - {s.remainingAmount}G
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-[7.5px] text-slate-500 uppercase mb-0.5">Amount (G)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 font-mono text-[10px] text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[7.5px] text-slate-500 uppercase mb-0.5">Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Bank Account">Bank Account</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="success"
                  fullWidth={true}
                  glow={false}
                  className="rounded-lg py-1 text-[8px] font-sans font-bold uppercase tracking-wider"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreditOverviewWidget;
