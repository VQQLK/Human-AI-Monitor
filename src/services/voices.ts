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
  topic_relevance?: number;
  axes: string[];
}): ExtractedVoice[] {
  // Criterion: minimum relevance AND speaker name in title/summary.
  // Below title_only_below, speaker must be in title (not just summary) —
  // avoids 'passing mention' false positives.
  const relevanceForVoices = item.topic_relevance ?? item.relevance;
  if (relevanceForVoices < voicesConfig.min_relevance) return [];

  const titleText = (item.title || '').toLowerCase();
  const matches: ExtractedVoice[] = [];

  for (const voice of voicesConfig.voices) {
    for (const keyword of voice.keywords) {
      // Unicode-aware word boundaries: \b only works for [A-Za-z0-9_],
      // fails for CJK and other non-Latin scripts. \p{L} matches any
      // Unicode letter, /u enables Unicode mode.
      // CJK keywords: \p{L} lookarounds fail inside CJK text (a CJK name is
      // almost always surrounded by other letters), so substring match there.
      const kwEsc = escapeRegex(keyword.toLowerCase());
      const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(kwEsc);
      const re = new RegExp(
        hasCJK ? kwEsc : `(?<!\\p{L})${kwEsc}(?!\\p{L})`,
        'u'
      );
      // Scientific integrity (§12): speaker must be in TITLE.
      // Summary-only matches produced misleading attributions
      // (e.g. "AMD acquires World Labs" -> Fei-Fei Li).
      if (!re.test(titleText)) continue;
      {
        matches.push({
          speaker: voice.name,
          affiliation: (voice as any).affiliation ?? "",
          category: voice.category,
          quote: item.title || '',
          date: item.date,
          source: item.source,
          relevance: item.relevance,
          axes: item.axes,
        });
        break; // one quote per speaker per item
      }
    }
  }

  // Дедупликация (§16.1): если человек с affiliation, точно совпадающим
  // с name компании-спикера, и компания тоже совпала — оставляем только
  // человека. Устраняет дубли типа "Jensen Huang, Nvidia" (42/48 дублей
  // в БД на 2026-11-15). Компании без affiliation (Google, Meta, OpenAI)
  // и люди со сложным affiliation ("Google, Alphabet", "xAI, Tesla,
  // SpaceX") не затрагиваются — их комбинации считаются независимыми
  // сигналами.
  const speakerNames = new Set(matches.map(m => m.speaker));
  const deduped: ExtractedVoice[] = [];
  const droppedCompanies = new Set<string>();

  for (const m of matches) {
    const aff = (m as any).affiliation as string | undefined;
    if (aff && speakerNames.has(aff)) {
      droppedCompanies.add(aff);
      deduped.push(m);
    } else if (droppedCompanies.has(m.speaker)) {
      continue;
    } else {
      deduped.push(m);
    }
  }

  return deduped;
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
