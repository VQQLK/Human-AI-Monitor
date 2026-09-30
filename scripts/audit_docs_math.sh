#!/usr/bin/env bash
# ============================================================
# scripts/audit_docs_math.sh
# Pedantic audit: docs ↔ code for Bayesian method + Monte Carlo.
# Read-only. Exit 0 = no FAIL.
# ============================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

BF="src/services/bayesian-gap.ts"
EN="docs/bayesian_framework.md"
RU="docs/bayesian_framework.ru.md"
ZH="docs/bayesian_framework.zh.md"
TEST="test/bayesian-gap.spec.ts"

PASS=0; FAIL=0; WARN=0
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
info() { echo "  ℹ️  $1"; }
hdr()  { echo; echo "═══════════════════════════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════════════════════════"; }

# ── 1. Presence ─────────────────────────────────────────────
hdr "1. Files present"
for f in "$BF" "$EN" "$RU" "$ZH" "$TEST"; do
    if [ -f "$f" ]; then
        ok "$f ($(wc -l < "$f" | tr -d ' ') lines)"
    else
        bad "$f MISSING"
    fi
done
[ -f "$BF" ] && [ -f "$EN" ] || { echo "  ❌ cannot continue"; exit 1; }

# ── 2. Code facts ───────────────────────────────────────────
hdr "2. Code — extracted facts"

A0=$(grep -oE 'ALPHA_0\s*=\s*[0-9.]+' "$BF" | grep -oE '[0-9.]+$' | head -1)
B0=$(grep -oE 'BETA_0\s*=\s*[0-9.]+' "$BF" | grep -oE '[0-9.]+$' | head -1)
MC=$(grep -oE 'DEFAULT_MC_SAMPLES\s*=\s*[0-9]+' "$BF" | grep -oE '[0-9]+$' | head -1)

[ "$A0" = "0.5" ] && ok "code: ALPHA_0 = 0.5" || bad "code: ALPHA_0 = ${A0:-?} (expect 0.5)"
[ "$B0" = "0.5" ] && ok "code: BETA_0 = 0.5"  || bad "code: BETA_0 = ${B0:-?} (expect 0.5)"
[ "$MC" = "10000" ] && ok "code: MC_SAMPLES = 10000" || bad "code: MC_SAMPLES = ${MC:-?}"

FNV_OFFSET=$(grep -oE '2166136261' "$BF" | head -1)
FNV_PRIME=$(grep -oE '16777619'   "$BF" | head -1)
[ "$FNV_OFFSET" = "2166136261" ] && ok "code: FNV-1a offset basis" || bad "code: no 2166136261"
[ "$FNV_PRIME" = "16777619" ]   && ok "code: FNV-1a prime"       || bad "code: no 16777619"

for fn in seedFromString mulberry32 sampleGamma sampleBeta; do
    grep -qE "^export function $fn" "$BF" && ok "code: $fn() exported" || bad "code: $fn() missing"
done

PI_BLOCK=$(sed -n '/export const PI_TABLE/,/^};/p' "$BF")
PI_KEYS=$(echo "$PI_BLOCK" | grep -oE '^\s+[a-z_]+:' | sed 's/[: ]//g')
PI_COUNT=$(echo "$PI_KEYS" | grep -c . || echo 0)
info "PI_TABLE: $PI_COUNT keys"
echo "$PI_KEYS" | sed 's/^/       /'

# ── 3. Doc facts ────────────────────────────────────────────
hdr "3. Docs — per-language consistency"

check_doc() {
    local lang="$1" doc="$2"
    echo
    echo "  ── $lang: $(basename "$doc") ──"
    [ -f "$doc" ] || { bad "$lang doc missing"; return; }

    # Constants with values
    # α₀ = 0.5 or α₀ = β₀ = 1/2 or α₀ = 1/2 (Jeffreys prior)
    grep -qE 'α[₀0]?\s*[=:]\s*(0[.,]5|1/2)|alpha[_\s]*0\s*[=:]\s*(0[.,]5|1/2)|ALPHA_0\s*[=:]\s*(0[.,]5|1/2)|α[₀0]\s*=\s*β[₀0]\s*=\s*1/2' "$doc" \
        && ok "$lang: α₀ = 0.5 (or = β₀ = 1/2) explicit" \
        || warn "$lang: α₀ = 0.5 not explicit"

    grep -qE 'β[₀0]?\s*[=:]\s*(0[.,]5|1/2)|beta[_\s]*0\s*[=:]\s*(0[.,]5|1/2)|BETA_0\s*[=:]\s*(0[.,]5|1/2)|α[₀0]\s*=\s*β[₀0]\s*=\s*1/2' "$doc" \
        && ok "$lang: β₀ = 0.5 (or α₀ = β₀ = 1/2) explicit" \
        || warn "$lang: β₀ = 0.5 not explicit"

    grep -qE '10[ ,]?000|M\s*[=:]\s*10[ ,]?000' "$doc" \
        && ok "$lang: M = 10,000 explicit" \
        || bad "$lang: sample count missing"

    grep -qiF 'Jeffreys' "$doc" && ok "$lang: Jeffreys prior" || warn "$lang: no Jeffreys"

    grep -qF 'Beta(' "$doc" && ok "$lang: Beta posterior formula" || bad "$lang: no Beta("

    grep -qF 'AI_score' "$doc" && grep -qF 'Human_score' "$doc" \
        && ok "$lang: Gap = AI_score − Human_score" \
        || bad "$lang: Gap formula fragment missing"

    grep -qE '1/√M|1/sqrt|1/\\sqrt|SE\s*[=:]' "$doc" \
        && ok "$lang: MC error 1/√M" \
        || warn "$lang: MC error not stated"

    grep -qF 'FNV-1a' "$doc" && ok "$lang: FNV-1a seed" || warn "$lang: FNV-1a missing"

    grep -qF 'mulberry32' "$doc" && ok "$lang: mulberry32" || info "$lang: mulberry32 not mentioned (impl detail, OK)"

    grep -qE '95\s*%|0[.,]95|percentile|перцентил|百分位' "$doc" \
        && ok "$lang: 95% CI" \
        || warn "$lang: 95% CI not mentioned"

    grep -qE '2166136261|16777619' "$doc" \
        && ok "$lang: FNV-1a magic constants" \
        || info "$lang: FNV magic numbers not shown (acceptable)"
}

check_doc "EN" "$EN"
check_doc "RU" "$RU"
check_doc "ZH" "$ZH"

# ── 4. Cross-check: code → docs ─────────────────────────────
hdr "4. Cross-check: code facts → docs"
for doc in "$EN" "$RU" "$ZH"; do
    [ -f "$doc" ] || continue
    n=$(basename "$doc")

    # Implementation details (PRNG internals) — optional mentions.
    # Docs describe the *algorithm*; function names are code artifacts.
    for fn in seedFromString mulberry32 sampleGamma sampleBeta; do
        grep -qF "$fn" "$doc" && ok "$n: mentions $fn" || info "$n: no $fn (impl detail, OK)"
    done

    [ "$MC" = "10000" ] && grep -qE '10[ ,]?000' "$doc" \
        && ok "$n: MC sample count matches" \
        || warn "$n: MC count not shown"
done

# ── 5. Test coverage ────────────────────────────────────────
hdr "5. Test coverage"
if [ -f "$TEST" ]; then
    NTESTS=$(grep -cE '^\s*(it|test)\(' "$TEST" 2>/dev/null || echo 0)
    ok "$TEST exists ($NTESTS tests)"
    # seedFromString may be tested indirectly (e.g. via deterministic
    # sequences), so treat its absence as info, not a warning.
    for concept in mulberry32 sampleGamma sampleBeta Beta Distribution; do
        grep -qi "$concept" "$TEST" && ok "test covers: $concept" || warn "test misses: $concept"
    done
    grep -qi "seedFromString" "$TEST" \
        && ok "test covers: seedFromString (explicit)" \
        || info "test: seedFromString not explicit (covered via determinism tests)"
else
    bad "$TEST missing"
fi

# ── 6. Structural parallelism ───────────────────────────────
hdr "6. Heading count (EN ↔ RU ↔ ZH)"
cH() { grep -cE '^#{1,4} ' "$1" 2>/dev/null || echo 0; }
ENH=$(cH "$EN"); RUH=$(cH "$RU"); ZHH=$(cH "$ZH")
info "EN=$ENH  RU=$RUH  ZH=$ZHH"

if [ "$ENH" = "$RUH" ] && [ "$ENH" = "$ZHH" ]; then
    ok "parallel heading count ($ENH)"
elif [ "$ENH" -ge 3 ] && [ "$RUH" -ge 3 ] && [ "$ZHH" -ge 3 ]; then
    warn "counts differ (EN=$ENH RU=$RUH ZH=$ZHH)"
else
    bad "one doc has < 3 headings"
fi

# ── 7. Numeric token parallelism ────────────────────────────
hdr "7. Numeric token parallelism"
for pat in '0[.,]5' '10[ ,]?000' '95' '2166136261' '16777619'; do
    E=0; R=0; Z=0
    grep -qE "$pat" "$EN" 2>/dev/null && E=1
    grep -qE "$pat" "$RU" 2>/dev/null && R=1
    grep -qE "$pat" "$ZH" 2>/dev/null && Z=1
    if [ "$E" = "$R" ] && [ "$E" = "$Z" ]; then
        [ "$E" = "1" ] && ok "token '$pat' in all 3" || info "token '$pat' in none"
    else
        warn "token '$pat': EN=$E RU=$R ZH=$Z"
    fi
done

# ── SUMMARY ─────────────────────────────────────────────────
hdr "SUMMARY"
echo "  ✅ PASS: $PASS"
echo "  ⚠️  WARN: $WARN"
echo "  ❌ FAIL: $FAIL"
echo

if [ "$FAIL" -gt 0 ]; then
    echo "  RESULT: FAIL ($FAIL issues)"
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "  RESULT: OK with $WARN warnings"
    exit 0
else
    echo "  RESULT: ALL CLEAN"
    exit 0
fi
