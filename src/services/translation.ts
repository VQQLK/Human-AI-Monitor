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
10. "Symmetric development" → "Симметричное развитие"
11. "Humanity is ahead" → "Человечество впереди"
12. "AI is ahead" → "ИИ впереди"
13. CAPITALIZATION: Always write "Человек" and "Человечество" with capital letter when referring to Humanity as a monitored entity (symmetry with "ИИ"). Examples: "Протокол мониторинга Человечества и ИИ", "Оценка Человека", "Человечество впереди".
14. "Humanity-AI Monitor Protocol" → "Протокол мониторинга Человечества и ИИ"
15. "Human score" → "Оценка Человека"

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
10. "Symmetric development" → "对称发展"
11. "Humanity is ahead" → "人类领先"
12. "AI is ahead" → "人工智能领先"
13. CAPITALIZATION: 人类 is already correct in Chinese (no case distinction). Keep 人类-人工智能 as the standard form.
14. "Humanity-AI Monitor Protocol" → "全人类与人工智能监测协议"
15. "Human score" → "人类得分"

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
	const targetLang = lang === 'ru' ? 'Russian' : 'Simplified Chinese';

	// Split by markdown H2 sections. Each section is translated
	// independently and in parallel. A single 22KB call to the LLM
	// exceeds Cloudflare Workers wall/CPU budget (HTTP 000 / 120s
	// timeout); chunked parallel calls fit comfortably.
	const chunks = splitMarkdownByH2(englishMarkdown);

	try {
		const translatedChunks = await Promise.all(
			chunks.map(async (chunk) => {
				if (!chunk.trim()) return chunk;
				try {
					const response = await env.AI.run(env.CLASSIFIER_MODEL, {
						messages: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: `Translate this protocol markdown section to ${targetLang}. Preserve headings, tables, links, and numbers exactly. Output ONLY the translation, no preamble.\n\n${chunk}` },
						],
						temperature: 0.3,
						max_tokens: 4096,
					});
					return ((response as any).response || chunk);
				} catch (err) {
					console.error(`[translate] chunk failed, using original:`, err);
					return chunk;
				}
			}),
		);
		const raw = translatedChunks.join("\n");
		const cleaned = raw.replace(/[ \t]+$/gm, "");
		return cleaned;
	} catch (err) {
		console.error(`[translate] protocol translation failed:`, err);
		return englishMarkdown;
	}
}

/**
 * Split markdown into chunks at H2 (##) boundaries, keeping the H2 header
 * with its body. Chunks target ~4KB; oversized sections are further split
 * at paragraph boundaries to stay within a single LLM call budget.
 */
function splitMarkdownByH2(md: string): string[] {
	const lines = md.split("\n");
	const chunks: string[] = [];
	let current: string[] = [];

	const flush = () => {
		if (current.length > 0) {
			chunks.push(current.join("\n"));
			current = [];
		}
	};

	for (const line of lines) {
		const isH2 = /^## /.test(line);
		if (isH2 && current.length > 0) flush();
		current.push(line);
	}
	flush();

	const result: string[] = [];
	for (const chunk of chunks) {
		if (chunk.length <= 4000) {
			result.push(chunk);
			continue;
		}
		const paras = chunk.split(/\n\n/);
		let buf = "";
		for (const para of paras) {
			if ((buf + "\n\n" + para).length > 4000 && buf.length > 0) {
				result.push(buf + "\n\n");
				buf = para;
			} else {
				buf = buf ? buf + "\n\n" + para : para;
			}
		}
		if (buf) result.push(buf);
	}
	return result;
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
	const isRu = lang === 'ru';
	const styleRules = isRu
		? '1. Natural Russian news style \u2014 NOT literal translation.\n'
			+ '2. Use "\u043e\u0431" before vowel-initial abbreviations (\u043e\u0431 \u0418\u0418, \u043e\u0431 \u041e\u041e\u041d); "\u043e" before consonants.\n'
			+ '3. Prefer natural verbs:\n'
			+ '   \u00abto have dinner with X\u00bb \u2192 \u00ab\u0431\u0443\u0434\u0435\u0442 \u043d\u0430 \u0443\u0436\u0438\u043d\u0435 \u0441 X\u00bb (NOT \u00ab\u043f\u043e\u043b\u0443\u0447\u0438\u0442 \u0443\u0436\u0438\u043d\u00bb);\n'
			+ '   \u00abremarks at\u00bb \u2192 \u00ab\u0432\u044b\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u0435 \u043d\u0430/\u0432\u00bb (NOT \u00ab\u0437\u0430\u043c\u0435\u0447\u0430\u043d\u0438\u044f\u00bb);\n'
			+ '   \u00abadds X to Y\u00bb \u2192 \u00ab\u0434\u043e\u0431\u0430\u0432\u0438\u043b X \u0432 Y\u00bb (past tense for past events).\n'
			+ 'NAMES (use these exact Russian forms for all speaker mentions): '
			+ 'Dario Amodei → Дарио Амодеи; Sam Altman → Сэм Альтман; Jensen Huang → Дженсен Хуанг; '
			+ 'Ilya Sutskever → Илья Суцкевер; Elon Musk → Илон Маск; Jeff Bezos → Джефф Безос; '
			+ 'Marc Andreessen → Марк Андриссен; Peter Thiel → Питер Тиль; Alex Karp → Алекс Карп; '
			+ 'Paul Graham → Пол Грэм; Eliezer Yudkowsky → Элиезер Юдковский; '
			+ 'Henry Shevlin → Генри Шевлин; Yann LeCun → Янн ЛеКун; Andrej Karpathy → Андрей Карпаты; '
			+ 'Jiang Xueqin → Цзян Сюэцинь; Bill Gates → Билл Гейтс; Vitalik Buterin → Виталик Бутерин; '
			+ 'Mark Zuckerberg → Марк Цукерберг; Demis Hassabis → Демис Хассабис; '
			+ 'Geoffrey Hinton → Джеффри Хинтон; Stuart Russell → Стюарт Рассел; '
			+ 'Yuk Hui → Юк Хуэй; Jay Clayton → Джей Клейтон; Andrew Ferguson → Эндрю Фергюсон; '
			+ 'Emil Michael → Эмиль Майкл; Scott Kupor → Скотт Купор; Susie Wiles → Сьюзи Уайлс\n'

		: '1. Natural Simplified Chinese news style \u2014 NOT literal translation.\n'
			+ '2. Every translation MUST end with \u3002 or \uff01 or \uff1f. Never truncate.\n'
			+ '3. Keep names in their standard form (Sam Altman, OpenAI, Anthropic).\n';

	const systemPrompt = `You are a professional news translator. Translate each quote to ${targetLangName}.
RULES:
${styleRules}4. Preserve brand names, technical terms, and acronyms (OpenAI, Anthropic, GPT, Nvidia).
5. Do NOT add explanations, comments, or surrounding quotes around the translation.
6. Output ONLY numbered lines in this exact format \u2014 no preamble, no markdown:
[1] translation
[2] translation
...

EXAMPLES:
[1] "Sam Altman's remarks at the UN Security Council" \u2192 "\u0412\u044b\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u0435 \u0421\u044d\u043c\u0430 \u0410\u043b\u044c\u0442\u043c\u0430\u043d\u0430 \u0432 \u0421\u043e\u0432\u0435\u0442\u0435 \u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u0438 \u041e\u041e\u041d"
[2] "CEO to have private dinner with Trump" \u2192 "\u0413\u0435\u043d\u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440 \u0431\u0443\u0434\u0435\u0442 \u043d\u0430 \u0437\u0430\u043a\u0440\u044b\u0442\u043e\u043c \u0443\u0436\u0438\u043d\u0435 \u0441 \u0422\u0440\u0430\u043c\u043f\u043e\u043c"
[3] "Amodei adds Thune meeting to Washington tour" \u2192 "\u0410\u043c\u043e\u0434\u0435\u0438 \u0434\u043e\u0431\u0430\u0432\u0438\u043b \u0432\u0441\u0442\u0440\u0435\u0447\u0443 \u0441 \u0422\u044c\u044e\u043d\u043e\u043c \u0432 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0443 \u0432\u0438\u0437\u0438\u0442\u0430 \u0432 \u0412\u0430\u0448\u0438\u043d\u0433\u0442\u043e\u043d"`;

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
			max_tokens: 4096,
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
