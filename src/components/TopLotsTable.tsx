'use client';

import { LotWithDetails } from '@/lib/types';
import { formatFullCurrency } from '@/lib/mock-data';

interface Props {
  lots: LotWithDetails[];
}

export default function TopLotsTable({ lots }: Props) {
  const top10 = lots
    .filter(l => l.result.sold && l.result.usdEquivalent)
    .sort((a, b) => (b.result.usdEquivalent || 0) - (a.result.usdEquivalent || 0))
    .slice(0, 10);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">상위 10개 로트</h3>
        <span className="text-[10px] text-muted font-mono">TOP LOTS BY VALUE</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-muted font-medium">#</th>
              <th className="text-left py-2 px-2 text-muted font-medium">Artist</th>
              <th className="text-left py-2 px-2 text-muted font-medium">Work</th>
              <th className="text-left py-2 px-2 text-muted font-medium">House</th>
              <th className="text-right py-2 px-2 text-muted font-medium">Premium (USD)</th>
              <th className="text-right py-2 px-2 text-muted font-medium">vs Est.</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((lot, i) => {
              const ratio = lot.estimateHigh > 0
                ? ((lot.result.premiumPrice! - lot.estimateHigh) / lot.estimateHigh * 100)
                : 0;
              return (
                <tr
                  key={lot.id}
                  className="border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => window.open(lot.lotUrl, '_blank', 'noopener,noreferrer')}
                >
                  <td className="py-2.5 px-2 text-muted font-mono">{i + 1}</td>
                  <td className="py-2.5 px-2 text-foreground font-medium">{lot.artist.name}</td>
                  <td className="py-2.5 px-2 text-text-secondary italic max-w-[200px] truncate">{lot.title}</td>
                  <td className="py-2.5 px-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px]"
                      style={lot.auctionHouse.name === "Christie's"
                        ? { background: 'rgba(249,115,22,0.12)', color: '#f97316' }
                        : { background: 'rgba(139,155,0,0.14)', color: '#8b9b00' }}
                    >
                      {lot.auctionHouse.name === "Christie's" ? 'CHR' : 'SOT'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-green font-mono font-medium">
                    {formatFullCurrency(lot.result.usdEquivalent || 0, 'USD')}
                  </td>
                  <td className={`py-2.5 px-2 text-right font-mono ${ratio > 0 ? 'text-green' : 'text-red'}`}>
                    {ratio > 0 ? '+' : ''}{ratio.toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
