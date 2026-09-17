const AI_PROMPT = [
	"You classify signals about AI self-improvement (RSI).",
	"Return STRICT JSON with fields:",
	'{"axes": ["smd"|"itq"|"agg"|"cycle_velocity"|"verification"|"hexad"|"geopolitics"],',
	' "relevance": number 0.0-1.0,',
	' "shift": "да"|"нет"|"неопределённо",',
	' "direction": "рост"|"падение"|"стабильно"|"неопределённо",',
	' "reasoning": "1-2 sentences in Russian"}',
	"Axes: smd=self-modification, itq=improvement trajectory, agg=autonomous goals,",
	"cycle_velocity=improvement speed, verification=verification hierarchy,",
	"hexad=phase transition, geopolitics=AI governance blocs.",
	"Return ONLY JSON, no markdown."
].join(" ");

const HUMAN_PROMPT = [
	"You classify signals about Humanity (HHI).",
	"Return STRICT JSON with fields:",
	'{"axes": ["h1_agency"|"h2_sovereignty"|"h3_wellbeing"|"h4_equity"|"h5_meaning"|"h6_democracy"],',
	' "relevance": number 0.0-1.0,',
	' "shift": "да"|"нет"|"неопределённо",',
	' "direction": "рост"|"падение"|"стабильно"|"неопределённо",',
	' "reasoning": "1-2 sentences in Russian"}',
	"Axes: h1_agency=human autonomy, h2_sovereignty=critical thinking,",
	"h3_wellbeing=mental health, h4_equity=access/inequality,",
	"h5_meaning=purpose, h6_democracy=institutions.",
	"Return ONLY JSON, no markdown."
].join(" ");

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
					version: "0.2.0",
					github: "https://github.com/VQQLK/Human-AI-Monitor",
					model: env.CLASSIFIER_MODEL,
					endpoints: ["/health", "/gap", "/protocols", "/axes/{axis}", "/classify?text=...&kind=ai|human"],
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
				if (!text) return json({ error: "Missing text param" }, 400);
				const systemPrompt = kind === "human" ? HUMAN_PROMPT : AI_PROMPT;
				const response: any = await env.AI.run(env.CLASSIFIER_MODEL as any, {
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: text }
					],
				});
				const parsed = parseAIResponse(response);
				return json({
					input: text,
					kind,
					model: env.CLASSIFIER_MODEL,
					parsed,
					neurons: response?.usage?.neurons ?? null,
				});
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
			try {
				const row = await env.DB.prepare("SELECT COUNT(*) as n FROM items").first();
				console.log("[cron] Items: " + JSON.stringify(row));
			} catch (e) { console.error("[cron] DB: " + e); }
		})());
	},
};
