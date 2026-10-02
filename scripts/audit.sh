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
echo "  Версия скрипта: 4.5"
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

# ─────────────────────────────────────────────────────────
# 9.1. Защита файлов конфигурации (.gitignore)
# ─────────────────────────────────────────────────────────
echo
echo "── 9.1. Защита файлов конфигурации ──"

for gitignore_pattern in ".env" ".dev.vars" ".wrangler/" "node_modules/" ".env.local"; do
    if grep -qF "$gitignore_pattern" .gitignore 2>/dev/null; then
        ok ".gitignore: $gitignore_pattern"
    else
        warn ".gitignore: $gitignore_pattern отсутствует"
    fi
done

# ─────────────────────────────────────────────────────────
# 9.2. Секреты НЕ должны отслеживаться в Git
# ─────────────────────────────────────────────────────────
echo
echo "── 9.2. Секретные файлы не в индексе Git ──"

for secret_file in ".env" ".dev.vars" ".env.local" ".wrangler"; do
    if git ls-files --error-unmatch "$secret_file" > /dev/null 2>&1; then
        fail "Секретный файл $secret_file отслеживается в Git!"
    else
        ok "$secret_file не отслеживается в Git"
    fi
done

# ─────────────────────────────────────────────────────────
# 9.3. Поиск секретов в ТЕКУЩИХ файлах (не в истории)
# ─────────────────────────────────────────────────────────
echo
echo "── 9.3. Поиск секретов в текущих файлах ──"

# Ищем реальные секреты в текущих файлах (исключая node_modules, .git, audit скрипты)
SECRET_PATTERNS=(
    "cfut_[a-zA-Z0-9]{20,}"
    "sk-[A-Za-z0-9]{32,}"
    "sk-ant-[A-Za-z0-9_-]{20,}"
    "gh[pousr]_[A-Za-z0-9]{36,}"
    "AKIA[0-9A-Z]{16}"
    "xox[baprs]-[A-Za-z0-9-]{10,}"
    "BEGIN[[:space:]]+(RSA|OPENSSH|EC|DSA|PGP)[[:space:]]+PRIVATE[[:space:]]+KEY"
)

SECRET_NAMES=(
    "Cloudflare токен"
    "OpenAI ключ"
    "Anthropic ключ"
    "GitHub токен"
    "AWS ключ"
    "Slack токен"
    "Приватный ключ"
)

SECRETS_FOUND=0
for i in "${!SECRET_PATTERNS[@]}"; do
    pattern="${SECRET_PATTERNS[$i]}"
    name="${SECRET_NAMES[$i]}"
    
    # Ищем в текущих файлах, исключая скрипты аудита
    found=$(grep -rE "$pattern"         --exclude-dir=node_modules         --exclude-dir=.git         --exclude-dir=.wrangler         --exclude="audit.sh"         --exclude="audit_full.sh"         --exclude="security_audit.sh"         --exclude="*.bak*"         . 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$found" = "0" ]; then
        ok "Текущие файлы: $name не найден"
    else
        # Проверяем, находится ли секрет в локальных файлах (.env/.dev.vars)
        # Это нормально для разработки, если файлы в .gitignore
        in_gitignored=$(grep -rE "$pattern" .env .dev.vars .env.local 2>/dev/null | wc -l | tr -d ' ')
        in_code=$((found - in_gitignored))
        
        if [ "$in_code" -gt 0 ]; then
            fail "Текущие файлы: $in_code упоминаний '$name' В КОДЕ!"
            SECRETS_FOUND=$((SECRETS_FOUND + in_code))
        elif [ "$in_gitignored" -gt 0 ]; then
            ok "Текущие файлы: $name найден только в .env/.dev.vars (локально, безопасно)"
        else
            fail "Текущие файлы: НАЙДЕНО $found упоминаний '$name'"
            SECRETS_FOUND=$((SECRETS_FOUND + found))
        fi
    fi
done

# ─────────────────────────────────────────────────────────
# 9.4. Поиск секретов в ИСТОРИИ Git
# ─────────────────────────────────────────────────────────
echo
echo "── 9.4. Поиск секретов в истории Git ──"

# Ищем РЕАЛЬНЫЕ ключи по формату в истории коммитов
for i in "${!SECRET_PATTERNS[@]}"; do
    pattern="${SECRET_PATTERNS[$i]}"
    name="${SECRET_NAMES[$i]}"
    
    # Ищем в истории, исключая скрипты аудита и шаблоны
    found=$(git log --all -p 2>/dev/null         | grep -oE "$pattern"         | grep -v "audit"         | grep -v "example"         | grep -v "placeholder"         | sort -u         | wc -l | tr -d ' ')
    
    if [ "$found" = "0" ]; then
        ok "История: $name не найден"
    else
        fail "История: НАЙДЕНО $found реальных '$name'"
        SECRETS_FOUND=$((SECRETS_FOUND + found))
    fi
done

# ─────────────────────────────────────────────────────────
# 9.5. Проверка секретов в Cloudflare Workers Secrets
# ─────────────────────────────────────────────────────────
echo
echo "── 9.5. Секреты в Cloudflare Workers ──"

if command -v npx > /dev/null 2>&1; then
    SECRETS_LIST=$(npx wrangler secret list 2>/dev/null || echo "")
    
    if [ -z "$SECRETS_LIST" ]; then
        warn "wrangler secret list: не удалось получить список"
    else
        # Проверяем наличие критических секретов
        for secret_name in "ADMIN_SECRET_CURRENT" "ADMIN_SECRET_PREVIOUS"; do
            if echo "$SECRETS_LIST" | grep -q "$secret_name"; then
                ok "Workers Secret: $secret_name существует"
            else
                warn "Workers Secret: $secret_name отсутствует"
            fi
        done
        
        # Проверяем, что секреты не в коде
        SECRETS_IN_CODE=$(echo "$SECRETS_LIST" | wc -l | tr -d ' ')
        ok "Workers Secrets: всего $SECRETS_IN_CODE секретов"
    fi
else
    warn "wrangler не найден — пропускаю проверку Workers Secrets"
fi

# ─────────────────────────────────────────────────────────
# 9.6. Аутентификация защищённых endpoints (без токена)
# ─────────────────────────────────────────────────────────
echo
echo "── 9.6. Аутентификация защищённых endpoints ──"

URL="https://human-ai-monitor-collector.human-ai-monitor.workers.dev"

# Защищённые endpoints должны возвращать 401 без токена
for protected_path in "/classify?text=test&kind=ai" "/collect?limit=1" "/generate?week=2026-01-01" "/export-weekly"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$URL$protected_path" 2>/dev/null)
    if [ "$code" = "401" ]; then
        ok "GET $protected_path → 401 (требует токен)"
    else
        warn "GET $protected_path → $code (ожидалось 401)"
    fi
done

# ─────────────────────────────────────────────────────────
# 9.7. Аутентификация защищённых endpoints (с неверным токеном)
# ─────────────────────────────────────────────────────────
echo
echo "── 9.7. Аутентификация с неверным токеном ──"

WRONG_TOKEN="invalid_token_12345"
code=$(curl -s -o /dev/null -w "%{http_code}"     -H "Authorization: Bearer $WRONG_TOKEN"     "$URL/classify?text=test&kind=ai" 2>/dev/null)

if [ "$code" = "401" ]; then
    ok "Неверный токен → 401 (доступ отклонён)"
else
    warn "Неверный токен → $code (ожидалось 401)"
fi

# ─────────────────────────────────────────────────────────
# 9.8. Публичные endpoints (не должны требовать аутентификации)
# ─────────────────────────────────────────────────────────
echo
echo "── 9.8. Публичные endpoints доступны без токена ──"

# Публичные endpoints, которые должны возвращать 200
for public_path in "/" "/health" "/gap" "/protocols" "/axes-history"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$URL$public_path" 2>/dev/null)
    if [ "$code" = "200" ]; then
        ok "GET $public_path → 200 (публичный)"
    else
        warn "GET $public_path → $code (ожидалось 200)"
    fi
done

# /verify: без параметров возвращает 400 (валидация) — это корректное поведение
code=$(curl -s -o /dev/null -w "%{http_code}" "$URL/verify" 2>/dev/null)
if [ "$code" = "200" ] || [ "$code" = "400" ]; then
    ok "GET /verify → $code (доступен, валидирует параметры)"
else
    warn "GET /verify → $code (ожидалось 200 или 400)"
fi

# ─────────────────────────────────────────────────────────
# 9.9. HTTP Security Headers
# ─────────────────────────────────────────────────────────
echo
echo "── 9.9. HTTP Security Headers ──"

HEADERS=$(curl -s -I "$URL/health" 2>/dev/null)

# Проверяем каждый заголовок отдельно (совместимо с bash 3.2, без declare -A)
if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    ok "Security Header: X-Content-Type-Options"
else
    warn "Security Header: X-Content-Type-Options отсутствует"
fi

if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    ok "Security Header: X-Frame-Options"
else
    warn "Security Header: X-Frame-Options отсутствует"
fi

if echo "$HEADERS" | grep -qi "Referrer-Policy"; then
    ok "Security Header: Referrer-Policy"
else
    warn "Security Header: Referrer-Policy отсутствует"
fi

if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
    ok "Security Header: Strict-Transport-Security"
else
    warn "Security Header: Strict-Transport-Security отсутствует"
fi

if echo "$HEADERS" | grep -qi "Permissions-Policy"; then
    ok "Security Header: Permissions-Policy"
else
    warn "Security Header: Permissions-Policy отсутствует"
fi

# ─────────────────────────────────────────────────────────
# 9.10. Валидация входных данных
# ─────────────────────────────────────────────────────────
echo
echo "── 9.10. Валидация входных данных ──"

# Читаем токен из локальных файлов (.env или .dev.vars)
# Это позволяет протестировать валидацию, минуя аутентификацию
TOKEN=""
for token_file in ".env" ".dev.vars"; do
    if [ -f "$token_file" ]; then
        TOKEN=$(grep -E "^ADMIN_SECRET_CURRENT=" "$token_file" 2>/dev/null | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [ -n "$TOKEN" ]; then
            echo "  ℹ️  Токен загружен из $token_file"
            break
        fi
    fi
done

if [ -z "$TOKEN" ]; then
    warn "Валидация: токен не найден в .env/.dev.vars, пропускаю тест"
else
    # Пустой текст должен возвращать 400 (с токеном)
    code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$URL/classify?text=&kind=ai" 2>/dev/null)
    if [ "$code" = "400" ]; then
        ok "Валидация: пустой текст → 400"
    else
        warn "Валидация: пустой текст → $code (ожидалось 400)"
    fi

    # Текст > 1000 символов должен возвращать 400 (с токеном)
    LONG_TEXT=$(python3 -c "print('x' * 1500)")
    code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$URL/classify?text=$LONG_TEXT&kind=ai" 2>/dev/null)
    if [ "$code" = "400" ]; then
        ok "Валидация: текст > 1000 символов → 400"
    else
        warn "Валидация: текст > 1000 символов → $code (ожидалось 400)"
    fi

    # Недопустимый kind должен возвращать 400 (с токеном)
    code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$URL/classify?text=test&kind=invalid" 2>/dev/null)
    if [ "$code" = "400" ]; then
        ok "Валидация: недопустимый kind → 400"
    else
        warn "Валидация: недопустимый kind → $code (ожидалось 400)"
    fi
fi

# ─────────────────────────────────────────────────────────
# 9.11. Проверка файла .env локально
# ─────────────────────────────────────────────────────────
echo
echo "── 9.11. Локальные файлы с секретами ──"

if [ -f ".env" ]; then
    ok ".env существует локально (нормально для разработки)"
    # Проверяем права доступа
    PERMS=$(stat -f "%Lp" .env 2>/dev/null || stat -c "%a" .env 2>/dev/null || echo "unknown")
    if [ "$PERMS" = "600" ]; then
        ok ".env: права 600 (только владелец)"
    else
        warn ".env: права $PERMS (рекомендуется 600)"
    fi
else
    ok ".env отсутствует в репозитории (безопасно)"
fi

if [ -f ".dev.vars" ]; then
    ok ".dev.vars существует локально (нормально для разработки)"
    PERMS=$(stat -f "%Lp" .dev.vars 2>/dev/null || stat -c "%a" .dev.vars 2>/dev/null || echo "unknown")
    if [ "$PERMS" = "600" ]; then
        ok ".dev.vars: права 600 (только владелец)"
    else
        warn ".dev.vars: права $PERMS (рекомендуется 600)"
    fi
else
    ok ".dev.vars отсутствует в репозитории (безопасно)"
fi

# ─────────────────────────────────────────────────────────
# 9.12. Проверка .env.example (шаблон без реальных секретов)
# ─────────────────────────────────────────────────────────
echo
echo "── 9.12. Проверка .env.example ──"

if [ -f ".env.example" ]; then
    ok ".env.example существует (шаблон для разработчиков)"
    
    # Проверяем, что в шаблоне нет реальных секретов
    REAL_SECRETS=$(grep -E "^(ADMIN_SECRET|CLOUDFLARE_API_TOKEN|GITHUB_PAT)=" .env.example 2>/dev/null | grep -v "your_" | grep -v "example" | grep -v "changeme" | wc -l | tr -d ' ')
    
    if [ "$REAL_SECRETS" = "0" ]; then
        ok ".env.example: содержит только плейсхолдеры"
    else
        warn ".env.example: может содержать реальные значения"
    fi
else
    warn ".env.example отсутствует (добавьте шаблон для разработчиков)"
fi

# ─────────────────────────────────────────────────────────
# 9.13. Итог раздела 9
# ─────────────────────────────────────────────────────────
echo
echo "── 9.13. Итог проверки безопасности ──"

if [ "$SECRETS_FOUND" = "0" ]; then
    ok "Секреты не найдены ни в текущих файлах, ни в истории"
else
    fail "НАЙДЕНО $SECRETS_FOUND секретов — требуется немедленное действие!"
fi

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
# Общее количество записей за всё время
    ITEMS_TOTAL_JSON=$(npx wrangler d1 execute human-ai-monitor-db --remote --json --command "SELECT COUNT(*) as count FROM items" 2>/dev/null)
    ITEMS_TOTAL=$(echo "$ITEMS_TOTAL_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['results'][0]['count'] if d and d[0].get('results') else 0)" 2>/dev/null || echo "0")
    ITEMS_TOTAL=${ITEMS_TOTAL:-0}

    # Записи за последние 7 дней
    ITEMS_7D_JSON=$(npx wrangler d1 execute human-ai-monitor-db --remote --json --command "SELECT COUNT(*) as count FROM items WHERE collected_at >= datetime('now', '-7 days')" 2>/dev/null)
    ITEMS_7D=$(echo "$ITEMS_7D_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['results'][0]['count'] if d and d[0].get('results') else 0)" 2>/dev/null || echo "0")
    ITEMS_7D=${ITEMS_7D:-0}

    if [ "$ITEMS_TOTAL" -ge 1 ] 2>/dev/null; then
        ok "items всего: $ITEMS_TOTAL записей"
        if [ "$ITEMS_7D" -ge 1 ] 2>/dev/null; then
            ok "items (7 дней): $ITEMS_7D записей"
        else
            echo "  ℹ️  items (7 дней): 0 записей (нет новых за неделю)"
        fi
    else
        warn "items: 0 записей за всё время"
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
