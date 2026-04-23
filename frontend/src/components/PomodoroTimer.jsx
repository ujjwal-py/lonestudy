import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/api';

const PomodoroTimer = ({ selectedTask, onTaskRemove, onRefresh }) => {
  const FOCUS_OPTIONS = [25, 50];

  const [focusMinutes, setFocusMinutes] = useState(25);
  const breakMinutes = focusMinutes === 50 ? 10 : 5;

  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [, setUnsavedTime] = useState(0);
  const [cyclesThisSession, setCyclesThisSession] = useState(0);

  const intervalRef = useRef(null);
  const unsavedTimeRef = useRef(0);

  const saveTime = useCallback(async (seconds) => {
    if (!selectedTask || seconds <= 0) return;
    try { 
      await api.tasks.updateTimeElapsed({ id: selectedTask._id, time_elapsed: seconds }); 
    }
    catch (err) { console.error('Failed to save time:', err); }
  }, [selectedTask]);

  const clearUnsavedTime = useCallback(() => {
    unsavedTimeRef.current = 0;
    setUnsavedTime(0);
  }, []);

  const commitUnsavedTime = useCallback(async (shouldRefresh = true) => {
    if (isBreak || unsavedTimeRef.current <= 0) return;
    await saveTime(unsavedTimeRef.current);
    clearUnsavedTime();
    if (shouldRefresh) onRefresh();
  }, [clearUnsavedTime, isBreak, onRefresh, saveTime]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearUnsavedTime();
    };
  }, [selectedTask?._id, clearUnsavedTime]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeRemaining(focusMinutes * 60);
    clearUnsavedTime();
    setCyclesThisSession(0);
  }, [selectedTask?._id, clearUnsavedTime, focusMinutes]);

  const completeCycle = useCallback(async () => {
    if (!selectedTask) return;
    try {
      await commitUnsavedTime(false);
      await api.tasks.addCycle({ id: selectedTask._id, cycles_completed: 1 });
      setCyclesThisSession((p) => p + 1);
      onRefresh();
    } catch (err) { console.error('Failed to complete cycle:', err); }
  }, [commitUnsavedTime, selectedTask, onRefresh]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      if (!isBreak) {
        unsavedTimeRef.current += 1;
        setUnsavedTime(unsavedTimeRef.current);
      }

      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          if (!isBreak) {
            completeCycle().then(() => {
              setIsBreak(true);
              setTimeRemaining(breakMinutes * 60);
            });
          } else {
            setIsBreak(false);
            setTimeRemaining(focusMinutes * 60);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak, completeCycle, focusMinutes, breakMinutes]);

  const handleStart = () => { if (selectedTask) setIsRunning(true); };

  const handlePause = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    await commitUnsavedTime();
  };

  const handleReset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setIsBreak(false);
    setTimeRemaining(focusMinutes * 60);
    clearUnsavedTime();
  };

  const handleRemoveTask = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    clearUnsavedTime();
    onTaskRemove();
  };

  const handleFocusMinutesChange = (minutes) => {
    setFocusMinutes(minutes);
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setIsBreak(false);
    setTimeRemaining(minutes * 60);
    clearUnsavedTime();
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const totalSeconds = isBreak ? breakMinutes * 60 : focusMinutes * 60;
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300" id="pomodoro-timer">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b surface-divider">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold theme-text-primary">
          <span>◷</span> Pomodoro
        </h2>
        {selectedTask && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isBreak ? 'bg-green-500/20 text-white border-green-500/30' : 'status-pill'
          }`}>
            {isBreak ? '☕ Break' : '🎯 Focus'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-6 flex flex-col items-center">
        {selectedTask ? (
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

            {/* Task Info */}
            <div className="text-center mb-4">
              <span className="text-[10px] theme-text-soft uppercase tracking-widest">Working on</span>
              <h3 className="text-lg font-semibold mt-1 mb-1.5 theme-text-primary">{selectedTask.title}</h3>
              <button
                onClick={handleRemoveTask}
                className="glass-ghost text-xs px-3 py-1 rounded-lg transition-all"
                id="remove-task-btn"
              >
                Remove task
              </button>
            </div>

            {/* Timer Circle */}
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

            {/* Controls */}
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

            {/* Session Stats */}
            <div className="flex gap-8 pt-4 border-t surface-divider w-full justify-center">
              {[
                { value: cyclesThisSession, label: 'This Session' },
                { value: selectedTask.cycles_completed, label: 'Total Cycles' },
                { value: selectedTask.cycles_required, label: 'Target' },
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
