# Protocols archive

Weekly protocol snapshots, synced from production API.

## Source of truth

The production **Cloudflare D1** database (table `protocols`, column `content`)
is the source of truth. The API reads directly from D1:

- `GET /protocols` — list of all protocols
- `GET /protocols/{week_start}/content` — markdown for a specific week

Files in this directory are **read-only snapshots**, refreshed automatically
by `.github/workflows/sync-protocols.yml` (runs daily at 08:00 UTC).

## File naming

`{week_start}.md`, where `week_start` is the **Monday** of the covered week.
Covered period is `week_start` through `week_start + 6` (Sunday).

Example: `2026-09-14.md` covers Monday 2026-09-14 → Sunday 2026-09-20.

## Why this archive exists

- **Historical backup** — survives accidental D1 data loss
- **Grep-able history** — search across years without hitting the API
- **Public record** — anyone can browse protocol evolution on GitHub

## Manual recovery

If D1 is ever lost, the archive alone is not sufficient to rebuild — the
`items` table (with per-article axes, relevance, shift) is not mirrored
here. But the markdown protocols give a full historical record of what
the Gap Index looked like at each week, which is the primary output.
