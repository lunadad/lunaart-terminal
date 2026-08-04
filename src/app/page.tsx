'use client';

import { useMemo, useState } from 'react';
import { allLots, auctionHouses, formatCurrency, getMarketPulse, getRisingArtists } from '@/lib/mock-data';
import { MediumFilter, PriceRange, TimeFilter } from '@/lib/types';
import MarketPulseBar from '@/components/MarketPulseBar';
import FilterBar from '@/components/FilterBar';
import LotCard from '@/components/LotCard';
import TopLotsTable from '@/components/TopLotsTable';
import SpotlightArtists from '@/components/SpotlightArtists';
import { CategoryHeatmap, MonthlyVolumeChart } from '@/components/Charts';

const SearchIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
  </svg>
);

export default function AuctionFeedPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [mediumFilter, setMediumFilter] = useState<MediumFilter>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [auctionHouse, setAuctionHouse] = useState('all');
  const [query, setQuery] = useState('');

  const filteredLots = useMemo(() => {
    const now = new Date(allLots[0]?.saleEvent.date || '2026-01-01');
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return allLots.filter((lot) => {
      if (new Date(lot.saleEvent.date) < cutoff) return false;
      if (auctionHouse !== 'all' && lot.auctionHouseId !== auctionHouse) return false;

      if (mediumFilter !== 'all') {
        const mediumMap: Record<string, string> = {
          painting: 'Painting',
          sculpture: 'Sculpture',
          photography: 'Photography',
          prints: 'Prints',
          nft: 'NFT',
        };
        if (lot.medium !== mediumMap[mediumFilter]) return false;
      }

      if (priceRange !== 'all') {
        const price = lot.result.usdEquivalent || lot.estimateHigh;
        if (priceRange === 'under50k' && price >= 50_000) return false;
        if (priceRange === '50k-500k' && (price < 50_000 || price >= 500_000)) return false;
        if (priceRange === '500k-5m' && (price < 500_000 || price >= 5_000_000)) return false;
        if (priceRange === 'over5m' && price < 5_000_000) return false;
      }

      if (normalizedQuery) {
        const haystack = [
          lot.artist.name,
          lot.title,
          lot.saleEvent.name,
          lot.saleEvent.city,
          lot.medium,
          lot.auctionHouse.name,
        ].join(' ').toLocaleLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [auctionHouse, mediumFilter, priceRange, query, timeFilter]);

  const pulse = useMemo(() => getMarketPulse(filteredLots), [filteredLots]);
  const houseBreakdown = useMemo(() => auctionHouses.map((house) => {
    const houseLots = filteredLots.filter(lot => lot.auctionHouseId === house.id);
    const housePulse = getMarketPulse(houseLots);

    return {
      id: house.id,
      name: house.name,
      totalVolume: housePulse.totalVolume,
      soldLots: housePulse.soldLots,
      totalLots: housePulse.totalLots,
    };
  }), [filteredLots]);

  const topLots = useMemo(
    () => filteredLots
      .filter(lot => lot.result.sold)
      .sort((a, b) => (b.result.usdEquivalent || 0) - (a.result.usdEquivalent || 0)),
    [filteredLots],
  );
  const latestDate = allLots[0]?.saleEvent.date || '—';
  const risingArtists = getRisingArtists();

  return (
    <div className="mx-auto max-w-[1640px] px-3 pb-16 md:px-7 lg:px-10">
      <header className="newbook-hero soft-shadow mt-3 overflow-hidden rounded-[28px] border border-border px-5 pb-6 pt-5 md:mt-6 md:rounded-[36px] md:px-10 md:pb-10 md:pt-8 lg:px-14">
        <div className="mb-12 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green" /> Live auction intelligence</span>
          <span className="rounded-full border border-border bg-background/50 px-3 py-1.5 backdrop-blur">Data through {latestDate}</span>
        </div>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
          <div>
            <h1 className="editorial-display max-w-5xl text-foreground">
              Discover the market.
              <br />
              Follow the signal.
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-text-secondary md:text-base">
              Christie&apos;s와 Sotheby&apos;s의 최신 낙찰 결과를 한곳에서 비교하고,
              가격 흐름과 작가 모멘텀을 빠르게 읽어보세요.
            </p>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-background/50 backdrop-blur">
            <div className="border-r border-border p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Tracked lots</p>
              <p className="display-serif mt-2 text-4xl text-foreground">{filteredLots.length}</p>
            </div>
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Volume</p>
              <p className="display-serif mt-2 text-4xl text-foreground">${formatCurrency(pulse.totalVolume)}</p>
            </div>
          </div>
        </div>

        <label className="mt-10 flex items-center gap-3 rounded-full border border-border bg-background/80 px-5 py-4 text-muted shadow-sm backdrop-blur transition-all focus-within:border-accent focus-within:text-accent focus-within:shadow-md md:max-w-3xl">
          <SearchIcon />
          <span className="sr-only">작가, 작품 또는 경매 검색</span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search artists, works, auctions, cities…"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted md:text-lg"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs uppercase tracking-wider text-muted hover:text-foreground"
            >
              Clear
            </button>
          )}
        </label>
      </header>

      <section className="my-5 rounded-2xl border border-border bg-surface px-4 py-5 md:px-6">
        <FilterBar
          timeFilter={timeFilter}
          mediumFilter={mediumFilter}
          priceRange={priceRange}
          auctionHouse={auctionHouse}
          onTimeChange={setTimeFilter}
          onMediumChange={setMediumFilter}
          onPriceChange={setPriceRange}
          onAuctionHouseChange={setAuctionHouse}
        />
      </section>

      <section className="py-10 md:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Market overview</p>
            <h2 className="display-serif mt-2 text-3xl text-foreground md:text-4xl">What the latest sales are saying</h2>
          </div>
          <p className="hidden text-right text-xs text-muted md:block">Filtered in real time</p>
        </div>
        <MarketPulseBar pulse={pulse} houseBreakdown={houseBreakdown} />
      </section>

      <section className="grid grid-cols-1 gap-6 border-t hairline py-10 md:py-14 xl:grid-cols-2">
        <MonthlyVolumeChart />
        <CategoryHeatmap />
      </section>

      {topLots.length > 0 && (
        <section className="border-t hairline py-10 md:py-14">
          <TopLotsTable lots={filteredLots} />
        </section>
      )}

      <section className="border-t hairline py-10 md:py-14">
        <SpotlightArtists artists={risingArtists} />
      </section>

      <section className="border-t hairline py-10 md:py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">At auction</p>
            <h2 className="display-serif mt-2 text-3xl text-foreground md:text-4xl">Recent results</h2>
          </div>
          <p className="text-xs text-muted">{filteredLots.length} lots</p>
        </div>

        {filteredLots.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredLots.slice(0, 24).map(lot => <LotCard key={lot.id} lot={lot} />)}
          </div>
        ) : (
          <div className="border-y hairline py-20 text-center">
            <p className="text-xl text-foreground">조건에 맞는 낙찰 결과가 없습니다.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setTimeFilter('90d');
                setMediumFilter('all');
                setPriceRange('all');
                setAuctionHouse('all');
              }}
              className="mt-5 border-b border-foreground pb-1 text-sm text-foreground"
            >
              모든 필터 초기화
            </button>
          </div>
        )}
      </section>

      <footer className="flex flex-col gap-3 border-t hairline py-8 text-[10px] uppercase tracking-[0.15em] text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>LunaArt Terminal © 2026</span>
        <span>Results for market intelligence only</span>
      </footer>
    </div>
  );
}
