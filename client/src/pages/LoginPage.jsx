import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/boards');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-transparent dark:via-transparent dark:to-transparent dark:bg-void-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background mesh (dark only) */}
      <div className="absolute inset-0 bg-mesh hidden dark:block" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-200/30 dark:from-neon-indigo/[0.07] to-transparent rounded-full blur-3xl" />

      <div className="relative bg-white dark:bg-void-850 border border-gray-200 dark:border-white/[0.06] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/40 w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-indigo to-neon-cyan text-white py-2.5 rounded-lg font-semibold text-sm hover:shadow-glow-cyan hover:brightness-110 focus:ring-2 focus:ring-neon-cyan/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-void-850 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-neon-cyan hover:text-indigo-500 dark:hover:text-neon-cyan/80 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
