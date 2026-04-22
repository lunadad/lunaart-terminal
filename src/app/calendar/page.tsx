'use client';

import { useState, useMemo } from 'react';
import { calendarAuctions } from '@/lib/calendar-data';

type House = 'all' | 'christies' | 'sothebys';
type AuctionKind = 'all' | 'live' | 'online';

interface Auction {
  house: 'christies' | 'sothebys';
  title: string;
  date: string;
  dateSort: string;
  location: string;
  href: string;
  kind: 'live' | 'online';
}

const CHR_STYLE = { background: 'rgba(249,115,22,0.12)', color: '#f97316' };
const SOT_STYLE = { background: 'rgba(139,155,0,0.14)', color: '#8b9b00' };

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

const auctions: Auction[] = calendarAuctions;

function groupByMonth(list: Auction[]): [string, Auction[]][] {
  const groups: Record<string, Auction[]> = {};
  list.forEach(a => {
    const key = a.dateSort.substring(0, 7); // "2026-03"
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function ArrowIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function CalendarPage() {
  const [activeHouse, setActiveHouse] = useState<House>('all');
  const [activeKind, setActiveKind] = useState<AuctionKind>('all');

  const filtered = useMemo(() => {
    return auctions
      .filter(a => {
        if (activeHouse !== 'all' && a.house !== activeHouse) return false;
        if (activeKind !== 'all' && a.kind !== activeKind) return false;
        return true;
      })
      .sort((a, b) => a.dateSort.localeCompare(b.dateSort));
  }, [activeHouse, activeKind]);

  const grouped = groupByMonth(filtered);

  const christiesCount = filtered.filter(a => a.house === 'christies').length;
  const sothebysCount = filtered.filter(a => a.house === 'sothebys').length;
  const liveCount = filtered.filter(a => a.kind === 'live').length;
  const onlineCount = filtered.filter(a => a.kind === 'online').length;
  const uniqueCities = new Set(filtered.map(a => a.location)).size;
  const firstMonth = filtered[0]?.dateSort.slice(0, 7);
  const lastMonth = filtered[filtered.length - 1]?.dateSort.slice(0, 7);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Auction Calendar</h1>
            <p className="text-xs text-muted mt-0.5">
              Upcoming fine art auctions · Christie&apos;s &amp; Sotheby&apos;s
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold font-mono" style={{ color: '#f97316' }}>{christiesCount}</p>
                <p className="text-[10px] text-muted">Christie&apos;s</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold font-mono" style={{ color: '#8b9b00' }}>{sothebysCount}</p>
                <p className="text-[10px] text-muted">Sotheby&apos;s</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted uppercase tracking-widest">Source snapshot</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Christie&apos;s + Sotheby&apos;s</p>
            <p className="text-xs text-text-secondary mt-1">{filtered.length} auctions · {uniqueCities} cities</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted uppercase tracking-widest">Format mix</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{liveCount} live / {onlineCount} online</p>
            <p className="text-xs text-text-secondary mt-1">Live dates are easier to scan; online lots stay open longer.</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted uppercase tracking-widest">Coverage window</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{firstMonth ? formatMonthLabel(firstMonth) : 'No data'} → {lastMonth ? formatMonthLabel(lastMonth) : 'No data'}</p>
            <p className="text-xs text-text-secondary mt-1">House split: {christiesCount} Christie&apos;s / {sothebysCount} Sotheby&apos;s</p>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* House filter */}
          <div className="flex gap-0.5 bg-background border border-border rounded-lg p-1">
            {(['all', 'christies', 'sothebys'] as House[]).map(h => (
              <button
                key={h}
                onClick={() => setActiveHouse(h)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeHouse === h
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {h === 'all' ? 'All Houses' : h === 'christies' ? "Christie's" : "Sotheby's"}
              </button>
            ))}
          </div>

          {/* Kind filter */}
          <div className="flex gap-0.5 bg-background border border-border rounded-lg p-1">
            {(['all', 'live', 'online'] as AuctionKind[]).map(k => (
              <button
                key={k}
                onClick={() => setActiveKind(k)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeKind === k
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {k === 'all' ? 'All' : k === 'live' ? '🏛 Live' : '🌐 Online'}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted ml-auto font-mono">{filtered.length} auctions</span>
        </div>

        {/* ── Monthly Sections ── */}
        {grouped.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">No auctions match the current filter.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([monthKey, items]) => (
              <section key={monthKey}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest whitespace-nowrap">
                    {formatMonthLabel(monthKey)}
                  </h2>
                  <span className="text-[10px] text-muted font-mono bg-surface border border-border rounded-full px-2 py-0.5">
                    {items.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Auction rows */}
                <div className="space-y-1.5">
                  {items.map((auction, idx) => (
                    <a
                      key={idx}
                      href={auction.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-light hover:bg-surface-hover transition-all"
                    >
                      {/* Date */}
                      <span className="w-[72px] shrink-0 text-[11px] font-mono text-muted">
                        {auction.date}
                      </span>

                      {/* House badge */}
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                        style={auction.house === 'christies' ? CHR_STYLE : SOT_STYLE}
                      >
                        {auction.house === 'christies' ? 'CHR' : 'SOT'}
                      </span>

                      {/* Title */}
                      <span className="flex-1 text-sm text-foreground group-hover:text-accent transition-colors min-w-0 truncate">
                        {auction.title}
                      </span>

                      {/* Location */}
                      <span className="hidden md:flex items-center gap-1 text-[11px] text-muted shrink-0">
                        <LocationIcon />
                        {auction.location}
                      </span>

                      {/* Online badge */}
                      {auction.kind === 'online' && (
                        <span className="hidden sm:inline text-[10px] text-muted border border-border rounded px-1.5 py-0.5 shrink-0 font-mono">
                          Online
                        </span>
                      )}

                      {/* Arrow */}
                      <ArrowIcon />
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-[10px] text-muted text-center pb-2 font-mono">
          Data sourced from Christie&apos;s and Sotheby&apos;s official calendars · Fine art categories only
        </p>
      </div>
    </div>
  );
}
