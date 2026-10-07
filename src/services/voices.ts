// ============================================================
// Voice extraction from items
// ============================================================
// Extracts quotes from curated speakers (config/voices.yaml)
// when items match criteria:
// - relevance >= min_relevance (default 0.8)
// - axes includes target_axes (geopolitics OR h2_sovereignty)
// - speaker name in title/summary OR source in sources list
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

export function extractVoice(item: {
  title?: string;
  summary?: string;
  source: string;
  date: string;
  relevance: number;
  axes: string[];
}): ExtractedVoice | null {
  // Criterion: minimum relevance AND speaker name in title/summary
  if (item.relevance < voicesConfig.min_relevance) return null;

  const textToSearch = `${item.title || ''} ${item.summary || ''}`.toLowerCase();

  for (const voice of voicesConfig.voices) {
    for (const keyword of voice.keywords) {
      if (textToSearch.includes(keyword.toLowerCase())) {
        return {
          speaker: voice.name,
          affiliation: voice.affiliation,
          category: voice.category,
          quote: item.title || item.summary || '',
          date: item.date,
          source: item.source,
          relevance: item.relevance,
          axes: item.axes,
        };
      }
    }
  }

  return null;
}): ExtractedVoice | null {
  // Criterion 1: minimum relevance
  if (item.relevance < voicesConfig.min_relevance) return null;
  
  // Criterion 2: speaker name in title/summary
  const textToSearch = `${item.title || ''} ${item.summary || ''}`.toLowerCase();
  
  for (const voice of voicesConfig.voices) {
    for (const keyword of voice.keywords) {
      if (textToSearch.includes(keyword.toLowerCase())) {
        return {
          speaker: voice.name,
          affiliation: voice.affiliation,
          category: voice.category,
          quote: item.title || item.summary || '',
          date: item.date,
          source: item.source,
          relevance: item.relevance,
          axes: item.axes,
        };
      }
    }
  }
  
  // Criterion 3: source in curated sources list
  for (const voice of voicesConfig.voices) {
    if (voice.sources.some(source => item.source.includes(source))) {
      return {
        speaker: voice.name,
        affiliation: voice.affiliation,
        category: voice.category,
        quote: item.title || item.summary || '',
        date: item.date,
        source: item.source,
        relevance: item.relevance,
        axes: item.axes,
      };
    }
  }
  
  return null;
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
