'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { auctionSeasons } from '@/lib/auction-seasons';

const primaryNavigation = [
  { href: '/', label: '피드', shortLabel: '피드', mark: '●' },
  { href: '/spotlight', label: '스포트라이트', shortLabel: '작가', mark: 'S' },
  { href: '/calendar', label: '캘린더', shortLabel: '일정', mark: '□' },
];

function ThemeIcon({ theme }: { theme: 'dark' | 'light' }) {
  return theme === 'dark' ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 15.002A9.72 9.72 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6c0-1.33.266-2.598.748-3.752A9.753 9.753 0 0 0 3 11.25 9.75 9.75 0 0 0 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const latestSeason = auctionSeasons[0];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="LunaArt Terminal 홈">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-sm font-black text-surface shadow-sm">L</span>
            <span className="flex flex-col leading-none">
              <span className="editorial-serif text-lg leading-none text-foreground">LunaArt</span>
              <span className="mt-1 text-[9px] font-bold tracking-[0.15em] text-muted">MARKET TERMINAL</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
            {primaryNavigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive(item.href) ? 'bg-surface-hover text-foreground' : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="group relative">
              <Link
                href={latestSeason ? `/seasons/${latestSeason.id}` : '/seasons/compare'}
                className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                  pathname.startsWith('/seasons') ? 'bg-surface-hover text-foreground' : 'text-text-secondary hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                시즌 <span className="text-[10px] text-muted">⌄</span>
              </Link>
              <div className="invisible absolute right-0 top-full w-64 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-2xl border border-border bg-surface p-2 shadow-xl">
                  {auctionSeasons.map(season => (
                    <Link key={season.id} href={`/seasons/${season.id}`} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-text-secondary hover:bg-surface-hover hover:text-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${season.status === 'final' ? 'bg-green' : season.status === 'partial' ? 'bg-orange' : 'bg-accent'}`} />
                      <span className="flex-1 truncate">{season.label}</span>
                      <span className="font-mono text-[9px] text-muted">{season.year}</span>
                    </Link>
                  ))}
                  <Link href="/seasons/compare" className="mt-1 block border-t border-border px-3 pt-3 pb-2 text-xs font-semibold text-accent">시즌 비교 →</Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-3">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-muted sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse-dot" /> LIVE DATA
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`${theme === 'dark' ? '라이트' : '다크'} 모드로 전환`}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </div>
      </header>

      <nav className="mobile-bottom-safe fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-border/80 bg-surface/95 px-2 pt-1.5 backdrop-blur-xl md:hidden" aria-label="모바일 주요 메뉴">
        {primaryNavigation.map(item => (
          <Link key={item.href} href={item.href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${isActive(item.href) ? 'text-accent' : 'text-muted'}`}>
            <span className={`grid h-5 min-w-5 place-items-center rounded-md px-1 text-[10px] font-black ${isActive(item.href) ? 'bg-accent text-white' : 'bg-surface-hover text-text-secondary'}`}>{item.mark}</span>
            {item.shortLabel}
          </Link>
        ))}
        <Link href={latestSeason ? `/seasons/${latestSeason.id}` : '/seasons/compare'} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${pathname.startsWith('/seasons') ? 'text-accent' : 'text-muted'}`}>
          <span className={`grid h-5 min-w-5 place-items-center rounded-md px-1 text-[10px] font-black ${pathname.startsWith('/seasons') ? 'bg-accent text-white' : 'bg-surface-hover text-text-secondary'}`}>↔</span>
          시즌
        </Link>
      </nav>
    </>
  );
}
