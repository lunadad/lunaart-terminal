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

export const artists: ArtistProfile[] = [
  { id: 'a1', name: 'Jean-Michel Basquiat', nationality: 'American', birthYear: 1960, deathYear: 1988, category: 'Contemporary' },
  { id: 'a2', name: 'Yayoi Kusama', nationality: 'Japanese', birthYear: 1929, category: 'Contemporary' },
  { id: 'a3', name: 'Gerhard Richter', nationality: 'German', birthYear: 1932, category: 'Contemporary' },
  { id: 'a4', name: 'David Hockney', nationality: 'British', birthYear: 1937, category: 'Contemporary' },
  { id: 'a5', name: 'Banksy', nationality: 'British', birthYear: 1974, category: 'Street Art' },
  { id: 'a6', name: 'Yoshitomo Nara', nationality: 'Japanese', birthYear: 1959, category: 'Contemporary' },
  { id: 'a7', name: 'Julie Mehretu', nationality: 'Ethiopian-American', birthYear: 1970, category: 'Contemporary' },
  { id: 'a8', name: 'Nicolas Party', nationality: 'Swiss', birthYear: 1980, category: 'Contemporary' },
  { id: 'a9', name: 'Flora Yukhnovich', nationality: 'British', birthYear: 1990, category: 'Contemporary' },
  { id: 'a10', name: 'Jadé Fadojutimi', nationality: 'British', birthYear: 1993, category: 'Contemporary' },
  { id: 'a11', name: 'Lucy Bull', nationality: 'American', birthYear: 1990, category: 'Contemporary' },
  { id: 'a12', name: 'Avery Singer', nationality: 'American', birthYear: 1987, category: 'Contemporary' },
  { id: 'a13', name: 'Salman Toor', nationality: 'Pakistani', birthYear: 1983, category: 'Contemporary' },
  { id: 'a14', name: 'Loie Hollowell', nationality: 'American', birthYear: 1983, category: 'Contemporary' },
  { id: 'a15', name: 'Issy Wood', nationality: 'American-British', birthYear: 1993, category: 'Contemporary' },
  { id: 'a16', name: 'Claude Monet', nationality: 'French', birthYear: 1840, deathYear: 1926, category: 'Impressionist' },
  { id: 'a17', name: 'Pablo Picasso', nationality: 'Spanish', birthYear: 1881, deathYear: 1973, category: 'Modern' },
  { id: 'a18', name: 'Andy Warhol', nationality: 'American', birthYear: 1928, deathYear: 1987, category: 'Pop Art' },
  { id: 'a19', name: 'Mark Rothko', nationality: 'American', birthYear: 1903, deathYear: 1970, category: 'Abstract Expressionism' },
  { id: 'a20', name: 'Francis Bacon', nationality: 'British', birthYear: 1909, deathYear: 1992, category: 'Modern' },
];

export const saleEvents: SaleEvent[] = [
  { id: 's1', auctionHouseId: 'christies', name: '21st Century Evening Sale', city: 'New York', date: '2026-03-05', category: 'Contemporary' },
  { id: 's2', auctionHouseId: 'sothebys', name: 'Contemporary Art Evening', city: 'London', date: '2026-03-03', category: 'Contemporary' },
  { id: 's3', auctionHouseId: 'christies', name: 'Impressionist & Modern Art', city: 'Paris', date: '2026-02-28', category: 'Impressionist' },
  { id: 's4', auctionHouseId: 'sothebys', name: 'Post-War & Contemporary', city: 'Hong Kong', date: '2026-02-25', category: 'Contemporary' },
  { id: 's5', auctionHouseId: 'christies', name: 'Prints & Multiples', city: 'New York', date: '2026-02-20', category: 'Prints' },
  { id: 's6', auctionHouseId: 'sothebys', name: 'Modern Art Day Sale', city: 'New York', date: '2026-02-15', category: 'Modern' },
  { id: 's7', auctionHouseId: 'christies', name: 'Asian Contemporary Art', city: 'Hong Kong', date: '2026-02-10', category: 'Contemporary' },
  { id: 's8', auctionHouseId: 'sothebys', name: 'Photography', city: 'London', date: '2026-02-05', category: 'Photography' },
];

function generateLots(): LotWithDetails[] {
  const lots: LotWithDetails[] = [];
  const mediums = ['Painting', 'Sculpture', 'Photography', 'Prints', 'Mixed Media', 'Installation'];
  const cities = ['New York', 'London', 'Paris', 'Hong Kong', 'Geneva'];

  const titles = [
    'Untitled', 'Composition No.', 'Study in Blue', 'Red Canvas', 'Portrait',
    'Landscape', 'Self-Portrait', 'Infinity Nets', 'Abstraction', 'Figure',
    'Night Scene', 'Still Life', 'The Garden', 'Movement', 'Reflection',
    'Dream', 'Chaos', 'Harmony', 'Emergence', 'Dissolution',
    'Memory', 'Fragment', 'Passage', 'Threshold', 'Veil',
    'Surface', 'Depth', 'Echo', 'Whisper', 'Storm',
  ];

  let lotId = 1;
  for (const sale of saleEvents) {
    const numLots = 8 + Math.floor(Math.random() * 12);
    for (let i = 0; i < numLots; i++) {
      const artist = artists[Math.floor(Math.random() * artists.length)];
      const medium = mediums[Math.floor(Math.random() * mediums.length)];
      const title = titles[Math.floor(Math.random() * titles.length)] + (Math.random() > 0.5 ? ` #${Math.floor(Math.random() * 50)}` : '');
      const year = artist.birthYear + 20 + Math.floor(Math.random() * 30);
      const auctionHouse = auctionHouses.find(h => h.id === sale.auctionHouseId)!;

      const basePriceMultiplier = artist.category === 'Contemporary' ? 1 : (artist.category === 'Impressionist' ? 3 : 2);
      const estimateLow = Math.round((50000 + Math.random() * 5000000) * basePriceMultiplier / 1000) * 1000;
      const estimateHigh = Math.round(estimateLow * (1.3 + Math.random() * 0.7) / 1000) * 1000;

      const sold = Math.random() > 0.18;
      const hammerPrice = sold ? Math.round(estimateLow * (0.7 + Math.random() * 1.8) / 1000) * 1000 : null;
      const premiumPrice = hammerPrice ? Math.round(hammerPrice * 1.26) : null;
      const usdEquivalent = premiumPrice;

      const currency = sale.city === 'London' ? 'GBP' : sale.city === 'Hong Kong' ? 'HKD' : sale.city === 'Paris' ? 'EUR' : 'USD';
      const usdRate = currency === 'GBP' ? 1.27 : currency === 'HKD' ? 0.128 : currency === 'EUR' ? 1.08 : 1;

      const lot: Lot = {
        id: `lot-${lotId}`,
        saleEventId: sale.id,
        auctionHouseId: sale.auctionHouseId,
        artistId: artist.id,
        lotNumber: i + 1,
        title,
        medium,
        year: Math.min(year, 2025),
        dimensions: `${60 + Math.floor(Math.random() * 140)} x ${50 + Math.floor(Math.random() * 120)} cm`,
        estimateLow,
        estimateHigh,
        currency,
        lotUrl: sale.auctionHouseId === 'christies'
          ? `https://www.christies.com/en/lot/lot-${lotId}.aspx`
          : `https://www.sothebys.com/en/buy/auction/2026/lot-${lotId}`,
      };

      const result: AuctionResult = {
        id: `res-${lotId}`,
        lotId: lot.id,
        hammerPrice,
        premiumPrice,
        currency,
        usdEquivalent: premiumPrice ? Math.round(premiumPrice * usdRate) : null,
        sold,
        saleDate: sale.date,
      };

      lots.push({
        ...lot,
        result,
        artist,
        saleEvent: sale,
        auctionHouse,
      });
      lotId++;
    }
  }

  return lots.sort((a, b) => new Date(b.saleEvent.date).getTime() - new Date(a.saleEvent.date).getTime());
}

export const allLots = generateLots();

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
  const reasons = [
    'Institutional acquisitions surge; major museum retrospective announced',
    'Record-breaking series of sales; emerging market demand growing',
    'Gallery representation upgrade; secondary market prices accelerating',
    'Biennale inclusion driving collector interest; sell-through rate at 100%',
    'Cross-category appeal; strong performance in both day and evening sales',
  ];

  return [
    { artist: artists[9], momentum: 342, recentVolume: 4200000, avgPrice: 840000, lotsSold: 5, reason: reasons[0] },
    { artist: artists[10], momentum: 285, recentVolume: 3800000, avgPrice: 950000, lotsSold: 4, reason: reasons[1] },
    { artist: artists[8], momentum: 218, recentVolume: 6100000, avgPrice: 1220000, lotsSold: 5, reason: reasons[2] },
    { artist: artists[7], momentum: 176, recentVolume: 8500000, avgPrice: 1062500, lotsSold: 8, reason: reasons[3] },
    { artist: artists[12], momentum: 154, recentVolume: 2900000, avgPrice: 725000, lotsSold: 4, reason: reasons[4] },
  ];
}

export function getMonthlyVolume() {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  return months.map(month => ({
    month,
    christies: Math.round(80 + Math.random() * 120),
    sothebys: Math.round(70 + Math.random() * 110),
  }));
}

export function getCategoryPerformance() {
  return [
    { category: 'Contemporary', sellThrough: 84, avgOverEstimate: 22, volume: 245 },
    { category: 'Modern', sellThrough: 78, avgOverEstimate: 15, volume: 180 },
    { category: 'Impressionist', sellThrough: 72, avgOverEstimate: 8, volume: 95 },
    { category: 'Pop Art', sellThrough: 88, avgOverEstimate: 35, volume: 65 },
    { category: 'Photography', sellThrough: 65, avgOverEstimate: -5, volume: 45 },
    { category: 'Street Art', sellThrough: 91, avgOverEstimate: 42, volume: 55 },
    { category: 'Prints', sellThrough: 70, avgOverEstimate: 2, volume: 120 },
    { category: 'Sculpture', sellThrough: 68, avgOverEstimate: 10, volume: 75 },
  ];
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toFixed(0);
}

export function formatFullCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
