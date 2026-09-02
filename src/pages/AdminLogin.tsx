import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToMenu: () => void;
}

export function AdminLogin({ onLoginSuccess, onBackToMenu }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login(username.trim(), password);
      if (res.success) {
        showToast('Welcome back, Admin!');
        onLoginSuccess();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCreds = () => {
    setUsername('admin');
    setPassword('rome1960cafe');
    setError('');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-stone-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Menu Button */}
      <button
        type="button"
        onClick={onBackToMenu}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-stone-400 hover:text-stone-100 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Customer Menu</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-md rounded-3xl border border-stone-800 p-7 sm:p-9 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-18 h-18 rounded-full border-2 border-amber-500/60 bg-stone-950 flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-amber-600/10 p-1">
            <img
              src="/assets/logo.svg"
              alt="ROME 1960 CAFE"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h1 className="font-roman font-bold text-xl sm:text-2xl text-stone-50 tracking-wider uppercase">
            ROME 1960 CAFE
          </h1>
          <p className="font-serif-elegant italic text-xs text-amber-400 mt-1">
            Menu Administration & Management Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl p-3 mb-5 flex items-start gap-2">
            <span className="shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
              required
              className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl px-4 py-3 border border-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all"
              id="input-admin-username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-stone-950 text-stone-100 text-sm rounded-xl pl-4 pr-11 py-3 border border-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all"
                id="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            id="btn-admin-submit"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Secure Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill Helper */}
        <div className="mt-6 pt-5 border-t border-stone-800 text-center">
          <div className="text-[11px] text-stone-400 mb-2">
            Default Demo Credentials:
          </div>
          <button
            type="button"
            onClick={handleFillDemoCreds}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-stone-800/80 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Auto-fill Demo Credentials (admin / rome1960cafe)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
