'use client';

import { useState } from 'react';
import { allLots, auctionHouses, getCategoryPerformance, formatCurrency } from '@/lib/mock-data';

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

const HOUSE_HEATMAP_PALETTE: Record<string, { bg: string; border: string; fg: string; marker: string }> = {
  christies: {
    bg: 'color-mix(in srgb, var(--th-foreground) 7%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-foreground) 22%, transparent)',
    fg: 'var(--th-foreground)',
    marker: 'var(--th-foreground)',
  },
  sothebys: {
    bg: 'color-mix(in srgb, var(--th-accent) 10%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-accent) 34%, transparent)',
    fg: 'var(--th-foreground)',
    marker: 'var(--th-accent)',
  },
};

function getCurrentMonthHouseVolume() {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLots = allLots.filter(l => l.result.saleDate?.startsWith(monthPrefix));
  const totalVolume = monthLots
    .filter(l => l.result.sold)
    .reduce((sum, l) => sum + (l.result.usdEquivalent || 0), 0);

  return {
    monthLabel: MONTH_LABEL_FORMATTER.format(now).toUpperCase(),
    totalVolume,
    houses: auctionHouses
      .map((house) => {
        const houseLots = monthLots.filter(l => l.auctionHouseId === house.id);
        const soldLots = houseLots.filter(l => l.result.sold);
        const volume = soldLots.reduce((sum, l) => sum + (l.result.usdEquivalent || 0), 0);

        return {
          id: house.id,
          name: house.name,
          volume,
          soldLots: soldLots.length,
          totalLots: houseLots.length,
          share: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
          sellThrough: houseLots.length > 0 ? (soldLots.length / houseLots.length) * 100 : 0,
        };
      })
      .sort((a, b) => b.volume - a.volume),
  };
}

export function MonthlyVolumeChart() {
  const data = getCurrentMonthHouseVolume();

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold tracking-[-0.025em] text-foreground">현재 월 경매사 매출</h3>
        <span className="text-[10px] text-muted font-mono">{data.monthLabel}</span>
      </div>

      <div className="flex gap-2" style={{ height: 260 }}>
        {data.houses.map((house) => {
          const palette = HOUSE_HEATMAP_PALETTE[house.id] || HOUSE_HEATMAP_PALETTE.christies;
          const flexValue = Math.max(house.volume, data.totalVolume > 0 ? data.totalVolume * 0.08 : 1);

          return (
            <div
              key={house.id}
              className="relative rounded-lg border overflow-hidden flex flex-col justify-between p-4 min-w-[120px]"
              style={{ flex: flexValue, background: palette.bg, borderColor: palette.border, color: palette.fg }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold truncate">{house.name}</p>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: palette.marker }} />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold font-mono tracking-normal">
                  ${formatCurrency(house.volume)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] opacity-55 uppercase">Share</p>
                    <p className="text-sm font-bold font-mono">{house.share.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-55 uppercase">Sold</p>
                    <p className="text-sm font-bold font-mono">{house.soldLots}/{house.totalLots}</p>
                  </div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, house.sellThrough)}%`, background: palette.marker }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted font-mono">
        <span>TOTAL ${formatCurrency(data.totalVolume)}</span>
        <span>{data.houses.map(h => `${h.name === "Christie's" ? 'CHR' : 'SOT'} ${h.share.toFixed(1)}%`).join(' / ')}</span>
      </div>
    </div>
  );
}

// A restrained blue-to-neutral scale derived from the app theme tokens.
const CAT_PALETTE = [
  {
    bg: 'color-mix(in srgb, var(--th-accent) 22%, var(--th-surface))',
    hover: 'color-mix(in srgb, var(--th-accent) 28%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-accent) 52%, transparent)',
    fg: 'var(--th-foreground)',
  },
  {
    bg: 'color-mix(in srgb, var(--th-accent) 16%, var(--th-surface))',
    hover: 'color-mix(in srgb, var(--th-accent) 22%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-accent) 42%, transparent)',
    fg: 'var(--th-foreground)',
  },
  {
    bg: 'color-mix(in srgb, var(--th-accent) 11%, var(--th-surface))',
    hover: 'color-mix(in srgb, var(--th-accent) 17%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-accent) 32%, transparent)',
    fg: 'var(--th-foreground)',
  },
  {
    bg: 'color-mix(in srgb, var(--th-accent) 7%, var(--th-surface))',
    hover: 'color-mix(in srgb, var(--th-accent) 13%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-accent) 25%, transparent)',
    fg: 'var(--th-foreground)',
  },
  {
    bg: 'color-mix(in srgb, var(--th-foreground) 12%, var(--th-surface))',
    hover: 'color-mix(in srgb, var(--th-foreground) 17%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-foreground) 28%, transparent)',
    fg: 'var(--th-foreground)',
  },
  {
    bg: 'color-mix(in srgb, var(--th-foreground) 9%, var(--th-surface))',
    hover: 'color-mix(in srgb, var(--th-foreground) 14%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-foreground) 23%, transparent)',
    fg: 'var(--th-foreground)',
  },
  {
    bg: 'color-mix(in srgb, var(--th-foreground) 6%, var(--th-surface))',
    hover: 'color-mix(in srgb, var(--th-foreground) 11%, var(--th-surface))',
    border: 'color-mix(in srgb, var(--th-foreground) 18%, transparent)',
    fg: 'var(--th-foreground)',
  },
  {
    bg: 'var(--th-surface-hover)',
    hover: 'color-mix(in srgb, var(--th-foreground) 8%, var(--th-surface))',
    border: 'var(--th-border)',
    fg: 'var(--th-foreground)',
  },
] as const;

function TileContent({
  d,
  isLarge,
  idx,
}: {
  d: ReturnType<typeof getCategoryPerformance>[0];
  isLarge: boolean;
  idx: number;
}) {
  const [hovered, setHovered] = useState(false);
  const pal = CAT_PALETTE[idx % CAT_PALETTE.length];

  return (
    <div
      tabIndex={0}
      className="relative h-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      style={{ background: pal.bg, border: `1.5px solid ${pal.border}`, color: pal.fg }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`${d.category}: sell-through ${d.sellThrough}%, estimate ${d.avgOverEstimate >= 0 ? '+' : ''}${d.avgOverEstimate}%, volume $${formatCurrency(d.totalVolume)}`}
    >
      {/* Category name — always visible */}
      <p className={`font-semibold truncate max-w-full px-2 ${isLarge ? 'text-sm' : 'text-[11px]'}`}>
        {d.category}
      </p>

      {/* Sell-through — large tiles show inline, small tiles on hover */}
      {isLarge ? (
        <>
          <p className={`font-bold font-mono mt-1 ${isLarge ? 'text-xl' : 'text-base'}`}>
            {d.sellThrough}%
          </p>
          <p className="text-[10px] opacity-55 mt-0.5">낙찰률</p>
          <div className="flex items-baseline gap-1.5 mt-2 opacity-70">
            <span className="text-xs font-mono font-semibold">
              {d.avgOverEstimate >= 0 ? '+' : ''}{d.avgOverEstimate}%
            </span>
            <span className="text-[10px]">est.</span>
          </div>
          <p className="text-[10px] font-mono opacity-45 mt-1.5">
            ${formatCurrency(d.totalVolume)}
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-bold font-mono mt-0.5">{d.sellThrough}%</p>
          <p className="text-[10px] font-mono opacity-70 mt-0.5">
            {d.avgOverEstimate >= 0 ? '+' : ''}{d.avgOverEstimate}% est.
          </p>
          <p className="text-[10px] font-mono opacity-50">
            ${formatCurrency(d.totalVolume)}
          </p>

          <div
            className={`absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm transition-all duration-200 ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            style={{ background: pal.hover }}
          >
            <p className="text-[11px] font-semibold">{d.category}</p>
            <p className="text-lg font-bold font-mono">{d.sellThrough}%</p>
            <p className="text-[10px] opacity-60">낙찰률</p>
            <p className="text-[11px] font-mono font-semibold opacity-75 mt-0.5">
              {d.avgOverEstimate >= 0 ? '+' : ''}{d.avgOverEstimate}% est.
            </p>
            <p className="text-[10px] font-mono opacity-50">
              ${formatCurrency(d.totalVolume)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function CategoryHeatmap() {
  const data = getCategoryPerformance();
  if (data.length === 0) return null;

  const [first, ...rest] = data;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold tracking-[-0.025em] text-foreground">카테고리별 성과 히트맵</h3>
        <span className="text-[10px] text-muted font-mono">타일 크기 ∝ USD 매출액</span>
      </div>

      {/* Treemap: largest on left, rest stacked on right */}
      <div className="flex gap-1.5" style={{ height: 260 }}>
        {/* Main (largest) tile */}
        <div style={{ flex: first.totalVolume }}>
          <TileContent d={first} isLarge={true} idx={0} />
        </div>

        {/* Right column: remaining tiles stacked */}
        {rest.length > 0 && (
          <div className="flex flex-col gap-1.5" style={{ flex: data.reduce((s, d) => s + d.totalVolume, 0) - first.totalVolume }}>
            {rest.map((d, i) => (
              <div key={d.category} style={{ flex: d.totalVolume }}>
                <TileContent d={d} isLarge={rest.length === 1} idx={i + 1} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {data.map((d, i) => (
          <div key={d.category} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: CAT_PALETTE[i % CAT_PALETTE.length].bg, border: `1px solid ${CAT_PALETTE[i % CAT_PALETTE.length].border}` }}
            />
            <span className="text-[10px] text-muted">{d.category}</span>
            <span className="text-[10px] font-mono text-muted/60">{d.sellThrough}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
