import { useState, useEffect } from 'react';

const STORAGE_KEY = 'solostudy_notes';

const Notes = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setContent(saved);
  }, []);

  const handleChange = (e) => {
    setContent(e.target.value);
    localStorage.setItem(STORAGE_KEY, e.target.value);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-100px)]" id="notes-section">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="text-accent">✎</span> Notes
        </h2>
        <span className="text-[11px] text-text-muted">Auto-saved</span>
      </div>

      {/* Body */}
      <div className="flex-1">
        <textarea
          className="w-full min-h-[400px] h-[calc(100vh-200px)] px-5 py-4 text-sm leading-7 text-white bg-transparent border-none outline-none resize-none placeholder:text-text-muted"
          placeholder="Jot down your thoughts, ideas, or study notes..."
          value={content}
          onChange={handleChange}
          id="notes-input"
        />
      </div>
    </div>
  );
};

export default Notes;
