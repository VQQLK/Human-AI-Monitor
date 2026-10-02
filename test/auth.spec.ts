import { describe, it, expect } from 'vitest';
import {
  timingSafeEqual,
  isProtectedPath,
  verifyAuth,
} from '../src/auth';

// Minimal env mock: AuthEnv extends Env, but only ADMIN_SECRET_* are read.
const env = {
  ADMIN_SECRET_CURRENT: 'current-secret-abc',
  ADMIN_SECRET_PREVIOUS: 'previous-secret-xyz',
} as any;

function req(authHeader?: string): Request {
  const headers: Record<string, string> = {};
  if (authHeader) headers['Authorization'] = authHeader;
  return new Request('https://example.com/', { headers });
}

describe('timingSafeEqual', () => {
  it('returns true for identical strings', async () => {
    expect(await timingSafeEqual('abc', 'abc')).toBe(true);
  });

  it('returns false for different strings of same length', async () => {
    expect(await timingSafeEqual('abc', 'abd')).toBe(false);
  });

  it('returns false for different strings of different length', async () => {
    expect(await timingSafeEqual('abc', 'abcd')).toBe(false);
    expect(await timingSafeEqual('abc', 'ab')).toBe(false);
  });

  it('returns false for empty vs non-empty', async () => {
    expect(await timingSafeEqual('', 'a')).toBe(false);
    expect(await timingSafeEqual('a', '')).toBe(false);
  });

  it('returns true for empty vs empty', async () => {
    expect(await timingSafeEqual('', '')).toBe(true);
  });

  it('handles UTF-8 multibyte strings', async () => {
    expect(await timingSafeEqual('caf\u00e9', 'caf\u00e9')).toBe(true);
    expect(await timingSafeEqual('caf\u00e9', 'cafe')).toBe(false);
  });
});

describe('isProtectedPath', () => {
  it('protects exact prefixes', () => {
    expect(isProtectedPath('/collect')).toBe(true);
    expect(isProtectedPath('/generate')).toBe(true);
    expect(isProtectedPath('/classify')).toBe(true);
    expect(isProtectedPath('/translate')).toBe(true);
    expect(isProtectedPath('/export-weekly')).toBe(true);
  });

  it('protects subpaths', () => {
    expect(isProtectedPath('/collect/foo')).toBe(true);
    expect(isProtectedPath('/translate/2026-09-28')).toBe(true);
    expect(isProtectedPath('/translate-document')).toBe(true);
  });

  it('does NOT protect public paths', () => {
    expect(isProtectedPath('/')).toBe(false);
    expect(isProtectedPath('/health')).toBe(false);
    expect(isProtectedPath('/gap')).toBe(false);
    expect(isProtectedPath('/protocols')).toBe(false);
    expect(isProtectedPath('/protocols/2026-09-28/content')).toBe(false);
  });

  it('does NOT over-protect /collectible (anchor)', () => {
    expect(isProtectedPath('/collectible')).toBe(false);
    expect(isProtectedPath('/collector-status')).toBe(false);
    expect(isProtectedPath('/generator')).toBe(false);
  });
});

describe('verifyAuth', () => {
  it('accepts current secret', async () => {
    const r = await verifyAuth(req('Bearer current-secret-abc'), env);
    expect(r.ok).toBe(true);
    expect(r.usedSecret).toBe('current');
  });

  it('accepts previous secret', async () => {
    const r = await verifyAuth(req('Bearer previous-secret-xyz'), env);
    expect(r.ok).toBe(true);
    expect(r.usedSecret).toBe('previous');
  });

  it('rejects invalid token', async () => {
    const r = await verifyAuth(req('Bearer wrong-secret'), env);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('invalid_token');
  });

  it('rejects missing header', async () => {
    const r = await verifyAuth(req(), env);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing_bearer');
  });

  it('rejects non-Bearer scheme', async () => {
    const r = await verifyAuth(req('Basic abc'), env);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing_bearer');
  });

  it('rejects Bearer without token (Headers API trims trailing space)', async () => {
    // Headers API normalizes "Bearer " to "Bearer", so startsWith("Bearer ")
    // is false and we fall through to missing_bearer.
    const r = await verifyAuth(req('Bearer '), env);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing_bearer');
  });

  it('handles missing secrets in env (both undefined)', async () => {
    const emptyEnv = {} as any;
    const r = await verifyAuth(req('Bearer anything'), emptyEnv);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('invalid_token');
  });

  it('handles only CURRENT secret set', async () => {
    const partial = { ADMIN_SECRET_CURRENT: 'only-current' } as any;
    const rOk = await verifyAuth(req('Bearer only-current'), partial);
    expect(rOk.ok).toBe(true);
    expect(rOk.usedSecret).toBe('current');

    const rNo = await verifyAuth(req('Bearer previous-secret-xyz'), partial);
    expect(rNo.ok).toBe(false);
  });
});
