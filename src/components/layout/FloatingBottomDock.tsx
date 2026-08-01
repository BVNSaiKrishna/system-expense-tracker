import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TabItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface FloatingBottomDockProps {
  items: TabItem[];
  triggerHaptic: () => void;
}

export const FloatingBottomDock: React.FC<FloatingBottomDockProps> = ({ items, triggerHaptic }) => {
  const location = useLocation();

  return (
    <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="flex items-center justify-around w-full max-w-md h-16 px-4 bg-slate-950/75 border border-white/5 rounded-full backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={triggerHaptic}
              className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full group focus:outline-none"
            >
              {/* Morphing active pill backdrop */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  style={{
                    boxShadow: '0 0 20px rgba(0, 200, 255, 0.1)',
                  }}
                />
              )}

              {/* Tap scaling & active color transitions */}
              <motion.div
                whileTap={{ scale: 0.88 }}
                className={`p-2.5 rounded-full transition-colors duration-200 relative flex items-center justify-center ${
                  isActive 
                    ? 'text-[#00C8FF] text-glow-blue' 
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicatorDot"
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-[#00C8FF] shadow-[0_0_6px_#00C8FF]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingBottomDock;
