import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Wave {
  id: string;
  color: string;
}

export const EnergyWave: React.FC = () => {
  const [waves, setWaves] = useState<Wave[]>([]);

  useEffect(() => {
    const triggerWave = (color = 'rgba(0, 240, 255, 0.7)') => {
      const id = Math.random().toString(36).substring(2, 9);
      setWaves((prev) => [...prev, { id, color }]);
      
      // Auto cleanup after animation ends
      setTimeout(() => {
        setWaves((prev) => prev.filter((w) => w.id !== id));
      }, 1500);
    };

    const handleLevelUp = () => triggerWave('rgba(57, 255, 20, 0.8)'); // Neon Green for level ups
    const handleTxLogged = () => triggerWave('rgba(0, 240, 255, 0.6)'); // Neon Cyan for transactions
    const handleQuestCompleted = () => triggerWave('rgba(255, 183, 3, 0.8)'); // Gold for goals
    const handleSettingsSaved = () => triggerWave('rgba(157, 78, 221, 0.6)'); // Purple for settings
    const handleAchievement = () => triggerWave('rgba(255, 183, 3, 0.9)'); // Gold for achievements

    // Listen to custom window events
    window.addEventListener('rpg-level-up', handleLevelUp);
    window.addEventListener('rpg-operation-logged', handleTxLogged);
    window.addEventListener('rpg-quest-completed', handleQuestCompleted);
    window.addEventListener('rpg-settings-saved', handleSettingsSaved);
    window.addEventListener('rpg-achievement-unlocked', handleAchievement);

    return () => {
      window.removeEventListener('rpg-level-up', handleLevelUp);
      window.removeEventListener('rpg-operation-logged', handleTxLogged);
      window.removeEventListener('rpg-quest-completed', handleQuestCompleted);
      window.removeEventListener('rpg-settings-saved', handleSettingsSaved);
      window.removeEventListener('rpg-achievement-unlocked', handleAchievement);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[9999] overflow-hidden flex items-center justify-center">
      <AnimatePresence>
        {waves.map((w) => (
          <motion.div
            key={w.id}
            initial={{ scale: 0, opacity: 0.8, borderWidth: 8 }}
            animate={{
              scale: 3,
              opacity: 0,
              borderWidth: 1,
              transition: { duration: 1.2, ease: 'easeOut' },
            }}
            exit={{ opacity: 0 }}
            className="absolute rounded-full w-[45vw] h-[45vw] border-solid"
            style={{
              borderColor: w.color,
              boxShadow: `0 0 30px ${w.color}, inset 0 0 20px ${w.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
export default EnergyWave;
