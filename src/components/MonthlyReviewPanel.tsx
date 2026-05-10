'use client';

import { useMemo, useState } from 'react';
import {
  MIN_SELL_THROUGH_OFFERED_LOTS,
  formatUsdCompact,
  getDefaultReviewMonth,
  monthlyMetrics,
} from '@/lib/monthly-review';
import type { EventRanking, MonthlyMetric, ReviewMonth } from '@/lib/monthly-review';

function percent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function statusTone(metric: MonthlyMetric): string {
  if (metric.completedEvents > 0) return 'bg-green';
  if (metric.registeredEvents > 0) return 'bg-orange';
  return 'bg-muted/40';
}

function compactTitle(title: string): string {
  return title.replace('20th/21st Century', '20/21C').replace('Modern & Contemporary', 'Mod/Contemp');
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] leading-relaxed text-muted border border-dashed border-border rounded-lg px-2.5 py-2">
      {children}
    </p>
  );
}

function EventRows({ rows, empty }: { rows: EventRanking[]; empty: string }) {
  if (rows.length === 0) return <EmptyState>{empty}</EmptyState>;

  return (
    <ol className="space-y-2">
      {rows.map((row, index) => (
        <li key={row.eventId} className="min-w-0">
          <div className="flex items-start gap-1.5 min-w-0">
            <span className="mt-0.5 w-4 h-4 rounded bg-accent/10 text-accent text-[9px] font-mono flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] leading-snug text-foreground truncate" title={row.saleTitle}>
                {compactTitle(row.saleTitle)}
              </p>
              <p className="text-[9px] text-muted font-mono truncate">
                {formatUsdCompact(row.totalHammerPremiumUsd)} · {percent(row.sellThroughRate)} · {row.soldLots}/{row.offeredLots}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function MonthlyReviewPanel() {
  const [activeMonth, setActiveMonth] = useState<ReviewMonth>(() => getDefaultReviewMonth());
  const activeMetric = useMemo(
    () => monthlyMetrics.find((metric) => metric.month === activeMonth) ?? monthlyMetrics[0],
    [activeMonth]
  );
  const hasCompletedData = activeMetric.completedEvents > 0;
  const qaLabel = activeMetric.registeredEvents === 0
    ? '등록 필요'
    : hasCompletedData
      ? activeMetric.qa.passed ? 'QA OK' : 'QA Alert'
      : '수집 대기';
  const qaTone = hasCompletedData && activeMetric.qa.passed ? 'text-green' : 'text-orange';

  return (
    <section className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto border-t border-border">
      <div className="sticky top-0 z-10 bg-surface pt-3 pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h2 className="text-[11px] font-semibold text-foreground tracking-wide">월별 리뷰</h2>
            <p className="text-[9px] text-muted font-mono">2026 EVENT MASTER</p>
          </div>
          <span className="text-[9px] text-muted font-mono shrink-0">
            {activeMetric.label}
          </span>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1" aria-label="월 선택">
          {monthlyMetrics.map((metric) => {
            const selected = metric.month === activeMonth;
            return (
              <button
                key={metric.monthKey}
                type="button"
                onClick={() => setActiveMonth(metric.month)}
                aria-pressed={selected}
                className={`relative w-7 h-7 rounded-lg text-[10px] font-mono shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
                  selected
                    ? 'bg-accent text-white'
                    : 'bg-background border border-border text-muted hover:text-foreground hover:border-border-light'
                }`}
              >
                {metric.month}
                <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${statusTone(metric)}`} />
              </button>
            );
          })}
        </div>
      </div>

      <article className="bg-background border border-border rounded-xl p-3 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted">데이터 범위</p>
            <span className={`text-[9px] font-mono ${qaTone}`}>
              {qaLabel}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-text-secondary">
            지정 이벤트 {activeMetric.registeredEvents}건 / 수집 완료율 {percent(activeMetric.collectionCompletionRate)}
          </p>
          <p className="text-[10px] leading-relaxed text-muted">
            {activeMetric.reviewText}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="text-[9px] text-muted uppercase tracking-wide">낙찰액</p>
            <p className="text-sm font-bold font-mono text-accent truncate">
              {formatUsdCompact(activeMetric.totalHammerPremiumUsd)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-muted uppercase tracking-wide">낙찰률</p>
            <p className="text-sm font-bold font-mono text-foreground truncate">
              {percent(activeMetric.sellThroughRate)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-muted uppercase tracking-wide">평균가</p>
            <p className="text-xs font-semibold font-mono text-text-secondary truncate">
              {formatUsdCompact(activeMetric.averageHammerPremiumUsd)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-muted uppercase tracking-wide">중앙가</p>
            <p className="text-xs font-semibold font-mono text-text-secondary truncate">
              {formatUsdCompact(activeMetric.medianHammerPremiumUsd)}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold text-foreground">핵심 이브닝 세일 TOP3</h3>
            <span className="text-[9px] text-muted font-mono">총액순</span>
          </div>
          <EventRows rows={activeMetric.topEveningSales} empty="등록된 이브닝 세일 결과가 아직 없습니다." />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold text-foreground">작가 TOP5</h3>
            <span className="text-[9px] text-muted font-mono">score</span>
          </div>
          {activeMetric.topArtists.length === 0 ? (
            <EmptyState>작가 랭킹은 sold lot 수집 후 생성됩니다.</EmptyState>
          ) : (
            <ol className="space-y-1.5">
              {activeMetric.topArtists.map((artist, index) => (
                <li key={artist.artistName} className="flex items-center gap-2 min-w-0">
                  <span className="w-4 text-[9px] text-muted font-mono shrink-0">{index + 1}</span>
                  <span className="text-[11px] text-foreground truncate flex-1" title={artist.artistName}>
                    {artist.artistName}
                  </span>
                  <span className="text-[9px] text-muted font-mono shrink-0">
                    {formatUsdCompact(artist.totalHammerPremiumUsd)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold text-foreground">낙찰률 TOP5</h3>
            <span className="text-[9px] text-muted font-mono">min {MIN_SELL_THROUGH_OFFERED_LOTS}</span>
          </div>
          <EventRows rows={activeMetric.topSellThrough} empty={`offered lot ${MIN_SELL_THROUGH_OFFERED_LOTS}개 이상 결과가 없습니다.`} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[10px] font-semibold text-foreground">하이라이트 lot</h3>
          {activeMetric.highlightLots.length === 0 ? (
            <EmptyState>최고가 lot은 낙찰 결과 반영 후 표시됩니다.</EmptyState>
          ) : (
            <ol className="space-y-1.5">
              {activeMetric.highlightLots.map((lot, index) => (
                <li key={lot.lotId} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] text-foreground truncate" title={`${lot.artistName}, ${lot.title}`}>
                      {index + 1}. {lot.artistName}
                    </p>
                    <span className="text-[9px] font-mono text-accent shrink-0">
                      {formatUsdCompact(lot.hammerPremiumUsd)}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted truncate">
                    Lot {lot.lotNumber} · {lot.title}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {!hasCompletedData && (
          <div className="pt-2 border-t border-border">
            <p className="text-[9px] leading-relaxed text-muted">
              운영 루틴: D+1 결과 감지, D+4 누락 정제, D+5 집계 캐시 갱신.
            </p>
          </div>
        )}
      </article>
    </section>
  );
}
