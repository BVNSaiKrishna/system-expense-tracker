import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DynamicBackground } from './DynamicBackground';
import { InteractiveCursor } from '../ui/InteractiveCursor';
import { EnergyWave } from '../ui/EnergyWave';
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
  Coins,
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
  const wallpaperScale = useTransform(scrollY, [0, 400], [1, 1.15]);
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const contentYOffset = useTransform(scrollY, [0, 300], [0, -40]);

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
        case 'd': navigate('/'); break;
        case 't': navigate('/transactions'); break;
        case 'c': navigate('/cards'); break;
        case 'g': navigate('/goals'); break;
        case 'p': navigate('/profile'); break;
        case 'a': navigate('/achievements'); break;
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
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Ledger', path: '/transactions', icon: Receipt },
    { label: 'Relics', path: '/cards', icon: CardIcon },
    { label: 'Quests', path: '/goals', icon: Target },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Trophies', path: '/achievements', icon: Trophy },
    { label: 'Throne', path: '/profile', icon: User },
    { label: 'System', path: '/settings', icon: Settings },
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
          className={`h-screen border-r border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 flex flex-col justify-between transition-all duration-300 z-30 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Top Logo and collapse control */}
          <div className="p-5 flex items-center justify-between border-b border-slate-900">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-2.5 h-5 bg-neon-blue inline-block clip-hud-corners flex-shrink-0 animate-pulse" />
              {!sidebarCollapsed && (
                <span className="font-display font-black text-xs tracking-widest text-white uppercase whitespace-nowrap">
                  SYS // <span className="text-neon-blue">Tracker</span>
                </span>
              )}
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded border border-slate-800 hover:border-slate-600 bg-slate-950 text-slate-500 hover:text-white cursor-pointer"
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
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-display font-bold uppercase tracking-wider border transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-neon-blue/10 border-neon-blue/40 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.08)]'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neon-blue' : 'text-slate-400 group-hover:text-white'}`} />
                  {!sidebarCollapsed && (
                    <span className="flex-grow">{item.label}</span>
                  )}
                  {/* Subtle active border indicator */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-neon-blue rounded-l" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom HUD: Gold tracker, theme cycler, and exit */}
          <div className="p-4 border-t border-slate-900 space-y-3.5">
            {/* Quick stats gold */}
            <div className={`flex items-center gap-2.5 py-2 px-3 bg-slate-950/60 border border-slate-900 rounded font-mono text-xs text-neon-amber ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <Coins className="w-4 h-4 text-neon-amber animate-spin-slow" />
              {!sidebarCollapsed && <span>{user.currencyGold.toLocaleString()}G</span>}
            </div>

            {/* Cycle theme */}
            <button
              onClick={cycleTheme}
              className={`w-full flex items-center gap-3 py-2 px-3 rounded border border-slate-900 hover:border-slate-600 bg-slate-900/40 text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] font-mono uppercase ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              {getThemeIcon()}
              {!sidebarCollapsed && <span>Theme Cycle</span>}
            </button>

            {/* Exit session */}
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 py-2 px-3 rounded border border-slate-900 hover:border-neon-red bg-slate-900/40 text-slate-400 hover:text-neon-red transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-4 h-4 text-neon-red" />
              {!sidebarCollapsed && <span className="font-mono text-xs uppercase">Sign Out</span>}
            </button>
          </div>
        </aside>
      )}

      {/* 3. CORE DISPLAY SCREEN CONTENT */}
      <div className="flex-grow flex flex-col min-h-screen w-full relative overflow-y-auto">
        
        {/* MOBILE HOME MOUNTAIN HEADER HERO (Takes up top 45% of home screen on mobile dashboard) */}
        {isMobile && location.pathname === '/' && (
          <motion.div
            style={{ opacity: prefersReducedMotion ? 1 : heroOpacity }}
            className="w-full h-[45vh] relative flex-shrink-0 flex items-center justify-center overflow-hidden bg-slate-950/10 pointer-events-none"
          >
            {/* Glowing moon backdrop */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-neon-blue/20 filter blur-md shadow-[0_0_40px_rgba(0,240,255,0.4)] border border-neon-blue/30" />
            
            {/* Mountain vector base */}
            <svg
              className="absolute bottom-0 w-full h-28 fill-slate-950 stroke-slate-900/30"
              viewBox="0 0 1440 200"
              preserveAspectRatio="none"
            >
              <path d="M0,150 L350,80 L750,180 L1150,90 L1440,160 L1440,200 L0,200 Z" />
            </svg>

            {/* User figure silhouette standing on mountain top looking at portals */}
            <div className="absolute bottom-[114px] left-[24.5%] flex items-end">
              <svg className="w-5 h-7 fill-neon-blue animate-pulse" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2.2" />
                <path d="M12,8 Q9,12 12,18 L10,24 L12,24 L14,19 L16,24 L18,24 L14,18 Z" />
              </svg>
            </div>

            {/* Glowing system banner portal logo */}
            <div className="text-center z-10 select-none">
              <span className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.3em] block">Interface Module</span>
              <h1 className="text-xl font-display font-black text-white uppercase tracking-wider mt-1 text-glow-blue">
                SYSTEM // RUNNING
              </h1>
            </div>
          </motion.div>
        )}

        {/* Content container wrapper: slides slightly up as users scroll on mobile */}
        <motion.div
          style={{ y: prefersReducedMotion ? 0 : (isMobile ? contentYOffset : 0) }}
          className={`flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 z-10 ${
            isMobile && location.pathname === '/' ? '-mt-6' : ''
          }`}
        >
          <Outlet />
        </motion.div>

        {/* HUD System Footer */}
        <footer className="w-full border-t border-slate-900/60 py-3 bg-slate-950/40 z-10 mt-12 pb-24 lg:pb-3">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-[9px] font-mono tracking-widest text-slate-500 uppercase gap-2">
            <div>Living System Interface © 2026</div>
            <div className="flex gap-4">
              <span>Class Tier: active</span>
              <span>Energy: pulsing</span>
              <span className="text-neon-blue animate-pulse">Core Status: Stable</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 4. MOBILE BOTTOM HUD NAVIGATION BAR */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-slate-950/95 border-t border-slate-900 backdrop-blur-md flex justify-around items-center px-2 z-40">
          {menuItems
            .filter((item) => ['Dashboard', 'Ledger', 'Relics', 'Quests', 'Throne'].includes(item.label))
            .map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={triggerHaptic}
                  className="flex flex-col items-center justify-center w-12 h-12"
                >
                  <div
                    className={`p-2 rounded-full border transition-all ${
                      isActive
                        ? 'border-neon-blue/40 bg-neon-blue/10 text-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.25)] scale-110'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </Link>
              );
            })}
        </nav>
      )}

    </div>
  );
};
export default DashboardLayout;
