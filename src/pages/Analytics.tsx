import React from 'react';
import { FinancialCharts } from '../components/analytics/FinancialCharts';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            System analysis terminal
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Financial Analytics
          </h1>
        </div>
      </div>

      {/* Render Recharts Grid */}
      <FinancialCharts />
    </div>
  );
};
export default Analytics;
