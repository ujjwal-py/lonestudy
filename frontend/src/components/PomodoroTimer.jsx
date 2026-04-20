import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/api';

const PomodoroTimer = ({ selectedTask, onTaskRemove, onRefresh }) => {
  const POMODORO_MINUTES = 1;  // Set to 1 minute for testing
  const BREAK_MINUTES = 1;     // Set to 1 minute for testing

  const [timeRemaining, setTimeRemaining] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [unsavedTime, setUnsavedTime] = useState(0);
  const [cyclesThisSession, setCyclesThisSession] = useState(0);

  const intervalRef = useRef(null);
  const unsavedTimeRef = useRef(0);

  useEffect(() => { unsavedTimeRef.current = unsavedTime; }, [unsavedTime]);

  const saveTime = useCallback(async (seconds) => {
    if (!selectedTask || seconds <= 0) return;
    try { 
      await api.tasks.updateTimeElapsed({ id: selectedTask._id, time_elapsed: seconds }); 
    }
    catch (err) { console.error('Failed to save time:', err); }
  }, [selectedTask]);

  // Reset when task changes
  useEffect(() => {
    return () => {
      if (unsavedTimeRef.current > 0 && !isBreak) {
        saveTime(unsavedTimeRef.current);
      }
      clearInterval(intervalRef.current);
    };
  }, [selectedTask?._id, isBreak, saveTime]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeRemaining(POMODORO_MINUTES * 60);
    setUnsavedTime(0);
    setCyclesThisSession(0);
  }, [selectedTask?._id]);

  const completeCycle = useCallback(async () => {
    if (!selectedTask) return;
    try {
      if (unsavedTimeRef.current > 0) {
        await api.tasks.updateTimeElapsed({ id: selectedTask._id, time_elapsed: unsavedTimeRef.current });
        setUnsavedTime(0);
      }
      await api.tasks.addCycle({ id: selectedTask._id, cycles_completed: 1 });
      setCyclesThisSession((p) => p + 1);
      onRefresh();
    } catch (err) { console.error('Failed to complete cycle:', err); }
  }, [selectedTask, onRefresh]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          if (!isBreak) {
            completeCycle().then(() => {
              setIsBreak(true);
              setTimeRemaining(BREAK_MINUTES * 60);
            });
          } else {
            setIsBreak(false);
            setTimeRemaining(POMODORO_MINUTES * 60);
          }
          return 0;
        }
        return prev - 1;
      });
      if (!isBreak) setUnsavedTime((p) => p + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak, completeCycle]);

  const handleStart = () => { if (selectedTask) setIsRunning(true); };

  const handlePause = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    if (unsavedTime > 0 && !isBreak) {
      await saveTime(unsavedTime);
      setUnsavedTime(0);
      onRefresh();
    }
  };

  const handleReset = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    if (unsavedTime > 0 && !isBreak) {
      await saveTime(unsavedTime);
      setUnsavedTime(0);
      onRefresh();
    }
    setIsBreak(false);
    setTimeRemaining(POMODORO_MINUTES * 60);
  };

  const handleRemoveTask = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    if (unsavedTime > 0 && !isBreak) {
      await saveTime(unsavedTime);
      setUnsavedTime(0);
    }
    onRefresh();
    onTaskRemove();
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const totalSeconds = isBreak ? BREAK_MINUTES * 60 : POMODORO_MINUTES * 60;
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass rounded-2xl overflow-hidden" id="pomodoro-timer">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="text-accent">◷</span> Pomodoro
        </h2>
        {selectedTask && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isBreak ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
          }`}>
            {isBreak ? '☕ Break' : '🎯 Focus'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-6 flex flex-col items-center">
        {selectedTask ? (
          <>
            {/* Task Info */}
            <div className="text-center mb-4">
              <span className="text-[10px] text-text-muted uppercase tracking-widest">Working on</span>
              <h3 className="text-lg font-semibold mt-1 mb-1.5">{selectedTask.title}</h3>
              <button
                onClick={handleRemoveTask}
                className="text-xs text-text-dim border border-white/[0.1] px-3 py-1 rounded-lg hover:bg-white/[0.08] hover:text-white transition-all"
                id="remove-task-btn"
              >
                Remove task
              </button>
            </div>

            {/* Timer Circle */}
            <div className="relative w-[220px] h-[220px] my-2 mb-5">
              <svg className="w-full h-full" viewBox="0 0 280 280">
                <circle cx="140" cy="140" r="120" fill="none" strokeWidth="6" className="stroke-white/[0.1]" />
                <circle
                  cx="140" cy="140" r="120" fill="none" strokeWidth="6"
                  className="timer-progress"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[2.75rem] font-bold tracking-wider tabular-nums gradient-text">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">
                  {isBreak ? 'Break Time' : 'Focus Time'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-5">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="px-7 py-3 text-sm font-medium text-white bg-gradient-to-r from-accent to-indigo-500 rounded-xl shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-150"
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
                className="px-5 py-3 text-sm font-medium text-text-dim border border-white/[0.1] rounded-xl hover:bg-white/[0.08] hover:text-white transition-all duration-150"
                id="reset-btn"
              >
                ↺ Reset
              </button>
            </div>

            {/* Session Stats */}
            <div className="flex gap-8 pt-4 border-t border-white/[0.1] w-full justify-center">
              {[
                { value: cyclesThisSession, label: 'This Session' },
                { value: selectedTask.cycles_completed, label: 'Total Cycles' },
                { value: selectedTask.cycles_required, label: 'Target' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className="block text-xl font-bold">{s.value}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-text-muted">
            <div className="text-5xl mb-3 text-border-medium">◎</div>
            <h3 className="text-base text-text-dim mb-1">No task selected</h3>
            <p className="text-sm">Select a task from your list to start focusing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
