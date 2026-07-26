import React, { useEffect } from 'react';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 350 } }}
            exit={{ scale: 0.95, y: 10, opacity: 0, transition: { duration: 0.15 } }}
            className="w-full max-w-lg z-10"
          >
            <Card
              glowColor={glowColor}
              clipCorners={true}
              animate={false}
              className="w-full bg-slate-950/90 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h3 className="text-sm font-display font-extrabold uppercase text-white tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-neon-blue inline-block animate-pulse" />
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="relative text-sm text-slate-200">
                {children}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Modal;
