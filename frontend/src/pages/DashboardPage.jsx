import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import PomodoroTimer from '../components/PomodoroTimer';
import Notes from '../components/Notes';
import api from '../api/api';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.tasks.getAll('pending');
      setTasks(data.tasks);
      if (selectedTask) {
        const updated = data.tasks.find((t) => t._id === selectedTask._id);
        if (updated) {
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

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bg to-bg/50">
      <Navbar />
      <main className="flex-1 p-5 max-w-[1400px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {/* Pending Tasks */}
          <div className="glass rounded-2xl overflow-hidden max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                <span className="text-accent">☰</span> Pending Tasks
              </h2>
              <span className="text-xs font-semibold px-2 py-1 bg-accent/10 text-accent rounded-full">
                {tasks.length}
              </span>
            </div>

            <div className="px-5 py-3">
              <div className="flex flex-col gap-2">
                {tasks.length === 0 && (
                  <p className="text-center text-xs text-text-muted py-6">No pending tasks. Create one!</p>
                )}
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                      selectedTask?._id === task._id
                        ? 'bg-accent/10 border-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                        : 'bg-white/[0.04] border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.06]'
                    }`}
                    onClick={() => setSelectedTask(selectedTask?._id === task._id ? null : task)}
                    id={`task-${task._id}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold truncate flex-1 min-w-0">{task.title}</h4>
                      <div className="flex gap-2 shrink-0 text-xs text-text-muted">
                        <span>⟳ {task.cycles_completed}/{task.cycles_required}</span>
                        <span>⏱ {formatTime(task.time_elapsed)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-dim line-clamp-1">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pomodoro Timer */}
          <PomodoroTimer
            selectedTask={selectedTask}
            onTaskRemove={() => setSelectedTask(null)}
            onRefresh={fetchTasks}
          />

          {/* Notes */}
          <div className="md:col-span-2 xl:col-span-1">
            <Notes />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
