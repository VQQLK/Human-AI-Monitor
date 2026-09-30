#!/usr/bin/env bash
# ============================================================
# scripts/check_project_state.sh
# Read-only project state summary. Exit 0 = clean, 1 = issue.
# ============================================================
#
# Usage:
#   bash scripts/check_project_state.sh
#   bash scripts/check_project_state.sh 2>&1 | tee /tmp/state.log
#
# Sections:
#   1. Git state (worktree, HEAD vs origin/main)
#   2. Leftover backup files (via find)
#   3. Audit scripts present
#   4. Docs present (EN/RU/ZH parallel)
#   5. Recent history
#
# Exit codes:
#   0 = no issues found
#   1 = at least one issue (dirty worktree, out of sync, missing file)
# ============================================================

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

hdr() { echo; echo "───────────────────────────────────────────────────────────"; echo "  $1"; echo "───────────────────────────────────────────────────────────"; }

ISSUES=0

echo "═══════════════════════════════════════════════════════════"
echo "  PROJECT STATE — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  repo: $ROOT"
echo "═══════════════════════════════════════════════════════════"

# ── 1. Git state ────────────────────────────────────────────
hdr "1. Git state"
STATUS=$(git status --short)
if [ -z "$STATUS" ]; then
    echo "  ✅ worktree clean"
else
    echo "  ⚠️  worktree dirty:"
    echo "$STATUS" | sed 's/^/     /'
    ISSUES=$((ISSUES+1))
fi

git fetch origin --quiet 2>/dev/null || true
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "?")
echo "  HEAD:        $LOCAL"
echo "  origin/main: $REMOTE"
if [ "$LOCAL" = "$REMOTE" ]; then
    echo "  ✅ in sync"
else
    echo "  ❌ out of sync"
    ISSUES=$((ISSUES+1))
fi

# ── 2. Leftover backup files (via find) ─────────────────────
hdr "2. Leftover backup files"
LEFTOVER=$(find . -type f \( \
    -name '*.bak' -o \
    -name '*.bak[0-9]*' -o \
    -name '*.bak-*' -o \
    -name '*.save' -o \
    -name '*.swp' -o \
    -name '*.swo' \
\) -not -path './.git/*' 2>/dev/null)

if [ -z "$LEFTOVER" ]; then
    echo "  ✅ 0 leftover backup files"
else
    echo "  ⚠️  leftover files:"
    echo "$LEFTOVER" | sed 's/^/     /'
    echo "  → remove with: find . -type f -name '*.bak-*' -delete"
fi

# ── 3. Audit scripts ────────────────────────────────────────
hdr "3. Audit scripts"
EXPECTED_SCRIPTS=(
    scripts/audit_full.sh
    scripts/security_audit.sh
    scripts/audit_docs_math.sh
    scripts/check_rotation_due.sh
)
for f in "${EXPECTED_SCRIPTS[@]}"; do
    if [ -f "$f" ]; then
        printf "  ✅ %-40s %s lines\n" "$f" "$(wc -l < "$f" | tr -d ' ')"
    else
        printf "  ❌ %-40s MISSING\n" "$f"
        ISSUES=$((ISSUES+1))
    fi
done

# ── 4. Docs (EN/RU/ZH parallel) ─────────────────────────────
hdr "4. Docs (EN/RU/ZH parallel)"
for base in methodology bayesian_framework architecture; do
    for lang in md ru.md zh.md; do
        f="docs/${base}.${lang}"
        if [ -f "$f" ]; then
            printf "  ✅ %-40s %s lines\n" "$f" "$(wc -l < "$f" | tr -d ' ')"
        else
            printf "  ❌ %-40s MISSING\n" "$f"
            ISSUES=$((ISSUES+1))
        fi
    done
done

# ── 5. Recent history ───────────────────────────────────────
hdr "5. Recent history (last 5)"
git log --oneline -5 | sed 's/^/     /'

# ── Summary ─────────────────────────────────────────────────
echo
echo "═══════════════════════════════════════════════════════════"
if [ "$ISSUES" = "0" ]; then
    echo "  RESULT: ✅ PROJECT IN CLEAN STATE"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
else
    echo "  RESULT: ⚠️  $ISSUES issue(s) found"
    echo "═══════════════════════════════════════════════════════════"
    exit 1
fi
