import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/api';

const STORAGE_KEY = 'solostudy_active_pomodoro';
const FOCUS_OPTIONS = [25, 50];
const AUTOSAVE_SECONDS = 30;

const getBreakMinutes = (focusMinutes) => (focusMinutes === 50 ? 10 : 5);

const createSession = (task, focusMinutes = 25) => ({
  task,
  phase: 'focus',
  status: 'idle',
  focusMinutes,
  durationSeconds: focusMinutes * 60,
  elapsedBeforeStart: 0,
  startedAt: null,
  savedFocusSeconds: 0,
  cyclesThisSession: 0,
});

const loadSession = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const persistSession = (session) => {
  if (!session?.task?._id) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const getElapsedSeconds = (session, now = Date.now()) => {
  if (!session) return 0;
  if (session.status !== 'running' || !session.startedAt) {
    return session.elapsedBeforeStart || 0;
  }
  const runningSeconds = Math.floor((now - session.startedAt) / 1000);
  return Math.max(0, (session.elapsedBeforeStart || 0) + runningSeconds);
};

const PomodoroTimer = ({ selectedTask, onTaskRemove, onRefresh }) => {
  const [session, setSession] = useState(() => loadSession());
  const [now, setNow] = useState(() => Date.now());

  const activeTask = selectedTask || session?.task || null;

  const elapsedSeconds = useMemo(() => getElapsedSeconds(session, now), [session, now]);
  const totalSeconds = session?.durationSeconds || 25 * 60;
  const timeRemaining = Math.max(totalSeconds - elapsedSeconds, 0);
  const isRunning = session?.status === 'running';
  const isBreak = session?.phase === 'break';
  const focusMinutes = session?.focusMinutes || 25;
  const cyclesThisSession = session?.cyclesThisSession || 0;

  const saveFocusTime = useCallback(async (targetSession, elapsedOverride = null) => {
    if (!targetSession?.task?._id || targetSession.phase !== 'focus') return targetSession;

    const currentElapsed = elapsedOverride ?? getElapsedSeconds(targetSession);
    const cappedElapsed = Math.min(currentElapsed, targetSession.durationSeconds);
    const unsavedSeconds = cappedElapsed - (targetSession.savedFocusSeconds || 0);

    if (unsavedSeconds <= 0) return targetSession;

    await api.tasks.updateTimeElapsed({
      id: targetSession.task._id,
      time_elapsed: unsavedSeconds,
    });

    return {
      ...targetSession,
      savedFocusSeconds: cappedElapsed,
    };
  }, []);

  const finishFocus = useCallback(async (targetSession) => {
    try {
      const savedSession = await saveFocusTime(targetSession, targetSession.durationSeconds);
      await api.tasks.addCycle({ id: savedSession.task._id, cycles_completed: 1 });

      const nextSession = {
        ...savedSession,
        task: {
          ...savedSession.task,
          time_elapsed: (savedSession.task.time_elapsed || 0) + targetSession.durationSeconds - (targetSession.savedFocusSeconds || 0),
          cycles_completed: (savedSession.task.cycles_completed || 0) + 1,
        },
        phase: 'break',
        status: 'idle',
        durationSeconds: getBreakMinutes(savedSession.focusMinutes) * 60,
        elapsedBeforeStart: 0,
        startedAt: null,
        savedFocusSeconds: 0,
        cyclesThisSession: (savedSession.cyclesThisSession || 0) + 1,
      };

      setSession(nextSession);
      persistSession(nextSession);
      onRefresh();
    } catch (err) {
      console.error('Failed to complete focus cycle:', err);
    }
  }, [onRefresh, saveFocusTime]);

  const finishBreak = useCallback((targetSession) => {
    const nextSession = {
      ...targetSession,
      phase: 'focus',
      status: 'idle',
      durationSeconds: targetSession.focusMinutes * 60,
      elapsedBeforeStart: 0,
      startedAt: null,
      savedFocusSeconds: 0,
    };

    setSession(nextSession);
    persistSession(nextSession);
  }, []);

  useEffect(() => {
    if (!selectedTask) return;

    const timeoutId = setTimeout(() => {
      setSession((current) => {
        if (current?.task?._id === selectedTask._id) {
          const updated = { ...current, task: selectedTask };
          persistSession(updated);
          return updated;
        }

        const nextSession = createSession(selectedTask, current?.focusMinutes || 25);
        persistSession(nextSession);
        return nextSession;
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [selectedTask]);

  useEffect(() => {
    persistSession(session);
  }, [session]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (!session || !isRunning || timeRemaining > 0) return;

    const timeoutId = setTimeout(() => {
      if (session.phase === 'focus') {
        finishFocus(session);
      } else {
        finishBreak(session);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [finishBreak, finishFocus, isRunning, session, timeRemaining]);

  useEffect(() => {
    if (!session || session.phase !== 'focus' || !isRunning) return;

    const unsavedSeconds = elapsedSeconds - (session.savedFocusSeconds || 0);
    if (unsavedSeconds < AUTOSAVE_SECONDS) return;

    let cancelled = false;
    saveFocusTime(session, elapsedSeconds)
      .then((savedSession) => {
        if (cancelled) return;
        setSession((current) => {
          if (!current || current.task._id !== savedSession.task._id || current.phase !== savedSession.phase) {
            return current;
          }
          return { ...current, savedFocusSeconds: savedSession.savedFocusSeconds };
        });
        onRefresh();
      })
      .catch((err) => console.error('Failed to autosave focus time:', err));

    return () => {
      cancelled = true;
    };
  }, [elapsedSeconds, isRunning, onRefresh, saveFocusTime, session]);

  const handleStart = () => {
    if (!activeTask) return;

    setSession((current) => {
      const base = current?.task?._id === activeTask._id ? current : createSession(activeTask, focusMinutes);
      const nextSession = {
        ...base,
        task: activeTask,
        status: 'running',
        startedAt: Date.now(),
      };
      persistSession(nextSession);
      return nextSession;
    });
  };

  const handlePause = async () => {
    if (!session) return;

    const currentElapsed = Math.min(getElapsedSeconds(session), session.durationSeconds);
    let nextSession = {
      ...session,
      status: 'paused',
      elapsedBeforeStart: currentElapsed,
      startedAt: null,
    };

    try {
      nextSession = await saveFocusTime(nextSession, currentElapsed);
      onRefresh();
    } catch (err) {
      console.error('Failed to save paused time:', err);
    }

    setSession(nextSession);
    persistSession(nextSession);
  };

  const handleReset = () => {
    if (!activeTask) return;

    const nextSession = {
      ...createSession(activeTask, focusMinutes),
      cyclesThisSession,
    };
    setSession(nextSession);
    persistSession(nextSession);
  };

  const handleRemoveTask = () => {
    setSession(null);
    persistSession(null);
    onTaskRemove();
  };

  const handleFocusMinutesChange = (minutes) => {
    if (!activeTask) return;

    const nextSession = createSession(activeTask, minutes);
    setSession(nextSession);
    persistSession(nextSession);
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300" id="pomodoro-timer">
      <div className="flex items-center justify-between px-5 py-4 border-b surface-divider">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold theme-text-primary">
          <span>◷</span> Pomodoro
        </h2>
        {activeTask && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isBreak ? 'bg-green-500/20 text-white border-green-500/30' : 'status-pill'
          }`}>
            {isBreak ? '☕ Break' : '🎯 Focus'}
          </span>
        )}
      </div>

      <div className="px-5 py-6 flex flex-col items-center">
        {activeTask ? (
          <>
            <div className="mb-5 flex items-center gap-2 rounded-xl p-1 glass-ghost">
              {FOCUS_OPTIONS.map((minutesOption) => (
                <button
                  key={minutesOption}
                  type="button"
                  onClick={() => handleFocusMinutesChange(minutesOption)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    focusMinutes === minutesOption
                      ? 'glass-button'
                      : 'theme-text-secondary hover:bg-white/10 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {minutesOption} min
                </button>
              ))}
            </div>

            <div className="text-center mb-4">
              <span className="text-[10px] theme-text-soft uppercase tracking-widest">Working on</span>
              <h3 className="text-lg font-semibold mt-1 mb-1.5 theme-text-primary">{activeTask.title}</h3>
              <button
                onClick={handleRemoveTask}
                className="glass-ghost text-xs px-3 py-1 rounded-lg transition-all"
                id="remove-task-btn"
              >
                Remove task
              </button>
            </div>

            <div className="relative w-[220px] h-[220px] my-2 mb-5">
              <svg className="w-full h-full" viewBox="0 0 280 280">
                <circle cx="140" cy="140" r="120" fill="none" strokeWidth="6" className="stroke-white/20" />
                <circle
                  cx="140" cy="140" r="120" fill="none" strokeWidth="6"
                  className="timer-progress"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[2.75rem] font-bold tracking-wider tabular-nums theme-text-primary">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] theme-text-soft uppercase tracking-widest mt-0.5">
                  {isBreak ? 'Break Time' : 'Focus Time'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="glass-button px-7 py-3 text-sm font-medium rounded-xl transition-all duration-150"
                  id="start-btn"
                >
                  {timeRemaining < totalSeconds ? '▶ Resume' : '▶ Start'}
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-7 py-3 text-sm font-medium text-warn bg-warn/10 border border-warn/20 rounded-xl hover:bg-warn/15 transition-all duration-150"
                  id="pause-btn"
                >
                  ❚❚ Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className="glass-ghost px-5 py-3 text-sm font-medium rounded-xl transition-all duration-150"
                id="reset-btn"
              >
                ↺ Reset
              </button>
            </div>

            <div className="flex gap-8 pt-4 border-t surface-divider w-full justify-center">
              {[
                { value: cyclesThisSession, label: 'This Session' },
                { value: activeTask.cycles_completed, label: 'Total Cycles' },
                { value: activeTask.cycles_required, label: 'Target' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className="block text-xl font-bold theme-text-primary">{s.value}</span>
                  <span className="text-[10px] theme-text-soft uppercase tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 theme-text-soft">
            <div className="text-5xl mb-3 opacity-50">◎</div>
            <h3 className="text-base theme-text-secondary mb-1">No task selected</h3>
            <p className="text-sm">Select a task from your list to start focusing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
