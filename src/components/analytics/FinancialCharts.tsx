import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { Card } from '../ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const FinancialCharts: React.FC = () => {
  const { transactions } = useTransactions();

  // 1. Group income vs expense by month
  const getMonthlyData = () => {
    const dataMap: Record<string, { month: string; income: number; expense: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    transactions.forEach((tx) => {
      const dateObj = new Date(tx.date);
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

      if (!dataMap[key]) {
        dataMap[key] = { month: monthLabel, income: 0, expense: 0 };
      }

      if (tx.type === 'income') {
        dataMap[key].income += tx.amount;
      } else {
        dataMap[key].expense += tx.amount;
      }
    });

    // Return sorted monthly list (last 6 months)
    return Object.keys(dataMap)
      .sort()
      .slice(-6)
      .map((k) => dataMap[k]);
  };

  // 2. Group expenses by category
  const getCategoryData = () => {
    const catMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      });

    return Object.keys(catMap).map((k) => ({
      name: k.replace(/\s*\(.*\)/, ''), // Strip parenthesis details for clean chart labelling
      value: catMap[k],
    }));
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  // Curated premium HSL-derived matte palette
  const PIE_COLORS = ['#00C8FF', '#9d4edd', '#FACC15', '#EF4444', '#22C55E', '#FB923C', '#38BDF8'];

  // Custom tooltips to match Glassmorphism theme
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-sans text-xs text-slate-300 select-none text-left">
          <span className="text-white block font-bold mb-2 border-b border-white/5 pb-1">{label}</span>
          {payload.map((p: any, idx: number) => (
            <span key={idx} className="flex items-center gap-1.5 mt-1 font-semibold" style={{ color: p.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}: {p.value.toLocaleString()} G
            </span>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-sans text-xs text-slate-300 select-none text-left">
          <span className="text-white block font-bold border-b border-white/5 pb-1">{data.name}</span>
          <span className="flex items-center gap-1.5 mt-2 text-[#00C8FF] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF]" />
            Expenses: {data.value.toLocaleString()} G
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Monthly Timeline: 2 cols */}
      <Card glowColor="none" className="lg:col-span-2 flex flex-col min-h-[350px] bg-white/5 border border-white/5 rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)] backdrop-blur-xl">
        <div className="flex justify-between items-center pb-3.5 border-b border-white/5 mb-4 text-left">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-blue inline-block rounded-full animate-pulse" />
            Loot vs Upkeep Timeline
          </h3>
          <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
            6-Month History
          </span>
        </div>

        {monthlyData.length === 0 ? (
          <div className="flex-grow flex items-center justify-center border border-dashed border-white/10 rounded-2xl py-12">
            <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">Insufficient transaction data to graph.</p>
          </div>
        ) : (
          <div className="flex-grow w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis
                  dataKey="month"
                  stroke="#475569"
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'sans-serif' }}
                />
                <YAxis
                  stroke="#475569"
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'sans-serif' }}
                />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                <Legend
                  wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif', color: '#94A3B8', paddingTop: 12 }}
                  verticalAlign="bottom"
                  height={36}
                />
                <Bar name="Loot (Income)" dataKey="income" fill="url(#incomeGrad)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar name="Upkeep (Expense)" dataKey="expense" fill="url(#expenseGrad)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Category distribution: 1 col */}
      <Card glowColor="none" className="flex flex-col min-h-[350px] bg-white/5 border border-white/5 rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.15)] backdrop-blur-xl">
        <div className="flex justify-between items-center pb-3.5 border-b border-white/5 mb-4 text-left">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-purple inline-block rounded-full animate-pulse" />
            Upkeep Distribution
          </h3>
          <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
            Categorized
          </span>
        </div>

        {categoryData.length === 0 ? (
          <div className="flex-grow flex items-center justify-center border border-dashed border-white/10 rounded-2xl py-12">
            <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">No expenses found to chart.</p>
          </div>
        ) : (
          <div className="flex-grow w-full h-[280px] flex flex-col justify-between">
            <div className="h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom visual legend mapping */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-400 max-h-[85px] overflow-y-auto px-2 pb-1 no-scrollbar">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 truncate text-left">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

    </div>
  );
};

export default FinancialCharts;
