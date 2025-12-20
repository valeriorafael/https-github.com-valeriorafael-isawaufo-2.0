import React from 'react';
import { User } from '../types.ts';

interface MobileNavProps {
  user: User;
  onLogout: () => void;
  onTargetToggle: () => void;
  isTargeting: boolean;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

const MobileNav: React.FC<MobileNavProps> = ({ user, onLogout, onTargetToggle, isTargeting, onThemeToggle, theme }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border-color)] px-6 pb-safe pt-3 flex items-center justify-between z-[2000] transition-colors duration-300">
      <button 
        onClick={onThemeToggle}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
        <span className="text-[9px] uppercase font-bold tracking-tighter opacity-60">Mode</span>
      </button>

      <button className="flex flex-col items-center gap-1">
        <span className="text-xl">🛸</span>
        <span className="text-[9px] uppercase font-bold tracking-tighter text-[var(--text-primary)]">Global</span>
      </button>

      <button 
        onClick={onTargetToggle}
        className={`-mt-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-[var(--bg-primary)] ${
          isTargeting 
          ? 'bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]' 
          : 'bg-[var(--text-primary)] shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        }`}
      >
        <span className="text-2xl text-white">📍</span>
      </button>

      <button className="flex flex-col items-center gap-1 opacity-50">
        <span className="text-xl">📡</span>
        <span className="text-[9px] uppercase font-bold tracking-tighter">Comm</span>
      </button>

      <button 
        onClick={onLogout}
        className="flex flex-col items-center gap-1"
      >
        <img src={user.avatar} className="w-6 h-6 rounded-full border border-[var(--text-primary)] p-0.5" alt="Avatar" />
        <span className="text-[9px] uppercase font-bold tracking-tighter text-red-500">Exit</span>
      </button>
    </nav>
  );
};

export default MobileNav;