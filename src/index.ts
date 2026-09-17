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

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: CORS });
		}

		try {
			if (path === "/") {
				return json({
					project: "Human-AI Monitor",
					version: "0.1.0",
					github: "https://github.com/VQQLK/Human-AI-Monitor",
					model: env.CLASSIFIER_MODEL,
				});
			}

			if (path === "/health") {
				return json({ status: "ok", ts: Date.now() });
			}

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
				if (!text) return json({ error: "Missing text param" }, 400);
				const response = await env.AI.run(env.CLASSIFIER_MODEL as any, {
					messages: [
						{ role: "system", content: "Return JSON: axes, relevance, shift, reasoning." },
						{ role: "user", content: "Classify: " + text }
					],
				});
				return json({ input: text, model: env.CLASSIFIER_MODEL, response });
			}

			return json({ error: "Not Found", path }, 404);

		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return json({ error: "Server Error", message }, 500);
		}
	},

	async scheduled(event, env, ctx): Promise<void> {
		console.log("[cron] Triggered: " + new Date(event.scheduledTime).toISOString());
		ctx.waitUntil(
			(async () => {
				try {
					const row = await env.DB.prepare("SELECT COUNT(*) as n FROM items").first();
					console.log("[cron] Items: " + JSON.stringify(row));
				} catch (e) {
					console.error("[cron] DB error: " + e);
				}
			})()
		);
	},
};
