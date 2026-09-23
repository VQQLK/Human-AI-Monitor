# Changelog

> **Languages:** [🇺🇸 English](CHANGELOG.md) • [🇷🇺 Русский](CHANGELOG.ru.md) • [🇨🇳 中文](CHANGELOG.zh.md)

All notable changes to Human-AI Monitor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Critical finding F6** from independent Technical & Source-Verification Report (2026-09-20): Gap Index now computed from collected signals instead of copying seed values
  - Created `src/services/gap-computation.ts` (75 lines) with `computeGapIndex()` function
  - Modified `generateAndSaveProtocol()` to call `computeGapIndex()` instead of copying last row
  - Results persisted to `gap_history` AND `index_history` tables
  - Verified: different weeks with different item counts now produce different scores
  - Production deployment: Version ID 9b676bd3, then dc501a70, then e3de304

- **Protocol naming confusion**: Changed week identifiers from Monday-based to Sunday-based
  - Before: protocol "2026-09-14" (Monday) for week 14-20 September
  - After: protocol "2026-09-20" (Sunday) for week 14-20 September
  - Modified `getWeekRange()` to return Sunday as `start` (protocol identifier)
  - Added `filterStart` and `filterEnd` fields for SQL WHERE clauses
  - Migrated existing database records to new naming scheme

### Changed
- Database migration 0003: Updated SMD level from 0.30 to 0.45
  - Reason: Anthropic reached AL4 (26% AI-led tasks, >90% AL3 collaboration)
  - First system with sustained L4; threshold remains "≥2 systems"
  - Updated both remote database and seed data in migrations/0001_initial_schema.sql
  - Reference: Anthropic R&D Automation Index (September 2026)

- Removed vestigial `wrangler.toml` (only contained `[site]` section, not used)
- Updated `CITATION.cff` version from 0.6.0 to 0.9.9
- Updated `CITATION.cff` date-released from 2026-09-18 to 2026-09-21



### Added
- Trump AI Force announcement (19.09.2026) to Voices section in README.md and README.ru.md

### Planned
- Real test coverage (parser, classifier, protocol)
- Refactoring: split monolithic src/index.ts into modules
- HTML parsing for non-RSS sources
- HTML entity decoding for HTML-parsed sources (`&#39;` → `'`)
- Android APK (PWA + Capacitor)
- Web interface (Cloudflare Pages)
- Multilingual support (EN / RU / ZH)

## [0.9.9] - 2026-09-19

### Added
- Unit tests for parser (decodeEntities, cleanTitle, extractTag, parseRSS): 14 tests
- Unit tests for classifier (parseAIResponse, validateParsed): 15 tests
- Unit tests for cheat-detector (harness + task categories): 7 tests
- 8 pure functions exported from `src/index.ts` for testing

### Fixed
- `sha256Hex` modifier order (`async export` → `export async`)

### Changed
- Total tests: 8 → 44 (API + unit)
- Test coverage: ~40% → ~60%
- Worker version 0.9.8 → 0.9.9

## [0.9.8] - 2026-09-19

### Added
- `src/utils/fetch-with-retry.ts` — fetch with exponential backoff for 429/503
- 10-second timeout per fetch (AbortController)
- 3 attempts with 2s/4s exponential backoff between them (no 8s wait: third attempt is final)
- 4 Cron batches: 06:00 / 06:15 / 06:30 / 06:45 UTC
- `items_existing` counter to distinguish new vs existing items

### Fixed
- `stats.sample` was empty on repeat runs
- `items_saved` was incorrectly incremented for existing items
- `sample` now only includes items with non-empty axes
- Hugging Face Blog: HTTP 429 — now retried
- Edelman Trust Barometer: HTTP 503 — now retried

### Changed
- All `fetch()` calls replaced with `fetchWithRetry()` (2 calls)
- Worker version 0.9.5 → 0.9.8

## [0.9.5] - 2026-09-19

### Fixed
- `/verify` endpoint added to endpoints list in `/` response
- SMD `level` set to 0.45 in `config/axes_ai.yaml`

### Changed
- Endpoints count: 9 → 10
- Worker version 0.9.4 → 0.9.5

## [0.9.4] - 2026-09-19

### Added
- `/verify` endpoint with CheatBench-inspired heuristics for reward hacking detection:
  - `harness` category: hidden tests, scoring files, git log exploitation (683 traces in CheatBench)
  - `task` category: eval/exec, monkey-patching, operator overloading (136 traces in CheatBench)
- `src/cheat-detector.ts` — standalone module with 15+ regex patterns
- SMD threshold updated based on Anthropic R&D Automation Index (Sep 2026):
  - Anthropic reached 26% AL4 (AI-led tasks) and >90% AL3 (collaboration)
  - First system with sustained L4; threshold remains "≥2 systems"
  - Current SMD level: 0.30 → 0.45

### Changed
- Worker version 0.9.3 → 0.9.4
- Endpoints count: 9 → 10
- `config/axes_ai.yaml` updated with Anthropic AL4 data

## [0.9.3] - 2026-09-18

### Changed
- Replaced `env: any` with `env: Env` in all functions (type safety)
- `fetch` signature: `(request: Request, env: Env, ctx: ExecutionContext)`
- `scheduled` signature: `(event: ScheduledEvent, env: Env, ctx: ExecutionContext)`
- Worker version 0.9.1 → 0.9.3

## [0.9.2] - 2026-09-18

### Fixed
- Cron Trigger split into 2 batches to stay under Cloudflare 50-subrequest limit:
  - Batch 1 (06:00 UTC): 12 sources × 3 items = 48 subrequests
  - Batch 2 (06:30 UTC): 9 sources × 3 items = 36 subrequests

### Changed
- `scheduled` handler distinguishes batches via `event.cron`
- Protocol generation now runs only in Batch 2 (after all sources collected)
- Cron schedules: `0 6 * * 1` (Batch 1) + `30 6 * * 1` (Batch 2)
- Worker version 0.9.1 → 0.9.2

## [0.9.1] - 2026-09-18

### Fixed
- Date and category prefixes in Anthropic Research RSS titles (`Sep 17, 2026ScienceHow Claude...` → `How Claude...`)

### Changed
- `cleanTitle()` now handles three prefix formats: date-first, category-first, date+category
- Worker version 0.9.0 → 0.9.1

## [0.9.0] - 2026-09-18

### Added
- Anthropic News feed (via 0xSMW/rss-feeds proxy)
- Anthropic Engineering feed (via Olshansk/rss-feeds)
- Anthropic Research feed (via Olshansk/rss-feeds)
- Anthropic Red Team feed (via Olshansk/rss-feeds)

### Changed
- Sources count: 17 → 21
- Worker version 0.8.1 → 0.9.0

### Known issues
- Pew Internet intermittently returns HTTP 403 (rate limiting from their side)
- Batch collection recommended: `?limit=12&offset=0` and `?limit=9&offset=12`

## [0.9.0] - 2026-09-18

### Added
- Anthropic News feed (via 0xSMW/rss-feeds proxy)
- Anthropic Engineering feed (via Olshansk/rss-feeds)
- Anthropic Research feed (via Olshansk/rss-feeds)
- Anthropic Red Team feed (via Olshansk/rss-feeds)

### Changed
- Sources count: 17 → 21
- Worker version 0.8.1 → 0.9.0

### Known issues
- Anthropic Research feed has date prefixes in titles (fix in v0.9.1)
- Pew Internet intermittently returns HTTP 403

## [0.8.1] - 2026-09-18

### Added
- `offset` parameter in `/collect` endpoint for batched collection
- Browser User-Agent to bypass bot detection (fixes Pew Internet 403)

### Fixed
- CDATA section decoding in RSS titles (OpenAI Blog, The Verge, AI Alignment Forum)
- All 17 sources now collecting successfully

### Known issues
- Cloudflare Workers 50-subrequest limit: use batching for Cron weekly full collection

### Changed
- Worker version 0.8.0 → 0.8.1

## [0.8.0] - 2026-09-18

### Added
- Cohere Labs Community Blog (HTML source via `a.post-title` selector)
- BAIR Blog (RSS source: https://bair.berkeley.edu/blog/feed.xml)
- HTMLRewriter now supports two title extraction modes: `aria-label` and text content
- HTML entity decoding for HTML-parsed sources

### Changed
- Sources count: 15 → 17
- User-Agent updated to v0.8

## [0.7.0] - 2026-09-18

### Added
- HTML parsing support via Cloudflare `HTMLRewriter`
- First HTML source: EleutherAI Blog (`a.entry-link` selector)
- `type` field in SOURCES: `rss` (default) or `html` with `htmlSelector`
- `fetchFromHtml()` function for static HTML sites

### Changed
- Worker version 0.6.0 → 0.7.0
- Sources count: 14 → 15

## [0.6.0] - 2026-09-18

### Added
- Rate limiting parameter validation (text length <= 1000 chars)
- CITATION.cff for academic citation
- DATA_LICENSE (CC-BY 4.0) for project data
- GitHub Actions CI workflow

### Changed
- README: added Voices section (15 quotes from AI leaders)
- README: aligned with actual codebase state
- Meta AI Blog and Mistral AI RSS feeds updated to working URLs

### Removed
- Rate limiting binding (unsupported on Free tier Cloudflare)

## [0.5.0] - 2026-09-18

### Added
- Auto-generation of weekly protocols (Markdown)
- Protocol content storage in D1 (content column)
- /generate endpoint for manual protocol generation
- /protocols/{week}/content endpoint for Markdown output

## [0.4.0] - 2026-09-17

### Added
- RSS collector with 14 sources
- AI classification via Cloudflare Workers AI (Qwen 3)
- Classifier prompts for 12 axes (AI + Human)
- /collect endpoint for manual RSS collection
- /classify endpoint for text classification

### Changed
- Classification prompts: 1-3 axes per item, direction rules
- Prompt rules: shift=yes only if empirically confirmed

## [0.3.0] - 2026-09-17

### Added
- Public API with 6 endpoints
- D1 database integration (4 tables)
- Workers AI binding
- Cron Trigger (Monday 06:00 UTC)

## [0.2.0] - 2026-09-17

### Added
- Database schema (items, protocols, gap_history, index_history)
- Migrations for D1
- Configuration files (axes_ai.yaml, axes_human.yaml)
- Sources configuration (sources_ai.yaml, sources_human.yaml)

## [0.1.0] - 2026-09-17

### Added
- Initial commit: concept, research plan, first protocol
- README, MANIFESTO, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT
- Full research paper (5 parts, Russian)
- docs/ (methodology, architecture, math_brief, press release)
