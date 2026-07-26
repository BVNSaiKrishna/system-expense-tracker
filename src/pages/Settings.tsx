import React, { useState } from 'react';
import { useAuth, getRankName } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Database,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, setTheme, animationsEnabled, setAnimationsEnabled } = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currencyGold, setCurrencyGold] = useState(user?.currencyGold || 0);
  const [level, setLevel] = useState(user?.level || 1);
  const [xp, setXp] = useState(user?.xp || 0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!displayName.trim()) {
      setErrorMsg('Display name must not be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedProfile = { 
        ...user, 
        displayName: displayName.trim(),
        currencyGold: Number(currencyGold),
        level: Number(level),
        xp: Number(xp),
        rankName: getRankName(Number(level))
      };
      await updateUserProfile(updatedProfile);
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 text-left">
        <div>
          <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
            System Config Terminal
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Settings
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        
        {/* Left Column: Profile Card & Sync status */}
        <div className="space-y-6 md:col-span-1">
          <Card glowColor="none" className="p-6 bg-white/5 border border-white/5 rounded-2xl shadow-md backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#00C8FF] text-lg font-bold shadow-sm">
              {user.displayName.substring(0, 2).toUpperCase()}
            </div>
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mt-4">
              {user.displayName}
            </h3>
            <span className="text-[9px] font-sans font-semibold text-slate-500 uppercase tracking-wider mt-1">
              {user.rankName}
            </span>

            <div className="h-px bg-white/5 w-full my-4" />

            <div className="w-full space-y-2 text-[10px] font-mono text-slate-400 uppercase">
              <div className="flex justify-between">
                <span>Access Level:</span>
                <span className="text-white">LVL {user.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Gold Balance:</span>
                <span className="text-[#FACC15] font-bold">{user.currencyGold.toLocaleString()} G</span>
              </div>
              <div className="flex justify-between">
                <span>Session Streak:</span>
                <span className="text-[#22C55E] font-bold">{user.streak} DAYS</span>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              fullWidth={true}
              onClick={logout}
              className="mt-6 rounded-xl py-2.5 font-sans font-bold uppercase text-[10px] tracking-wider"
            >
              Sign Out
            </Button>
          </Card>
        </div>

        {/* Right Column: Configuration panels */}
        <div className="space-y-6 md:col-span-2">
          
          {/* 1. Theme Configuration panel */}
          <Card glowColor="none" className="p-6 bg-white/5 border border-white/5 rounded-2xl shadow-md backdrop-blur-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3.5 border-b border-white/5 mb-4">
              Interface Styling
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15]'
                    : 'border-white/5 bg-white/2 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Light Mode</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-[#9d4edd] bg-[#9d4edd]/10 text-[#9d4edd]'
                    : 'border-white/5 bg-white/2 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme('system-rpg')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all cursor-pointer ${
                  theme === 'system-rpg'
                    ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                    : 'border-white/5 bg-white/2 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider">Glassmorphism</span>
              </button>

            </div>

            {/* GPU Animations Switcher */}
            <div className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-xl mt-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  GPU Acceleration Effects
                </h4>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">
                  Toggle dynamic wallpaper, particles, and float motion
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer flex items-center ${
                  animationsEnabled ? 'bg-[#00C8FF]' : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-slate-950 transition-transform duration-300 ${
                    animationsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* 2. Profile Customization Form */}
          <Card glowColor="none" className="p-6 bg-white/5 border border-white/5 rounded-2xl shadow-md backdrop-blur-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3.5 border-b border-white/5 mb-4">
              User Profile Settings
            </h3>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Gold Balance
                </label>
                <input
                  type="number"
                  value={currencyGold}
                  onChange={(e) => setCurrencyGold(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    User Level
                  </label>
                  <input
                    type="number"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    XP Progress
                  </label>
                  <input
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  glow={false}
                  disabled={submitting}
                  className="rounded-xl px-6 py-2.5 font-sans font-bold uppercase text-[10px] tracking-wider"
                >
                  {submitting ? 'Saving Profile...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* 3. Database synchronization parameters info */}
          <Card glowColor="none" className="p-6 bg-white/5 border border-white/5 rounded-2xl shadow-md backdrop-blur-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3.5 border-b border-white/5 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-neon-blue" />
              Database Sync Status
            </h3>
            
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start gap-3 p-3.5 bg-white/2 border border-white/5 rounded-xl">
                {user.isGuest ? (
                  <>
                    <ShieldAlert className="w-5 h-5 text-[#FACC15] mt-0.5 flex-shrink-0 animate-pulse" />
                    <div className="font-sans font-medium text-[10px] text-slate-400 text-left">
                      <span className="text-[#FACC15] font-bold block mb-1">Local Browser Session</span>
                      Your records are stored locally inside this browser. Signing out or clearing browser cookies will delete all your financial data. To back up your data, link your profile to a Firebase account.
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                    <div className="font-sans font-medium text-[10px] text-slate-400 text-left">
                      <span className="text-[#22C55E] font-bold block mb-1">Cloud Synced Profile</span>
                      Your records are synchronized in real-time with Cloud Firestore. Your balance, quests, achievements, and transaction history are safe and access-replicated across devices.
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default Settings;
