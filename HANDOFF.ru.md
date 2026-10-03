# Human-AI Monitor — Handoff

> Документация для инженера, продолжающего работу.
> Последнее обновление: 2026-10-03 (после ре-классификации).

## 1. Обзор проекта

Cloudflare Worker, который:
- Собирает RSS-сигналы из 52 источников (27 AI + 25 Human)
- Классифицирует items через LLM (@cf/qwen/qwen3-30b-a3b-fp8)
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
| scripts/yaml-to-ts.mjs            | YAML → TS генератор                          |
| scripts/update_readme.py          | Обновление README из live API                |
| HANDOFF.md                        | Этот файл (английская версия)                |

## 3. Текущее состояние

- HEAD: последний коммит в main (см. git log --oneline -5)
- Baseline: 146 PASS / 1 WARN / 0 FAIL
- Источников: 52 (27 AI + 25 Human)
- Осей: 13 (6 AI + 6 Human + 1 META)
- Языки источников: en + ru (ТАСС) + zh (FT Chinese)
- Ёмкость батча: 60 (maxPerSource=2 × 5 cron)
- CF-токен: 3 права (Workers Scripts:Edit, D1:Edit, Workers Builds Config:Edit)

## 4. Известные проблемы (по приоритету)

### 🔴 Ре-классификация старых items — ЧАСТИЧНО
- Сделано: 292 / 448 items (65%)
- Per-item изменений: 47.6% (139 из 292 получили новые axes)
- Осталось: 156 items — квота Cloudflare AI (4006: daily free allocation)
- Backup: /tmp/reclass_backup/
- Продолжить: через 24ч `python3 -u /tmp/reclass.py`

### 🟢 Покрытие h1_agency, h5_meaning — ЗАКРЫТО
- Добавлены: Aeon, Psyche (h5_meaning), Oxfam, HRW (h4_equity)
- Проверить sample size в понедельник после cron

### 🟢 Не-англоязычные источники — ЗАКРЫТО
- Добавлены: ТАСС (ru), FT Chinese (zh), Al Jazeera, The Hindu (en, Global South)

### 🟢 META-ось geopolitics невидима в API
- Вычисляется (49 items, level 0.847), но не отдаётся потребителю
- **Решение:** пока НЕ добавлять в /gap (см. §13 — научный принцип)

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
        print("anchor not found"); sys.exit(1)
    c = c.replace("old", "new", 1)
    p.write_text(c, encoding='utf-8')

Всегда:
1. cp file file.bak_$(date +%Y%m%d) — backup
2. python3 -m py_compile /tmp/patch.py — проверка синтаксиса
3. python3 /tmp/patch.py — применение
4. bash -n / npx tsc --noEmit — валидация
5. npx vitest run — тесты
6. bash scripts/run-audit.sh — аудит
7. git commit + push

Если push отклонён (! [rejected]):
    git pull --rebase origin main
    git push origin main
Бот запушил README — rebase разрешит конфликт без потерь.

## 6. Быстрые команды

    # Полный аудит
    bash scripts/run-audit.sh

    # Только тесты
    npx vitest run

    # Проверка типов
    npx tsc --noEmit

    # Регенерация TS из YAML
    node scripts/yaml-to-ts.mjs

    # Проверка одного источника
    curl -sI "https://example.com/feed.xml" | head -5

    # D1 запрос
    npx wrangler d1 execute human-ai-monitor-db --remote --command "SELECT ..."

    # Live API
    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap"

## 7. Расписание cron (UTC)

| Время                       | Что                              |
| --------------------------- | -------------------------------- |
| 13:00, 13:15, 13:30, 13:45  | Дневной сбор (4 батча)           |
| 23:00                       | Вечерний сбор                    |
| 14:00 пн                    | sync-protocols.yml               |
| 08:00 сб                    | sync-protocols.yml               |

## 8. Как добавить новый источник

1. Проверить RSS: `curl -sI "<URL>" | head -5` → должен быть 200

2. Добавить блок в config/sources_ai.yaml или config/sources_human.yaml:

    - name: Название
      url: https://...
      lang: en
      tier: 1
      axes:
      - h1_agency
      note: Описание

3. `node scripts/yaml-to-ts.mjs`
4. Обновить test/index.spec.ts: sources_count = новый итог
5. `npx vitest run` + `bash scripts/run-audit.sh`
6. git commit + push

## 9. Опасные места

- D1 схема items: колонки collected_at, date, event_date.
  НЕ recorded_at, НЕ created_at (был реальный баг).
- sources_ai.yaml НЕ управляет axes — маппинг делает LLM.
- weights.ts: сумма AI и Human должна быть 1.0 (валидация при загрузке).
- prompts.ts: правки только в AI-промпт, не в Human (тесты зависят).

## 10. Что НЕ делать

- Force-push в main (линейная история важна)
- Удалять коммиты бота `chore: sync latest [skip ci]` — они несут README
- Править src/config/generated/*.ts вручную — перезаписываются yaml-to-ts.mjs
- Использовать 2>/dev/null в audit.sh — скрывает ошибки (был инцидент)
- Запускать `python3` без `-u` в pipe — вывод буферизуется, выглядит как зависание

## 11. Ссылки

- Репо: https://github.com/VQQLK/Human-AI-Monitor
- Воркер: https://human-ai-monitor-collector.human-ai-monitor.workers.dev
- D1 database: human-ai-monitor-db
- Cloudflare dashboard: https://dash.cloudflare.com

---

## 12. Журнал обновлений — 2026-10-03 (после ре-классификации)

### Что сделано
- Ре-классификация 292 / 448 items через новый промпт (037942d)
- Per-item изменений: 47.6% (139 из 292 получили новые axes)
- Применён SQL: /tmp/reclass_backup/updates.sql
- Остальные 156 items заблокированы квотой Cloudflare AI (4006: daily free allocation)

### Ключевой вывод
Агрегированное распределение осей почти не сдвинулось (изменения взаимно
компенсировались), НО per-item точность улучшилась: 47.6% items получили
более точную классификацию. Per-item delta — правильная метрика для оценки
промпта.

### Проверка в понедельник
    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap"
    # Смотреть: свежий recorded_at, новые ai_score / human_score / gap

    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/axes-history"
    # Смотреть: itq level < 0.93, geopolitics sample < 26

### Оставшиеся 156 items
Через 24 часа (квота AI восстановится):
    python3 -u /tmp/reclass.py
Продолжает с той же точки (progress.json).

### Backup-файлы
    /tmp/reclass_backup/
      items_before.json         — 448 items ДО ре-классификации
      items_new.json            — 292 новых (сырые ответы /classify)
      updates.sql               — UPDATE-запросы
      progress.json             — статус по hash
      gap_history_before.json   — snapshot до /generate
      index_history_before.json — snapshot до /generate

### Известные проблемы после ре-классификации
- 104 items с axes='[]' — LLM не нашёл подходящей оси (норма)
- geopolitics 49 items — META-ось, не влияет на gap
- itq 73 items — всё ещё много, но каждый item переклассифицирован

---

## 13. Формальные критерии фальсификации для geopolitics_score

**Статус: рабочая гипотеза, не установленная истина.**

Решение выставлять geopolitics_score как standalone observable
(не как компонент AI_score) основано на parsimony при отсутствии
валидационных данных. Оно фальсифицируемо. Следующие тесты должны быть
проведены, когда накопится достаточная история (≥ 8 недель snapshot-ов).

### Тест A — дискриминантная валидность (Campbell & Fiske, 1959)

Гипотеза H1: geopolitics — отдельный конструкт от AI capability.

    # Корреляционная матрица 13×13 по всем осям и всем неделям
    corr_matrix = compute_correlations(all_axes, all_weeks)

    # Принятие H1: |Corr(geopolitics, mean(AI_axes))| < 0.4
    # Отклонение H1: |Corr| >= 0.4 → geopolitics перекрывается с AI-латентной,
    #                нужно объединять как компонент, а не standalone

### Тест B — внешняя валидация по METR doubling time

Гипотеза H2: добавление geopolitics улучшает предсказание внешнего
ground truth для capability (серия METR doubling time).

    # METR doubling time по неделям (внешний независимый источник)
    corr_no_g   = corr(AI_score_without_geopolitics, METR_series)
    corr_with_g = corr(AI_score_with_geopolitics,    METR_series)

    # Принятие H2: corr_with_g > corr_no_g + 0.05 (статистически значимо)
    # Отклонение H2: значимого улучшения нет → geopolitics добавляет шум
    #                в AI_score, оставить standalone

### Тест C — предсказательный лаг (проверка leading indicator)

Гипотеза H3: geopolitics недели t предсказывает AI_score недели t+1.

    # Кросс-корреляция с лагом 1
    corr_lag1 = corr(theta_geopolitics[t], AI_score[t+1])

    # Если corr_lag1 > 0.5: geopolitics — leading indicator.
    #   → может оправдать включение как предиктивный терм (с лагом)
    # Если corr_lag1 < 0.3: geopolitics — contemporaneous / не предсказывает.
    #   → standalone observable подтверждён

### Матрица решений

| Тест A | Тест B | Тест C | Действие |
| ------ | ------ | ------ | -------- |
| pass   | pass   | pass   | Включить как leading компонент с лагом |
| pass   | pass   | fail   | Объединить как компонент в AI_score |
| pass   | fail   | fail   | **Оставить standalone (текущее)** |
| fail   | —      | —      | Объединить geopolitics в AI_WEIGHTS |

### Правило публикации (научная честность)

**НЕ выставлять geopolitics_score в /gap пока Tests A/B/C не пройдут.
Сейчас доступен только в /axes-history.**

Обоснование: N = 1 неделя данных. Posterior Beta(2.735, 0.5) имеет
эффективный размер выборки ≈ 2.2 — доминируется prior-ом.
CI95 = [0.372, 0.9998] покрывает почти весь [0, 1]. Публикация этого
в /gap создаст ложную точность и смешает валидированные величины
(Capability − Impact) с невалидированным экспериментальным observable.

Формула Gap остаётся: Gap = AI_score − Human_score (6 осей каждая,
сумма весов = 1.0). geopolitics выставляется как отдельная ось через
/axes-history. Продвижение в /gap требует сначала прохождения всех
трёх тестов.

Это правило операционализирует принцип научной истинности проекта:
**метрика публикуется только после её валидации.**

### До проведения тестов

- НЕ менять AI_WEIGHTS или HUMAN_WEIGHTS
- НЕ менять формулу Gap
- НЕ выставлять geopolitics_score в /gap (только /axes-history)
- Зафиксировать обоснование выше в любом PR, затрагивающем это

*Ссылки: Cronbach & Meehl (1955) construct validity; Campbell & Fiske (1959)
multitrait-multimethod matrix.*

---

*По вопросам — см. docs/methodology.md (математика Gap) и scripts/audit.sh (что проверяется).*
