import React, { useState } from 'react';
import { CreditCard } from '../../types';
import { useCreditCards } from '../../hooks/useCreditCards';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Shield, Sparkles, TrendingUp, RefreshCw, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface CreditCardItemProps {
  card: CreditCard;
  onPayClick: (card: CreditCard) => void;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({ card, onPayClick }) => {
  const { deleteCreditCard } = useCreditCards();
  const [deleting, setDeleting] = useState(false);

  const utilization = Math.round((card.balance / card.limit) * 100) || 0;

  // Determine buffs/debuffs
  const isBuffActive = utilization < 30;
  const isDebuffActive = utilization > 50;

  // Rarity badges
  const rarityColors = {
    common: 'border-slate-600 text-slate-400 bg-slate-900',
    rare: 'border-neon-blue text-neon-blue bg-neon-blue/15',
    epic: 'border-neon-purple text-neon-purple bg-neon-purple/15',
    legendary: 'border-neon-amber text-neon-amber bg-neon-amber/15',
  }[card.rarity];

  // Neon theme border mapping
  const neonGlowColor = {
    blue: 'blue' as const,
    purple: 'purple' as const,
    amber: 'gold' as const,
    pink: 'red' as const,
    green: 'green' as const,
    red: 'red' as const,
    silver: 'none' as const,
    gold: 'gold' as const,
  }[card.color || 'blue'];

  const handleDelete = async () => {
    if (window.confirm(`Dismantle card relic [${card.name}]? All transaction links will be disconnected.`)) {
      setDeleting(true);
      try {
        await deleteCreditCard(card.id);
      } catch (e) {
        console.error(e);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Card
      glowColor={neonGlowColor}
      clipCorners={true}
      className="flex flex-col relative min-h-[220px] shadow-lg"
    >
      
      {/* 1. Card Top HUD details */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 uppercase tracking-widest ${rarityColors}`}>
            {card.rarity} Relic
          </span>
          <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mt-2">
            {card.name}
          </h3>
        </div>
        
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1 rounded border border-slate-900 hover:border-neon-red bg-slate-950/20 hover:bg-neon-red/10 text-slate-600 hover:text-neon-red cursor-pointer transition-all duration-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Passive Buff / Debuff Overlay indicator */}
      <div className="mb-4">
        {isBuffActive && (
          <div className="py-1 px-2.5 bg-neon-green/10 border border-neon-green/30 rounded text-[9px] font-mono text-neon-green flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-neon-green" />
            <span>Buff: Discipline (Passive XP multiplier active)</span>
          </div>
        )}
        {isDebuffActive && (
          <div className="py-1 px-2.5 bg-neon-red/10 border border-neon-red/30 rounded text-[9px] font-mono text-neon-red flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-neon-red" />
            <span>Debuff: Debt Burn (No XP awarded on card expenses)</span>
          </div>
        )}
        {!isBuffActive && !isDebuffActive && (
          <div className="py-1 px-2.5 bg-slate-900/60 border border-slate-800 rounded text-[9px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Shield className="w-3 h-3 text-slate-500" />
            <span>System Status: Balanced Limit</span>
          </div>
        )}
      </div>

      {/* 3. Debt/Limit Details */}
      <div className="space-y-3 flex-grow">
        
        {/* Utilization Bar */}
        <ProgressBar
          value={card.balance}
          max={card.limit}
          color={isDebuffActive ? 'red' : isBuffActive ? 'green' : 'blue'}
          label="Limit Utilization"
          subLabel={`${utilization}% (${card.balance}g / ${card.limit}g)`}
          size="sm"
          glow={true}
        />

        {/* Closing details */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest pt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-600" />
            <span>Due: Day {card.dueDate}</span>
          </div>
          <div className="text-right">
            <span>Statement: Day {card.statementDate}</span>
          </div>
        </div>

      </div>

      {/* 4. Action statement payoff */}
      <div className="mt-4 pt-3 border-t border-slate-900">
        <Button
          variant="primary"
          size="sm"
          fullWidth={true}
          disabled={card.balance === 0}
          onClick={() => onPayClick(card)}
        >
          Discharge Statement
        </Button>
      </div>

    </Card>
  );
};
export default CreditCardItem;
