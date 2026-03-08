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
      className={`block bg-surface border rounded-xl p-4 transition-all hover:border-border-light hover:bg-surface-hover group ${
        isRecord ? 'border-yellow/30' : isSurprise ? 'border-green/20' : 'border-border'
      }`}
    >
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide ${
          lot.auctionHouse.name === "Christie's"
            ? 'bg-red/10 text-red'
            : 'bg-accent/10 text-accent'
        }`}>
          {lot.auctionHouse.name}
        </span>
        <span className="text-[10px] text-muted font-mono">LOT {lot.lotNumber}</span>
        {isRecord && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow/10 text-yellow ml-auto">
            RECORD
          </span>
        )}
        {isSurprise && !isRecord && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green/10 text-green ml-auto">
            SURPRISE
          </span>
        )}
        {!lot.result.sold && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red/10 text-red ml-auto">
            UNSOLD
          </span>
        )}
      </div>

      {/* Artist & Title */}
      <h3 className="text-sm font-semibold text-foreground leading-tight">{lot.artist.name}</h3>
      <p className="text-xs text-text-secondary mt-0.5 italic">{lot.title}, {lot.year}</p>
      <p className="text-[10px] text-muted mt-1">{lot.medium} &middot; {lot.dimensions}</p>

      {/* Prices */}
      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted">Estimate</span>
          <span className="text-text-secondary font-mono">
            {formatFullCurrency(lot.estimateLow, lot.currency)} – {formatFullCurrency(lot.estimateHigh, lot.currency)}
          </span>
        </div>
        {lot.result.sold ? (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Hammer</span>
              <span className="text-foreground font-mono font-medium">
                {formatFullCurrency(lot.result.hammerPrice!, lot.currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">w/ Premium</span>
              <span className="text-green font-mono font-bold">
                {formatFullCurrency(lot.result.premiumPrice!, lot.currency)}
              </span>
            </div>
            {lot.currency !== 'USD' && lot.result.usdEquivalent && (
              <div className="flex justify-between text-xs">
                <span className="text-muted">USD</span>
                <span className="text-accent font-mono">
                  ${lot.result.usdEquivalent.toLocaleString()}
                </span>
              </div>
            )}
            {estimateRatio !== null && (
              <div className="flex justify-between text-xs">
                <span className="text-muted">vs Estimate</span>
                <span className={`font-mono font-medium ${estimateRatio > 0 ? 'text-green' : 'text-red'}`}>
                  {estimateRatio > 0 ? '+' : ''}{estimateRatio.toFixed(0)}%
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-red font-medium">Passed / Unsold</div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted">{lot.saleEvent.name}</span>
        <span className="text-[10px] text-muted">{lot.saleEvent.city} &middot; {lot.saleEvent.date}</span>
      </div>
    </a>
  );
}
