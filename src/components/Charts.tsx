'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getMonthlyVolume, getCategoryPerformance } from '@/lib/mock-data';
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

export function CategoryHeatmap() {
  const data = getCategoryPerformance();
  const { theme } = useTheme();

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">카테고리별 성과 히트맵</h3>
        <span className="text-[10px] text-muted font-mono">CATEGORY PERFORMANCE</span>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {data.map((cat) => {
          const intensity = Math.min(cat.sellThrough / 100, 1);
          const alpha = theme === 'dark' ? intensity * 0.3 : intensity * 0.15;
          const borderAlpha = theme === 'dark' ? 0.2 : 0.3;

          const bg = cat.avgOverEstimate > 20
            ? `rgba(0, 210, 106, ${alpha})`
            : cat.avgOverEstimate > 0
            ? `rgba(79, 143, 250, ${alpha})`
            : `rgba(255, 71, 87, ${alpha})`;
          const border = cat.avgOverEstimate > 20
            ? `rgba(0, 210, 106, ${borderAlpha})`
            : cat.avgOverEstimate > 0
            ? `rgba(79, 143, 250, ${borderAlpha})`
            : `rgba(255, 71, 87, ${borderAlpha})`;

          return (
            <div
              key={cat.category}
              className="rounded-lg p-3 text-center transition-all hover:scale-[1.02]"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <p className="text-xs font-medium text-foreground">{cat.category}</p>
              <p className="text-lg font-bold text-foreground mt-1">{cat.sellThrough}%</p>
              <p className="text-[10px] text-text-secondary">sell-through</p>
              <p className={`text-xs font-mono mt-1 ${cat.avgOverEstimate > 0 ? 'text-green' : 'text-red'}`}>
                {cat.avgOverEstimate > 0 ? '+' : ''}{cat.avgOverEstimate}% est.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
