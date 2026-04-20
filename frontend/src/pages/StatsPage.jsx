import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/api';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.stats.get();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const accents = {
    today: { border: 'border-t-warn', icon: 'text-warn', bg: 'bg-warn/8' },
    week: { border: 'border-t-accent', icon: 'text-accent', bg: 'bg-accent/8' },
    month: { border: 'border-t-success', icon: 'text-success', bg: 'bg-success/8' },
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const StatCard = ({ title, icon, data, type }) => {
    const a = accents[type];
    return (
      <div className={`glass rounded-2xl p-6 border-t-2 ${a.border} hover:-translate-y-0.5 hover:border-white/[0.2] hover:shadow-lg transition-all duration-250`} id={`stat-${type}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xl ${a.icon}`}>{icon}</span>
          <h3 className="text-sm font-semibold text-text-dim">{title}</h3>
        </div>
        <div className="text-4xl font-extrabold mb-1">{data?.total_completed || 0}</div>
        <p className="text-xs text-text-muted mb-4">tasks completed</p>
        
        <div className="text-2xl font-bold mb-1 text-accent-light">{formatTime(data?.total_time || 0)}</div>
        <p className="text-[10px] text-text-muted mb-4 uppercase tracking-wider">total time studied</p>

        {data?.tasks_completed?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {data.tasks_completed.map((task, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 text-text-dim bg-white/[0.04] border border-white/[0.1] rounded-full">
                {typeof task === 'object' ? task.title : 'Task'}
              </span>
            ))}
          </div>
        )}

        {data?.daily_breakdown?.length > 1 && (
          <div className="pt-4 border-t border-white/[0.1]">
            <h4 className="text-[10px] text-text-muted uppercase tracking-wider mb-3">Daily Breakdown</h4>
            <div className="flex items-end gap-2 h-20">
              {data.daily_breakdown.map((day, i) => {
                const max = Math.max(...data.daily_breakdown.map((d) => d.total_completed), 1);
                const h = (day.total_completed / max) * 100;
                const label = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div
                      className="w-full max-w-7 bg-gradient-to-t from-accent to-indigo-500 rounded-t flex items-start justify-center"
                      style={{ height: `${Math.max(h, 8)}%` }}
                    >
                      <span className="text-[9px] font-semibold text-white mt-0.5">{day.total_completed}</span>
                    </div>
                    <span className="text-[9px] text-text-muted mt-1">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isEmpty = stats && stats.today?.total_completed === 0 && stats.week?.total_completed === 0 && stats.month?.total_completed === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bg to-bg/50">
      <Navbar />
      <main className="flex-1 py-8 px-6 max-w-[1200px] w-full mx-auto" id="stats-page">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold gradient-text mb-1">Your Progress</h1>
          <p className="text-sm text-text-dim">Track your study achievements</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-text-dim">
            <div className="w-9 h-9 border-3 border-border-subtle border-t-accent rounded-full animate-spin-slow" />
            <p className="text-sm">Loading stats...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl mb-6">{error}</div>
        )}

        {/* Stats Grid */}
        {stats && !isEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-up [animation-delay:100ms]">
            <StatCard title="Today" icon="☀" data={stats.today} type="today" />
            <StatCard title="This Week" icon="◧" data={stats.week} type="week" />
            <StatCard title="This Month" icon="☽" data={stats.month} type="month" />
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="text-center py-16 text-text-muted animate-fade-up [animation-delay:200ms]">
            <div className="text-5xl mb-4 text-border-medium">◑</div>
            <h3 className="text-lg text-text-dim mb-1.5">No stats yet</h3>
            <p className="text-sm">Complete some tasks to see your progress here!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StatsPage;
