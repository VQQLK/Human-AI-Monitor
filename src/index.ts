import { detectCheating } from "./cheat-detector";
import { SOURCES } from "./config/sources";
import { AI_AXES, HUMAN_AXES } from "./config/axes";
import { AI_PROMPT, HUMAN_PROMPT } from "./config/prompts";
import { fetchWithRetry } from "./utils/fetch-with-retry";
import { handleExport } from './handlers/export';
import { computeGapIndex } from './services/gap-computation';
import { translateProtocolMarkdown, translateReasoningBatch } from './services/translation';

export function parseAIResponse(response: any): any {
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

export function validateParsed(p: any): any {
	if (!p || typeof p !== "object") return p;
	if (Array.isArray(p.axes) && p.axes.length > 3) p.axes = p.axes.slice(0, 3);
	if (!Array.isArray(p.axes)) p.axes = [];
	let rel = p.relevance;
	if (typeof rel === "string") rel = parseFloat(rel);
	if (typeof rel !== "number" || isNaN(rel)) rel = 0.5;
	if (rel < 0) rel = 0;
	if (rel > 1) rel = 1;
	p.relevance = rel;
	if (rel < 0.3) p.shift = "uncertain";
	else if (rel < 0.5 && p.shift === "yes") p.shift = "no";
	if (!["yes","no","uncertain"].includes(p.shift)) p.shift = "uncertain";
	if (!["up","down","stable","uncertain"].includes(p.direction)) p.direction = "uncertain";
	return p;
}

export function cleanTitle(s: string): string {
	let t = s;
	if (/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i.test(t)) {
		t = t.replace(/^.*?\d{4}\s*/, "");
	}
	t = t.replace(/^(Science|Frontier Red Team|Alignment|Research|Policy|Engineering|Product|Announcements|Societal Impacts|Economic Research|Interpretability|Alignment Science)\s*/i, "");
	return t.trim();
}

export function decodeEntities(s: string): string {
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

export function extractTag(xml: string, tag: string): string {
	const re = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i");
	const m = xml.match(re);
	return m ? cleanTitle(decodeEntities(m[1])) : "";
}

export function parseRSS(xml: string, maxItems: number): any[] {
	const items: any[] = [];
	const rssRe = /<item[\s>][\s\S]*?<\/item>/gi;
	let m;
	while ((m = rssRe.exec(xml)) !== null && items.length < maxItems) {
		const block = m[0];
		const pubDate = extractTag(block, "pubDate");
		items.push({
			title: extractTag(block, "title"),
			summary: extractTag(block, "description").slice(0, 500),
			url: extractTag(block, "link"),
			pubDate: pubDate || null,
		});
	}
	if (items.length === 0) {
		const atomRe = /<entry[\s>][\s\S]*?<\/entry>/gi;
		while ((m = atomRe.exec(xml)) !== null && items.length < maxItems) {
			const block = m[0];
			const lm = block.match(/<link[^>]*href="([^"]+)"/i);
			const published = extractTag(block, "published") || extractTag(block, "updated");
			items.push({
				title: extractTag(block, "title"),
				summary: extractTag(block, "summary").slice(0, 500),
				url: lm ? lm[1] : "",
				pubDate: published || null,
			});
		}
	}
	return items;
}

function parsePubDate(pubDate: string | null): string {
	if (!pubDate) return new Date().toISOString().slice(0, 10);
	try {
		const d = new Date(pubDate);
		if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
		return d.toISOString().slice(0, 10);
	} catch {
		return new Date().toISOString().slice(0, 10);
	}
}

async function fetchFromHtml(src: any): Promise<any[]> {
	const r = await fetchWithRetry(src.url);
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

export async function sha256Hex(s: string): Promise<string> {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

async function runCollection(env: Env, limit: number, maxPerSource: number, offset: number = 0): Promise<any> {
	const startedAt = Date.now();
	const stats: any = {
		sources_processed: 0, items_fetched: 0,
		items_classified: 0, items_saved: 0, items_existing: 0,
		items_skipped_no_title: 0,
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
				const r = await fetchWithRetry(src.url);
				if (!r.ok) { stats.errors.push(src.name + ": HTTP " + r.status); continue; }
				const xml = await r.text();
				items = parseRSS(xml, maxPerSource);
			}
			stats.items_fetched += items.length;
			stats.sources_processed++;
			for (const item of items) {
				if (!item.title) { stats.items_skipped_no_title++; continue; }
				try {
					const hash = await sha256Hex(item.url || item.title);
					const existing: any = await env.DB.prepare(
						"SELECT hash, axes, relevance, shift FROM items WHERE hash = ?"
					).bind(hash).first();

					if (existing) {
						stats.items_existing++;
						if (stats.sample.length < 5) {
							let axes: any[] = [];
							try { axes = JSON.parse(existing.axes ?? "[]"); } catch (e) {}
							if (Array.isArray(axes) && axes.length > 0) {
								stats.sample.push({
									source: src.name, title: item.title.slice(0, 120),
									axes: axes, relevance: existing.relevance, shift: existing.shift,
									existing: true,
								});
							}
						}
						continue;
					}

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

					const itemDate = parsePubDate(item.pubDate);
					await env.DB.prepare(
						"INSERT OR IGNORE INTO items (hash, title, summary, url, source, date, lang, axes, relevance, shift, direction, reasoning, collected_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
					).bind(
						hash, item.title.slice(0, 500), item.summary.slice(0, 1000),
						item.url.slice(0, 500), src.name, itemDate, "en",
						JSON.stringify(parsed.axes ?? []),
						typeof parsed.relevance === "number" ? parsed.relevance : 0.5,
						String(parsed.shift ?? "uncertain"),
						String(parsed.direction ?? "uncertain"),
						String(parsed.reasoning ?? "").slice(0, 1000),
						new Date().toISOString()
					).run();
					stats.items_saved++;
					if (stats.sample.length < 5 && Array.isArray(parsed.axes) && parsed.axes.length > 0) {
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

export function getWeekRange(offsetWeeks: number): any {
	const now = new Date();
	const day = now.getUTCDay();
	const diff = (day + 6) % 7;
	const monday = new Date(now);
	monday.setUTCDate(now.getUTCDate() - diff - 7 * offsetWeeks);
	const sunday = new Date(monday);
	sunday.setUTCDate(monday.getUTCDate() + 6);
	return {
		// Week range: Monday (start) through Sunday (end)
		start: monday.toISOString().slice(0, 10),
		end: sunday.toISOString().slice(0, 10),
		// For SQL filtering: Monday through Sunday
		filterStart: monday.toISOString().slice(0, 10),
		filterEnd: sunday.toISOString().slice(0, 10),
	};
}

// DRAFT protocol for current (still-open) week — read-only, not saved to DB
// Used by /protocols/current endpoint for monitoring and debugging
async function buildDraftProtocolMarkdown(env: Env, range: any): Promise<string> {
	const res = await env.DB.prepare(
		"SELECT title, url, source, date, axes, relevance, shift, direction, reasoning FROM items WHERE date >= ? AND date <= ? ORDER BY relevance DESC LIMIT 500"
	).bind(range.filterStart, range.filterEnd).all();
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
	// Compute Gap Index directly (do NOT write to gap_history — this is draft only)
	const gapResult = await computeGapIndex(env, range);
	const shifts = items.filter((it) => it.shift === "yes").length;
	const lines: string[] = [];
	lines.push("# Human-AI Monitor Protocol (DRAFT)");
	lines.push("## Week: " + range.filterStart + " — " + range.filterEnd + " (Protocol: " + range.start + ")");
	lines.push("");
	lines.push("**⚠️ DRAFT: This week is still open. This protocol is NOT saved to database.**");
	lines.push("**Final version will be automatically generated on Monday at 13:45 UTC.**");
	lines.push("");
	lines.push("**Items collected:** " + items.length);
	lines.push("**Shifts detected:** " + shifts);
	lines.push("");
	lines.push("### Gap Index");
	lines.push("- AI score: " + gapResult.aiScore.toFixed(2));
	lines.push("- Human score: " + gapResult.humanScore.toFixed(2));
	lines.push("- **Gap: " + gapResult.gap.toFixed(2) + "** (" + gapResult.interpretation + ")");
	lines.push("");
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
			const marker = it.shift === "yes" ? "🔴" : it.shift === "no" ? "🟢" : "🟡";
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
			const marker = it.shift === "yes" ? "🔴" : it.shift === "no" ? "🟢" : "🟡";
			lines.push("- " + marker + " [" + it.title + "](" + it.url + ") — " + it.source);
			if (it.reasoning) lines.push("  - " + it.reasoning);
		}
		lines.push("");
	}
	lines.push("---");
	lines.push("");
	lines.push("**To bring the greater good to others — what could be a higher goal?**");
	lines.push("**United We Stand! Only the one who walks conquers the road.**");
	return lines.join("\n");
}

async function buildProtocolMarkdown(env: Env, range: any): Promise<string> {
	const res = await env.DB.prepare(
		"SELECT title, url, source, date, axes, relevance, shift, direction, reasoning FROM items WHERE date >= ? AND date <= ? ORDER BY relevance DESC LIMIT 500"
	).bind(range.filterStart, range.filterEnd).all();
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
		"SELECT * FROM gap_history ORDER BY recorded_at DESC LIMIT 1"
	).first();
	const shifts = items.filter((it) => it.shift === "yes").length;
	const lines: string[] = [];
	lines.push("# Human-AI Monitor Protocol");
	lines.push("## Week: " + range.filterStart + " — " + range.filterEnd + " (Protocol: " + range.start + ")");
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
			const marker = it.shift === "yes" ? "🔴" : it.shift === "no" ? "🟢" : "🟡";
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
			const marker = it.shift === "yes" ? "🔴" : it.shift === "no" ? "🟢" : "🟡";
			lines.push("- " + marker + " [" + it.title + "](" + it.url + ") — " + it.source);
			if (it.reasoning) lines.push("  - " + it.reasoning);
		}
		lines.push("");
	}
	lines.push("---");
	lines.push("");
	lines.push("**To bring the greater good to others — what could be a higher goal?**");
	lines.push("**United We Stand! Only the one who walks conquers the road.**");
	return lines.join("\n");
}

async function generateAndSaveProtocol(env: Env, offsetWeeks: number): Promise<any> {
	// Guard: refuse to generate protocol for the current (still-open) week.
	// The cron uses offsetWeeks=1 (previous closed week). Direct calls with
	// offsetWeeks=0 would write partial data (e.g., h1_agency=0, hexad=0 from
	// incomplete item count). See /generate endpoint for user-facing message.
	if (offsetWeeks < 1) {
		throw new Error(
			"Refusing to generate protocol for still-open week (offset=" + offsetWeeks + "). " +
			"Use offset >= 1 (previous closed week). Cron uses offset=1."
		);
	}

	const range = getWeekRange(offsetWeeks);
	const markdown = await buildProtocolMarkdown(env, range);
	const itemsRes = await env.DB.prepare(
		"SELECT COUNT(*) as n FROM items WHERE date >= ? AND date <= ?"
	).bind(range.filterStart, range.filterEnd).first();
	const shiftsRes = await env.DB.prepare(
		"SELECT COUNT(*) as n FROM items WHERE date >= ? AND date <= ? AND shift = 'yes'"
	).bind(range.filterStart, range.filterEnd).first();
	// F6 fix: compute real Gap Index from collected signals
	const gapResult = await computeGapIndex(env, range);
	
	// Persist to gap_history (read by buildProtocolMarkdown and /gap endpoint)
	await env.DB.prepare(
		"INSERT OR REPLACE INTO gap_history (week_start, ai_score, human_score, gap, interpretation, recorded_at) VALUES (?,?,?,?,?,?)"
	).bind(
		range.start, gapResult.aiScore, gapResult.humanScore, gapResult.gap, gapResult.interpretation, new Date().toISOString()
	).run();
	
	// Persist axis levels to index_history (fixes F6: table was never used)
	for (const [axis, level] of Object.entries(gapResult.axisLevels)) {
		await env.DB.prepare(
			"INSERT OR REPLACE INTO index_history (axis, level, date, note, recorded_at) VALUES (?,?,?,?,?)"
		).bind(axis, level, range.start, 'Computed from weekly signals', new Date().toISOString()).run();
	}
	
	const itemsCount = (itemsRes as any)?.n ?? 0;
	const shiftsCount = (shiftsRes as any)?.n ?? 0;
	const path = "data/protocols/" + range.start + ".md";
	await env.DB.prepare(
		"INSERT OR REPLACE INTO protocols (week_start, week_end, ai_score, human_score, gap_index, items_count, shifts_count, path, generated_at, content) VALUES (?,?,?,?,?,?,?,?,?,?)"
	).bind(
		range.start, range.end,
		gapResult.aiScore, gapResult.humanScore, gapResult.gap,
		itemsCount, shiftsCount, path, new Date().toISOString(), markdown
	).run();
	return {
		week_start: range.start, week_end: range.end,
		items_count: itemsCount, shifts_count: shiftsCount,
		bytes: markdown.length,
	};
}
// Generate INTERIM protocol for current (still-open) week — used on Fridays
// This gives a "snapshot" of accumulated data mid-week (5 days: Mon-Fri)
async function generateInterimProtocol(env: Env, offsetWeeks: number): Promise<any> {
	const range = getWeekRange(offsetWeeks);
	const markdown = await buildDraftProtocolMarkdown(env, range);
	const itemsRes = await env.DB.prepare(
		"SELECT COUNT(*) as n FROM items WHERE date >= ? AND date <= ?"
	).bind(range.filterStart, range.filterEnd).first();
	const shiftsRes = await env.DB.prepare(
		"SELECT COUNT(*) as n FROM items WHERE date >= ? AND date <= ? AND shift = 'yes'"
	).bind(range.filterStart, range.filterEnd).first();
	const gapResult = await computeGapIndex(env, range);
	
	const itemsCount = (itemsRes as any)?.n ?? 0;
	const shiftsCount = (shiftsRes as any)?.n ?? 0;
	const path = "data/protocols/" + range.start + ".interim.md";
	
	await env.DB.prepare(
		"INSERT OR REPLACE INTO protocols (week_start, week_end, ai_score, human_score, gap_index, items_count, shifts_count, path, generated_at, content, is_interim) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
	).bind(
		range.start, range.end,
		gapResult.aiScore, gapResult.humanScore, gapResult.gap,
		itemsCount, shiftsCount, path, new Date().toISOString(), markdown, 1
	).run();
	return {
		week_start: range.start, week_end: range.end,
		items_count: itemsCount, shifts_count: shiftsCount,
		bytes: markdown.length,
		is_interim: true,
	};
}



export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
					version: "0.9.9",
					github: "https://github.com/VQQLK/Human-AI-Monitor",
					model: env.CLASSIFIER_MODEL,
					sources_count: SOURCES.length,
					endpoints: ["/", "/health", "/gap", "/protocols", "/protocols/current", "/protocols/current/ru", "/protocols/current/zh", "/protocols/{week}", "/protocols/{week}/content", "/protocols/{week}/content/ru", "/protocols/{week}/content/zh", "/axes/{axis}", "/axes-history", "/classify", "/verify", "/collect", "/generate", "/export-weekly"],
				}, 200);
			}
			if (path === "/health") return json({ status: "ok", ts: Date.now() }, 200);

			if (path === "/gap") {
				const row = await env.DB.prepare("SELECT * FROM gap_history ORDER BY recorded_at DESC LIMIT 1").first();
				if (!row) return json({ error: "No gap data" }, 404);
				return json(row, 200);
			}
			if (path === "/protocols/current") {
				const range = getWeekRange(0);
				const markdown = await buildDraftProtocolMarkdown(env, range);
				return new Response(markdown, {
					headers: { "Content-Type": "text/markdown; charset=utf-8", ...CORS },
				});
			}
			// Phase 3: multilingual draft endpoints
			const currentLangMatch = path.match(/^\/protocols\/current\/(ru|zh)$/);
			if (currentLangMatch) {
				const lang = currentLangMatch[1] as 'ru' | 'zh';
				const range = getWeekRange(0);
				const englishMarkdown = await buildDraftProtocolMarkdown(env, range);
				const translatedMarkdown = await translateProtocolMarkdown(env, englishMarkdown, lang);
				return new Response(translatedMarkdown, {
					headers: { "Content-Type": "text/markdown; charset=utf-8", ...CORS },
				});
			}
			if (path === "/protocols") {
				const res = await env.DB.prepare("SELECT week_start, week_end, ai_score, human_score, gap_index, items_count, shifts_count, path, generated_at, is_interim FROM protocols ORDER BY week_start DESC, is_interim ASC LIMIT 50").all();
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
				// Default: previous (already closed) week, matching the weekly cron.
				// Generating the current still-open week is disallowed (offset < 1).
				let offset = 1;
				if (weekParam) {
					if (/^\d+$/.test(weekParam)) {
						// Numeric offset: ?week=1 → previous closed week
						offset = parseInt(weekParam, 10);
					} else {
						// Date of Monday: ?week=2026-09-14
						const target = new Date(weekParam + "T00:00:00Z");
						if (isNaN(target.getTime())) {
							return json({ error: "Invalid week format. Use numeric offset (1,2,3…) or ISO date (YYYY-MM-DD)" }, 400);
						}
						const now = new Date();
						offset = Math.floor((now.getTime() - target.getTime()) / (7 * 24 * 3600 * 1000));
					}
				}
				if (offset < 1) {
					return json({
						error: "Cannot generate protocol for the current (still-open) week. Use offset >= 1 (previous closed week) or a past Monday date (YYYY-MM-DD)."
					}, 400);
				}
				return json(await generateAndSaveProtocol(env, offset), 200);
			}

			if (path === "/export-weekly") {
				return await handleExport(request, env);
			}

			if (path === "/verify") {
				const text = url.searchParams.get("trace");
				if (!text) return json({ error: "Missing ?trace= parameter" }, 400);
				if (text.length > 10000) return json({ error: "Trace too long (max 10000 chars)" }, 400);
				const result = detectCheating(text);
				return json({ input_length: text.length, ...result }, 200);
			}
			// /axes-history — вернуть все записи из index_history (для прозрачности)
			if (path === "/axes-history") {
				const all = await env.DB.prepare(
					"SELECT axis, level, date, note, recorded_at FROM index_history ORDER BY date DESC, axis"
				).all();
				const grouped: Record<string, any[]> = {};
				for (const row of all.results) {
					const date = row.date as string;
					if (!grouped[date]) grouped[date] = [];
					grouped[date].push({
						axis: row.axis,
						level: row.level,
						note: row.note,
						recorded_at: row.recorded_at,
					});
				}
				return json({
					total_entries: all.results.length,
					dates: Object.keys(grouped).sort((a, b) => b.localeCompare(a)),
					by_date: grouped,
				}, 200);
			}

			return json({ error: "Not Found", path }, 404);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return json({ error: "Server Error", message }, 500);
		}
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// Architecture v2: 5 cron triggers (Cloudflare Free plan limit)
		// 13:00-13:45 UTC: 4 batches (daytime collection, all 32 sources)
		// 23:00 UTC: 1 batch (evening collection, 8 critical sources)
		// Each batch runs as separate request to stay under 50-subrequest limit
		// (8 sources x 3 articles x 2 subrequests = 48 subrequests per batch)
		const batchConfig: Record<string, { offset: number; limit: number; batch: number; generateProtocol: boolean }> = {
			"0 13 * * *":  { offset: 0,  limit: 8, batch: 1, generateProtocol: false },
			"15 13 * * *": { offset: 8,  limit: 8, batch: 2, generateProtocol: false },
			"30 13 * * *": { offset: 16, limit: 8, batch: 3, generateProtocol: false },
			"45 13 * * *": { offset: 24, limit: 8, batch: 4, generateProtocol: true },
			"0 23 * * *":  { offset: 0,  limit: 8, batch: 1, generateProtocol: false },
		};
		const cfg = batchConfig[event.cron] ?? batchConfig["0 13 * * *"];

		console.log("[cron] Batch " + cfg.batch + "/4 triggered at " + new Date(event.scheduledTime).toISOString() + " cron=" + event.cron);
		console.log("[cron] offset=" + cfg.offset + " limit=" + cfg.limit + " maxPerSource=3 generateProtocol=" + cfg.generateProtocol);

		// Determine day of week: 0=Sunday, 1=Monday, 2=Tuesday, ..., 5=Friday, 6=Saturday
		const dayOfWeek = new Date(event.scheduledTime).getUTCDay();
		const isMonday = dayOfWeek === 1;
		const isFriday = dayOfWeek === 5;

		ctx.waitUntil((async () => {
			const collectResult = await runCollection(env, cfg.limit, 3, cfg.offset);
			console.log("[cron] collected: " + JSON.stringify(collectResult));

			if (cfg.generateProtocol) {
				// Architecture v2: two protocols per week
				// Monday: FINAL protocol for previous week (offset=1)
				// Friday: INTERIM protocol for current week (offset=0)
				// Other days: only collection, no generation
				if (isMonday) {
					console.log("[cron] Monday: generating FINAL protocol for previous week (offset=1)");
					const gen = await generateAndSaveProtocol(env, 1);
					console.log("[cron] final protocol: " + JSON.stringify(gen));
				} else if (isFriday) {
					console.log("[cron] Friday: generating INTERIM protocol for current week (offset=0)");
					const gen = await generateInterimProtocol(env, 0);
					console.log("[cron] interim protocol: " + JSON.stringify(gen));
				} else {
					console.log("[cron] Day " + dayOfWeek + ": collection only, no protocol generation");
				}
			}
		})());
	},
};
