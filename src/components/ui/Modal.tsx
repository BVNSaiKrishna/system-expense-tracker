import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'gold' | 'none';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  glowColor = 'blue',
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const mobileVariants = {
    hidden: { y: '100%', opacity: 1 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 280 } },
    exit: { y: '100%', opacity: 1, transition: { duration: 0.22, ease: 'easeInOut' as const } },
  };

  const desktopVariants = {
    hidden: { scale: 0.95, y: 12, opacity: 0 },
    visible: { scale: 1, y: 0, opacity: 1, transition: { type: 'spring' as const, damping: 25, stiffness: 350 } },
    exit: { scale: 0.96, y: 8, opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal / Bottom Sheet Container */}
          <motion.div
            variants={isMobile ? mobileVariants : desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110) {
                onClose();
              }
            }}
            className={`w-full z-10 ${
              isMobile 
                ? 'self-end bg-slate-950 border-t border-white/10 rounded-t-[32px] pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' 
                : 'max-w-lg'
            }`}
          >
            {isMobile ? (
              // Mobile Bottom Sheet Custom Layout (no clip corners, matching Radius 32)
              <div className="p-6 relative">
                {/* Drag Handle */}
                <div className="w-12 h-1 bg-white/15 rounded-full mx-auto mb-5" />
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
                  <h3 className="text-sm font-sans font-bold uppercase text-white tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-neon-blue inline-block rounded-full animate-pulse" />
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="relative text-sm text-slate-200">
                  {children}
                </div>
              </div>
            ) : (
              // Desktop Centered Glass Card Modal
              <Card
                glowColor={glowColor}
                clipCorners={true}
                animate={false}
                className="w-full bg-slate-950/95 shadow-[0_15px_50px_rgba(0,0,0,0.75)] border border-white/10"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
                  <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-neon-blue inline-block rounded-full animate-pulse" />
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="relative text-xs text-slate-200">
                  {children}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
