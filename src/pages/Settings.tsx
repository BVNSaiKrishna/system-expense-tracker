import React, { useState } from 'react';
import { useAuth, getRankName } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../services/dbService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Sun,
  Moon,
  Sparkles,
  User,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Database,
  ArrowUpCircle,
} from 'lucide-react';
import { isFirebaseConfigured } from '../config/firebase';

export const Settings: React.FC = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();

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
      setErrorMsg('Player tag must not be empty.');
      return;
    }

    setSubmitting(true);
    try {
      // Save updated user profile
      const updatedProfile = { 
        ...user, 
        displayName: displayName.trim(),
        currencyGold: Number(currencyGold),
        level: Number(level),
        xp: Number(xp),
        rankName: getRankName(Number(level))
      };
      await updateUserProfile(updatedProfile);
      setSuccessMsg('Character profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            System configuration terminal
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1">
            System Settings
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card & Sync status */}
        <div className="space-y-6 md:col-span-1">
          <Card glowColor="none" className="p-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-neon-blue/15 border border-neon-blue flex items-center justify-center text-neon-blue text-lg font-display font-black shadow-md">
              {user.displayName.substring(0, 2).toUpperCase()}
            </div>
            
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mt-4">
              {user.displayName}
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
              Rank: {user.rankName}
            </span>

            <div className="h-px bg-slate-900 w-full my-4" />

            <div className="w-full text-left space-y-2 text-[10px] font-mono text-slate-400 uppercase">
              <div className="flex justify-between">
                <span>Access Level:</span>
                <span className="text-white">LVL {user.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Loot Gold:</span>
                <span className="text-neon-amber font-bold">{user.currencyGold.toLocaleString()}G</span>
              </div>
              <div className="flex justify-between">
                <span>Streak Day:</span>
                <span className="text-neon-amber font-bold">{user.streak} DAYS</span>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              fullWidth={true}
              onClick={logout}
              className="mt-6"
            >
              Terminate Session
            </Button>
          </Card>
        </div>

        {/* Right Column: Configuration panels */}
        <div className="space-y-6 md:col-span-2">
          
          {/* 1. Theme Configuration panel */}
          <Card glowColor="none" className="p-5">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest pb-3 border-b border-slate-900 mb-4">
              Theme Interface Signature
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-neon-amber bg-neon-amber/5 text-neon-amber shadow-md'
                    : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-[10px] font-display font-bold uppercase tracking-wider">Luminous (Light)</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-neon-purple bg-neon-purple/5 text-neon-purple shadow-md'
                    : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-[10px] font-display font-bold uppercase tracking-wider">Obscure (Dark)</span>
              </button>

              <button
                onClick={() => setTheme('system-rpg')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all cursor-pointer ${
                  theme === 'system-rpg'
                    ? 'border-neon-blue bg-neon-blue/5 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-display font-bold uppercase tracking-wider">Holo RPG (System)</span>
              </button>

            </div>
          </Card>

          {/* 2. Character customization profile form */}
          <Card glowColor="none" className="p-5">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest pb-3 border-b border-slate-900 mb-4">
              Character Profile registry
            </h3>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              {successMsg && (
                <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded text-neon-green text-xs font-mono uppercase">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded text-neon-red text-xs font-mono uppercase">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Character Tag (Display Name)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neon-blue"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Vault Gold (Recalibration)
                </label>
                <input
                  type="number"
                  value={currencyGold}
                  onChange={(e) => setCurrencyGold(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neon-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                    Character Level (Recalibration)
                  </label>
                  <input
                    type="number"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neon-blue"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                    Experience XP (Recalibration)
                  </label>
                  <input
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neon-blue"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  glow={true}
                  disabled={submitting}
                >
                  {submitting ? 'Updating Registry...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* 3. Database synchronization parameters info */}
          <Card glowColor="none" className="p-5">
            <h3 className="text-xs font-display font-black text-white uppercase tracking-widest pb-3 border-b border-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-neon-blue" />
              Sync Ledger parameters
            </h3>
            
            <div className="space-y-4 text-xs font-mono uppercase text-slate-400 leading-relaxed">
              <div className="flex items-start gap-3 p-3.5 bg-slate-950/40 border border-slate-900 rounded">
                {user.isGuest ? (
                  <>
                    <ShieldAlert className="w-5 h-5 text-neon-amber mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <span className="text-[10px] text-neon-amber font-bold block mb-1">Guest Session Registry</span>
                      Your records are strictly cached inside this browser storage. Log out or clear browser cache, and all inventory data will be lost. To secure your data, re-authenticate with a Firebase Cloud credential to sync automatically.
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-neon-green font-bold block mb-1">Cloud Sync Activated</span>
                      Your profile logs are securely synchronized with Cloud Firestore database records. Real-time multi-device cloud replication and offline access caches are operational.
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
