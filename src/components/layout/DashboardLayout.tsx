import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DynamicBackground } from './DynamicBackground';
import { EnergyWave } from '../ui/EnergyWave';
import { FloatingBottomDock } from './FloatingBottomDock';
import {
  LayoutDashboard,
  Receipt,
  CreditCard as CardIcon,
  Target,
  BarChart3,
  Trophy,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Swords,
  PlusCircle,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Scroll bindings for mobile parallax zoom
  const { scrollY } = useScroll();
  const wallpaperScale = useTransform(scrollY, [0, 400], [1, 1.08]);
  const contentYOffset = useTransform(scrollY, [0, 300], [0, -20]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard Shortcuts for Desktop Simulating Mobile Buttons
    const handleShortcuts = (e: KeyboardEvent) => {
      // Ignore if user is typing in form inputs
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') return;

      const key = e.key.toLowerCase();
      switch (key) {
        case 'o': navigate('/'); break;
        case 't': navigate('/transactions'); break;
        case 'l': navigate('/log'); break;
        case 'c': navigate('/cards'); break;
        case 'a': navigate('/analytics'); break;
        case 's': navigate('/settings'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleShortcuts);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleShortcuts);
    };
  }, [navigate]);

  if (!user) return null;

  const menuItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Log', path: '/log', icon: PlusCircle },
    { label: 'Cards', path: '/cards', icon: CardIcon },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(12); // Short haptic pulse for touch clicks
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-950">
      {/* 1. Global Interactive layers */}
      <EnergyWave />

      {/* Dynamic Animated background, scaling with mobile scroll parallax */}
      <motion.div style={{ scale: prefersReducedMotion ? 1 : wallpaperScale }} className="fixed inset-0 w-full h-full -z-50 pointer-events-none">
        <DynamicBackground />
      </motion.div>

      {/* 2. SMARTPHONE DEVICE SIMULATOR WRAPPER FOR DESKTOP */}
      <div className={`w-full flex flex-col relative overflow-hidden transition-all duration-300 ${
        isMobile 
          ? 'h-screen' 
          : 'h-[860px] max-w-[420px] rounded-[40px] border border-[#00C8FF]/20 shadow-[0_0_50px_rgba(0,200,255,0.15)] bg-slate-950/65 backdrop-blur-2xl my-auto'
      }`}>
        
        {/* Hologram Corner Accents on simulated device */}
        {!isMobile && (
          <>
            <div className="absolute top-4 left-6 text-[8px] font-mono text-neon-blue/40 tracking-widest uppercase pointer-events-none select-none z-40">
              SYS // HUNTER.HUD
            </div>
            <div className="absolute top-4 right-6 text-[8px] font-mono text-neon-blue/40 tracking-widest uppercase pointer-events-none select-none z-40 animate-pulse">
              LVL.{user.level}
            </div>
          </>
        )}

        {/* 3. CORE DISPLAY SCREEN CONTENT */}
        <div className="flex-grow flex flex-col h-full w-full relative overflow-y-auto overflow-x-hidden pt-8 pb-28">
          
          {/* Content container wrapper: slides slightly up as users scroll on mobile */}
          <motion.div
            style={{ y: prefersReducedMotion ? 0 : contentYOffset }}
            className={`flex-grow w-full px-4 py-4 z-10 ${
              location.pathname === '/' ? 'pt-0' : ''
            }`}
          >
            <Outlet />
          </motion.div>

          {/* HUD System Footer */}
          <footer className="w-full border-t border-white/5 py-4 bg-slate-950/20 z-10 mt-auto">
            <div className="px-6 flex flex-col justify-between items-center text-[9px] font-sans tracking-wide text-slate-500 uppercase gap-1">
              <div>Living System Interface © 2026</div>
              <div className="flex gap-3">
                <span>Class Tier: Hunter</span>
                <span className="text-neon-blue animate-pulse">Core Status: Stable</span>
              </div>
            </div>
          </footer>
        </div>

        {/* 4. MOBILE BOTTOM FLOATING DOCK NAVIGATION BAR */}
        <FloatingBottomDock items={menuItems} triggerHaptic={triggerHaptic} />
      </div>

    </div>
  );
};

export default DashboardLayout;;
