import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { useGoals } from '../../hooks/useGoals';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldCheck, Calendar, Trophy, Trash2, ChevronRight, Coins } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface GoalCardProps {
  goal: SavingsGoal;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { user } = useAuth();
  const { contributeToGoal, deleteGoal } = useGoals();

  const [contribAmount, setContribAmount] = useState('');
  const [showContrib, setShowContrib] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount;
  const progressPercent = Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0;

  // Calculate days remaining
  const getDaysRemaining = () => {
    const today = new Date();
    const deadlineDate = new Date(goal.deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Enter a valid gold amount.');
      return;
    }

    if (user && user.currencyGold < amt) {
      setError('Insufficient gold in your wallet.');
      return;
    }

    // Limit contribution to what is remaining to reach target
    const remainingToSave = goal.targetAmount - goal.currentAmount;
    const finalAmt = Math.min(remainingToSave, amt);

    setSubmitting(true);

    try {
      await contributeToGoal({ goal, amount: finalAmt });
      setContribAmount('');
      setShowContrib(false);
    } catch (err: any) {
      setError(err?.message || 'Contribution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Abandon Savings Quest: [${goal.name}]? Active savings (${goal.currentAmount}g) will be refunded to your wallet gold.`
      )
    ) {
      try {
        await deleteGoal(goal);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Card
      glowColor={isCompleted ? 'green' : 'blue'}
      clipCorners={true}
      className="flex flex-col min-h-[220px] justify-between shadow-lg relative"
    >
      
      {/* 1. Header & Rarity info */}
      <div>
        <div className="flex justify-between items-start">
          <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 uppercase tracking-widest ${
            isCompleted
              ? 'border-neon-green text-neon-green bg-neon-green/10'
              : 'border-neon-blue text-neon-blue bg-neon-blue/10'
          }`}>
            {isCompleted ? 'Quest Complete' : 'Active Quest'}
          </span>
          <button
            onClick={handleDelete}
            className="p-1 rounded border border-slate-900 hover:border-neon-red bg-slate-950/20 hover:bg-neon-red/10 text-slate-600 hover:text-neon-red cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mt-3.5">
          {goal.name}
        </h3>
        <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5 tracking-wider">
          Registry Category: {goal.category}
        </p>
      </div>

      {/* 2. Progress Gauge */}
      <div className="my-4">
        <ProgressBar
          value={goal.currentAmount}
          max={goal.targetAmount}
          color={isCompleted ? 'green' : 'blue'}
          label="Savings Progress"
          subLabel={`${progressPercent}% (${goal.currentAmount}g / ${goal.targetAmount}g)`}
          size="sm"
          glow={true}
        />
        
        {/* Deadline indicators */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-2.5 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-600" />
            <span>Target: {goal.deadline}</span>
          </span>
          <span>
            {isCompleted ? (
              <span className="text-neon-green font-bold">Reward Logged</span>
            ) : daysRemaining > 0 ? (
              <span>{daysRemaining} Days left</span>
            ) : (
              <span className="text-neon-red font-bold">Overdue</span>
            )}
          </span>
        </div>
      </div>

      {/* 3. Contribute Interface Box */}
      <div className="pt-2 border-t border-slate-900">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-1.5 py-1.5 bg-neon-green/5 border border-neon-green/20 rounded-md text-[10px] font-display font-bold text-neon-green uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-neon-green" />
            <span>Quest Completed (+200 XP Awarded)</span>
          </div>
        ) : showContrib ? (
          <form onSubmit={handleContribute} className="space-y-2">
            {error && <span className="block text-[8px] font-mono text-neon-red uppercase">{error}</span>}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="number"
                  placeholder="Contrib gold..."
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-neon-blue"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-neon-amber">
                  GOLD
                </span>
              </div>
              <Button
                type="submit"
                variant="success"
                size="sm"
                disabled={submitting}
              >
                Transfer
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowContrib(false);
                  setError('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="primary"
            size="sm"
            fullWidth={true}
            onClick={() => setShowContrib(true)}
            className="flex items-center justify-center gap-1"
          >
            <Coins className="w-3.5 h-3.5" />
            Contribute Gold
          </Button>
        )}
      </div>

    </Card>
  );
};
export default GoalCard;
