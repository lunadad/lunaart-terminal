'use client';

import { MarketPulse } from '@/lib/types';
import { formatCurrency } from '@/lib/mock-data';

interface Props {
  pulse: MarketPulse;
}

export default function MarketPulseBar({ pulse }: Props) {
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
    <div className="bg-surface border border-border rounded-xl p-3 md:p-5">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <div className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
        <h2 className="text-xs md:text-sm font-semibold text-foreground tracking-wide">이달의 마켓 펄스</h2>
        <span className="text-[10px] md:text-xs text-muted ml-auto font-mono hidden sm:block">MARKET PULSE</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-0.5 md:space-y-1 min-w-0">
            <p className="text-[10px] md:text-xs text-muted uppercase tracking-wider">{m.label}</p>
            <p className={`text-lg md:text-xl lg:text-2xl font-bold ${m.color} font-mono truncate`}>{m.value}</p>
            <p className="text-[10px] md:text-xs text-text-secondary">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
