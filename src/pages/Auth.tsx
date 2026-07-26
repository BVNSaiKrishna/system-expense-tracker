import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ShieldAlert, LogIn, Sparkles, UserPlus, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Auth: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsGuest } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Credentials must not be empty.');
      return;
    }

    if (isRegister && !displayName) {
      setError('Please specify a profile identity tag.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Access authorization failed.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google Auth failed.');
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsGuest();
    } catch (err: any) {
      setError(err?.message || 'Guest session failure.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* Visual Tech grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-neon-blue/10 pointer-events-none" />

      {/* Futuristic Floating energy spheres */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-neon-blue/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-neon-purple/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card
          glowColor="blue"
          clipCorners={true}
          className="bg-slate-950/90 border border-slate-800 p-8 shadow-[0_0_40px_rgba(0,240,255,0.2)]"
        >
          {/* Header Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-black text-white uppercase tracking-[0.15em] flex items-center justify-center gap-2">
              <span className="w-2.5 h-5 bg-neon-blue inline-block clip-hud-corners animate-pulse" />
              SYSTEM GATEWAY
            </h1>
            <p className="text-[10px] font-mono text-neon-blue uppercase tracking-widest mt-1.5">
              Secure Ledger Authentication
            </p>
          </div>

          {error && (
            <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded text-neon-red text-xs mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Identity Name (Display Name)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Knight Saver"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Terminal Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@system.domain"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Access Encryption Key (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth={true}
                glow={true}
                disabled={loading}
              >
                {loading ? 'Authorizing Access...' : isRegister ? 'Forge Identity' : 'Authorize Gateway'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <hr className="border-slate-900" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-slate-950 text-[8px] font-mono text-slate-600 uppercase">
              Or Choose Path
            </span>
          </div>

          {/* Social Access Paths */}
          <div className="space-y-2.5">
            <Button
              type="button"
              variant="secondary"
              fullWidth={true}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Sparkles className="w-3.5 h-3.5 text-neon-purple animate-pulse" />
              Sign In with Google
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth={true}
              onClick={handleGuestLogin}
              disabled={loading}
              className="text-slate-400 hover:text-white uppercase tracking-wider text-[10px]"
            >
              Enter as Guest Explorer (Local Persistence)
            </Button>
          </div>

          {/* Form Switch Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-[10px] font-mono text-slate-500 hover:text-neon-blue uppercase tracking-wider cursor-pointer"
            >
              {isRegister ? 'Already registered? Gateway authorization' : 'Need authorization? Forge new credentials'}
            </button>
          </div>

        </Card>
      </motion.div>
    </div>
  );
};
export default Auth;
