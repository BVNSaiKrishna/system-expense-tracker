import React, { useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import { Button } from '../ui/Button';
import { Calendar, AlertCircle } from 'lucide-react';

interface GoalFormProps {
  onSuccess: () => void;
}

const GOAL_CATEGORIES = [
  'Relic Acquisition (Gear/Device)',
  'Guild Expansion (Business/Skill)',
  'Fiefdom Purchase (Home/Estate)',
  'Training & Buffs (Education/Courses)',
  'Emergency Aegis (Savings/Emergency)',
  'Travel Quest (Vaction/Journey)',
  'Other Vault Quest',
];

export const GoalForm: React.FC<GoalFormProps> = ({ onSuccess }) => {
  const { addGoal } = useGoals();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [deadline, setDeadline] = useState(
    (() => {
      // Default to 1 month from now
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    })()
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please input a valid target gold amount.');
      return;
    }

    if (!name.trim()) {
      setError('Please name this savings quest.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (deadline < todayStr) {
      setError('Deadline cannot be in the past.');
      return;
    }

    setSubmitting(true);

    try {
      await addGoal({
        name: name.trim(),
        targetAmount: target,
        currentAmount: 0, // starts empty
        category,
        deadline,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize savings quest.');
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

      {/* 1. Quest Name */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Savings Quest Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Reserve for Mythril laptop, Emergency Fund"
          className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
        />
      </div>

      {/* 2. Target Gold */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Target Gold (Limit)
        </label>
        <div className="relative">
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="5000"
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 font-mono text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue text-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-neon-amber">
            GOLD
          </span>
        </div>
      </div>

      {/* 3. Category select */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Quest Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-neon-blue cursor-pointer"
        >
          {GOAL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Target Date */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Quest Deadline (Target Date)
        </label>
        <div className="relative">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-neon-blue cursor-pointer"
          />
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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
          {submitting ? 'Starting Quest...' : 'Start Quest'}
        </Button>
      </div>
    </form>
  );
};
export default GoalForm;
