import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glow = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  const baseStyle =
    'font-display font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer flex items-center justify-center gap-2 glare-container relative';

  const sizeStyles = {
    sm: 'text-[10px] px-3.5 py-2 rounded-sm',
    md: 'text-xs px-5.5 py-3 rounded-md',
    lg: 'text-sm px-7.5 py-3.5 rounded-lg',
  };

  const variantStyles = {
    primary:
      'bg-neon-blue/10 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-slate-950 focus:ring-1 focus:ring-neon-blue/50 shadow-[0_0_10px_rgba(0,240,255,0.1)] card-energy-border',
    secondary:
      'bg-slate-800/40 border border-slate-600 text-slate-300 hover:bg-slate-700/60 hover:text-white focus:ring-1 focus:ring-slate-500',
    success:
      'bg-neon-green/10 border border-neon-green text-neon-green hover:bg-neon-green hover:text-slate-950 focus:ring-1 focus:ring-neon-green/50 shadow-[0_0_10px_rgba(57,255,20,0.1)] card-energy-border',
    danger:
      'bg-neon-red/10 border border-neon-red text-neon-red hover:bg-neon-red hover:text-white focus:ring-1 focus:ring-neon-red/50 shadow-[0_0_10px_rgba(255,60,0,0.1)] card-energy-border',
    warning:
      'bg-neon-amber/10 border border-neon-amber text-neon-amber hover:bg-neon-amber hover:text-slate-950 focus:ring-1 focus:ring-neon-amber/50 shadow-[0_0_10px_rgba(255,183,3,0.1)] card-energy-border',
    ghost:
      'bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/5',
  };

  const glowStyles = glow
    ? {
        primary: 'shadow-[0_0_20px_rgba(0,240,255,0.45)]',
        secondary: 'shadow-[0_0_20px_rgba(148,163,184,0.2)]',
        success: 'shadow-[0_0_20px_rgba(57,255,20,0.45)]',
        danger: 'shadow-[0_0_20px_rgba(255,60,0,0.45)]',
        warning: 'shadow-[0_0_20px_rgba(255,183,3,0.45)]',
        ghost: '',
      }[variant]
    : '';

  // Decorative brackets for sci-fi HUD theme
  const renderBrackets = variant === 'primary' || variant === 'success' || variant === 'warning';

  return (
    <motion.button
      whileHover={disabled || prefersReducedMotion ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled || prefersReducedMotion ? {} : { scale: 0.97 }}
      className={`
        ${baseStyle} 
        ${sizeStyles[size]} 
        ${variantStyles[variant]} 
        ${glowStyles} 
        ${fullWidth ? 'w-full' : ''} 
        ${variant !== 'ghost' ? 'clip-hud-corners' : ''}
        ${className}
      `}
      disabled={disabled}
      {...(props as any)}
    >
      {/* Glare swipe element */}
      {!prefersReducedMotion && <div className="glare-swipe absolute inset-0 pointer-events-none" />}

      {/* Content wrapper with bracket indicators */}
      {renderBrackets && <span className="text-[10px] opacity-40 font-mono tracking-normal pr-0.5">⌠</span>}
      {children}
      {renderBrackets && <span className="text-[10px] opacity-40 font-mono tracking-normal pl-0.5">⌡</span>}
    </motion.button>
  );
};
export default Button;
