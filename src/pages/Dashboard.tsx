import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LevelHUD } from '../components/dashboard/LevelHUD';
import { StatsHUD } from '../components/dashboard/StatsHUD';
import { MonthFilterWidget } from '../components/dashboard/MonthFilterWidget';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { DailyQuestsWidget } from '../components/dashboard/DailyQuestsWidget';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { CreditCardModal } from '../components/cards/CreditCardModal';
import { GoalForm } from '../components/goals/GoalForm';
import { PlusCircle, CreditCard, Shield, Sparkles, Terminal } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Date selection state
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  
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
      <StatsHUD selectedMonth={selectedMonth} />

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
        
        {/* Month Navigator Widget instead of Streak */}
        <div className="lg:col-span-3">
          <MonthFilterWidget selectedMonth={selectedMonth} onChange={setSelectedMonth} />
        </div>

        {/* Recent Transactions: Left */}
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>

        {/* Daily Quests Widget: Right Col */}
        <div className="lg:col-span-1">
          <DailyQuestsWidget />
        </div>

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
