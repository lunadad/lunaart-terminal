'use client';

import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { getHermesSummary } from '@/lib/hermes-monitor-data';

const VERSION = 'v1.0.0';

const navItems = [
  { id: 'overview', label: 'Overview', hint: '요약 / 상태' },
  { id: 'tokens', label: 'Tokens', hint: '추세 / 예산' },
  { id: 'jobs', label: 'Jobs', hint: '워크플로 / 큐' },
  { id: 'alerts', label: 'Alerts', hint: '경고 / 메모' },
];

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001m0 0V4.356m0 4.991l-3.184-3.184a8.25 8.25 0 00-13.091 3.67M7.341 14.652H2.35m0 0v4.992m0-4.993l3.18 3.18a8.25 8.25 0 0013.084-3.666" />
    </svg>
  );
}

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => {
    if (typeof window === 'undefined') return '지금';
    return localStorage.getItem('hermes-last-refresh') ?? '지금';
  });
  const summary = getHermesSummary();

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
    setMobileOpen(false);
  }

  function refreshSnapshot() {
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    localStorage.setItem('hermes-last-refresh', now);
    setLastRefreshed(now);
  }

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">HM</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">Hermes</h1>
            <p className="text-[10px] text-muted tracking-widest uppercase">Monitor</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium border border-accent/20'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              <span className="min-w-0">
                <span className="block">{item.label}</span>
                <span className="block text-[10px] opacity-70 mt-0.5">{item.hint}</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-current opacity-60 shrink-0" />
            </button>
          );
        })}
      </nav>

      <div className="px-4 pt-4 pb-3 border-t border-border space-y-3">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-muted uppercase tracking-[0.2em] text-[9px]">Burn</p>
            <p className="mt-1 font-semibold text-foreground">{summary.burnRate}%</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-muted uppercase tracking-[0.2em] text-[9px]">Jobs</p>
            <p className="mt-1 font-semibold text-foreground">{summary.activeJobs}</p>
          </div>
        </div>
        <button
          onClick={refreshSnapshot}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] bg-background border border-border rounded-xl text-text-secondary hover:border-border-light hover:text-foreground transition-all"
        >
          <span className="inline-flex items-center gap-2">
            <RefreshIcon />
            Snapshot refresh
          </span>
          <span className="font-mono truncate">{lastRefreshed}</span>
        </button>
      </div>

      <div className="p-4 border-t border-border space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-background border border-border hover:border-border-light transition-all group"
        >
          <div className="relative w-10 h-5 rounded-full bg-surface-hover border border-border-light transition-colors shrink-0">
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                theme === 'dark'
                  ? 'left-0.5 bg-accent text-white'
                  : 'left-[1.125rem] bg-accent text-white'
              }`}
            >
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </div>
          </div>
          <span className="text-xs text-text-secondary group-hover:text-foreground transition-colors">
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot shrink-0" />
            Live Snapshot
          </div>
          <p className="text-[10px] text-muted mt-1.5 font-mono truncate">
            {summary.totalRequests.toLocaleString()} requests · {summary.totalTokens.toLocaleString()} tokens
          </p>
        </div>
        <p className="text-[9px] font-mono text-muted/40 text-right select-none">{VERSION}</p>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-foreground hover:bg-surface-hover transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">HM</span>
          </div>
          <span className="text-sm font-bold text-foreground">Hermes</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          w-[280px] md:w-[240px] h-full
          bg-surface border-r border-border
          flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
