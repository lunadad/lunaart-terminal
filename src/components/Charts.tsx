'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getMonthlyVolume, getCategoryPerformance, formatCurrency } from '@/lib/mock-data';
import { useTheme } from './ThemeProvider';

const COLORS = {
  christies: '#f97316',
  sothebys: '#8b9b00',
};

type TooltipPoint = {
  dataKey: string;
  color?: string;
  name?: string;
  value?: string | number;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPoint[];
  label?: string | number;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface border border-border-light rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.name}: ${p.value}M
        </p>
      ))}
    </div>
  );
}

export function MonthlyVolumeChart() {
  const data = getMonthlyVolume();
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#6b7280' : '#8c8379';
  const cursorFill = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">경매사별 월간 거래액</h3>
        <span className="text-[10px] text-muted font-mono">MONTHLY VOLUME ($M)</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-text-secondary">
                {value === 'christies' ? "Christie's" : "Sotheby's"}
              </span>
            )}
          />
          <Bar dataKey="christies" fill={COLORS.christies} radius={[4, 4, 0, 0]} />
          <Bar dataKey="sothebys" fill={COLORS.sothebys} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Pastel palette — one per category
const CAT_PALETTE = [
  { bg: '#FFF0DB', border: '#F5C36A', fg: '#6B4A00' }, // warm gold
  { bg: '#DBF0F8', border: '#7EC8E3', fg: '#0D4A6B' }, // sky
  { bg: '#D8F5E8', border: '#6CC4A0', fg: '#0A4A2A' }, // mint
  { bg: '#FFE0E0', border: '#F09090', fg: '#6B2020' }, // rose
  { bg: '#E0E4F8', border: '#9AA4D8', fg: '#2A3570' }, // lavender
  { bg: '#FFF0E0', border: '#F0B878', fg: '#6A4000' }, // peach
  { bg: '#D8EAD8', border: '#80C0A0', fg: '#1A4830' }, // sage
  { bg: '#F8DAE8', border: '#D888B0', fg: '#5A1840' }, // pink
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
      className="relative h-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 overflow-hidden select-none"
      style={{ background: pal.bg, border: `1.5px solid ${pal.border}`, color: pal.fg }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Category name — always visible */}
      <p className={`font-semibold truncate max-w-full px-2 ${isLarge ? 'text-sm' : 'text-[11px]'}`}>
        {d.category}
      </p>

      {/* Sell-through — large tiles show inline, small tiles on hover */}
      {isLarge ? (
        <>
          <p className={`font-bold font-mono mt-1 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
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

          {/* Hover tooltip — slides up from bottom */}
          <div
            className={`absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm transition-all duration-200 ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            style={{ background: `${pal.bg}ee` }}
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
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">카테고리별 성과 히트맵</h3>
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
