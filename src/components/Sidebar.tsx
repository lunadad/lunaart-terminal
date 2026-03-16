'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

const VERSION = 'v0.1.0';

const navItems = [
  {
    href: '/',
    label: 'Auction Feed',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    href: '/spotlight',
    label: 'Spotlight',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
  },
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

function HamburgerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Crawl controls state
  const [scheduleTime, setScheduleTime] = useState(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('crawlSchedule') ?? '09:00') : '09:00'
  );
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [tempTime, setTempTime] = useState('09:00');
  const [crawling, setCrawling] = useState(false);
  const [lastCrawled, setLastCrawled] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('lastCrawled') : null
  );
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSchedule) timeInputRef.current?.focus();
  }, [editingSchedule]);

  function openScheduleEdit() { setTempTime(scheduleTime); setEditingSchedule(true); }
  function saveSchedule() {
    setScheduleTime(tempTime);
    localStorage.setItem('crawlSchedule', tempTime);
    setEditingSchedule(false);
  }
  async function runCrawl() {
    setCrawling(true);
    await new Promise(r => setTimeout(r, 1800));
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    setLastCrawled(now);
    localStorage.setItem('lastCrawled', now);
    setCrawling(false);
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">LT</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">LunaArt</h1>
            <p className="text-[10px] text-muted tracking-widest uppercase">Terminal</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Crawl Controls */}
      <div className="px-4 pt-4 pb-2 border-t border-border space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          {editingSchedule ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                ref={timeInputRef}
                type="time"
                value={tempTime}
                onChange={e => setTempTime(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveSchedule(); if (e.key === 'Escape') setEditingSchedule(false); }}
                className="flex-1 min-w-0 px-2 py-1 text-xs bg-background border border-accent rounded font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button onClick={saveSchedule} className="px-2 py-1 text-[10px] bg-accent text-background rounded font-medium hover:bg-accent/80 transition-colors shrink-0">저장</button>
              <button onClick={() => setEditingSchedule(false)} className="px-1.5 py-1 text-[10px] text-muted hover:text-foreground transition-colors shrink-0">✕</button>
            </div>
          ) : (
            <button
              onClick={openScheduleEdit}
              className="flex items-center gap-1.5 flex-1 min-w-0 px-2.5 py-1.5 text-[11px] bg-background border border-border rounded-lg text-text-secondary hover:border-border-light hover:text-foreground transition-all"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">매일 <span className="font-mono text-foreground">{scheduleTime}</span> KST</span>
              <svg className="w-2.5 h-2.5 opacity-40 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <button
            onClick={runCrawl}
            disabled={crawling}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {crawling ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {crawling ? '크롤링 중' : '지금'}
          </button>
        </div>
        {lastCrawled && !crawling && (
          <p className="text-[9px] text-muted/70 font-mono truncate">마지막: {lastCrawled}</p>
        )}
      </div>

      {/* Theme Toggle + Status */}
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
            Live Data Feed
          </div>
          <p className="text-[10px] text-muted mt-1.5 font-mono">Last updated: 2 min ago</p>
        </div>
        <p className="text-[9px] font-mono text-muted/40 text-right select-none">{VERSION}</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-foreground hover:bg-surface-hover transition-colors"
        >
          <HamburgerIcon />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">LT</span>
          </div>
          <span className="text-sm font-bold text-foreground">LunaArt</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slide-over drawer, desktop: fixed */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          w-[260px] md:w-[220px] h-full
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
