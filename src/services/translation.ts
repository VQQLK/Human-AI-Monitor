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
    - "To bring the greater good to others — what could be a higher goal?" → "Приносить благо другим людям — что может быть выше этой цели?"
    - "United We Stand! Only the one who walks conquers the road." → "Вместе — Мы Сила! Дорогу осилит идущий."
11. "Symmetric development" → "Симметричное развитие"
12. "Humanity is ahead" → "Человечество впереди"
13. "AI is ahead" → "ИИ впереди"
14. CAPITALIZATION: Always write "Человек" and "Человечество" with capital letter when referring to Humanity as a monitored entity (symmetry with "ИИ"). Examples: "Протокол мониторинга Человека и ИИ", "Оценка Человека", "Человечество впереди".
15. "Human-AI Monitor Protocol" → "Протокол мониторинга Человека и ИИ"
16. "Human score" → "Оценка Человека"
17. "Humanity is ahead" → "Человечество впереди"

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
    - "To bring the greater good to others — what could be a higher goal?" → "为他人带来更大的福祉——还有什么比这更高的目标呢？"
    - "United We Stand! Only the one who walks conquers the road." → "我们在一起，就是力量！只有行走者才能征服道路。"
11. "Symmetric development" → "对称发展"
12. "Humanity is ahead" → "人类领先"
13. "AI is ahead" → "人工智能领先"
14. CAPITALIZATION: 人类 is already correct in Chinese (no case distinction). Keep 人类-人工智能 as the standard form.
15. "Human-AI Monitor Protocol" → "人类-人工智能监测协议"
16. "Human score" → "人类得分"

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
		return (response as any).response || englishMarkdown;
	} catch (err) {
		console.error(`[translate] protocol translation failed:`, err);
		return englishMarkdown;
	}
}
