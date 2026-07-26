import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DynamicBackground } from './DynamicBackground';
import { InteractiveCursor } from '../ui/InteractiveCursor';
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
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Scroll bindings for mobile parallax zoom
  const { scrollY } = useScroll();
  const wallpaperScale = useTransform(scrollY, [0, 400], [1, 1.08]);
  const contentYOffset = useTransform(scrollY, [0, 300], [0, -25]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard Shortcuts for Desktop
    const handleShortcuts = (e: KeyboardEvent) => {
      if (window.innerWidth < 1024) return; // Disable on mobile
      
      // Ignore if user is typing in form inputs
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') return;

      const key = e.key.toLowerCase();
      switch (key) {
        case 'o': navigate('/'); break;
        case 't': navigate('/transactions'); break;
        case 'c': navigate('/cards'); break;
        case 'g': navigate('/goals'); break;
        case 'a': navigate('/army'); break;
        case 'y': navigate('/analytics'); break;
        case 'h': navigate('/achievements'); break;
        case 'p': navigate('/profile'); break;
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
    { label: 'Cards', path: '/cards', icon: CardIcon },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Army', path: '/army', icon: Swords },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const cycleTheme = () => {
    if (theme === 'system-rpg') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system-rpg');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4 text-neon-amber" />;
    if (theme === 'dark') return <Moon className="w-4 h-4 text-neon-purple" />;
    return <Sparkles className="w-4 h-4 text-neon-blue animate-pulse" />;
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(12); // Short haptic pulse for touch clicks
    }
  };

  // Select 5 primary tabs for mobile dock
  const mobileDockItems = menuItems.filter((item) => 
    ['Overview', 'Transactions', 'Army', 'Goals', 'Profile'].includes(item.label)
  );

  return (
    <div className="min-h-screen w-full relative flex overflow-hidden">
      {/* 1. Global Interactive layers */}
      <InteractiveCursor />
      <EnergyWave />

      {/* Dynamic Animated background, scaling with mobile scroll parallax */}
      <motion.div style={{ scale: prefersReducedMotion ? 1 : wallpaperScale }} className="fixed inset-0 w-full h-full -z-50 pointer-events-none">
        <DynamicBackground />
      </motion.div>

      {/* 2. DESKTOP SIDEBAR NAVIGATION CONSOLE */}
      {!isMobile && (
        <aside
          className={`h-screen border-r border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 flex flex-col justify-between transition-all duration-300 z-30 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Top Logo and collapse control */}
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-2 h-4 bg-neon-blue inline-block rounded-full flex-shrink-0 animate-pulse" />
              {!sidebarCollapsed && (
                <span className="font-sans font-bold text-xs tracking-wider text-white uppercase whitespace-nowrap">
                  FIN // <span className="text-neon-blue">Tracker</span>
                </span>
              )}
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-full border border-white/10 hover:border-white/20 bg-slate-900/60 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation link triggers list */}
          <div className="flex-grow py-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-sans font-semibold tracking-wide border transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(0,200,255,0.06)]'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neon-blue' : 'text-slate-400 group-hover:text-white'}`} />
                  {!sidebarCollapsed && (
                    <span className="flex-grow">{item.label}</span>
                  )}
                  {/* Subtle active border indicator */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-neon-blue rounded-l" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom HUD: Theme cycler and exit */}
          <div className="p-4 border-t border-white/5 space-y-3">
            {/* Quick stats player status */}
            <div className={`flex items-center gap-2.5 py-2 px-3 bg-slate-900/40 border border-white/5 rounded-xl font-sans text-[10px] text-neon-blue uppercase tracking-wider ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <Sparkles className="w-4 h-4 text-neon-blue animate-pulse" />
              {!sidebarCollapsed && <span>{user.rankName}</span>}
            </div>

            {/* Cycle theme */}
            <button
              onClick={cycleTheme}
              className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl border border-white/5 hover:border-white/10 bg-slate-900/20 text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] font-sans font-medium uppercase ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              {getThemeIcon()}
              {!sidebarCollapsed && <span>Theme Cycle</span>}
            </button>

            {/* Exit session */}
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl border border-white/5 hover:border-neon-red/30 bg-slate-900/20 text-slate-400 hover:text-neon-red transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-4 h-4 text-neon-red" />
              {!sidebarCollapsed && <span className="font-sans text-xs">Sign Out</span>}
            </button>
          </div>
        </aside>
      )}

      {/* 3. CORE DISPLAY SCREEN CONTENT */}
      <div className="flex-grow flex flex-col min-h-screen w-full relative overflow-y-auto overflow-x-hidden">
        
        {/* Content container wrapper: slides slightly up as users scroll on mobile */}
        <motion.div
          style={{ y: prefersReducedMotion ? 0 : (isMobile ? contentYOffset : 0) }}
          className={`flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 z-10 ${
            isMobile && location.pathname === '/' ? 'pt-0' : ''
          }`}
        >
          <Outlet />
        </motion.div>

        {/* HUD System Footer */}
        <footer className="w-full border-t border-white/5 py-4 bg-slate-950/20 z-10 mt-12 pb-28 lg:pb-4">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans tracking-wide text-slate-500 uppercase gap-2">
            <div>Living System Interface © 2026</div>
            <div className="flex gap-4">
              <span>Class Tier: active</span>
              <span>Energy: pulsing</span>
              <span className="text-neon-blue animate-pulse">Core Status: Stable</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 4. MOBILE BOTTOM FLOATING DOCK NAVIGATION BAR */}
      {isMobile && (
        <FloatingBottomDock items={mobileDockItems} triggerHaptic={triggerHaptic} />
      )}

    </div>
  );
};

export default DashboardLayout;;
