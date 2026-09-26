# Changelog

> **Languages:** [🇺🇸 English](CHANGELOG.md) • [🇷🇺 Русский](CHANGELOG.ru.md) • [🇨🇳 中文](CHANGELOG.zh.md)

All notable changes to Human-AI Monitor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Drift events observability** (finding #2, second implementation): cron drift guard now persists events to the `cron_drift_events` D1 table; new `/drift-events` endpoint returns the last 100 events — the runtime guard is observable, not just a log line
- **Health self-reporting & live monitoring**: `/health` now exposes version, sources_count, batches_planned, batches_ok; new daily `live-monitor` workflow asserts live API against git (version parity, batch coverage, translation persistence) — closes nightly-audit finding #2
- **Coverage honesty**: README coverage claim annotated (60% measured across 7 unit-testable suites, API entry excluded); `npm run coverage` script added
- **Protocol synchronization documentation** (docs/architecture.md §6):
  - Interim protocol visibility: Saturday 08:00 UTC (~18h delay from Friday generation)
  - Final protocol visibility: Monday 14:00 UTC (~15min delay from Monday generation)
  - Sync workflow details and manual trigger instructions

### Changed
- **docs/architecture.md §2.4**: Cron Trigger schedule updated from weekly (Monday 06:00) to 5 batches daily
- **docs/architecture.md §3**: Data Flow updated to show D1 → GitHub Actions → repository path with sync delay
- **README.md**: Dual-sync workflow description expanded with schedule and visibility delay

### Added
- **AGENTS.md**: repository guidance for AI coding agents — 10 hard rules distilled from the 2026-09 consistency review (generated code, prompt-as-behavior, EN-canon mirroring, single-source version, cron invariants, protocol lifecycle, regeneration/translation interaction, deploy discipline, pre-push checks, commit discipline)

### Changed
- **Single-source version**: `/` endpoint metadata now reads version from `package.json` (build-time import) instead of a hardcoded literal; repo_audit verifies package.json = CITATION.cff and release-date parity
- **Cron batching hardening**: batch offsets/limits moved to exported `CRON_BATCH_CONFIG`; runtime guard logs a loud error on source-count drift; new `cron-batching` test suite (4 invariants: full coverage, contiguous offsets, batch numbering, subrequest budget); repo_audit verifies wrangler crons == config keys

## [1.0.1] - 2026-09-25

### Fixed
- **Russian keys in gap-computation.ts**: multiplier dictionaries now use English keys matching classifier output, restoring full sensitivity to shift/direction in mathematical model
- **Miniflare hang after tests**: added globalTeardown with process.exit(0) workaround, reducing test suite runtime from 24s to 8s

### Changed
- **Documentation synchronization**: all READMEs (EN/RU/ZH), math_brief (EN/RU), and architecture.md updated to reflect v1.0.1 critical fixes
- **Protocol synchronization documented**: added §6 to architecture.md explaining 18h/15min delay between generation and git visibility

### Infrastructure
- **vitest.config.mts**: proper Cloudflare Workers integration via cloudflareTest() plugin
- **test/global-teardown.ts**: graceful shutdown handling for Miniflare resources

## [1.0.0] - 2026-09-24

### Added
- **Architecture v2: Interim/Final Protocol Split**
  - Friday 13:45 UTC generates draft protocol (`is_interim=1`) for current week
  - Monday 13:45 UTC generates final protocol (`is_interim=0`) for previous week
  - Only final protocols update `gap_history` and `index_history` tables
  - Draft protocols allow early visibility without affecting Gap Index calculations

- **Translation Support (EN → RU/ZH)**
  - `/protocols/current/ru` and `/protocols/current/zh` endpoints
  - `/protocols/{week}/content/ru` and `/protocols/{week}/content/zh` endpoints
  - `/translate-document` endpoint for manual translation
  - `/translate/{week}` endpoint for weekly translation
  - Database migration 0006: added `content_ru` and `content_zh` columns to `protocols` table
  - GitHub Actions workflow `translate-protocols.yml` (runs after protocol generation)

- **Dual-Sync Workflow**
  - `.github/workflows/sync-protocols.yml` syncs latest 2 protocols to collector repo
  - Archive repo (human-ai-monitor-archive) stores all historical protocols
  - Collector repo (human-ai-monitor-collector) keeps only latest 2 protocols
  - Downloads EN/RU/ZH for each protocol with safe temp-file handling

- **AI Now Institute** (https://ainowinstitute.org/feed) as tier 1 AI source
  - Focus: AI governance, equity, human agency
  - Axes: h1_agency, h4_equity, h6_democracy
  - Replaced Stanford HAI (RSS unavailable — all URLs return HTML instead of RSS)

- **Migration 0005**: Removed duplicate entries from `index_history`
  - Fixed issue where week-naming scheme change created duplicate records
  - Reduced `index_history` from 65 to 26 rows
  - Added guard in `generateAndSaveProtocol()` to prevent still-open-week writes

- **Voices expansion**
  - Trump "AI Force" announcement (2026-09-19) added to the Voices section of README.md and README.ru.md

### Changed
- **Architecture v2: Cron Schedule Expansion**
  - Old: 4 batches at 06:00/06:15/06:30/06:45 UTC (every Monday)
  - New: 5 batches daily at 13:00/13:15/13:30/13:45/23:00 UTC
  - Daytime batches (13:00-13:45): 8 sources each, maxPerSource=3
  - Evening batch (23:00): 9 sources, maxPerSource=2
  - Covers all 41 enabled sources across 5 batches

- **Source Management**
  - Removed Meduza from `sources_human.yaml` (meduza.io)
  - Sources count: 41 enabled (25 AI + 16 Human) out of 47 configured
  - 6 sources disabled (Nature 303, Lancet 403, Benton 404, ILO 404, V-Dem 404, VentureBeat 429)

- **CITATION.cff metadata**
  - Version 0.6.0 → 1.0.0
  - Release date 2026-09-18 → 2026-09-21

### Fixed
- **Protocol Week Naming** (Finding #1 from engineer review)
  - `getWeekRange()` now returns Monday as `start` (protocol identifier)
  - Protocol "2026-09-22" = week of September 22-28 (Monday-Sunday)
  - Added `filterStart` and `filterEnd` fields for SQL WHERE clauses
  - `/gap` and markdown generation now sort by `recorded_at DESC` (companion fix)

- **Reclassification Waste** (Finding #2)
  - Hash/existing-check now runs before `env.AI.run()` (not after)
  - Existing items read axes/relevance/shift from DB row instead of re-classifying
  - Eliminates "flicker" where items were re-classified unnecessarily

- **Silent Skip Bug** (Finding #3)
  - Added `items_skipped_no_title` counter at exact drop point
  - Closes unexplained 24-vs-22 gap in collection statistics

- **Gap Index Computation** (Critical finding F6 from 2026-09-20 report)
  - Created `src/services/gap-computation.ts` with `computeGapIndex()` function
  - `generateAndSaveProtocol()` now calls `computeGapIndex()` instead of copying last row
  - Results persisted to `gap_history` AND `index_history` tables
  - Verified: weeks with different item counts now produce different Gap Index scores
  - Production deployment: Version IDs 9b676bd3 → dc501a70 → e3de304

- **Database Migrations**
  - Migration 0003: Updated SMD level from 0.30 to 0.45
    - Reason: Anthropic reached AL4 (26% AI-led tasks, >90% AL3 collaboration)
    - First system with sustained L4; threshold remains "≥2 systems"
    - Updated both the remote D1 database and seed data in `migrations/0001_initial_schema.sql`
    - Reference: Anthropic Research Automation Index (September 2026)
  - Migration 0004: Added `recorded_at` column to `protocols` table
  - Migration 0007: Added `is_interim` column to `protocols` table
  - Migration 0008: Added `content_ru` and `content_zh` columns (nullable)

### Removed
- Vestigial `wrangler.toml` (only contained `[site]` section, not used)
- Stanford HAI source (all RSS URLs return HTML instead of XML)

### Planned
- **Force reclassification parameter** (`?reclassify=true` for `/collect`)
  - Allow manual re-classification of existing items when prompts change
  - Hash check (sha256Hex + DB lookup) currently prevents re-processing
  - Need bypass option: skip `if (existing)` check when force=true
  - Referenced in verification report as priority item (not yet implemented)

- **Metrics dashboard for Workers AI quota**
  - Track `ai_calls_today`, `ai_calls_saved` (via hash check), `quota_usage_percent`
  - Add to `/health` endpoint for monitoring
  - Current: only `items_classified` counter exists, no quota tracking
  - Referenced in verification report as priority item (not yet implemented)

- **R2 caching for classification results**
  - Cache parsed AI responses in Cloudflare R2 to reduce token usage
  - Hash-based keys (sha256 of title+summary) → cached JSON response
  - Fallback to AI Workers on cache miss
  - Referenced in verification report as mid-term item (not yet implemented)

- Refactoring: split monolithic src/index.ts into modules
- HTML parsing for non-RSS sources
- HTML entity decoding for HTML-parsed sources (`&#39;` → `'`)
- Android APK (PWA + Capacitor)
- Web interface (Cloudflare Pages)


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
