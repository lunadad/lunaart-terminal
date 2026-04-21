'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatKst } from '@/lib/hermes-format';
import type { HermesMonitorSnapshot } from '@/lib/hermes-live-data';

const API_URL = '/lunaart-terminal/hermes-snapshot.json';

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const shortCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function tokensLabel(value: number) {
  return `${Math.round(value / 1000).toLocaleString()}k`;
}

function SectionTitle({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div>
        <h2 className="text-sm md:text-base font-semibold text-foreground">{title}</h2>
        <p className="text-[10px] md:text-xs text-muted uppercase tracking-widest mt-0.5">{caption}</p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'accent' | 'green' | 'yellow' | 'orange' | 'purple' | 'red';
}) {
  const toneClass = {
    accent: 'text-accent',
    green: 'text-green',
    yellow: 'text-yellow',
    orange: 'text-orange',
    purple: 'text-purple',
    red: 'text-red',
  }[tone];

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-sm">
      <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className={`mt-2 text-2xl md:text-3xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-xs text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}

function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'yellow' | 'orange' | 'red' | 'purple' }) {
  const toneClass = {
    neutral: 'border-border text-text-secondary bg-background',
    green: 'border-green/30 text-green bg-green/10',
    yellow: 'border-yellow/30 text-yellow bg-yellow/10',
    orange: 'border-orange/30 text-orange bg-orange/10',
    red: 'border-red/30 text-red bg-red/10',
    purple: 'border-purple/30 text-purple bg-purple/10',
  }[tone];

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}>{children}</span>;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border-light bg-surface px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-xs" style={{ color: item.color }}>
          {item.name ?? item.dataKey}: {item.dataKey === 'cost' ? currencyFormatter.format(item.value ?? 0) : numberFormatter.format(item.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function statusTone(status: HermesMonitorSnapshot['workflows'][number]['status']) {
  switch (status) {
    case 'healthy': return 'green';
    case 'watch': return 'yellow';
    case 'degraded': return 'orange';
    case 'failed': return 'red';
    case 'queued': return 'purple';
    default: return 'neutral';
  }
}

function statusText(status: HermesMonitorSnapshot['workflows'][number]['status']) {
  switch (status) {
    case 'healthy': return '정상';
    case 'watch': return '감시';
    case 'degraded': return '지연';
    case 'failed': return '실패';
    case 'queued': return '대기';
    default: return status;
  }
}

export default function HermesDashboard() {
  const [snapshot, setSnapshot] = useState<HermesMonitorSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSnapshot = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as HermesMonitorSnapshot;
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchSnapshot();
    const interval = window.setInterval(() => {
      void fetchSnapshot();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [fetchSnapshot]);

  const data = snapshot;
  const tickColor = 'var(--th-muted)';
  const gridColor = 'rgba(255,255,255,0.06)';
  const cursorFill = 'rgba(255,255,255,0.03)';
  const nowLabel = new Intl.DateTimeFormat('ko-KR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const activeAlertCount = data?.alerts.length ?? 0;
  const sourceSummary = data
    ? [data.source.jobsUpdatedAt, data.source.sessionsUpdatedAt, data.source.gatewayUpdatedAt].filter(Boolean).join(' · ')
    : '—';

  const summary = data?.summary;

  if (!data || !summary) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-[1600px]">
        <div className="rounded-2xl border border-border bg-surface p-6 animate-pulse">
          <div className="h-4 w-40 rounded bg-surface-hover mb-3" />
          <div className="h-10 w-3/4 rounded bg-surface-hover mb-2" />
          <div className="h-4 w-full max-w-2xl rounded bg-surface-hover" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-28 rounded-2xl bg-surface-hover" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="h-4 w-48 rounded bg-surface-hover mb-4" />
          <div className="h-72 rounded-2xl bg-surface-hover" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px]">
      <section id="overview" className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
              Hermes work & token monitor
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-semibold text-foreground leading-tight">
                헤르메스 작업과 토큰 사용량 대시보드
              </h1>
              <p className="mt-2 text-sm md:text-base text-text-secondary max-w-3xl">
                Cron 작업, 실행 상태, 토큰 소모, 비용 추정, 경고를 한 화면에서 확인할 수 있는 운영용 모니터입니다.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface px-4 py-3 min-w-[260px]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Last snapshot</p>
            <p className="mt-1 text-sm font-medium text-foreground">{nowLabel}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {summary.gatewayState} · {summary.activeAgents} active agents · {summary.platformState}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              source: {sourceSummary}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
            스냅샷 로드 실패: {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <MetricCard
            label="토큰"
            value={tokensLabel(summary.totalTokens)}
            detail={`최근 ${summary.totalRequests.toLocaleString()}개 요청 스냅샷`}
            tone="accent"
          />
          <MetricCard
            label="예산 대비"
            value={`${summary.burnRate}%`}
            detail={`${tokensLabel(summary.budget)} 예산 중 사용 비율`}
            tone={summary.burnRate >= 90 ? 'red' : summary.burnRate >= 75 ? 'orange' : 'green'}
          />
          <MetricCard
            label="추정 비용"
            value={currencyFormatter.format(summary.totalCost)}
            detail="최근 스냅샷 기준 추정치"
            tone="green"
          />
          <MetricCard
            label="정상 작업"
            value={`${summary.healthyJobs}개`}
            detail={`${summary.watchedJobs}개 작업은 감시/지연 상태`}
            tone="purple"
          />
          <MetricCard
            label="평균 실행"
            value={`${summary.avgDuration}s`}
            detail="작업별 추정 실행 시간 평균"
            tone="yellow"
          />
          <MetricCard
            label="실패 작업"
            value={`${summary.failedJobs}개`}
            detail="현재 스냅샷 기준 실패 수"
            tone={summary.failedJobs > 0 ? 'red' : 'green'}
          />
        </div>
      </section>

      <section id="tokens" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle title="일별 토큰 추세" caption="live / estimated burn" />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.dailyUsage} margin={{ top: 8, right: 6, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={tokensLabel} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill }} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-text-secondary">{value === 'tokens' ? '실제/추정 토큰' : '예산'}</span>
                )}
              />
              <Line type="monotone" dataKey="tokens" name="tokens" stroke="#4f8ffa" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="budget" name="budget" stroke="#00d26a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle title="작업별 토큰 소모" caption="workflow load" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.workflows} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={tokensLabel} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill }} />
              <Bar dataKey="tokens" name="tokens" radius={[8, 8, 0, 0]} fill="#c96442" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.modelUsage.map((model) => (
              <div key={model.model} className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-text-secondary">
                <span className="font-medium text-foreground">{model.model}</span> · {model.share}%
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="jobs" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-surface border border-border rounded-2xl p-5">
          <SectionTitle title="작업 상태" caption="cron / agent / queue" />
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr_0.9fr_0.7fr] gap-3 bg-background/60 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>작업</span>
              <span>실행 주기</span>
              <span>상태</span>
              <span>토큰</span>
              <span>비용</span>
              <span>모델</span>
            </div>
            <div className="divide-y divide-border">
              {data.workflows.map((workflow) => (
                <div key={workflow.id} className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr_0.9fr_0.7fr] gap-3 px-4 py-3 text-sm items-center">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{workflow.name}</p>
                    <p className="text-[11px] text-text-secondary truncate">{workflow.note}</p>
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    <p>{workflow.cadence}</p>
                    <p className="mt-0.5">last {formatKst(workflow.lastRun)}</p>
                  </div>
                  <div>
                    <Chip tone={statusTone(workflow.status)}>{statusText(workflow.status)}</Chip>
                  </div>
                  <div className="font-mono text-foreground">{tokensLabel(workflow.tokens)}</div>
                  <div className="font-mono text-text-secondary">{shortCurrencyFormatter.format(workflow.cost)}</div>
                  <div className="text-[11px] text-text-secondary">{workflow.model}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div id="alerts" className="bg-surface border border-border rounded-2xl p-5">
            <SectionTitle title="경고 / 권장" caption="alerts" />
            <div className="space-y-3">
              {data.alerts.map((alert) => (
                <div key={alert.id} className={`rounded-xl border p-4 ${alert.level === 'critical' ? 'border-red/40 bg-red/10' : alert.level === 'warning' ? 'border-yellow/40 bg-yellow/10' : 'border-border bg-surface'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${alert.level === 'critical' ? 'bg-red' : alert.level === 'warning' ? 'bg-yellow' : 'bg-accent'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">{alert.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <SectionTitle title="오늘의 모델 믹스" caption="token share" />
            <div className="space-y-3">
              {data.modelUsage.map((model) => (
                <div key={model.model}>
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span className="font-medium text-foreground">{model.model}</span>
                    <span className="font-mono text-text-secondary">{tokensLabel(model.tokens)} · {model.share}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-background border border-border overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${model.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle title="최근 실행 로그" caption="activity feed" />
          <div className="space-y-3">
            {data.recentEvents.map((event) => (
              <div key={event.id} className="flex gap-3 rounded-xl border border-border bg-background/40 p-4">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${event.status === 'failed' ? 'bg-red' : event.status === 'warning' ? 'bg-yellow' : 'bg-green'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <span className="text-[10px] font-mono text-muted whitespace-nowrap">{formatKst(event.time)}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary leading-relaxed">{event.detail}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-muted">
                    <span>{tokensLabel(event.tokens)} tokens</span>
                    <Chip tone={event.status === 'warning' ? 'yellow' : event.status === 'failed' ? 'red' : 'green'}>
                      {event.status === 'warning' ? '주의' : event.status === 'failed' ? '실패' : '성공'}
                    </Chip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <SectionTitle title="운영 메모" caption="monitoring notes" />
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              이 대시보드는 Hermes의 cron 상태와 토큰 소모를 빠르게 파악하기 위한 운영 화면입니다. 현재는 로컬 .hermes
              상태를 읽어오는 스냅샷 방식으로 동작합니다.
            </p>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">핵심 체크포인트</p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>예산 사용률이 80%를 넘으면 경고</li>
                <li>watch / degraded 작업은 재실행 또는 소스 확인</li>
                <li>gpt-5.2 대형 작업은 mini 분리로 비용 절감 검토</li>
                <li>실패 로그는 최근 이벤트 피드에서 즉시 확인</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">활성 작업</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{summary.activeJobs}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">경고 수</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{activeAlertCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text-secondary">
        <span>Hermes live snapshot</span>
        <button onClick={() => void fetchSnapshot()} disabled={refreshing} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-foreground hover:bg-background transition-colors disabled:opacity-50">
          <span className="w-2 h-2 rounded-full bg-green" />
          {refreshing ? '새로고침 중' : '새로고침'}
        </button>
      </div>
    </div>
  );
}
