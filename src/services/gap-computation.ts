// ============================================================
// Вычисление Gap Index из собранных данных
// Исправление находки F6 из независимого отчёта
// ============================================================

interface GapResult {
  aiScore: number;
  humanScore: number;
  gap: number;
  interpretation: string;
  axisLevels: { [axis: string]: number };
}

const SHIFT_MULT: { [k: string]: number } = {
  'да': 1.5, 'нет': 0.5, 'неопределённо': 1.0
};
const DIR_MULT: { [k: string]: number } = {
  'рост': 1.2, 'падение': 0.8, 'стабильно': 1.0, 'неопределённо': 1.0
};

const AI_AXES = ['smd', 'itq', 'agg', 'cycle_velocity', 'verification', 'hexad', 'geopolitics'];
const HUMAN_AXES = ['h1_agency', 'h2_sovereignty', 'h3_wellbeing', 'h4_equity', 'h5_meaning', 'h6_democracy'];

function computeAxisLevel(signals: any[]): number {
  if (signals.length === 0) return 0;
  let sum = 0;
  for (const s of signals) {
    sum += (s.relevance ?? 0.5) * (SHIFT_MULT[s.shift] ?? 1) * (DIR_MULT[s.direction] ?? 1);
  }
  return Math.max(0, Math.min(1, sum / signals.length));
}

export async function computeGapIndex(env: Env, range: any): Promise<GapResult> {
  const items = await env.DB.prepare(
    "SELECT axes, relevance, shift, direction FROM items WHERE date >= ? AND date <= ?"
  ).bind(range.filterStart, range.filterEnd).all();

  const buckets: { [axis: string]: any[] } = {};
  for (const it of items.results as any[]) {
    if (!it.axes) continue;
    let axes: string[];
    try { axes = JSON.parse(it.axes); } catch { continue; }
    for (const a of axes) {
      (buckets[a] ??= []).push({
        relevance: it.relevance ?? 0.5,
        shift: it.shift ?? 'неопределённо',
        direction: it.direction ?? 'неопределённо'
      });
    }
  }

  const axisLevels: { [k: string]: number } = {};
  for (const a of [...AI_AXES, ...HUMAN_AXES]) {
    axisLevels[a] = computeAxisLevel(buckets[a] || []);
  }

  const avg = (arr: string[]) => arr.reduce((s, a) => s + axisLevels[a], 0) / arr.length;
  const ai = avg(AI_AXES);
  const human = avg(HUMAN_AXES);
  const gap = ai - human;

  let interpretation = 'Symmetric development';
  if (gap < -0.3) interpretation = 'Человечество значительно опережает';
  else if (gap < -0.1) interpretation = 'Humanity is ahead';
  else if (gap > 0.3) interpretation = 'ИИ значительно опережает';
  else if (gap > 0.1) interpretation = 'AI is ahead';

  return {
    aiScore: Math.round(ai * 100) / 100,
    humanScore: Math.round(human * 100) / 100,
    gap: Math.round(gap * 100) / 100,
    interpretation,
    axisLevels
  };
}
