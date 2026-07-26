import React, { useState } from 'react';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PlusCircle } from 'lucide-react';

export const Transactions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            Archive console
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Registry Ledger
          </h1>
        </div>
        <Button
          variant="primary"
          glow={true}
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Log Operation
        </Button>
      </div>

      {/* Primary table log lists */}
      <TransactionList />

      {/* Add Transaction Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Log Operation">
        <TransactionForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};
export default Transactions;
