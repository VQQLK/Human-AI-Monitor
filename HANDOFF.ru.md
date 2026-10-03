# Human-AI Monitor — Handoff

> Документация для инженера, продолжающего работу.
> Последнее обновление: 2026-10-03 (после ре-классификации).
> Языки: [English](HANDOFF.md) | [Русский](HANDOFF.ru.md)

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
- **Классификация items:** 448/448 используют prompt v1 (один инструмент, консистентно)
- **Эксперимент с ре-классификацией:** попытка 2026-10-03, затем **откат** (см. §12)

## 4. Известные проблемы (по приоритету)

### 🔴 Эксперимент с ре-классификацией — ОТКЛОНЁН (откачен)
- См. §12 для полного разбора. Кратко:
  - 2026-10-03: 292/448 items были ре-классифицированы с prompt v2 (037942d)
  - В тот же день: решение отменено на методологических основаниях
    (смешение данных, нарушение exchangeability, time confound,
    отсутствие provenance)
  - Откат подтверждён: 448/448 items восстановлены, 0 mismatches
  - Никаких повторных ре-классификаций до выполнения протокола §14
- Backup сохранён для анализа: /tmp/reclass_backup/

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

## 12. Отклонённый эксперимент: ре-классификация (2026-10-03)

**Статус: попытка сделана, откачена. Не повторять без протокола §14.**

### Что было предпринято
Заменить LLM-классификацию 448 items через обновлённый промпт (037942d),
который сузил определения `itq` и `geopolitics`. 292 items были обработаны
до того, как квота Cloudflare AI (4006) остановила прогон.

### Почему отклонено
Строгая методологическая проверка выявила несколько независимых провалов:

1. **Смешение данных / нарушение exchangeability.** 292 items измерены
   инструментом M2, 156 — M1, смешаны в одной колонке `axes`.
   Байесовский posterior предполагает обменные наблюдения; смесь двух
   инструментов нарушает это и смещает posterior mean, а также раздувает
   CI через меж-инструментальную дисперсию, которая не моделируется.

2. **Time confound.** Items обрабатывались в хронологическом порядке —
   ранние items → M2, поздние → M1. Любой реальный временной тренд в
   событиях мира теперь смешан с распределением инструментов.

3. **Отсутствие provenance.** Нет колонки `prompt_version`. Потребители
   не могут отличить, каким инструментом измерен каждый item.

4. **Невалидированное «улучшение».** Утверждение «47.6% per-item
   изменений = улучшение» — логическая ошибка: путаница равномерности
   с валидностью. Нет Cohen's kappa, нет criterion validity, нет
   test-retest. Случайный классификатор тоже даёт равномерное
   распределение.

5. **Нарушение нашего же принципа §13.** «Публиковать только после
   валидации» не было применено к изменению самого инструмента
   измерения.

### Что было сделано
- Rollback SQL сгенерирован из `items_before.json` (backup до изменения)
- 448 UPDATE-запросов применены к D1
- Верификация: `Match: 448 / 448`, `Mismatch: 0` — `ROLLBACK VERIFIED`
- Распределение осей восстановлено к состоянию до эксперимента:
  `[]=94, itq=70, h6_democracy=51, geopolitics=47, verification=46, ...`

### Что НЕ было сделано
- Поля `temporal_status` и `event_date` не были в исходном SELECT
  pre-change, поэтому эти колонки не откачены. Это известная мелкая
  несогласованность — вероятно безвредная (для большинства items
  эти поля в v1 отсутствовали), но должна быть проверена при
  повторной попытке.

### Backup сохранён (не удалять)
    /tmp/reclass_backup/
      items_before.json               — 448 items (состояние до эксперимента)
      items_new.json                  — 292 items (сырые ответы v2)
      updates.sql                     — 292 forward UPDATE (не применены)
      rollback.sql                    — 448 reverse UPDATE (применены)
      progress.json                   — статус по hash
      items_current_before_rollback.json — состояние на момент отката
      gap_history_before.json
      index_history_before.json

### Правильные следующие шаги (отложены)
1. Валидировать prompt v2 на **hold-out выборке** с человеческой разметкой:
   - 30 items, слепое кодирование, 2 разметчика
   - Cohen's kappa vs человек, test-retest на тех же items
2. Только если валидация пройдена: ввести `axes_v2` как **отдельную
   колонку** (никогда не перезаписывать `axes`), заполнить через
   версионированный скрипт
3. Обновить `gap-computation.ts` — читать из одной явно названной колонки
4. Preregister переключение (обновление methodology.md + bump версии)

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


---

## 14. Протокол изменения инструмента измерения

Любое изменение LLM-промптов, порождающих `axes`, `relevance`, `shift`,
`direction` или `reasoning`, является **изменением инструмента измерения**.
Это не рефакторинг кода. Оно должно следовать этому протоколу.

### Правила

1. **Никогда не перезаписывать существующую колонку измерения.**
   `axes` (v1) остаётся нетронутой. Новый инструмент пишет в `axes_v2`.
   То же для любой другой производной колонки.

2. **Записывать provenance для каждого item.**
   Добавить (или переиспользовать) колонки: `classified_by`
   (например, `"prompt_v1"`), `classified_at` (ISO timestamp).
   Устанавливать в момент классификации.

3. **Валидировать до переключения.**
   Обязательно, всё на hold-out выборке не менее 30 items:
   - **Test-retest reliability**: тот же промпт, два запуска, Cohen's kappa ≥ 0.8
   - **Inter-rater agreement**: промпт vs человеческий разметчик, kappa ≥ 0.6
   - **Criterion validity**: если возможно, корреляция с внешним ground truth
   - **Convergent validity**: корреляция со структурно похожими осями

4. **Preregister переключение.**
   Обновить `docs/methodology.md` (все 3 языковые версии) с:
   - ID новой версии промпта
   - Датой переключения
   - Результатами валидации (kappa, размеры выборок)
   - Обоснованием и ожидаемым эффектом

5. **Backfill атомарно, не инкрементально.**
   Либо все items мигрируют в новую колонку, либо ни один.
   Избегает временных confound-ов и половинчатых состояний миграции.

6. **Переключать reader, а не данные.**
   `gap-computation.ts` читает из одной явно названной колонки
   (`axes` → `axes_v2` в одном коммите). Откат = revert этого коммита.

### Anti-patterns (не делать)

- Перезаписывать `axes` выводом нового промпта (что было сделано 2026-10-03)
- Обрабатывать items в хронологическом порядке без стратификации
- Утверждать улучшение только по сдвигу распределения
- Ре-классифицировать «по ходу дела», когда квота или rate limit прерывают
- Применять изменения без backup + верифицированного пути отката

### Enforcement

- Любой PR, изменяющий `src/config/prompts.ts`, должен ссылаться на эту секцию
- Любая DB-миграция, затрагивающая `axes` (или преемников),
  должна следовать этому протоколу
- Скрипт аудита (`scripts/audit.sh`) может в будущем проверять наличие колонок
