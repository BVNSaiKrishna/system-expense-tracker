import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Flame, Sparkles } from 'lucide-react';

export const StreakWidget: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Generate days of the week for streak tracking (last 7 days leading up to today)
  const getStreakDays = () => {
    const days = [];
    const dateNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isToday = i === 0;
      
      // Simulating previous days checked based on streak length
      // If today is active and streak >= i + 1, it's checked.
      const isChecked = user.streak > i;

      days.push({
        name: dateNames[d.getDay()],
        isToday,
        isChecked,
        dateNum: d.getDate(),
      });
    }
    return days;
  };

  const streakDays = getStreakDays();

  // Dynamic colors for flame based on streak count
  const getFlameColor = () => {
    if (user.streak < 3) return 'text-neon-amber shadow-[0_0_10px_rgba(255,183,3,0.3)]';
    if (user.streak < 7) return 'text-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse';
    return 'text-neon-red shadow-[0_0_30px_rgba(255,60,0,0.8)] animate-bounce';
  };

  return (
    <Card
      glowColor={user.streak >= 7 ? 'red' : user.streak >= 3 ? 'gold' : 'none'}
      clipCorners={true}
      className="flex flex-col relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
        
        {/* Flame Mascot */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center relative ${getFlameColor()}`}>
            <Flame className="w-8 h-8" />
            {user.streak >= 7 && (
              <Sparkles className="w-4 h-4 text-neon-amber absolute -top-1 -right-1 animate-spin" />
            )}
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-display font-black text-white uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
              Daily Streak
            </h3>
            <span className="text-3xl font-display font-black text-neon-amber text-glow-gold">
              {user.streak} DAYS
            </span>
            <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5 tracking-wider">
              {user.streak >= 7 ? 'Flame Ascended! +15% XP Buff Active' : 'Keep logging expenses to maintain streak'}
            </p>
          </div>
        </div>

        {/* 7-Day Timeline GRID */}
        <div className="flex items-center gap-2 md:gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-900 w-full sm:w-auto overflow-x-auto justify-between">
          {streakDays.map((day, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center p-1.5 w-9 min-w-9 border rounded transition-all duration-300 ${
                day.isToday
                  ? 'border-neon-blue bg-neon-blue/10'
                  : day.isChecked
                  ? 'border-neon-green/30 bg-neon-green/5'
                  : 'border-slate-800 bg-slate-900/30'
              }`}
            >
              <span className="text-[8px] font-mono text-slate-400 uppercase">{day.name}</span>
              <span
                className={`text-xs font-display font-bold mt-1 ${
                  day.isToday
                    ? 'text-neon-blue'
                    : day.isChecked
                    ? 'text-neon-green'
                    : 'text-slate-600'
                }`}
              >
                {day.dateNum}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  day.isChecked ? 'bg-neon-green shadow-[0_0_5px_rgba(57,255,20,0.8)]' : 'bg-slate-800'
                }`}
              />
            </div>
          ))}
        </div>

      </div>
    </Card>
  );
};
export default StreakWidget;
