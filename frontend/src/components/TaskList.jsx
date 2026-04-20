import { useState } from 'react';
import api from '../api/api';

const TaskList = ({ tasks, onRefresh, onSelectTask, selectedTaskId }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', cycles_required: 4 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      });
      setForm({ title: '', description: '', cycles_required: 4 });
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      await api.tasks.update(task._id, {
        title: task.title,
        description: task.description,
        cycles_required: task.cycles_required,
        cycles_completed: task.cycles_completed,
        time_elapsed: task.time_elapsed,
        status: 'completed',
      });
      await api.stats.update({ task_id: task._id });
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.tasks.delete(id);
      if (selectedTaskId === id) onSelectTask(null);
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="glass rounded-2xl overflow-hidden max-h-[calc(100vh-100px)] overflow-y-auto" id="task-list">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="text-accent">☰</span> Tasks
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-8 h-8 flex items-center justify-center text-sm bg-gradient-to-br from-accent to-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-accent/25 transition-all duration-150"
          id="toggle-task-form"
        >
          {showForm ? '✕' : '＋'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-3 px-3 py-2 text-xs text-danger bg-danger/10 border border-danger/15 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="flex flex-col gap-2.5 px-5 py-4 border-b border-white/[0.1] animate-slide-down" id="create-task-form">
          <input
            type="text"
            placeholder="Task title"
            className="w-full px-3 py-2.5 text-sm text-white bg-white/[0.04] border border-white/[0.1] rounded-lg outline-none focus:border-accent/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all placeholder:text-text-muted"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            id="task-title-input"
          />
          <input
            type="text"
            placeholder="Description"
            className="w-full px-3 py-2.5 text-sm text-white bg-white/[0.04] border border-white/[0.1] rounded-lg outline-none focus:border-accent/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all placeholder:text-text-muted"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            id="task-desc-input"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-dim">Cycles</span>
            <input
              type="number"
              min="1"
              max="20"
              className="w-16 px-2 py-1.5 text-sm text-center text-white bg-white/[0.04] border border-white/[0.1] rounded-lg outline-none focus:border-accent/50 transition-all"
              value={form.cycles_required}
              onChange={(e) => setForm({ ...form, cycles_required: e.target.value })}
              id="task-cycles-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-accent to-indigo-500 rounded-lg shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            id="create-task-btn"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      )}

      {/* Pending Tasks */}
      <div className="px-5 py-3">
        <h3 className="flex items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
          Pending
          <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold bg-accent/10 text-accent rounded-full">
            {pendingTasks.length}
          </span>
        </h3>
        <div className="flex flex-col gap-2">
          {pendingTasks.length === 0 && (
            <p className="text-center text-xs text-text-muted py-6">No pending tasks. Create one!</p>
          )}
          {pendingTasks.map((task) => (
            <div
              key={task._id}
              className={`p-3 rounded-xl border transition-all duration-150 ${
                selectedTaskId === task._id
                  ? 'bg-accent/10 border-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.05)]'
                  : 'bg-white/[0.04] border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.06]'
              }`}
              id={`task-${task._id}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold truncate flex-1 min-w-0">{task.title}</h4>
                <div className="flex gap-0.5 shrink-0">
                  <button
                    onClick={() => onSelectTask(selectedTaskId === task._id ? null : task)}
                    className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg transition-all ${
                      selectedTaskId === task._id
                        ? 'text-accent bg-accent/10 border border-accent/30'
                        : 'text-text-muted hover:bg-white/[0.08] hover:text-white'
                    }`}
                    title={selectedTaskId === task._id ? 'Remove from Pomodoro' : 'Focus with Pomodoro'}
                  >◎</button>
                  <button
                    onClick={() => handleComplete(task)}
                    className="w-7 h-7 flex items-center justify-center text-xs text-success rounded-lg hover:bg-success/10 transition-all"
                    title="Mark complete"
                  >✓</button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="w-7 h-7 flex items-center justify-center text-xs text-danger rounded-lg hover:bg-danger/10 transition-all"
                    title="Delete"
                  >✕</button>
                </div>
              </div>
              <p className="text-xs text-text-dim mb-1.5 line-clamp-2">{task.description}</p>
              <div className="flex gap-2">
                <span className="text-[11px] text-text-muted px-1.5 py-0.5 bg-white/[0.03] rounded">
                  ⟳ {task.cycles_completed}/{task.cycles_required}
                </span>
                <span className="text-[11px] text-text-muted px-1.5 py-0.5 bg-white/[0.03] rounded">
                  ⏱ {formatTime(task.time_elapsed)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="px-5 py-3 border-t border-white/[0.1]">
          <h3 className="flex items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
            Completed
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold bg-success/10 text-success rounded-full">
              {completedTasks.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2">
            {completedTasks.map((task) => (
              <div key={task._id} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.1] opacity-50" id={`task-done-${task._id}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold truncate flex-1 line-through">{task.title}</h4>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="w-7 h-7 flex items-center justify-center text-xs text-danger rounded-lg hover:bg-danger/10 transition-all"
                  >✕</button>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] text-text-muted px-1.5 py-0.5 bg-white/[0.03] rounded">
                    ⟳ {task.cycles_completed}/{task.cycles_required}
                  </span>
                  <span className="text-[11px] text-text-muted px-1.5 py-0.5 bg-white/[0.03] rounded">
                    ⏱ {formatTime(task.time_elapsed)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
