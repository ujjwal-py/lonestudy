import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error('Logout failed', err); }
  };

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
      location.pathname === path
        ? 'theme-text-primary glass-ghost'
        : 'theme-text-secondary hover:bg-white/10 hover:text-[var(--text-primary)]'
    }`;

  return (
    <nav className="flex items-center justify-between px-6 h-[60px] glass-panel sticky top-0 z-50 border-b surface-divider shadow-lg">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 text-lg font-bold theme-text-primary">
        <span className="surface-accent text-xl">◈</span>
        <span>loneStudy</span>
      </Link>

      {/* Links */}
      <div className="flex gap-1">
        <Link to="/" className={linkClass('/')} id="nav-dashboard">
          <span>⊞</span> Dashboard
        </Link>
        <Link to="/tasks" className={linkClass('/tasks')} id="nav-tasks">
          <span>☰</span> Tasks
        </Link>
        <Link to="/stats" className={linkClass('/stats')} id="nav-stats">
          <span>◑</span> Stats
        </Link>
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="theme-toggle px-3 py-1.5 text-sm rounded-lg transition-all duration-150 hover:-translate-y-0.5"
          id="theme-toggle"
        >
          {isDark ? 'Light' : 'Dark'}
        </button>
        <span className="hidden sm:flex items-center gap-2 text-sm theme-text-secondary">
          <span className="flex items-center justify-center w-7 h-7 text-xs font-semibold glass-button rounded-full">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
          {user?.name}
        </span>
        <button
          onClick={handleLogout}
          className="glass-ghost px-3 py-1.5 text-sm rounded-lg transition-all duration-150"
          id="logout-btn"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
