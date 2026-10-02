#!/bin/bash
# ============================================================
# ПОЛНЫЙ АУДИТ ПРОЕКТА HUMAN-AI MONITOR
# Версия: 3.5 (final production-ready)
# Дата: 2 октября 2026
#
# Запуск: bash scripts/audit.sh
# ============================================================

# Явно используем bash (zsh на macOS не поддерживает все конструкции)
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

# Безопасный подсчёт: grep | wc -l (всегда возвращает число)
safe_count() {
    local pattern="$1"
    local file="$2"
    local result
    result=$(grep "$pattern" "$file" 2>/dev/null | wc -l | tr -d ' ')
    echo "${result:-0}"
}

safe_count_fixed() {
    local pattern="$1"
    local file="$2"
    local result
    result=$(grep -F "$pattern" "$file" 2>/dev/null | wc -l | tr -d ' ')
    echo "${result:-0}"
}

echo "═══════════════════════════════════════════════════════════"
echo "  ПОЛНЫЙ АУДИТ ПРОЕКТА — $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "  Версия скрипта: 3.6"
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

echo
echo "── Последние 3 коммита ──"
git log --oneline -3 | sed 's/^/     /'

# ============================================================
# ФАЗА 2: ТЕСТЫ КОДА
# ============================================================
hdr "ФАЗА 2: ТЕСТЫ КОДА"

if npx tsc --noEmit > /tmp/tsc_out.txt 2>&1; then
    ok "TSC: все типы корректны"
else
    fail "TSC: найдены ошибки типов"
    head -5 /tmp/tsc_out.txt | sed 's/^/     /'
fi

VITEST_OUT=$(npx vitest run 2>&1)
VITEST_EXIT=$?
if [ $VITEST_EXIT -eq 0 ]; then
    TEST_COUNT=$(echo "$VITEST_OUT" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' | head -1)
    TEST_COUNT=${TEST_COUNT:-0}
    ok "Vitest: $TEST_COUNT тестов пройдено"
else
    fail "Vitest: тесты не пройдены"
    echo "$VITEST_OUT" | tail -10 | sed 's/^/     /'
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
# ФАЗА 4: КОЛИЧЕСТВО ОСЕЙ
# ============================================================
hdr "ФАЗА 4: КОЛИЧЕСТВО ОСЕЙ (13 (12+1))"

check_axes() {
    local file=$1
    if [ ! -f "$file" ]; then
        fail "$file: отсутствует"
        return
    fi
    
    local count=0
    local c1=$(safe_count_fixed "13 axes (12+1)" "$file")
    count=$((count + c1))
    local c2=$(safe_count_fixed "13 осей (12+1)" "$file")
    count=$((count + c2))
    local c3=$(safe_count_fixed "13个轴" "$file")
    count=$((count + c3))
    local c4=$(safe_count_fixed "13 个轴" "$file")
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
    if grep -qE "G\s*>\s*0\.3|G > 0\.3" "$f"; then
        ok "$f: граница 0.3"
    else
        fail "$f: граница 0.3 НЕ найдена"
    fi
done

grep -q "mean > 0.3" src/services/bayesian-gap.ts && ok "Код: граница 0.3" || fail "Код: граница 0.3 НЕ найдена"
grep -q "mean < -0.3" src/services/bayesian-gap.ts && ok "Код: граница -0.3" || fail "Код: граница -0.3 НЕ найдена"

# ============================================================
# ФАЗА 6: ВЕСА ОСЕЙ
# ============================================================
hdr "ФАЗА 6: ВЕСА ОСЕЙ"

for f in docs/methodology.md docs/methodology.ru.md docs/methodology.zh.md; do
    grep -qE "SMD.*0\.20|smd.*0\.20" "$f" && ok "$f: вес SMD: 0.20" || fail "$f: вес SMD НЕ найден"
    grep -qE "hexad.*0\.10|Hexad.*0\.10" "$f" && ok "$f: вес Hexad: 0.10" || fail "$f: вес Hexad НЕ найден"
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
            c=$(safe_count "$pattern" "$file")
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
# ФАЗА 9: БЕЗОПАСНОСТЬ
# ============================================================
hdr "ФАЗА 9: БЕЗОПАСНОСТЬ"

git check-ignore .env > /dev/null 2>&1 && ok ".env в .gitignore" || fail ".env НЕ в .gitignore"
git check-ignore .dev.vars > /dev/null 2>&1 && ok ".dev.vars в .gitignore" || fail ".dev.vars НЕ в .gitignore"

echo
echo "── Поиск секретов в истории Git ──"
# Ищем РЕАЛЬНЫЕ токены (длинный паттерн), исключаем audit scripts
CFUT_REAL=$(git log --all -p 2>/dev/null | grep -E "cfut_[a-zA-Z0-9]{20,}"     | grep -v "audit_project.sh"     | grep -v "audit_full.sh"     | grep -v "security_audit.sh"     | grep -v "audit.sh"     | wc -l | tr -d ' ')
CFUT_REAL=${CFUT_REAL:-0}

if [ "$CFUT_REAL" = "0" ]; then
    ok "cfut_* (Cloudflare tokens) не найден в истории"
else
    fail "НАЙДЕНО $CFUT_REAL реальных токенов cfut_* в истории"
fi

# Ищем sk-*, исключаем ложные срабатывания и audit scripts
SK_REAL=$(git log --all -p 2>/dev/null | grep "sk-"     | grep -v "re\.compile"     | grep -v "sk-xxx"     | grep -v "sk-ant-"     | grep -v "sk-\[A-Za-z"     | grep -v "task-agent"     | grep -v "task-horizon"     | grep -v "disk->tree"     | grep -v "top-level"     | grep -v "PLACE_RE"     | grep -v "SEC_PATS"     | grep -v "fake|sample|redacted"     | grep -v "audit_project.sh"     | grep -v "audit_full.sh"     | grep -v "security_audit.sh"     | grep -v "audit.sh"     | wc -l | tr -d ' ')
SK_REAL=${SK_REAL:-0}

if [ "$SK_REAL" = "0" ]; then
    ok "sk-* (OpenAI keys) не найден в истории"
else
    warn "Найдено $SK_REAL подозрительных упоминаний sk-* (проверьте вручную)"
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
echo "$HEALTH" | grep -q '"status": "ok"' && ok "health.status = ok" || fail "health.status НЕ ok"
echo "$HEALTH" | grep -q '"version": "1.0.2"' && ok "health.version = 1.0.2" || warn "health.version НЕ 1.0.2"

echo
GAP=$(curl -s "$URL/gap" 2>/dev/null)
echo "$GAP" | grep -q '"method": "bayesian"' && ok "gap.method = bayesian" || warn "gap.method НЕ bayesian"
echo "$GAP" | grep -q '"gap_ci95_low"' && ok "gap имеет CI95" || warn "gap НЕ имеет CI95"

# ============================================================
# ФАЗА 11: БАЗА ДАННЫХ (D1)
# ============================================================
# ============================================================
# ФАЗА 11: БАЗА ДАННЫХ (D1) — используем --json для надёжного парсинга
# ============================================================
hdr "ФАЗА 11: БАЗА ДАННЫХ (D1)"

if command -v npx > /dev/null 2>&1; then
    echo "── Протоколы ──"
    PROTO_JSON=$(npx wrangler d1 execute human-ai-monitor-db --remote --json --command "SELECT COUNT(*) as count FROM protocols" 2>/dev/null)
    PROTO_COUNT=$(echo "$PROTO_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['results'][0]['count'] if d and d[0].get('results') else 0)" 2>/dev/null || echo "0")
    PROTO_COUNT=${PROTO_COUNT:-0}
    if [ "$PROTO_COUNT" -ge 1 ] 2>/dev/null; then
        ok "protocols: $PROTO_COUNT записей"
    else
        warn "protocols: $PROTO_COUNT записей (или не удалось получить)"
    fi
    
    echo
    echo "── Gap history ──"
    GAP_JSON=$(npx wrangler d1 execute human-ai-monitor-db --remote --json --command "SELECT COUNT(*) as count FROM gap_history" 2>/dev/null)
    GAP_COUNT=$(echo "$GAP_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['results'][0]['count'] if d and d[0].get('results') else 0)" 2>/dev/null || echo "0")
    GAP_COUNT=${GAP_COUNT:-0}
    if [ "$GAP_COUNT" -ge 1 ] 2>/dev/null; then
        ok "gap_history: $GAP_COUNT записей"
    else
        warn "gap_history: $GAP_COUNT записей (или не удалось получить)"
    fi
    
    echo
    echo "── Index history (количество осей за последнюю дату) ──"
    AXES_JSON=$(npx wrangler d1 execute human-ai-monitor-db --remote --json --command "SELECT date, COUNT(*) as axes FROM index_history GROUP BY date ORDER BY date DESC LIMIT 1" 2>/dev/null)
    AXES_COUNT=$(echo "$AXES_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['results'][0]['axes'] if d and d[0].get('results') else 0)" 2>/dev/null || echo "0")
    AXES_COUNT=${AXES_COUNT:-0}
    AXES_DATE=$(echo "$AXES_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['results'][0]['date'] if d and d[0].get('results') else 'N/A')" 2>/dev/null || echo "N/A")
    
    if [ "$AXES_COUNT" = "13" ]; then
        ok "index_history: 13 осей за $AXES_DATE"
    elif [ "$AXES_COUNT" != "0" ] && [ -n "$AXES_COUNT" ]; then
        warn "index_history: $AXES_COUNT осей за $AXES_DATE (ожидалось 13)"
    else
        warn "index_history: не удалось получить количество осей"
    fi
    
    echo
    echo "── Items за последние 7 дней ──"
    ITEMS_JSON=$(npx wrangler d1 execute human-ai-monitor-db --remote --json --command "SELECT COUNT(*) as count FROM items WHERE recorded_at >= datetime('now', '-7 days')" 2>/dev/null)
    ITEMS_COUNT=$(echo "$ITEMS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['results'][0]['count'] if d and d[0].get('results') else 0)" 2>/dev/null || echo "0")
    ITEMS_COUNT=${ITEMS_COUNT:-0}
    if [ "$ITEMS_COUNT" -ge 1 ] 2>/dev/null; then
        ok "items (7 дней): $ITEMS_COUNT записей"
    else
        warn "items (7 дней): $ITEMS_COUNT записей"
    fi
else
    warn "wrangler не найден — пропускаю проверку D1"
fi

hdr "ФАЗА 12: МАТЕМАТИКА И ФОРМУЛЫ"

grep -q "ALPHA_0 = 0.5" src/services/bayesian-gap.ts && ok "ALPHA_0 = 0.5 (Jeffreys prior)" || fail "ALPHA_0 НЕ 0.5"
grep -q "BETA_0 = 0.5" src/services/bayesian-gap.ts && ok "BETA_0 = 0.5 (Jeffreys prior)" || fail "BETA_0 НЕ 0.5"
grep -q "DEFAULT_MC_SAMPLES = 10000" src/services/bayesian-gap.ts && ok "DEFAULT_MC_SAMPLES = 10000" || fail "DEFAULT_MC_SAMPLES НЕ 10000"

grep -q "export function mulberry32" src/services/bayesian-gap.ts && ok "mulberry32 существует" || fail "mulberry32 отсутствует"
grep -q "export function seedFromString" src/services/bayesian-gap.ts && ok "seedFromString существует" || fail "seedFromString отсутствует"
grep -q "export function sampleGamma" src/services/bayesian-gap.ts && ok "sampleGamma существует" || fail "sampleGamma отсутствует"
grep -q "export function sampleBeta" src/services/bayesian-gap.ts && ok "sampleBeta существует" || fail "sampleBeta отсутствует"

echo
echo "── PI_TABLE ──"
for val in "+1.0" "0.5" "0.3" "0.0"; do
    grep -qF "$val" src/services/bayesian-gap.ts && ok "PI_TABLE содержит $val" || fail "PI_TABLE НЕ содержит $val"
done

grep -q -- "-1.0" src/services/bayesian-gap.ts && ok "PI_TABLE содержит -1.0" || fail "PI_TABLE НЕ содержит -1.0"

# ============================================================
# ФАЗА 13: CRON И АВТОМАТИЗАЦИЯ
# ============================================================
hdr "ФАЗА 13: CRON И АВТОМАТИЗАЦИЯ"

if [ -f "wrangler.jsonc" ]; then
    CRON_COUNT=0
    c1=$(safe_count '"0 13' wrangler.jsonc)
    c2=$(safe_count '"15 13' wrangler.jsonc)
    c3=$(safe_count '"30 13' wrangler.jsonc)
    c4=$(safe_count '"45 13' wrangler.jsonc)
    c5=$(safe_count '"0 23' wrangler.jsonc)
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
