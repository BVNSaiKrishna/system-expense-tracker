import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNotification } from '../components/layout/NotificationSystem';
import { Swords, Sparkles, Shield, Skull, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShadowSoldier {
  key: string;
  name: string;
  role: string;
  cost: number;
  xpValue: number;
  levelOffset: number; // level difference relative to player level
  description: string;
  glowColor: 'blue' | 'purple' | 'red' | 'green' | 'gold';
  avatarColor: string;
}

export const Army: React.FC = () => {
  const { user, updateUserStats } = useAuth();
  const { addNotification } = useNotification();

  const userId = user?.uid || '';

  // Army state: loaded from local storage
  const [armyCounts, setArmyCounts] = useState<Record<string, number>>({
    igris: 0,
    tusk: 0,
    iron: 0,
    beru: 0,
  });

  const [extractingKey, setExtractingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(`rpg_army_${userId}`);
    if (saved) {
      setArmyCounts(JSON.parse(saved));
    }
  }, [userId]);

  if (!user) return null;

  const soldiers: ShadowSoldier[] = [
    {
      key: 'igris',
      name: 'Igris',
      role: 'Elite Knight Commander',
      cost: 1000,
      xpValue: 150,
      levelOffset: 0, // matches player level
      description: 'A crimson-armored knight of absolute loyalty and mastery of the blade.',
      glowColor: 'red',
      avatarColor: 'from-red-950 to-slate-900 border-neon-red text-neon-red',
    },
    {
      key: 'tusk',
      name: 'Tusk',
      role: 'High Orc Shaman',
      cost: 3000,
      xpValue: 400,
      levelOffset: -2,
      description: 'Master of gravitational magic and gargantuan enlargement spells.',
      glowColor: 'purple',
      avatarColor: 'from-purple-950 to-slate-900 border-neon-purple text-neon-purple',
    },
    {
      key: 'iron',
      name: 'Iron',
      role: 'Shield Vanguard Tank',
      cost: 5000,
      xpValue: 700,
      levelOffset: -4,
      description: 'A heavy armored tank class that taunts and crushes front line defenses.',
      glowColor: 'blue',
      avatarColor: 'from-blue-950 to-slate-900 border-neon-blue text-neon-blue',
    },
    {
      key: 'beru',
      name: 'Beru',
      role: 'Ant King Commander',
      cost: 15000,
      xpValue: 2000,
      levelOffset: 4, // higher level than player!
      description: 'The pinnacle of speed and combat power, capable of devouring skills.',
      glowColor: 'gold',
      avatarColor: 'from-amber-950 to-slate-900 border-neon-amber text-neon-amber',
    },
  ];

  const handleExtract = async (soldier: ShadowSoldier) => {
    if (user.currencyGold < soldier.cost) {
      addNotification({
        title: 'Extraction Denied',
        message: `Insufficient Gold! Need ${soldier.cost}g to extract this shadow.`,
        type: 'warning',
      });
      return;
    }

    setExtractingKey(soldier.key);

    // Simulate magic extraction delay (Arise theme!)
    setTimeout(async () => {
      try {
        // Deduct Gold and reward Summoner XP
        await updateUserStats(50, -soldier.cost);

        // Update counts
        const updatedCounts = {
          ...armyCounts,
          [soldier.key]: (armyCounts[soldier.key] || 0) + 1,
        };
        setArmyCounts(updatedCounts);
        localStorage.setItem(`rpg_army_${userId}`, JSON.stringify(updatedCounts));

        addNotification({
          title: 'ARISE!',
          message: `Successfully extracted shadow [${soldier.name}]. +50 XP!`,
          type: 'achievement',
          xpGained: 50,
        });
      } catch (e) {
        console.error('Failed to extract shadow:', e);
      } finally {
        setExtractingKey(null);
      }
    }, 1200);
  };

  const totalShadows = Object.values(armyCounts).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6 w-full relative">
      
      {/* 1. Header Control Hub */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-5 border border-slate-900 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block">
            Shadow Army summoning chamber
          </span>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1 flex items-center gap-2">
            <Swords className="w-5 h-5 text-neon-blue" />
            Monarch's Shadow Army
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 border border-slate-900 rounded font-mono text-xs text-neon-amber uppercase tracking-wider w-full md:w-auto justify-between">
          <span>SUMMONER GOLD:</span>
          <span className="font-extrabold text-glow-gold">{user.currencyGold.toLocaleString()}G</span>
        </div>
      </div>

      {/* 2. Total Shadows Overview Badge */}
      <Card glowColor="blue" clipCorners={true} className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-950 via-slate-950/40 to-slate-950">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-blue/10 border border-neon-blue/20 rounded-full flex items-center justify-center animate-pulse">
            <Skull className="w-8 h-8 text-neon-blue" />
          </div>
          <div className="text-center sm:text-left">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              ARMY CAPACITY STATUS
            </span>
            <h2 className="text-3xl font-display font-black text-white tracking-widest mt-0.5">
              {totalShadows.toLocaleString()} <span className="text-xs text-slate-400">SHADOW SOLDIERS</span>
            </h2>
          </div>
        </div>
        <div className="px-4 py-2 border border-slate-800 rounded bg-slate-950/80 font-mono text-[9px] text-slate-400 uppercase tracking-widest text-center">
          Active Monarch Class: <span className="text-neon-blue font-bold">Shadow Sovereign</span>
        </div>
      </Card>

      {/* 3. Shadow Soldiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {soldiers.map((soldier) => {
          const count = armyCounts[soldier.key] || 0;
          const isExtracting = extractingKey === soldier.key;
          const cardLevel = Math.max(1, user.level + soldier.levelOffset);

          return (
            <Card
              key={soldier.key}
              glowColor={soldier.glowColor}
              clipCorners={true}
              className="flex flex-col justify-between min-h-[340px]"
            >
              {/* Card top details */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-lg border-2 flex items-center justify-center bg-gradient-to-br ${soldier.avatarColor}`}>
                    <Skull className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Level</span>
                    <span className="text-sm font-display font-black text-white">{cardLevel}</span>
                  </div>
                </div>

                <h3 className="text-base font-display font-black text-white uppercase tracking-wider">
                  {soldier.name}
                </h3>
                <span className="text-[9px] font-mono text-neon-blue uppercase tracking-widest block mt-0.5">
                  {soldier.role}
                </span>

                <p className="text-[10px] text-slate-400 font-mono mt-3.5 leading-relaxed uppercase">
                  {soldier.description}
                </p>
              </div>

              {/* Quantity indicator & Button */}
              <div className="mt-6 pt-4 border-t border-slate-900 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <span>Squad Size:</span>
                  <span className="text-white font-bold text-sm text-glow-blue">{count} active</span>
                </div>

                <Button
                  variant={user.currencyGold >= soldier.cost ? 'primary' : 'secondary'}
                  size="sm"
                  fullWidth={true}
                  disabled={isExtracting}
                  onClick={() => handleExtract(soldier)}
                  className="relative overflow-hidden group font-mono text-[9px] tracking-widest"
                >
                  <AnimatePresence mode="wait">
                    {isExtracting ? (
                      <motion.span
                        key="extracting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 justify-center"
                      >
                        <Zap className="w-3.5 h-3.5 animate-spin text-neon-blue" />
                        ARISE...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 group-hover:animate-pulse" />
                        EXTRACT SHADOW ({soldier.cost}g)
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};
export default Army;
