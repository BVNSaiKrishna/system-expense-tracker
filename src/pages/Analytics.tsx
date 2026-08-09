import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Card } from '../components/ui/Card';
import { MonthFilterWidget } from '../components/dashboard/MonthFilterWidget';
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
  Line
} from 'recharts';
import { TrendingUp, CreditCard, Calendar, Zap } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { transactions } = useTransactions();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  // Format month label (e.g., "2026-07" -> "Jul 2026")
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthName = new Date(parseInt(yearStr), parseInt(monthStr) - 1).toLocaleString('default', { month: 'short' });
  const displayLabel = `${monthName} ${yearStr}`;

  // Filter transactions for the selected month
  const monthTxs = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthlyExpense = useMemo(() => {
    return monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTxs]);

  // 1. Group income vs expense by month (historical 6 months)
  const monthlyHistoryData = useMemo(() => {
    const dataMap: Record<string, { month: string; expense: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return; // only track expenses
      const dateObj = new Date(tx.date);
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

      if (!dataMap[key]) {
        dataMap[key] = { month: monthLabel, expense: 0 };
      }
      dataMap[key].expense += tx.amount;
    });

    return Object.keys(dataMap)
      .sort()
      .slice(-6)
      .map((k) => dataMap[k]);
  }, [transactions]);

  // 2. Group expenses by category for selected month
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    monthTxs
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        const cleanedCat = (tx.category || 'Other').replace(/\s*\(.*\)/, '').trim();
        catMap[cleanedCat] = (catMap[cleanedCat] || 0) + tx.amount;
      });

    return Object.keys(catMap).map((k) => ({
      name: k,
      value: catMap[k],
    })).sort((a, b) => b.value - a.value);
  }, [monthTxs]);

  // 3. Daily spending data for selected month
  const dailyData = useMemo(() => {
    const [yStr, mStr] = selectedMonth.split('-');
    const year = parseInt(yStr);
    const month = parseInt(mStr);
    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyMap: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = 0;
    }

    monthTxs
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        const dateDay = new Date(tx.date).getDate();
        if (dailyMap[dateDay] !== undefined) {
          dailyMap[dateDay] += tx.amount;
        }
      });

    return Object.keys(dailyMap).map((dStr) => {
      const day = parseInt(dStr);
      return {
        day: `${day}`,
        amount: dailyMap[day],
      };
    });
  }, [monthTxs, selectedMonth]);

  // Insightful Metrics
  const dailyAverage = useMemo(() => {
    return dailyData.length > 0 ? Math.round(monthlyExpense / dailyData.length) : 0;
  }, [monthlyExpense, dailyData]);

  const highestSpendDayObj = useMemo(() => {
    return dailyData.reduce((max, d) => d.amount > max.amount ? d : max, { day: '1', amount: 0 });
  }, [dailyData]);

  const creditCardSpend = useMemo(() => {
    return monthTxs
      .filter((t) => t.type === 'expense' && t.cardId)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTxs]);

  const cardSharePercent = useMemo(() => {
    return monthlyExpense > 0 ? Math.round((creditCardSpend / monthlyExpense) * 100) : 0;
  }, [creditCardSpend, monthlyExpense]);

  // Curated premium HSL matte palette
  const PIE_COLORS = ['#EF4444', '#FACC15', '#00C8FF', '#9D4EDD', '#22C55E', '#FB923C', '#38BDF8'];

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
          <span className="flex items-center gap-1.5 mt-2 text-[#EF4444] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            Spent: {data.value.toLocaleString()} G
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 w-full text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col justify-between items-start gap-1 bg-slate-950/40 p-4 border border-slate-900 rounded-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            System Analysis Terminal
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            Financial Analytics
          </h1>
        </div>
      </div>

      {/* Monthly Horizon Filter */}
      <MonthFilterWidget selectedMonth={selectedMonth} onChange={setSelectedMonth} />

      {/* 1. Daily Upkeep Trend Chart */}
      <Card glowColor="red" className="flex flex-col min-h-[300px] bg-white/5 border border-white/5 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.15)] backdrop-blur-xl">
        <div className="flex justify-between items-center pb-3.5 border-b border-white/5 mb-4 text-left">
          <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-red inline-block rounded-full animate-pulse" />
            Daily Upkeep Trend ({displayLabel})
          </h3>
        </div>

        {monthlyExpense === 0 ? (
          <div className="flex-grow flex items-center justify-center border border-dashed border-white/10 rounded-2xl py-12">
            <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">No expenses registered in selected month.</p>
          </div>
        ) : (
          <div className="flex-grow w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis
                  dataKey="day"
                  stroke="#475569"
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'sans-serif' }}
                />
                <YAxis
                  stroke="#475569"
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'sans-serif' }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  name="Upkeep"
                  type="monotone"
                  dataKey="amount"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ r: 2, strokeWidth: 0, fill: '#EF4444' }}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* 2. Category Distribution & Insight Panels */}
      <div className="space-y-6">
        
        {/* Category Breakdown */}
        <Card glowColor="none" className="flex flex-col min-h-[320px] bg-white/5 border border-white/5 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.15)] backdrop-blur-xl">
          <div className="flex justify-between items-center pb-3.5 border-b border-white/5 mb-4 text-left">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#00C8FF] inline-block rounded-full animate-pulse" />
              Upkeep Distribution ({displayLabel})
            </h3>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex-grow flex items-center justify-center border border-dashed border-white/10 rounded-2xl py-12">
              <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">No expenses to classify.</p>
            </div>
          ) : (
            <div className="flex-grow w-full flex flex-col justify-between">
              <div className="h-[160px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
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
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] font-sans font-semibold uppercase tracking-wider text-slate-400 max-h-[85px] overflow-y-auto px-2 pb-1 no-scrollbar mt-4">
                {categoryData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 truncate text-left">
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

        {/* Insight Panels */}
        <Card glowColor="none" className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.15)] backdrop-blur-xl">
          <div className="flex justify-between items-center pb-3.5 border-b border-white/5 mb-4 text-left">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-3 bg-neon-purple inline-block rounded-full animate-pulse" />
              Insight Dashboard ({displayLabel})
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            
            <div className="bg-slate-950/30 border border-white/5 p-3 rounded-xl">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                Daily Average
              </span>
              <p className="text-sm font-sans font-black text-white mt-1">
                {dailyAverage.toLocaleString()} <span className="text-[10px] text-slate-500">G/day</span>
              </p>
            </div>

            <div className="bg-slate-950/30 border border-white/5 p-3 rounded-xl">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FACC15]" />
                Highest Spend Day
              </span>
              <p className="text-sm font-sans font-black text-white mt-1">
                Day {highestSpendDayObj.day} <span className="text-[10px] text-slate-500">({highestSpendDayObj.amount.toLocaleString()}G)</span>
              </p>
            </div>

            <div className="bg-slate-950/30 border border-white/5 p-3 rounded-xl">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#00C8FF]" />
                Credit Card Share
              </span>
              <p className="text-sm font-sans font-black text-white mt-1">
                {cardSharePercent}% <span className="text-[10px] text-slate-500">of total</span>
              </p>
            </div>

            <div className="bg-slate-950/30 border border-white/5 p-3 rounded-xl">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Top Spend Group
              </span>
              <p className="text-xs font-sans font-black text-white mt-1.5 truncate uppercase">
                {categoryData[0]?.name || 'None'}
              </p>
            </div>

          </div>
        </Card>

      </div>

      {/* 3. Monthly Upkeep Timeline (Historical Bar Chart) */}
      <Card glowColor="none" className="flex flex-col min-h-[300px] bg-white/5 border border-white/5 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.15)] backdrop-blur-xl">
        <div className="flex justify-between items-center pb-3.5 border-b border-white/5 mb-4 text-left">
          <h3 className="text-xs font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-3 bg-neon-purple inline-block rounded-full animate-pulse" />
            Upkeep Comparison Timeline
          </h3>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            6-Month Overview
          </span>
        </div>

        {monthlyHistoryData.length === 0 ? (
          <div className="flex-grow flex items-center justify-center border border-dashed border-white/10 rounded-2xl py-12">
            <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">No historic data found.</p>
          </div>
        ) : (
          <div className="flex-grow w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="historyGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip content={<CustomChartTooltip />} />
                <Bar name="Upkeep (Expense)" dataKey="expense" fill="url(#historyGrad)" radius={[6, 6, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
