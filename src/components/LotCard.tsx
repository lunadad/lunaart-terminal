'use client';

import { LotWithDetails } from '@/lib/types';
import { formatFullCurrency } from '@/lib/mock-data';

interface Props {
  lot: LotWithDetails;
}

export default function LotCard({ lot }: Props) {
  const estimateRatio = lot.result.premiumPrice && lot.estimateHigh > 0
    ? ((lot.result.premiumPrice - lot.estimateHigh) / lot.estimateHigh) * 100
    : null;

  const isRecord = estimateRatio !== null && estimateRatio > 80;
  const isSurprise = estimateRatio !== null && estimateRatio > 40 && estimateRatio <= 80;

  return (
    <a
      href={lot.lotUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block min-w-0 overflow-hidden rounded-[22px] border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-border-light hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-surface ${
          lot.auctionHouseId === 'christies'
            ? 'bg-[linear-gradient(135deg,#f0a45d,#672d45)]'
            : 'bg-[linear-gradient(135deg,#b7c65a,#21334b)]'
        }`}
      >
        {lot.imageUrl && (
          <div
            className="absolute inset-3 rounded-[15px] bg-center bg-contain bg-no-repeat transition-transform duration-700 group-hover:scale-[1.035]"
            style={{ backgroundImage: `url("${lot.imageUrl}")` }}
            role="img"
            aria-label={`${lot.artist.name}, ${lot.title}`}
          />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full border border-white/20 bg-background/85 px-3 py-1.5 text-[10px] font-medium text-foreground backdrop-blur-md">
            {lot.auctionHouse.name} · LOT {lot.lotNumber}
          </span>
          {(isRecord || isSurprise || !lot.result.sold) && (
            <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${
              !lot.result.sold
                ? 'bg-red text-white'
                : isRecord
                  ? 'bg-yellow text-black'
                  : 'bg-green text-black'
            }`}>
              {!lot.result.sold ? 'UNSOLD' : isRecord ? 'RECORD' : 'SURPRISE'}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display-serif text-lg leading-tight text-foreground group-hover:text-accent">
              {lot.artist.name}
            </h3>
            <p className="mt-1 truncate text-sm italic text-text-secondary">
              {lot.title}{lot.year ? `, ${lot.year}` : ''}
            </p>
          </div>
          {estimateRatio !== null && (
            <span className={`shrink-0 text-xs font-mono font-semibold ${estimateRatio >= 0 ? 'text-green' : 'text-red'}`}>
              {estimateRatio > 0 ? '+' : ''}{estimateRatio.toFixed(0)}%
            </span>
          )}
        </div>

        {lot.result.sold ? (
          <p className="mt-3 text-sm font-mono font-semibold text-foreground">
            {formatFullCurrency(lot.result.premiumPrice!, lot.currency)}
            <span className="ml-2 text-[10px] font-sans font-normal uppercase tracking-wider text-muted">incl. premium</span>
          </p>
        ) : (
          <p className="mt-3 text-sm font-medium text-red">Passed / Unsold</p>
        )}
        <p className="mt-3 border-t border-border pt-3 truncate text-[11px] text-muted">
          {lot.saleEvent.name} · {lot.saleEvent.city} · {lot.saleEvent.date}
        </p>
      </div>
    </a>
  );
}
