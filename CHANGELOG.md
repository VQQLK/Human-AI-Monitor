# Changelog

All notable changes to Human-AI Monitor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Real test coverage (parser, classifier, protocol)
- Refactoring: split monolithic src/index.ts into modules
- HTML parsing for non-RSS sources
- HTML entity decoding for HTML-parsed sources (`&#39;` → `'`)
- Android APK (PWA + Capacitor)
- Web interface (Cloudflare Pages)
- Multilingual support (EN / RU / ZH)

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
