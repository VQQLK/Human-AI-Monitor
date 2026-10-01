# Security Policy

> **Languages:** [🇺🇸 English](SECURITY.md) • [🇷🇺 Русский](SECURITY.ru.md) • [🇨🇳 中文](SECURITY.zh.md)

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Active support  |
| < 1.0   | ❌ End of life      |

Only the latest minor release receives security updates.

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security bugs.**

Two channels are available:

1. **Preferred — GitHub Private Vulnerability Reporting**
   [Report a vulnerability](https://github.com/VQQLK/Human-AI-Monitor/security/advisories/new) — private, tracked, allows discussion with maintainers.

2. **Fallback — Email**
   [REDACTED@example.invalid](mailto:REDACTED@example.invalid) with subject `[SECURITY] Human-AI Monitor`.

### What to include

- Affected version / commit
- Reproduction steps (curl command, script, screenshot)
- Impact assessment (severity, exploitability)
- Your name / handle for credit (optional)

### Expected response

| Stage                | Timeline                                     |
|----------------------|----------------------------------------------|
| Acknowledgment       | ≤ 48 hours                                   |
| Initial assessment   | ≤ 7 days                                     |
| Fix / mitigation     | ≤ 30 days (critical), ≤ 90 days (non-critical) |
| Public disclosure    | Coordinated, default 90 days after fix       |

## Scope

### In scope

- **Edge runtime** — Cloudflare Worker (`src/index.ts`, `src/services/`, `src/auth.ts`)
- **HTTP API** — public endpoints, authentication, input validation
- **HTML views** — `/protocols/*/view` routes (XSS, injection)
- **D1 queries** — SQL injection, authorization bypass
- **Secret handling** — rotation, leakage, timing attacks
- **CI/CD** — GitHub Actions workflows in `.github/workflows/`

### Out of scope

- **Dev dependencies** — `wrangler`, `miniflare`, `vitest`, `undici` (no runtime impact; see §Dependency Management)
- **Cloudflare platform** — report directly to [Cloudflare](https://www.cloudflare.com/security/)
- **Social engineering** — phishing, pretexting against maintainers
- **Denial-of-service on the free tier** — Cloudflare applies edge-level rate limits
- **Documentation typos** — open a regular issue

## Security Practices

- **Authentication**: Bearer tokens compared via `timingSafeEqual` (constant-time)
- **Dual-secret rotation**: `ADMIN_SECRET_CURRENT` + `ADMIN_SECRET_PREVIOUS` (graceful 24-hour window)
- **HTTP method guard**: only `GET`, `HEAD`, `OPTIONS`, and `POST /translate-document` are allowed
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Referrer-Policy`, `Permissions-Policy`
- **CORS**: wildcard `*` (intentional — read-only public API, no credentials)
- **D1**: parameterized queries via `.bind()`, no string concatenation
- **HTML rendering**: full escaping of user-derived content
- **2FA**: enabled on GitHub and Cloudflare accounts

## Secret Rotation

| Secret                                  | Cadence              | Script                             |
|-----------------------------------------|----------------------|------------------------------------|
| `ADMIN_SECRET_CURRENT` / `PREVIOUS`     | Every 90 days        | `scripts/rotate_admin_secret.sh`   |
| `GITHUB_PAT`                            | Every 90–180 days    | Manual (fine-grained PAT)          |
| `CLOUDFLARE_API_TOKEN`                  | Every 12 months      | Cloudflare dashboard               |

Full procedure: [`scripts/rotate_admin_secret.sh`](scripts/rotate_admin_secret.sh)

## Dependency Management

- `npm audit` is part of the release checklist
- 0 high/critical vulnerabilities at each release
- Production dependencies: `js-yaml` only
- Dev dependencies refreshed on minor `wrangler` releases

## Disclosure Policy

- **Coordinated disclosure**, default 90 days after fix is released
- **Credit** in `CHANGELOG.md` (with your permission)
- **CVE** will be requested if applicable

## Attribution

This policy follows common open-source practice. See [GitHub's guide on coordinated disclosure](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

---

**United We Stand. Only the one who walks conquers the road.**
