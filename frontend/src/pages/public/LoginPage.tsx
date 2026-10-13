import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login({ college_email: email, password });
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (!data.user.onboarding_completed) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to sign in. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to SkillSwap
          </h2>
          <p className="text-xs text-slate-500">
            Campus Peer Learning Platform • Vishwakarma Institute of Technology, Pune
          </p>
        </div>

        {/* Expired alert */}
        {searchParams.get('expired') && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Your session expired. Please sign in again with your college email.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                VIT College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name.dept@vit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick Demo Logins (Click to autofill)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@vit.edu', 'AdminPass123!')}
                className="p-2 text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg font-medium text-purple-900 transition-colors"
              >
                <span className="font-bold block text-[11px]">Campus Admin</span>
                <span className="text-[10px] text-purple-700">admin@vit.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('aarav.sharma@vit.edu', 'Password123!')}
                className="p-2 text-left bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium text-indigo-900 transition-colors"
              >
                <span className="font-bold block text-[11px]">Aarav (DSA Mentor)</span>
                <span className="text-[10px] text-indigo-700">aarav.sharma@vit.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ananya.deshmukh@vit.edu', 'Password123!')}
                className="p-2 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-medium text-emerald-900 transition-colors"
              >
                <span className="font-bold block text-[11px]">Ananya (AI Mentor)</span>
                <span className="text-[10px] text-emerald-700">ananya.deshmukh@vit.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('tanvi.shinde@vit.edu', 'Password123!')}
                className="p-2 text-left bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium text-sky-900 transition-colors"
              >
                <span className="font-bold block text-[11px]">Tanvi (SY Learner)</span>
                <span className="text-[10px] text-sky-700">tanvi.shinde@vit.edu</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
              Register with VIT email
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
