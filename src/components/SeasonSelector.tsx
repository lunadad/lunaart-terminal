'use client';

import { useRouter } from 'next/navigation';
import { auctionSeasons } from '@/lib/auction-seasons';

export default function SeasonSelector({ currentId }: { currentId: string }) {
  const router = useRouter();

  return (
    <label className="block md:hidden">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-muted">Auction season</span>
      <select
        value={currentId}
        onChange={event => router.push(`/seasons/${event.target.value}`)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {auctionSeasons.map(season => (
          <option key={season.id} value={season.id}>{season.year} · {season.label}</option>
        ))}
      </select>
    </label>
  );
}
