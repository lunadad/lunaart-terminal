import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const home = os.homedir();
const repoRoot = path.join(home, 'Downloads', 'hermes-terminal');
const jobsFile = JSON.parse(fs.readFileSync(path.join(home, '.hermes', 'cron', 'jobs.json'), 'utf8'));
const sessionsFile = JSON.parse(fs.readFileSync(path.join(home, '.hermes', 'sessions', 'sessions.json'), 'utf8'));
const gatewayFile = JSON.parse(fs.readFileSync(path.join(home, '.hermes', 'gateway_state.json'), 'utf8'));

const jobs = jobsFile.jobs ?? [];
const sessions = Object.values(sessionsFile ?? {});
const tz = 'Asia/Seoul';

function safeDt(value) {
  if (!value) return null;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function kstKey(value) {
  const dt = safeDt(value);
  if (!dt) return '1970-01-01';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dt);
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

function estimateTokens(prompt) {
  return Math.max(900, Math.round(String(prompt ?? '').trim().length * 5.4));
}

function estimateCost(tokens) {
  return Math.round(tokens * 0.000042 * 100) / 100;
}

function statusFromJob(job, now = new Date()) {
  const lastError = job.last_error || job.last_delivery_error;
  if (lastError || job.last_status === 'failed') return 'failed';
  if (!job.enabled) return 'failed';
  if (job.state === 'paused') return 'watch';
  if (job.last_status === 'ok') {
    const nextRun = safeDt(job.next_run_at);
    if (nextRun && nextRun < now) return 'degraded';
    return 'healthy';
  }
  if (!job.last_run_at) return 'queued';
  return 'watch';
}

function readSchedule(job) {
  return job.schedule_display || job.schedule?.display || job.schedule?.expr || '—';
}

function ownerFromJob(job) {
  const origin = job.origin ?? {};
  if (origin.platform) return `${origin.platform}:${origin.chat_name || origin.chat_id || 'origin'}`;
  return 'origin';
}

function modelFromJob(job) {
  const prompt = `${job.name ?? ''} ${job.prompt ?? ''}`;
  if (/(심화|리서치|아트|브리핑)/.test(prompt) || /digest/i.test(prompt)) return 'gpt-5.2';
  if (/(시장|주식|AMZN|INTC|TSLA)/.test(prompt)) return 'gpt-4.1-mini';
  return 'gpt-4o-mini';
}

function trimPrompt(prompt) {
  return String(prompt ?? '').replace(/\s+/g, ' ').trim();
}

const sessionTokens = sessions.reduce((sum, session) => sum + Math.max(Number(session.total_tokens ?? 0), Number(session.last_prompt_tokens ?? 0)), 0);
const sessionCost = sessions.reduce((sum, session) => sum + Number(session.estimated_cost_usd ?? 0), 0);
const recentJobs = jobs.filter((job) => job.last_run_at);
const jobTokens = recentJobs.reduce((sum, job) => sum + estimateTokens(job.prompt), 0);
const summaryTotalTokens = sessionTokens + jobTokens;
const budget = Math.max(1, jobs.filter((job) => job.enabled !== false).length * 250_000);

const summary = {
  totalTokens: summaryTotalTokens,
  budget,
  totalCost: Math.round((sessionCost + jobs.reduce((sum, job) => sum + estimateCost(estimateTokens(job.prompt)), 0)) * 100) / 100,
  totalRequests: sessions.length + recentJobs.length,
  activeJobs: jobs.filter((job) => job.enabled !== false).length,
  healthyJobs: jobs.filter((job) => statusFromJob(job) === 'healthy').length,
  watchedJobs: jobs.filter((job) => ['watch', 'degraded'].includes(statusFromJob(job))).length,
  failedJobs: jobs.filter((job) => statusFromJob(job) === 'failed').length,
  avgTokensPerJob: jobs.length ? Math.round(summaryTotalTokens / jobs.length) : 0,
  burnRate: Math.min(999, Math.round((summaryTotalTokens / budget) * 100)),
  avgDuration: jobs.length ? Math.round(jobs.reduce((sum, job) => sum + Math.max(12, Math.round(estimateTokens(job.prompt) / 115)), 0) / jobs.length) : 0,
  gatewayState: gatewayFile.gateway_state || 'unknown',
  activeAgents: gatewayFile.active_agents || 0,
  platformState: Object.entries(gatewayFile.platforms || {})
    .map(([platform, value]) => `${platform}:${value.state || 'unknown'}`)
    .join(' · ') || 'unknown',
  lastUpdated: new Date().toISOString(),
};

const byDay = new Map();
function add(day, tokens, requests, cost) {
  const current = byDay.get(day) ?? { tokens: 0, requests: 0, cost: 0 };
  current.tokens += tokens;
  current.requests += requests;
  current.cost += cost;
  byDay.set(day, current);
}

for (const job of recentJobs) {
  const key = kstKey(job.last_run_at);
  const tokens = estimateTokens(job.prompt);
  add(key, tokens, 1, estimateCost(tokens));
}
for (const session of sessions) {
  const key = kstKey(session.updated_at || new Date().toISOString());
  const tokens = Math.max(Number(session.total_tokens ?? 0), Number(session.last_prompt_tokens ?? 0));
  add(key, tokens, 1, Number(session.estimated_cost_usd ?? estimateCost(tokens)));
}

const dailyUsage = [...byDay.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .slice(-7)
  .map(([key, value]) => ({
    day: key.slice(5),
    date: key.slice(5).replace('-', '/'),
    tokens: value.tokens,
    budget: 250_000,
    requests: value.requests,
    cost: Math.round(value.cost * 100) / 100,
  }));

const workflows = [...jobs]
  .sort((a, b) => (safeDt(b.last_run_at || b.created_at) || 0) - (safeDt(a.last_run_at || a.created_at) || 0))
  .map((job) => {
    const tokens = estimateTokens(job.prompt);
    const lastRun = job.last_run_at || job.created_at || new Date().toISOString();
    return {
      id: job.id,
      name: job.name,
      owner: ownerFromJob(job),
      cadence: readSchedule(job),
      lastRun,
      nextRun: job.next_run_at || lastRun,
      status: statusFromJob(job),
      tokens,
      cost: estimateCost(tokens),
      durationSec: Math.max(12, Math.round(tokens / 115)),
      model: modelFromJob(job),
      note: `${trimPrompt(job.prompt).slice(0, 90)}${trimPrompt(job.prompt).length > 90 ? '…' : ''}`,
    };
  });

const models = {};
for (const session of sessions) {
  const tokens = Math.max(Number(session.total_tokens ?? 0), Number(session.last_prompt_tokens ?? 0));
  const model = session.model || 'unknown';
  models[model] = (models[model] || 0) + tokens;
}
const totalModelTokens = Object.values(models).reduce((sum, value) => sum + value, 0) || 1;
const modelUsage = Object.entries(models)
  .sort((a, b) => b[1] - a[1])
  .map(([model, tokens]) => ({ model, tokens, share: Math.round((tokens / totalModelTokens) * 100) }));

const recentEvents = [...jobs]
  .sort((a, b) => (safeDt(b.last_run_at || b.created_at) || 0) - (safeDt(a.last_run_at || a.created_at) || 0))
  .slice(0, 5)
  .map((job, index) => {
    const st = statusFromJob(job);
    return {
      id: `${job.id}-${index}`,
      time: job.last_run_at || job.created_at || new Date().toISOString(),
      title: job.name,
      detail: `${readSchedule(job)} · ${job.last_status === 'ok' ? '정상 완료' : job.last_error ? '오류 감지' : '대기/감시 중'}`,
      tokens: estimateTokens(job.prompt),
      status: st === 'failed' ? 'failed' : ['watch', 'degraded'].includes(st) ? 'warning' : 'success',
    };
  });

const alerts = [];
if (summary.burnRate >= 95) alerts.push({ id: 'budget-critical', level: 'critical', title: '예산 임계치 초과', detail: `최근 토큰 사용량이 예산의 ${summary.burnRate}%에 도달했습니다.` });
else if (summary.burnRate >= 80) alerts.push({ id: 'budget-warning', level: 'warning', title: '예산 사용량 주의', detail: `최근 토큰 사용량이 예산의 ${summary.burnRate}%입니다.` });
const watched = jobs.filter((job) => ['watch', 'degraded'].includes(statusFromJob(job))).length;
if (watched) alerts.push({ id: 'watch-mode', level: 'warning', title: '감시 중인 작업 존재', detail: `${watched}개의 작업이 watch / degraded 상태입니다.` });
if (summary.failedJobs === 0) alerts.push({ id: 'healthy', level: 'info', title: '실패한 작업 없음', detail: '현재 스냅샷 기준으로 실패한 Hermes 작업은 없습니다.' });
alerts.push({ id: 'optimization', level: 'info', title: '모델 최적화 여지', detail: '큰 프롬프트 작업은 더 작은 모델로 분리하면 비용 절감 여지가 있습니다.' });

const snapshot = {
  summary,
  dailyUsage,
  workflows,
  modelUsage,
  recentEvents,
  alerts,
  source: {
    jobsUpdatedAt: jobsFile.updated_at || null,
    sessionsUpdatedAt: sessions.reduce((latest, session) => (session.updated_at && (!latest || new Date(session.updated_at) > new Date(latest)) ? session.updated_at : latest), null),
    gatewayUpdatedAt: gatewayFile.updated_at || null,
  },
};

const out = path.join(repoRoot, 'public', 'hermes-snapshot.json');
fs.writeFileSync(out, JSON.stringify(snapshot, null, 2), 'utf8');
console.log(`Wrote ${out} (${jobs.length} jobs, ${sessions.length} sessions)`);
