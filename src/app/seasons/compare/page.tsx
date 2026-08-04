'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { auctionSeasons, seasonStatusMeta } from '@/lib/auction-seasons';
import { allLots, formatCurrency, getMarketPulse } from '@/lib/mock-data';

function getSeasonMetrics(seasonId: string) {
  const season = auctionSeasons.find(item => item.id === seasonId)!;
  const ids = new Set(season.saleEventIds);
  const lots = allLots.filter(lot => ids.has(lot.saleEventId));
  const pulse = getMarketPulse(lots);
  const artists = new Set(lots.filter(lot => lot.result.sold).map(lot => lot.artistId)).size;
  const topLot = lots
    .filter(lot => lot.result.sold && lot.result.usdEquivalent)
    .sort((a, b) => (b.result.usdEquivalent || 0) - (a.result.usdEquivalent || 0))[0];

  return { season, lots, pulse, artists, topLot };
}

export default function SeasonComparePage() {
  const [leftId, setLeftId] = useState(auctionSeasons[0].id);
  const [rightId, setRightId] = useState(auctionSeasons[1].id);
  const left = useMemo(() => getSeasonMetrics(leftId), [leftId]);
  const right = useMemo(() => getSeasonMetrics(rightId), [rightId]);

  const metrics = [
    { label: 'Total volume', left: `$${formatCurrency(left.pulse.totalVolume)}`, right: `$${formatCurrency(right.pulse.totalVolume)}` },
    { label: 'Sell-through', left: `${(left.pulse.sellThroughRate * 100).toFixed(1)}%`, right: `${(right.pulse.sellThroughRate * 100).toFixed(1)}%` },
    { label: 'Lots offered', left: left.pulse.totalLots.toLocaleString(), right: right.pulse.totalLots.toLocaleString() },
    { label: 'Lots sold', left: left.pulse.soldLots.toLocaleString(), right: right.pulse.soldLots.toLocaleString() },
    { label: 'Tracked artists', left: left.artists.toLocaleString(), right: right.artists.toLocaleString() },
    { label: 'Vs high estimate', left: `${left.pulse.avgEstimateExcess >= 0 ? '+' : ''}${left.pulse.avgEstimateExcess.toFixed(1)}%`, right: `${right.pulse.avgEstimateExcess >= 0 ? '+' : ''}${right.pulse.avgEstimateExcess.toFixed(1)}%` },
  ];

  return (
    <div className="mx-auto max-w-[1300px] space-y-8 p-4 pb-16 md:p-8 lg:p-10">
      <header className="newbook-hero rounded-[28px] border border-border p-6 md:rounded-[34px] md:p-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted">Auction season archive</p>
        <h1 className="display-serif mt-3 text-4xl text-foreground md:text-6xl">Compare seasons</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">Only lots explicitly locked to each season are compared. Global feed updates never change these selections automatically.</p>
      </header>

      <section className="grid gap-4 rounded-[22px] border border-border bg-surface p-5 md:grid-cols-[1fr_auto_1fr] md:items-end md:p-6">
        <label>
          <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-muted">Season A</span>
          <select value={leftId} onChange={event => setLeftId(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent">
            {auctionSeasons.map(season => <option key={season.id} value={season.id}>{season.year} · {season.label}</option>)}
          </select>
        </label>
        <span className="hidden pb-3 text-xs text-muted md:block">VS</span>
        <label>
          <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-muted">Season B</span>
          <select value={rightId} onChange={event => setRightId(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent">
            {auctionSeasons.map(season => <option key={season.id} value={season.id}>{season.year} · {season.label}</option>)}
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-[22px] border border-border bg-surface">
        <div className="grid grid-cols-[minmax(100px,.7fr)_1fr_1fr] border-b border-border bg-background/50">
          <div className="p-4 text-[10px] uppercase tracking-[0.16em] text-muted">Metric</div>
          {[left, right].map(item => (
            <div key={item.season.id} className="border-l border-border p-4">
              <p className="display-serif text-lg text-foreground">{item.season.label}</p>
              <p className="mt-1 text-[10px] text-muted">{seasonStatusMeta[item.season.status].label}</p>
            </div>
          ))}
        </div>
        {metrics.map(metric => (
          <div key={metric.label} className="grid grid-cols-[minmax(100px,.7fr)_1fr_1fr] border-b border-border/60 last:border-b-0">
            <div className="p-4 text-xs text-muted">{metric.label}</div>
            <div className="border-l border-border p-4 font-mono text-sm font-semibold text-foreground md:text-base">{metric.left}</div>
            <div className="border-l border-border p-4 font-mono text-sm font-semibold text-foreground md:text-base">{metric.right}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {[left, right].map(item => (
          <div key={item.season.id} className="rounded-[22px] border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted">Top result</p>
                <h2 className="display-serif mt-2 text-2xl text-foreground">{item.season.city}</h2>
              </div>
              <Link href={`/seasons/${item.season.id}`} className="text-xs text-accent hover:underline">Open season →</Link>
            </div>
            {item.topLot ? (
              <div className="mt-6 rounded-2xl bg-background p-4">
                <p className="text-sm font-medium text-foreground">{item.topLot.artist.name}</p>
                <p className="mt-1 truncate text-xs italic text-muted">{item.topLot.title}</p>
                <p className="mt-4 font-mono text-xl font-semibold text-green">${item.topLot.result.usdEquivalent?.toLocaleString()}</p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 p-5 text-sm text-muted">Results have not been locked for this season.</div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
