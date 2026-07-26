import React, { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useCreditCards } from '../../hooks/useCreditCards';
import { Button } from '../ui/Button';
import {
  Calendar,
  AlertCircle,
  Utensils,
  Sword,
  Receipt,
  FlaskConical,
  Compass,
  Beer,
  Plus,
  Smartphone,
  CreditCard,
  Coins,
  Swords,
} from 'lucide-react';

interface TransactionFormProps {
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES = [
  { name: 'Provisions (Food)', icon: Utensils },
  { name: 'Gear (Equipment)', icon: Sword },
  { name: 'Guild Fees (Bills)', icon: Receipt },
  { name: 'Elixirs (Medical)', icon: FlaskConical },
  { name: 'Travel (Transport)', icon: Compass },
  { name: 'Tavern (Games)', icon: Beer },
];

const INCOME_CATEGORIES = [
  { name: 'Guild Salary', icon: Receipt },
  { name: 'Dungeon Loot', icon: Swords },
  { name: 'Investment Yield', icon: Coins },
  { name: 'Side Quests', icon: Compass },
];

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { addTransaction } = useTransactions();
  const { creditCards } = useCreditCards();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customPayment, setCustomPayment] = useState('');
  const [isCustomPayment, setIsCustomPayment] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cardId, setCardId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-switch categories when type changes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setIsCustomCategory(false);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name);
    setPaymentMethod('Cash');
    setIsCustomPayment(false);
    setCardId('');
  };

  const handleCategoryChange = (val: string) => {
    if (val === 'CUSTOM_CATEGORY') {
      setIsCustomCategory(true);
      setCategory('');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handlePaymentMethodChange = (val: string) => {
    if (val === 'CUSTOM_PAYMENT') {
      setIsCustomPayment(true);
      setPaymentMethod('');
      setCardId('');
    } else {
      setIsCustomPayment(false);
      setPaymentMethod(val);
      if (val !== 'credit') setCardId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please input a valid gold amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please specify a description/quest name.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (isCustomCategory && !finalCategory) {
      setError('Please specify your custom category/log type.');
      return;
    }

    let finalPaymentMethod = paymentMethod;
    if (paymentMethod === 'credit') {
      if (!cardId) {
        setError('Please select which Credit Card relic is charged.');
        return;
      }
      const selectedCard = creditCards.find((c) => c.id === cardId);
      finalPaymentMethod = selectedCard ? `Card: ${selectedCard.name}` : 'Credit Card';
    } else if (isCustomPayment) {
      finalPaymentMethod = customPayment.trim();
      if (!finalPaymentMethod) {
        setError('Please specify the custom payment channel.');
        return;
      }
    }

    setSubmitting(true);

    try {
      await addTransaction({
        amount: parsedAmount,
        type,
        category: finalCategory,
        description: description.trim(),
        date,
        cardId: type === 'expense' && paymentMethod === 'credit' ? cardId : null,
        paymentMethod: finalPaymentMethod,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit operation.');
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

      {/* 1. Transaction Type selector tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 border border-slate-900 rounded-md">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`py-2 text-xs font-display font-bold uppercase rounded transition-all cursor-pointer ${
            type === 'expense'
              ? 'bg-neon-red/20 text-neon-red border border-neon-red/40'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Upkeep (Expense)
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`py-2 text-xs font-display font-bold uppercase rounded transition-all cursor-pointer ${
            type === 'income'
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Loot (Income)
        </button>
      </div>

      {/* 2. Amount Input */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Gold Amount (Value)
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 font-mono text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 text-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-neon-amber">
            GOLD
          </span>
        </div>
      </div>

      {/* 3. Description Input */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Quest Name (Description)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Paid Electricity, Sold Iron Ores"
          className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50"
        />
      </div>

      {/* 4. Category selection Grid */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
          Registry Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = !isCustomCategory && category === cat.name;
            return (
              <button
                type="button"
                key={cat.name}
                onClick={() => {
                  setIsCustomCategory(false);
                  setCategory(cat.name);
                }}
                className={`flex items-center gap-2 p-2.5 rounded border text-left cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-neon-blue bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                    : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-950/70'
                }`}
              >
                <CatIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wide truncate">
                  {cat.name.replace(/\s*\(.*\)/, '')}
                </span>
              </button>
            );
          })}
          {/* Custom Category Button */}
          <button
            type="button"
            onClick={() => handleCategoryChange('CUSTOM_CATEGORY')}
            className={`flex items-center gap-2 p-2.5 rounded border text-left cursor-pointer transition-all duration-200 ${
              isCustomCategory
                ? 'border-neon-blue bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-950/70'
            }`}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wide truncate">
              Custom
            </span>
          </button>
        </div>
      </div>

      {isCustomCategory && (
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            Specify Custom Category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Potions, Magic Orbs, Guild Dues"
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50"
          />
        </div>
      )}

      {/* 5. Date selection */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
          Quest Timestamp (Date)
        </label>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-neon-blue cursor-pointer"
          />
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* 6. Payment Channel selector Grid */}
      <div>
        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
          Payment Channel
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'Cash', label: 'Cash (Gold)', icon: Coins },
            { key: 'UPI', label: 'UPI (Gold)', icon: Smartphone },
            { key: 'Debit Card', label: 'Debit (Gold)', icon: CreditCard },
          ].map((ch) => {
            const ChIcon = ch.icon;
            const isSelected = !isCustomPayment && paymentMethod === ch.key;
            return (
              <button
                type="button"
                key={ch.key}
                onClick={() => handlePaymentMethodChange(ch.key)}
                className={`flex items-center gap-2 p-2.5 rounded border text-left cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-neon-blue bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                    : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-950/70'
                }`}
              >
                <ChIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wide truncate">
                  {ch.label}
                </span>
              </button>
            );
          })}

          {/* Credit Card Relic */}
          {type === 'expense' && (
            <button
              type="button"
              onClick={() => handlePaymentMethodChange('credit')}
              className={`flex items-center gap-2 p-2.5 rounded border text-left cursor-pointer transition-all duration-200 ${
                paymentMethod === 'credit'
                  ? 'border-neon-blue bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                  : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-950/70'
              }`}
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] font-mono uppercase tracking-wide truncate font-bold">
                Relic Card
              </span>
            </button>
          )}

          {/* Custom payment method button */}
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('CUSTOM_PAYMENT')}
            className={`flex items-center gap-2 p-2.5 rounded border text-left cursor-pointer transition-all duration-200 ${
              isCustomPayment
                ? 'border-neon-blue bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-950/70'
            }`}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wide truncate">
              Custom
            </span>
          </button>
        </div>
      </div>

      {isCustomPayment && (
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            Specify Payment Channel
          </label>
          <input
            type="text"
            value={customPayment}
            onChange={(e) => setCustomPayment(e.target.value)}
            placeholder="e.g. Net Banking, Crypto, Bank Transfer"
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50"
          />
        </div>
      )}

      {type === 'expense' && paymentMethod === 'credit' && (
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            Link Credit Card Relic
          </label>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-neon-blue cursor-pointer"
            required
          >
            <option value="">-- Choose Credit Card --</option>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} (Limit: {card.limit}g | Bal: {card.balance}g)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant={type === 'income' ? 'success' : 'primary'}
          fullWidth={true}
          glow={true}
          disabled={submitting}
        >
          {submitting ? 'Recording Log...' : 'Record Operation'}
        </Button>
      </div>
    </form>
  );
};
export default TransactionForm;
