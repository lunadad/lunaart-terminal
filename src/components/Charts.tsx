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

// Sophisticated color palette keyed on avgOverEstimate performance tier
const TIER_COLORS = [
  { min: 50,  bg: '#0A6B52', border: '#0D8A6A', accent: '#4DFFC9' }, // teal-emerald: 강세
  { min: 20,  bg: '#1A4F72', border: '#1E6B9A', accent: '#7EC8E3' }, // steel-blue: 양호
  { min: 0,   bg: '#3B3B72', border: '#5050A0', accent: '#A8A8F8' }, // indigo: 보통
  { min: -99, bg: '#5C2E2E', border: '#7A3E3E', accent: '#F4A0A0' }, // muted-rose: 부진
] as const;

function getTileStyle(overEst: number) {
  return TIER_COLORS.find(t => overEst >= t.min) ?? TIER_COLORS[3];
}

function TreemapTile(props: any) {
  const { x, y, width, height, name, sellThrough, avgOverEstimate, totalVolume } = props;
  if (!width || !height || width < 2 || height < 2) return null;

  const style = getTileStyle(avgOverEstimate ?? 0);
  const pad = 6;
  const cx = x + width / 2;
  const showDetail = width > 90 && height > 70;
  const showMini = width > 50 && height > 44;

  return (
    <g>
      <rect
        x={x + 1} y={y + 1}
        width={width - 2} height={height - 2}
        rx={5}
        fill={style.bg}
        stroke={style.border}
        strokeWidth={1}
        opacity={0.92}
      />
      {showMini && (
        <>
          {/* Category name */}
          <text
            x={cx} y={y + pad + (showDetail ? 13 : height / 2 - 8)}
            textAnchor="middle" dominantBaseline="middle"
            fill={style.accent} fontSize={showDetail ? 10 : 9}
            fontWeight="600" fontFamily="system-ui, sans-serif"
            style={{ letterSpacing: '0.02em' }}
          >
            {name}
          </text>
          {/* Sell-through big number */}
          <text
            x={cx} y={y + (showDetail ? height / 2 + 4 : height / 2 + 10)}
            textAnchor="middle" dominantBaseline="middle"
            fill="#FFFFFF" fontSize={showDetail ? 20 : 14}
            fontWeight="700" fontFamily="ui-monospace, monospace"
          >
            {sellThrough}%
          </text>
          {showDetail && (
            <>
              {/* Over-estimate */}
              <text
                x={cx} y={y + height / 2 + 22}
                textAnchor="middle" dominantBaseline="middle"
                fill={style.accent} fontSize={9} opacity={0.85}
                fontFamily="ui-monospace, monospace"
              >
                {(avgOverEstimate ?? 0) >= 0 ? '+' : ''}{avgOverEstimate}% vs est.
              </text>
              {/* Volume */}
              <text
                x={cx} y={y + height - pad - 8}
                textAnchor="middle" dominantBaseline="middle"
                fill={style.accent} fontSize={9} opacity={0.65}
                fontFamily="ui-monospace, monospace"
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

  const treemapData = raw.map(d => ({
    name: d.category,
    size: Math.max(d.totalVolume, 1),
    sellThrough: d.sellThrough,
    avgOverEstimate: d.avgOverEstimate,
    totalVolume: d.totalVolume,
  }));

  const LEGEND = [
    { style: TIER_COLORS[0], label: '+50%↑' },
    { style: TIER_COLORS[1], label: '+20–50%' },
    { style: TIER_COLORS[2], label: '0–20%' },
    { style: TIER_COLORS[3], label: '0% 미만' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">카테고리별 성과 히트맵</h3>
        <span className="text-[10px] text-muted font-mono">타일 크기 = USD 매출액</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={16 / 9}
          content={<TreemapTile />}
          isAnimationActive={false}
        />
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {LEGEND.map(({ style, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}
            />
            <span className="text-[10px] text-muted">{label} est.</span>
          </div>
        ))}
        <span className="text-[10px] text-muted/50 ml-auto font-mono">sell-through %</span>
      </div>
    </div>
  );
}
