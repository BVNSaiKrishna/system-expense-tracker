import React from 'react';
import { useCreditCards } from '../../hooks/useCreditCards';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { AlertCircle, Sparkles, Activity, ShieldAlert } from 'lucide-react';

export const CreditUtilizationWidget: React.FC = () => {
  const { creditCards } = useCreditCards();

  if (creditCards.length === 0) return null;

  // Calculate totals
  const totalLimit = creditCards.reduce((sum, c) => sum + c.limit, 0);
  const totalBalance = creditCards.reduce((sum, c) => sum + c.balance, 0);
  const aggregateUtilization = Math.round((totalBalance / totalLimit) * 100) || 0;

  const isBuffActive = aggregateUtilization < 30;
  const isDebuffActive = aggregateUtilization > 50;

  // Visual classes based on debt level
  const statusColor = isDebuffActive ? ('red' as const) : isBuffActive ? ('green' as const) : ('amber' as const);
  const statusTextGlow = isDebuffActive
    ? 'text-neon-red text-glow-red'
    : isBuffActive
    ? 'text-neon-green text-glow-green'
    : 'text-neon-amber text-glow-gold';

  return (
    <Card
      glowColor={statusColor === 'amber' ? 'gold' : statusColor}
      clipCorners={true}
      className="flex flex-col relative"
    >
      <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
        <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isDebuffActive ? 'text-neon-red animate-pulse' : 'text-neon-blue'}`} />
          Registry Credit Index
        </h3>
        <span className="text-[9px] font-mono text-slate-500 uppercase">
          Aggregate parameters
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Big Radial/Digital Stat */}
        <div className="md:border-r border-slate-900 pr-0 md:pr-6 text-center md:text-left flex flex-col justify-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            Overall utilization
          </span>
          <span className={`text-4xl font-display font-black tracking-wide mt-1 block ${statusTextGlow}`}>
            {aggregateUtilization}%
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase block">
            Owed: {totalBalance.toLocaleString()}g / Limit: {totalLimit.toLocaleString()}g
          </span>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-grow">
          <ProgressBar
            value={totalBalance}
            max={totalLimit}
            color={statusColor}
            size="md"
            glow={true}
          />
        </div>

        {/* Right: Active Aura System message */}
        <div className="flex flex-col gap-2 pl-0 md:pl-4">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            Aura status logs
          </span>
          {isBuffActive && (
            <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-display font-bold text-neon-green uppercase leading-none">
                  Aura: Discipline
                </h4>
                <p className="text-[9px] text-slate-300 mt-1 leading-normal uppercase font-mono">
                  Credit load under 30%. Yields +5% bonus experience points on logs.
                </p>
              </div>
            </div>
          )}

          {isDebuffActive && (
            <div className="p-3 bg-neon-red/10 border border-neon-red/20 rounded flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-neon-red flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-[10px] font-display font-bold text-neon-red uppercase leading-none">
                  Aura: Debt Burn
                </h4>
                <p className="text-[9px] text-slate-300 mt-1 leading-normal uppercase font-mono">
                  Credit load exceeded 50%. XP collection disabled on card charges. Discharge statements to purge.
                </p>
              </div>
            </div>
          )}

          {!isBuffActive && !isDebuffActive && (
            <div className="p-3 bg-neon-amber/10 border border-neon-amber/20 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-neon-amber flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-display font-bold text-neon-amber uppercase leading-none">
                  Aura: Unstable Cap
                </h4>
                <p className="text-[9px] text-slate-300 mt-1 leading-normal uppercase font-mono">
                  Credit utilization between 30% - 50%. Maintain stability to avoid debuff penalties.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
export default CreditUtilizationWidget;
