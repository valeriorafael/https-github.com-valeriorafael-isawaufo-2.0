import React from 'react';
import { User } from '../types.ts';

interface SidebarProps {
  onLogout: () => void;
  user: User;
  onTargetToggle: () => void;
  isTargeting: boolean;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, user, onTargetToggle, isTargeting, onThemeToggle, theme }) => {
  return (
    <aside className="w-20 lg:w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col items-center py-8 px-4 z-[2000] transition-colors duration-300">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="w-12 h-12 bg-[var(--text-primary)]/10 border-2 border-[var(--text-primary)] rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
          <span className="text-2xl">👽</span>
        </div>
        <h2 className="hidden lg:block font-orbitron text-[10px] font-bold tracking-[0.3em] text-[var(--text-primary)] uppercase">UFO_TRACKER</h2>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 w-full space-y-4">
        <button 
          onClick={onTargetToggle}
          className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${isTargeting ? 'bg-red-600/10 border-red-500 text-red-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:opacity-80'}`}
        >
          <span className="text-xl">📍</span>
          <div className="hidden lg:block text-left">
            <span className="text-[10px] font-bold block uppercase">Report</span>
            <span className="text-[8px] opacity-50 font-mono">ID: SEC_GATE_1</span>
          </div>
        </button>

        <button 
          onClick={onThemeToggle}
          className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:opacity-80 transition"
        >
          <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <div className="hidden lg:block text-left">
            <span className="text-[10px] font-bold block uppercase">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            <span className="text-[8px] opacity-50 font-mono">Switch Visuals</span>
          </div>
        </button>

        <button className="w-full flex items-center gap-4 p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] opacity-40 cursor-not-allowed">
          <span className="text-xl">📊</span>
          <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest">Analytics</span>
        </button>
      </nav>

      {/* Profile Area */}
      <div className="w-full pt-6 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 mb-4">
          <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-[var(--text-primary)] p-0.5" alt="Avatar" />
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-[10px] font-bold truncate text-[var(--text-primary)]">@{user.username}</p>
            <p className="text-[8px] opacity-50 uppercase">Level 1 Clearance</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg transition border border-red-500/20"
        >
          Terminate
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;