import Link from 'next/link';
import { notFound } from 'next/navigation';
import SeasonSelector from '@/components/SeasonSelector';
import { allLots, formatCurrency, getMarketPulse } from '@/lib/mock-data';
import { auctionSeasonMap, auctionSeasons, seasonStatusMeta } from '@/lib/auction-seasons';
import { LotWithDetails } from '@/lib/types';

export const dynamicParams = false;

export function generateStaticParams() {
  return auctionSeasons.map(season => ({ slug: season.id }));
}

function getCategoryStats(lots: LotWithDetails[]) {
  const categories = new Map<string, { total: number; sold: number; volume: number }>();
  lots.forEach(lot => {
    const key = lot.artist.category || 'Other';
    const current = categories.get(key) || { total: 0, sold: 0, volume: 0 };
    current.total += 1;
    if (lot.result.sold) {
      current.sold += 1;
      current.volume += lot.result.usdEquivalent || 0;
    }
    categories.set(key, current);
  });
  return Array.from(categories.entries())
    .map(([category, values]) => ({
      category,
      ...values,
      sellThrough: values.total > 0 ? (values.sold / values.total) * 100 : 0,
    }))
    .sort((a, b) => b.volume - a.volume);
}

function getArtistStats(lots: LotWithDetails[]) {
  const artists = new Map<string, { id: string; name: string; lots: number; volume: number; topPrice: number }>();
  lots.filter(lot => lot.result.sold).forEach(lot => {
    const price = lot.result.usdEquivalent || 0;
    const current = artists.get(lot.artistId) || { id: lot.artistId, name: lot.artist.name, lots: 0, volume: 0, topPrice: 0 };
    current.lots += 1;
    current.volume += price;
    current.topPrice = Math.max(current.topPrice, price);
    artists.set(lot.artistId, current);
  });
  return Array.from(artists.values()).sort((a, b) => b.volume - a.volume).slice(0, 5);
}

const statusClasses = {
  final: 'border-green/30 bg-green/10 text-green',
  partial: 'border-orange/30 bg-orange/10 text-orange',
  scheduled: 'border-accent/30 bg-accent/10 text-accent',
};

export default async function AuctionSeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const season = auctionSeasonMap[slug];
  if (!season) notFound();

  const seasonIds = new Set(season.saleEventIds);
  const lots = allLots.filter(lot => seasonIds.has(lot.saleEventId));
  const pulse = getMarketPulse(lots);
  const categories = getCategoryStats(lots);
  const artists = getArtistStats(lots);
  const topLots = lots
    .filter(lot => lot.result.sold && lot.result.usdEquivalent)
    .sort((a, b) => (b.result.usdEquivalent || 0) - (a.result.usdEquivalent || 0))
    .slice(0, 10);
  const maxCategoryVolume = Math.max(...categories.map(category => category.volume), 1);
  const houses = ['christies', 'sothebys'].map(id => {
    const houseLots = lots.filter(lot => lot.auctionHouseId === id);
    return { id, name: id === 'christies' ? "Christie's" : "Sotheby's", pulse: getMarketPulse(houseLots) };
  });
  const status = seasonStatusMeta[season.status];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-6 sm:px-6 sm:py-10">
      <SeasonSelector currentId={season.id} />

      <header className="newbook-hero overflow-hidden rounded-[28px] border border-border p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted">Auction season archive</p>
          <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] ${statusClasses[season.status]}`}>
            {status.label}
          </span>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_300px] md:items-end">
          <div>
            <p className="text-sm text-muted">{season.year} · {season.dateRange}</p>
            <h1 className="display-serif mt-2 text-3xl leading-none text-foreground sm:text-4xl">{season.city}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">{season.description}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-5 backdrop-blur">
            <p className="text-xs font-medium text-foreground">Snapshot policy</p>
            <p className="mt-2 text-xs leading-5 text-muted">{status.description}</p>
            <p className="mt-4 font-mono text-[10px] text-muted">
              {season.capturedAt ? `Captured ${season.capturedAt}` : 'Awaiting final results'}
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/seasons/compare" className="rounded-full bg-accent px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-85">
            Compare seasons
          </Link>
          <Link href="/calendar" className="rounded-full border border-border bg-background/50 px-5 py-2.5 text-xs text-foreground hover:border-accent">
            Open calendar
          </Link>
        </div>
      </header>

      {lots.length > 0 ? (
        <>
          <section>
            <div className="mb-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Season snapshot</p>
              <h2 className="display-serif mt-1 text-xl text-foreground sm:text-2xl">Market at a glance</h2>
            </div>
            <div className="grid grid-cols-2 overflow-hidden rounded-[22px] border border-border bg-surface lg:grid-cols-4">
              {[
                ['Volume', `$${formatCurrency(pulse.totalVolume)}`],
                ['Sell-through', `${(pulse.sellThroughRate * 100).toFixed(1)}%`],
                ['Lots sold', `${pulse.soldLots}/${pulse.totalLots}`],
                ['Vs high estimate', `${pulse.avgEstimateExcess >= 0 ? '+' : ''}${pulse.avgEstimateExcess.toFixed(1)}%`],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-r border-border p-5 last:border-r-0 lg:border-b-0 md:p-6">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[22px] border border-border bg-surface p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="display-serif text-xl text-foreground">Auction houses</h2>
                <span className="text-[10px] font-mono text-muted">SEASON ONLY</span>
              </div>
              <div className="space-y-3">
                {houses.map(house => (
                  <div key={house.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-muted">{house.name}</p>
                        <p className="mt-1 text-2xl font-semibold text-foreground">${formatCurrency(house.pulse.totalVolume)}</p>
                      </div>
                      <p className="text-right font-mono text-xs text-muted">{house.pulse.soldLots}/{house.pulse.totalLots} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-border bg-surface p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="display-serif text-xl text-foreground">Category heatmap</h2>
                <span className="text-[10px] font-mono text-muted">VOLUME</span>
              </div>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.category}>
                    <div className="mb-1.5 flex items-end justify-between gap-3 text-xs">
                      <span className="font-medium text-foreground">{category.category}</span>
                      <span className="font-mono text-muted">${formatCurrency(category.volume)} · {category.sellThrough.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-background">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(4, (category.volume / maxCategoryVolume) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]">
            <div className="overflow-hidden rounded-[22px] border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="display-serif text-xl text-foreground">Top 10 lots</h2>
                <span className="text-[10px] font-mono text-muted">BY USD VALUE</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-xs">
                  <thead><tr className="border-b border-border text-left text-muted">
                    <th className="p-3 font-medium">#</th><th className="p-3 font-medium">Artist</th><th className="p-3 font-medium">Work</th><th className="p-3 font-medium">House</th><th className="p-3 text-right font-medium">Premium</th>
                  </tr></thead>
                  <tbody>{topLots.map((lot, index) => (
                    <tr key={lot.id} className="border-b border-border/50 hover:bg-surface-hover">
                      <td className="p-3 font-mono text-muted">{index + 1}</td>
                      <td className="p-3 font-medium text-foreground">{lot.artist.name}</td>
                      <td className="max-w-[220px] p-3"><a className="block truncate italic text-text-secondary hover:text-accent" href={lot.lotUrl} target="_blank" rel="noreferrer">{lot.title}</a></td>
                      <td className="p-3 text-muted">{lot.auctionHouse.name}</td>
                      <td className="p-3 text-right font-mono text-green">${lot.result.usdEquivalent?.toLocaleString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[22px] border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="display-serif text-xl text-foreground">Leading artists</h2>
                <span className="text-[10px] font-mono text-muted">TOP 5</span>
              </div>
              <div className="space-y-2">
                {artists.map((artist, index) => (
                  <div key={artist.id} className="flex items-center gap-3 rounded-2xl bg-background p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{artist.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted">{artist.lots} sold · top ${formatCurrency(artist.topPrice)}</p>
                    </div>
                    <span className="font-mono text-xs text-foreground">${formatCurrency(artist.volume)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[22px] border border-accent/25 bg-accent/5 px-6 py-12 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">Results pending</p>
          <h2 className="display-serif mt-3 text-3xl text-foreground">This season is isolated and ready.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Results will appear here only after they are verified and explicitly attached to this season. Later market records will never be included automatically.</p>
        </section>
      )}

      <section className="rounded-[22px] border border-border bg-surface p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Included sales</p><h2 className="display-serif mt-2 text-2xl text-foreground">Auction line-up</h2></div>
          <p className="font-mono text-[10px] text-muted">{season.auctions.length} auctions</p>
        </div>
        <div className="space-y-2">
          {season.auctions.map(auction => (
            <a key={`${auction.house}-${auction.name}`} href={auction.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 hover:border-accent">
              <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${auction.house === 'christies' ? 'bg-orange/10 text-orange' : 'bg-accent/10 text-accent'}`}>{auction.house === 'christies' ? 'CHR' : 'SOT'}</span>
              <span className="w-20 shrink-0 font-mono text-[10px] text-muted">{auction.date}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground group-hover:text-accent">{auction.name}</span>
              <span className="hidden rounded-full border border-border px-2 py-1 text-[9px] uppercase text-muted sm:block">{auction.saleEventId ? 'captured' : auction.kind}</span>
              <span className="text-muted">↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
