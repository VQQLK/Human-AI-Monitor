#!/usr/bin/env bash
# ============================================================
# scripts/security_audit.sh
# Project security audit — read-only, no mutations.
# ============================================================
#
# Checks:
#   1. Worker secrets present (ADMIN_SECRET_*, GITHUB_PAT)
#   2. Secrets not leaked into wrangler config
#   3. Secrets not in git history
#   4. .gitignore covers sensitive patterns
#   5. Protected endpoints return 401/403 without Bearer
#   6. Public endpoints return 200
#   7. CORS configuration
#   8. HTTP security headers
#   9. Rate limiting (light probe)
#  10. OPTIONS preflight behaviour
#
# Usage:
#   bash scripts/security_audit.sh
#   bash scripts/security_audit.sh 2>&1 | tee /tmp/security_audit.log
#
# Exit codes:
#   0 = no FAIL (WARN allowed)
#   1 = at least one FAIL
# ============================================================

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

WORKER_URL="${WORKER_URL:-https://human-ai-monitor-collector.human-ai-monitor.workers.dev}"
PASS=0; FAIL=0; WARN=0

# ── Pretty-print helpers ───────────────────────────────────
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
info() { echo "  ℹ️  $1"; }
hdr()  { echo; echo "═══════════════════════════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════════════════════════"; }

# ── 1. Project secrets ─────────────────────────────────────
hdr "1. Project secrets"
SECRETS_RAW=$(npx --no-install wrangler secret list 2>/dev/null)
for name in ADMIN_SECRET_CURRENT ADMIN_SECRET_PREVIOUS GITHUB_PAT; do
    if echo "$SECRETS_RAW" | grep -q "\"$name\""; then
        ok "secret $name defined"
    else
        bad "secret $name MISSING"
    fi
done

# ── 2. Secrets not in wrangler config ──────────────────────
hdr "2. Secrets not leaked into config"
if grep -qE 'ADMIN_SECRET|GITHUB_PAT' wrangler.jsonc wrangler.toml 2>/dev/null; then
    bad "secrets found in wrangler.jsonc/toml (leak!)"
else
    ok "secrets not present in wrangler.jsonc/toml"
fi

# ── 3. Secrets not in git history ──────────────────────────
hdr "3. Secrets not in git history"
if git log --all -S 'ADMIN_SECRET' --oneline 2>/dev/null | head -1 | grep -q .; then
    warn "ADMIN_SECRET appears in git history (manual review needed)"
else
    ok "ADMIN_SECRET not found in git history"
fi

# ── 4. .gitignore coverage ─────────────────────────────────
hdr "4. .gitignore protects sensitive files"
for pattern in '.env' '.dev.vars' '*.pem' '*.key' '*.p12' '*.pfx' 'id_rsa*' 'id_ed25519*'; do
    if grep -qxF "$pattern" .gitignore 2>/dev/null; then
        ok ".gitignore contains: $pattern"
    else
        warn ".gitignore MISSING: $pattern"
    fi
done

# ── 5. Unauthenticated access ──────────────────────────────
hdr "5. Response to unauthenticated requests"

# 5.1 Public endpoints must return 200
for path in "/health" "/gap" "/protocols"; do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -m 10 "$WORKER_URL$path" 2>/dev/null)
    if [ "$CODE" = "200" ]; then
        ok "GET $path → $CODE (public, expected)"
    else
        warn "GET $path → $CODE (expected 200)"
    fi
done

# 5.2 Protected endpoints must return 401/403
ADMIN_PATHS=(
    "/collect" "/collect/ping"
    "/generate" "/generate/ping"
    "/classify" "/classify/ping"
    "/translate" "/translate/ping"
    "/export-weekly" "/export-weekly/ping"
)
ADMIN_FOUND=0
for path in "${ADMIN_PATHS[@]}"; do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -m 10 "$WORKER_URL$path" 2>/dev/null)
    if [ "$CODE" = "401" ] || [ "$CODE" = "403" ]; then
        ok "GET $path → $CODE (requires auth)"
        ADMIN_FOUND=$((ADMIN_FOUND+1))
    elif [ "$CODE" = "200" ]; then
        bad "GET $path → 200 (UNAUTHENTICATED ACCESS!)"
    else
        warn "GET $path → $CODE (unexpected)"
    fi
done
[ "$ADMIN_FOUND" -eq 0 ] && warn "no protected endpoints found to verify"

# ── 6. CORS ────────────────────────────────────────────────
hdr "6. CORS headers"
CORS_HEADER=$(curl -sS -I -m 10 "$WORKER_URL/health" 2>/dev/null | grep -i '^Access-Control-Allow-Origin:')
if [ -n "$CORS_HEADER" ]; then
    if echo "$CORS_HEADER" | grep -q '\*'; then
        # For GET/OPTIONS-only read API, wildcard CORS is intentional and safe
        # (no write endpoints, no credentials).
        info "CORS: Access-Control-Allow-Origin: * (OK for read-only public API)"
    else
        ok "CORS: $CORS_HEADER (restricted)"
    fi
else
    ok "CORS: header absent (safe by default)"
fi

# ── 7. Security headers ────────────────────────────────────
hdr "7. Security headers"
HEADERS=$(curl -sS -I -m 10 "$WORKER_URL/health" 2>/dev/null)
for header in "X-Content-Type-Options" "X-Frame-Options" "Strict-Transport-Security" \
              "Referrer-Policy" "Permissions-Policy"; do
    if echo "$HEADERS" | grep -qi "^$header:"; then
        ok "$header present"
    else
        warn "$header missing (recommended)"
    fi
done

# ── 8. Rate limiting (light probe) ─────────────────────────
hdr "8. Rate limiting (light probe)"
echo "  Sending 20 sequential requests to /health..."
RATE_LIMITED=0
for i in $(seq 1 20); do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -m 5 "$WORKER_URL/health" 2>/dev/null)
    [ "$CODE" = "429" ] && RATE_LIMITED=$((RATE_LIMITED+1))
done
if [ "$RATE_LIMITED" -gt 0 ]; then
    ok "Rate limiting active ($RATE_LIMITED/20 returned 429)"
else
    warn "Rate limiting not detected (20 requests all passed)"
    info "consider Cloudflare WAF rate limiting on custom domain,"
    info "or a KV/Durable-Object throttle for .workers.dev"
fi

# ── 9. OPTIONS preflight ───────────────────────────────────
hdr "9. OPTIONS preflight handling"
for path in "/health" "/collect"; do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -X OPTIONS -m 10 \
        -H "Origin: https://evil.example.com" \
        -H "Access-Control-Request-Method: GET" \
        "$WORKER_URL$path" 2>/dev/null)
    case "$CODE" in
        200|204) ok "OPTIONS $path → $CODE (preflight handled)" ;;
        401|403) ok "OPTIONS $path → $CODE (requires auth)" ;;
        *)       warn "OPTIONS $path → $CODE (unexpected)" ;;
    esac
done

# ── SUMMARY ────────────────────────────────────────────────
hdr "SUMMARY"
echo "  ✅ PASS: $PASS"
echo "  ⚠️  WARN: $WARN"
echo "  ❌ FAIL: $FAIL"
echo

if [ "$FAIL" -gt 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: FAIL ($FAIL critical issues)"
    echo "═══════════════════════════════════════════════════════════"
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: OK with $WARN warnings"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
else
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: ALL CLEAN"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
fi
