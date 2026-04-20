import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(form); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 relative overflow-hidden">
      {/* Animated BG Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.4),transparent_70%)] blur-[80px] opacity-40 animate-float" />
        <div className="absolute -bottom-12 -left-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.3),transparent_70%)] blur-[80px] opacity-40 animate-float [animation-delay:-7s]" />
        <div className="absolute top-[40%] left-1/2 w-60 h-60 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.2),transparent_70%)] blur-[80px] opacity-40 animate-float [animation-delay:-14s]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] p-10 glass-strong rounded-3xl shadow-2xl shadow-accent/5 animate-fade-up" id="login-card">
        <div className="text-center mb-8">
          <span className="inline-block text-4xl text-accent mb-3 animate-pulse-glow">◈</span>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-text-dim">Sign in to continue your study session</p>
        </div>

        {error && (
          <div className="px-3 py-2 mb-4 text-xs text-danger bg-danger/10 border border-danger/15 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="login-form">
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="text-xs font-medium text-text-dim">Email</label>
            <input
              type="email"
              id="login-email"
              className="w-full px-3.5 py-2.5 text-sm text-white bg-white/[0.04] border border-border-subtle rounded-lg outline-none focus:border-accent/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all placeholder:text-text-muted"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-xs font-medium text-text-dim">Password</label>
            <input
              type="password"
              id="login-password"
              className="w-full px-3.5 py-2.5 text-sm text-white bg-white/[0.04] border border-border-subtle rounded-lg outline-none focus:border-accent/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all placeholder:text-text-muted"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 text-sm font-medium text-white bg-gradient-to-r from-accent to-indigo-500 rounded-lg shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            id="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-dim">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:text-accent-light transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
