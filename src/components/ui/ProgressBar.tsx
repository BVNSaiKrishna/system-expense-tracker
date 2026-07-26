import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'red';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
  subLabel?: string;
  glow?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'blue',
  size = 'md',
  label,
  subLabel,
  glow = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  }[size];

  const bgColors = {
    blue: 'bg-gradient-to-r from-cyan-600 to-neon-blue',
    purple: 'bg-gradient-to-r from-indigo-600 to-neon-purple',
    green: 'bg-gradient-to-r from-emerald-600 to-neon-green',
    amber: 'bg-gradient-to-r from-yellow-600 to-neon-amber',
    red: 'bg-gradient-to-r from-rose-600 to-neon-red',
  }[color];

  const glowStyles = glow
    ? {
        blue: 'shadow-[0_0_8px_rgba(0,240,255,0.5)]',
        purple: 'shadow-[0_0_8px_rgba(157,78,221,0.5)]',
        green: 'shadow-[0_0_8px_rgba(57,255,20,0.5)]',
        amber: 'shadow-[0_0_8px_rgba(255,183,3,0.5)]',
        red: 'shadow-[0_0_8px_rgba(255,60,0,0.5)]',
      }[color]
    : '';

  return (
    <div className="w-full">
      {/* Top Labels */}
      {(label || subLabel) && (
        <div className="flex justify-between items-end mb-1 text-[11px] font-mono tracking-wider font-semibold text-slate-300">
          <span className="uppercase">{label}</span>
          <span className="text-slate-400">{subLabel}</span>
        </div>
      )}

      {/* Progress Track */}
      <div className={`w-full bg-slate-900 border border-slate-800 rounded-sm overflow-hidden p-0.5 ${heightClasses}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-sm ${bgColors} ${glowStyles}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
export default ProgressBar;
