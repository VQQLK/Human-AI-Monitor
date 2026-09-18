const AI_PROMPT = [
	"You classify signals about AI self-improvement (RSI).",
	"Return STRICT JSON:",
	'{"axes":["smd"|"itq"|"agg"|"cycle_velocity"|"verification"|"hexad"|"geopolitics"],',
	'"relevance":number 0.0-1.0,',
	'"shift":"да"|"нет"|"неопределённо",',
	'"direction":"рост"|"падение"|"стабильно"|"неопределённо",',
	'"reasoning":"1-2 sentences in Russian"}',
	"Axes: smd=self-modification, itq=improvement trajectory,",
	"agg=autonomous goals, cycle_velocity=speed, verification=audit,",
	"hexad=phase transition, geopolitics=AI governance.",
	"RULES:",
	"1. Select 1-3 MOST relevant axes. NEVER return all 7.",
	"2. If nothing fits, return empty array [].",
	"3. shift=да ONLY if a threshold is empirically confirmed.",
	"4. A general news item is NOT a threshold shift.",
	"5. DIRECTION RULE: direction reflects the AXIS VALUE trend, NOT the news topic.",
	"Return ONLY JSON, no markdown."
].join(" ");

const HUMAN_PROMPT = [
	"You classify signals about Humanity (HHI).",
	"Return STRICT JSON:",
	'{"axes":["h1_agency"|"h2_sovereignty"|"h3_wellbeing"|"h4_equity"|"h5_meaning"|"h6_democracy"],',
	'"relevance":number 0.0-1.0,',
	'"shift":"да"|"нет"|"неопределённо",',
	'"direction":"рост"|"падение"|"стабильно"|"неопределённо",',
	'"reasoning":"1-2 sentences in Russian"}',
	"Axes: h1_agency=autonomy, h2_sovereignty=critical thinking,",
	"h3_wellbeing=mental health, h4_equity=access, h5_meaning=purpose,",
	"h6_democracy=institutions.",
	"RULES:",
	"1. Select 1-3 MOST relevant axes.",
	"2. If nothing fits, return empty array [].",
	"3. shift=да ONLY if a threshold is empirically confirmed.",
	"4. DIRECTION RULE: direction reflects the AXIS VALUE trend, NOT the news topic.",
	"Return ONLY JSON, no markdown."
].join(" ");

const SOURCES = [
	{ name: "OpenAI Blog", url: "https://openai.com/news/rss.xml", kind: "ai", type: "rss" },
	{ name: "Anthropic News", url: "https://raw.githubusercontent.com/0xSMW/rss-feeds/main/feeds/feed_anthropic_news.xml", kind: "ai", type: "rss" },
	{ name: "Anthropic Engineering", url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_engineering.xml", kind: "ai", type: "rss" },
	{ name: "Anthropic Research", url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_research.xml", kind: "ai", type: "rss" },
	{ name: "Anthropic Red Team", url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_red.xml", kind: "ai", type: "rss" },
	{ name: "Meta AI Blog", url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_meta_ai.xml", kind: "ai", type: "rss" },
	{ name: "DeepMind Blog", url: "https://deepmind.google/blog/rss.xml", kind: "ai", type: "rss" },
	{ name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", kind: "ai", type: "rss" },
	{ name: "Mistral AI", url: "https://raw.githubusercontent.com/0xSMW/rss-feeds/main/feeds/feed_mistral_news.xml", kind: "ai", type: "rss" },
	{ name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", kind: "ai", type: "rss" },
	{ name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", kind: "ai", type: "rss" },
	{ name: "AI Alignment Forum", url: "https://www.alignmentforum.org/feed.xml", kind: "ai", type: "rss" },
	{ name: "arXiv cs.AI", url: "http://export.arxiv.org/rss/cs.AI", kind: "ai", type: "rss" },
	{ name: "arXiv cs.LG", url: "http://export.arxiv.org/rss/cs.LG", kind: "ai", type: "rss" },
	{ name: "EleutherAI Blog", url: "https://blog.eleuther.ai", kind: "ai", type: "html", htmlSelector: "a.entry-link" },
	{ name: "BAIR Blog", url: "https://bair.berkeley.edu/blog/feed.xml", kind: "ai", type: "rss" },
	{ name: "Cohere Labs Blog", url: "https://cohere-labs-community.github.io/blog/", kind: "ai", type: "html", htmlSelector: "a.post-title" },
	{ name: "Pew Internet", url: "https://www.pewresearch.org/topic/internet-technology/feed/", kind: "human", type: "rss" },
	{ name: "WHO News", url: "https://www.who.int/rss-feeds/news-english.xml", kind: "human", type: "rss" },
	{ name: "Reuters Institute", url: "https://reutersinstitute.politics.ox.ac.uk/rss.xml", kind: "human", type: "rss" },
	{ name: "Freedom House", url: "https://freedomhouse.org/rss.xml", kind: "human", type: "rss" },
];

const AI_AXES = ["smd","itq","agg","cycle_velocity","verification","hexad","geopolitics"];
const HUMAN_AXES = ["h1_agency","h2_sovereignty","h3_wellbeing","h4_equity","h5_meaning","h6_democracy"];

function parseAIResponse(response: any): any {
	const content = response?.choices?.[0]?.message?.content
		?? response?.response
		?? null;
	if (!content) return null;
	if (typeof content === "object") return content;
	if (typeof content === "string") {
		const match = content.match(/\{[\s\S]*\}/);
		if (match) {
			try { return JSON.parse(match[0]); } catch (e) { return null; }
		}
	}
	return null;
}

function validateParsed(p: any): any {
	if (!p || typeof p !== "object") return p;
	if (Array.isArray(p.axes) && p.axes.length > 3) p.axes = p.axes.slice(0, 3);
	if (!Array.isArray(p.axes)) p.axes = [];
	let rel = p.relevance;
	if (typeof rel === "string") rel = parseFloat(rel);
	if (typeof rel !== "number" || isNaN(rel)) rel = 0.5;
	if (rel < 0) rel = 0;
	if (rel > 1) rel = 1;
	p.relevance = rel;
	if (rel < 0.3) p.shift = "неопределённо";
	else if (rel < 0.5 && p.shift === "да") p.shift = "нет";
	if (!["да","нет","неопределённо"].includes(p.shift)) p.shift = "неопределённо";
	if (!["рост","падение","стабильно","неопределённо"].includes(p.direction)) p.direction = "неопределённо";
	return p;
}

function decodeEntities(s: string): string {
	return s
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
		.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&").replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'").replace(/&apos;/g, "'")
		.replace(/&#8217;/g, "\u2019").replace(/&#8216;/g, "\u2018")
		.replace(/&#8220;/g, "\u201C").replace(/&#8221;/g, "\u201D")
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ").trim();
}

function extractTag(xml: string, tag: string): string {
	const re = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i");
	const m = xml.match(re);
	return m ? decodeEntities(m[1]) : "";
}

function parseRSS(xml: string, maxItems: number): any[] {
	const items: any[] = [];
	const rssRe = /<item[\s>][\s\S]*?<\/item>/gi;
	let m;
	while ((m = rssRe.exec(xml)) !== null && items.length < maxItems) {
		const block = m[0];
		items.push({
			title: extractTag(block, "title"),
			summary: extractTag(block, "description").slice(0, 500),
			url: extractTag(block, "link"),
		});
	}
	if (items.length === 0) {
		const atomRe = /<entry[\s>][\s\S]*?<\/entry>/gi;
		while ((m = atomRe.exec(xml)) !== null && items.length < maxItems) {
			const block = m[0];
			const lm = block.match(/<link[^>]*href="([^"]+)"/i);
			items.push({
				title: extractTag(block, "title"),
				summary: extractTag(block, "summary").slice(0, 500),
				url: lm ? lm[1] : "",
			});
		}
	}
	return items;
}

async function fetchFromHtml(src: any): Promise<any[]> {
	const r = await fetch(src.url, {
		headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
	});
	if (!r.ok) throw new Error("HTTP " + r.status);

	const items: any[] = [];
	const seen = new Set<string>();
	let currentItem: any = null;

	const rewriter = new HTMLRewriter().on(src.htmlSelector, {
		element(el: any) {
			const href = el.getAttribute("href");
			if (!href) return;

			let fullUrl = href;
			try {
				fullUrl = href.startsWith("http") ? href : new URL(href, src.url).href;
			} catch (e) { return; }
			if (seen.has(fullUrl)) return;
			seen.add(fullUrl);

			const ariaLabel = el.getAttribute("aria-label");
			const item: any = { title: "", url: fullUrl, summary: "" };

			if (ariaLabel) {
				item.title = decodeEntities(ariaLabel.replace(/^post link to /, ""));
				items.push(item);
			} else {
				items.push(item);
				currentItem = item;
				el.onEndTag(() => { currentItem = null; });
			}
		},
		text(chunk: any) {
			if (currentItem) currentItem.title += chunk.text;
		},
	});

	await rewriter.transform(r).text();

	for (const item of items) {
		if (typeof item.title === "string") {
			item.title = decodeEntities(item.title).trim();
		}
	}

	return items.filter((i: any) => i.title && i.title.length > 3).slice(0, 20);
}

async function sha256Hex(s: string): Promise<string> {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

async function runCollection(env: any, limit: number, maxPerSource: number, offset: number = 0): Promise<any> {
	const startedAt = Date.now();
	const stats: any = {
		sources_processed: 0, items_fetched: 0,
		items_classified: 0, items_saved: 0,
		errors: [], sample: [],
	};
	for (let i = offset; i < offset + limit && i < SOURCES.length; i++) {
		const src = SOURCES[i];
		try {
			let items: any[] = [];
			if (src.type === "html") {
				items = await fetchFromHtml(src);
				items = items.slice(0, maxPerSource);
			} else {
				const r = await fetch(src.url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } });
				if (!r.ok) { stats.errors.push(src.name + ": HTTP " + r.status); continue; }
				const xml = await r.text();
				items = parseRSS(xml, maxPerSource);
			}
			stats.items_fetched += items.length;
			stats.sources_processed++;
			for (const item of items) {
				if (!item.title) continue;
				try {
					const text = (item.title + ". " + item.summary).slice(0, 800);
					const systemPrompt = src.kind === "human" ? HUMAN_PROMPT : AI_PROMPT;
					const ai: any = await env.AI.run(env.CLASSIFIER_MODEL, {
						messages: [
							{ role: "system", content: systemPrompt },
							{ role: "user", content: text }
						],
					});
					const parsed = validateParsed(parseAIResponse(ai));
					if (!parsed) continue;
					stats.items_classified++;
					const hash = await sha256Hex(item.url || item.title);
					const today = new Date().toISOString().slice(0, 10);
					await env.DB.prepare(
						"INSERT OR IGNORE INTO items (hash, title, summary, url, source, date, lang, axes, relevance, shift, direction, reasoning, collected_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
					).bind(
						hash, item.title.slice(0, 500), item.summary.slice(0, 1000),
						item.url.slice(0, 500), src.name, today, "en",
						JSON.stringify(parsed.axes ?? []),
						typeof parsed.relevance === "number" ? parsed.relevance : 0.5,
						String(parsed.shift ?? "неопределённо"),
						String(parsed.direction ?? "неопределённо"),
						String(parsed.reasoning ?? "").slice(0, 1000),
						new Date().toISOString()
					).run();
					stats.items_saved++;
					if (stats.sample.length < 5) {
						stats.sample.push({
							source: src.name, title: item.title.slice(0, 120),
							axes: parsed.axes, relevance: parsed.relevance, shift: parsed.shift,
						});
					}
				} catch (e: any) {
					stats.errors.push("classify " + src.name + ": " + (e?.message ?? e));
				}
			}
		} catch (e: any) {
			stats.errors.push("fetch " + src.name + ": " + (e?.message ?? e));
		}
	}
	return { duration_ms: Date.now() - startedAt, ...stats };
}

function getWeekRange(offsetWeeks: number): any {
	const now = new Date();
	const day = now.getUTCDay();
	const diff = (day + 6) % 7;
	const monday = new Date(now);
	monday.setUTCDate(now.getUTCDate() - diff - 7 * offsetWeeks);
	const sunday = new Date(monday);
	sunday.setUTCDate(monday.getUTCDate() + 6);
	return {
		start: monday.toISOString().slice(0, 10),
		end: sunday.toISOString().slice(0, 10),
	};
}

async function buildProtocolMarkdown(env: any, weekStart: string, weekEnd: string): Promise<string> {
	const res = await env.DB.prepare(
		"SELECT title, url, source, date, axes, relevance, shift, direction, reasoning FROM items WHERE date >= ? AND date <= ? ORDER BY relevance DESC LIMIT 500"
	).bind(weekStart, weekEnd).all();
	const items: any[] = res.results ?? [];
	const byAxis: any = {};
	for (const it of items) {
		try {
			const axes = JSON.parse(it.axes ?? "[]");
			for (const a of axes) {
				if (!byAxis[a]) byAxis[a] = [];
				byAxis[a].push(it);
			}
		} catch (e) {}
	}
	const gap: any = await env.DB.prepare(
		"SELECT * FROM gap_history ORDER BY week_start DESC LIMIT 1"
	).first();
	const shifts = items.filter((it) => it.shift === "да").length;
	const lines: string[] = [];
	lines.push("# Human-AI Monitor Protocol");
	lines.push("## Week: " + weekStart + " — " + weekEnd);
	lines.push("");
	lines.push("**Items collected:** " + items.length);
	lines.push("**Shifts detected:** " + shifts);
	lines.push("");
	if (gap) {
		lines.push("### Gap Index");
		lines.push("- AI score: " + gap.ai_score);
		lines.push("- Human score: " + gap.human_score);
		lines.push("- **Gap: " + gap.gap + "** (" + gap.interpretation + ")");
		lines.push("");
	}
	lines.push("---");
	lines.push("");
	lines.push("## AI Axes (RSI)");
	lines.push("");
	for (const axis of AI_AXES) {
		lines.push("### " + axis);
		lines.push("");
		const list = byAxis[axis] ?? [];
		if (list.length === 0) { lines.push("_No signals this week._"); lines.push(""); continue; }
		for (const it of list.slice(0, 5)) {
			const marker = it.shift === "да" ? "🔴" : it.shift === "нет" ? "🟢" : "🟡";
			lines.push("- " + marker + " [" + it.title + "](" + it.url + ") — " + it.source);
			if (it.reasoning) lines.push("  - " + it.reasoning);
		}
		lines.push("");
	}
	lines.push("## Human Axes (HHI)");
	lines.push("");
	for (const axis of HUMAN_AXES) {
		lines.push("### " + axis);
		lines.push("");
		const list = byAxis[axis] ?? [];
		if (list.length === 0) { lines.push("_No signals this week._"); lines.push(""); continue; }
		for (const it of list.slice(0, 5)) {
			const marker = it.shift === "да" ? "🔴" : it.shift === "нет" ? "🟢" : "🟡";
			lines.push("- " + marker + " [" + it.title + "](" + it.url + ") — " + it.source);
			if (it.reasoning) lines.push("  - " + it.reasoning);
		}
		lines.push("");
	}
	lines.push("---");
	lines.push("");
	lines.push("**Together — We Are Strong.**");
	return lines.join("\n");
}

async function generateAndSaveProtocol(env: any, offsetWeeks: number): Promise<any> {
	const range = getWeekRange(offsetWeeks);
	const markdown = await buildProtocolMarkdown(env, range.start, range.end);
	const itemsRes = await env.DB.prepare(
		"SELECT COUNT(*) as n FROM items WHERE date >= ? AND date <= ?"
	).bind(range.start, range.end).first();
	const shiftsRes = await env.DB.prepare(
		"SELECT COUNT(*) as n FROM items WHERE date >= ? AND date <= ? AND shift = 'да'"
	).bind(range.start, range.end).first();
	const gap: any = await env.DB.prepare(
		"SELECT * FROM gap_history ORDER BY week_start DESC LIMIT 1"
	).first();
	const itemsCount = (itemsRes as any)?.n ?? 0;
	const shiftsCount = (shiftsRes as any)?.n ?? 0;
	const path = "data/protocols/" + range.start + "_" + range.end + ".md";
	await env.DB.prepare(
		"INSERT OR REPLACE INTO protocols (week_start, week_end, ai_score, human_score, gap_index, items_count, shifts_count, path, generated_at, content) VALUES (?,?,?,?,?,?,?,?,?,?)"
	).bind(
		range.start, range.end,
		gap?.ai_score ?? 0, gap?.human_score ?? 0, gap?.gap ?? 0,
		itemsCount, shiftsCount, path, new Date().toISOString(), markdown
	).run();
	return {
		week_start: range.start, week_end: range.end,
		items_count: itemsCount, shifts_count: shiftsCount,
		bytes: markdown.length,
	};
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		const CORS = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};
		const json = (data: unknown, status: number) =>
			new Response(JSON.stringify(data, null, 2), {
				status,
				headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
			});
		if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

		try {
			if (path === "/") {
				return json({
					project: "Human-AI Monitor",
					version: "0.9.0",
					github: "https://github.com/VQQLK/Human-AI-Monitor",
					model: env.CLASSIFIER_MODEL,
					sources_count: SOURCES.length,
					endpoints: ["/health", "/gap", "/protocols", "/protocols/{week}", "/protocols/{week}/content", "/axes/{axis}", "/classify", "/collect", "/generate"],
				}, 200);
			}
			if (path === "/health") return json({ status: "ok", ts: Date.now() }, 200);

			if (path === "/gap") {
				const row = await env.DB.prepare("SELECT * FROM gap_history ORDER BY week_start DESC LIMIT 1").first();
				if (!row) return json({ error: "No gap data" }, 404);
				return json(row, 200);
			}
			if (path === "/protocols") {
				const res = await env.DB.prepare("SELECT week_start, week_end, ai_score, human_score, gap_index, items_count, shifts_count, path, generated_at FROM protocols ORDER BY week_start DESC LIMIT 50").all();
				return json({ count: res.results?.length ?? 0, protocols: res.results ?? [] }, 200);
			}
			const cm = path.match(/^\/protocols\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/content$/);
			if (cm) {
				const row: any = await env.DB.prepare(
					"SELECT content FROM protocols WHERE week_start = ?"
				).bind(cm[1]).first();
				if (!row || !row.content) return json({ error: "No content" }, 404);
				return new Response(row.content, {
					headers: { "Content-Type": "text/markdown; charset=utf-8", ...CORS },
				});
			}
			const pm = path.match(/^\/protocols\/([0-9]{4}-[0-9]{2}-[0-9]{2})$/);
			if (pm) {
				const row = await env.DB.prepare("SELECT week_start, week_end, ai_score, human_score, gap_index, items_count, shifts_count, path, generated_at FROM protocols WHERE week_start = ?").bind(pm[1]).first();
				if (!row) return json({ error: "Not found" }, 404);
				return json(row, 200);
			}
			const am = path.match(/^\/axes\/([a-z0-9_]+)$/);
			if (am) {
				const axis = am[1];
				const res = await env.DB.prepare("SELECT hash, title, summary, url, source, date, axes, relevance, shift, direction, reasoning FROM items ORDER BY date DESC LIMIT 200").all();
				const items = (res.results ?? []).filter((row: any) => {
					try {
						const a = JSON.parse(row.axes ?? "[]");
						return Array.isArray(a) && a.includes(axis);
					} catch (e) { return false; }
				});
				return json({ axis, count: items.length, items }, 200);
			}
			if (path === "/classify") {
				const text = url.searchParams.get("text");
				const kind = (url.searchParams.get("kind") ?? "ai").toLowerCase();
				if (!text) return json({ error: "Missing text" }, 400);
				if (text.length > 1000) return json({ error: "Text too long (max 1000 chars)" }, 400);
				const systemPrompt = kind === "human" ? HUMAN_PROMPT : AI_PROMPT;
				const response: any = await env.AI.run(env.CLASSIFIER_MODEL, {
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: text }
					],
				});
				return json({ input: text, kind, parsed: validateParsed(parseAIResponse(response)) }, 200);
			}
			if (path === "/collect") {
				const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "3", 10), SOURCES.length);
				const maxPerSource = Math.min(parseInt(url.searchParams.get("max") ?? "2", 10), 5);
				const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10));
				return json(await runCollection(env, limit, maxPerSource, offset), 200);
			}
			if (path === "/generate") {
				const weekParam = url.searchParams.get("week");
				let offset = 0;
				if (weekParam) {
					const target = new Date(weekParam + "T00:00:00Z");
					const now = new Date();
					offset = Math.floor((now.getTime() - target.getTime()) / (7 * 24 * 3600 * 1000));
				}
				return json(await generateAndSaveProtocol(env, offset), 200);
			}
			return json({ error: "Not Found", path }, 404);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return json({ error: "Server Error", message }, 500);
		}
	},

	async scheduled(event, env, ctx): Promise<void> {
		console.log("[cron] " + new Date(event.scheduledTime).toISOString());
		ctx.waitUntil((async () => {
			const collectResult = await runCollection(env, SOURCES.length, 5);
			console.log("[cron] collected: " + JSON.stringify(collectResult));
			const gen = await generateAndSaveProtocol(env, 1);
			console.log("[cron] protocol: " + JSON.stringify(gen));
		})());
	},
};
