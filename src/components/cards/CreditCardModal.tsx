import React, { useState } from 'react';
import { useCreditCards } from '../../hooks/useCreditCards';
import { Button } from '../ui/Button';
import { AlertCircle } from 'lucide-react';

interface CreditCardModalProps {
  onSuccess: () => void;
}

export const CreditCardModal: React.FC<CreditCardModalProps> = ({ onSuccess }) => {
  const { addCreditCard } = useCreditCards();

  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [dueDate, setDueDate] = useState('15');
  const [statementDate, setStatementDate] = useState('5');
  const [color, setColor] = useState<'blue' | 'purple' | 'amber' | 'pink' | 'green'>('blue');
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
      setError('Please name this card relic.');
      return;
    }

    const dueDay = parseInt(dueDate);
    const statementDay = parseInt(statementDate);

    if (dueDay < 1 || dueDay > 31 || statementDay < 1 || statementDay > 31) {
      setError('Due and statement dates must be between 1 and 31.');
      return;
    }

    setSubmitting(true);

    try {
      await addCreditCard({
        name: name.trim(),
        limit: parsedLimit,
        balance: 0, // starts empty
        dueDate: dueDay,
        statementDate: statementDay,
        color,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to forge card relic.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded text-neon-red text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Relic Name */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Relic Card Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Vanguard Platinum, Shadow Obsidian"
          className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
        />
      </div>

      {/* 2. Limit */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Credit Limit Cap
        </label>
        <div className="relative">
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="5000"
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 font-mono text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue text-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-neon-amber">
            GOLD
          </span>
        </div>
        <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">
          Tiers: Under 2k: Common | Under 7.5k: Rare | Under 20k: Epic | 20k+: Legendary
        </p>
      </div>

      {/* 3. Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            Due Date Day (1-31)
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-neon-blue"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            Statement Day (1-31)
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={statementDate}
            onChange={(e) => setStatementDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-neon-blue"
          />
        </div>
      </div>

      {/* 4. Color theme picker */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Relic Glow Signature (Color)
        </label>
        <div className="flex gap-2.5 pt-1">
          {(['blue', 'purple', 'amber', 'pink', 'green'] as const).map((col) => {
            const hex = {
              blue: 'bg-neon-blue border-neon-blue',
              purple: 'bg-neon-purple border-neon-purple',
              amber: 'bg-neon-amber border-neon-amber',
              pink: 'bg-neon-pink border-neon-pink',
              green: 'bg-neon-green border-neon-green',
            }[col];

            return (
              <button
                key={col}
                type="button"
                onClick={() => setColor(col)}
                className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-all ${hex} ${
                  color === col ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth={true}
          glow={true}
          disabled={submitting}
        >
          {submitting ? 'Forging Relic...' : 'Forge Card Relic'}
        </Button>
      </div>
    </form>
  );
};
export default CreditCardModal;
