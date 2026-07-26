import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'gold' | 'none';
  clipCorners?: boolean;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  glowColor = 'none',
  clipCorners = true,
  className = '',
  animate = true,
  onClick,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const glowClasses = {
    none: 'border-slate-800/80',
    blue: 'hologram-glow-blue card-energy-border',
    purple: 'hologram-glow-purple card-energy-border',
    green: 'hologram-glow-green card-energy-border',
    red: 'hologram-glow-red card-energy-border',
    gold: 'hologram-glow-gold card-energy-border',
  }[glowColor];

  // Brackets that project neon light out of corners
  const CornerBrackets = () => (
    <>
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neon-blue/60 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neon-blue/60 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neon-blue/60 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neon-blue/60 pointer-events-none z-10" />
    </>
  );

  const baseClasses = `glass-panel border p-5 relative overflow-hidden transition-all duration-300 glare-container ${
    clipCorners ? 'clip-hud-corners' : 'rounded-xl'
  } ${onClick ? 'cursor-pointer' : ''} ${className}`;

  const content = (
    <>
      {clipCorners && <CornerBrackets />}
      
      {/* Glare Reflection Swipe sweep */}
      {!prefersReducedMotion && <div className="glare-swipe absolute inset-0 pointer-events-none" />}
      
      {/* Hologram backing */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent pointer-events-none -z-10" />
      {children}
    </>
  );

  // If animations are active, we introduce a continuous slow vertical float
  if (animate && !prefersReducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: 1,
          y: [0, -3, 0], // slow breath/float bobbing
        }}
        transition={{
          opacity: { duration: 0.4, ease: 'easeOut' },
          y: {
            duration: 5 + Math.random() * 2, // stagger floating rates slightly
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        whileHover={onClick ? { scale: 1.01, z: 10 } : { y: -5 }}
        onClick={onClick}
        className={`${baseClasses} ${glowClasses}`}
      >
        {content}
      </motion.div>
    );
  }

  // Fallback simple static render (for reduced motion or disable-animation flags)
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${glowClasses} ${animate ? 'hover:-translate-y-1' : ''}`}
    >
      {content}
    </div>
  );
};
export default Card;
