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
    <div className="min-w-0 space-y-2.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="scroll-fade">
        <div className="flex gap-1 overflow-x-auto no-scrollbar pr-6">{children}</div>
      </div>
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
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
        active
          ? 'border-accent bg-accent font-medium text-white shadow-sm'
          : 'border-border bg-background/40 text-text-secondary hover:border-accent hover:text-foreground'
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
    <div className="grid grid-cols-2 gap-5 md:flex md:flex-wrap md:items-end md:gap-7">
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
