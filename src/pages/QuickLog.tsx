import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useCreditCards } from '../hooks/useCreditCards';

export const QuickLog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { creditCards, isLoading: isCardsLoading } = useCreditCards();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Guard ref to prevent double execution in React StrictMode
  const executedRef = useRef(false);

  useEffect(() => {
    if (isCardsLoading) return;
    if (executedRef.current) return;
    executedRef.current = true;

    const logOperation = async () => {
      try {
        const amountStr = searchParams.get('amount');
        const categoryInput = searchParams.get('category') || 'Other';
        const descriptionInput = searchParams.get('description') || 'Shortcuts Operation';
        const paymentInput = searchParams.get('payment') || 'Cash';
        const cardQuery = searchParams.get('card'); // Can be card ID or name

        if (!amountStr) {
          throw new Error('Missing parameter: amount is required');
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Invalid parameter: amount must be a positive number');
        }

        // Clean category name
        const category = categoryInput.replace(/\s*\(.*\)/, '').trim();

        // Resolve Credit Card
        let resolvedCardId: string | null = null;
        let resolvedPaymentMethod = paymentInput;

        if (cardQuery) {
          const matchedCard = creditCards.find(
            (c) => 
              c.id === cardQuery || 
              c.name.toLowerCase().includes(cardQuery.toLowerCase())
          );
          if (matchedCard) {
            resolvedCardId = matchedCard.id;
            resolvedPaymentMethod = `Card: ${matchedCard.name}`;
          }
        }

        // Record the transaction
        await addTransaction({
          amount,
          type: 'expense',
          category,
          description: descriptionInput.trim(),
          date: new Date().toISOString().split('T')[0],
          cardId: resolvedCardId,
          paymentMethod: resolvedPaymentMethod,
        });

        setStatus('success');
        
        // Wait 1.2s for visual transition
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);

      } catch (err: any) {
        console.error('QuickLog error:', err);
        setErrorMsg(err?.message || 'Failed to sync shortcuts input.');
        setStatus('error');
      }
    };

    logOperation();
  }, [searchParams, isCardsLoading, creditCards, addTransaction, navigate]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-slate-300 gap-6 p-4">
      {status === 'loading' && (
        <>
          {/* Holographic scanner loader */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-dashed border-neon-blue/30 animate-spin" />
            <div className="absolute inset-2 rounded-full border border-neon-blue animate-pulse flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-neon-blue rounded-full" />
            </div>
          </div>
          <div className="animate-pulse text-neon-blue tracking-[0.2em] font-bold">
            Syncing shortcuts entry...
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#22C55E]/30 animate-pulse" />
            <span className="text-[#22C55E] text-2xl font-sans font-black">✓</span>
          </div>
          <div className="text-[#22C55E] tracking-[0.2em] font-bold">
            Registry Log Recorded!
          </div>
          <span className="text-slate-500 text-[10px]">Loading Dashboard console...</span>
        </>
      )}

      {status === 'error' && (
        <div className="max-w-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-500 text-2xl font-sans font-black">
            !
          </div>
          <div className="text-red-400 font-bold tracking-[0.1em]">
            Sync Error Detected
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans normal-case">
            {errorMsg}
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl py-2.5 px-4 font-mono font-bold tracking-wider transition-all border border-white/10 cursor-pointer active:scale-95 text-[10px]"
          >
            Abort & Return Home
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickLog;
