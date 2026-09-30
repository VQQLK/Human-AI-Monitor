#!/usr/bin/env bash
# ============================================================
# scripts/check_rotation_due.sh  (v2 — concrete dates)
# Reports rotation status with explicit due dates.
# ============================================================
#
# State file: .secret-rotation-state (committed to repo)
#   ADMIN_SECRET_CURRENT=<iso-date>
#   ADMIN_SECRET_PREVIOUS=<iso-date>
#   GITHUB_PAT=<iso-date>
#
# Policy (days):
#   ADMIN_SECRET_*   90
#   GITHUB_PAT       90
#   CF_OAUTH         60  (if detectable)
#
# Exit codes: 0 = all ok, 1 = at least one overdue, 2 = baseline created
# ============================================================

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

STATE_FILE="$ROOT/.secret-rotation-state"
TODAY_ISO=$(date -u +%Y-%m-%d)
TODAY_EPOCH=$(date -u +%s)

POLICY_ADMIN=90
POLICY_PAT=90
POLICY_CF=60

hdr()  { echo; echo "═══════════════════════════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════════════════════════"; }
have() { command -v "$1" >/dev/null 2>&1; }

# ── date helpers ───────────────────────────────────────────
# ISO → epoch (macOS BSD date, Linux GNU date)
iso_to_epoch() {
    date -u -j -f "%Y-%m-%d" "$1" +%s 2>/dev/null \
        || date -u -d "$1" +%s 2>/dev/null
}
epoch_to_iso() {
    date -u -r "$1" +%Y-%m-%d 2>/dev/null \
        || date -u -d "@$1" +%Y-%m-%d 2>/dev/null
}
add_days() {  # ISO + N → ISO
    local ep; ep=$(iso_to_epoch "$1") || { echo "?"; return; }
    epoch_to_iso $(( ep + $2 * 86400 ))
}
days_between() {  # ISO → integer days between then and today
    local ep; ep=$(iso_to_epoch "$1") || { echo 0; return; }
    echo $(( (TODAY_EPOCH - ep) / 86400 ))
}

# ── state file ─────────────────────────────────────────────
state_get() {  # key → ISO date or empty
    [ -f "$STATE_FILE" ] || { echo ""; return; }
    grep -E "^$1=" "$STATE_FILE" 2>/dev/null | head -1 | cut -d= -f2
}
state_set() {  # key value
    local k="$1" v="$2" tmp
    tmp=$(mktemp)
    if [ -f "$STATE_FILE" ] && grep -qE "^$k=" "$STATE_FILE"; then
        sed "s|^$k=.*|$k=$v|" "$STATE_FILE" > "$tmp"
    else
        { cat "$STATE_FILE" 2>/dev/null; echo "$k=$v"; } > "$tmp"
    fi
    sort -o "$tmp" "$tmp"
    mv "$tmp" "$STATE_FILE"
}

# ── bootstrap ──────────────────────────────────────────────
bootstrap_if_needed() {
    if [ -f "$STATE_FILE" ]; then return 0; fi
    hdr "FIRST RUN — establishing baseline"
    cat <<TXT
  No state file yet. Recording TODAY ($TODAY_ISO) as the
  baseline "last rotated" date for the secrets we can't introspect.

  Subsequent runs will show explicit NEXT-DUE dates.
TXT
    echo
    read -r -p "  Proceed to create baseline? [y/N] " a
    case "$a" in y|Y|yes) ;; *) echo "  aborted"; exit 0 ;; esac

    : > "$STATE_FILE"
    state_set ADMIN_SECRET_CURRENT  "$TODAY_ISO"
    state_set ADMIN_SECRET_PREVIOUS "$TODAY_ISO"
    state_set GITHUB_PAT            "$TODAY_ISO"
    echo "  ✅ baseline written to $STATE_FILE"
    echo
    echo "  ⚠️  If any of these secrets were actually rotated at a"
    echo "      different date, edit the file manually and re-run."
    echo
    echo "  ❗ After you ACTUALLY rotate a secret, run:"
    echo "       bash scripts/check_rotation_due.sh --mark-rotated <NAME>"
    echo
}

# ── --mark-rotated ─────────────────────────────────────────
cmd_mark_rotated() {
    local name="${1:-}"
    [ -n "$name" ] || { echo "usage: $0 --mark-rotated <NAME>"; exit 2; }
    case "$name" in
        ADMIN_SECRET_CURRENT|ADMIN_SECRET_PREVIOUS|GITHUB_PAT) ;;
        *) echo "unknown name: $name"; echo "valid: ADMIN_SECRET_CURRENT | ADMIN_SECRET_PREVIOUS | GITHUB_PAT"; exit 2 ;;
    esac
    [ -f "$STATE_FILE" ] || bootstrap_if_needed
    state_set "$name" "$TODAY_ISO"
    echo "  ✅ $name = $TODAY_ISO (next due: $(add_days "$TODAY_ISO" "$POLICY_ADMIN"))"
}

# ── Phase A: Worker secrets ────────────────────────────────
check_worker_secret() {  # NAME → prints "date  next_due  age  status"
    local name="$1" policy="$2" last next age status
    last=$(state_get "$name")
    if [ -z "$last" ]; then
        printf "%-24s %-12s %-12s %-6s %s\n" "$name" "(none)" "(unknown)" "—" "baseline not set"
        return 2
    fi
    next=$(add_days "$last" "$policy")
    age=$(days_between "$last")
    if [ "$age" -ge "$policy" ]; then
        status="DUE NOW"
        rc=1
    elif [ "$age" -ge $((policy - 14)) ]; then
        status="due soon"
        rc=0
    else
        status="ok"
        rc=0
    fi
    printf "%-24s %-12s %-12s %-6s %s\n" "$name" "$last" "$next" "${age}d" "$status"
    return $rc
}

# ── Phase B: gh CLI token (separate from Worker secret) ────
check_gh_cli_token() {
    local exp exp_iso left
    if ! have gh || ! gh auth status >/dev/null 2>&1; then
        printf "%-24s %s\n" "gh CLI token" "not authenticated"
        return 0
    fi
    exp=$(gh api -i /user 2>/dev/null \
        | grep -i '^GitHub-Authentication-Token-Expiration:' \
        | sed 's/.*: *//' | tr -d '\r')
    if [ -z "$exp" ]; then
        printf "%-24s %s\n" "gh CLI token" "no expiry (classic PAT or long-lived)"
        return 0
    fi
    exp_iso=$(echo "$exp" | awk '{print $1}')
    left=$(( ( $(iso_to_epoch "$exp_iso") - TODAY_EPOCH ) / 86400 ))
    printf "%-24s expires %s (%d days left)\n" "gh CLI token" "$exp_iso" "$left"
}

# ── Phase C: Cloudflare OAuth (Keychain) ───────────────────
check_cf_oauth() {
    local out

    # Try env token first
    if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
        out=$(curl -sS -m 10 "https://api.cloudflare.com/client/v4/user/tokens/verify" \
              -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" 2>/dev/null \
              | python3 -c "
import sys,json
try:
    r=json.load(sys.stdin).get('result',{})
    print(r.get('status','?'), r.get('expires_on','') or '(no expiry)')
except Exception:
    print('?', '?')
")
        printf "%-24s %s\n" "CF_API_TOKEN(env)" "$out"
        return 0
    fi

    # Try wrangler OAuth from macOS Keychain
    if have security; then
        local oauth
        oauth=$(security find-generic-password -s "wrangler" -a "default" -w 2>/dev/null || true)
        if [ -z "$oauth" ]; then
            printf "%-24s %s\n" "CF OAuth(wrangler)" "Keychain entry not readable without prompt"
            printf "%-24s %s\n" "" "(wrangler may store under a different service name)"
        else
            local chk
            chk=$(curl -sS -m 10 "https://api.cloudflare.com/client/v4/user/tokens/verify" \
                  -H "Authorization: Bearer $oauth" 2>/dev/null \
                  | python3 -c "
import sys,json
try:
    r=json.load(sys.stdin).get('result',{})
    print(r.get('status','?'), r.get('expires_on','') or '(no expiry)')
except Exception:
    print('?', '?')
")
            printf "%-24s %s\n" "CF OAuth(wrangler)" "$chk"
        fi
        return 0
    fi

    printf "%-24s %s\n" "CF auth" "not detectable (no env token, no Keychain access)"
}

# ───────────────────────────────────────────────────────────
# MAIN
# ───────────────────────────────────────────────────────────

case "${1:-}" in
    --mark-rotated) cmd_mark_rotated "${2:-}"; exit 0 ;;
    -h|--help)
        cat <<USG
Usage:
  bash scripts/check_rotation_due.sh                  # show status
  bash scripts/check_rotation_due.sh --mark-rotated <NAME>
                                                      # record today for NAME
  Names: ADMIN_SECRET_CURRENT | ADMIN_SECRET_PREVIOUS | GITHUB_PAT

Policy:
  ADMIN_SECRET_*   90 days
  GITHUB_PAT       90 days
  CF OAuth         60 days (informational)
USG
        exit 0
        ;;
esac

bootstrap_if_needed

echo
echo "═══════════════════════════════════════════════════════════"
echo "  ROTATION STATUS — $TODAY_ISO"
echo "═══════════════════════════════════════════════════════════"
echo
printf "%-24s %-12s %-12s %-6s %s\n" "SECRET" "LAST" "NEXT DUE" "AGE" "STATUS"
printf "%-24s %-12s %-12s %-6s %s\n" "────────────────────────" "──────────" "──────────" "────" "────────────"

RC=0
check_worker_secret ADMIN_SECRET_CURRENT  90 || RC=1
check_worker_secret ADMIN_SECRET_PREVIOUS 90 || RC=1
check_worker_secret GITHUB_PAT            90 || RC=1

echo
echo "── Local / CLI (informational, not blocking) ─────────────"
check_gh_cli_token
check_cf_oauth

echo
echo "═══════════════════════════════════════════════════════════"
if [ "$RC" = "0" ]; then
    echo "  RESULT: OK — no secret overdue"
    echo
    echo "  To record an actual rotation:"
    echo "    bash scripts/check_rotation_due.sh --mark-rotated ADMIN_SECRET_CURRENT"
else
    echo "  RESULT: DUE — rotate the flagged secret(s) now"
    echo
    echo "  Rotate admin secret:"
    echo "    bash scripts/rotate_admin_secret.sh rotate"
    echo "    bash scripts/check_rotation_due.sh --mark-rotated ADMIN_SECRET_CURRENT"
    echo "    bash scripts/check_rotation_due.sh --mark-rotated ADMIN_SECRET_PREVIOUS"
fi
echo "═══════════════════════════════════════════════════════════"

exit $RC
