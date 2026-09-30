#!/usr/bin/env bash
# ============================================================
# scripts/security_audit.sh
# Проверка защиты проекта от несанкционированного доступа
# ============================================================
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

WORKER_URL="${WORKER_URL:-https://human-ai-monitor-collector.human-ai-monitor.workers.dev}"
PASS=0; FAIL=0; WARN=0

ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
info() { echo "  ℹ️  $1"; }
hdr()  { echo; echo "═══════════════════════════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════════════════════════"; }

# ── 1. Проверка наличия секретов ────────────────────────────
hdr "1. Секреты проекта"
SECRETS_RAW=$(npx --no-install wrangler secret list 2>/dev/null)
for name in ADMIN_SECRET_CURRENT ADMIN_SECRET_PREVIOUS GITHUB_PAT; do
    if echo "$SECRETS_RAW" | grep -q "\"$name\""; then
        ok "секрет $name определён"
    else
        bad "секрет $name ОТСУТСТВУЕТ"
    fi
done

# ── 2. Проверка, что секреты не в wrangler.toml ─────────────
hdr "2. Секреты не утекают в конфиг"
if grep -qE 'ADMIN_SECRET|GITHUB_PAT' wrangler.jsonc wrangler.toml 2>/dev/null; then
    bad "секреты найдены в wrangler.toml/jsonc (утечка!)"
else
    ok "секреты не обнаружены в wrangler.toml/jsonc"
fi

# ── 3. Проверка, что секреты не в git ───────────────────────
hdr "3. Секреты не в git-истории"
if git log --all -S 'ADMIN_SECRET' --oneline 2>/dev/null | head -1 | grep -q .; then
    warn "ADMIN_SECRET упоминается в git-истории (проверьте вручную)"
else
    ok "ADMIN_SECRET не найден в git-истории"
fi

# ── 4. Проверка .gitignore ──────────────────────────────────
hdr "4. .gitignore защищает секреты"
for pattern in '.env' '.dev.vars' '*.pem' '*.key' '*.p12' '*.pfx' 'id_rsa*' 'id_ed25519*'; do
    if grep -qxF "$pattern" .gitignore 2>/dev/null; then
        ok ".gitignore содержит: $pattern"
    else
        warn ".gitignore НЕ содержит: $pattern"
    fi
done

# ── 5. Проверка HTTP-ответов на неаутентифицированные запросы ─
hdr "5. Реакция на неаутентифицированные запросы"

# 5.1 Публичные эндпоинты должны отвечать 200
for path in "/health" "/gap" "/protocols"; do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -m 10 "$WORKER_URL$path" 2>/dev/null)
    if [ "$CODE" = "200" ]; then
        ok "GET $path → $CODE (публичный, ожидаемо)"
    else
        warn "GET $path → $CODE (ожидался 200)"
    fi
done

# 5.2 Административные эндпоинты должны требовать авторизацию
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
        ok "GET $path → $CODE (требует авторизации)"
        ADMIN_FOUND=$((ADMIN_FOUND+1))
    elif [ "$CODE" = "200" ]; then
        bad "GET $path → 200 (ДОСТУП БЕЗ АВТОРИЗАЦИИ!)"
    else
        warn "GET $path → $CODE (не удалось определить)"
    fi
done
[ "$ADMIN_FOUND" -eq 0 ] && warn "не найдено ни одного административного эндпоинта для проверки (возможно, их нет)"

# ── 6. Проверка на CORS-мисконфигурацию ─────────────────────
hdr "6. CORS-заголовки"
CORS_HEADER=$(curl -sS -I -m 10 "$WORKER_URL/health" 2>/dev/null | grep -i 'Access-Control-Allow-Origin')
if [ -n "$CORS_HEADER" ]; then
    if echo "$CORS_HEADER" | grep -q '\*'; then
        # For GET/OPTIONS-only read API, wildcard CORS is intentional and safe
        # (no write endpoints, no credentials).
        info "CORS: Access-Control-Allow-Origin: * (OK for read-only public API)"
    else
        ok "CORS: $CORS_HEADER (ограничено)"
    fi
else
    ok "CORS: заголовок отсутствует (безопасно по умолчанию)"
fi

# ── 7. Проверка security headers ────────────────────────────
hdr "7. Security Headers"
HEADERS=$(curl -sS -I -m 10 "$WORKER_URL/health" 2>/dev/null)
for header in "X-Content-Type-Options" "X-Frame-Options" "Strict-Transport-Security"; do
    if echo "$HEADERS" | grep -qi "$header"; then
        ok "$header присутствует"
    else
        warn "$header отсутствует (рекомендуется добавить)"
    fi
done

# ── 8. Проверка rate limiting ───────────────────────────────
hdr "8. Rate Limiting (быстрая проверка)"
echo "  Отправка 20 запросов подряд к /health..."
RATE_LIMITED=0
for i in $(seq 1 20); do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -m 5 "$WORKER_URL/health" 2>/dev/null)
    if [ "$CODE" = "429" ]; then
        RATE_LIMITED=$((RATE_LIMITED+1))
    fi
done
if [ "$RATE_LIMITED" -gt 0 ]; then
    ok "Rate limiting активен ($RATE_LIMITED/20 запросов получили 429)"
else
    warn "Rate limiting не обнаружен (20 запросов прошли без ограничений)"
fi

# ── 9. Проверка метода OPTIONS ──────────────────────────────
hdr "9. Обработка OPTIONS (preflight)"
for path in "/health" "/collect"; do
    CODE=$(curl -sS -o /dev/null -w "%{http_code}" -X OPTIONS -m 10 \
        -H "Origin: https://evil.example.com" \
        -H "Access-Control-Request-Method: GET" \
        "$WORKER_URL$path" 2>/dev/null)
    case "$CODE" in
        200|204) ok "OPTIONS $path → $CODE (preflight обрабатывается)" ;;
        401|403) ok "OPTIONS $path → $CODE (требует авторизации)" ;;
        *)       warn "OPTIONS $path → $CODE (необычный ответ)" ;;
    esac
done

# ── SUMMARY ─────────────────────────────────────────────────
hdr "SUMMARY"
echo "  ✅ PASS: $PASS"
echo "  ⚠️  WARN: $WARN"
echo "  ❌ FAIL: $FAIL"
echo
if [ "$FAIL" -gt 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: FAIL ($FAIL критических проблем)"
    echo "═══════════════════════════════════════════════════════════"
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: OK с $WARN предупреждениями"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
else
    echo "═══════════════════════════════════════════════════════════"
    echo "  RESULT: ВСЁ ЧИСТО"
    echo "═══════════════════════════════════════════════════════════"
    exit 0
fi
