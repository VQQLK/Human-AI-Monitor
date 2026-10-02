#!/bin/bash
# ============================================================
# ПОЛНЫЙ АУДИТ ПРОЕКТА HUMAN-AI MONITOR
# Версия скрипта: 3.2 (fix for bash 3.2 + all false positives)
# Дата: 2 октября 2026
# ============================================================

# Явно используем bash, а не zsh
if [ -z "$BASH_VERSION" ]; then
    exec bash "$0" "$@"
fi

set -uo pipefail

PASS=0
WARN=0
FAIL=0

hdr() { echo; echo "═══════════════════════════════════════════════════════════"; echo "  $1"; echo "═══════════════════════════════════════════════════════════"; }
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

# Безопасный grep -c: возвращает чистое число
safe_grep_count() {
    local pattern="$1"
    local file="$2"
    local result
    result=$(grep -c "$pattern" "$file" 2>/dev/null) || result="0"
    echo "$result" | tr -d '[:space:]' | sed 's/[^0-9]//g'
}

# Безопасный grep -cF (fixed string)
safe_grep_count_fixed() {
    local pattern="$1"
    local file="$2"
    local result
    result=$(grep -cF "$pattern" "$file" 2>/dev/null) || result="0"
    echo "$result" | tr -d '[:space:]' | sed 's/[^0-9]//g'
}

echo "═══════════════════════════════════════════════════════════"
echo "  ПОЛНЫЙ АУДИТ ПРОЕКТА — $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "  Версия скрипта: 3.2 (bash 3.2 compatible)"
echo "═══════════════════════════════════════════════════════════"

# ============================================================
# ФАЗА 1: СОСТОЯНИЕ GIT
# ============================================================
hdr "ФАЗА 1: СОСТОЯНИЕ GIT"

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "")

if [ -n "$REMOTE" ] && [ "$LOCAL" = "$REMOTE" ]; then
    ok "HEAD синхронизирован с origin/main"
elif [ -z "$REMOTE" ]; then
    warn "origin/main не найден"
else
    fail "HEAD НЕ синхронизирован с origin/main"
fi

STATUS=$(git status --short 2>/dev/null)
if [ -z "$STATUS" ]; then
    ok "Worktree чистый"
else
    fail "Worktree содержит незакоммиченные изменения:"
    echo "$STATUS" | sed 's/^/     /'
fi

# ============================================================
# ФАЗА 2: ТЕСТЫ КОДА
# ============================================================
hdr "ФАЗА 2: ТЕСТЫ КОДА"

if npx tsc --noEmit > /tmp/tsc_out.txt 2>&1; then
    ok "TSC: все типы корректны"
else
    fail "TSC: найдены ошибки типов"
fi

VITEST_OUT=$(npx vitest run 2>&1)
VITEST_EXIT=$?
if [ $VITEST_EXIT -eq 0 ]; then
    TEST_COUNT=$(echo "$VITEST_OUT" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' | head -1)
    TEST_COUNT=${TEST_COUNT:-0}
    ok "Vitest: $TEST_COUNT тестов пройдено"
else
    fail "Vitest: тесты не пройдены"
fi

if [ -f "src/config/weights.ts" ]; then
    ok "src/config/weights.ts существует"
    grep -q "smd: 0.20" src/config/weights.ts && ok "AI_WEIGHTS: smd = 0.20" || fail "AI_WEIGHTS: smd НЕ 0.20"
    grep -q "h1_agency: 0.20" src/config/weights.ts && ok "HUMAN_WEIGHTS: h1_agency = 0.20" || fail "HUMAN_WEIGHTS: h1_agency НЕ 0.20"
else
    fail "src/config/weights.ts отсутствует"
fi

# ============================================================
# ФАЗА 3: ДОКУМЕНТАЦИЯ — ВЕРСИИ И ДАТЫ
# ============================================================
hdr "ФАЗА 3: ДОКУМЕНТАЦИЯ — ВЕРСИИ И ДАТЫ"

check_version() {
    local file=$1
    local expected_version=$2
    local expected_date=$3
    if [ ! -f "$file" ]; then
        fail "$file: отсутствует"
        return
    fi
    if grep -qF "$expected_version" "$file"; then
        ok "$file: версия $expected_version"
    else
        fail "$file: версия НЕ $expected_version"
    fi
    if grep -qF "$expected_date" "$file"; then
        ok "$file: дата корректна"
    else
        fail "$file: дата НЕ корректна"
    fi
}

check_version "docs/methodology.md" "1.0.2" "September 29, 2026"
check_version "docs/methodology.ru.md" "1.0.2" "29 сентября 2026"
check_version "docs/methodology.zh.md" "1.0.2" "2026年9月29日"
check_version "docs/architecture.md" "1.0.2" "September 29, 2026"
check_version "docs/architecture.ru.md" "1.0.2" "29 сентября 2026"
check_version "docs/architecture.zh.md" "1.0.2" "2026年9月29日"

# ============================================================
# ФАЗА 4: КОЛИЧЕСТВО ОСЕЙ (ИСПРАВЛЕНО: ищем ВСЕ варианты)
# ============================================================
hdr "ФАЗА 4: КОЛИЧЕСТВО ОСЕЙ (13 (12+1))"

check_axes() {
    local file=$1
    if [ ! -f "$file" ]; then
        fail "$file: отсутствует"
        return
    fi
    
    local count=0
    # EN
    local c1=$(safe_grep_count_fixed "13 axes (12+1)" "$file")
    count=$((count + c1))
    # RU
    local c2=$(safe_grep_count_fixed "13 осей (12+1)" "$file")
    count=$((count + c2))
    # ZH: ОБА варианта - с пробелом и без
    local c3=$(safe_grep_count_fixed "13个轴" "$file")
    count=$((count + c3))
    local c4=$(safe_grep_count_fixed "13 个轴" "$file")
    count=$((count + c4))
    
    if [ "$count" -gt 0 ]; then
        ok "$file: найдено $count упоминание(й) '13 (12+1)'"
    else
        warn "$file: упоминание не найдено"
    fi
}

echo "── methodology ──"
check_axes "docs/methodology.md"
check_axes "docs/methodology.ru.md"
check_axes "docs/methodology.zh.md"

echo
echo "── architecture ──"
check_axes "docs/architecture.md"
check_axes "docs/architecture.ru.md"
check_axes "docs/architecture.zh.md"

# ============================================================
# ФАЗА 5: ГРАНИЦЫ ИНТЕРПРЕТАЦИИ
# ============================================================
hdr "ФАЗА 5: ГРАНИЦЫ ИНТЕРПРЕТАЦИИ (0.3)"

for f in docs/methodology.md docs/methodology.ru.md docs/methodology.zh.md; do
    if grep -qE "G\\s*>\\s*0\\.3|G > 0\\.3" "$f"; then
        ok "$f: граница 0.3"
    else
        fail "$f: граница 0.3 НЕ найдена"
    fi
done

if grep -q "mean > 0.3" src/services/bayesian-gap.ts; then
    ok "Код: граница 0.3"
else
    fail "Код: граница 0.3 НЕ найдена"
fi

if grep -q "mean < -0.3" src/services/bayesian-gap.ts; then
    ok "Код: граница -0.3"
else
    fail "Код: граница -0.3 НЕ найдена"
fi

# ============================================================
# ФАЗА 6: ВЕСА ОСЕЙ
# ============================================================
hdr "ФАЗА 6: ВЕСА ОСЕЙ"

for f in docs/methodology.md docs/methodology.ru.md docs/methodology.zh.md; do
    if grep -qE "SMD.*0\\.20|smd.*0\\.20" "$f"; then
        ok "$f: вес SMD: 0.20"
    else
        fail "$f: вес SMD НЕ найден"
    fi
    if grep -qE "hexad.*0\\.10|Hexad.*0\\.10" "$f"; then
        ok "$f: вес Hexad: 0.10"
    else
        fail "$f: вес Hexad НЕ найден"
    fi
done

# ============================================================
# ФАЗА 7: ТАБЛИЦА ИНТЕРПРЕТАЦИИ
# ============================================================
hdr "ФАЗА 7: ТАБЛИЦА ИНТЕРПРЕТАЦИИ"

for f in docs/methodology.md docs/methodology.ru.md docs/methodology.zh.md; do
    if grep -qE "Symmetric development|Симметричное развитие|对称发展" "$f"; then
        ok "$f: строка симметричного развития найдена"
    else
        warn "$f: строка симметричного развития не найдена"
    fi
done

# ============================================================
# ФАЗА 8: УСТАРЕВШИЕ КОМПОНЕНТЫ
# ============================================================
hdr "ФАЗА 8: УСТАРЕВШИЕ КОМПОНЕНТЫ"

for pattern in "Ollama" "R2" "Queues"; do
    total=0
    for file in docs/architecture.md docs/architecture.ru.md docs/architecture.zh.md docs/methodology.md docs/methodology.ru.md docs/methodology.zh.md; do
        if [ -f "$file" ]; then
            c=$(safe_grep_count "$pattern" "$file")
            total=$((total + c))
        fi
    done
    if [ "$total" -eq 0 ]; then
        ok "Нет упоминаний '$pattern'"
    else
        fail "Найдено $total упоминаний '$pattern'"
    fi
done

# ============================================================
# ФАЗА 9: БЕЗОПАСНОСТЬ (ИСПРАВЛЕНО: безопасный парсинг)
# ============================================================
hdr "ФАЗА 9: БЕЗОПАСНОСТЬ"

if git check-ignore .env > /dev/null 2>&1; then
    ok ".env в .gitignore"
else
    fail ".env НЕ в .gitignore"
fi

if git check-ignore .dev.vars > /dev/null 2>&1; then
    ok ".dev.vars в .gitignore"
else
    fail ".dev.vars НЕ в .gitignore"
fi

echo
echo "── Поиск секретов в истории Git ──"
# Безопасный подсчёт
CFUT_COUNT=$(git log --all -p 2>/dev/null | grep -c "cfut_" 2>/dev/null || echo "0")
CFUT_COUNT=$(echo "$CFUT_COUNT" | tr -d '[:space:]' | sed 's/[^0-9]//g')
CFUT_COUNT=${CFUT_COUNT:-0}

if [ "$CFUT_COUNT" = "0" ]; then
    ok "cfut_ (Cloudflare tokens) не найден в истории"
else
    fail "НАЙДЕНО $CFUT_COUNT упоминаний cfut_ в истории"
fi

# Ищем sk-, исключаем ложные срабатывания
SK_REAL=$(git log --all -p 2>/dev/null | grep "sk-" \
    | grep -v "re\.compile" \
    | grep -v "sk-xxx" \
    | grep -v "sk-ant-" \
    | grep -v "sk-\[A-Za-z" \
    | grep -v "task-agent" \
    | grep -v "task-horizon" \
    | grep -v "disk->tree" \
    | grep -v "top-level" \
    | grep -v "PLACE_RE" \
    | grep -v "SEC_PATS" \
    | wc -l | tr -d '[:space:]')
SK_REAL=${SK_REAL:-0}

if [ "$SK_REAL" = "0" ]; then
    ok "sk- (OpenAI keys) не найден в истории"
else
    warn "Найдено $SK_REAL подозрительных упоминаний sk- (проверьте вручную)"
fi

# ============================================================
# ФАЗА 10: HTTP API
# ============================================================
hdr "ФАЗА 10: HTTP API"

URL="https://human-ai-monitor-collector.human-ai-monitor.workers.dev"

for path in "/" "/health" "/gap" "/protocols" "/axes-history"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$URL$path" 2>/dev/null)
    if [ "$code" = "200" ]; then
        ok "GET $path → $code"
    else
        fail "GET $path → $code"
    fi
done

echo
HEALTH=$(curl -s "$URL/health" 2>/dev/null)
if echo "$HEALTH" | grep -q '"status": "ok"'; then
    ok "health.status = ok"
else
    fail "health.status НЕ ok"
fi

if echo "$HEALTH" | grep -q '"version": "1.0.2"'; then
    ok "health.version = 1.0.2"
else
    warn "health.version НЕ 1.0.2"
fi

echo
GAP=$(curl -s "$URL/gap" 2>/dev/null)
if echo "$GAP" | grep -q '"method": "bayesian"'; then
    ok "gap.method = bayesian"
else
    warn "gap.method НЕ bayesian"
fi

if echo "$GAP" | grep -q '"gap_ci95_low"'; then
    ok "gap имеет CI95"
else
    warn "gap НЕ имеет CI95"
fi

# ============================================================
# ФАЗА 11: БАЗА ДАННЫХ (ИСПРАВЛЕНО: правильный парсинг wrangler)
# ============================================================
hdr "ФАЗА 11: БАЗА ДАННЫХ (D1)"

if command -v npx > /dev/null 2>&1; then
    echo "── Протоколы ──"
    PROTO_OUT=$(npx wrangler d1 execute human-ai-monitor-db --remote --command "SELECT COUNT(*) as count FROM protocols" 2>/dev/null)
    # Парсим таблицу: ищем число в ячейке
    PROTO_COUNT=$(echo "$PROTO_OUT" | grep -oE '│[[:space:]]*[0-9]+[[:space:]]*│' | grep -oE '[0-9]+' | head -1)
    PROTO_COUNT=${PROTO_COUNT:-0}
    if [ "$PROTO_COUNT" -ge 1 ] 2>/dev/null; then
        ok "protocols: $PROTO_COUNT записей"
    else
        warn "protocols: не удалось получить количество"
    fi
    
    echo
    echo "── Gap history ──"
    GAP_OUT=$(npx wrangler d1 execute human-ai-monitor-db --remote --command "SELECT COUNT(*) as count FROM gap_history" 2>/dev/null)
    GAP_COUNT=$(echo "$GAP_OUT" | grep -oE '│[[:space:]]*[0-9]+[[:space:]]*│' | grep -oE '[0-9]+' | head -1)
    GAP_COUNT=${GAP_COUNT:-0}
    if [ "$GAP_COUNT" -ge 1 ] 2>/dev/null; then
        ok "gap_history: $GAP_COUNT записей"
    else
        warn "gap_history: не удалось получить количество"
    fi
    
    echo
    echo "── Index history (количество осей) ──"
    AXES_OUT=$(npx wrangler d1 execute human-ai-monitor-db --remote --command "SELECT date, COUNT(*) as axes FROM index_history GROUP BY date ORDER BY date DESC LIMIT 1" 2>/dev/null)
    # Парсим: берём ВТОРОЕ число (первое - дата)
    AXES_COUNT=$(echo "$AXES_OUT" | grep -E '│[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}[[:space:]]*│[[:space:]]*[0-9]+[[:space:]]*│' | sed -E 's/.*│[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}[[:space:]]*│[[:space:]]*([0-9]+)[[:space:]]*│.*/\1/')
    AXES_COUNT=${AXES_COUNT:-0}
    if [ "$AXES_COUNT" = "13" ]; then
        ok "index_history: 13 осей за последнюю дату"
    elif [ "$AXES_COUNT" != "0" ] && [ -n "$AXES_COUNT" ]; then
        warn "index_history: $AXES_COUNT осей (ожидалось 13)"
    else
        warn "index_history: не удалось получить количество осей"
    fi
else
    warn "wrangler не найден — пропускаю проверку D1"
fi

# ============================================================
# ФАЗА 12: МАТЕМАТИКА И ФОРМУЛЫ
# ============================================================
hdr "ФАЗА 12: МАТЕМАТИКА И ФОРМУЛЫ"

if grep -q "ALPHA_0 = 0.5" src/services/bayesian-gap.ts; then
    ok "ALPHA_0 = 0.5 (Jeffreys prior)"
else
    fail "ALPHA_0 НЕ 0.5"
fi

if grep -q "BETA_0 = 0.5" src/services/bayesian-gap.ts; then
    ok "BETA_0 = 0.5 (Jeffreys prior)"
else
    fail "BETA_0 НЕ 0.5"
fi

if grep -q "DEFAULT_MC_SAMPLES = 10000" src/services/bayesian-gap.ts; then
    ok "DEFAULT_MC_SAMPLES = 10000"
else
    fail "DEFAULT_MC_SAMPLES НЕ 10000"
fi

if grep -q "export function mulberry32" src/services/bayesian-gap.ts; then
    ok "mulberry32 существует"
else
    fail "mulberry32 отсутствует"
fi

if grep -q "export function seedFromString" src/services/bayesian-gap.ts; then
    ok "seedFromString существует"
else
    fail "seedFromString отсутствует"
fi

if grep -q "export function sampleGamma" src/services/bayesian-gap.ts; then
    ok "sampleGamma существует"
else
    fail "sampleGamma отсутствует"
fi

if grep -q "export function sampleBeta" src/services/bayesian-gap.ts; then
    ok "sampleBeta существует"
else
    fail "sampleBeta отсутствует"
fi

echo
echo "── PI_TABLE ──"
for val in "+1.0" "0.5" "0.3" "0.0"; do
    if grep -qF "$val" src/services/bayesian-gap.ts; then
        ok "PI_TABLE содержит $val"
    else
        fail "PI_TABLE НЕ содержит $val"
    fi
done

if grep -q -- "-1.0" src/services/bayesian-gap.ts; then
    ok "PI_TABLE содержит -1.0"
else
    fail "PI_TABLE НЕ содержит -1.0"
fi

# ============================================================
# ФАЗА 13: CRON И АВТОМАТИЗАЦИЯ
# ============================================================
hdr "ФАЗА 13: CRON И АВТОМАТИЗАЦИЯ"

if [ -f "wrangler.jsonc" ]; then
    CRON_COUNT=0
    c1=$(safe_grep_count '"0 13' wrangler.jsonc)
    c2=$(safe_grep_count '"15 13' wrangler.jsonc)
    c3=$(safe_grep_count '"30 13' wrangler.jsonc)
    c4=$(safe_grep_count '"45 13' wrangler.jsonc)
    c5=$(safe_grep_count '"0 23' wrangler.jsonc)
    CRON_COUNT=$((c1 + c2 + c3 + c4 + c5))
    
    if [ "$CRON_COUNT" -ge 5 ]; then
        ok "Найдено $CRON_COUNT cron триггеров"
    else
        warn "Найдено только $CRON_COUNT cron триггеров (ожидалось 5)"
    fi
else
    fail "wrangler.jsonc отсутствует"
fi

# ============================================================
# ФАЗА 14: GITHUB ACTIONS
# ============================================================
hdr "ФАЗА 14: GITHUB ACTIONS"

if command -v gh > /dev/null 2>&1; then
    for workflow in "ci.yml" "docs-check.yml" "sync-protocols.yml" "translate-protocols.yml" "live-monitor.yml"; do
        CONCLUSION=$(gh run list --workflow "$workflow" --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo "")
        if [ "$CONCLUSION" = "success" ]; then
            ok "$workflow: последний запуск успешен"
        else
            warn "$workflow: последний запуск '$CONCLUSION'"
        fi
    done
else
    warn "gh CLI не найден — пропускаю проверку"
fi

# ============================================================
# ИТОГОВЫЙ РЕЗУЛЬТАТ
# ============================================================
hdr "ИТОГОВЫЙ РЕЗУЛЬТАТ"

TOTAL=$((PASS + WARN + FAIL))
echo
echo "  Всего проверок: $TOTAL"
echo "  ✅ PASS: $PASS"
echo "  ⚠️  WARN: $WARN"
echo "  ❌ FAIL: $FAIL"
echo

if [ "$FAIL" -gt 0 ]; then
    echo "  ═══════════════════════════════════════════════════════════"
    echo "  RESULT: ❌ FAIL ($FAIL критических ошибок)"
    echo "  ═══════════════════════════════════════════════════════════"
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "  ═══════════════════════════════════════════════════════════"
    echo "  RESULT: ⚠️  OK с $WARN предупреждениями"
    echo "  ═══════════════════════════════════════════════════════════"
    exit 0
else
    echo "  ═══════════════════════════════════════════════════════════"
    echo "  RESULT: 🏆 ВСЕ ЗЕЛЁНЫЕ — ПРОЕКТ ГОТОВ К ПРОДАКШНУ"
    echo "  ═══════════════════════════════════════════════════════════"
    exit 0
fi
