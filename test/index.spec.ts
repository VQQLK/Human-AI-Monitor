import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Human-AI Monitor API', () => {
  describe('GET /', () => {
    it('returns project metadata (unit style)', async () => {
      const request = new IncomingRequest('http://example.com/');
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);
      
      const data: any = await response.json();
      expect(data.project).toBe('Human-AI Monitor');
      expect(data.version).toBe('0.9.5');
      expect(data.sources_count).toBe(36);
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
    });
  });

  describe('GET /classify', () => {
    it('returns error when text parameter missing', async () => {
      const response = await SELF.fetch('https://example.com/classify');
      const data: any = await response.json();
      
      expect(data.error).toBe('Missing text');
    });

    it('returns error when text too long', async () => {
      const longText = 'a'.repeat(1500);
      const response = await SELF.fetch(`https://example.com/classify?text=${encodeURIComponent(longText)}`);
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
