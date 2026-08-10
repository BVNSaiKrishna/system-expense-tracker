import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { TransactionForm } from '../components/transactions/TransactionForm';

export const LogOperation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Page Header */}
      <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-lg text-left">
        <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block animate-pulse">
          Active Interface // System Entry
        </span>
        <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
          Log Operation
        </h1>
      </div>

      {/* Main Form Panel */}
      <Card glowColor="blue" className="p-6 bg-white/5 border border-white/5 rounded-2xl shadow-md backdrop-blur-xl">
        <TransactionForm onSuccess={() => navigate('/transactions')} />
      </Card>
    </div>
  );
};

export default LogOperation;
