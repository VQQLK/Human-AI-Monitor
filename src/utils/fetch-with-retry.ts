/**
 * Fetch with retry logic and timeout.
 * Handles transient errors (429, 503) with exponential backoff.
 */

export const BROWSER_UA =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchWithRetry(
	url: string,
	retries: number = 3,
	timeoutMs: number = 10000,
): Promise<Response> {
	let lastError: Error | null = null;

	for (let i = 0; i < retries; i++) {
		try {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), timeoutMs);

			const r = await fetch(url, {
				headers: { "User-Agent": BROWSER_UA },
				signal: controller.signal,
			});
			clearTimeout(timer);

			if ((r.status === 429 || r.status === 503) && i < retries - 1) {
				const wait = 2000 * Math.pow(2, i);
				console.log("[retry] " + url + " status " + r.status + ", waiting " + wait + "ms");
				await new Promise((resolve) => setTimeout(resolve, wait));
				continue;
			}

			return r;
		} catch (e: any) {
			lastError = e;
			if (i < retries - 1) {
				const wait = 2000 * Math.pow(2, i);
				console.log("[retry] " + url + " error, waiting " + wait + "ms");
				await new Promise((resolve) => setTimeout(resolve, wait));
			}
		}
	}

	throw lastError ?? new Error("Max retries exceeded");
}
