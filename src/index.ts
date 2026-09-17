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
	"RULES: 1. Select 1-3 MOST relevant axes. NEVER return all 7.",
	"2. If nothing fits, return empty array [].",
	"3. shift=да ONLY if a threshold is empirically confirmed.",
	"4. A general news item is NOT a threshold shift.",
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
	"RULES: 1. Select 1-3 MOST relevant axes.",
	"2. If nothing fits, return empty array [].",
	"3. shift=да ONLY if a threshold is empirically confirmed.",
	"Return ONLY JSON, no markdown."
].join(" ");

const SOURCES = [
	{ name: "OpenAI Blog", url: "https://openai.com/news/rss.xml", kind: "ai" },
	{ name: "Meta AI Blog", url: "https://ai.meta.com/blog/rss/", kind: "ai" },
	{ name: "DeepMind Blog", url: "https://deepmind.google/blog/rss.xml", kind: "ai" },
	{ name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", kind: "ai" },
	{ name: "Mistral AI", url: "https://mistral.ai/news/feed.xml", kind: "ai" },
	{ name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", kind: "ai" },
	{ name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", kind: "ai" },
	{ name: "AI Alignment Forum", url: "https://www.alignmentforum.org/feed.xml", kind: "ai" },
	{ name: "arXiv cs.AI", url: "http://export.arxiv.org/rss/cs.AI", kind: "ai" },
	{ name: "arXiv cs.LG", url: "http://export.arxiv.org/rss/cs.LG", kind: "ai" },
	{ name: "Pew Internet", url: "https://www.pewresearch.org/topic/internet-technology/feed/", kind: "human" },
	{ name: "WHO News", url: "https://www.who.int/rss-feeds/news-english.xml", kind: "human" },
	{ name: "Reuters Institute", url: "https://reutersinstitute.politics.ox.ac.uk/rss.xml", kind: "human" },
	{ name: "Freedom House", url: "https://freedomhouse.org/rss.xml", kind: "human" },
];

function parseAIResponse(response: any): any {
	const content = response?.choices?.[0]?.message?.content
		?? response?.response
		?? null;
	if (!content) return null;
	if (typeof content === "object") return content;
	if (typeof content === "string") {
		const match = content.match(/\{[\s\S]*\}/);
		if (match) {
			try { return JSON.parse(match[0]); } catch { return null; }
		}
	}
	return null;
}

function validateParsed(p: any): any {
	if (!p || typeof p !== "object") return p;
	if (Array.isArray(p.axes) && p.axes.length > 3) {
		p.axes = p.axes.slice(0, 3);
	}
	if (!Array.isArray(p.axes)) p.axes = [];
	let rel = p.relevance;
	if (typeof rel === "string") rel = parseFloat(rel);
	if (typeof rel !== "number" || isNaN(rel)) rel = 0.5;
	if (rel < 0) rel = 0;
	if (rel > 1) rel = 1;
	p.relevance = rel;
	if (rel < 0.3) p.shift = "неопределённо";
	else if (rel < 0.5 && p.shift === "да") p.shift = "нет";
	const validShift = ["да", "нет", "неопределённо"];
	if (!validShift.includes(p.shift)) p.shift = "неопределённо";
	const validDir = ["рост", "падение", "стабильно", "неопределённо"];
	if (!validDir.includes(p.direction)) p.direction = "неопределённо";
	return p;
}

function decodeEntities(s: string): string {
	return s
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ")
		.trim();
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
			const linkMatch = block.match(/<link[^>]*href="([^"]+)"/i);
			items.push({
				title: extractTag(block, "title"),
				summary: extractTag(block, "summary").slice(0, 500),
				url: linkMatch ? linkMatch[1] : "",
			});
		}
	}
	return items;
}

async function sha256Hex(s: string): Promise<string> {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 16);
}

async function runCollection(env: any, limit: number, maxPerSource: number): Promise<any> {
	const startedAt = Date.now();
	const stats: any = {
		sources_processed: 0,
		items_fetched: 0,
		items_classified: 0,
		items_saved: 0,
		errors: [],
		sample: [],
	};

	for (let i = 0; i < limit; i++) {
		const src = SOURCES[i];
		try {
			const r = await fetch(src.url, {
				headers: { "User-Agent": "human-ai-monitor/0.4" },
			});
			if (!r.ok) {
				stats.errors.push(src.name + ": HTTP " + r.status);
				continue;
			}
			const xml = await r.text();
			const items = parseRSS(xml, maxPerSource);
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
						hash,
						item.title.slice(0, 500),
						item.summary.slice(0, 1000),
						item.url.slice(0, 500),
						src.name,
						today,
						"en",
						JSON.stringify(parsed.axes ?? []),
						typeof parsed.relevance === "number" ? parsed.relevance : 0.5,
						String(parsed.shift ?? "неопределённо"),
						String(parsed.direction ?? "неопределённо"),
						String(parsed.reasoning ?? "").slice(0, 1000),
						new Date().toISOString()
					).run();
					stats.items_saved++;

					if (stats.sample.length < 3) {
						stats.sample.push({
							source: src.name,
							title: item.title.slice(0, 120),
							axes: parsed.axes,
							relevance: parsed.relevance,
							shift: parsed.shift,
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

	return {
		duration_ms: Date.now() - startedAt,
		...stats,
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
		const json = (data: unknown, status = 200) =>
			new Response(JSON.stringify(data, null, 2), {
				status,
				headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
			});
		if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

		try {
			if (path === "/") {
				return json({
					project: "Human-AI Monitor",
					version: "0.4.0",
					github: "https://github.com/VQQLK/Human-AI-Monitor",
					model: env.CLASSIFIER_MODEL,
					sources_count: SOURCES.length,
					endpoints: ["/health", "/gap", "/protocols", "/axes/{axis}", "/classify", "/collect"],
				});
			}
			if (path === "/health") return json({ status: "ok", ts: Date.now() });

			if (path === "/gap") {
				const row = await env.DB.prepare("SELECT * FROM gap_history ORDER BY week_start DESC LIMIT 1").first();
				if (!row) return json({ error: "No gap data" }, 404);
				return json(row);
			}
			if (path === "/protocols") {
				const res = await env.DB.prepare("SELECT * FROM protocols ORDER BY week_start DESC LIMIT 50").all();
				return json({ count: res.results?.length ?? 0, protocols: res.results ?? [] });
			}
			const pm = path.match(/^\/protocols\/([0-9]{4}-[0-9]{2}-[0-9]{2})$/);
			if (pm) {
				const row = await env.DB.prepare("SELECT * FROM protocols WHERE week_start = ?").bind(pm[1]).first();
				if (!row) return json({ error: "Not found" }, 404);
				return json(row);
			}
			const am = path.match(/^\/axes\/([a-z0-9_]+)$/);
			if (am) {
				const axis = am[1];
				const res = await env.DB.prepare("SELECT * FROM items ORDER BY date DESC LIMIT 200").all();
				const items = (res.results ?? []).filter((row: any) => {
					try {
						const a = JSON.parse(row.axes ?? "[]");
						return Array.isArray(a) && a.includes(axis);
					} catch { return false; }
				});
				return json({ axis, count: items.length, items });
			}
			if (path === "/classify") {
				const text = url.searchParams.get("text");
				const kind = (url.searchParams.get("kind") ?? "ai").toLowerCase();
				if (!text) return json({ error: "Missing text" }, 400);
				const systemPrompt = kind === "human" ? HUMAN_PROMPT : AI_PROMPT;
				const response: any = await env.AI.run(env.CLASSIFIER_MODEL, {
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: text }
					],
				});
				return json({ input: text, kind, parsed: validateParsed(parseAIResponse(response)) });
			}

			if (path === "/collect") {
				const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "3", 10), SOURCES.length);
				const maxPerSource = Math.min(parseInt(url.searchParams.get("max") ?? "2", 10), 5);
				return json(await runCollection(env, limit, maxPerSource));
			}

			return json({ error: "Not Found", path }, 404);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return json({ error: "Server Error", message }, 500);
		}
	},

	async scheduled(event, env, ctx): Promise<void> {
		console.log("[cron] " + new Date(event.scheduledTime).toISOString());
		ctx.waitUntil(runCollection(env, SOURCES.length, 5));
	},
};
