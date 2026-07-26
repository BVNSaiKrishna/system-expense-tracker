import React, { useState } from 'react';
import { useCreditCards } from '../../hooks/useCreditCards';
import { Button } from '../ui/Button';
import { AlertCircle } from 'lucide-react';
import { CreditCard } from '../../types';

interface CreditCardModalProps {
  card?: CreditCard;
  onSuccess: () => void;
}

export const CreditCardModal: React.FC<CreditCardModalProps> = ({ card, onSuccess }) => {
  const { addCreditCard, updateCreditCard } = useCreditCards();

  const [name, setName] = useState(card?.name || '');
  const [bank, setBank] = useState(card?.bank || '');
  const [last4Digits, setLast4Digits] = useState(card?.last4Digits || '');
  const [network, setNetwork] = useState<'Visa' | 'Mastercard' | 'Amex' | 'RuPay'>(card?.network || 'Visa');
  const [limit, setLimit] = useState(card?.limit ? card.limit.toString() : '');
  const [dueDate, setDueDate] = useState(card?.dueDate ? card.dueDate.toString() : '25');
  const [statementDate, setStatementDate] = useState(card?.statementDate ? card.statementDate.toString() : '5');
  const [statementCycle, setStatementCycle] = useState(card?.statementCycle || 'Monthly');
  const [interestRate, setInterestRate] = useState(card?.interestRate ? card.interestRate.toString() : '');
  const [annualFee, setAnnualFee] = useState(card?.annualFee ? card.annualFee.toString() : '0');
  const [rewardProgramName, setRewardProgramName] = useState(card?.rewardProgramName || '');
  const [color, setColor] = useState<'blue' | 'purple' | 'amber' | 'pink' | 'green' | 'red' | 'silver' | 'gold'>(card?.color || 'blue');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Please input a valid limit amount.');
      return;
    }

    if (!name.trim()) {
      setError('Please specify card name.');
      return;
    }

    if (!bank.trim()) {
      setError('Please specify bank name.');
      return;
    }

    if (!/^\d{4}$/.test(last4Digits)) {
      setError('Last 4 Digits must be exactly 4 numeric characters.');
      return;
    }

    const dueDay = parseInt(dueDate);
    const statementDay = parseInt(statementDate);

    if (dueDay < 1 || dueDay > 31 || statementDay < 1 || statementDay > 31) {
      setError('Due and statement days must be between 1 and 31.');
      return;
    }

    setSubmitting(true);

    try {
      if (card) {
        // Reforge existing card
        await updateCreditCard({
          ...card,
          name: name.trim(),
          bank: bank.trim(),
          last4Digits,
          network,
          limit: parsedLimit,
          dueDate: dueDay,
          statementDate: statementDay,
          statementCycle,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
          annualFee: parseFloat(annualFee) || 0,
          rewardProgramName: rewardProgramName.trim() || 'Points Program',
          color,
        });
      } else {
        // Forge new card
        await addCreditCard({
          name: name.trim(),
          bank: bank.trim(),
          last4Digits,
          network,
          limit: parsedLimit,
          balance: 0, // starts empty
          dueDate: dueDay,
          statementDate: statementDay,
          statementCycle,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
          annualFee: parseFloat(annualFee) || 0,
          rewardProgramName: rewardProgramName.trim() || 'Points Program',
          color,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to reforge card relic.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Bank & Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Bank Name
          </label>
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="e.g. Chase, HSBC"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
            required
          />
        </div>
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Card Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sapphire Preferred"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
            required
          />
        </div>
      </div>

      {/* Row 2: Last 4 & Network */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Last 4 Digits
          </label>
          <input
            type="text"
            maxLength={4}
            value={last4Digits}
            onChange={(e) => setLast4Digits(e.target.value.replace(/\D/g, ''))}
            placeholder="4242"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF] font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Card Network
          </label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as any)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#00C8FF] cursor-pointer"
          >
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="Amex">Amex</option>
            <option value="RuPay">RuPay</option>
          </select>
        </div>
      </div>

      {/* Row 3: Limit & Annual Fee */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Credit Limit (Gold)
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="10000"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
            required
          />
        </div>
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Annual Fee
          </label>
          <input
            type="number"
            value={annualFee}
            onChange={(e) => setAnnualFee(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
            required
          />
        </div>
      </div>

      {/* Row 4: Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Billing Statement Day (1-31)
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={statementDate}
            onChange={(e) => setStatementDate(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
            required
          />
        </div>
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Payment Due Day (1-31)
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
            required
          />
        </div>
      </div>

      {/* Row 5: Interest & Reward program */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Interest Rate APR % (optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="e.g. 18.99"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
          />
        </div>
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
            Reward Program Name
          </label>
          <input
            type="text"
            value={rewardProgramName}
            onChange={(e) => setRewardProgramName(e.target.value)}
            placeholder="e.g. Ultimate Rewards"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
          />
        </div>
      </div>

      {/* Row 6: Color theme picker */}
      <div>
        <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-2">
          Card Aesthetic Finish (Color Theme)
        </label>
        <div className="flex gap-2 pb-1.5 flex-wrap">
          {(['blue', 'purple', 'amber', 'pink', 'green', 'red', 'silver', 'gold'] as const).map((col) => {
            const hex = {
              blue: 'bg-[#00C8FF] border-[#00C8FF]',
              purple: 'bg-[#9d4edd] border-[#9d4edd]',
              amber: 'bg-[#FACC15] border-[#FACC15]',
              pink: 'bg-[#ec4899] border-[#ec4899]',
              green: 'bg-[#22C55E] border-[#22C55E]',
              red: 'bg-[#EF4444] border-[#EF4444]',
              silver: 'bg-[#cbd5e1] border-[#cbd5e1]',
              gold: 'bg-[#fbbf24] border-[#fbbf24]',
            }[col];

            return (
              <button
                key={col}
                type="button"
                onClick={() => setColor(col)}
                className={`w-6.5 h-6.5 rounded-full border cursor-pointer transition-all ${hex} ${
                  color === col ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-3">
        <Button
          type="submit"
          variant="primary"
          fullWidth={true}
          glow={false}
          disabled={submitting}
          className="rounded-xl py-3 text-[10px] font-sans font-bold uppercase tracking-wider"
        >
          {submitting ? (card ? 'Saving...' : 'Forging Relic...') : (card ? 'Reforge Card details' : 'Forge Credit Card')}
        </Button>
      </div>
    </form>
  );
};

export default CreditCardModal;
