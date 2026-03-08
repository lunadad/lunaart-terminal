'use client';

import { useState, useMemo } from 'react';
import { allLots, getMarketPulse, getRisingArtists } from '@/lib/mock-data';
import { TimeFilter, MediumFilter, PriceRange } from '@/lib/types';
import MarketPulseBar from '@/components/MarketPulseBar';
import FilterBar from '@/components/FilterBar';
import LotCard from '@/components/LotCard';
import TopLotsTable from '@/components/TopLotsTable';
import SpotlightArtists from '@/components/SpotlightArtists';
import { MonthlyVolumeChart, CategoryHeatmap } from '@/components/Charts';

export default function AuctionFeedPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [mediumFilter, setMediumFilter] = useState<MediumFilter>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [auctionHouse, setAuctionHouse] = useState('all');

  const filteredLots = useMemo(() => {
    let lots = [...allLots];

    const now = new Date();
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    lots = lots.filter(l => new Date(l.saleEvent.date) >= cutoff);

    if (mediumFilter !== 'all') {
      const map: Record<string, string> = {
        painting: 'Painting',
        sculpture: 'Sculpture',
        photography: 'Photography',
        prints: 'Prints',
        nft: 'NFT',
      };
      lots = lots.filter(l => l.medium === map[mediumFilter]);
    }

    if (priceRange !== 'all') {
      lots = lots.filter(l => {
        const price = l.result.usdEquivalent || l.estimateHigh;
        switch (priceRange) {
          case 'under50k': return price < 50000;
          case '50k-500k': return price >= 50000 && price < 500000;
          case '500k-5m': return price >= 500000 && price < 5000000;
          case 'over5m': return price >= 5000000;
          default: return true;
        }
      });
    }

    if (auctionHouse !== 'all') {
      lots = lots.filter(l => l.auctionHouseId === auctionHouse);
    }

    return lots;
  }, [timeFilter, mediumFilter, priceRange, auctionHouse]);

  const pulse = useMemo(() => getMarketPulse(filteredLots), [filteredLots]);
  const risingArtists = getRisingArtists();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-foreground">Auction Feed</h1>
          <p className="text-xs md:text-sm text-muted mt-0.5">Christie&apos;s &middot; Sotheby&apos;s real-time results</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] md:text-xs text-muted font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-[10px] md:text-xs text-text-secondary">{filteredLots.length} lots</p>
        </div>
      </div>

      {/* Market Pulse */}
      <MarketPulseBar pulse={pulse} />

      {/* Filters */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyVolumeChart />
        <CategoryHeatmap />
      </div>

      {/* Spotlight Artists */}
      <SpotlightArtists artists={risingArtists} />

      {/* Top Lots Table */}
      <TopLotsTable lots={filteredLots} />

      {/* Lot Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">최근 낙찰 결과</h2>
          <span className="text-[10px] text-muted font-mono">RECENT RESULTS</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.slice(0, 30).map(lot => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-border">
        <p className="text-xs text-muted">레코드 세일 &middot; 서프라이즈 로트 &middot; 유찰 주의</p>
        <p className="text-[10px] text-muted/50 mt-1">LunaArt Terminal &copy; 2026 &middot; Data for informational purposes only</p>
      </div>
    </div>
  );
}
