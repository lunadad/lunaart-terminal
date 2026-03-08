'use client';

import { RisingArtist } from '@/lib/types';
import { formatCurrency } from '@/lib/mock-data';

interface Props {
  artists: RisingArtist[];
}

export default function SpotlightArtists({ artists }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 md:p-5">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-foreground">오늘 주목 작가 5인</h3>
        <span className="text-[10px] text-muted font-mono">RISING ARTISTS</span>
      </div>
      <div className="space-y-2 md:space-y-3">
        {artists.map((ra, i) => (
          <div
            key={ra.artist.id}
            className="flex items-start gap-2.5 md:gap-4 p-2.5 md:p-3 rounded-lg bg-background hover:bg-surface-hover transition-all border border-transparent hover:border-border-light"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <span className="text-xs md:text-sm font-bold text-accent">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <h4 className="text-xs md:text-sm font-semibold text-foreground truncate">{ra.artist.name}</h4>
                <span className="px-1.5 py-0.5 rounded bg-green/10 text-green text-[10px] font-mono font-medium shrink-0">
                  +{ra.momentum}%
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-text-secondary mt-0.5 line-clamp-2">{ra.reason}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 md:mt-2 text-[10px] text-muted">
                <span>${formatCurrency(ra.recentVolume)}</span>
                <span>avg ${formatCurrency(ra.avgPrice)}</span>
                <span>{ra.lotsSold} lots</span>
              </div>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-[10px] text-muted">{ra.artist.nationality}</p>
              <p className="text-[10px] text-muted">{ra.artist.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
