'use client';

import { TimeFilter, MediumFilter, PriceRange } from '@/lib/types';

interface Props {
  timeFilter: TimeFilter;
  mediumFilter: MediumFilter;
  priceRange: PriceRange;
  auctionHouse: string;
  onTimeChange: (v: TimeFilter) => void;
  onMediumChange: (v: MediumFilter) => void;
  onPriceChange: (v: PriceRange) => void;
  onAuctionHouseChange: (v: string) => void;
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <p className="text-[10px] text-muted uppercase tracking-widest">{label}</p>
      <div className="flex gap-1 overflow-x-auto no-scrollbar">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 ${
        active
          ? 'bg-accent/20 text-accent font-medium border border-accent/30'
          : 'bg-surface-hover text-text-secondary hover:text-foreground border border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({
  timeFilter,
  mediumFilter,
  priceRange,
  auctionHouse,
  onTimeChange,
  onMediumChange,
  onPriceChange,
  onAuctionHouseChange,
}: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 md:p-4 grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-4 lg:gap-6 md:items-end">
      <FilterGroup label="기간">
        <Chip active={timeFilter === '7d'} onClick={() => onTimeChange('7d')}>7일</Chip>
        <Chip active={timeFilter === '30d'} onClick={() => onTimeChange('30d')}>30일</Chip>
        <Chip active={timeFilter === '90d'} onClick={() => onTimeChange('90d')}>분기</Chip>
      </FilterGroup>

      <FilterGroup label="경매사">
        <Chip active={auctionHouse === 'all'} onClick={() => onAuctionHouseChange('all')}>전체</Chip>
        <Chip active={auctionHouse === 'christies'} onClick={() => onAuctionHouseChange('christies')}>CHR</Chip>
        <Chip active={auctionHouse === 'sothebys'} onClick={() => onAuctionHouseChange('sothebys')}>SOT</Chip>
      </FilterGroup>

      <FilterGroup label="매체">
        <Chip active={mediumFilter === 'all'} onClick={() => onMediumChange('all')}>전체</Chip>
        <Chip active={mediumFilter === 'painting'} onClick={() => onMediumChange('painting')}>회화</Chip>
        <Chip active={mediumFilter === 'sculpture'} onClick={() => onMediumChange('sculpture')}>조각</Chip>
        <Chip active={mediumFilter === 'photography'} onClick={() => onMediumChange('photography')}>사진</Chip>
        <Chip active={mediumFilter === 'prints'} onClick={() => onMediumChange('prints')}>판화</Chip>
      </FilterGroup>

      <FilterGroup label="가격대">
        <Chip active={priceRange === 'all'} onClick={() => onPriceChange('all')}>전체</Chip>
        <Chip active={priceRange === 'under50k'} onClick={() => onPriceChange('under50k')}>~50K</Chip>
        <Chip active={priceRange === '50k-500k'} onClick={() => onPriceChange('50k-500k')}>50-500K</Chip>
        <Chip active={priceRange === '500k-5m'} onClick={() => onPriceChange('500k-5m')}>500K-5M</Chip>
        <Chip active={priceRange === 'over5m'} onClick={() => onPriceChange('over5m')}>5M+</Chip>
      </FilterGroup>
    </div>
  );
}
