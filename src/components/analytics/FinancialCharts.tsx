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
  LineChart,
  Line,
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

  // Cyberpunk colors for pie chart segments
  const PIE_COLORS = ['#00f0ff', '#9d4edd', '#ffb703', '#ff3c00', '#39ff14', '#e2e8f0', '#00e5ff'];

  // Custom tooltips to match RPG Glassmorphism HUD theme
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded shadow-md font-mono text-[10px] tracking-widest text-slate-300 uppercase select-none">
          <span className="text-white block font-bold mb-1 border-b border-slate-900 pb-1">{label}</span>
          {payload.map((p: any, idx: number) => (
            <span key={idx} className="block mt-0.5" style={{ color: p.color }}>
              {p.name}: {p.value.toLocaleString()}G
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
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded shadow-md font-mono text-[10px] tracking-widest text-slate-300 uppercase select-none">
          <span className="text-white block font-bold border-b border-slate-900 pb-1">{data.name}</span>
          <span className="block mt-1 text-neon-blue">
            Expenses: {data.value.toLocaleString()}G
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Monthly Timeline: 2 cols */}
      <Card glowColor="none" className="lg:col-span-2 flex flex-col min-h-[350px]">
        <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
          <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-blue inline-block animate-pulse" />
            Loot vs Upkeep Timeline
          </h3>
          <span className="text-[9px] font-mono text-slate-500 uppercase">
            6-Month parameters
          </span>
        </div>

        {monthlyData.length === 0 ? (
          <div className="flex-grow flex items-center justify-center border border-dashed border-slate-900 rounded-lg py-12">
            <p className="text-xs font-mono text-slate-500 uppercase">Insufficient transaction data to graph.</p>
          </div>
        ) : (
          <div className="flex-grow w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fontSize: 9, fontFamily: 'Share Tech Mono' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fontSize: 9, fontFamily: 'Share Tech Mono' }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 9, fontFamily: 'Orbitron', paddingTop: 10 }}
                  verticalAlign="bottom"
                  height={36}
                />
                <Bar name="Loot (Income)" dataKey="income" fill="#39ff14" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar name="Upkeep (Expense)" dataKey="expense" fill="#ff3c00" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Category distribution: 1 col */}
      <Card glowColor="none" className="flex flex-col min-h-[350px]">
        <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4">
          <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-purple inline-block animate-pulse" />
            Upkeep Distribution
          </h3>
          <span className="text-[9px] font-mono text-slate-500 uppercase">
            Categorized
          </span>
        </div>

        {categoryData.length === 0 ? (
          <div className="flex-grow flex items-center justify-center border border-dashed border-slate-900 rounded-lg py-12">
            <p className="text-xs font-mono text-slate-500 uppercase">No expenses found to chart.</p>
          </div>
        ) : (
          <div className="flex-grow w-full h-[280px] flex flex-col justify-between">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom visual legend mapping */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 max-h-[80px] overflow-y-auto px-2">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
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
