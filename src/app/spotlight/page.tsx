'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { allLots, getRisingArtists, formatCurrency, formatFullCurrency, artists } from '@/lib/mock-data';
import { LotWithDetails } from '@/lib/types';

const VERSION = 'v0.1.0';

type Tab = 'rising' | 'hotlots' | 'liquidity' | 'volatility';

export default function SpotlightPage() {
  const [activeTab, setActiveTab] = useState<Tab>('rising');
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

  function openScheduleEdit() {
    setTempTime(scheduleTime);
    setEditingSchedule(true);
  }

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
  const risingArtists = getRisingArtists();

  const hotLots = useMemo(() => {
    return allLots
      .filter(l => l.result.sold && l.result.premiumPrice && l.estimateHigh > 0)
      .map(l => ({
        ...l,
        estimateRatio: ((l.result.premiumPrice! - l.estimateHigh) / l.estimateHigh) * 100,
      }))
      .sort((a, b) => b.estimateRatio - a.estimateRatio)
      .slice(0, 15);
  }, []);

  const liquidityData = useMemo(() => {
    const artistMap = new Map<string, { artist: typeof artists[0]; lots: LotWithDetails[]; sold: number }>();
    for (const lot of allLots) {
      const existing = artistMap.get(lot.artistId);
      if (existing) {
        existing.lots.push(lot);
        if (lot.result.sold) existing.sold++;
      } else {
        artistMap.set(lot.artistId, {
          artist: lot.artist,
          lots: [lot],
          sold: lot.result.sold ? 1 : 0,
        });
      }
    }
    return Array.from(artistMap.values())
      .filter(d => d.lots.length >= 2)
      .map(d => ({
        ...d,
        sellThrough: d.sold / d.lots.length,
        totalVolume: d.lots.reduce((s, l) => s + (l.result.usdEquivalent || 0), 0),
      }))
      .sort((a, b) => b.sellThrough - a.sellThrough || b.totalVolume - a.totalVolume)
      .slice(0, 12);
  }, []);

  const volatilityData = useMemo(() => {
    const artistMap = new Map<string, { artist: typeof artists[0]; prices: number[] }>();
    for (const lot of allLots) {
      if (!lot.result.sold || !lot.result.usdEquivalent) continue;
      const existing = artistMap.get(lot.artistId);
      if (existing) {
        existing.prices.push(lot.result.usdEquivalent);
      } else {
        artistMap.set(lot.artistId, {
          artist: lot.artist,
          prices: [lot.result.usdEquivalent],
        });
      }
    }
    return Array.from(artistMap.values())
      .filter(d => d.prices.length >= 2)
      .map(d => {
        const mean = d.prices.reduce((a, b) => a + b, 0) / d.prices.length;
        const variance = d.prices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / d.prices.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        return { ...d, mean, stdDev, cv };
      })
      .sort((a, b) => b.cv - a.cv)
      .slice(0, 12);
  }, []);

  const tabs: { key: Tab; label: string; labelEn: string }[] = [
    { key: 'rising', label: 'Rising Artists', labelEn: '급상승 작가' },
    { key: 'hotlots', label: 'Hot Lots', labelEn: '추정가 초과 작품' },
    { key: 'liquidity', label: 'Liquidity View', labelEn: '유동성 높은 작가' },
    { key: 'volatility', label: 'Volatility View', labelEn: '변동성 높은 작가' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">Spotlight Dashboard</h1>
        <p className="text-xs md:text-sm text-muted mt-0.5">주목 작가 &middot; 작품 인사이트</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 md:p-1.5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[80px] px-2 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-accent/15 text-accent font-medium'
                : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <span className="block truncate">{tab.label}</span>
            <span className="block text-[9px] md:text-[10px] mt-0.5 opacity-70 truncate">{tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'rising' && (
        <div className="space-y-3 animate-fade-in">
          {risingArtists.map((ra, i) => (
            <div
              key={ra.artist.id}
              className="bg-surface border border-border rounded-xl p-3 md:p-5 hover:border-border-light transition-all"
            >
              <div className="flex items-start gap-3 md:gap-5">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-accent/30 to-purple/30 flex items-center justify-center shrink-0">
                  <span className="text-base md:text-xl font-bold text-accent">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm md:text-base font-bold text-foreground">{ra.artist.name}</h3>
                    <span className="px-1.5 md:px-2 py-0.5 rounded-full bg-green/10 text-green text-[10px] md:text-xs font-mono font-bold">
                      +{ra.momentum.toFixed(1)}%
                    </span>
                    <span className="text-[10px] md:text-xs text-muted hidden sm:inline">{ra.artist.nationality} &middot; b.{ra.artist.birthYear}</span>
                  </div>
                  <p className="text-xs md:text-sm text-text-secondary mt-1 line-clamp-2">{ra.reason}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 md:mt-3">
                    <div>
                      <p className="text-[10px] text-muted uppercase">거래액</p>
                      <p className="text-sm font-bold text-foreground font-mono">${formatCurrency(ra.recentVolume)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase">평균 낙찰가</p>
                      <p className="text-sm font-bold text-foreground font-mono">${formatCurrency(ra.avgPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase">낙찰 로트</p>
                      <p className="text-sm font-bold text-foreground font-mono">{ra.lotsSold}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase">카테고리</p>
                      <p className="text-sm text-foreground">{ra.artist.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'hotlots' && (
        <div className="animate-fade-in">
          <div className="bg-surface border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left p-3 text-xs text-muted font-medium">#</th>
                  <th className="text-left p-3 text-xs text-muted font-medium">Artist</th>
                  <th className="text-left p-3 text-xs text-muted font-medium">Work</th>
                  <th className="text-left p-3 text-xs text-muted font-medium">House</th>
                  <th className="text-right p-3 text-xs text-muted font-medium">Estimate High</th>
                  <th className="text-right p-3 text-xs text-muted font-medium">Final Price</th>
                  <th className="text-right p-3 text-xs text-muted font-medium">Over Est.</th>
                </tr>
              </thead>
              <tbody>
                {hotLots.map((lot, i) => (
                  <tr
                    key={lot.id}
                    className="border-b border-border/40 hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => window.open(lot.lotUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <td className="p-3 text-muted font-mono">{i + 1}</td>
                    <td className="p-3 font-medium text-foreground">{lot.artist.name}</td>
                    <td className="p-3 text-text-secondary italic max-w-[200px] truncate">{lot.title}, {lot.year}</td>
                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={lot.auctionHouse.name === "Christie's"
                          ? { background: 'rgba(249,115,22,0.12)', color: '#f97316' }
                          : { background: 'rgba(139,155,0,0.14)', color: '#8b9b00' }}
                      >
                        {lot.auctionHouse.name === "Christie's" ? 'CHR' : 'SOT'}
                      </span>
                    </td>
                    <td className="p-3 text-right text-text-secondary font-mono">
                      {formatFullCurrency(lot.estimateHigh, lot.currency)}
                    </td>
                    <td className="p-3 text-right text-green font-mono font-bold">
                      {formatFullCurrency(lot.result.premiumPrice!, lot.currency)}
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-green/10 text-green font-mono font-bold text-xs">
                        +{lot.estimateRatio.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'liquidity' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 animate-fade-in">
          {liquidityData.map((d) => (
            <div key={d.artist.id} className="bg-surface border border-border rounded-xl p-4 hover:border-border-light transition-all">
              <h3 className="text-sm font-bold text-foreground">{d.artist.name}</h3>
              <p className="text-[10px] text-muted mt-0.5">{d.artist.nationality} &middot; {d.artist.category}</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">출품 횟수</span>
                  <span className="text-foreground font-mono font-bold">{d.lots.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">낙찰률</span>
                  <span className={`font-mono font-bold ${d.sellThrough > 0.8 ? 'text-green' : d.sellThrough > 0.5 ? 'text-orange' : 'text-red'}`}>
                    {(d.sellThrough * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${d.sellThrough > 0.8 ? 'bg-green' : d.sellThrough > 0.5 ? 'bg-orange' : 'bg-red'}`}
                    style={{ width: `${d.sellThrough * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">총 거래액</span>
                  <span className="text-accent font-mono">${formatCurrency(d.totalVolume)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'volatility' && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
            <p className="text-xs text-orange">
              변동성이 높은 작가는 투자 위험도가 높습니다. 가격 편차(CV%)가 클수록 예측이 어렵습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {volatilityData.map((d) => (
              <div key={d.artist.id} className="bg-surface border border-border rounded-xl p-4 hover:border-border-light transition-all">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{d.artist.name}</h3>
                  {d.cv > 80 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red/10 text-red font-medium">HIGH RISK</span>
                  )}
                </div>
                <p className="text-[10px] text-muted mt-0.5">{d.artist.nationality} &middot; {d.artist.category}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">변동계수 (CV)</span>
                    <span className={`font-mono font-bold ${d.cv > 80 ? 'text-red' : d.cv > 40 ? 'text-orange' : 'text-green'}`}>
                      {d.cv.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">평균 낙찰가</span>
                    <span className="text-foreground font-mono">${formatCurrency(d.mean)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">표준편차</span>
                    <span className="text-text-secondary font-mono">${formatCurrency(d.stdDev)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">거래 횟수</span>
                    <span className="text-foreground font-mono">{d.prices.length}</span>
                  </div>
                  {/* Volatility bar visualization */}
                  <div className="w-full bg-background rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full ${d.cv > 80 ? 'bg-red' : d.cv > 40 ? 'bg-orange' : 'bg-green'}`}
                      style={{ width: `${Math.min(d.cv, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: Crawl Controls + Version */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
        {/* Schedule + Crawl Now */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Schedule button */}
          {editingSchedule ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={timeInputRef}
                type="time"
                value={tempTime}
                onChange={e => setTempTime(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveSchedule(); if (e.key === 'Escape') setEditingSchedule(false); }}
                className="px-2 py-1 text-xs bg-background border border-accent rounded font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={saveSchedule}
                className="px-2.5 py-1 text-xs bg-accent text-background rounded font-medium hover:bg-accent/80 transition-colors"
              >
                저장
              </button>
              <button
                onClick={() => setEditingSchedule(false)}
                className="px-2 py-1 text-xs text-muted hover:text-foreground transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={openScheduleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-secondary hover:border-border-light hover:text-foreground transition-all"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>매일 <span className="font-mono text-foreground">{scheduleTime}</span> KST</span>
              <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}

          {/* Crawl Now */}
          <button
            onClick={runCrawl}
            disabled={crawling}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {crawling ? (
              <>
                <svg className="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                크롤링 중…
              </>
            ) : (
              <>
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                지금 크롤링
              </>
            )}
          </button>

          {lastCrawled && !crawling && (
            <span className="text-[10px] text-muted">마지막: {lastCrawled}</span>
          )}
        </div>

        {/* Version */}
        <span className="text-[10px] font-mono text-muted/60 select-none">{VERSION}</span>
      </div>
    </div>
  );
}
