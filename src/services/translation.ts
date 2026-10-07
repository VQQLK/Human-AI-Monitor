// Phase 3: Multilingual protocol translation
//
// Translates protocol markdown from English to Russian (ru) or Chinese (zh)
// while preserving:
//   - Markdown structure (headers, lists, links, bold)
//   - Technical terms (smd, itq, agg, cycle_velocity, verification, hexad, geopolitics)
//   - Axis names (h1_agency, h2_sovereignty, etc.)
//   - URLs (not translated)
//   - Emoji markers (🔴🟢🟡)
//   - Numeric scores (0.53, -0.22)
//
// Batch translation: 10 reasoning items per LLM call to stay under 50-subrequest limit.

export type TranslationLang = 'ru' | 'zh';

const SYSTEM_PROMPT = `You are a professional translator for Human-AI Monitor project.

Your task: translate English text to {LANG_FULL} while preserving:
1. All Markdown formatting (headers, lists, links, bold, italic)
2. Technical axis names UNCHANGED: smd, itq, agg, cycle_velocity, verification, hexad, geopolitics, h1_agency, h2_sovereignty, h3_wellbeing, h4_equity, h5_meaning, h6_democracy
3. All URLs unchanged (inside [title](url) links, translate only the title part)
4. Emoji markers (🔴 🟢 🟡) unchanged
5. Numeric values unchanged (0.53, -0.22, 68, etc.)
6. English technical terms in parentheses like "(smd)", "(itq)" — keep in English
7. Source names unchanged (The Verge, LessWrong, arXiv, etc.)

Translate naturally and professionally. Maintain the original tone:
- Analytical and objective
- Concise (reasoning is already short)
- Technical where appropriate

Output ONLY the translated text. No explanations, no markdown fences around the output.`;

const REASONING_SYSTEM_PROMPT_RU = SYSTEM_PROMPT.replace('{LANG_FULL}', 'Russian');
const REASONING_SYSTEM_PROMPT_ZH = SYSTEM_PROMPT.replace('{LANG_FULL}', 'Simplified Chinese');

const PROTOCOL_SYSTEM_PROMPT_RU = `You are a professional translator for Human-AI Monitor project.

Your task: translate the entire protocol markdown document from English to Russian.

CRITICAL RULES:
1. Preserve exact Markdown structure (all #, ##, ###, -, **, etc.)
2. Do NOT translate technical axis names: smd, itq, agg, cycle_velocity, verification, hexad, geopolitics, h1_agency, h2_sovereignty, h3_wellbeing, h4_equity, h5_meaning, h6_democracy
3. Translate link TITLES but keep URLs unchanged: [Переведённый заголовок](https://original-url.com)
4. Translate section headers: "AI Axes (RSI)" → "Оси ИИ (RSI)", "Human Axes (HHI)" → "Человеческие оси (HHI)"
5. "Gap Index" → "Индекс разрыва"
6. "Items collected" → "Собрано элементов"
7. "Shifts detected" → "Обнаружено сдвигов"
8. "No signals this week" → "Нет сигналов на этой неделе"
9. Preserve all emoji (🔴🟢🟡) and numbers unchanged
10. Translate final slogans:
    - "To bring the greater good to others — what could be a higher goal!" → "Приносить благо другим людям — что может быть выше этой цели!"
    - "United We Stand! Only the one who walks conquers the road." → "Вместе — Мы Сила! Дорогу осилит идущий."
11. "Symmetric development" → "Симметричное развитие"
12. "Humanity is ahead" → "Человечество впереди"
13. "AI is ahead" → "ИИ впереди"
14. CAPITALIZATION: Always write "Человек" and "Человечество" with capital letter when referring to Humanity as a monitored entity (symmetry with "ИИ"). Examples: "Протокол мониторинга Человечества и ИИ", "Оценка Человека", "Человечество впереди".
15. "Humanity-AI Monitor Protocol" → "Протокол мониторинга Человечества и ИИ"
16. "Human score" → "Оценка Человека"
17. "Humanity is ahead" → "Человечество впереди"
18. The two closing slogan lines MUST be adjacent (no blank line, no --- between them) and MUST NOT have trailing whitespace.

Output ONLY the translated markdown. No explanations.`;

const PROTOCOL_SYSTEM_PROMPT_ZH = `You are a professional translator for Human-AI Monitor project.

Your task: translate the entire protocol markdown document from English to Simplified Chinese.

CRITICAL RULES:
1. Preserve exact Markdown structure (all #, ##, ###, -, **, etc.)
2. Do NOT translate technical axis names: smd, itq, agg, cycle_velocity, verification, hexad, geopolitics, h1_agency, h2_sovereignty, h3_wellbeing, h4_equity, h5_meaning, h6_democracy
3. Translate link TITLES but keep URLs unchanged: [翻译的标题](https://original-url.com)
4. Translate section headers: "AI Axes (RSI)" → "人工智能轴线 (RSI)", "Human Axes (HHI)" → "人类轴线 (HHI)"
5. "Gap Index" → "差距指数"
6. "Items collected" → "收集的项目"
7. "Shifts detected" → "检测到的变化"
8. "No signals this week" → "本周无信号"
9. Preserve all emoji (🔴🟢🟡) and numbers unchanged
10. Translate final slogans:
    - "To bring the greater good to others — what could be a higher goal!" → "为他人带来更大的福祉——还有什么比这更高的目标呢！"
    - "United We Stand! Only the one who walks conquers the road." → "我们在一起，就是力量！只有行走者才能征服道路。"
11. "Symmetric development" → "对称发展"
12. "Humanity is ahead" → "人类领先"
13. "AI is ahead" → "人工智能领先"
14. CAPITALIZATION: 人类 is already correct in Chinese (no case distinction). Keep 人类-人工智能 as the standard form.
15. "Humanity-AI Monitor Protocol" → "全人类与人工智能监测协议"
16. "Human score" → "人类得分"
17. The two closing slogan lines MUST be adjacent (no blank line, no --- between them) and MUST NOT have trailing whitespace.

Output ONLY the translated markdown. No explanations.`;

interface ReasoningItem {
	hash: string;
	reasoning: string;
}

interface TranslatedItem {
	hash: string;
	translated: string;
}

/**
 * Translate a batch of reasoning strings to target language.
 * Groups items by 10 to minimize LLM calls.
 */
export async function translateReasoningBatch(
	env: Env,
	items: ReasoningItem[],
	lang: TranslationLang
): Promise<TranslatedItem[]> {
	if (items.length === 0) return [];

	const systemPrompt = lang === 'ru' ? REASONING_SYSTEM_PROMPT_RU : REASONING_SYSTEM_PROMPT_ZH;
	const results: TranslatedItem[] = [];

	// Group by 10
	const BATCH_SIZE = 10;
	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		const batch = items.slice(i, i + BATCH_SIZE);
		const numbered = batch.map((it, idx) => `[${idx + 1}] ${it.reasoning}`).join('\n\n');

		const userPrompt = `Translate the following ${batch.length} reasoning items to ${lang === 'ru' ? 'Russian' : 'Simplified Chinese'}.

Return EXACTLY ${batch.length} lines in format:
[1] translated text

[2] translated text

...

${numbered}`;

		try {
			const response = await env.AI.run(env.CLASSIFIER_MODEL, {
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				temperature: 0.3,
				max_tokens: 4096,
			});

			const translated = (response as any).response || '';
			// Parse numbered responses
			const matches = translated.match(/\[\d+\]\s*([\s\S]*?)(?=\[\d+\]|$)/g) || [];

			for (let j = 0; j < batch.length; j++) {
				const match = matches[j];
				let translatedText = batch[j].reasoning; // fallback to English
				if (match) {
					translatedText = match.replace(/^\[\d+\]\s*/, '').trim();
				}
				results.push({
					hash: batch[j].hash,
					translated: translatedText,
				});
			}
		} catch (err) {
			console.error(`[translate] batch ${i / BATCH_SIZE + 1} failed:`, err);
			// Fallback: use English reasoning
			for (const it of batch) {
				results.push({ hash: it.hash, translated: it.reasoning });
			}
		}
	}

	return results;
}

/**
 * Translate entire protocol markdown document.
 */
/**
 * Force a hard-break between the two bold closing slogan lines at end of file.
 * The LLM may omit the backslash or insert blank lines between them.
 */
function ensureClosingHardBreak(text: string): string {
	// Match two bold lines at the very end of the file, allowing whitespace between.
	const re = /(\*\*[^\n*]+\*\*)(\s*\n\s*)(\*\*[^\n*]+\*\*)(\s*)$/;
	const m = text.match(re);
	if (!m) return text;
	const line1 = m[1].replace(/\\+$/, "") + "\\";
	return text.slice(0, m.index) + line1 + "\n" + m[3] + m[4];
}

export async function translateProtocolMarkdown(
	env: Env,
	englishMarkdown: string,
	lang: TranslationLang
): Promise<string> {
	const systemPrompt = lang === 'ru' ? PROTOCOL_SYSTEM_PROMPT_RU : PROTOCOL_SYSTEM_PROMPT_ZH;

	try {
		const response = await env.AI.run(env.CLASSIFIER_MODEL, {
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: `Translate this protocol markdown to ${lang === 'ru' ? 'Russian' : 'Simplified Chinese'}:\n\n${englishMarkdown}` },
			],
			temperature: 0.3,
			max_tokens: 16384,
		});
		const raw = (response as any).response || englishMarkdown;
		// Normalize: strip trailing spaces/tabs at end of each line (LLM sometimes
		// adds markdown hard-breaks after bold closing lines).
		const cleaned = raw.replace(/[ \t]+$/gm, "");
		// Force a hard-break between the two bold closing lines at end of file.
		return ensureClosingHardBreak(cleaned);
	} catch (err) {
		console.error(`[translate] protocol translation failed:`, err);
		return englishMarkdown;
	}
}

const VOICE_SYSTEM_PROMPT_RU = `You are a professional translator. Translate the following quote to Russian.
Preserve:
- Names of people and organizations (keep in English or standard Russian transliteration).
- Technical terms and URLs unchanged.
- The original meaning and tone.
Output ONLY the translated text.`;

const VOICE_SYSTEM_PROMPT_ZH = `You are a professional translator. Translate the following quote to Simplified Chinese.
Preserve:
- Names of people and organizations (keep in English or standard Chinese translation).
- Technical terms and URLs unchanged.
- The original meaning and tone.
Output ONLY the translated text.`;

/**
 * Translate a single voice quote and update the database.
 */
export async function translateVoiceQuote(
	env: Env,
	voiceId: number,
	lang: TranslationLang
): Promise<string | null> {
	const result = await env.DB.prepare(
		"SELECT quote FROM voices WHERE id = ?"
	).bind(voiceId).first<{ quote: string }>();

	if (!result || !result.quote) {
		return null;
	}

	const quote = result.quote;
	const systemPrompt = lang === 'ru' ? VOICE_SYSTEM_PROMPT_RU : VOICE_SYSTEM_PROMPT_ZH;
	const targetLangName = lang === 'ru' ? 'Russian' : 'Simplified Chinese';

	try {
		const response = await env.AI.run(env.CLASSIFIER_MODEL, {
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: `Translate this quote to ${targetLangName}:\n\n"${quote}"` },
			],
			temperature: 0.3,
			max_tokens: 512,
		});

		const translated = ((response as any).response || '').trim();
		
		if (!translated) {
			return null;
		}

		const column = lang === 'ru' ? 'quote_ru' : 'quote_zh';
		await env.DB.prepare(
			"UPDATE voices SET " + column + " = ? WHERE id = ?"
		).bind(translated, voiceId).run();

		return translated;
	} catch (err) {
		console.error(`[translateVoiceQuote] failed for id ${voiceId}:`, err);
		return null;
	}
}

/**
 * Translate a batch of voice quotes in a single LLM call to save time.
 */
export async function translateVoicesBatch(
	env: Env,
	lang: TranslationLang,
	limit: number = 10
): Promise<{ translated: number; remaining: number; errors: string[] }> {
	const column = lang === 'ru' ? 'quote_ru' : 'quote_zh';
	const targetLangName = lang === 'ru' ? 'Russian' : 'Simplified Chinese';

	// 1. Get untranslated quotes
	const items = await env.DB.prepare(
		"SELECT id, quote FROM voices WHERE (" + column + " IS NULL OR " + column + " = '') AND quote IS NOT NULL AND quote != '' ORDER BY created_at DESC LIMIT ?"
	).bind(limit).all<{ id: number; quote: string }>();

	if (!items.results || items.results.length === 0) {
		return { translated: 0, remaining: 0, errors: [] };
	}

	// 2. Format prompt for batch translation
	const numberedQuotes = items.results.map((it, idx) => `[${idx + 1}] "${it.quote}"`).join('\n\n');
	const systemPrompt = `You are a professional translator. Translate the following quotes to ${targetLangName}.
Preserve names, technical terms, and URLs. Output ONLY the translated quotes in the exact same numbered format:
[1] translated quote 1
[2] translated quote 2
...`;

	const errors: string[] = [];
	let translatedCount = 0;

	try {
		// 3. Single LLM call for the whole batch
		const response = await env.AI.run(env.CLASSIFIER_MODEL, {
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: `Translate these ${items.results.length} quotes:\n\n${numberedQuotes}` },
			],
			temperature: 0.3,
			max_tokens: 2048,
		});

		const translatedText = (response as any).response || '';
		
		// 4. Parse and save
		const matches = translatedText.match(/\[\d+\]\s*([\s\S]*?)(?=\[\d+\]|$)/g) || [];
		
		for (let i = 0; i < items.results.length; i++) {
			const match = matches[i];
			let cleanQuote = items.results[i].quote; // fallback
			if (match) {
				cleanQuote = match.replace(/^\[\d+\]\s*"?|"?\s*$/g, '').trim();
			}
			
			try {
				await env.DB.prepare(
					"UPDATE voices SET " + column + " = ? WHERE id = ?"
				).bind(cleanQuote, items.results[i].id).run();
				translatedCount++;
			} catch (err) {
				errors.push(`DB save failed for id ${items.results[i].id}`);
			}
		}
	} catch (err) {
		console.error(`[translateVoicesBatch] LLM call failed:`, err);
		errors.push("LLM translation failed");
	}

	// 5. Check remaining
	const remainingRes = await env.DB.prepare(
		"SELECT COUNT(*) as count FROM voices WHERE (" + column + " IS NULL OR " + column + " = '') AND quote IS NOT NULL AND quote != ''"
	).first<{ count: number }>();

	return { 
		translated: translatedCount, 
		remaining: remainingRes?.count ?? 0, 
		errors 
	};
}
