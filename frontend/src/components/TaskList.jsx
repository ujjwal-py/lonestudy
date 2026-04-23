import { useCallback, useEffect, useState } from 'react';
import api from '../api/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', cycles_required: 4 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.tasks.getAll();
      setTasks(data.tasks);

      if (selectedTaskId) {
        const selectedTask = data.tasks.find((task) => task._id === selectedTaskId);
        if (selectedTask && selectedTask.status === 'pending') {
          setSelectedTaskId(selectedTask._id);
        } else {
          setSelectedTaskId(null);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }, [selectedTaskId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTaskPayload = (task, overrides = {}) => ({
    title: task.title,
    description: task.description,
    cycles_required: task.cycles_required,
    cycles_completed: task.cycles_completed,
    time_elapsed: task.time_elapsed,
    status: task.status,
    deleted: task.deleted,
    ...overrides,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.tasks.create({
        ...form,
        cycles_required: Number(form.cycles_required),
        cycles_completed: 0,
        time_elapsed: 0,
        status: 'pending',
        deleted: false
      });
      setForm({ title: '', description: '', cycles_required: 4 });
      setShowForm(false);
      await fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      await api.tasks.update(task._id, getTaskPayload(task, { status: 'completed' }));
      await api.stats.update({ task_id: task._id });
      if (selectedTaskId === task._id) setSelectedTaskId(null);
      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (task) => {
    try {
      await api.tasks.update(task._id, getTaskPayload(task, { deleted: true }));
      if (selectedTaskId === task._id) setSelectedTaskId(null);
      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const getCompletedByDateRange = (items, rangeMs) => {
    const now = new Date();
    const rangeStart = new Date(now.getTime() - rangeMs);
    return items.filter((task) => {
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= rangeStart && updatedAt <= now;
    });
  };

  const completedToday = getCompletedByDateRange(completedTasks, 24 * 60 * 60 * 1000);
  const completedThisWeek = getCompletedByDateRange(completedTasks, 7 * 24 * 60 * 60 * 1000);
  const completedThisMonth = getCompletedByDateRange(completedTasks, 30 * 24 * 60 * 60 * 1000);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const TaskCard = ({ task, isCompleted = false }) => (
    <div className={`p-3 rounded-xl border transition-all duration-150 ${
      isCompleted
        ? 'bg-white/5 border-white/10 opacity-50'
        : selectedTaskId === task._id
          ? 'bg-white/14 border-white/24 shadow-[0_0_20px_rgba(136,169,255,0.08)]'
          : 'bg-white/[0.04] border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.06]'
    }`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className={`text-sm font-semibold truncate flex-1 min-w-0 theme-text-primary ${isCompleted ? 'line-through' : ''}`}>
          {task.title}
        </h4>
        <div className="flex gap-0.5 shrink-0">
          {!isCompleted && (
            <button
              onClick={() => setSelectedTaskId(selectedTaskId === task._id ? null : task._id)}
              className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg transition-all ${
                selectedTaskId === task._id
                  ? 'theme-text-primary bg-white/20 border border-white/40'
                  : 'theme-text-soft hover:bg-white/10 hover:text-[var(--text-primary)]'
              }`}
              title={selectedTaskId === task._id ? 'Remove selection' : 'Select task'}
            >◎</button>
          )}
          {!isCompleted && (
            <button
              onClick={() => handleComplete(task)}
              className="w-7 h-7 flex items-center justify-center text-xs theme-text-secondary rounded-lg hover:bg-white/10 hover:text-[var(--text-primary)] transition-all"
              title="Mark complete"
            >✓</button>
          )}
          <button
            onClick={() => handleDelete(task)}
            className="w-7 h-7 flex items-center justify-center text-xs theme-text-secondary rounded-lg hover:bg-white/10 hover:text-[var(--text-primary)] transition-all"
            title="Delete"
          >✕</button>
        </div>
      </div>
      <p className="text-xs theme-text-soft mb-1.5 line-clamp-2">{task.description}</p>
      <div className="flex gap-2">
        <span className="status-pill text-[11px] px-1.5 py-0.5 rounded">
          ⟳ {task.cycles_completed}/{task.cycles_required}
        </span>
        <span className="status-pill text-[11px] px-1.5 py-0.5 rounded">
          ⏱ {formatTime(task.time_elapsed)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-up" id="task-list">
      <div className="flex flex-col gap-5">
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b surface-divider">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold theme-text-primary">
              <span className="theme-text-secondary">＋</span> New Task
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="glass-button w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-all duration-150"
              id="toggle-task-form"
            >
              {showForm ? '✕' : '＋'}
            </button>
          </div>

          {error && (
            <div className="mx-5 mt-3 px-3 py-2 text-xs text-danger bg-danger/10 border border-danger/15 rounded-lg">
              {error}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleCreate} className="flex flex-col gap-2.5 px-5 py-4 border-b surface-divider animate-slide-down" id="create-task-form">
              <input
                type="text"
                placeholder="Task title"
                className="glass-input w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                id="task-title-input"
              />
              <input
                type="text"
                placeholder="Description"
                className="glass-input w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                id="task-desc-input"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium theme-text-secondary">Cycles</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="glass-input w-16 px-2 py-1.5 text-sm text-center rounded-lg outline-none"
                  value={form.cycles_required}
                  onChange={(e) => setForm({ ...form, cycles_required: e.target.value })}
                  id="task-cycles-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="glass-button w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                id="create-task-btn"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          )}

          <div className="px-5 py-3">
            <h3 className="flex items-center text-[11px] font-semibold theme-text-soft uppercase tracking-wider mb-2.5">
              Pending
              <span className="status-pill ml-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full">
                {pendingTasks.length}
              </span>
            </h3>
            <div className="flex flex-col gap-2">
              {pendingTasks.length === 0 && (
                <p className="text-center text-xs theme-text-soft py-6">No pending tasks. Create one!</p>
              )}
              {pendingTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b surface-divider">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold theme-text-primary">
              <span className="theme-text-secondary">✓</span> Today
            </h2>
            <span className="status-pill text-xs font-semibold px-2 py-1 rounded-full">
              {completedToday.length}
            </span>
          </div>
          <div className="px-5 py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {completedToday.length === 0 ? (
              <p className="text-center text-xs theme-text-soft py-4">No tasks completed today</p>
            ) : (
              completedToday.map((task) => <TaskCard key={task._id} task={task} isCompleted />)
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b surface-divider">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold theme-text-primary">
              <span className="theme-text-secondary">✓</span> This Week
            </h2>
            <span className="status-pill text-xs font-semibold px-2 py-1 rounded-full">
              {completedThisWeek.length}
            </span>
          </div>
          <div className="px-5 py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {completedThisWeek.length === 0 ? (
              <p className="text-center text-xs theme-text-soft py-4">No tasks completed this week</p>
            ) : (
              completedThisWeek.map((task) => <TaskCard key={task._id} task={task} isCompleted />)
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b surface-divider">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold theme-text-primary">
              <span className="theme-text-secondary">✓</span> This Month
            </h2>
            <span className="status-pill text-xs font-semibold px-2 py-1 rounded-full">
              {completedThisMonth.length}
            </span>
          </div>
          <div className="px-5 py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {completedThisMonth.length === 0 ? (
              <p className="text-center text-xs theme-text-soft py-4">No tasks completed this month</p>
            ) : (
              completedThisMonth.map((task) => <TaskCard key={task._id} task={task} isCompleted />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
