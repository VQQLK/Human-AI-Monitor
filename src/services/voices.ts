// ============================================================
// Voice extraction from items
// ============================================================
// Extracts quotes from curated speakers (config/voices.yaml)
// when items match criteria:
// - relevance >= min_relevance (default 0.8)
// - speaker name in title/summary
// ============================================================

import voicesConfig from '../config/generated/voices';

export interface ExtractedVoice {
  speaker: string;
  affiliation: string;
  category: string;
  quote: string;
  date: string;
  source: string;
  relevance: number;
  axes: string[];
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractVoice(item: {
  title?: string;
  summary?: string;
  source: string;
  date: string;
  relevance: number;
  axes: string[];
}): ExtractedVoice[] {
  // Criterion: minimum relevance AND speaker name in title/summary.
  // Below title_only_below, speaker must be in title (not just summary) —
  // avoids 'passing mention' false positives.
  if (item.relevance < voicesConfig.min_relevance) return [];

  const titleText = (item.title || '').toLowerCase();
  const summaryText = (item.summary || '').toLowerCase();
  const matches: ExtractedVoice[] = [];

  for (const voice of voicesConfig.voices) {
    for (const keyword of voice.keywords) {
      const re = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`);
      const inTitle = re.test(titleText);
      const inSummary = re.test(summaryText);
      if (item.relevance < voicesConfig.title_only_below && !inTitle) continue;
      if (!inTitle && !inSummary) continue;
      {
        matches.push({
          speaker: voice.name,
          affiliation: voice.affiliation,
          category: voice.category,
          quote: item.title || item.summary || '',
          date: item.date,
          source: item.source,
          relevance: item.relevance,
          axes: item.axes,
        });
        break; // one quote per speaker per item
      }
    }
  }

  return matches;
}

export async function saveVoice(
  db: D1Database,
  itemHash: string,
  voice: ExtractedVoice
): Promise<void> {
  await db.prepare(
    `INSERT OR IGNORE INTO voices (
      item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    itemHash,
    voice.speaker,
    voice.affiliation,
    voice.category,
    voice.quote,
    voice.date,
    voice.source,
    voice.relevance,
    JSON.stringify(voice.axes),
    new Date().toISOString()
  ).run();
}
