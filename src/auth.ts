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

/**
 * Constant-time string comparison. Prevents attackers from learning
 * secret bytes via response-time differences.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
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
  "/translate",
  "/export-weekly",
];

export function isProtectedPath(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path.startsWith(p));
}

export interface AuthResult {
  ok: boolean;
  usedSecret: "current" | "previous" | "none";
  reason?: string;
}

/**
 * Verifies the Authorization: Bearer <token> header against
 * ADMIN_SECRET_CURRENT and ADMIN_SECRET_PREVIOUS.
 */
export function verifyAuth(request: Request, env: AuthEnv): AuthResult {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return { ok: false, usedSecret: "none", reason: "missing_bearer" };
  }

  const token = auth.slice("Bearer ".length).trim();

  if (
    env.ADMIN_SECRET_CURRENT &&
    timingSafeEqual(token, env.ADMIN_SECRET_CURRENT)
  ) {
    return { ok: true, usedSecret: "current" };
  }

  if (
    env.ADMIN_SECRET_PREVIOUS &&
    timingSafeEqual(token, env.ADMIN_SECRET_PREVIOUS)
  ) {
    return { ok: true, usedSecret: "previous" };
  }

  return { ok: false, usedSecret: "none", reason: "invalid_token" };
}
