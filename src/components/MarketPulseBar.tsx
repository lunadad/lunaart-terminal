'use client';

import { MarketPulse } from '@/lib/types';
import { formatCurrency } from '@/lib/mock-data';

interface Props {
  pulse: MarketPulse;
  houseBreakdown?: {
    id: string;
    name: string;
    totalVolume: number;
    soldLots: number;
    totalLots: number;
  }[];
}

const HOUSE_COLORS: Record<string, string> = {
  christies: 'text-orange',
  sothebys: 'text-accent',
};

export default function MarketPulseBar({ pulse, houseBreakdown = [] }: Props) {
  const metrics = [
    {
      label: '총 거래액',
      value: `$${formatCurrency(pulse.totalVolume)}`,
      sub: `${pulse.soldLots} lots sold`,
      color: 'text-accent',
    },
    {
      label: '판매율',
      value: `${(pulse.sellThroughRate * 100).toFixed(1)}%`,
      sub: `${pulse.totalLots} offered`,
      color: pulse.sellThroughRate > 0.75 ? 'text-green' : 'text-orange',
    },
    {
      label: '추정가 초과율',
      value: `${pulse.avgEstimateExcess > 0 ? '+' : ''}${pulse.avgEstimateExcess.toFixed(1)}%`,
      sub: 'vs High Estimate',
      color: pulse.avgEstimateExcess > 0 ? 'text-green' : 'text-red',
    },
    {
      label: '총 로트',
      value: pulse.totalLots.toString(),
      sub: `${pulse.totalLots - pulse.soldLots} unsold`,
      color: 'text-foreground',
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <div className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
        <h2 className="text-xs font-bold text-foreground tracking-wide">이달의 마켓 펄스</h2>
        <span className="text-[10px] md:text-xs text-muted ml-auto font-mono hidden sm:block">MARKET PULSE</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="min-w-0 space-y-1 border-b border-r hairline p-4 transition-colors hover:bg-surface-hover last:border-r-0 lg:border-b-0 md:p-5">
            <p className="text-[10px] md:text-xs text-muted uppercase tracking-wider">{m.label}</p>
            <p className={`text-xl lg:text-2xl font-bold tracking-[-0.035em] ${m.color} truncate`}>{m.value}</p>
            <p className="text-[10px] md:text-xs text-text-secondary">{m.sub}</p>
          </div>
        ))}
      </div>
      {houseBreakdown.length > 0 && (
        <div className="grid grid-cols-1 border-t hairline sm:grid-cols-2">
          {houseBreakdown.map((house) => (
            <div key={house.id} className="flex min-w-0 items-center justify-between gap-3 border-b hairline px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 md:px-6">
              <div className="min-w-0">
                <p className="text-[10px] text-muted uppercase tracking-wider truncate">{house.name}</p>
                <p className={`text-sm md:text-base font-bold font-mono ${HOUSE_COLORS[house.id] || 'text-foreground'}`}>
                  ${formatCurrency(house.totalVolume)}
                </p>
              </div>
              <p className="text-[10px] md:text-xs text-text-secondary font-mono shrink-0">
                {house.soldLots}/{house.totalLots} sold
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
