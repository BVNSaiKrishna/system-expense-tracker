import React, { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useCreditCards } from '../../hooks/useCreditCards';
import { Button } from '../ui/Button';
import {
  Calendar,
  AlertCircle,
  Utensils,
  ShoppingBag,
  FileText,
  HeartPulse,
  Car,
  Beer,
  Plus,
  Smartphone,
  CreditCard,
  Coins,
  Swords,
  UploadCloud,
  FileCheck,
  Wallet,
  Building,
  Tag
} from 'lucide-react';

import { Transaction } from '../../types';

interface TransactionFormProps {
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

const EXPENSE_CATEGORIES = [
  { name: 'Provisions (Food)', icon: Utensils },
  { name: 'Gear (Equipment)', icon: ShoppingBag },
  { name: 'Guild Fees (Bills)', icon: FileText },
  { name: 'Elixirs (Medical)', icon: HeartPulse },
  { name: 'Travel (Transport)', icon: Car },
  { name: 'Tavern (Games)', icon: Beer },
];

const INCOME_CATEGORIES = [
  { name: 'Guild Salary', icon: FileText },
  { name: 'Dungeon Loot', icon: Swords },
  { name: 'Investment Yield', icon: Coins },
  { name: 'Side Quests', icon: CompassIcon },
];

// Inline fallback for Compass Icon to avoid compilation issues
function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, transactionToEdit }) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { creditCards } = useCreditCards();

  const isEditing = !!transactionToEdit;

  const [type] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState(transactionToEdit?.amount ? transactionToEdit.amount.toString() : '');

  // Load custom categories and payment methods from localStorage
  const [savedCategories, setSavedCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('expenseTracker_customCategories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedPayments, setSavedPayments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('expenseTracker_customPayments');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // Categorization logic
  const isCategoryCustom = () => {
    if (!transactionToEdit) return false;
    const presets = transactionToEdit.type === 'expense' 
      ? [...EXPENSE_CATEGORIES.map(c => c.name), ...savedCategories] 
      : [...INCOME_CATEGORIES.map(c => c.name), ...savedCategories];
    return !presets.includes(transactionToEdit.category);
  };
  
  const [isCustomCategory, setIsCustomCategory] = useState(isCategoryCustom());
  const [category, setCategory] = useState(
    isCategoryCustom() ? '' : (transactionToEdit?.category || (transactionToEdit?.type === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name))
  );
  const [customCategory, setCustomCategory] = useState(isCategoryCustom() ? transactionToEdit?.category || '' : '');
 
  // Payment method initialization logic
  const getInitialPaymentMethod = () => {
    if (!transactionToEdit) return 'Cash';
    if (transactionToEdit.cardId) return 'credit';
    const presets = ['Cash', 'UPI', 'Debit Card', 'Wallet', 'Bank Account', ...savedPayments];
    if (presets.includes(transactionToEdit.paymentMethod || '')) return transactionToEdit.paymentMethod || 'Cash';
    return 'CUSTOM_PAYMENT';
  };
 
  const isPaymentCustom = () => {
    if (!transactionToEdit) return false;
    if (transactionToEdit.cardId) return false;
    const presets = ['Cash', 'UPI', 'Debit Card', 'Wallet', 'Bank Account', ...savedPayments];
    return !presets.includes(transactionToEdit.paymentMethod || '');
  };
 
  const [paymentMethod, setPaymentMethod] = useState(getInitialPaymentMethod());
  const [isCustomPayment, setIsCustomPayment] = useState(isPaymentCustom());
  const [customPayment, setCustomPayment] = useState(isPaymentCustom() ? transactionToEdit?.paymentMethod || '' : '');
 
  const [description, setDescription] = useState(transactionToEdit?.description || '');
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [cardId, setCardId] = useState(transactionToEdit?.cardId || '');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
 
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
      setError('Please input a valid amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please specify notes/description.');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (isCustomCategory && !finalCategory) {
      setError('Please specify custom category.');
      return;
    }

    let finalPaymentMethod = paymentMethod;
    if (paymentMethod === 'credit') {
      if (!cardId) {
        setError('Please select Credit Card.');
        return;
      }
      const selectedCard = creditCards.find((c) => c.id === cardId);
      finalPaymentMethod = selectedCard ? `Card: ${selectedCard.name}` : 'Credit Card';
    } else if (isCustomPayment) {
      finalPaymentMethod = customPayment.trim();
      if (!finalPaymentMethod) {
        setError('Please specify custom payment.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isEditing && transactionToEdit) {
        const newTx: Transaction = {
          ...transactionToEdit,
          amount: parsedAmount,
          type,
          category: finalCategory,
          description: description.trim(),
          date,
          cardId: type === 'expense' && paymentMethod === 'credit' ? cardId : null,
          paymentMethod: finalPaymentMethod,
        };
        await updateTransaction({ oldTx: transactionToEdit, newTx });
      } else {
        await addTransaction({
          amount: parsedAmount,
          type,
          category: finalCategory,
          description: description.trim(),
          date,
          cardId: type === 'expense' && paymentMethod === 'credit' ? cardId : null,
          paymentMethod: finalPaymentMethod,
        });
      }

      // Save custom category if typed
      if (isCustomCategory && finalCategory) {
        const cleaned = finalCategory.replace(/\s*\(.*\)/, '').trim();
        if (cleaned && !savedCategories.includes(cleaned)) {
          const updated = [...savedCategories, cleaned];
          localStorage.setItem('expenseTracker_customCategories', JSON.stringify(updated));
        }
      }

      // Save custom payment method if typed
      if (isCustomPayment && finalPaymentMethod) {
        const cleaned = finalPaymentMethod.trim();
        if (cleaned && !savedPayments.includes(cleaned)) {
          const updated = [...savedPayments, cleaned];
          localStorage.setItem('expenseTracker_customPayments', JSON.stringify(updated));
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to record transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}


      {/* 2. Giant Centered Amount Input */}
      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block mb-1">
          Amount Value (Gold)
        </span>
        <div className="flex items-baseline justify-center relative w-full">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="text-center font-sans font-black text-4xl md:text-5xl bg-transparent border-0 text-white focus:outline-none focus:ring-0 w-full max-w-xs placeholder-slate-800"
          />
          <span className="text-sm font-bold text-slate-500 absolute right-12 bottom-1.5 md:right-28">G</span>
        </div>
      </div>

      {/* 3. Category Selector Chips */}
      <div>
        <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-2">
          Select Category
        </label>
        <div className="flex flex-wrap gap-2">
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-left cursor-pointer transition-all duration-200 text-xs ${
                  isSelected
                    ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <CatIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium tracking-wide">
                  {cat.name.replace(/\s*\(.*\)/, '')}
                </span>
              </button>
            );
          })}

          {savedCategories.map((catName) => {
            const isSelected = !isCustomCategory && category === catName;
            return (
              <button
                type="button"
                key={catName}
                onClick={() => {
                  setIsCustomCategory(false);
                  setCategory(catName);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-left cursor-pointer transition-all duration-200 text-xs ${
                  isSelected
                    ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Tag className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <span className="font-medium tracking-wide">{catName}</span>
              </button>
            );
          })}

          {/* Custom Category Chip */}
          <button
            type="button"
            onClick={() => handleCategoryChange('CUSTOM_CATEGORY')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-left cursor-pointer transition-all duration-200 text-xs ${
              isCustomCategory
                ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium tracking-wide">Custom</span>
          </button>
        </div>
      </div>

      {isCustomCategory && (
        <div className="animate-float-in">
          <label className="block text-[9px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1">
            Specify Custom Category
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Potions, Magic Orbs"
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
          />
        </div>
      )}

      {/* 4. Payment Method Chips */}
      <div>
        <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-2">
          Payment Method
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'Cash', label: 'Cash', icon: Coins },
            { key: 'UPI', label: 'UPI', icon: Smartphone },
            { key: 'Debit Card', label: 'Debit Card', icon: CreditCard },
            { key: 'Wallet', label: 'Wallet', icon: Wallet },
            { key: 'Bank Account', label: 'Bank Account', icon: Building },
          ].map((ch) => {
            const ChIcon = ch.icon;
            const isSelected = !isCustomPayment && paymentMethod === ch.key;
            return (
              <button
                type="button"
                key={ch.key}
                onClick={() => handlePaymentMethodChange(ch.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-left cursor-pointer transition-all duration-200 text-xs ${
                  isSelected
                    ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <ChIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium tracking-wide">{ch.label}</span>
              </button>
            );
          })}

          {type === 'expense' && (
            <button
              type="button"
              onClick={() => handlePaymentMethodChange('credit')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-left cursor-pointer transition-all duration-200 text-xs ${
                paymentMethod === 'credit'
                  ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                  : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium tracking-wide">Credit Card</span>
            </button>
          )}

          {savedPayments.map((pm) => {
            const isSelected = !isCustomPayment && paymentMethod === pm;
            return (
              <button
                type="button"
                key={pm}
                onClick={() => {
                  setIsCustomPayment(false);
                  setPaymentMethod(pm);
                  setCardId('');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-left cursor-pointer transition-all duration-200 text-xs ${
                  isSelected
                    ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Tag className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <span className="font-medium tracking-wide">{pm}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handlePaymentMethodChange('CUSTOM_PAYMENT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-left cursor-pointer transition-all duration-200 text-xs ${
              isCustomPayment
                ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium tracking-wide">Custom</span>
          </button>
        </div>
      </div>

      {isCustomPayment && (
        <div className="animate-float-in">
          <label className="block text-[9px] font-sans font-bold text-slate-500 uppercase tracking-wider mb-1">
            Specify Custom Payment
          </label>
          <input
            type="text"
            value={customPayment}
            onChange={(e) => setCustomPayment(e.target.value)}
            placeholder="e.g. Crypto, Check"
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
          />
        </div>
      )}

      {type === 'expense' && paymentMethod === 'credit' && (
        <div className="animate-float-in">
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Link Credit Card
          </label>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#00C8FF] cursor-pointer"
            required
          >
            <option value="">-- Choose Credit Card --</option>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} (Limit: {card.limit} | Bal: {card.balance})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 5. Notes / Description input */}
      <div>
        <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Description (Notes)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Target Grocery Shopping, Office payout"
          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8FF]"
        />
      </div>

      {/* 6. Date Selection & Receipt Attachment Dropzone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Transaction Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#00C8FF] cursor-pointer"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Receipt File Attachment
          </label>
          <div className="border border-dashed border-white/10 hover:border-white/20 rounded-xl p-3 flex flex-col items-center justify-center bg-white/2 hover:bg-white/3 transition-all relative cursor-pointer min-h-[42px]">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setReceiptFile(e.target.files[0]);
                }
              }} 
            />
            <div className="flex items-center gap-1.5 text-slate-400">
              {receiptFile ? (
                <>
                  <FileCheck className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[10px] font-bold text-[#22C55E] truncate max-w-[120px]">{receiptFile.name}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Drag or Upload</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Large Floating Save Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant={type === 'income' ? 'success' : 'primary'}
          fullWidth={true}
          glow={false}
          disabled={submitting}
          className="rounded-xl py-3.5 shadow-lg shadow-black/10 relative overflow-hidden"
        >
          {submitting ? 'Recording...' : isEditing ? 'Reforge Log' : 'Record Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
