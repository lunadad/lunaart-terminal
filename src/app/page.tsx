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
  const leadLot = topLots[0];

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 lg:px-8">
      <header className="pt-7 sm:pt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-accent">TODAY&apos;S MARKET SIGNAL</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-foreground sm:text-3xl">오늘의 경매 인텔리전스</h1>
          </div>
          <p className="hidden text-sm text-text-secondary sm:block">데이터 기준 {latestDate}</p>
        </div>
        <p className="mt-2 text-sm text-text-secondary sm:hidden">데이터 기준 {latestDate}</p>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          {leadLot ? (
            <a
              href={leadLot.lotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative min-h-[360px] overflow-hidden rounded-2xl bg-surface-hover sm:min-h-[470px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.025]"
                style={{ backgroundImage: leadLot.imageUrl ? `url("${leadLot.imageUrl}")` : undefined }}
                role="img"
                aria-label={`${leadLot.artist.name}, ${leadLot.title}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/15" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">
                  <span className="rounded-full border border-white/30 px-2.5 py-1">Top lot</span>
                  <span>{leadLot.auctionHouse.name} · Lot {leadLot.lotNumber}</span>
                </div>
                <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">{leadLot.artist.name}</h2>
                <p className="mt-2 line-clamp-1 text-sm text-white/80 sm:text-base">{leadLot.title}{leadLot.year ? `, ${leadLot.year}` : ''}</p>
                <p className="mt-4 font-mono text-xl font-bold sm:text-2xl">{formatCurrency(leadLot.result.usdEquivalent || 0)} USD</p>
              </div>
            </a>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="newbook-hero rounded-2xl border border-border p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">Market brief</p>
              <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.035em] text-foreground">숫자보다 먼저,<br />시장의 방향을 읽으세요.</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">Christie&apos;s와 Sotheby&apos;s의 최신 낙찰 결과, 가격 흐름, 작가 모멘텀을 한 화면에서 비교합니다.</p>
              <div className="mt-5 grid grid-cols-2 divide-x divide-border border-t border-border pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Tracked lots</p>
                  <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-foreground">{filteredLots.length}</p>
                </div>
                <div className="pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Volume</p>
                  <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-foreground">${formatCurrency(pulse.totalVolume)}</p>
                </div>
              </div>
            </div>

            <label className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface px-5 text-muted transition-all focus-within:border-accent focus-within:text-accent focus-within:ring-2 focus-within:ring-accent/10">
              <SearchIcon />
              <span className="sr-only">작가, 작품 또는 경매 검색</span>
              <input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="작가, 작품, 경매 검색"
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted"
              />
              {query && <button type="button" onClick={() => setQuery('')} className="text-[10px] font-bold uppercase tracking-wider text-muted hover:text-foreground">Clear</button>}
            </label>
          </div>
        </div>
      </header>

      <section className="my-4 rounded-2xl border border-border bg-surface px-4 py-4 md:px-5">
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

      <section className="py-10 md:py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Market overview</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-foreground md:text-3xl">최근 세일이 말해주는 것</h2>
          </div>
          <p className="hidden text-right text-xs text-muted md:block">Filtered in real time</p>
        </div>
        <MarketPulseBar pulse={pulse} houseBreakdown={houseBreakdown} />
      </section>

      <section className="grid grid-cols-1 gap-4 border-t hairline py-10 md:py-12 xl:grid-cols-2">
        <MonthlyVolumeChart />
        <CategoryHeatmap />
      </section>

      {topLots.length > 0 && (
        <section className="border-t hairline py-10 md:py-12">
          <TopLotsTable lots={filteredLots} />
        </section>
      )}

      <section className="border-t hairline py-10 md:py-12">
        <SpotlightArtists artists={risingArtists} />
      </section>

      <section className="border-t hairline py-10 md:py-12">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">At auction</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-foreground md:text-3xl">최근 낙찰 결과</h2>
          </div>
          <p className="text-xs text-muted">{filteredLots.length} lots</p>
        </div>

        {filteredLots.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
