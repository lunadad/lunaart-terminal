import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

export type HermesStatus = 'healthy' | 'watch' | 'degraded' | 'failed' | 'queued';
export type AlertLevel = 'info' | 'warning' | 'critical';

export interface DailyUsagePoint {
  day: string;
  date: string;
  tokens: number;
  budget: number;
  requests: number;
  cost: number;
}

export interface HermesWorkflow {
  id: string;
  name: string;
  owner: string;
  cadence: string;
  lastRun: string;
  nextRun: string;
  status: HermesStatus;
  tokens: number;
  cost: number;
  durationSec: number;
  model: string;
  note: string;
}

export interface HermesEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  tokens: number;
  status: 'success' | 'warning' | 'failed';
}

export interface HermesAlert {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
}

export interface ModelUsagePoint {
  model: string;
  tokens: number;
  share: number;
}

export interface HermesSummary {
  totalTokens: number;
  budget: number;
  totalCost: number;
  totalRequests: number;
  activeJobs: number;
  healthyJobs: number;
  watchedJobs: number;
  failedJobs: number;
  avgTokensPerJob: number;
  burnRate: number;
  avgDuration: number;
  gatewayState: string;
  activeAgents: number;
  platformState: string;
  lastUpdated: string;
}

export interface HermesMonitorSnapshot {
  summary: HermesSummary;
  dailyUsage: DailyUsagePoint[];
  workflows: HermesWorkflow[];
  modelUsage: ModelUsagePoint[];
  recentEvents: HermesEvent[];
  alerts: HermesAlert[];
  source: {
    jobsUpdatedAt: string | null;
    sessionsUpdatedAt: string | null;
    gatewayUpdatedAt: string | null;
  };
}

type CronJobRecord = {
  id: string;
  name: string;
  prompt: string;
  schedule_display?: string;
  schedule?: { display?: string; expr?: string };
  state?: string;
  enabled?: boolean;
  last_status?: string | null;
  last_error?: string | null;
  last_delivery_error?: string | null;
  next_run_at?: string | null;
  last_run_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  origin?: {
    platform?: string;
    chat_name?: string;
    chat_id?: string;
  };
};

type JobsFile = {
  jobs?: CronJobRecord[];
  updated_at?: string | null;
};

type SessionRecord = {
  session_id: string;
  model?: string;
  updated_at?: string;
  total_tokens?: number;
  last_prompt_tokens?: number;
  estimated_cost_usd?: number;
  platform?: string;
};

type SessionsFile = Record<string, SessionRecord>;

type GatewayFile = {
  gateway_state?: string;
  active_agents?: number;
  updated_at?: string;
  platforms?: Record<string, { state?: string; updated_at?: string }>;
};

const HOME = os.homedir();
const JOBS_PATH = path.join(HOME, '.hermes', 'cron', 'jobs.json');
const SESSIONS_PATH = path.join(HOME, '.hermes', 'sessions', 'sessions.json');
const GATEWAY_PATH = path.join(HOME, '.hermes', 'gateway_state.json');

const kstFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const kstDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function readDateLabel(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return kstFormatter.format(date).replace(',', '');
}

function kstKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return kstDayFormatter.format(date);
}

function estimateTokensFromPrompt(prompt: string) {
  const length = prompt.trim().length;
  return Math.max(900, Math.round(length * 5.4));
}

function estimateCostUsd(tokens: number) {
  return Number((tokens * 0.000042).toFixed(2));
}

function readSchedule(job: CronJobRecord) {
  return job.schedule_display ?? job.schedule?.display ?? job.schedule?.expr ?? '—';
}

function statusFromJob(job: CronJobRecord, now = new Date()): HermesStatus {
  if (job.last_error || job.last_delivery_error || job.last_status === 'failed') return 'failed';
  if (!job.enabled) return 'failed';
  if (job.state === 'paused') return 'watch';
  if (job.last_status === 'ok') {
    if (job.next_run_at && new Date(job.next_run_at).getTime() < now.getTime()) return 'degraded';
    return 'healthy';
  }
  if (!job.last_run_at) return 'queued';
  return 'watch';
}

function modelFromJob(job: CronJobRecord) {
  const prompt = `${job.name} ${job.prompt}`;
  if (/심화|리서치|아트|브리핑|digest/i.test(prompt)) return 'gpt-5.2';
  if (/시장|주식|AMZN|INTC|TSLA/i.test(prompt)) return 'gpt-4.1-mini';
  return 'gpt-4o-mini';
}

function ownerFromJob(job: CronJobRecord) {
  if (job.origin?.platform) {
    return `${job.origin.platform}:${job.origin.chat_name ?? job.origin.chat_id ?? 'origin'}`;
  }
  return 'origin';
}

function trimPrompt(prompt: string) {
  return prompt.replace(/\s+/g, ' ').trim();
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function buildDailyUsage(jobs: CronJobRecord[], sessions: SessionRecord[]): DailyUsagePoint[] {
  const days: Record<string, { tokens: number; requests: number; cost: number }> = {};
  const now = new Date();

  const recentJobs = jobs.filter((job) => job.last_run_at && new Date(job.last_run_at).getTime() <= now.getTime());
  for (const job of recentJobs) {
    const key = kstKey(job.last_run_at as string);
    const tokens = estimateTokensFromPrompt(job.prompt);
    if (!days[key]) days[key] = { tokens: 0, requests: 0, cost: 0 };
    days[key].tokens += tokens;
    days[key].requests += 1;
    days[key].cost += estimateCostUsd(tokens);
  }

  for (const session of sessions) {
    const key = session.updated_at ? kstKey(session.updated_at) : kstKey(now);
    const tokens = Math.max(session.total_tokens ?? 0, session.last_prompt_tokens ?? 0);
    if (!days[key]) days[key] = { tokens: 0, requests: 0, cost: 0 };
    days[key].tokens += tokens;
    days[key].requests += 1;
    days[key].cost += session.estimated_cost_usd ?? estimateCostUsd(tokens);
  }

  const budgetPerDay = 250_000;
  const output = Object.entries(days)
    .map(([date, value]) => ({
      day: date.slice(5),
      date: date.slice(5).replace('-', '/'),
      tokens: value.tokens,
      budget: budgetPerDay,
      requests: value.requests,
      cost: Number(value.cost.toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const lastSeven = output.slice(-7);
  return lastSeven.length > 0 ? lastSeven : [{ day: 'Today', date: '—', tokens: 0, budget: budgetPerDay, requests: 0, cost: 0 }];
}

function buildSessionsSummary(sessions: SessionRecord[]) {
  const normalized = sessions.map((session) => Math.max(session.total_tokens ?? 0, session.last_prompt_tokens ?? 0));
  return {
    tokens: normalized.reduce((sum, value) => sum + value, 0),
    cost: sessions.reduce((sum, session) => sum + (session.estimated_cost_usd ?? 0), 0),
    requests: sessions.length,
    models: sessions.reduce<Record<string, number>>((acc, session) => {
      const model = session.model ?? 'unknown';
      acc[model] = (acc[model] ?? 0) + Math.max(session.total_tokens ?? 0, session.last_prompt_tokens ?? 0);
      return acc;
    }, {}),
  };
}

function buildModelUsage(models: Record<string, number>) {
  const entries = Object.entries(models)
    .map(([model, tokens]) => ({ model, tokens }))
    .sort((a, b) => b.tokens - a.tokens);
  const total = entries.reduce((sum, item) => sum + item.tokens, 0) || 1;
  return entries.map((item) => ({ ...item, share: Math.round((item.tokens / total) * 100) }));
}

function buildWorkflows(jobs: CronJobRecord[]) {
  return jobs
    .slice()
    .sort((a, b) => (new Date(b.last_run_at ?? 0).getTime() || 0) - (new Date(a.last_run_at ?? 0).getTime() || 0))
    .map((job) => {
      const tokens = estimateTokensFromPrompt(job.prompt);
      const durationSec = Math.max(12, Math.round(tokens / 115));
      const lastRun = job.last_run_at ?? job.created_at ?? new Date().toISOString();
      const nextRun = job.next_run_at ?? lastRun;
      const status = statusFromJob(job);
      return {
        id: job.id,
        name: job.name,
        owner: ownerFromJob(job),
        cadence: readSchedule(job),
        lastRun,
        nextRun,
        status,
        tokens,
        cost: estimateCostUsd(tokens),
        durationSec,
        model: modelFromJob(job),
        note: trimPrompt(job.prompt).slice(0, 90) + (job.prompt.trim().length > 90 ? '…' : ''),
      };
    });
}

function buildRecentEvents(jobs: CronJobRecord[]): HermesEvent[] {
  return jobs
    .slice()
    .sort((a, b) => (new Date(b.last_run_at ?? b.created_at ?? 0).getTime() || 0) - (new Date(a.last_run_at ?? a.created_at ?? 0).getTime() || 0))
    .slice(0, 5)
    .map((job, index) => {
      const status = statusFromJob(job);
      const tokens = estimateTokensFromPrompt(job.prompt);
      const eventStatus: HermesEvent['status'] = status === 'failed' ? 'failed' : status === 'degraded' || status === 'watch' ? 'warning' : 'success';
      return {
        id: `${job.id}-${index}`,
        time: job.last_run_at ?? job.created_at ?? new Date().toISOString(),
        title: job.name,
        detail: `${readSchedule(job)} · ${job.last_status === 'ok' ? '정상 완료' : job.last_error ? '오류 감지' : '대기/감시 중'}`,
        tokens,
        status: eventStatus,
      };
    });
}

function buildAlerts(summary: HermesSummary, jobs: CronJobRecord[]): HermesAlert[] {
  const alerts: HermesAlert[] = [];

  if (summary.burnRate >= 95) {
    alerts.push({
      id: 'budget-critical',
      level: 'critical',
      title: '예산 임계치 초과',
      detail: `최근 토큰 사용량이 예산의 ${summary.burnRate}%에 도달했습니다.`,
    });
  } else if (summary.burnRate >= 80) {
    alerts.push({
      id: 'budget-warning',
      level: 'warning',
      title: '예산 사용량 주의',
      detail: `최근 토큰 사용량이 예산의 ${summary.burnRate}%입니다.`,
    });
  }

  const watched = jobs.filter((job) => statusFromJob(job) === 'watch' || statusFromJob(job) === 'degraded').length;
  if (watched > 0) {
    alerts.push({
      id: 'watch-mode',
      level: 'warning',
      title: '감시 중인 작업 존재',
      detail: `${watched}개의 작업이 watch / degraded 상태입니다.`,
    });
  }

  if (summary.failedJobs === 0) {
    alerts.push({
      id: 'healthy',
      level: 'info',
      title: '실패한 작업 없음',
      detail: '현재 스냅샷 기준으로 실패한 Hermes 작업은 없습니다.',
    });
  }

  alerts.push({
    id: 'optimization',
    level: 'info',
    title: '모델 최적화 여지',
    detail: '큰 프롬프트 작업은 더 작은 모델로 분리하면 비용 절감 여지가 있습니다.',
  });

  return alerts;
}

function buildSummary(jobs: CronJobRecord[], sessions: SessionRecord[], gateway: GatewayFile): HermesSummary {
  const sessionSummary = buildSessionsSummary(sessions);
  const activeJobs = jobs.filter((job) => job.enabled !== false).length;
  const healthyJobs = jobs.filter((job) => statusFromJob(job) === 'healthy').length;
  const watchedJobs = jobs.filter((job) => statusFromJob(job) === 'watch' || statusFromJob(job) === 'degraded').length;
  const failedJobs = jobs.filter((job) => statusFromJob(job) === 'failed').length;
  const totalTokens = sessionSummary.tokens + jobs.filter((job) => job.last_run_at).reduce((sum, job) => sum + estimateTokensFromPrompt(job.prompt), 0);
  const budget = Math.max(1, jobs.filter((job) => job.enabled !== false).length * 250_000);
  const totalCost = Number((sessionSummary.cost + jobs.reduce((sum, job) => sum + estimateCostUsd(estimateTokensFromPrompt(job.prompt)), 0)).toFixed(2));
  const avgTokensPerJob = jobs.length > 0 ? Math.round(totalTokens / jobs.length) : 0;
  const avgDuration = jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + Math.max(12, Math.round(estimateTokensFromPrompt(job.prompt) / 115)), 0) / jobs.length) : 0;

  return {
    totalTokens,
    budget,
    totalCost,
    totalRequests: sessionSummary.requests + jobs.filter((job) => job.last_run_at).length,
    activeJobs,
    healthyJobs,
    watchedJobs,
    failedJobs,
    avgTokensPerJob,
    burnRate: Math.min(999, Math.round((totalTokens / budget) * 100)),
    avgDuration,
    gatewayState: gateway.gateway_state ?? 'unknown',
    activeAgents: gateway.active_agents ?? 0,
    platformState: Object.entries(gateway.platforms ?? {})
      .map(([platform, value]) => `${platform}:${value.state ?? 'unknown'}`)
      .join(' · ') || 'unknown',
    lastUpdated: new Date().toISOString(),
  };
}

export async function loadHermesMonitorSnapshot(): Promise<HermesMonitorSnapshot> {
  const [jobsFile, sessionsFile, gatewayFile] = await Promise.all([
    readJsonFile<JobsFile>(JOBS_PATH, { jobs: [] }),
    readJsonFile<SessionsFile>(SESSIONS_PATH, {}),
    readJsonFile<GatewayFile>(GATEWAY_PATH, {}),
  ]);

  const jobs = jobsFile.jobs ?? [];
  const sessions = Object.values(sessionsFile ?? {});
  const summary = buildSummary(jobs, sessions, gatewayFile);
  const dailyUsage = buildDailyUsage(jobs, sessions);
  const workflows = buildWorkflows(jobs);
  const recentEvents = buildRecentEvents(jobs);
  const modelUsage = buildModelUsage(buildSessionsSummary(sessions).models);
  const alerts = buildAlerts(summary, jobs);

  return {
    summary,
    dailyUsage,
    workflows,
    modelUsage,
    recentEvents,
    alerts,
    source: {
      jobsUpdatedAt: jobsFile.updated_at ?? null,
      sessionsUpdatedAt: Object.values(sessions).reduce<string | null>((latest, session) => {
        if (!session.updated_at) return latest;
        if (!latest) return session.updated_at;
        return new Date(session.updated_at).getTime() > new Date(latest).getTime() ? session.updated_at : latest;
      }, null),
      gatewayUpdatedAt: gatewayFile.updated_at ?? null,
    },
  };
}

export function formatKst(value?: string | null) {
  return readDateLabel(value);
}
