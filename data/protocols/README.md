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

**`{week_end}.md`**, where `week_end` is the **Sunday** of the covered week.
The covered period runs from the **Monday** 6 days before `week_end` through
the **Sunday** `week_end` itself.

Example: `2026-09-20.md` covers Monday 2026-09-14 → Sunday 2026-09-20.

| File | Monday (API: `week_start`) | Sunday (file: `week_end`) | Coverage |
|------|----------------------------|---------------------------|----------|
| `2026-09-20.md` | 2026-09-14 | 2026-09-20 | Mon 14 Sep → Sun 20 Sep |
| `2026-09-27.md` | 2026-09-21 | 2026-09-27 | Mon 21 Sep → Sun 27 Sep |
| `2026-10-04.md` | 2026-09-28 | 2026-10-04 | Mon 28 Sep → Sun 04 Oct |

### Why Sunday-based naming for files?

- "The week ending September 20" is more intuitive for human readers than
  "the week starting September 14"
- Matches how people naturally think about "last week" (as a completed period)

### Note on API identifier

The production API and database use the **Monday** (`week_start`) as the
canonical identifier. For example:

- API endpoint: `GET /protocols/2026-09-14/content`
- Database: `protocols.week_start = '2026-09-14'`

This archive uses **Sunday** (`week_end`) only for file names to be more
human-readable. The mapping is straightforward:

