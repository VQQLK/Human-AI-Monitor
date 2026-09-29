#!/usr/bin/env bash
# ============================================================
# Human–AI Monitor — full system audit (read-only)
# ============================================================
# 10 phases, ~60 checks. Prints ✅ / ⚠️ / ❌.
# Exit 0 = ok, 1 = FAIL found.
#
# Usage:
#   bash scripts/audit_full.sh
#   bash scripts/audit_full.sh 2>&1 | tee /tmp/audit.log
# ============================================================

set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

WORKER_URL="https://human-ai-monitor-collector.human-ai-monitor.workers.dev"
DB="human-ai-monitor-db"
REPO="VQQLK/Human-AI-Monitor"
CURRENT_WEEK="2026-09-28"
TMPDIR="${TMPDIR:-/tmp}"
GAP_JSON="$TMPDIR/_audit_gap.json"

PASS=0; FAIL=0; WARN=0

ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
hdr()  { echo; echo "═══════════════════════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════════════════════"; }

have() { command -v "$1" >/dev/null 2>&1; }

# D1 helper — emits one JSON line per result row via --json.
# Robust against ANSI codes, locales, and wrangler output format changes.
d1c() {
    npx --no-install wrangler d1 execute "$DB" --remote --json --command "$1" 2>/dev/null \
      | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
if not isinstance(data, list):
    data = [data]
for d in data:
    for row in (d.get('results') or []):
        print(json.dumps(row, ensure_ascii=False))
"
}

# Scalar count: first row of SELECT COUNT(*) AS n
d1_count() {
    d1c "$1" | python3 -c "
import sys, json
line = sys.stdin.readline().strip()
print(json.loads(line)['n'] if line else 0)
"
}

echo "═══════════════════════════════════════════════════════════"
echo "  FULL SYSTEM AUDIT — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  repo: $ROOT"
echo "═══════════════════════════════════════════════════════════"

# ─────────────────────────────────────────────────────────
hdr "PHASE 1 — Environment"
# ─────────────────────────────────────────────────────────
for tool in git node npx python3 curl gh; do
    have "$tool" && ok "$tool present" || bad "$tool MISSING"
done
npx --no-install wrangler --version >/dev/null 2>&1 && ok "wrangler via npx" || bad "wrangler not resolvable"
if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
    ok "Cloudflare auth: CLOUDFLARE_API_TOKEN env"
elif npx --no-install wrangler whoami >/dev/null 2>&1; then
    ok "Cloudflare auth: stored session (macOS keychain)"
else
    warn "Cloudflare auth: not detected (wrangler may still work)"
fi

if have gh; then
    gh auth status >/dev/null 2>&1 && ok "gh authenticated" || bad "gh NOT authenticated"
fi

# ─────────────────────────────────────────────────────────
hdr "PHASE 2 — Git state"
# ─────────────────────────────────────────────────────────
STATUS=$(git status --short)
if [ -z "$STATUS" ]; then ok "working tree clean"; else bad "working tree dirty:"; echo "$STATUS" | sed 's/^/     /'; fi

git fetch origin >/dev/null 2>&1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null)
if [ "$LOCAL" = "$REMOTE" ]; then ok "HEAD == origin/main ($LOCAL)"; else bad "HEAD ($LOCAL) != origin/main ($REMOTE)"; fi

echo "  last 5 commits:"
git log --oneline -5 | sed 's/^/     /'

# ─────────────────────────────────────────────────────────
hdr "PHASE 3 — Cloudflare Worker"
# ─────────────────────────────────────────────────────────
SECRETS_RAW=$(npx --no-install wrangler secret list 2>/dev/null)
for name in ADMIN_SECRET_CURRENT ADMIN_SECRET_PREVIOUS GITHUB_PAT; do
    if echo "$SECRETS_RAW" | grep -q "\"$name\""; then ok "secret $name"; else bad "secret $name MISSING"; fi
done

CRON_COUNT=$(grep -cE '"[0-9]+ [0-9]+ \* \* \*"' wrangler.jsonc 2>/dev/null || echo 0)
if [ "$CRON_COUNT" = "5" ]; then ok "wrangler.jsonc: 5 cron triggers"; else bad "wrangler.jsonc cron count = $CRON_COUNT (expected 5)"; fi

LAST_VER=$(npx --no-install wrangler deployments list 2>/dev/null | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | tail -1)
[ -n "$LAST_VER" ] && ok "active worker version: $LAST_VER" || warn "cannot determine active worker version"

MIG=$(npx --no-install wrangler d1 migrations list "$DB" --remote 2>/dev/null)
if echo "$MIG" | grep -qiE "no migrations to apply|✅"; then ok "D1 migrations: all applied"; else warn "D1 migrations status unclear"; fi

# ─────────────────────────────────────────────────────────
hdr "PHASE 4 — D1 schema"
# ─────────────────────────────────────────────────────────
IH_COLS=$(d1c "PRAGMA table_info(index_history)" | wc -l | tr -d ' ')
if [ "$IH_COLS" -ge 12 ]; then ok "index_history: $IH_COLS columns (≥12)"; else bad "index_history: $IH_COLS columns (<12, migration 0012 missing)"; fi

GH_COLS=$(d1c "PRAGMA table_info(gap_history)" | wc -l | tr -d ' ')
if [ "$GH_COLS" -ge 17 ]; then ok "gap_history: $GH_COLS columns (≥17)"; else bad "gap_history: $GH_COLS columns (<17, migration 0011 missing)"; fi

PR_COLS=$(d1c "PRAGMA table_info(protocols)" | wc -l | tr -d ' ')
if [ "$PR_COLS" -ge 13 ]; then ok "protocols: $PR_COLS columns"; else warn "protocols: $PR_COLS columns (<13)"; fi

IT_COLS=$(d1c "PRAGMA table_info(items)" | wc -l | tr -d ' ')
if [ "$IT_COLS" -ge 10 ]; then ok "items: $IT_COLS columns"; else warn "items: $IT_COLS columns (<10)"; fi

for tbl in items protocols gap_history index_history cron_drift_events; do
    if d1c "SELECT name FROM sqlite_master WHERE type='table' AND name='$tbl'" | grep -q "$tbl"; then
        ok "table $tbl exists"
    else
        bad "table $tbl MISSING"
    fi
done

# ─────────────────────────────────────────────────────────
hdr "PHASE 5 — D1 data"
# ─────────────────────────────────────────────────────────
ITEMS_MAX=$(d1c "SELECT MAX(date) AS m FROM items" | python3 -c "
import sys, json
line = sys.stdin.readline().strip()
print(json.loads(line)['m'] if line else '')
")
TODAY=$(date -u +%Y-%m-%d)
if [ "$ITEMS_MAX" = "$TODAY" ]; then ok "items max_date = today ($ITEMS_MAX)"; else warn "items max_date = $ITEMS_MAX (today = $TODAY)"; fi

ITEMS_TOTAL=$(d1_count "SELECT COUNT(*) AS n FROM items")
[ -n "$ITEMS_TOTAL" ] && ok "items total = $ITEMS_TOTAL" || warn "cannot read items count"

PROTO_TOTAL=$(d1_count "SELECT COUNT(*) AS n FROM protocols")
[ -n "$PROTO_TOTAL" ] && ok "protocols total = $PROTO_TOTAL" || warn "cannot read protocols count"

echo "  last protocol:"
d1c "SELECT week_start, is_interim, LENGTH(content) AS en, LENGTH(content_ru) AS ru, LENGTH(content_zh) AS zh FROM protocols ORDER BY week_start DESC LIMIT 1" | grep -E '^│' | sed 's/^/     /'

GAP_TOTAL=$(d1_count "SELECT COUNT(*) AS n FROM gap_history")
[ -n "$GAP_TOTAL" ] && ok "gap_history rows = $GAP_TOTAL" || warn "cannot read gap_history"

DRIFT=$(d1_count "SELECT COUNT(*) AS n FROM cron_drift_events")
if [ "$DRIFT" = "0" ]; then ok "cron_drift_events empty (no drift)"; else warn "cron_drift_events has $DRIFT rows"; fi

# ─────────────────────────────────────────────────────────
hdr "PHASE 6 — HTTP API"
# ─────────────────────────────────────────────────────────
check_http() {
    local path="$1" expect="$2" out
    out=$(curl -sS -o /dev/null -w "%{http_code}" -m 15 "$WORKER_URL$path" 2>/dev/null)
    if [ "$out" = "$expect" ]; then ok "GET $path → $out"; else bad "GET $path → $out (expected $expect)"; fi
}

check_http "/health" 200
check_http "/gap" 200
check_http "/protocols" 200
check_http "/protocols/$CURRENT_WEEK" 200
check_http "/protocols/$CURRENT_WEEK/content" 200
check_http "/protocols/$CURRENT_WEEK/content/ru" 200
check_http "/protocols/$CURRENT_WEEK/content/zh" 200
check_http "/axes-history" 200

echo "  stability check: /protocols/current × 5:"
CURRENT_OK=0
for i in 1 2 3 4 5; do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -m 20 "$WORKER_URL/protocols/current" 2>/dev/null)
    echo "     attempt $i → $CODE"
    [ "$CODE" = "200" ] && CURRENT_OK=$((CURRENT_OK+1))
done
if [ "$CURRENT_OK" = "5" ]; then ok "/protocols/current: 5/5 HTTP 200"; else bad "/protocols/current: $CURRENT_OK/5 HTTP 200"; fi

HEALTH=$(curl -sS -m 10 "$WORKER_URL/health" 2>/dev/null)
echo "$HEALTH" | grep -q '"status": *"ok"'      && ok "health.status = ok"           || bad  "health.status != ok"
echo "$HEALTH" | grep -q '"version": *"1.0.2"'  && ok "health.version = 1.0.2"       || warn "health.version != 1.0.2"
echo "$HEALTH" | grep -q '"batches_ok": *true'  && ok "health.batches_ok = true"     || warn "health.batches_ok != true"

# ─────────────────────────────────────────────────────────
hdr "PHASE 7 — GitHub Actions"
# ─────────────────────────────────────────────────────────
if have gh; then
    echo "  workflows:"
    gh workflow list --all 2>/dev/null | sed 's/^/     /'
    echo
    for wf in sync-protocols.yml translate-protocols.yml live-monitor.yml ci.yml docs-check.yml; do
        LAST=$(gh run list --workflow="$wf" --limit 1 --json conclusion,event,createdAt 2>/dev/null | python3 -c "
import sys, json
try:
    runs = json.load(sys.stdin)
    r = runs[0] if runs else None
    if r:
        ev = r['event'] or '?'
        cc = r['conclusion'] or 'running'
        ca = (r['createdAt'] or '?')[:19]
        print('%-18s %-10s %s' % (ev, cc, ca))
    else:
        print('(no runs)')
except Exception as e:
    print('error: %s' % e)
")
        echo "     $wf: $LAST"
    done
fi

# ─────────────────────────────────────────────────────────
hdr "PHASE 8 — Local checks"
# ─────────────────────────────────────────────────────────
echo "  running tsc --noEmit ..."
if npx --no-install tsc --noEmit >"$TMPDIR/_tsc.log" 2>&1; then ok "tsc: OK"; else bad "tsc: FAILED (see $TMPDIR/_tsc.log)"; fi

echo "  running vitest run ..."
if npx --no-install vitest run >"$TMPDIR/_vitest.log" 2>&1; then
    LINE=$(grep -aE "Tests +[0-9]+ passed" "$TMPDIR/_vitest.log" | head -1 | tr -s ' ')
    ok "vitest:${LINE:-passed}"
else
    bad "vitest: FAILED (see $TMPDIR/_vitest.log)"
    tail -20 "$TMPDIR/_vitest.log" | sed 's/^/     /'
fi

echo "  running repo_audit.py ..."
if have python3; then
    python3 scripts/repo_audit.py >"$TMPDIR/_audit.log" 2>&1
    if grep -q "0 FAIL" "$TMPDIR/_audit.log"; then
        LINE=$(grep -E "Итог|total" "$TMPDIR/_audit.log" | tail -1)
        ok "repo_audit: $LINE"
    else
        bad "repo_audit: FAIL (see $TMPDIR/_audit.log)"
    fi
fi

# ─────────────────────────────────────────────────────────
hdr "PHASE 9 — Docs consistency"
# ─────────────────────────────────────────────────────────
PKG_VER=$(grep -oE '"version": *"[^"]+"' package.json | grep -oE '[0-9.]+' | head -1)
CIT_VER=$(grep -E "^version:" CITATION.cff | awk '{print $2}')
CIT_DATE=$(grep -E "^date-released:" CITATION.cff | awk '{print $2}')

if [ "$PKG_VER" = "$CIT_VER" ]; then ok "package.json = CITATION.cff version ($PKG_VER)"; else bad "version mismatch: pkg=$PKG_VER cit=$CIT_VER"; fi

CHANGELOG_DATE=$(grep -E "^## \[[0-9]+\.[0-9]+\.[0-9]+\]" CHANGELOG.md | head -1 | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
if [ "$CIT_DATE" = "$CHANGELOG_DATE" ]; then ok "CITATION.cff date = CHANGELOG latest ($CIT_DATE)"; else bad "date mismatch: cit=$CIT_DATE changelog=$CHANGELOG_DATE"; fi

for f in docs/architecture.md docs/math_brief.md docs/methodology.md; do
    v=$(grep -E "^\*\*Version:\*\*" "$f" | head -1 | awk '{print $2}')
    if [ "$v" = "$PKG_VER" ]; then ok "$f version = $PKG_VER"; else warn "$f version = $v (expected $PKG_VER)"; fi
done

BF_VER=$(grep -E "^\*\*Document version:\*\*" docs/bayesian_framework.md | head -1 | awk '{print $3}')
[ "$BF_VER" = "v2.0" ] && ok "bayesian_framework.md version = v2.0" || warn "bayesian_framework version = $BF_VER"

# ─────────────────────────────────────────────────────────
hdr "PHASE 10 — Mathematics & formulas"
# ─────────────────────────────────────────────────────────

BF="src/services/bayesian-gap.ts"
if [ -f "$BF" ]; then
    grep -qE 'export const ALPHA_0\s*=\s*0\.5'              "$BF" && ok "code: ALPHA_0 = 0.5"               || bad "code: ALPHA_0 missing"
    grep -qE 'export const BETA_0\s*=\s*0\.5'               "$BF" && ok "code: BETA_0 = 0.5"                || bad "code: BETA_0 missing"
    grep -qE 'export const DEFAULT_MC_SAMPLES\s*=\s*10000'  "$BF" && ok "code: DEFAULT_MC_SAMPLES = 10000"  || bad "code: DEFAULT_MC_SAMPLES missing"
    grep -qE 'export function seedFromString'               "$BF" && ok "code: seedFromString exists"       || bad "code: seedFromString missing"
    grep -qE 'export function mulberry32'                   "$BF" && ok "code: mulberry32 exists"           || bad "code: mulberry32 missing"
    grep -qE 'export function sampleBeta'                   "$BF" && ok "code: sampleBeta exists"           || bad "code: sampleBeta missing"
    grep -qE 'export function sampleGamma'                  "$BF" && ok "code: sampleGamma exists"          || bad "code: sampleGamma missing"

    PI_BLOCK=$(sed -n '/export const PI_TABLE/,/^};/p' "$BF")
    echo "$PI_BLOCK" | grep -qE '\+?1\.0'  && ok "PI_TABLE has +1.0"  || bad "PI_TABLE missing +1.0"
    echo "$PI_BLOCK" | grep -qE '\-1\.0'   && ok "PI_TABLE has -1.0"  || bad "PI_TABLE missing -1.0"
    echo "$PI_BLOCK" | grep -qE '0\.5'     && ok "PI_TABLE has 0.5"   || bad "PI_TABLE missing 0.5"
    echo "$PI_BLOCK" | grep -qE '0\.3'     && ok "PI_TABLE has 0.3"   || bad "PI_TABLE missing 0.3"
else
    bad "$BF not found"
fi

# Docs: формулы EN/RU/ZH
for f in docs/bayesian_framework.md docs/bayesian_framework.ru.md docs/bayesian_framework.zh.md; do
    if [ ! -f "$f" ]; then bad "$f missing"; continue; fi
    grep -qF "Beta("           "$f" && ok "$f: Beta posterior"     || bad "$f: MISSING Beta posterior"
    grep -qF "1/2"             "$f" && ok "$f: Jeffreys 1/2"       || bad "$f: MISSING Jeffreys 1/2"
    grep -qF "AI_score"        "$f" && ok "$f: Gap AI_score"       || bad "$f: MISSING AI_score"
    grep -qF "Human_score"     "$f" && ok "$f: Gap Human_score"    || bad "$f: MISSING Human_score"
    grep -qE '10[ ,]000'       "$f" && ok "$f: M=10,000"           || bad "$f: MISSING M=10,000"
    grep -qE '1/√M|1/sqrt'     "$f" && ok "$f: MC error 1/√M"      || warn "$f: no 1/√M mention"
    grep -qF "FNV-1a"          "$f" && ok "$f: FNV-1a seed"        || warn "$f: no FNV-1a mention"
done

# Числовая валидность /gap
echo "  fetching /gap for numeric validation..."
curl -sS -m 10 "$WORKER_URL/gap" > "$GAP_JSON" 2>/dev/null
if [ ! -s "$GAP_JSON" ]; then
    bad "/gap: empty response"
else
    python3 - "$GAP_JSON" <<'PYEOF' > "$TMPDIR/_gap_check.txt"
import sys, json
try:
    d = json.load(open(sys.argv[1]))
except Exception as e:
    print(f"FAIL:parse error: {e}"); sys.exit(0)
ai, hu = d.get('ai_score'), d.get('human_score')
g, lo, hi = d.get('gap'), d.get('gap_ci95_low'), d.get('gap_ci95_high')
std, n, sig = d.get('gap_std'), d.get('sample_size'), d.get('statistically_significant')
issues = []
if ai is None or not (0 <= ai <= 1): issues.append(f"ai_score={ai} not in [0,1]")
if hu is None or not (0 <= hu <= 1): issues.append(f"human_score={hu} not in [0,1]")
if g is None or ai is None or hu is None:
    issues.append("gap/ai/human missing")
elif abs(g - (ai - hu)) > 0.02:
    issues.append(f"gap={g} != ai-hu={ai-hu}")
if lo is not None and hi is not None and g is not None:
    if not (lo <= g <= hi): issues.append(f"CI=[{lo},{hi}] does not contain gap={g}")
if std is None or std <= 0: issues.append(f"gap_std={std} not > 0")
if n is None or n <= 0:     issues.append(f"sample_size={n} not > 0")
if lo is not None and hi is not None and sig is not None:
    contains_zero = lo <= 0 <= hi
    if contains_zero and sig == 1:    issues.append("CI contains 0 but significant=1")
    if (not contains_zero) and sig == 0: issues.append("CI excludes 0 but significant=0")
if issues:
    for i in issues: print("FAIL:" + i)
else:
    print(f"OK:ai={ai} human={hu} gap={g} CI=[{lo},{hi}] std={std} n={n} sig={sig}")
PYEOF
    while IFS= read -r line; do
        case "$line" in
            OK:*)   ok   "${line#OK:}" ;;
            FAIL:*) bad  "${line#FAIL:}" ;;
        esac
    done < "$TMPDIR/_gap_check.txt"
fi

# Seed reproducibility (FNV-1a эмулируется на python, тот же алгоритм что в TS)
python3 - <<'PYEOF' > "$TMPDIR/_seed_check.txt"
def seed(s):
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h

s1 = seed("2026-09-28")
s2 = seed("2026-09-28")
s3 = seed("2026-10-05")
if s1 == s2: print("OK:seed deterministic for same week")
else:        print("FAIL:seed varies for same week")
if s1 != s3: print("OK:seed differs for different weeks")
else:        print("FAIL:seed collision")
print(f"OK:seed(2026-09-28) = {s1}")
PYEOF
while IFS= read -r line; do
    case "$line" in
        OK:*)   ok   "${line#OK:}" ;;
        FAIL:*) bad  "${line#FAIL:}" ;;
    esac
done < "$TMPDIR/_seed_check.txt"

# Cross-check DB row vs /gap
if [ -s "$GAP_JSON" ]; then
    echo "  cross-check: /gap (API) vs gap_history (DB):"
    DB_ROW=$(d1c "SELECT week_start, ROUND(ai_score,4) AS ai, ROUND(human_score,4) AS hu, ROUND(gap,4) AS g, sample_size FROM gap_history ORDER BY week_start DESC LIMIT 1" | grep -E '^│' | head -1)
    echo "     DB:  $DB_ROW"
    API_ROW=$(python3 - "$GAP_JSON" <<'PYEOF'
import sys, json
d = json.load(open(sys.argv[1]))
print(f"│ {d.get('week_start','?')} │ {d.get('ai_score','?')} │ {d.get('human_score','?')} │ {d.get('gap','?')} │ {d.get('sample_size','?')} │")
PYEOF
)
    echo "     API: $API_ROW"
    ok "cross-check printed (manual verify above)"
fi

# Math tests present
MT="test/bayesian-gap.spec.ts"
if [ -f "$MT" ]; then
    NTESTS=$(grep -cE '^\s+(it|test)\(' "$MT" 2>/dev/null || echo 0)
    ok "$MT exists ($NTESTS tests)"
    for concept in mulberry32 sampleGamma sampleBeta Beta Distribution; do
        if grep -qi "$concept" "$MT"; then ok "math test covers: $concept"; else warn "math test missing: $concept"; fi
    done
else
    bad "$MT missing"
fi

# ─────────────────────────────────────────────────────────
hdr "SUMMARY"
# ─────────────────────────────────────────────────────────
echo "  ✅ PASS: $PASS"
echo "  ⚠️  WARN: $WARN"
echo "  ❌ FAIL: $FAIL"
echo
if [ "$FAIL" -gt 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: FAIL ($FAIL issues)"
    echo "═══════════════════════════════════════════════════════════"
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: OK with $WARN warnings"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
else
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: ALL GREEN"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
fi
