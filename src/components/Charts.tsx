'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Treemap,
} from 'recharts';
import { getMonthlyVolume, getCategoryPerformance, formatCurrency } from '@/lib/mock-data';
import { useTheme } from './ThemeProvider';

const COLORS = {
  christies: '#f97316',
  sothebys: '#8b9b00',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface border border-border-light rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
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

// Distinct light-pastel palette — one per category index
const CAT_PALETTE = [
  { bg: '#FFD6A5', border: '#F5A742', fg: '#6B3A00' }, // amber
  { bg: '#A8D8ED', border: '#5BAFD6', fg: '#0D3D5C' }, // sky blue
  { bg: '#B6EAD4', border: '#5CC49A', fg: '#0A4A2A' }, // mint
  { bg: '#FFBDBD', border: '#F07070', fg: '#6B1515' }, // rose
  { bg: '#CAD0F0', border: '#8892D8', fg: '#1E2870' }, // lavender
  { bg: '#FFD9BD', border: '#F0A060', fg: '#6A3300' }, // peach
  { bg: '#B6D8C6', border: '#68B890', fg: '#144030' }, // sage
  { bg: '#F4CADF', border: '#D878AB', fg: '#5A1038' }, // pink
  { bg: '#D6EAA8', border: '#9AC84A', fg: '#2A4A00' }, // lime
  { bg: '#D0E8F8', border: '#70B8E8', fg: '#0A2A5A' }, // powder blue
] as const;

const SANS  = 'var(--font-geist-sans), -apple-system, system-ui, sans-serif';
const MONO  = 'var(--font-geist-mono), ui-monospace, monospace';

function TreemapTile(props: any) {
  const { x, y, width, height, name, sellThrough, avgOverEstimate, totalVolume, colorIdx } = props;
  if (!width || !height || width < 3 || height < 3) return null;

  const pal = CAT_PALETTE[((colorIdx ?? 0) as number) % CAT_PALETTE.length] ?? CAT_PALETTE[0];
  const cx  = x + width / 2;
  const cy  = y + height / 2;

  const showFull   = width > 120 && height > 100;
  const showMedium = width > 60  && height > 48;
  const showMin    = width > 30  && height > 24;

  // vertical rhythm for full tile
  const nameY    = cy - (showFull ? 30 : 16);
  const pctY     = cy + (showFull ? 4 : 3);
  const labelY   = cy + (showFull ? 30 : 22);
  const estY     = cy + (showFull ? 48 : 0);
  const volY     = y + height - 13;

  return (
    <g>
      <rect
        x={x + 1.5} y={y + 1.5}
        width={width - 3} height={height - 3}
        rx={7}
        fill={pal.bg}
        stroke={pal.border}
        strokeWidth={1.5}
      />

      {showMin && (
        <>
          {/* Big sell-through number */}
          <text
            x={cx} y={pctY}
            textAnchor="middle" dominantBaseline="middle"
            fill={pal.fg}
            fontSize={showFull ? 36 : showMedium ? 24 : 15}
            fontWeight="800"
            style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums' }}
          >
            {sellThrough}%
          </text>

          {showMedium && (
            <>
              {/* Category name */}
              <text
                x={cx} y={nameY}
                textAnchor="middle" dominantBaseline="middle"
                fill={pal.fg}
                fontSize={showFull ? 14 : 12}
                fontWeight="700"
                style={{ fontFamily: SANS, letterSpacing: '0.02em' }}
              >
                {name}
              </text>

              {/* sell-through sub-label */}
              <text
                x={cx} y={labelY}
                textAnchor="middle" dominantBaseline="middle"
                fill={pal.fg}
                fontSize={showFull ? 12 : 10}
                fontWeight="500"
                style={{ fontFamily: SANS }}
                opacity={0.6}
              >
                낙찰률
              </text>
            </>
          )}

          {showFull && (
            <>
              {/* vs estimate */}
              <text
                x={cx} y={estY}
                textAnchor="middle" dominantBaseline="middle"
                fill={pal.fg}
                fontSize={13}
                fontWeight="600"
                style={{ fontFamily: MONO }}
                opacity={0.8}
              >
                {(avgOverEstimate ?? 0) >= 0 ? '+' : ''}{avgOverEstimate}% est.
              </text>

              {/* Volume — pinned to bottom */}
              <text
                x={cx} y={volY}
                textAnchor="middle" dominantBaseline="middle"
                fill={pal.fg}
                fontSize={12}
                fontWeight="500"
                style={{ fontFamily: MONO }}
                opacity={0.55}
              >
                ${formatCurrency(totalVolume ?? 0)}
              </text>
            </>
          )}
        </>
      )}
    </g>
  );
}

export function CategoryHeatmap() {
  const raw = getCategoryPerformance();

  const treemapData = raw.map((d, i) => ({
    name: d.category,
    size: Math.max(d.totalVolume, 1),
    sellThrough: d.sellThrough,
    avgOverEstimate: d.avgOverEstimate,
    totalVolume: d.totalVolume,
    colorIdx: i,
  }));

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">카테고리별 성과 히트맵</h3>
        <span className="text-[10px] text-muted font-mono">타일 크기 = USD 매출액</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={16 / 9}
          content={<TreemapTile />}
          isAnimationActive={false}
        />
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {treemapData.map(d => (
          <div key={d.name} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{
                background: CAT_PALETTE[d.colorIdx % CAT_PALETTE.length].bg,
                border: `1px solid ${CAT_PALETTE[d.colorIdx % CAT_PALETTE.length].border}`,
              }}
            />
            <span className="text-[10px] text-muted whitespace-nowrap">{d.name}</span>
          </div>
        ))}
        <span className="text-[10px] text-muted/50 ml-auto font-mono hidden sm:inline">sell-through %</span>
      </div>
    </div>
  );
}
