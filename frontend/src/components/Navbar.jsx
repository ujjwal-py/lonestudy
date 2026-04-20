import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error('Logout failed', err); }
  };

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
      location.pathname === path
        ? 'text-accent bg-accent/10 border border-accent/30'
        : 'text-text-dim hover:text-white hover:bg-white/[0.08]'
    }`;

  return (
    <nav className="flex items-center justify-between px-6 h-[60px] bg-white/[0.05] border-b border-white/[0.1] backdrop-blur-xl sticky top-0 z-50">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white hover:text-white">
        <span className="text-accent text-xl">◈</span>
        <span>SoloStudy</span>
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
        <span className="hidden sm:flex items-center gap-2 text-sm text-text-dim">
          <span className="flex items-center justify-center w-7 h-7 text-xs font-semibold bg-gradient-to-br from-accent to-indigo-500 text-white rounded-full">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
          {user?.name}
        </span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-text-dim border border-white/[0.1] rounded-lg hover:bg-white/[0.08] hover:text-white transition-all duration-150"
          id="logout-btn"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
