import { format, subDays } from 'date-fns';

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

const now = new Date();

const dailySeed = [
  { tokens: 178_200, budget: 210_000, requests: 128, cost: 9.82 },
  { tokens: 191_400, budget: 210_000, requests: 137, cost: 10.44 },
  { tokens: 206_300, budget: 220_000, requests: 144, cost: 11.07 },
  { tokens: 223_800, budget: 230_000, requests: 158, cost: 11.98 },
  { tokens: 241_500, budget: 240_000, requests: 166, cost: 12.74 },
  { tokens: 234_600, budget: 240_000, requests: 161, cost: 12.21 },
  { tokens: 257_900, budget: 245_000, requests: 174, cost: 13.48 },
];

export const dailyUsage: DailyUsagePoint[] = dailySeed.map((point, index) => {
  const date = subDays(now, dailySeed.length - 1 - index);
  return {
    ...point,
    day: format(date, 'EEE'),
    date: format(date, 'MM/dd'),
  };
});

export const workflows: HermesWorkflow[] = [
  {
    id: 'morning-brief',
    name: '아침 브리핑',
    owner: 'cron:08:00',
    cadence: '매일 08:00 KST',
    lastRun: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
    nextRun: new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString(),
    status: 'healthy',
    tokens: 54_200,
    cost: 2.41,
    durationSec: 46,
    model: 'gpt-4.1-mini',
    note: '복약·날씨·캘린더·뉴스 요약',
  },
  {
    id: 'market-watch',
    name: '시장 시황',
    owner: 'market-bot',
    cadence: '매일 08:30 KST',
    lastRun: new Date(now.getTime() - 42 * 60 * 1000).toISOString(),
    nextRun: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
    status: 'healthy',
    tokens: 41_800,
    cost: 1.88,
    durationSec: 33,
    model: 'gpt-4.1-mini',
    note: 'AMZN / INTC / TSLA 및 글로벌 증시',
  },
  {
    id: 'art-digest',
    name: '아트 다이제스트',
    owner: 'karina',
    cadence: '매일 09:00 KST',
    lastRun: new Date(now.getTime() - 62 * 60 * 1000).toISOString(),
    nextRun: new Date(now.getTime() + 21 * 60 * 60 * 1000).toISOString(),
    status: 'watch',
    tokens: 63_900,
    cost: 2.94,
    durationSec: 71,
    model: 'gpt-5.2',
    note: 'Artnet / 전시 / 주요 미술 뉴스',
  },
  {
    id: 'memory-sync',
    name: '메모리 동기화',
    owner: 'hermes-core',
    cadence: '매일 10:00 KST',
    lastRun: new Date(now.getTime() - 110 * 60 * 1000).toISOString(),
    nextRun: new Date(now.getTime() + 20 * 60 * 60 * 1000).toISOString(),
    status: 'healthy',
    tokens: 18_600,
    cost: 0.77,
    durationSec: 19,
    model: 'gpt-4.1-mini',
    note: '메모리 요약·중복 제거·저장',
  },
  {
    id: 'dashboard-audit',
    name: '대시보드 감사',
    owner: 'ux-sweeper',
    cadence: '매 4시간',
    lastRun: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'degraded',
    tokens: 71_400,
    cost: 3.26,
    durationSec: 94,
    model: 'gpt-5.2',
    note: '렌더링 검증 / 스크린샷 QA',
  },
  {
    id: 'weekly-research',
    name: '주간 심화 리서치',
    owner: 'research-agent',
    cadence: '주 1회',
    lastRun: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'queued',
    tokens: 96_000,
    cost: 4.88,
    durationSec: 0,
    model: 'gpt-5.2',
    note: 'AMZN / INTC / TSLA 주간 테마 분석',
  },
];

export const modelUsage: ModelUsagePoint[] = [
  { model: 'gpt-4.1-mini', tokens: 149_200, share: 31 },
  { model: 'gpt-5.2', tokens: 231_300, share: 48 },
  { model: 'gpt-4o-mini', tokens: 87_700, share: 18 },
  { model: 'claude-sonnet-4', tokens: 13_900, share: 3 },
];

export const recentEvents: HermesEvent[] = [
  {
    id: 'evt-1',
    time: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
    title: '아침 브리핑 성공',
    detail: '복약 확인, 날씨, 캘린더, 시장 요약을 한 번에 전송했습니다.',
    tokens: 54_200,
    status: 'success',
  },
  {
    id: 'evt-2',
    time: new Date(now.getTime() - 41 * 60 * 1000).toISOString(),
    title: '시장 시황 완료',
    detail: 'AMZN/INTC/TSLA 리서치와 글로벌 시장 뉴스가 정상 반영되었습니다.',
    tokens: 41_800,
    status: 'success',
  },
  {
    id: 'evt-3',
    time: new Date(now.getTime() - 58 * 60 * 1000).toISOString(),
    title: '아트 다이제스트 재시도',
    detail: 'Artnet 소스 응답 지연으로 1회 재시도 후 성공 처리했습니다.',
    tokens: 63_900,
    status: 'warning',
  },
  {
    id: 'evt-4',
    time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    title: '대시보드 감사 경고',
    detail: 'QA 작업이 예정 시간보다 34초 길어져 감시 상태로 전환했습니다.',
    tokens: 71_400,
    status: 'warning',
  },
  {
    id: 'evt-5',
    time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    title: '주간 심화 리서치 대기열 진입',
    detail: '금주 투자 테마 분석 작업이 큐에 등록되어 있습니다.',
    tokens: 96_000,
    status: 'success',
  },
];

export function getHermesSummary() {
  const totalTokens = dailyUsage.reduce((sum, point) => sum + point.tokens, 0);
  const budget = dailyUsage.reduce((sum, point) => sum + point.budget, 0);
  const totalCost = dailyUsage.reduce((sum, point) => sum + point.cost, 0);
  const totalRequests = dailyUsage.reduce((sum, point) => sum + point.requests, 0);
  const activeJobs = workflows.filter((workflow) => workflow.status !== 'queued').length;
  const healthyJobs = workflows.filter((workflow) => workflow.status === 'healthy').length;
  const watchedJobs = workflows.filter((workflow) => workflow.status === 'watch').length;
  const failedJobs = workflows.filter((workflow) => workflow.status === 'failed').length;
  const avgTokensPerJob = Math.round(totalTokens / workflows.length);
  const burnRate = Math.round((totalTokens / budget) * 100);
  const avgDuration = Math.round(
    workflows.filter((workflow) => workflow.durationSec > 0).reduce((sum, workflow) => sum + workflow.durationSec, 0) /
      workflows.filter((workflow) => workflow.durationSec > 0).length,
  );

  return {
    totalTokens,
    budget,
    totalCost,
    totalRequests,
    activeJobs,
    healthyJobs,
    watchedJobs,
    failedJobs,
    avgTokensPerJob,
    burnRate,
    avgDuration,
  };
}

export function getAlerts(): HermesAlert[] {
  const summary = getHermesSummary();
  const alerts: HermesAlert[] = [];

  if (summary.burnRate >= 95) {
    alerts.push({
      id: 'budget-critical',
      level: 'critical',
      title: '예산 임계치 초과',
      detail: `오늘 토큰 사용량이 예산의 ${summary.burnRate}%에 도달했습니다.`,
    });
  } else if (summary.burnRate >= 80) {
    alerts.push({
      id: 'budget-warning',
      level: 'warning',
      title: '예산 사용량 주의',
      detail: `오늘 토큰 사용량이 예산의 ${summary.burnRate}%입니다.`,
    });
  }

  if (summary.watchedJobs > 0) {
    alerts.push({
      id: 'watch-mode',
      level: 'warning',
      title: '감시 중인 작업 존재',
      detail: `${summary.watchedJobs}개의 작업이 watch 상태입니다. 재시도 또는 소스 확인이 필요할 수 있습니다.`,
    });
  }

  if (summary.failedJobs === 0) {
    alerts.push({
      id: 'healthy',
      level: 'info',
      title: '실패한 작업 없음',
      detail: '최근 실행 기준으로 실패한 Hermes 작업은 없습니다.',
    });
  }

  alerts.push({
    id: 'optimization',
    level: 'info',
    title: '모델 최적화 여지',
    detail: '고토큰 작업은 gpt-5.2 대신 mini 모델로 분리하면 비용 절감 여지가 있습니다.',
  });

  return alerts;
}
