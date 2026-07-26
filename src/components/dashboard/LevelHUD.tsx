import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '../ui/ProgressBar';
import { Camera, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { motion, useReducedMotion } from 'framer-motion';

const AVATAR_PRESETS = [
  {
    name: 'Default Vector',
    url: '',
    desc: 'Procedural character silhouette.'
  },
  {
    name: 'Shadow Sovereign',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    desc: 'Dark sovereign portrait.'
  },
  {
    name: 'Crimson Knight',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80',
    desc: 'Crimson plate armor.'
  },
  {
    name: 'Mana Crystal',
    url: 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=150&auto=format&fit=crop&q=80',
    desc: 'Crystalline energy source.'
  }
];

export const LevelHUD: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [photoURLInput, setPhotoURLInput] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [greeting, setGreeting] = useState('Good Evening');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good Morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };
    updateGreeting();
  }, []);

  if (!user) return null;

  const xpNeeded = user.level * 150;
  const xpPercentage = Math.round((user.xp / xpNeeded) * 100);

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      await updateUserProfile({
        ...user,
        photoURL: photoURLInput.trim(),
      });
      setShowAvatarModal(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update portrait.');
    } finally {
      setSaving(false);
    }
  };

  const cardContent = (
    <div className="flex flex-col gap-6 relative z-10 text-left">
      {/* Specular Swipe Glare Effect */}
      {!prefersReducedMotion && (
        <motion.div
          animate={{ x: ['-100%', '220%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
        />
      )}

      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] uppercase block">
            System Operating Profile
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
            {greeting}, <span className="text-white font-extrabold">{user.displayName}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[9px] font-sans font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Level {user.level}
            </span>
            <span className="text-[9px] font-sans font-bold text-[#00C8FF] bg-[#00C8FF]/10 border border-[#00C8FF]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {user.rankName}
            </span>
          </div>
        </div>

        {/* Clickable Profile Avatar Frame */}
        <button
          onClick={() => {
            setPhotoURLInput(user.photoURL || '');
            setShowAvatarModal(true);
          }}
          className="group w-14 h-14 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center relative overflow-hidden cursor-pointer focus:outline-none transition-transform active:scale-95 flex-shrink-0"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <SoloLevelingAvatar level={user.level} />
          )}
          
          <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[7px] font-mono text-[#00C8FF] uppercase tracking-widest transition-opacity duration-200">
            <Camera className="w-3 h-3 mb-0.5" />
            Edit
          </div>
        </button>
      </div>



      {/* Bottom XP Progress Row */}
      <div className="border-t border-white/5 pt-4">
        <ProgressBar
          value={user.xp}
          max={xpNeeded}
          color="blue"
          label="Experience Progress"
          subLabel={`${user.xp} / ${xpNeeded} XP (${xpPercentage}%)`}
          size="xs"
          glow={false}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full flex justify-center py-6">
      {/* Floating bobbing glass card */}
      {!prefersReducedMotion ? (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="glass-panel w-full max-w-2xl border border-white/10 rounded-[28px] p-6 md:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        >
          {cardContent}
        </motion.div>
      ) : (
        <div className="glass-panel w-full max-w-2xl border border-white/10 rounded-[28px] p-6 md:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          {cardContent}
        </div>
      )}

      {/* Avatar Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Summon Profile Portrait"
        glowColor="blue"
      >
        <form onSubmit={handleSaveAvatar} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded text-neon-red text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
              Custom Image URL
            </label>
            <input
              type="url"
              value={photoURLInput}
              onChange={(e) => setPhotoURLInput(e.target.value)}
              placeholder="e.g. https://domain.com/avatar.jpg"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
            />
          </div>

          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
              Select Preset Avatar
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {AVATAR_PRESETS.map((preset) => {
                const isActive = photoURLInput === preset.url;
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => setPhotoURLInput(preset.url)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'border-[#00C8FF] bg-[#00C8FF]/10 text-[#00C8FF]'
                        : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider block">
                      {preset.name}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wide block mt-1 leading-snug">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAvatarModal(false)}
              className="flex-grow uppercase font-sans text-[10px] tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex-grow uppercase font-sans text-[10px] tracking-wider"
            >
              {saving ? 'Summoning...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

interface SoloLevelingAvatarProps {
  level: number;
  className?: string;
}

export const SoloLevelingAvatar: React.FC<SoloLevelingAvatarProps> = ({ level, className = "w-full h-full" }) => {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`avatarGrad-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#avatarGrad-${level})`} />
      <path d="M 15,92 C 18,72 30,62 50,62 C 70,62 82,72 85,92 Z" fill="#030712" />
      <path d="M 50,34 C 41,34 39,43 41,50 C 39,52 42,56 44,58 C 45,60 48,62 50,62 C 52,62 55,60 56,58 C 58,56 61,52 59,50 C 61,43 59,34 50,34" fill="#030712" />
      <path d="M 40,36 L 43,26 L 46,30 L 50,22 L 54,30 L 57,26 L 60,36 L 56,40 L 50,37 L 44,40 Z" fill="#030712" />
      <ellipse cx="44" cy="47" rx="3.5" ry="1.2" fill="#00C8FF" />
      <ellipse cx="56" cy="47" rx="3.5" ry="1.2" fill="#00C8FF" />
    </svg>
  );
};

export default LevelHUD;
