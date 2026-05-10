'use client';

import { useState, useMemo } from 'react';

type House = 'all' | 'christies' | 'sothebys';
type AuctionKind = 'all' | 'live' | 'online';

interface Auction {
  house: 'christies' | 'sothebys';
  title: string;
  date: string;
  dateSort: string;
  location: string;
  href: string;
  kind: 'live' | 'online';
}

const CHR_STYLE = { background: 'rgba(249,115,22,0.12)', color: '#f97316' };
const SOT_STYLE = { background: 'rgba(139,155,0,0.14)', color: '#8b9b00' };

const MONTH_LABELS: Record<string, string> = {
  '2026-03': 'March 2026',
  '2026-04': 'April 2026',
  '2026-05': 'May 2026',
};

const auctions: Auction[] = [
  // ── March 2026 · Christie's ──────────────────────────────────────────
  {
    house: 'christies',
    title: "An Exceptional René Engel Collection",
    date: "10 Mar",
    dateSort: "2026-03-10",
    location: "London",
    href: "https://www.christies.com/en/auction/an-exceptional-ren-engel-collection-31341/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Prints and Multiples",
    date: "12–26 Mar",
    dateSort: "2026-03-12",
    location: "London",
    href: "https://www.christies.com/en/auction/prints-and-multiples-24150-cks/",
    kind: 'online',
  },
  {
    house: 'christies',
    title: "Contemporary Edition: London",
    date: "17–31 Mar",
    dateSort: "2026-03-17",
    location: "London",
    href: "https://www.christies.com/en/auction/contemporary-edition-london-24151-cks/",
    kind: 'online',
  },
  {
    house: 'christies',
    title: "Modern British and Irish Art Evening Sale",
    date: "18 Mar",
    dateSort: "2026-03-18",
    location: "London",
    href: "https://www.christies.com/en/auction/modern-british-and-irish-art-evening-sale-31053/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Modern British and Irish Art Day Sale",
    date: "19 Mar",
    dateSort: "2026-03-19",
    location: "London",
    href: "https://www.christies.com/en/auction/modern-british-and-irish-art-day-sale-31054/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Japanese and Korean Art",
    date: "24 Mar",
    dateSort: "2026-03-24",
    location: "New York",
    href: "https://www.christies.com/en/auction/japanese-and-korean-art-24346-nyr/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "South Asian Modern + Contemporary Art",
    date: "25 Mar",
    dateSort: "2026-03-25a",
    location: "New York",
    href: "https://www.christies.com/en/auction/south-asian-modern-contemporary-art-31050/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Indian, Himalayan and Southeast Asian Art",
    date: "25 Mar",
    dateSort: "2026-03-25b",
    location: "New York",
    href: "https://www.christies.com/en/auction/indian-himalayan-and-southeast-asian-art-31055/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Chefs-d'oeuvre de la collection Veil-Picard",
    date: "25 Mar",
    dateSort: "2026-03-25c",
    location: "Paris",
    href: "https://www.christies.com/en/auction/chefs-d-oeuvre-de-la-collection-veil-picard-31113/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Marcel Nies: A Private Passion",
    date: "26 Mar",
    dateSort: "2026-03-26a",
    location: "Paris",
    href: "https://www.christies.com/en/auction/marcel-nies-a-private-passion-31320/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Important Chinese Art",
    date: "26–27 Mar",
    dateSort: "2026-03-26b",
    location: "New York",
    href: "https://www.christies.com/en/auction/important-chinese-art-30931/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "20th/21st Century Evening Sale",
    date: "27 Mar",
    dateSort: "2026-03-27",
    location: "Hong Kong",
    href: "https://www.christies.com/en/auction/20th-21st-century-evening-sale-23844-hgk/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "20th Century Day Sale",
    date: "28 Mar",
    dateSort: "2026-03-28a",
    location: "Hong Kong",
    href: "https://www.christies.com/en/auction/20th-century-day-sale-23845-hgk/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "21st Century Day Sale",
    date: "28 Mar",
    dateSort: "2026-03-28b",
    location: "Hong Kong",
    href: "https://www.christies.com/en/auction/21st-century-day-sale-23846-hgk/",
    kind: 'live',
  },

  // ── March 2026 · Sotheby's ───────────────────────────────────────────
  {
    house: 'sothebys',
    title: "Collection Jean-Marie Rossi, D'un monde l'autre, Part I",
    date: "10 Mar",
    dateSort: "2026-03-10b",
    location: "Paris",
    href: "https://www.sothebys.com/en/buy/auction/2026/collection-jean-marie-rossi-dun-monde-a-lautre-part-i-pf2619",
    kind: 'live',
  },
  {
    house: 'sothebys',
    title: "Collection Jean-Marie Rossi, D'un monde l'autre, Part II",
    date: "11 Mar",
    dateSort: "2026-03-11a",
    location: "Paris",
    href: "https://www.sothebys.com/en/buy/auction/2026/collection-jean-marie-rossi-dun-monde-a-lautre-part-ii-pf2621",
    kind: 'live',
  },
  {
    house: 'sothebys',
    title: "Chinese Archaic Jades from an Important Private Collection",
    date: "4–11 Mar",
    dateSort: "2026-03-11b",
    location: "Hong Kong",
    href: "https://www.sothebys.com/en/buy/auction/2026/chinese-archaic-jades-from-an-important-private-collection",
    kind: 'online',
  },
  {
    house: 'sothebys',
    title: "Collection Jean-Marie Rossi, D'un monde l'autre, Part III",
    date: "12 Mar",
    dateSort: "2026-03-12b",
    location: "Paris",
    href: "https://www.sothebys.com/en/buy/auction/2026/collection-jean-marie-rossi-dun-monde-a-lautre-part-iii-pf2622",
    kind: 'live',
  },
  {
    house: 'sothebys',
    title: "Design",
    date: "5–12 Mar",
    dateSort: "2026-03-12c",
    location: "New York",
    href: "https://www.sothebys.com/en/buy/auction/2026/design",
    kind: 'online',
  },
  {
    house: 'sothebys',
    title: "Prints & Multiples",
    date: "18–25 Mar",
    dateSort: "2026-03-18b",
    location: "London",
    href: "https://www.sothebys.com/en/buy/auction/2026/prints-multiples",
    kind: 'online',
  },
  {
    house: 'sothebys',
    title: "Indian & Himalayan Art, including Property from the Zimmerman Family Collection",
    date: "24 Mar",
    dateSort: "2026-03-24b",
    location: "New York",
    href: "https://www.sothebys.com/en/buy/auction/2026/indian-himalayan-art-including-property-from-the-zimmerman-family-collection",
    kind: 'live',
  },
  {
    house: 'sothebys',
    title: "Huanghuali for the Scholar's Studio: An Important Private Collection",
    date: "25 Mar",
    dateSort: "2026-03-25d",
    location: "New York",
    href: "https://www.sothebys.com/en/buy/auction/2026/huanghuali-for-the-scholars-studio-an-important-private-collection-of-classical-chinese-furniture",
    kind: 'live',
  },
  {
    house: 'sothebys',
    title: "Chinese Art",
    date: "25 Mar",
    dateSort: "2026-03-25e",
    location: "New York",
    href: "https://www.sothebys.com/en/buy/auction/2026/chinese-art",
    kind: 'live',
  },
  {
    house: 'sothebys',
    title: "An Italian Collecting Journey — Chapter II",
    date: "25 Mar",
    dateSort: "2026-03-25f",
    location: "Milan",
    href: "https://www.sothebys.com/en/buy/auction/2026/an-italian-collecting-journey-chapter-ii",
    kind: 'live',
  },

  // ── April 2026 · Christie's ──────────────────────────────────────────
  {
    house: 'christies',
    title: "Collections: Including Ardbraccan House, Ireland and a Sicilian Palazzo",
    date: "1–15 Apr",
    dateSort: "2026-04-01",
    location: "London",
    href: "https://www.christies.com/en/auction/collections-including-ardbraccan-house-ireland-and-a-sicilian-palazzo-24511-cks/",
    kind: 'online',
  },
  {
    house: 'christies',
    title: "Photographs",
    date: "3–17 Apr",
    dateSort: "2026-04-03",
    location: "New York",
    href: "https://www.christies.com/en/auction/photographs-24333-nyr/",
    kind: 'online',
  },
  {
    house: 'christies',
    title: "Prints and Multiples",
    date: "14–15 Apr",
    dateSort: "2026-04-14",
    location: "New York",
    href: "https://www.christies.com/en/auction/prints-and-multiples-24335-nyr/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Radical Genius: Works on Paper from A Distinguished Private Collection",
    date: "15 Apr",
    dateSort: "2026-04-15a",
    location: "Paris",
    href: "https://www.christies.com/en/auction/radical-genius-works-on-paper-from-a-distinguished-private-collection-24844-par/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "20/21 Century Art — Evening Sale",
    date: "15 Apr",
    dateSort: "2026-04-15b",
    location: "Paris",
    href: "https://www.christies.com/en/auction/20-21-century-art-evening-sale-24598-par/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Art Contemporain",
    date: "16 Apr",
    dateSort: "2026-04-16",
    location: "Paris",
    href: "https://www.christies.com/en/auction/art-contemporain-24225-par/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "Art Impressionniste & Moderne",
    date: "17 Apr",
    dateSort: "2026-04-17",
    location: "Paris",
    href: "https://www.christies.com/en/auction/art-impressionniste-moderne-24599-par/",
    kind: 'live',
  },
  {
    house: 'christies',
    title: "The Mary and Cheney Cowles Collection of Indian Painting and Calligraphy",
    date: "28 Apr",
    dateSort: "2026-04-28",
    location: "London",
    href: "https://www.christies.com/en/auction/the-mary-and-cheney-cowles-collection-of-indian-painting-and-calligraphy-24425-cks/",
    kind: 'live',
  },

  // ── May 2026 · Christie's ────────────────────────────────────────────
  {
    house: 'christies',
    title: "Design",
    date: "26–27 May",
    dateSort: "2026-05-26",
    location: "Paris",
    href: "https://www.christies.com/en/auction/design-24483-par/",
    kind: 'live',
  },
];

function groupByMonth(list: Auction[]): [string, Auction[]][] {
  const groups: Record<string, Auction[]> = {};
  list.forEach(a => {
    const key = a.dateSort.substring(0, 7); // "2026-03"
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function ArrowIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function CalendarPage() {
  const [activeHouse, setActiveHouse] = useState<House>('all');
  const [activeKind, setActiveKind] = useState<AuctionKind>('all');

  const filtered = useMemo(() => {
    return auctions
      .filter(a => {
        if (activeHouse !== 'all' && a.house !== activeHouse) return false;
        if (activeKind !== 'all' && a.kind !== activeKind) return false;
        return true;
      })
      .sort((a, b) => a.dateSort.localeCompare(b.dateSort));
  }, [activeHouse, activeKind]);

  const grouped = groupByMonth(filtered);

  const christiesCount = filtered.filter(a => a.house === 'christies').length;
  const sothebysCount = filtered.filter(a => a.house === 'sothebys').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Auction Calendar</h1>
            <p className="text-xs text-muted mt-0.5">
              Upcoming fine art auctions · Christie&apos;s &amp; Sotheby&apos;s
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold font-mono" style={{ color: '#f97316' }}>{christiesCount}</p>
                <p className="text-[10px] text-muted">Christie&apos;s</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold font-mono" style={{ color: '#8b9b00' }}>{sothebysCount}</p>
                <p className="text-[10px] text-muted">Sotheby&apos;s</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* House filter */}
          <div className="flex gap-0.5 bg-background border border-border rounded-lg p-1">
            {(['all', 'christies', 'sothebys'] as House[]).map(h => (
              <button
                key={h}
                onClick={() => setActiveHouse(h)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeHouse === h
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {h === 'all' ? 'All Houses' : h === 'christies' ? "Christie's" : "Sotheby's"}
              </button>
            ))}
          </div>

          {/* Kind filter */}
          <div className="flex gap-0.5 bg-background border border-border rounded-lg p-1">
            {(['all', 'live', 'online'] as AuctionKind[]).map(k => (
              <button
                key={k}
                onClick={() => setActiveKind(k)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeKind === k
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {k === 'all' ? 'All' : k === 'live' ? '🏛 Live' : '🌐 Online'}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted ml-auto font-mono">{filtered.length} auctions</span>
        </div>

        {/* ── Monthly Sections ── */}
        {grouped.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">No auctions match the current filter.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([monthKey, items]) => (
              <section key={monthKey}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest whitespace-nowrap">
                    {MONTH_LABELS[monthKey] ?? monthKey}
                  </h2>
                  <span className="text-[10px] text-muted font-mono bg-surface border border-border rounded-full px-2 py-0.5">
                    {items.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Auction rows */}
                <div className="space-y-1.5">
                  {items.map((auction, idx) => (
                    <a
                      key={idx}
                      href={auction.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-light hover:bg-surface-hover transition-all"
                    >
                      {/* Date */}
                      <span className="w-[72px] shrink-0 text-[11px] font-mono text-muted">
                        {auction.date}
                      </span>

                      {/* House badge */}
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                        style={auction.house === 'christies' ? CHR_STYLE : SOT_STYLE}
                      >
                        {auction.house === 'christies' ? 'CHR' : 'SOT'}
                      </span>

                      {/* Title */}
                      <span className="flex-1 text-sm text-foreground group-hover:text-accent transition-colors min-w-0 truncate">
                        {auction.title}
                      </span>

                      {/* Location */}
                      <span className="hidden md:flex items-center gap-1 text-[11px] text-muted shrink-0">
                        <LocationIcon />
                        {auction.location}
                      </span>

                      {/* Online badge */}
                      {auction.kind === 'online' && (
                        <span className="hidden sm:inline text-[10px] text-muted border border-border rounded px-1.5 py-0.5 shrink-0 font-mono">
                          Online
                        </span>
                      )}

                      {/* Arrow */}
                      <ArrowIcon />
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-[10px] text-muted text-center pb-2 font-mono">
          Data sourced from Christie&apos;s and Sotheby&apos;s official calendars · Fine art categories only
        </p>
      </div>
    </div>
  );
}
