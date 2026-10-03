#!/usr/bin/env bash
set -uo pipefail

DB_NAME="human-ai-monitor-db"
WORKER_NAME="human-ai-monitor-collector"
URL="https://human-ai-monitor-collector.human-ai-monitor.workers.dev"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 2

PASS=0; WARN=0; FAIL=0

ok()   { echo "  ✅ $*"; PASS=$((PASS+1)); }
warn() { echo "  ⚠️  $*"; WARN=$((WARN+1)); }
fail() { echo "  ❌ $*"; FAIL=$((FAIL+1)); }
info() { echo "  ℹ️  $*"; }

echo "═══════════════════════════════════════════════════════════════"
echo "  ПОЛНЫЙ АУДИТ ПРОЕКТА — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  Версия скрипта: 5.2"
echo "═══════════════════════════════════════════════════════════════"

# ФАЗА 1: GIT
echo; echo "══ ФАЗА 1: СОСТОЯНИЕ GIT ══"
git fetch origin --quiet 2>/dev/null || true
LOCAL_SHA=$(git rev-parse HEAD 2>/dev/null)
ORIGIN_SHA=$(git rev-parse origin/main 2>/dev/null)
if [ "$LOCAL_SHA" = "$ORIGIN_SHA" ]; then ok "HEAD синхронизирован с origin/main"
else fail "HEAD НЕ синхронизирован с origin/main"; fi

STATUS=$(git status --short 2>/dev/null)
if [ -z "$STATUS" ]; then ok "Worktree чистый"
else
    CHANGED=$(echo "$STATUS" | grep -vE 'scripts/audit\.sh$|scripts/run-audit\.sh$' || true)
    if [ -z "$CHANGED" ]; then info "Изменён только scripts/audit.sh или run-audit.sh"
    else fail "Worktree содержит незакоммиченные изменения:"; echo "$CHANGED" | sed 's/^/     /'; fi
fi

# ФАЗА 2: ТЕСТЫ
echo; echo "══ ФАЗА 2: ТЕСТЫ КОДА ══"
if npx tsc --noEmit >/dev/null 2>&1; then ok "TSC: все типы корректны"
else fail "TSC: найдены ошибки типов"; fi

if npx vitest run >/dev/null 2>&1; then ok "Vitest: все тесты пройдены"
else warn "Vitest: есть упавшие тесты"; fi

if [ -f "src/config/weights.ts" ]; then
    ok "src/config/weights.ts существует"
    grep -q "smd.*0.20\|0.20.*smd" src/config/weights.ts && ok "AI_WEIGHTS: smd = 0.20" || fail "AI_WEIGHTS: smd != 0.20"
    grep -q "h1_agency.*0.20\|0.20.*h1_agency" src/config/weights.ts && ok "HUMAN_WEIGHTS: h1_agency = 0.20" || fail "HUMAN_WEIGHTS: h1_agency != 0.20"
else fail "src/config/weights.ts отсутствует"; fi

# ФАЗА 3: ДОКУМЕНТАЦИЯ
echo; echo "══ ФАЗА 3: ДОКУМЕНТАЦИЯ ══"
for doc in docs/methodology.md docs/methodology.ru.md docs/methodology.zh.md docs/architecture.md docs/architecture.ru.md docs/architecture.zh.md; do
    if [ -f "$doc" ]; then
        grep -q "1.0.2" "$doc" && ok "$doc: версия 1.0.2" || fail "$doc: версия не 1.0.2"
        grep -q "2026" "$doc" && ok "$doc: дата 2026 года" || warn "$doc: дата не найдена"
    else fail "$doc: файл отсутствует"; fi
done

# ФАЗА 4: ОСИ
echo; echo "══ ФАЗА 4: КОЛИЧЕСТВО ОСЕЙ ══"
for doc in docs/methodology.md docs/methodology.ru.md docs/methodology.zh.md docs/architecture.md docs/architecture.ru.md docs/architecture.zh.md; do
    if [ -f "$doc" ]; then
        if grep -qE "13.*\(12\+1\)|13.*осей|13.*axes|13.*个轴" "$doc" 2>/dev/null; then
            ok "$doc: упоминание 13 осей найдено"
        else warn "$doc: не найдено упоминание 13 осей"; fi
    fi
done

# ФАЗА 5-8: ЛОГИКА
echo; echo "══ ФАЗА 5-8: ЛОГИКА И ДОКУМЕНТАЦИЯ ══"
grep -rq "0\.3" src/ 2>/dev/null && ok "Код: граница 0.3" || warn "Код: граница 0.3 не найдена"
grep -rq "SMD.*0\.20\|0\.20.*SMD" docs/ 2>/dev/null && ok "Документация: вес SMD: 0.20" || warn "Документация: вес SMD не найден"
grep -rqiE "симметричн|symmetr|对称" docs/ 2>/dev/null && ok "Документация: симметричное развитие" || warn "Документация: симметричное развитие не найдено"

for term in Ollama R2 Queues; do
    if grep -rq "$term" src/ docs/ 2>/dev/null; then warn "Найдены упоминания '$term'"
    else ok "Нет упоминаний '$term'"; fi
done

# ФАЗА 9: БЕЗОПАСНОСТЬ
echo; echo "══ ФАЗА 9: БЕЗОПАСНОСТЬ ══"
for pat in ".env" ".dev.vars" ".wrangler/" "node_modules/"; do
    grep -qF "$pat" .gitignore 2>/dev/null && ok ".gitignore: $pat" || fail ".gitignore: $pat отсутствует"
done

for f in .env .dev.vars .env.local .wrangler; do
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then fail "$f отслеживается в Git!"
    else ok "$f не отслеживается в Git"; fi
done

if grep -rqE "sk-[a-zA-Z0-9]{20,}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.wrangler --exclude="audit.sh" --exclude="run-audit.sh" 2>/dev/null; then
    fail "OpenAI ключ найден в репозитории!"
else ok "Текущие файлы: OpenAI ключ не найден"; fi

if grep -rqE "BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null; then
    fail "Приватный ключ найден в репозитории!"
else ok "Текущие файлы: Приватный ключ не найден"; fi

HIST_OPENAI=$(git log -p --all 2>/dev/null | grep -cE "sk-[a-zA-Z0-9]{20,}" || echo 0)
HIST_OPENAI=$(echo "$HIST_OPENAI" | tr -d '[:space:]')
[ "${HIST_OPENAI:-0}" -eq 0 ] && ok "История: OpenAI ключ не найден" || fail "История: OpenAI ключ найден"

echo; echo "── 9.5. Секреты в Cloudflare Workers ──"
WS_LIST=$(npx wrangler secret list --name "$WORKER_NAME" 2>/dev/null || echo "")
echo "$WS_LIST" | grep -q "ADMIN_SECRET_CURRENT" && ok "Workers Secret: ADMIN_SECRET_CURRENT существует" || warn "Workers Secret: ADMIN_SECRET_CURRENT не найден"

echo; echo "── 9.6–9.8. HTTP API проверки ──"
CURL_OPTS="-s -o /dev/null -w %{http_code} --retry 3 --retry-delay 1 --max-time 10"

for path in "/" "/health" "/gap" "/protocols" "/axes-history"; do
    CODE=$(curl $CURL_OPTS "$URL$path" 2>/dev/null || echo "000")
    [ "$CODE" = "200" ] && ok "GET $path → 200" || warn "GET $path → $CODE"
done

for path in "/classify?text=test&kind=ai" "/collect?limit=1"; do
    CODE=$(curl $CURL_OPTS "$URL$path" 2>/dev/null || echo "000")
    [ "$CODE" = "401" ] && ok "GET $path → 401 (требует токен)" || warn "GET $path → $CODE"
done

CODE=$(curl $CURL_OPTS -H "Authorization: Bearer invalid_token" "$URL/classify?text=test&kind=ai" 2>/dev/null || echo "000")
[ "$CODE" = "401" ] && ok "Неверный токен → 401" || warn "Неверный токен → $CODE"

echo; echo "── 9.10. Валидация входных данных ──"
TOKEN=$(grep -E "^ADMIN_SECRET_CURRENT=" .env 2>/dev/null | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
if [ -n "$TOKEN" ]; then
    info "Токен загружен из .env"
    CODE=$(curl $CURL_OPTS -H "Authorization: Bearer $TOKEN" "$URL/classify?text=&kind=ai" 2>/dev/null || echo "000")
    [ "$CODE" = "400" ] && ok "Валидация: пустой текст → 400" || warn "Валидация: пустой текст → $CODE"
    
    CODE=$(curl $CURL_OPTS -H "Authorization: Bearer $TOKEN" "$URL/classify?text=test&kind=invalid_kind" 2>/dev/null || echo "000")
    [ "$CODE" = "400" ] && ok "Валидация: недопустимый kind → 400" || warn "Валидация: недопустимый kind → $CODE"
else info "Токен не найден в .env"; fi

echo; echo "── 9.11. Локальные файлы ──"
for f in .env .dev.vars; do
    if [ -f "$f" ]; then
        PERMS=$(stat -f "%Lp" "$f" 2>/dev/null || stat -c "%a" "$f" 2>/dev/null || echo "?")
        [ "$PERMS" = "600" ] && ok "$f: права 600" || warn "$f: права $PERMS (рекомендуется 600)"
    fi
done

# ФАЗА 10: HTTP API И ВЕРСИИ
echo; echo "══ ФАЗА 10: HTTP API ══"
HEALTH=$(curl -s "$URL/health" 2>/dev/null)
echo "$HEALTH" | grep -q '"status": *"ok"' && ok "health.status = ok" || warn "health.status != ok"
WRK_VER=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('version',''))" 2>/dev/null || echo "")
[ -n "$WRK_VER" ] && ok "health.version = $WRK_VER" || warn "health.version не найден"

PKG_VER=$(python3 -c "import json; print(json.load(open('package.json'))['version'])" 2>/dev/null || echo "")
if [ "$PKG_VER" = "$WRK_VER" ]; then ok "package.json и воркер: версия $PKG_VER синхронизирована"
else warn "package.json: $PKG_VER, воркер: $WRK_VER — расхождение"; fi

# ФАЗА 11: БАЗА ДАННЫХ (D1)
echo; echo "══ ФАЗА 11: БАЗА ДАННЫХ (D1) ══"
D1_SCALAR() {
    npx wrangler d1 execute "$DB_NAME" --remote --json --command "$1" 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d[0]['results'][0].get(list(d[0]['results'][0].keys())[0], 0))
except: print(0)
" 2>/dev/null
}

echo "── Валидация схемы items ──"
SCHEMA_JSON=$(npx wrangler d1 execute "$DB_NAME" --remote --json --command "PRAGMA table_info(items)" 2>/dev/null)
COLS=$(echo "$SCHEMA_JSON" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(' '.join(r['name'] for r in d[0]['results']))
except: print('')
" 2>/dev/null)

for col in collected_at date event_date; do
    echo " $COLS " | grep -qw "$col" && ok "items.$col существует" || fail "items.$col отсутствует!"
done

echo "── Записи в БД ──"
P=$(D1_SCALAR "SELECT COUNT(*) as count FROM protocols")
[ "${P:-0}" -ge 1 ] && ok "protocols: $P записей" || warn "protocols: $P записей"

ITEMS_TOTAL=$(D1_SCALAR "SELECT COUNT(*) as count FROM items")
ITEMS_7D=$(D1_SCALAR "SELECT COUNT(*) as count FROM items WHERE collected_at >= datetime('now', '-7 days')")

if [ "${ITEMS_TOTAL:-0}" -ge 1 ]; then
    ok "items всего: $ITEMS_TOTAL записей"
    if [ "${ITEMS_7D:-0}" -ge 1 ]; then ok "items (7 дней): $ITEMS_7D записей"
    else warn "items (7 дней): 0 записей — сбор не работает"; fi
else warn "items: 0 записей за всё время"; fi

# ФАЗА 12-14: МАТЕМАТИКА, CRON, GITHUB ACTIONS
echo; echo "══ ФАЗА 12-14: МАТЕМАТИКА, CRON, ACTIONS ══"
grep -rq "ALPHA_0.*=.*0\.5\|0\.5.*ALPHA_0" src/ 2>/dev/null && ok "ALPHA_0 = 0.5" || warn "ALPHA_0 не найден"
grep -rq "DEFAULT_MC_SAMPLES.*=.*10000" src/ 2>/dev/null && ok "DEFAULT_MC_SAMPLES = 10000" || warn "DEFAULT_MC_SAMPLES != 10000"

CRON_COUNT=$(python3 -c "
import json, re
try:
    txt = open('wrangler.jsonc').read()
    txt = re.sub(r'//.*', '', txt)
    d = json.loads(txt)
    print(len(d.get('triggers', {}).get('crons', [])))
except: print(0)
" 2>/dev/null)
[ "${CRON_COUNT:-0}" -ge 1 ] && ok "Найдено $CRON_COUNT cron триггеров" || warn "cron триггеры не найдены"

echo "── GitHub Actions ──"
if command -v gh >/dev/null 2>&1; then
    UNPINNED=$(grep -rEn "uses:\s+[^@]+@(v[0-9]|main|master)\b" .github/workflows 2>/dev/null || true)
    [ -z "$UNPINNED" ] && ok "Все uses: привязаны к commit SHA" || warn "Найдены uses: без SHA-pinning"
    
    MISSING_PERMS=$(grep -L "permissions:" .github/workflows/*.yml 2>/dev/null || true)
    [ -z "$MISSING_PERMS" ] && ok "Все workflows имеют permissions:" || warn "Workflows без permissions:"
else info "gh CLI не установлен"; fi

# ИТОГ
echo; echo "══ ИТОГОВЫЙ РЕЗУЛЬТАТ ══"
TOTAL=$((PASS+WARN+FAIL))
echo "  Всего проверок: $TOTAL"
echo "  ✅ PASS: $PASS"
echo "  ⚠️  WARN: $WARN"
echo "  ❌ FAIL: $FAIL"
echo
if [ "$FAIL" -gt 0 ]; then echo "  RESULT: ❌ FAIL ($FAIL критических ошибок)"; EXIT_CODE=1
elif [ "$WARN" -gt 0 ]; then echo "  RESULT: ⚠️  OK с $WARN предупреждениями"; EXIT_CODE=0
else echo "  RESULT: 🏆 ВСЕ ЗЕЛЁНЫЕ — ПРОЕКТ ГОТОВ К ПРОДАКШНУ"; EXIT_CODE=0; fi
echo "═══════════════════════════════════════════════════════════════"
exit $EXIT_CODE
