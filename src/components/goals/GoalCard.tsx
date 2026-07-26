import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { useGoals } from '../../hooks/useGoals';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Trophy, Trash2, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoalCardProps {
  goal: SavingsGoal;
}

const triggerGoldConfetti = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 35 * (timeLeft / duration);
    const colors = ['#FFD700', '#FFA500', '#FFDF00', '#FFE39F', '#B8860B'];
    
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 }, colors });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 }, colors });
  }, 220);
};

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { user } = useAuth();
  const { contributeToGoal, deleteGoal } = useGoals();

  const [contribAmount, setContribAmount] = useState('');
  const [showContrib, setShowContrib] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount;
  const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0);

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
      setError('Enter a valid amount.');
      return;
    }

    if (user && user.currencyGold < amt) {
      setError('Insufficient gold.');
      return;
    }

    // Limit contribution to what is remaining to reach target
    const remainingToSave = goal.targetAmount - goal.currentAmount;
    const finalAmt = Math.min(remainingToSave, amt);

    setSubmitting(true);

    try {
      await contributeToGoal({ goal, amount: finalAmt });
      
      // If contribution completes the goal, fire confetti!
      if (goal.currentAmount + finalAmt >= goal.targetAmount) {
        triggerGoldConfetti();
      }

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

  // SVG Circular Gauge Calculations
  const radius = 32;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <Card
      glowColor="none"
      clipCorners={false}
      className={`flex flex-col min-h-[220px] justify-between bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative group overflow-hidden ${
        isCompleted ? 'hover:shadow-[0_8px_35px_rgba(34,197,94,0.1)]' : 'hover:shadow-[0_8px_35px_rgba(0,200,255,0.1)]'
      }`}
    >
      
      {/* 1. Header Row */}
      <div className="flex gap-4 items-start justify-between text-left">
        {/* Left Side: Circular Gauge */}
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              stroke="rgba(255, 255, 255, 0.05)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={isCompleted ? '#22C55E' : '#00C8FF'}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-[10px] font-sans font-bold text-white">
            {progressPercent}%
          </span>
        </div>

        {/* Right Side: Details & Trash Button */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide truncate">
              {goal.name}
            </h3>
            <button
              onClick={handleDelete}
              className="p-1 rounded-lg border border-white/5 bg-white/2 hover:border-red-500/30 hover:bg-red-500/10 text-slate-500 hover:text-red-400 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-[8px] font-sans font-bold text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {goal.category}
            </span>
            <span className={`text-[8px] font-sans font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isCompleted 
                ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10'
                : 'border-white/5 text-slate-500'
            }`}>
              {isCompleted ? 'Completed' : 'Saving'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Amount values */}
      <div className="my-4 text-left">
        <span className="text-[10px] font-sans font-bold text-slate-400">
          {goal.currentAmount.toLocaleString()} <span className="text-[9px] text-slate-500">/ {goal.targetAmount.toLocaleString()} G</span>
        </span>
        
        {/* Deadline indicators */}
        <div className="flex items-center justify-between text-[9px] font-sans font-bold text-slate-500 mt-2 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-600" />
            <span>Till {goal.deadline}</span>
          </span>
          <span>
            {isCompleted ? (
              <span className="text-emerald-400 font-bold">Reward Logged</span>
            ) : daysRemaining > 0 ? (
              <span>{daysRemaining} Days Left</span>
            ) : (
              <span className="text-red-400 font-bold">Overdue</span>
            )}
          </span>
        </div>
      </div>

      {/* 3. Contribute Interface Box */}
      <div className="pt-3 border-t border-white/5">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-1.5 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Quest Completed (+200 XP Awarded)</span>
          </div>
        ) : showContrib ? (
          <form onSubmit={handleContribute} className="space-y-2">
            {error && <span className="block text-[8px] font-sans font-bold text-red-400 uppercase">{error}</span>}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="number"
                  placeholder="Amount"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-sans placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-sans font-bold text-slate-500">
                  G
                </span>
              </div>
              <Button
                type="submit"
                variant="success"
                size="sm"
                disabled={submitting}
                className="rounded-xl px-4 text-[10px] font-sans uppercase font-bold"
              >
                Send
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowContrib(false);
                  setError('');
                }}
                className="px-3 rounded-xl border border-white/5 bg-white/2 text-slate-400 hover:text-slate-200 text-[10px] font-sans font-bold uppercase transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <Button
            variant="primary"
            size="sm"
            fullWidth={true}
            onClick={() => setShowContrib(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl uppercase text-[10px] tracking-wider py-2"
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
