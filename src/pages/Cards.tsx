import React, { useState } from 'react';
import { useCreditCards } from '../hooks/useCreditCards';
import { useAuth } from '../context/AuthContext';
import { CreditCard } from '../types';
import { CreditCardItem } from '../components/cards/CreditCardItem';
import { CreditCardModal } from '../components/cards/CreditCardModal';
import { CreditUtilizationWidget } from '../components/cards/CreditUtilizationWidget';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PlusCircle, Sparkles, AlertCircle } from 'lucide-react';

export const Cards: React.FC = () => {
  const { user } = useAuth();
  const { creditCards, payCard, isLoading } = useCreditCards();

  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payError, setPayError] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const handlePayClick = (card: CreditCard) => {
    setSelectedCard(card);
    setPayAmount(card.balance.toString()); // Pre-fill with statement balance
    setPayError('');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');

    if (!selectedCard) return;

    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayError('Please input a valid gold amount.');
      return;
    }

    if (user && user.currencyGold < amt) {
      setPayError('Insufficient Gold in your wallet!');
      return;
    }

    if (amt > selectedCard.balance) {
      setPayError('Payment cannot exceed card balance.');
      return;
    }

    setSubmittingPayment(true);

    try {
      await payCard({ card: selectedCard, amount: amt });
      setSelectedCard(null);
      setPayAmount('');
    } catch (err: any) {
      setPayError(err?.message || 'Debt repayment failed.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            Relic equipment registry
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Credit Card Relics
          </h1>
        </div>
        <Button
          variant="primary"
          glow={true}
          onClick={() => setIsForgeOpen(true)}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Forge Card Relic
        </Button>
      </div>

      {/* 2. Aggregate Index Widgets */}
      <CreditUtilizationWidget />

      {/* 3. Cards grid layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : creditCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-900 rounded-lg bg-slate-950/20">
          <Sparkles className="w-8 h-8 text-slate-700 animate-pulse mb-3" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">No Card Relics equipped.</p>
          <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase">Forge cards to link operations and track debt loads.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditCards.map((card) => (
            <CreditCardItem key={card.id} card={card} onPayClick={handlePayClick} />
          ))}
        </div>
      )}

      {/* MODAL: Forge Card Relic */}
      <Modal isOpen={isForgeOpen} onClose={() => setIsForgeOpen(false)} title="Forge Card Relic">
        <CreditCardModal onSuccess={() => setIsForgeOpen(false)} />
      </Modal>

      {/* MODAL: Repay Statement Balance */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title={selectedCard ? `Discharge Debt: ${selectedCard.name}` : 'Discharge Debt'}
      >
        {selectedCard && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {payError && (
              <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded text-neon-red text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-900/50 rounded border border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span>Wallet Gold:</span>
                <span className="text-neon-amber font-bold">{user?.currencyGold.toLocaleString()}G</span>
              </div>
              <div className="flex justify-between">
                <span>Relic Debt Owed:</span>
                <span className="text-neon-red font-bold">{selectedCard.balance.toLocaleString()}G</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Repayment Gold Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  max={selectedCard.balance}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 font-mono text-white focus:outline-none focus:border-neon-blue text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-neon-amber">
                  GOLD
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="success"
                fullWidth={true}
                glow={true}
                disabled={submittingPayment}
              >
                {submittingPayment ? 'Processing discharge...' : 'Confirm Discharge'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
export default Cards;
