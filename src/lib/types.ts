export interface AuctionHouse {
  id: string;
  name: "Christie's" | "Sotheby's";
  logo?: string;
}

export interface SaleEvent {
  id: string;
  auctionHouseId: string;
  name: string;
  city: string;
  date: string;
  category: string;
}

export interface ArtistProfile {
  id: string;
  name: string;
  nationality: string;
  birthYear: number | null;
  deathYear?: number | null;
  category: string; // Contemporary, Modern, Impressionist, etc.
  imageUrl?: string;
}

export interface Lot {
  id: string;
  saleEventId: string;
  auctionHouseId: string;
  artistId: string;
  lotNumber: number;
  title: string;
  medium: string; // Painting, Sculpture, Photography, NFT, etc.
  year: number | null;
  dimensions?: string;
  estimateLow: number;
  estimateHigh: number;
  currency: string;
  lotUrl: string;
}

export interface AuctionResult {
  id: string;
  lotId: string;
  hammerPrice: number | null;
  premiumPrice: number | null; // with buyer's premium
  currency: string;
  usdEquivalent: number | null;
  sold: boolean;
  saleDate: string;
}

export interface LotWithDetails extends Lot {
  result: AuctionResult;
  artist: ArtistProfile;
  saleEvent: SaleEvent;
  auctionHouse: AuctionHouse;
}

export interface MarketPulse {
  totalVolume: number;
  sellThroughRate: number;
  avgEstimateExcess: number;
  totalLots: number;
  soldLots: number;
}

export interface RisingArtist {
  artist: ArtistProfile;
  momentum: number; // percentage change
  recentVolume: number;
  avgPrice: number;
  lotsSold: number;
  reason: string;
}

export interface HotLot extends LotWithDetails {
  estimateRatio: number;
}

export type TimeFilter = '7d' | '30d' | '90d';
export type MediumFilter = 'all' | 'painting' | 'sculpture' | 'photography' | 'prints' | 'nft';
export type PriceRange = 'all' | 'under50k' | '50k-500k' | '500k-5m' | 'over5m';
