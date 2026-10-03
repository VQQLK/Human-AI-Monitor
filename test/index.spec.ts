import pkg from '../package.json';
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import { SOURCES } from '../src/config/sources';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// Test-only admin secrets: makes /classify (and other protected paths)
// work deterministically in tests, without depending on real .dev.vars.
const TEST_ADMIN_SECRET = "test-admin-secret-current";
const TEST_ADMIN_PREVIOUS = "test-admin-previous";

// Extended env with test secrets — mirrors AuthEnv used at runtime.
const testEnv = {
  ...env,
  ADMIN_SECRET_CURRENT: TEST_ADMIN_SECRET,
  ADMIN_SECRET_PREVIOUS: TEST_ADMIN_PREVIOUS,
};

const authHeaders = { Authorization: `Bearer ${TEST_ADMIN_SECRET}` };

describe('Human-AI Monitor API', () => {
  describe('GET /', () => {
    it('returns project metadata (unit style)', async () => {
      const request = new IncomingRequest('http://example.com/');
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);
      
      const data: any = await response.json();
      expect(data.project).toBe('Human-AI Monitor');
      expect(data.version).toBe(pkg.version);
      expect(data.sources_count).toBe(48);
      expect(data.endpoints).toBeInstanceOf(Array);
      expect(data.endpoints).toContain('/gap');
      expect(data.endpoints).toContain('/protocols');
    });

    it('returns project metadata (integration style)', async () => {
      const response = await SELF.fetch('https://example.com/');
      const data: any = await response.json();
      
      expect(data.project).toBe('Human-AI Monitor');
      expect(data.github).toBe('https://github.com/VQQLK/Human-AI-Monitor');
      expect(data.model).toBe('@cf/qwen/qwen3-30b-a3b-fp8');
    });
  });

  describe('GET /health', () => {
    it('returns health status with timestamp', async () => {
      const response = await SELF.fetch('https://example.com/health');
      const data: any = await response.json();
      
      expect(data.status).toBe('ok');
      expect(data.ts).toBeTypeOf('number');
      expect(data.ts).toBeGreaterThan(0);
      expect(data.version).toBe(pkg.version);
      expect(data.sources_count).toBe(SOURCES.length);
      expect(data.batches_ok).toBe(true);
    });
  });

  describe('GET /classify', () => {
    it('returns 401 without Authorization header', async () => {
      const response = await SELF.fetch('https://example.com/classify?text=hello');
      expect(response.status).toBe(401);
      const data: any = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns error when text parameter missing (with auth)', async () => {
      const request = new IncomingRequest('http://example.com/classify', {
        headers: authHeaders,
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, testEnv, ctx);
      await waitOnExecutionContext(ctx);
      const data: any = await response.json();
      
      expect(data.error).toBe('Missing text');
    });

    it('returns error when text too long (with auth)', async () => {
      const longText = 'a'.repeat(1500);
      const request = new IncomingRequest(
        `http://example.com/classify?text=${encodeURIComponent(longText)}`,
        { headers: authHeaders }
      );
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, testEnv, ctx);
      await waitOnExecutionContext(ctx);
      const data: any = await response.json();
      
      expect(data.error).toContain('Text too long');
    });
  });

  describe('GET /verify', () => {
    it('returns error when trace parameter missing', async () => {
      const response = await SELF.fetch('https://example.com/verify');
      const data: any = await response.json();
      
      expect(data.error).toBe('Missing ?trace= parameter');
    });

    it('returns error when trace too long', async () => {
      const longTrace = 'a'.repeat(15000);
      const response = await SELF.fetch(`https://example.com/verify?trace=${encodeURIComponent(longTrace)}`);
      const data: any = await response.json();
      
      expect(data.error).toContain('Trace too long');
    });
  });

  describe('Error handling', () => {
    it('returns 404 for unknown paths', async () => {
      const response = await SELF.fetch('https://example.com/unknown-path');
      expect(response.status).toBe(404);
      
      const data: any = await response.json();
      expect(data.error).toBe('Not Found');
      expect(data.path).toBe('/unknown-path');
    });
  });
});
