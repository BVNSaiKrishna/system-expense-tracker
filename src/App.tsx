import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './components/layout/NotificationSystem';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Lazy loading Pages for performance splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Cards = React.lazy(() => import('./pages/Cards'));
const Goals = React.lazy(() => import('./pages/Goals'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Achievements = React.lazy(() => import('./pages/Achievements'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Army = React.lazy(() => import('./pages/Army'));
const Auth = React.lazy(() => import('./pages/Auth'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// App Controller with Auth Gate guarding routes
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-slate-500 gap-4">
        {/* Holographic scanning loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-dashed border-neon-blue/30 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-neon-blue animate-pulse flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-neon-blue rounded-full" />
          </div>
        </div>
        <div className="animate-pulse">Loading System Environment...</div>
      </div>
    );
  }

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-slate-500">
          <div className="animate-pulse">Loading Interface Module...</div>
        </div>
      }
    >
      <BrowserRouter>
        <Routes>
          {/* Public Access Gateway */}
          <Route
            path="/auth"
            element={!user ? <Auth /> : <Navigate to="/" replace />}
          />

          {/* Secure System Layout */}
          <Route
            path="/"
            element={user ? <DashboardLayout /> : <Navigate to="/auth" replace />}
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="cards" element={<Cards />} />
            <Route path="goals" element={<Goals />} />
            <Route path="army" element={<Army />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
