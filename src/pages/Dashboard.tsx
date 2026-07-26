import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LevelHUD } from '../components/dashboard/LevelHUD';
import { StatsHUD } from '../components/dashboard/StatsHUD';
import { StreakWidget } from '../components/dashboard/StreakWidget';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { CreditCardModal } from '../components/cards/CreditCardModal';
import { GoalForm } from '../components/goals/GoalForm';
import { PlusCircle, CreditCard, Shield, Sparkles, Terminal } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Modal states
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6 w-full">
      {/* 1. Welcomer Banner & Greeting HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            Security status: authenticated
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Welcome back, <span className="text-neon-blue">{user.displayName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1.5 border border-slate-900 rounded">
          <Terminal className="w-3.5 h-3.5 text-neon-blue" />
          <span>Active Session ID: {user.uid.substring(0, 10).toUpperCase()}</span>
        </div>
      </div>

      {/* 2. Character Profile & Progression HUD */}
      <LevelHUD />

      {/* 3. Core Balances Statistics */}
      <StatsHUD />

      {/* 4. Action Console Widget */}
      <Card glowColor="none" clipCorners={true} className="p-4 bg-slate-950/50">
        <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-neon-blue" />
          System Command Console
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <Button variant="primary" glow={true} onClick={() => setIsTxOpen(true)}>
            <PlusCircle className="w-4 h-4" />
            Log Operation
          </Button>

          <Button variant="success" glow={true} onClick={() => setIsGoalOpen(true)}>
            <Sparkles className="w-4 h-4" />
            Launch Savings Quest
          </Button>

          <Button variant="secondary" onClick={() => setIsCardOpen(true)}>
            <CreditCard className="w-4 h-4" />
            Forge Card Relic
          </Button>

        </div>
      </Card>

      {/* 5. Streak Timeline & Recent Transactions split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Streak Widget: Fullwidth Row on mobile, Left Col on desktop */}
        <div className="lg:col-span-3">
          <StreakWidget />
        </div>

        {/* Recent Transactions: Left */}
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>

        {/* Short motivational tips Card: Right */}
        <Card glowColor="none" className="flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest pb-3 border-b border-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon-blue" />
              Guild Codex Tips
            </h3>
            
            <div className="space-y-4 text-xs font-mono text-slate-400 uppercase tracking-wide leading-relaxed">
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded">
                <span className="text-[9px] text-neon-blue font-bold block mb-1">Quest Multiplier</span>
                Always log daily expenses. Consecutive days increase your flame streak, unlocking experience point boosts.
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded">
                <span className="text-[9px] text-neon-purple font-bold block mb-1">Relic Buffs</span>
                Keep credit utilization below 30% to maintain your passive "Discipline" aura (+5% XP multiplier).
              </div>
            </div>
          </div>

          <div className="text-[8px] font-mono text-slate-500 uppercase text-center mt-6 tracking-widest">
            Codex database: compiled
          </div>
        </Card>

      </div>

      {/* MODALS */}
      <Modal isOpen={isTxOpen} onClose={() => setIsTxOpen(false)} title="Log Operation">
        <TransactionForm onSuccess={() => setIsTxOpen(false)} />
      </Modal>

      <Modal isOpen={isCardOpen} onClose={() => setIsCardOpen(false)} title="Forge Card Relic">
        <CreditCardModal onSuccess={() => setIsCardOpen(false)} />
      </Modal>

      <Modal isOpen={isGoalOpen} onClose={() => setIsGoalOpen(false)} title="Launch Savings Quest">
        <GoalForm onSuccess={() => setIsGoalOpen(false)} />
      </Modal>

    </div>
  );
};
export default Dashboard;
