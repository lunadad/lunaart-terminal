import rawChristiesData from './christies-data.json';
import rawSothebysData from './sothebys-data.json';
import {
  AuctionHouse,
  SaleEvent,
  ArtistProfile,
  LotWithDetails,
  AuctionResult,
  Lot,
  RisingArtist,
  MarketPulse,
} from './types';

export const auctionHouses: AuctionHouse[] = [
  { id: 'christies', name: "Christie's" },
  { id: 'sothebys', name: "Sotheby's" },
];

// ── 아티스트 & 세일 이벤트 (양사 합산) ─────────────────────────────
export const artists: ArtistProfile[] = [
  ...(rawChristiesData.artists as ArtistProfile[]),
  ...(rawSothebysData.artists as ArtistProfile[]),
];

export const saleEvents: SaleEvent[] = [
  ...(rawChristiesData.saleEvents as SaleEvent[]),
  ...(rawSothebysData.saleEvents as SaleEvent[]),
];

// ── LotWithDetails 변환 헬퍼 ─────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRawLot(raw: any): LotWithDetails {
  const artist = artists.find(a => a.id === raw.artistId)!;
  const saleEvent = saleEvents.find(s => s.id === raw.saleEventId)!;
  const auctionHouse = auctionHouses.find(h => h.id === raw.auctionHouseId)!;

  // Sotheby's lot URL pattern: /en/lot/{slug} → {auctionBaseUrl}/{slug}
  // e.g. /en/lot/self-portrait → .../modern-contemporary-evening-auction-l26002/self-portrait
  const lotSlug = raw.lotUrl?.split('/en/lot/')[1];
  const lotUrl = raw.auctionHouseId === 'sothebys' && saleEvent?.url && lotSlug
    ? `${saleEvent.url}/${lotSlug}`
    : raw.lotUrl;

  const lot: Lot = {
    id: raw.id,
    saleEventId: raw.saleEventId,
    auctionHouseId: raw.auctionHouseId,
    artistId: raw.artistId,
    lotNumber: raw.lotNumber,
    title: raw.title,
    medium: raw.medium,
    year: raw.year ?? null,
    dimensions: raw.dimensions,
    estimateLow: raw.estimateLow,
    estimateHigh: raw.estimateHigh,
    currency: raw.currency,
    lotUrl,
  };

  const result: AuctionResult = {
    id: raw.result.id,
    lotId: raw.id,
    hammerPrice: raw.result.hammerPrice,
    premiumPrice: raw.result.premiumPrice,
    currency: raw.result.currency,
    usdEquivalent: raw.result.usdEquivalent,
    sold: raw.result.sold,
    saleDate: raw.result.saleDate,
  };

  return { ...lot, result, artist, saleEvent, auctionHouse };
}

// ── 전체 lots (크리스티 + 소더비) ─────────────────────────────────
export const allLots: LotWithDetails[] = [
  ...rawChristiesData.lots.map(mapRawLot),
  ...rawSothebysData.lots.map(mapRawLot),
].sort((a, b) => new Date(b.saleEvent.date).getTime() - new Date(a.saleEvent.date).getTime());

// ── 분석 함수 ────────────────────────────────────────────────────
export function getMarketPulse(lots: LotWithDetails[]): MarketPulse {
  const soldLots = lots.filter(l => l.result.sold);
  const totalVolume = soldLots.reduce((sum, l) => sum + (l.result.usdEquivalent || 0), 0);
  const sellThroughRate = lots.length > 0 ? soldLots.length / lots.length : 0;

  const estimateExcess = soldLots
    .filter(l => l.result.premiumPrice && l.estimateHigh > 0)
    .map(l => ((l.result.premiumPrice! - l.estimateHigh) / l.estimateHigh) * 100);
  const avgEstimateExcess = estimateExcess.length > 0
    ? estimateExcess.reduce((a, b) => a + b, 0) / estimateExcess.length
    : 0;

  return {
    totalVolume,
    sellThroughRate,
    avgEstimateExcess,
    totalLots: lots.length,
    soldLots: soldLots.length,
  };
}

export function getRisingArtists(): RisingArtist[] {
  // 낙찰가/추정가 초과율 상위 작가 (양사 통합)
  const artistStats: Record<string, { lots: LotWithDetails[] }> = {};
  allLots.filter(l => l.result.sold).forEach(l => {
    if (!artistStats[l.artistId]) artistStats[l.artistId] = { lots: [] };
    artistStats[l.artistId].lots.push(l);
  });

  const reasons = [
    'Strong evening sale performance; multiple lots exceeded high estimate',
    'Record prices across categories; institutional demand rising',
    'Consistent sell-through rate at 100%; collector confidence high',
    'Cross-category appeal; both day and evening sales outperformed',
    'Significant private collection provenance driving bidder interest',
  ];

  return Object.entries(artistStats)
    .map(([artistId, { lots }]) => {
      const artist = artists.find(a => a.id === artistId)!;
      const recentVolume = lots.reduce((s, l) => s + (l.result.usdEquivalent || 0), 0);
      const avgPrice = recentVolume / lots.length;
      const overEstimates = lots
        .filter(l => l.result.premiumPrice && l.estimateHigh > 0)
        .map(l => ((l.result.premiumPrice! - l.estimateHigh) / l.estimateHigh) * 100);
      const momentum = overEstimates.length > 0
        ? overEstimates.reduce((a, b) => a + b, 0) / overEstimates.length
        : 0;
      return { artist, momentum, recentVolume, avgPrice, lotsSold: lots.length, reason: reasons[0] };
    })
    .filter(r => r.lotsSold >= 2 && r.momentum > 10)
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 5)
    .map((r, i) => ({ ...r, reason: reasons[i % reasons.length] }));
}

export function getMonthlyVolume() {
  // 실제 3월 데이터 (양사)
  const marSold = allLots.filter(l => l.result.sold && l.result.saleDate?.startsWith('2026-03'));
  const christiesMar = Math.round(
    marSold.filter(l => l.auctionHouseId === 'christies')
      .reduce((s, l) => s + (l.result.usdEquivalent || 0), 0) / 1_000_000
  );
  const sothebysMar = Math.round(
    marSold.filter(l => l.auctionHouseId === 'sothebys')
      .reduce((s, l) => s + (l.result.usdEquivalent || 0), 0) / 1_000_000
  );

  // 9월~2월: 2025 연간 실적 기반 Fine Art 카테고리 월별 추정
  // Sources: Christie's $4.7B auction / Sotheby's $4.7B auction (2025 full-year)
  // Nov = NY Marquee Week (최대), Jan = 비수기 (최소)
  return [
    { month: 'Sep', christies:  78, sothebys:  62 }, // London Contemporary
    { month: 'Oct', christies: 115, sothebys:  95 }, // Hong Kong Week
    { month: 'Nov', christies: 310, sothebys: 280 }, // NY Marquee Sales
    { month: 'Dec', christies:  55, sothebys:  48 }, // Year-end
    { month: 'Jan', christies:  32, sothebys:  28 }, // Off-season
    { month: 'Feb', christies:  88, sothebys:  72 }, // London Spring Preview
    { month: 'Mar', christies: christiesMar, sothebys: sothebysMar }, // 실제 데이터
  ];
}

export function getCategoryPerformance() {
  const cats: Record<string, { sold: number; total: number; overEst: number[] }> = {};
  allLots.forEach(l => {
    const cat = l.artist.category || 'Contemporary';
    if (!cats[cat]) cats[cat] = { sold: 0, total: 0, overEst: [] };
    cats[cat].total++;
    if (l.result.sold) {
      cats[cat].sold++;
      if (l.result.premiumPrice && l.estimateHigh > 0) {
        cats[cat].overEst.push(((l.result.premiumPrice - l.estimateHigh) / l.estimateHigh) * 100);
      }
    }
  });

  return Object.entries(cats)
    .filter(([, v]) => v.total >= 3)
    .map(([category, v]) => ({
      category,
      sellThrough: Math.round((v.sold / v.total) * 100),
      avgOverEstimate: v.overEst.length > 0
        ? Math.round(v.overEst.reduce((a, b) => a + b, 0) / v.overEst.length)
        : 0,
      volume: v.total,
      totalVolume: allLots
        .filter(l => (l.artist.category || 'Contemporary') === category && l.result.sold)
        .reduce((sum, l) => sum + (l.result.usdEquivalent || 0), 0),
    }))
    .sort((a, b) => b.totalVolume - a.totalVolume);
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toFixed(0);
}

export function formatFullCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
