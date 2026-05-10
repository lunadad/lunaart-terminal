import { allLots } from './mock-data';
import type { LotWithDetails } from './types';

export const REVIEW_YEAR = 2026;
export const REVIEW_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const TOP_EVENING_SALES_LIMIT = 3;
export const TOP_ARTISTS_LIMIT = 5;
export const TOP_SELL_THROUGH_LIMIT = 5;
export const HIGHLIGHT_LOTS_LIMIT = 3;
export const MIN_SELL_THROUGH_OFFERED_LOTS = 20;

export type ReviewMonth = typeof REVIEW_MONTHS[number];
export type EventStatus = 'planned' | 'crawling' | 'done' | 'failed';
export type EventHouse = "Christie's" | "Sotheby's";
export type SourcePriority = 'official_result_page' | 'official_catalog_page' | 'official_calendar_page';
export type LotQualityFlag =
  | 'missing_artist'
  | 'missing_currency'
  | 'missing_estimate'
  | 'missing_sold_price'
  | 'non_positive_sold_price'
  | 'unsold_without_price';

export interface EventMasterRecord {
  eventId: string;
  house: EventHouse;
  saleTitle: string;
  city: string;
  saleDateLocal: string;
  timezone: string;
  catalogUrl: string;
  resultUrl: string;
  isKeyEveningSale: boolean;
  month: ReviewMonth;
  status: EventStatus;
  sourceSaleEventId?: string;
}

export interface ReviewEventRow extends EventMasterRecord {
  currency: string | null;
  offeredLots: number;
  soldLots: number;
  sellThroughRate: number;
  totalHammerPremiumOriginal: number;
  totalHammerPremiumUsd: number;
  averageHammerPremiumUsd: number;
  medianHammerPremiumUsd: number;
  highestLotTitle: string | null;
  highestLotArtist: string | null;
  highestLotHammerPremiumUsd: number;
  sourcePriority: SourcePriority;
}

export interface ReviewLotRow {
  lotId: string;
  eventId: string;
  sourceSaleEventId: string;
  house: EventHouse;
  lotNumber: number;
  artistName: string;
  normalizedArtistName: string;
  title: string;
  estimateLow: number | null;
  estimateHigh: number | null;
  hammerPremiumPrice: number | null;
  hammerPremiumUsd: number | null;
  currency: string | null;
  sold: boolean;
  saleDateLocal: string;
  qualityFlags: LotQualityFlag[];
}

export interface NormalizationMapEntry {
  canonicalName: string;
  variants: string[];
}

export interface CrawlLogEntry {
  eventId: string;
  status: EventStatus;
  checkedAt: string;
  message: string;
  htmlSignatureChanged: boolean;
}

export interface EventRanking {
  eventId: string;
  house: EventHouse;
  saleTitle: string;
  city: string;
  saleDateLocal: string;
  offeredLots: number;
  soldLots: number;
  sellThroughRate: number;
  totalHammerPremiumUsd: number;
  averageHammerPremiumUsd: number;
  medianHammerPremiumUsd: number;
  highestLotTitle: string | null;
  highestLotArtist: string | null;
  highestLotHammerPremiumUsd: number;
}

export interface ArtistRanking {
  artistName: string;
  offeredLots: number;
  soldLots: number;
  sellThroughRate: number;
  totalHammerPremiumUsd: number;
  averageHammerPremiumUsd: number;
  medianHammerPremiumUsd: number;
  highestLotTitle: string | null;
  highestLotHammerPremiumUsd: number;
  artistScore: number;
}

export interface HighlightLot {
  lotId: string;
  eventId: string;
  house: EventHouse;
  lotNumber: number;
  artistName: string;
  title: string;
  hammerPremiumUsd: number;
  currency: string | null;
  saleTitle: string;
}

export interface MonthlyQaReport {
  passed: boolean;
  soldCountValid: boolean;
  missingCurrencyLots: number;
  missingArtistLots: number;
  missingEstimateLots: number;
  soldPriceMissingLots: number;
  nonPositiveSoldPriceLots: number;
  completedEventCoverage: number;
  alerts: string[];
}

export interface MonthlyMetric {
  month: ReviewMonth;
  monthKey: string;
  label: string;
  registeredEvents: number;
  completedEvents: number;
  collectionCompletionRate: number;
  offeredLots: number;
  soldLots: number;
  sellThroughRate: number;
  totalHammerPremiumUsd: number;
  averageHammerPremiumUsd: number;
  medianHammerPremiumUsd: number;
  topEveningSales: EventRanking[];
  topArtists: ArtistRanking[];
  topSellThrough: EventRanking[];
  highlightLots: HighlightLot[];
  qa: MonthlyQaReport;
  reviewText: string;
}

const christiesLotSearch = (saleId: string, saleNumber: string) =>
  `https://www.christies.com/api/discoverywebsite/auctionpages/lotsearch?language=en&pagesize=120&geocountrycode=US&saleid=${saleId}&salenumber=${saleNumber}&saleroomcode=CKS&page=1&sortby=lot_number_asc&saletype=Sale`;

export const eventMaster: EventMasterRecord[] = [
  {
    eventId: 'christies-30991-2026-03-05',
    house: "Christie's",
    saleTitle: '20th/21st Century: London Evening Sale',
    city: 'London',
    saleDateLocal: '2026-03-05',
    timezone: 'Europe/London',
    catalogUrl: christiesLotSearch('30991', '24180'),
    resultUrl: '',
    isKeyEveningSale: true,
    month: 3,
    status: 'done',
    sourceSaleEventId: 's1',
  },
  {
    eventId: 'christies-30992-2026-03-05',
    house: "Christie's",
    saleTitle: 'The Art of the Surreal Evening Sale',
    city: 'London',
    saleDateLocal: '2026-03-05',
    timezone: 'Europe/London',
    catalogUrl: christiesLotSearch('30992', '24181'),
    resultUrl: '',
    isKeyEveningSale: true,
    month: 3,
    status: 'done',
    sourceSaleEventId: 's2',
  },
  {
    eventId: 'christies-31311-2026-03-05',
    house: "Christie's",
    saleTitle: 'Modern Visionaries - Evening Sale',
    city: 'London',
    saleDateLocal: '2026-03-05',
    timezone: 'Europe/London',
    catalogUrl: christiesLotSearch('31311', '24750'),
    resultUrl: '',
    isKeyEveningSale: true,
    month: 3,
    status: 'done',
    sourceSaleEventId: 's3',
  },
  {
    eventId: 'christies-30994-2026-03-06',
    house: "Christie's",
    saleTitle: 'Impressionist & Modern Art Day Sale',
    city: 'London',
    saleDateLocal: '2026-03-06',
    timezone: 'Europe/London',
    catalogUrl: christiesLotSearch('30994', '24183'),
    resultUrl: '',
    isKeyEveningSale: false,
    month: 3,
    status: 'done',
    sourceSaleEventId: 's4',
  },
  {
    eventId: 'christies-31312-2026-03-06',
    house: "Christie's",
    saleTitle: 'Modern Visionaries - Day Sale',
    city: 'London',
    saleDateLocal: '2026-03-06',
    timezone: 'Europe/London',
    catalogUrl: christiesLotSearch('31312', '24751'),
    resultUrl: '',
    isKeyEveningSale: false,
    month: 3,
    status: 'done',
    sourceSaleEventId: 's5',
  },
  {
    eventId: 'christies-30993-2026-03-07',
    house: "Christie's",
    saleTitle: 'Post-War & Contemporary Art Day Sale',
    city: 'London',
    saleDateLocal: '2026-03-07',
    timezone: 'Europe/London',
    catalogUrl: christiesLotSearch('30993', '24182'),
    resultUrl: '',
    isKeyEveningSale: false,
    month: 3,
    status: 'done',
    sourceSaleEventId: 's6',
  },
  {
    eventId: 'christies-30937-2026-03-07',
    house: "Christie's",
    saleTitle: 'Spellbound: The Hegewisch Collection',
    city: 'London',
    saleDateLocal: '2026-03-07',
    timezone: 'Europe/London',
    catalogUrl: christiesLotSearch('30937', '23970'),
    resultUrl: '',
    isKeyEveningSale: false,
    month: 3,
    status: 'done',
    sourceSaleEventId: 's7',
  },
  {
    eventId: 'sothebys-l26002-2026-03-04',
    house: "Sotheby's",
    saleTitle: 'Modern & Contemporary Evening Auction',
    city: 'London',
    saleDateLocal: '2026-03-04',
    timezone: 'Europe/London',
    catalogUrl: 'https://www.sothebys.com/en/buy/auction/2026/modern-contemporary-evening-auction-l26002',
    resultUrl: 'https://www.sothebys.com/en/buy/auction/2026/modern-contemporary-evening-auction-l26002',
    isKeyEveningSale: true,
    month: 3,
    status: 'done',
    sourceSaleEventId: 'ss1',
  },
  {
    eventId: 'sothebys-l26003-2026-03-05',
    house: "Sotheby's",
    saleTitle: 'Contemporary Day Auction',
    city: 'London',
    saleDateLocal: '2026-03-05',
    timezone: 'Europe/London',
    catalogUrl: 'https://www.sothebys.com/en/buy/auction/2026/contemporary-day-auction-l26003',
    resultUrl: 'https://www.sothebys.com/en/buy/auction/2026/contemporary-day-auction-l26003',
    isKeyEveningSale: false,
    month: 3,
    status: 'done',
    sourceSaleEventId: 'ss2',
  },
  {
    eventId: 'sothebys-l26004-2026-03-05',
    house: "Sotheby's",
    saleTitle: 'Modern & Modern British Day Auction',
    city: 'London',
    saleDateLocal: '2026-03-05',
    timezone: 'Europe/London',
    catalogUrl: 'https://www.sothebys.com/en/buy/auction/2026/modern-day-auction-l26004',
    resultUrl: 'https://www.sothebys.com/en/buy/auction/2026/modern-day-auction-l26004',
    isKeyEveningSale: false,
    month: 3,
    status: 'done',
    sourceSaleEventId: 'ss3',
  },
  {
    eventId: 'sothebys-l26022-2026-03-05',
    house: "Sotheby's",
    saleTitle: 'The David Hockney Sale: The Arrival of Spring',
    city: 'London',
    saleDateLocal: '2026-03-05',
    timezone: 'Europe/London',
    catalogUrl: 'https://www.sothebys.com/en/buy/auction/2026/the-david-hockney-sale-the-arrival-of-spring-l26022',
    resultUrl: 'https://www.sothebys.com/en/buy/auction/2026/the-david-hockney-sale-the-arrival-of-spring-l26022',
    isKeyEveningSale: false,
    month: 3,
    status: 'done',
    sourceSaleEventId: 'ss4',
  },
  {
    eventId: 'christies-24598-2026-04-15',
    house: "Christie's",
    saleTitle: '20/21 Century Art - Evening Sale',
    city: 'Paris',
    saleDateLocal: '2026-04-15',
    timezone: 'Europe/Paris',
    catalogUrl: 'https://www.christies.com/en/auction/20-21-century-art-evening-sale-24598-par/',
    resultUrl: '',
    isKeyEveningSale: true,
    month: 4,
    status: 'planned',
  },
  {
    eventId: 'christies-24483-2026-05-26',
    house: "Christie's",
    saleTitle: 'Design',
    city: 'Paris',
    saleDateLocal: '2026-05-26',
    timezone: 'Europe/Paris',
    catalogUrl: 'https://www.christies.com/en/auction/design-24483-par/',
    resultUrl: '',
    isKeyEveningSale: false,
    month: 5,
    status: 'planned',
  },
];

export const normalizationMap: NormalizationMapEntry[] = [
  {
    canonicalName: 'Jean-Michel Basquiat',
    variants: ['Jean Michel Basquiat', 'J.-M. Basquiat'],
  },
  {
    canonicalName: 'David Hockney',
    variants: ['D. Hockney', 'David Hockney R.A.'],
  },
  {
    canonicalName: 'Pablo Picasso',
    variants: ['P. Picasso', 'Pablo Ruiz Picasso'],
  },
];

export const crawlLogs: CrawlLogEntry[] = eventMaster.map((event) => ({
  eventId: event.eventId,
  status: event.status,
  checkedAt: event.status === 'done' ? '2026-05-10T00:00:00+09:00' : '',
  message: event.status === 'done' ? 'Loaded from official result/catalog source into local lot table.' : 'Registered in event master; waiting for result page.',
  htmlSignatureChanged: false,
}));

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeArtistName(name: string): string {
  const cleanName = name.trim();
  const lower = cleanName.toLowerCase();
  const mapped = normalizationMap.find((entry) =>
    entry.canonicalName.toLowerCase() === lower ||
    entry.variants.some((variant) => variant.toLowerCase() === lower)
  );
  return mapped?.canonicalName ?? cleanName;
}

function resolveEventBySource(sourceSaleEventId: string): EventMasterRecord | undefined {
  return eventMaster.find((event) => event.sourceSaleEventId === sourceSaleEventId);
}

function collectQualityFlags(lot: LotWithDetails, hammerPremiumPrice: number | null): LotQualityFlag[] {
  const flags: LotQualityFlag[] = [];

  if (!lot.artist?.name) flags.push('missing_artist');
  if (!lot.result.currency && !lot.currency) flags.push('missing_currency');
  if (!lot.estimateLow && !lot.estimateHigh) flags.push('missing_estimate');
  if (lot.result.sold && hammerPremiumPrice === null) flags.push('missing_sold_price');
  if (lot.result.sold && hammerPremiumPrice !== null && hammerPremiumPrice <= 0) flags.push('non_positive_sold_price');
  if (!lot.result.sold && hammerPremiumPrice === null) flags.push('unsold_without_price');

  return flags;
}

function toEventRanking(event: ReviewEventRow): EventRanking {
  return {
    eventId: event.eventId,
    house: event.house,
    saleTitle: event.saleTitle,
    city: event.city,
    saleDateLocal: event.saleDateLocal,
    offeredLots: event.offeredLots,
    soldLots: event.soldLots,
    sellThroughRate: event.sellThroughRate,
    totalHammerPremiumUsd: event.totalHammerPremiumUsd,
    averageHammerPremiumUsd: event.averageHammerPremiumUsd,
    medianHammerPremiumUsd: event.medianHammerPremiumUsd,
    highestLotTitle: event.highestLotTitle,
    highestLotArtist: event.highestLotArtist,
    highestLotHammerPremiumUsd: event.highestLotHammerPremiumUsd,
  };
}

export function collectLotLevelRows(sourceLots: LotWithDetails[] = allLots): ReviewLotRow[] {
  return sourceLots.flatMap((lot) => {
    const event = resolveEventBySource(lot.saleEventId);
    if (!event) return [];

    const hammerPremiumPrice = lot.result.premiumPrice ?? null;
    const hammerPremiumUsd = lot.result.usdEquivalent ?? null;
    const artistName = lot.artist?.name ?? '';

    return [{
      lotId: lot.id,
      eventId: event.eventId,
      sourceSaleEventId: lot.saleEventId,
      house: event.house,
      lotNumber: lot.lotNumber,
      artistName,
      normalizedArtistName: normalizeArtistName(artistName),
      title: lot.title,
      estimateLow: lot.estimateLow || lot.estimateLow === 0 ? lot.estimateLow : null,
      estimateHigh: lot.estimateHigh || lot.estimateHigh === 0 ? lot.estimateHigh : null,
      hammerPremiumPrice,
      hammerPremiumUsd,
      currency: lot.result.currency || lot.currency || null,
      sold: lot.result.sold,
      saleDateLocal: lot.result.saleDate || event.saleDateLocal,
      qualityFlags: collectQualityFlags(lot, hammerPremiumPrice),
    }];
  });
}

export function collectEventLevelRows(sourceLots: LotWithDetails[] = allLots): ReviewEventRow[] {
  const lotRows = collectLotLevelRows(sourceLots);

  return eventMaster.map((event) => {
    const lots = lotRows.filter((lot) => lot.eventId === event.eventId);
    const soldLots = lots.filter((lot) => lot.sold);
    const soldUsdPrices = soldLots
      .map((lot) => lot.hammerPremiumUsd)
      .filter((price): price is number => typeof price === 'number' && price > 0);
    const soldOriginalPrices = soldLots
      .map((lot) => lot.hammerPremiumPrice)
      .filter((price): price is number => typeof price === 'number' && price > 0);
    const highestLot = [...soldLots]
      .filter((lot) => typeof lot.hammerPremiumUsd === 'number')
      .sort((a, b) => (b.hammerPremiumUsd ?? 0) - (a.hammerPremiumUsd ?? 0))[0];

    return {
      ...event,
      currency: lots.find((lot) => lot.currency)?.currency ?? null,
      offeredLots: lots.length,
      soldLots: soldLots.length,
      sellThroughRate: lots.length > 0 ? soldLots.length / lots.length : 0,
      totalHammerPremiumOriginal: soldOriginalPrices.reduce((sum, price) => sum + price, 0),
      totalHammerPremiumUsd: soldUsdPrices.reduce((sum, price) => sum + price, 0),
      averageHammerPremiumUsd: average(soldUsdPrices),
      medianHammerPremiumUsd: median(soldUsdPrices),
      highestLotTitle: highestLot?.title ?? null,
      highestLotArtist: highestLot?.artistName ?? null,
      highestLotHammerPremiumUsd: highestLot?.hammerPremiumUsd ?? 0,
      sourcePriority: event.resultUrl ? 'official_result_page' : 'official_catalog_page',
    };
  });
}

function buildArtistRankings(monthLots: ReviewLotRow[]): ArtistRanking[] {
  const artists = new Map<string, ReviewLotRow[]>();
  monthLots.forEach((lot) => {
    const key = lot.normalizedArtistName || 'Unknown Artist';
    const current = artists.get(key) ?? [];
    current.push(lot);
    artists.set(key, current);
  });

  const rawRankings = [...artists.entries()].map(([artistName, lots]) => {
    const soldLots = lots.filter((lot) => lot.sold);
    const soldUsdPrices = soldLots
      .map((lot) => lot.hammerPremiumUsd)
      .filter((price): price is number => typeof price === 'number' && price > 0);
    const highestLot = [...soldLots]
      .filter((lot) => typeof lot.hammerPremiumUsd === 'number')
      .sort((a, b) => (b.hammerPremiumUsd ?? 0) - (a.hammerPremiumUsd ?? 0))[0];

    return {
      artistName,
      offeredLots: lots.length,
      soldLots: soldLots.length,
      sellThroughRate: lots.length > 0 ? soldLots.length / lots.length : 0,
      totalHammerPremiumUsd: soldUsdPrices.reduce((sum, price) => sum + price, 0),
      averageHammerPremiumUsd: average(soldUsdPrices),
      medianHammerPremiumUsd: median(soldUsdPrices),
      highestLotTitle: highestLot?.title ?? null,
      highestLotHammerPremiumUsd: highestLot?.hammerPremiumUsd ?? 0,
      artistScore: 0,
    };
  });

  const maxTotal = Math.max(...rawRankings.map((artist) => artist.totalHammerPremiumUsd), 0);
  const maxSoldLots = Math.max(...rawRankings.map((artist) => artist.soldLots), 0);
  const maxAverage = Math.max(...rawRankings.map((artist) => artist.averageHammerPremiumUsd), 0);

  return rawRankings
    .map((artist) => {
      const totalScore = maxTotal > 0 ? artist.totalHammerPremiumUsd / maxTotal : 0;
      const soldLotsScore = maxSoldLots > 0 ? artist.soldLots / maxSoldLots : 0;
      const averageScore = maxAverage > 0 ? artist.averageHammerPremiumUsd / maxAverage : 0;

      return {
        ...artist,
        artistScore: (0.5 * totalScore + 0.3 * soldLotsScore + 0.2 * averageScore) * 100,
      };
    })
    .filter((artist) => artist.soldLots > 0)
    .sort((a, b) => {
      if (b.artistScore !== a.artistScore) return b.artistScore - a.artistScore;
      return b.totalHammerPremiumUsd - a.totalHammerPremiumUsd;
    });
}

function buildHighlightLots(monthLots: ReviewLotRow[], eventRows: ReviewEventRow[]): HighlightLot[] {
  return monthLots
    .filter((lot) => lot.sold && typeof lot.hammerPremiumUsd === 'number' && lot.hammerPremiumUsd > 0)
    .sort((a, b) => (b.hammerPremiumUsd ?? 0) - (a.hammerPremiumUsd ?? 0))
    .slice(0, HIGHLIGHT_LOTS_LIMIT)
    .map((lot) => {
      const event = eventRows.find((row) => row.eventId === lot.eventId);
      return {
        lotId: lot.lotId,
        eventId: lot.eventId,
        house: lot.house,
        lotNumber: lot.lotNumber,
        artistName: lot.normalizedArtistName,
        title: lot.title,
        hammerPremiumUsd: lot.hammerPremiumUsd ?? 0,
        currency: lot.currency,
        saleTitle: event?.saleTitle ?? 'Unmapped sale',
      };
    });
}

function buildQaReport(events: ReviewEventRow[], lots: ReviewLotRow[]): MonthlyQaReport {
  const completedEvents = events.filter((event) => event.status === 'done').length;
  const missingCurrencyLots = lots.filter((lot) => lot.qualityFlags.includes('missing_currency')).length;
  const missingArtistLots = lots.filter((lot) => lot.qualityFlags.includes('missing_artist')).length;
  const missingEstimateLots = lots.filter((lot) => lot.qualityFlags.includes('missing_estimate')).length;
  const soldPriceMissingLots = lots.filter((lot) => lot.qualityFlags.includes('missing_sold_price')).length;
  const nonPositiveSoldPriceLots = lots.filter((lot) => lot.qualityFlags.includes('non_positive_sold_price')).length;
  const soldCountValid = events.every((event) => event.soldLots <= event.offeredLots);
  const alerts: string[] = [];

  if (!soldCountValid) alerts.push('sold_lots exceeds offered_lots');
  if (missingCurrencyLots > 0) alerts.push(`${missingCurrencyLots} lots missing currency`);
  if (soldPriceMissingLots > 0) alerts.push(`${soldPriceMissingLots} sold lots missing hammer+premium`);
  if (nonPositiveSoldPriceLots > 0) alerts.push(`${nonPositiveSoldPriceLots} sold lots have non-positive price`);

  return {
    passed: soldCountValid && missingCurrencyLots === 0 && soldPriceMissingLots === 0 && nonPositiveSoldPriceLots === 0,
    soldCountValid,
    missingCurrencyLots,
    missingArtistLots,
    missingEstimateLots,
    soldPriceMissingLots,
    nonPositiveSoldPriceLots,
    completedEventCoverage: events.length > 0 ? completedEvents / events.length : 0,
    alerts,
  };
}

function buildReviewText(monthLabel: string, metric: Omit<MonthlyMetric, 'reviewText'>): string {
  if (metric.registeredEvents === 0) return `${monthLabel}: registered event 없음. 월초 이벤트 마스터 확정 필요.`;
  if (metric.completedEvents === 0) return `${monthLabel}: ${metric.registeredEvents}건 등록, 결과 수집 대기.`;

  const topSale = metric.topEveningSales[0] ?? metric.topSellThrough[0];
  const topArtist = metric.topArtists[0];

  if (!topSale || !topArtist) return `${monthLabel}: ${metric.completedEvents}건 수집 완료, 검수 대기.`;

  return `${monthLabel}: ${topSale.saleTitle}가 핵심 세일, ${topArtist.artistName}이 작가 랭킹 선두.`;
}

function applyMonthOverMonthAlerts(metrics: MonthlyMetric[]): MonthlyMetric[] {
  return metrics.map((metric, index) => {
    const previous = [...metrics]
      .slice(0, index)
      .reverse()
      .find((candidate) => candidate.completedEvents > 0 && candidate.totalHammerPremiumUsd > 0);

    if (!previous || metric.completedEvents === 0 || metric.totalHammerPremiumUsd === 0) return metric;

    const delta = (metric.totalHammerPremiumUsd - previous.totalHammerPremiumUsd) / previous.totalHammerPremiumUsd;
    if (Math.abs(delta) < 0.75) return metric;

    const alerts = [
      ...metric.qa.alerts,
      `Month-over-month volume ${delta > 0 ? 'up' : 'down'} ${(Math.abs(delta) * 100).toFixed(0)}% from ${previous.label}`,
    ];

    return {
      ...metric,
      qa: {
        ...metric.qa,
        alerts,
        passed: metric.qa.passed && alerts.length === 0,
      },
    };
  });
}

export function buildMonthlyMetrics(): MonthlyMetric[] {
  const eventRows = collectEventLevelRows();
  const lotRows = collectLotLevelRows();

  const metrics = REVIEW_MONTHS.map((month) => {
    const monthEvents = eventRows.filter((event) => event.month === month);
    const monthEventIds = new Set(monthEvents.map((event) => event.eventId));
    const monthLots = lotRows.filter((lot) => monthEventIds.has(lot.eventId));
    const soldLots = monthLots.filter((lot) => lot.sold);
    const soldUsdPrices = soldLots
      .map((lot) => lot.hammerPremiumUsd)
      .filter((price): price is number => typeof price === 'number' && price > 0);
    const completedEvents = monthEvents.filter((event) => event.status === 'done').length;
    const label = `${REVIEW_YEAR}.${String(month).padStart(2, '0')}`;
    const topEveningSales = monthEvents
      .filter((event) => event.isKeyEveningSale && event.status === 'done' && event.offeredLots > 0)
      .sort((a, b) => b.totalHammerPremiumUsd - a.totalHammerPremiumUsd)
      .slice(0, TOP_EVENING_SALES_LIMIT)
      .map(toEventRanking);
    const topSellThrough = monthEvents
      .filter((event) => event.offeredLots >= MIN_SELL_THROUGH_OFFERED_LOTS)
      .sort((a, b) => {
        if (b.sellThroughRate !== a.sellThroughRate) return b.sellThroughRate - a.sellThroughRate;
        return b.totalHammerPremiumUsd - a.totalHammerPremiumUsd;
      })
      .slice(0, TOP_SELL_THROUGH_LIMIT)
      .map(toEventRanking);
    const topArtists = buildArtistRankings(monthLots).slice(0, TOP_ARTISTS_LIMIT);
    const qa = buildQaReport(monthEvents, monthLots);

    const metricWithoutText: Omit<MonthlyMetric, 'reviewText'> = {
      month,
      monthKey: `${REVIEW_YEAR}-${String(month).padStart(2, '0')}`,
      label,
      registeredEvents: monthEvents.length,
      completedEvents,
      collectionCompletionRate: monthEvents.length > 0 ? completedEvents / monthEvents.length : 0,
      offeredLots: monthLots.length,
      soldLots: soldLots.length,
      sellThroughRate: monthLots.length > 0 ? soldLots.length / monthLots.length : 0,
      totalHammerPremiumUsd: soldUsdPrices.reduce((sum, price) => sum + price, 0),
      averageHammerPremiumUsd: average(soldUsdPrices),
      medianHammerPremiumUsd: median(soldUsdPrices),
      topEveningSales,
      topArtists,
      topSellThrough,
      highlightLots: buildHighlightLots(monthLots, monthEvents),
      qa,
    };

    return {
      ...metricWithoutText,
      reviewText: buildReviewText(label, metricWithoutText),
    };
  });

  return applyMonthOverMonthAlerts(metrics);
}

export const reviewEvents = collectEventLevelRows();
export const reviewLots = collectLotLevelRows();
export const monthlyMetrics = buildMonthlyMetrics();

export function getDefaultReviewMonth(metrics: MonthlyMetric[] = monthlyMetrics): ReviewMonth {
  const latestComplete = [...metrics].reverse().find((metric) => metric.completedEvents > 0);
  return latestComplete?.month ?? 1;
}

export function formatUsdCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${Math.round(amount).toString()}`;
}
