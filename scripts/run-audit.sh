#!/usr/bin/env bash
# Launcher для scripts/audit.sh
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
AUDIT="$PROJECT_DIR/scripts/audit.sh"

TS="$(date +%Y%m%d_%H%M%S)"
LOG="/tmp/audit_$TS.log"

cd "$PROJECT_DIR" || exit 2

echo "═══════════════════════════════════════════════════════════"
echo "  ЗАПУСК АУДИТА (v5.2)"
echo "═══════════════════════════════════════════════════════════"

echo "── 1. Проверка синтаксиса ──"
if bash -n "$AUDIT"; then
    echo "  ✅ Синтаксис корректен"
else
    echo "  ❌ Ошибка синтаксиса в $AUDIT"
    exit 2
fi

echo ""
echo "── 2. Запуск полного аудита (лог: $LOG) ──"
bash "$AUDIT" 2>&1 | tee "$LOG"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ИТОГ"
echo "═══════════════════════════════════════════════════════════"
grep -E "Всего проверок:|PASS:|WARN:|FAIL:|RESULT:" "$LOG" | tail -5

if grep -q "RESULT:.*FAIL" "$LOG"; then 
    echo "❌ Аудит завершился с ошибками. Проверьте лог: $LOG"
    exit 1
fi

echo "✅ Аудит успешно пройден!"
exit 0
