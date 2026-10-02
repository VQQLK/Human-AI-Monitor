// Authentication module for protected endpoints.
// Uses constant-time comparison to prevent timing attacks.
// Two secrets active simultaneously enable zero-downtime rotation:
//   ADMIN_SECRET_CURRENT  — the active secret
//   ADMIN_SECRET_PREVIOUS — the old secret, valid until cleared (24h)

/**
 * Auth-related environment fields. Extends the auto-generated Env
 * (worker-configuration.d.ts) with optional secret fields that are
 * set via `wrangler secret put` and therefore not visible to `wrangler types`.
 */
type AuthEnv = Env & {
  ADMIN_SECRET_CURRENT?: string;
  ADMIN_SECRET_PREVIOUS?: string;
};

const encoder = new TextEncoder();

async function sha256(s: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(s));
  return new Uint8Array(digest);
}

/**
 * Constant-time string comparison via SHA-256 digests.
 * Both inputs are hashed to a fixed 32-byte digest first, so the loop
 * always runs the same number of iterations regardless of input length.
 * Prevents attackers from learning secret bytes OR length via timing.
 */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < da.length; i++) {
    diff |= da[i] ^ db[i];
  }
  return diff === 0;
}

/**
 * Paths that require authentication. These either:
 *   - mutate state (/collect, /generate)
 *   - consume LLM neurons (/classify, /translate)
 *   - expose bulk data (/export-weekly)
 *
 * All other endpoints stay public: /, /health, /gap, /protocols,
 * /protocols/{week}, /protocols/{week}/content, /axes/{axis}, /axes-history.
 */
const PROTECTED_PREFIXES = [
  "/collect",
  "/generate",
  "/classify",
  "/translate",           // covers /translate and /translate/{week}
  "/translate-document",  // separate entry: /translate- has no slash after prefix
  "/export-weekly",
];

/**
 * Prefix match anchored at path boundary — `/collectible` is NOT protected,
 * only `/collect` and `/collect/...` are.
 */
export function isProtectedPath(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export interface AuthResult {
  ok: boolean;
  usedSecret: "current" | "previous" | "none";
  reason?: string;
}

/**
 * Verifies the Authorization: Bearer <token> header against
 * ADMIN_SECRET_CURRENT and ADMIN_SECRET_PREVIOUS.
 *
 * No short-circuit: both comparisons always run, so an attacker cannot
 * distinguish "matched current" from "matched previous" by response timing.
 */
export async function verifyAuth(request: Request, env: AuthEnv): Promise<AuthResult> {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return { ok: false, usedSecret: "none", reason: "missing_bearer" };
  }

  const token = auth.slice("Bearer ".length).trim();
  if (!token) {
    return { ok: false, usedSecret: "none", reason: "missing_bearer" };
  }

  const matchCurrent = await timingSafeEqual(token, env.ADMIN_SECRET_CURRENT ?? "");
  const matchPrevious = await timingSafeEqual(token, env.ADMIN_SECRET_PREVIOUS ?? "");

  if (matchCurrent) return { ok: true, usedSecret: "current" };
  if (matchPrevious) return { ok: true, usedSecret: "previous" };
  return { ok: false, usedSecret: "none", reason: "invalid_token" };
}
