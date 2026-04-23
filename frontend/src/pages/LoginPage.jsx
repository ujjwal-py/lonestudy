import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    <div className="app-shell flex items-center justify-center min-h-screen p-8 relative">
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-toggle absolute right-6 top-6 z-20 px-3 py-2 text-sm rounded-lg transition-all duration-150"
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Card */}
      <div className="glass-panel-strong relative z-10 w-full max-w-[420px] p-10 rounded-3xl animate-fade-up transition-all" id="login-card">
        <div className="text-center mb-8">
          <span className="inline-block text-4xl surface-accent mb-3 animate-pulse-glow">◈</span>
          <h1 className="text-2xl font-bold theme-text-primary mb-1">Welcome back</h1>
          <p className="text-sm theme-text-secondary">Sign in to continue your study session</p>
        </div>

        {error && (
          <div className="px-3 py-2 mb-4 text-xs text-danger bg-danger/10 border border-danger/15 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="login-form">
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="text-xs font-medium theme-text-secondary">Email</label>
            <input
              type="email"
              id="login-email"
              className="glass-input w-full px-3.5 py-2.5 text-sm rounded-lg outline-none"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-xs font-medium theme-text-secondary">Password</label>
            <input
              type="password"
              id="login-password"
              className="glass-input w-full px-3.5 py-2.5 text-sm rounded-lg outline-none"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="glass-button w-full py-2.5 mt-1 text-sm font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            id="login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm theme-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="surface-accent font-medium transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
