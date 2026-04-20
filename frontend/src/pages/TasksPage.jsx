import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import api from '../api/api';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.tasks.getAll();
      setTasks(data.tasks);
      if (selectedTask) {
        const updated = data.tasks.find((t) => t._id === selectedTask._id);
        if (updated && updated.status === 'pending') {
          setSelectedTask(updated);
        } else {
          setSelectedTask(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [selectedTask]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const getCompletedByDateRange = (tasks, rangeMs) => {
    const now = new Date();
    const rangeStart = new Date(now.getTime() - rangeMs);
    return tasks.filter(t => new Date(t.updatedAt) >= rangeStart && new Date(t.updatedAt) <= now);
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
        ? 'bg-white/[0.04] border-white/[0.1] opacity-50'
        : 'bg-white/[0.04] border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.06]'
    }`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className={`text-sm font-semibold truncate flex-1 ${isCompleted ? 'line-through' : ''}`}>
          {task.title}
        </h4>
        {!isCompleted && (
          <div className="flex gap-0.5 shrink-0">
            <button
              onClick={() => setSelectedTask(task)}
              className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg transition-all ${
                selectedTask?._id === task._id
                  ? 'text-accent bg-accent/10 border border-accent/30'
                  : 'text-text-muted hover:bg-white/[0.08] hover:text-white'
              }`}
              title="Focus with Pomodoro"
            >◎</button>
            <button
              onClick={async () => {
                try {
                  await api.tasks.update(task._id, {
                    ...task,
                    status: 'completed',
                  });
                  await api.stats.update({ task_id: task._id });
                  fetchTasks();
                } catch (err) {
                  console.error('Failed to complete task:', err);
                }
              }}
              className="w-7 h-7 flex items-center justify-center text-xs text-success rounded-lg hover:bg-success/10 transition-all"
              title="Mark complete"
            >✓</button>
            <button
              onClick={async () => {
                try {
                  await api.tasks.delete(task._id);
                  fetchTasks();
                } catch (err) {
                  console.error('Failed to delete task:', err);
                }
              }}
              className="w-7 h-7 flex items-center justify-center text-xs text-danger rounded-lg hover:bg-danger/10 transition-all"
              title="Delete"
            >✕</button>
          </div>
        )}
        {isCompleted && (
          <button
            onClick={async () => {
              try {
                await api.tasks.delete(task._id);
                fetchTasks();
              } catch (err) {
                console.error('Failed to delete task:', err);
              }
            }}
            className="w-7 h-7 flex items-center justify-center text-xs text-danger rounded-lg hover:bg-danger/10 transition-all"
          >✕</button>
        )}
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
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bg to-bg/50">
      <Navbar />
      <main className="flex-1 p-5 max-w-[1200px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column - Create & Pending */}
          <div className="flex flex-col gap-5">
            {/* Create Task */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center px-5 py-4 border-b border-white/[0.1]">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <span className="text-accent">＋</span> New Task
                </h2>
              </div>
              <TaskList tasks={tasks} onRefresh={fetchTasks} onSelectTask={setSelectedTask} selectedTaskId={selectedTask?._id} />
            </div>
          </div>

          {/* Right Column - Completed */}
          <div className="flex flex-col gap-5">
            {/* Completed Today */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <span className="text-success">✓</span> Today
                </h2>
                <span className="text-xs font-semibold px-2 py-1 bg-success/10 text-success rounded-full">
                  {completedToday.length}
                </span>
              </div>
              <div className="px-5 py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {completedToday.length === 0 ? (
                  <p className="text-center text-xs text-text-muted py-4">No tasks completed today</p>
                ) : (
                  completedToday.map(task => <TaskCard key={task._id} task={task} isCompleted />)
                )}
              </div>
            </div>

            {/* Completed This Week */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <span className="text-success">✓</span> This Week
                </h2>
                <span className="text-xs font-semibold px-2 py-1 bg-success/10 text-success rounded-full">
                  {completedThisWeek.length}
                </span>
              </div>
              <div className="px-5 py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {completedThisWeek.length === 0 ? (
                  <p className="text-center text-xs text-text-muted py-4">No tasks completed this week</p>
                ) : (
                  completedThisWeek.map(task => <TaskCard key={task._id} task={task} isCompleted />)
                )}
              </div>
            </div>

            {/* Completed This Month */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <span className="text-success">✓</span> This Month
                </h2>
                <span className="text-xs font-semibold px-2 py-1 bg-success/10 text-success rounded-full">
                  {completedThisMonth.length}
                </span>
              </div>
              <div className="px-5 py-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {completedThisMonth.length === 0 ? (
                  <p className="text-center text-xs text-text-muted py-4">No tasks completed this month</p>
                ) : (
                  completedThisMonth.map(task => <TaskCard key={task._id} task={task} isCompleted />)
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TasksPage;
