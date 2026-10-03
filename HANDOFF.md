# Human-AI Monitor — Handoff

> Документация для инженера, продолжающего работу.
> Обновлено: 2026-10-03 (после ре-классификации).

## 1. Что это за проект

Cloudflare Worker:
- Собирает RSS из 52 источников (27 AI + 25 Human)
- Классифицирует через LLM (@cf/qwen/qwen3-30b-a3b-fp8)
- Считает Bayesian Gap Index: Gap = AI_score − Human_score
- API: /gap, /axes-history, /protocols, /health, /classify

Стек: TypeScript, Cloudflare Workers, D1 (SQLite), GitHub Actions, Vitest.

Деплой: push в main → workflows → sync-protocols.yml обновляет README.

## 2. Ключевые файлы

| Путь                              | Роль                                         |
| --------------------------------- | -------------------------------------------- |
| src/index.ts                      | HTTP-роутер + cron handler                   |
| src/auth.ts                       | Bearer, isProtectedPath, timingSafeEqual     |
| src/config/sources.ts             | YAML → Source[]                              |
| src/config/axes.ts                | AI_AXES (6), HUMAN_AXES (6), META_AXES (1)   |
| src/config/weights.ts             | Веса осей (сумма = 1.0, валидация)           |
| src/config/prompts.ts             | Промпты LLM (AI + Human)                     |
| src/services/gap-computation.ts   | Bayesian posterior + MC 10000                |
| src/services/bayesian-gap.ts      | Beta sampling, RNG                           |
| config/sources_ai.yaml            | 27 AI-источников                             |
| config/sources_human.yaml         | 25 Human-источников                          |
| config/axes_ai.yaml               | 6 AI-осей + META geopolitics                 |
| config/axes_human.yaml            | 6 Human-осей                                 |
| scripts/audit.sh                  | Главный аудит (v4.8, 146 проверок)           |
| scripts/run-audit.sh              | Launcher                                     |
| scripts/yaml-to-ts.mjs            | YAML → TS                                    |
| scripts/update_readme.py          | Обновление README из API                     |

## 3. Текущее состояние

- HEAD: последний коммит в main (см. git log)
- Baseline: 146 PASS / 1 WARN / 0 FAIL
- Источников: 52 (27 AI + 25 Human)
- Оси: 13 (6 AI + 6 Human + 1 META)
- Языки источников: en + ru (ТАСС) + zh (FT Chinese)
- Batch capacity: 60 (maxPerSource=2 × 5 cron)
- CF-токен: 3 права (Workers Scripts:Edit, D1:Edit, Workers Builds Config:Edit)

## 4. Известные проблемы (приоритет)

### 🔴 Ре-классификация старых items — ЧАСТИЧНО
- Сделано: 292 / 448 items (65%)
- Per-item изменений: 47.6% (139 из 292)
- Осталось: 156 items — квота Cloudflare AI (4006: daily free allocation)
- Backup: /tmp/reclass_backup/
- Продолжить: через 24ч `python3 -u /tmp/reclass.py`

### 🟢 h1_agency, h5_meaning — ЗАКРЫТО
- Добавлены: Aeon, Psyche (h5_meaning), Oxfam, HRW (h4_equity)
- Проверить sample size в понедельник после cron

### 🟢 Не-англоязычные источники — ЗАКРЫТО
- Добавлены: ТАСС (ru), FT Chinese (zh), Al Jazeera, The Hindu (en Global South)

### 🟢 META-ось geopolitics невидима в API
- Вычисляется (49 items, level 0.847), но не отдаётся потребителю
- Решение: добавить geopolitics_score в /gap

### ⚠️ Snapshot не пересчитан
- /gap и /axes-history показывают snapshot от 2026-10-02T13:46
- Пересчёт произойдёт автоматически в понедельник 14:00 UTC
  (cron sync-protocols.yml → generateProtocol: true)

## 5. Рабочие паттерны

НИКОГДА не использовать nano для больших правок — ломает юникод, теряет куски.

Использовать python-патч с проверкой anchor:

    from pathlib import Path
    import sys
    p = Path('file.txt')
    c = p.read_text(encoding='utf-8')
    if "old" not in c:
        print("❌ Не найдено"); sys.exit(1)
    c = c.replace("old", "new", 1)
    p.write_text(c, encoding='utf-8')

Всегда:
1. cp file file.bak_$(date +%Y%m%d) — backup
2. python3 -m py_compile /tmp/patch.py — синтаксис
3. python3 /tmp/patch.py — применение
4. bash -n / npx tsc --noEmit — проверка
5. npx vitest run — тесты
6. bash scripts/run-audit.sh — аудит
7. git commit + push

Если push отклонится (! [rejected]):
    git pull --rebase origin main
    git push origin main
Это значит бот запушил README — rebase справится без конфликтов.

## 6. Быстрые команды

    # Полный аудит
    bash scripts/run-audit.sh

    # Только тесты
    npx vitest run

    # Типы
    npx tsc --noEmit

    # Регенерация TS из YAML
    node scripts/yaml-to-ts.mjs

    # Проверка одного источника
    curl -sI "https://example.com/feed.xml" | head -5

    # D1 запрос
    npx wrangler d1 execute human-ai-monitor-db --remote --command "SELECT ..."

    # API
    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap"

## 7. Расписание сбора (cron UTC)

| Время                        | Что                              |
| ---------------------------- | -------------------------------- |
| 13:00, 13:15, 13:30, 13:45   | Дневной сбор (4 батча)           |
| 23:00                        | Вечерний сбор                    |
| 14:00 пн                     | sync-protocols.yml               |
| 08:00 сб                     | sync-protocols.yml               |

## 8. Как добавить новый источник

1. Проверить RSS: curl -sI "<URL>" | head -5 → должен быть 200

2. Добавить блок в config/sources_ai.yaml или config/sources_human.yaml:

    - name: Название
      url: https://...
      lang: en
      tier: 1
      axes:
      - h1_agency
      note: Описание

3. node scripts/yaml-to-ts.mjs
4. Обновить test/index.spec.ts: sources_count = новое число
5. npx vitest run + bash scripts/run-audit.sh
6. git commit + push

## 9. Опасные места

- D1 схема items: колонки collected_at, date, event_date.
  НЕ recorded_at, НЕ created_at (была такая ошибка).
- sources_ai.yaml не влияет на axes — маппинг делает LLM.
- weights.ts: сумма AI и Human должна = 1.0 (валидация при загрузке).
- prompts.ts: правки в AI-промпт, не в Human (есть тесты).

## 10. Что НЕ надо делать

- Force-push в main (история линейная, важна)
- Удалять коммиты бота chore: sync latest [skip ci] — они несут README
- Править src/config/generated/*.ts вручную — перезаписываются yaml-to-ts.mjs
- Использовать 2>/dev/null в audit.sh — маскирует ошибки
- Запускать python3 без -u в pipe — вывода не будет из-за буферизации

## 11. Ссылки

- Репо: https://github.com/VQQLK/Human-AI-Monitor
- Воркер: https://human-ai-monitor-collector.human-ai-monitor.workers.dev
- D1 database: human-ai-monitor-db
- Cloudflare dashboard: https://dash.cloudflare.com

---

## 12. Обновление 2026-10-03 (после ре-классификации)

### Что сделано
- Ре-классификация 292 из 448 items через новый промпт (037942d)
- Per-item изменений: 47.6% (139 из 292 получили новые axes)
- Применён SQL: /tmp/reclass_backup/updates.sql
- Остальные 156 — квота Cloudflare AI (4006: daily free allocation)

### Ключевой вывод
Агрегированное распределение axes почти не сдвинулось (изменения взаимно
компенсировались), НО per-item точность выросла: 47.6% items получили
более точную классификацию. Это правильная метрика для оценки промпта.

### Что проверить в понедельник
    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap"
    # Смотреть: recorded_at свежий, ai_score/human_score/gap — новые

    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/axes-history"
    # Смотреть: itq level < 0.93, geopolitics sample < 26

### Оставшиеся 156 items
Через 24 часа (квота AI восстановится):
    python3 -u /tmp/reclass.py
Скрипт продолжит с того же места (progress.json).

### Backup-файлы
    /tmp/reclass_backup/
      items_before.json         — 448 items ДО ре-классификации
      items_new.json            — 292 новых (сырые ответы /classify)
      updates.sql               — SQL для UPDATE
      progress.json             — статус по hash
      gap_history_before.json   — snapshot до /generate
      index_history_before.json — snapshot до /generate

### Известные проблемы после ре-классификации
- 104 items с axes='[]' — LLM не нашёл подходящей оси (норма)
- geopolitics 49 items — META-ось, не влияет на gap
- itq 73 items — всё ещё много, но каждый item переклассифицирован
  с новой формулировкой

---

*При вопросах — см. docs/methodology.md (математика Gap) и scripts/audit.sh (что проверяется).*
