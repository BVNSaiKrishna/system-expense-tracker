import React from 'react';
import { motion } from 'framer-motion';
import soloLevelingBg from '../../assets/solo_leveling_bg.jpg';

export const LevelHUD: React.FC = () => {
  return (
    <div className="w-full flex justify-center py-4">
      {/* Bobbing Solo Leveling Premium Hero Graphic Banner */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full max-w-2xl h-44 md:h-52 border border-[#00C8FF]/20 rounded-[24px] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_30px_rgba(0,200,255,0.1)]"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(9, 11, 18, 0.05), rgba(9, 11, 18, 0.4)), url(${soloLevelingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      />
    </div>
  );
};

export default LevelHUD;
