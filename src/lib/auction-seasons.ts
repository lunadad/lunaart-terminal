export type SeasonStatus = 'final' | 'partial' | 'scheduled';

export interface SeasonAuction {
  house: 'christies' | 'sothebys';
  name: string;
  date: string;
  kind: 'live' | 'online';
  url: string;
  saleEventId?: string;
}

export interface AuctionSeason {
  id: string;
  year: number;
  city: 'New York' | 'London' | 'Hong Kong';
  month: string;
  label: string;
  dateRange: string;
  status: SeasonStatus;
  capturedAt?: string;
  description: string;
  saleEventIds: string[];
  auctions: SeasonAuction[];
}

export const auctionSeasons: AuctionSeason[] = [
  {
    id: '2026-new-york-may',
    year: 2026,
    city: 'New York',
    month: 'May',
    label: 'New York · May',
    dateRange: '14–21 May 2026',
    status: 'final',
    capturedAt: '2026-05-22',
    description: 'New York marquee week across Modern, Post-War and Contemporary art.',
    saleEventIds: [
      'sot-may-n12122',
      'sot-may-n12128',
      'sot-may-n12129',
      'chr-may-31380',
      'chr-may-31034',
      'chr-may-31000',
      'chr-may-31001',
      'sot-may-n12121',
      'chr-may-31355',
      'chr-may-31140',
      'sot-may-n12441',
      'sot-may-n12125',
      'chr-may-31036',
    ],
    auctions: [
      { house: 'sothebys', name: 'Robert Mnuchin: Collector at Heart Evening Auction', date: '14 May', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/robert-mnuchin-collector-at-heart-evening-auction', saleEventId: 'sot-may-n12122' },
      { house: 'sothebys', name: 'The Now & Contemporary Evening Auction', date: '14 May', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/the-now-contemporary-evening-auction', saleEventId: 'sot-may-n12128' },
      { house: 'sothebys', name: 'Contemporary Day Auction', date: '15 May', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/contemporary-day-auction-2', saleEventId: 'sot-may-n12129' },
      { house: 'christies', name: 'Masterpieces: The Private Collection of S.I. Newhouse', date: '18 May', kind: 'live', url: 'https://www.christies.com/en/auction/masterpieces-the-private-collection-of-s-i-newhouse-31380/', saleEventId: 'chr-may-31380' },
      { house: 'christies', name: '20th Century Evening Sale', date: '18 May', kind: 'live', url: 'https://www.christies.com/en/auction/20th-century-evening-sale-31034/', saleEventId: 'chr-may-31034' },
      { house: 'christies', name: 'Impressionist and Modern Works on Paper Sale', date: '19 May', kind: 'live', url: 'https://www.christies.com/en/auction/impressionist-and-modern-works-on-paper-sale-31000/', saleEventId: 'chr-may-31000' },
      { house: 'christies', name: 'Impressionist and Modern Art Day Sale', date: '19 May', kind: 'live', url: 'https://www.christies.com/en/auction/impressionist-and-modern-art-day-sale-31001/', saleEventId: 'chr-may-31001' },
      { house: 'sothebys', name: 'Modern Evening Auction', date: '19 May', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/modern-evening-auction', saleEventId: 'sot-may-n12121' },
      { house: 'christies', name: 'Defined Space: The Collection of Henry S. McNeil, Jr.', date: '20 May', kind: 'live', url: 'https://www.christies.com/en/auction/defined-space-the-collection-of-henry-s-mcneil-jr-31355/', saleEventId: 'chr-may-31355' },
      { house: 'christies', name: "Marian's Richters & 21st Century Evening Sale", date: '20 May', kind: 'live', url: 'https://www.christies.com/en/auction/marian-s-richters-21st-century-evening-sale-31140/', saleEventId: 'chr-may-31140' },
      { house: 'sothebys', name: 'A New Vista: The David and Shoshanna Wingate Collection Day Auction', date: '20 May', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/a-new-vista-the-david-and-shoshanna-wingate-collection-day-auction', saleEventId: 'sot-may-n12441' },
      { house: 'sothebys', name: 'Modern Day Auction', date: '20 May', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/modern-day-auction', saleEventId: 'sot-may-n12125' },
      { house: 'christies', name: 'Post-War and Contemporary Art Day Sale', date: '21 May', kind: 'live', url: 'https://www.christies.com/en/auction/post-war-and-contemporary-art-day-sale-31036/', saleEventId: 'chr-may-31036' },
    ],
  },
  {
    id: '2026-london-june',
    year: 2026,
    city: 'London',
    month: 'June',
    label: 'London · June',
    dateRange: '24–25 June 2026',
    status: 'partial',
    capturedAt: '2026-07-03',
    description: 'London summer sales. Christie’s results are captured; Sotheby’s results remain access-limited.',
    saleEventIds: ['chr-summer-2026-jun-live-31102'],
    auctions: [
      { house: 'sothebys', name: 'Masterpieces from the Lewis Collection', date: '24 Jun', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/masterpieces-from-the-lewis-collection-l26900?lotFilter=AllLots' },
      { house: 'sothebys', name: 'Modern & Contemporary Evening Auction', date: '24 Jun', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/modern-contemporary-evening-auction-l26006?lotFilter=AllLots' },
      { house: 'sothebys', name: 'Contemporary Day Auction', date: '25 Jun', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/contemporary-day-auction-l26017?lotFilter=AllLots' },
      { house: 'sothebys', name: 'Modern Day Auction including Masterpieces from the Lewis Collection', date: '25 Jun', kind: 'live', url: 'https://www.sothebys.com/en/buy/auction/2026/modern-day-auction-l26007?lotFilter=AllLots' },
      { house: 'christies', name: 'Post-War to Present', date: '25 Jun', kind: 'live', url: 'https://www.christies.com/en/auction/post-war-to-present-24440-cks/', saleEventId: 'chr-summer-2026-jun-live-31102' },
    ],
  },
  {
    id: '2026-hong-kong-september',
    year: 2026,
    city: 'Hong Kong',
    month: 'September',
    label: 'Hong Kong · September',
    dateRange: '29–30 September 2026',
    status: 'scheduled',
    description: 'Hong Kong autumn marquee sales across 20th and 21st Century art.',
    saleEventIds: [],
    auctions: [
      { house: 'christies', name: '20th/21st Century Evening Sale', date: '29 Sep', kind: 'live', url: 'https://www.christies.com/en/auction/20th-21st-century-evening-sale-23847-hgk/' },
      { house: 'sothebys', name: 'Modern & Contemporary Evening Auction', date: '29 Sep', kind: 'live', url: 'https://www.sothebys.com/en/departments/modern-art-asia' },
      { house: 'christies', name: '20th Century Day Sale', date: '30 Sep', kind: 'live', url: 'https://www.christies.com/en/auction/20th-century-day-sale-30624/overview' },
      { house: 'christies', name: '21st Century Day Sale', date: '30 Sep', kind: 'live', url: 'https://www.christies.com/en/departments/post-war-and-contemporary-art' },
      { house: 'sothebys', name: 'Modern Day Auction', date: '30 Sep', kind: 'live', url: 'https://www.sothebys.com/en/online-auctions.html/' },
      { house: 'sothebys', name: 'Contemporary Day Auction', date: '30 Sep', kind: 'live', url: 'https://www.sothebys.com/en/departments/contemporary-art' },
    ],
  },
  {
    id: '2026-new-york-november',
    year: 2026,
    city: 'New York',
    month: 'November',
    label: 'New York · November',
    dateRange: '2–20 November 2026',
    status: 'scheduled',
    description: 'New York fall marquee cycle. Results will be locked after the final sale closes.',
    saleEventIds: [],
    auctions: [
      { house: 'christies', name: '20th Century Evening Sale', date: '2–20 Nov', kind: 'online', url: 'https://www.christies.com/en/departments/post-war-and-contemporary-art' },
      { house: 'christies', name: 'Post-War and Contemporary Art Day Sale', date: '2–20 Nov', kind: 'online', url: 'https://www.christies.com/en/departments/post-war-and-contemporary-art' },
      { house: 'christies', name: '21st Century Evening Sale', date: '2–20 Nov', kind: 'online', url: 'https://www.christies.com/en/departments/post-war-and-contemporary-art' },
    ],
  },
];

export const auctionSeasonMap = Object.fromEntries(
  auctionSeasons.map(season => [season.id, season]),
) as Record<string, AuctionSeason>;

export const seasonStatusMeta: Record<SeasonStatus, { label: string; description: string }> = {
  final: { label: 'FINAL', description: 'Snapshot locked. Later crawls do not change this season.' },
  partial: { label: 'PARTIAL DATA', description: 'Only verified and accessible results are included.' },
  scheduled: { label: 'SCHEDULED', description: 'Auction schedule only. Results are not yet locked.' },
};
