# Human-AI Monitor — Handoff

> Документация для инженера, продолжающего работу.
> Последнее обновление: 2026-10-07.
> Языки: [English](HANDOFF.md) | [Русский](HANDOFF.ru.md)

## 1. Обзор проекта

Cloudflare Worker, который:
- Собирает RSS-сигналы из 59 источников (35 AI + 24 Human)
- Классифицирует items через LLM (@cf/qwen/qwen3-30b-a3b-fp8)
- Считает Bayesian Gap Index: Gap = Human_score − AI_score
- API: /gap, /axes-history, /protocols, /health, /classify, /voices, /backfill-voices

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
| config/sources_ai.yaml            | 35 AI-источников                             |
| config/sources_human.yaml         | 24 Human-источников                          |
| config/axes_ai.yaml               | 6 AI-осей + META geopolitics                 |
| config/axes_human.yaml            | 6 Human-осей                                 |
| scripts/audit.sh                  | Главный аудит (v4.9, 147 проверок, 15 фаз)   |
| scripts/run-audit.sh              | Launcher для audit.sh                        |
| scripts/math_verification.py      | Независимая мат-верификация (фаза 15)        |
| scripts/yaml-to-ts.mjs            | YAML → TS генератор                          |
| scripts/update_readme.py          | Обновление README из live API (вкл. ## Voices)|
| config/voices.yaml                | 62 курируемых спикеров, 7 категорий          |
| src/services/voices.ts            | extractVoice() + saveVoice()                 |
| src/config/generated/voices.ts    | Автогенерация из voices.yaml                 |
| migrations/0014_voices.sql        | D1 миграция: таблица voices                  |
| HANDOFF.ru.md                     | Этот файл (русская версия)                   |

## 3. Текущее состояние

- HEAD: последний коммит в main (см. git log --oneline -5)
- **Baseline: 149 проверок — 148 PASS / 1 WARN / 0 FAIL** (WARN = транзитное покрытие оси, напр. `hexad`; всегда проверяйте через `bash scripts/run-audit.sh`)
- Версия скрипта аудита: **v4.9** (15 фаз; фаза 15 = математическая верификация)
- Математическая верификация: **20/20 PASS** (см. §14; запускается в аудите как фаза 15)
- Источников: 60 (30 AI + 30 Human)
- Осей: 13 (6 AI + 6 Human + 1 META)
- Языки источников: en + ru (ТАСС) + zh (FT Chinese)
- Ёмкость батча за прогон: 60 (планируется: 59)
- CF-токен: 3 права (Workers Scripts:Edit, D1:Edit, Workers Builds Config:Edit)
- **Классификация items:** 603 items, классифицированы prompt v1 (без per-item version tracking)
- **Извлечение Voices:** 25 курируемых упоминаний от 62 спикеров (7 категорий; 14 AI-компаний добавлены 2026-10-17)

## 4. Известные проблемы (по приоритету)

### 🟢 Покрытие h1_agency, h5_meaning — ЗАКРЫТО
- Добавлены: Aeon, Psyche (h5_meaning), Oxfam, HRW (h4_equity)

### 🟢 Не-англоязычные источники — ЗАКРЫТО
- Добавлены: ТАСС (ru), FT Chinese (zh), Al Jazeera, The Hindu (en, Global South)

### 🟢 META-ось geopolitics невидима в API
- Вычисляется (49 items, level 0.847), но не отдаётся потребителю
- **Решение:** пока НЕ добавлять в /gap (см. §12 — научный принцип)

### 🟡 Семантический дрейф h2_sovereignty

**Дата записи:** 2026-10-05 · **Статус:** отложено до follow-up

~60% items, помеченных `h2_sovereignty`, относятся к **национальному/территориальному суверенитету** (Гонконг, Тайвань, Украина, Ирак, Иран, Окинава), а не к **когнитивному суверенитету** (критическое мышление, независимость суждений). Паттерн хронический — items до 2026-10-02 показывают тот же дрейф, а не регрессию.

**Гипотеза:** название оси доминирует над определением `critical thinking` в промпте LLM. В AI-промпте такая защита уже есть (`itq=... NOT general AI progress`, `geopolitics=... NOT general tech policy`); в Human-промпте — нет.

**Отложенное действие (по §13):** подождать ещё одну неделю для подтверждения хроничности; если подтвердится — применить протокол §13 — добавить колонку `prompt_version`, hold-out валидация (30 items, Cohen's kappa >= 0.8), добавить guard clauses по образцу AI-промпта. НЕ править по месту (см. антипаттерны §13).

**Статус протокола §13:** пока не применён — инструмент не менялся. Активируется только при подтверждении дрейфа на следующей неделе.

### 🟢 Snapshot пересчитан — RESOLVED (2026-10-05)
- /gap и /axes-history отдают первый FINAL-протокол за неделю 2026-09-28 (recorded_at 2026-10-05, gap = −0.26, AI опережает)
- Пересчёт произойдёт автоматически в понедельник 16:00 UTC
  (cron sync-protocols.yml → generateProtocol: true)

### 🟢 Пропуск перевода для Monday FINAL — ИСПРАВЛЕНО (2026-10-12)

**Симптом:** финальный протокол понедельника сохранял `content_ru`/`content_zh` от пятничного INTERIM в D1 и в архиве (в H1 маркер `(ПРОМЕЖУТОЧНЫЙ)`, items=320 вместо 335, gap=−0.338 вместо −0.364).

**Причина:** worker пропускал dispatch `translate-protocols.yml`, если `content_ru` уже существовал. В понедельник FINAL перезаписывает ту же строку `week_start`, что и Fri-Sun INTERIM — перевод устарел, но "существует".

**Исправление (коммит `aed68eb`):** skip только для non-Monday. Monday всегда диспатчит — покрывает переход INTERIM→FINAL, независимо от состояния GitHub cron.

**Проверка:** ручной re-translate для 2026-10-05 восстановил чистый H1; следующий Monday cron запишет в лог `Monday FINAL override: re-translating`.

### 🟢 Ежедневные snapshots: items_count — ИСПРАВЛЕНО (2026-10-13)

**Симптом:** `/daily-snapshots` отдавал одно и то же число items (335) для каждой точки недели, тогда как `sample_size` рос день ото дня. Таблица Daily Gap в README выглядела плоской и противоречила тренду.

**Причина:** endpoint делал `LEFT JOIN protocols p ON ds.week_start = p.week_start` и брал `p.items_count` (одно значение на неделю, зафиксированное на момент генерации) вместо значения на конкретный snapshot. Колонки `items_count` в `daily_snapshots` вообще не было.

**Исправление (коммит `d5ad561`):**
- миграция 0016 — `ALTER TABLE daily_snapshots ADD COLUMN items_count INTEGER` + backfill
- новая `countItemsUpTo(env, filterStart, filterEnd)` повторяет логику фильтра `countProtocolItems()`
- `persistDailySnapshot()` принимает `itemsCount` и пишет его; оба вызова считают `min(today, weekEnd)`
- `/daily-snapshots` читает `ds.items_count` напрямую; JOIN убран

**Семантика:** накопительное число items от `week_start` до `min(snapshot_date, week_end)`. Тот же фильтр "честного observer", что в `countProtocolItems()` (исключает `stale_forecast`; исключает `future_event` с прошедшим `event_date`).

**Проверено:** таблица Daily теперь показывает 130 → 190 → 266 → 304 → 337 по неделе 05–11/10, и 82 для первого дня текущей недели.

**Откат:** `ALTER TABLE daily_snapshots DROP COLUMN items_count;` (SQLite 3.35+, поддерживается D1).

### 🟢 Параллельный сбор items (CONCURRENCY=5) — 2026-10-15

Цикл обработки items теперь батчится через `Promise.all` (5 параллельно).
Последовательный был ~29 сек/item и превышал 15-мин cron при `maxPerSource: 10`.
Параллельный: ~10 сек/батч → ускорение 12×.

- 18 новых items: 522 сек последовательно → 43.5 сек параллельно
- 12 sources × 10 items: ~240 сек, укладывается в 15 мин cron
- Workers AI не throttled при CONCURRENCY=5
- Subrequest-бюджеты не изменились (только порядок)

### 🟡 Бюджет neurons (Free plan: 10 000/день)

- Cron (maxPerSource=10): ~3 500/день (35% лимита)
- Backfill 547 items: ~3 200
- Ручной /collect тест: ~700
- Не совмещать backfill + ручные тесты + cron в один день
- После сброса лимита edge может возвращать 4006 несколько часов

### 🟡 /backfill-topic-relevance: особенности

- `days=N` считает от сегодня, не от последнего item
- `startAfter=MIN(hash)` пропускает этот item (SQL использует `hash > startAfter`)
- Для полного покрытия: передавать пустой startAfter

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
| 15:00, 15:15, 15:30, 15:45  | Дневной сбор (4 батча)           |
| 16:00                       | Вечерний сбор + протокол         |
| 16:00 вт-вс                  | Ежедневный промежуточный протокол |
| 16:00 пн                     | Финальный протокол недели         |
| 16:00+ (worker dispatch)     | sync-protocols.yml (после генерации, ~16:00:0x) |
| 16:01+ (worker dispatch)     | translate-protocols.yml (после 60с задержки, ~16:01:0x) |
| 16:30 ежедн. (native)        | translate-protocols.yml (GitHub cron fallback) |
| 17:00 пн, 17:00 сб (native)  | sync-protocols.yml (GitHub cron fallback) |

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

- D1 схема `items`: колонки hash, title, summary, url, source, date, lang,
  axes, relevance, shift, direction, reasoning, collected_at, temporal_status,
  event_date. НЕ `recorded_at`, НЕ `created_at` (исторический баг).
  НЕ `week_start` — эта колонка только в `gap_history`, не в `items`.
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

## 12. Формальные критерии фальсификации для geopolitics_score

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

Формула Gap остаётся: Gap = Human_score − AI_score (6 осей каждая,
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

## 13. Протокол изменения инструмента измерения

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

- Перезаписывать `axes` выводом нового промпта
- Обрабатывать items в хронологическом порядке без стратификации
- Утверждать улучшение только по сдвигу распределения
- Ре-классифицировать «по ходу дела», когда квота или rate limit прерывают
- Применять изменения без backup + верифицированного пути отката

### Enforcement

- Любой PR, изменяющий `src/config/prompts.ts`, должен ссылаться на эту секцию
- Любая DB-миграция, затрагивающая `axes` (или преемников),
  должна следовать этому протоколу
- Скрипт аудита (`scripts/audit.sh`) может в будущем проверять наличие колонок


---

## 14. Математический аудит

Математическое ядро **сконструировано корректно и проверено по
рецензируемым источникам**. Раздел фиксирует подтверждённые компоненты,
явные ограничения применимости и формальные тесты для будущей валидации
по мере накопления данных.

### 14.1 Подтверждённые корректные компоненты

| Компонент | Реализация | Источник |
| --------- | ---------- | -------- |
| Gamma sampler | Marsaglia-Tsang с boost для α<1 | Marsaglia & Tsang (2000) |
| Beta sampler | отношение Γ(a)/(Γ(a)+Γ(b)) | Robert & Casella (2004) §2.3 |
| Prior | Jeffreys Beta(0.5, 0.5) | Jeffreys (1946) |
| Обновление posterior | обобщённое накопление свидетельств | Валидный pseudo-likelihood (см. 14.2.1) |
| Взвешенный MC | линейность матожидания соблюдена | Стандартная теория MC |
| Равнохвостовой CI | эмпирические квантили (не нормальная аппроксимация) | Корректно для U-образного Beta |
| Двусторонний тест значимости | CI95 не содержит 0 | Тест на байесовский credible interval |
| Валидация весов | сумма = 1.0, каждый ∈ (0, 1) | Fail-fast при загрузке модуля |

Все восемь компонентов математически корректны. Ошибок не выявлено.

### 14.2 Задокументированные ограничения

Это не дефекты. Это явные **границы применимости** текущей модели,
квантифицированные там, где это возможно.

#### 14.2.1 Меж-источниковая корреляция не моделируется

**Факты.** `betaParamsFromSignals` обрабатывает items как независимые
свидетельства. На практике items из одного источника могут быть
коррелированы. Пример: 5 статей Politico об одном законопроекте
дают 5× один и тот же сигнал.

**Математическое влияние.** Эффективный размер выборки:

    ESS_eff ≈ ESS / (1 + (n_avg − 1) · ρ)

где n_avg = средний размер кластера, ρ = меж-источниковая корреляция.

**Оценка параметров (по наблюдаемым данным):**
- itq: n_avg ≈ 5, ρ ≈ 0.15–0.25 → ESS_eff ≈ 0.55–0.70 × ESS
- Politico Tech: n_avg ≈ 4, ρ ≈ 0.3 → ESS_eff ≈ 0.6 × ESS

**Следствие.** Реальный CI ≈ номинальный CI × √(1 + (n_avg − 1)ρ).
Диапазон: в 1.2–1.4 раза шире.

**Что НЕ затронуто:**
- Posterior mean (несмещён независимо от корреляции)
- Трендовый анализ между неделями (смещение одинаково для всех недель)
- Порядок осей по величине

**Что затронуто:**
- Абсолютная ширина CI (номинальная, не точная)
- Значимость маргинальных результатов

**Для снимка от 2026-10-02 (исторический):** Gap = 0.09, CI95 = [−0.213, +0.400]. При
ρ = 0.2 реальный CI ≈ [−0.30, +0.49]. Вывод (не значимо) не меняется.
Формула остаётся валидной для её заявленного назначения.

#### 14.2.2 Множественные сравнения

**Факты.** 13 осей, каждая с `isSignificant(ci95)`. Без коррекции α = 0.05.

**FWER.** Если все 13 нулевых гипотез истинны: 1 − 0.95¹³ ≈ 0.49.

**Контекст.** Основной output — **один** тест Gap (`Gap = Human − AI`),
единая подтверждающая гипотеза. Per-axis значимость — exploratory
диагностика, не семейство подтверждающих тестов.

**Вывод.** Коррекция на множественные сравнения **не требуется** для
основного результата Gap. Per-axis p-values маркированы как exploratory.

**Если per-axis результаты когда-либо будут использоваться для решений**,
применить Bonferroni (α' = 0.05/13 ≈ 0.0038) или Benjamini-Hochberg FDR.

#### 14.2.3 PI_TABLE как экспертная оценка

**Факты.** Таблица голосов π(shift, direction) со значениями
{+1.0, +0.5, +0.3, 0.0, −0.3, −0.5, −1.0}.

**Статус.** Это экспертные оценки (того же класса, что веса осей). Они:
- Внутренне согласованы (симметрия: yes/up = −yes/down)
- Сохраняют порядок (yes > no > uncertain по силе)
- Но НЕ выведены из психометрической литературы или эмпирической калибровки

**Влияние на gap.** Систематическая ошибка масштаба в PI_TABLE
масштабирует *свидетельство*, но не *posterior mean*, если ошибка
пропорциональна по осям. Для асимметричных ошибок смещение влияет
на относительное взвешивание осей.

**Коррекция сейчас не требуется.** Калибровка возможна (Тест E, ниже),
но требует ground-truth разметки, которая пока не собрана.

### 14.3 Будущие улучшения (отложены)

Не требуются для корректности. Перечислены для будущей работы
по мере накопления данных.

1. **Иерархическая модель** — source-level random effects для явного
   моделирования корреляционной структуры. Сузит CI до истинной ширины.
2. **PCG64 или xoshiro256** — замена mulberry32; проходит BigCrush.
   Текущая реализация достаточна для M = 10000.
3. **Эмпирическая калибровка PI_TABLE** — требует ≥100 размеченных items.
4. **Кросс-источниковая агрегация** — группировка items по URL-префиксу
   для снижения дублирования (например, один пресс-релиз, разосланный
   по нескольким источникам).

Ни одно из этих изменений не меняет текущую методологию или результаты.

### 14.4 Формальные критерии фальсификации

Эти тесты следует провести после накопления достаточных данных
(≥ 4–8 недель). Каждый разработан как фальсифицируемый.

#### Тест D — меж-источниковая корреляция `[MANUAL]`

> Статус: **не автоматизирован**. Требует ≥ 4 недель данных (gate condition).
> Реализация ожидается — не полагайтесь, что он запускается в audit.sh.

**H0:** Items внутри одного источника — независимые свидетельства.

**Метод:**
    for source in sources:
        items = fetch(source, week)
        if len(items) < 3: continue
        R = correlation_matrix(items.relevance)
        avg_corr = mean(R[off_diagonal])
        report(source, avg_corr)

**Критерий отклонения:** >30% источников с avg_corr > 0.3 →
допущение модели значимо нарушено; рассмотреть иерархическую модель.

#### Тест E — калибровка PI_TABLE `[MANUAL]`

> Статус: **не автоматизирован**. Требует ≥ 100 аннотированных items
> (ручная работа). Отложено до сбора данных разметки.

**H0:** v_s = relevance · π(shift, direction) предсказывает истинный
сдвиг оси.

**Метод:**
- 100 items с экспертной разметкой (score ∈ [−1, +1])
- Линейная регрессия: expert_score ~ v_s
- Отчёт R² и slope

**Критерий отклонения:** R² < 0.3 → PI_TABLE слишком груба; нужна
эмпирическая деривация.

#### Тест F — сходимость Монте-Карло `[AUTOMATED]`

> Статус: **уже автоматизирован** в `scripts/math_verification.py` §8.
> Запускается при каждом аудите как часть фазы 15. См. §14.5 для текущего результата
> (change 10k→100k = 0.041%, порог 1%).

**H0:** M = 10000 достаточно для точности CI.

**Метод:**
- Запуск computeGapIndex с M ∈ {1000, 10000, 100000} × 10 seeds
- Отчёт распределения gap_std и ширины gap_ci95

**Критерий отклонения:** >1% изменения от M=10000 к M=100000 →
увеличить DEFAULT_MC_SAMPLES.

#### Тест G — эмпирический FWER `[REJECTED in v3]`

> Статус: **удалён из math_verification.py в v3.** Дизайн v1/v2 проверял
> per-axis CI (не Gap CI); при n=10 per-axis false-positive rate ≈ 11%,
> а не номинальные 5%. Любая будущая реализация ДОЛЖНА использовать
> Gap-based симуляцию с n ≥ 100. **Не возвращайте старый дизайн.**

**H0:** α = 0.05 для каждого per-axis теста значимости.

**Метод:**
- Симулировать 13 независимых Beta(1, 1) posterior (H0 истинна)
- Запустить isSignificant() 1000 раз
- Подсчитать false positives на ось

**Критерий отклонения:** rate > 7% (2σ выше номинала) → проверить
конструкцию теста. Ожидание: ~5%.

### 14.5 Резюме

Математическое ядро сконструировано корректно. Все методы восходят к
рецензируемым источникам. Три задокументированных ограничения —
границы применимости, не дефекты:

- Меж-источниковая корреляция влияет на ширину CI (~1.2–1.4×),
  не на точечную оценку.
- Множественные сравнения не относятся к единому подтверждающему
  тесту Gap.
- PI_TABLE — экспертная оценка; калибровка отложена.

Система пригодна для:
- Трендового анализа (недельные изменения)
- Подтверждающего теста Gap (единая гипотеза)
- Относительного сравнения осей

Абсолютные значения CI следует читать как номинальные с расширением
при корреляции. Это задокументировано, не скрыто.

**Немедленных действий не требуется. Tests D–G — для будущей валидации.**

---

## 15. Антипаттерны для сторонних инженеров

Если вы работаете с проектом впервые — прочитайте это до изменений.
Раздел адресует наиболее частые недоразумения.

### НЕ откатывайте сознательные научные решения

- **Тест G** (эмпирический FWER) — **сознательно удалён в v3**
  `math_verification.py`. Старый дизайн (per-axis CI с n=10) концептуально
  ошибочен; корректный — Gap-based с n≥100 (§14.4). Не возвращайте.

- **`geopolitics_score` в `/gap`** — **запрещено** (§12) до Tests A/B/C.
  Сейчас доступно только через `/axes-history`.

- **AI_WEIGHTS / HUMAN_WEIGHTS** — не менять без preregistered
  обновления methodology.md. Сумма должна быть ровно 1.0 (валидация
  при загрузке модуля).

### Частые технические ошибки

- **Схема `items`**: колонки `collected_at`, `date`, `event_date`.
  НЕТ `week_start` (только в `gap_history`).
  НЕТ `recorded_at`, НЕТ `created_at` (исторический баг — исправлен).

- **64-битный RNG (xoshiro256)**: требует `BigInt`; несовместим с
  `Uint32Array`. `<< 45` в JS сдвигает по модулю 32 — НЕ работает
  как задумано. Если нужен лучший RNG — используйте проверенную
  библиотеку (`pure-rand`, `seedrandom`) или реализацию на `BigInt`.

- **`sources_ai.yaml` НЕ управляет axes**: маппинг делает LLM через
  `src/config/prompts.ts`. Добавление `axes:` в YAML не влияет на
  классификацию.

- **CI success ≠ задеплоено.** `ci.yml` выполняет только
  `wrangler deploy --dry-run` — это валидация компиляции, а НЕ деплой.
  Реальный деплой — вручную: `npx wrangler deploy`. После изменений в
  `config/sources_*.yaml`, `src/config/prompts.ts` или `src/index.ts` —
  проверяйте прод через `/health` (`sources_count`, `batches_capacity`)
  и сравнивайте с локальным конфигом. Расхождение = устаревший деплой.

- **Тест F уже автоматизирован**: раздел 8 в `scripts/math_verification.py`,
  вызывается из фазы 15 в `audit.sh`. Не дублировать.


### Пробелы в информации

- **Числа baseline меняются**: они отражают последний прогон аудита, а не
  фиксированное состояние. Всегда проверяйте через
  `bash scripts/run-audit.sh`, а не по числам в этом документе.

- **Любой WARN может быть временным**: отражает состояние сразу после
  добавления новых источников, до следующего cron-сбора. Не обязательно дефект.

- **Snapshot (`/gap`) может отставать от `items`**: пересчёт происходит
  по понедельничному cron (16:00 UTC). Если `/gap` показывает старый
  `recorded_at` — это ожидаемо до следующей scheduled генерации.

### Если сомневаетесь

Запустите `bash scripts/run-audit.sh` — он включает фазу 15 (математическая
верификация) и отражает реальное состояние проекта. Не доверяйте
написанным вручную статусам без проверки.

Для фичи Voices: `curl /voices?limit=10` для проверки качества извлечения. Если счёт 0, но items есть — проверьте логику `extractVoice()`: имя должно быть в заголовке (title-only с f068120).

---

## 16. Фича Voices (автоматическое извлечение цитат)

Извлекает курируемые упоминания от 61 спикера (руководители AI-лабораторий, исследователи, инвесторы, **14 AI-компаний**; категория policy очищена 2026-10-08), когда они названы в заголовках новостей. Включает CJK frontier labs (DeepSeek, Moonshot, Qwen, Zhipu, ByteDance, MiniMax, Tencent).

### Критическая логика извлечения (НЕ МЕНЯТЬ БЕЗ ПРОВЕРКИ)

Упоминание извлекается **только если выполнены ОБА** условия:
1. `item.relevance >= 0.2` (настраивается через `min_relevance` в `config/voices.yaml`)
2. **Хотя бы одно ключевое слово** из списка `keywords` спикера встречается в `item.title` (без учёта регистра, Unicode-aware границы слов)

> ⚠️ **АНТИ-ПАТТЕРН**: *Не* реализуйте сопоставление "только по источнику" (например, приписывать статью спикеру только потому, что она из "NPR" и "NPR" есть в списке источников спикера). Это вызывает массовые ложные срабатывания. Имя/ключевое слово спикера **должно** присутствовать в заголовке. Проверено: логика "только по источнику" дала 224 ложных срабатывания против 116 корректных извлечений с логикой "имя в заголовке". Сопоставление только по summary удалено 2026-10-08 (коммит f068120) — давало ложные атрибуции типа 'AMD acquires World Labs' → Fei-Fei Li.

### Поток данных
- `config/voices.yaml` → `node scripts/yaml-to-ts.mjs` → `src/config/generated/voices.ts`
- `src/services/voices.ts:extractVoice()` вызывается в `runCollection()` после `INSERT INTO items`
  - Использует Unicode-aware границы слов: `(?<!\p{L})keyword(?!\p{L})` с флагом `/u` (коммит d7290c2). Необходимо для CJK/кириллических имён типа 梁文锋 — `\b` матчит только ASCII-границы.
- `saveVoice()` использует `INSERT OR IGNORE` с `UNIQUE(item_hash, speaker)` — идемпотентно
  - **Ловушка:** `INSERT OR IGNORE` никогда не удаляет и не перезаписывает. При удалении спикера из `config/voices.yaml` его строки в `voices` остаются до ручного `DELETE FROM voices WHERE speaker = ?`. Проверено 2026-10-08 (удаление Sacks потребовало ручной очистки).
- `GET /voices?limit=20&category=frontier_labs` — возвращает курируемые цитаты
- `GET /backfill-voices` (требуется авторизация) — ретроактивно обрабатывает все items
- `scripts/update_readme.py` рендерит раздел `## Voices` в README.md / .ru / .zh (с защитой от таймаутов)

### Перевод цитат (RU / ZH)

`GET /translate-voices?lang=ru|zh&limit=N` (требует auth, N ∈ [1, 20]) вызывает
`translateVoicesBatch()` из `src/services/translation.ts`. Берёт строки, где
`quote_ru` (или `quote_zh`) NULL/пусто, делает один LLM-вызов на батч до
20 цитат, сохраняет пронумерованные результаты.

**Структура промпта (ветка RU):**
- `NAMES` — 25 предопределённых русских транслитераций (Sam Altman → Сэм Альтман, …).
  Используется для предотвращения разнобоя в транслитерации.
- `NEWS IDIOMS` — RBC/Коммерсантъ-стиль, НЕ буквальный перевод:
  - `Inside X` → `Что стоит за X` (НЕ `Внутри X`)
  - `X slams Y` / `X hits Y` → `X критикует Y`
  - `X unveils Y` → `X представляет Y`
  - `won't go public` → `не выйдет на IPO`
  - `always-on` → `постоянно работающий`
  - `kill switch` → `аварийный выключатель`
  - `pressure of X for Y` / `pressure for X` → `давление ради X` (НЕ `за X`)
  - `Standalone surname` (Zuckerberg без имени) → `Цукерберг` из NAMES
- **Постпроцессинг:** `о → об` перед А/О/У/И/Э (regex в `cleanQuote`).
  Чинит дрейф LLM типа `соглашение о ИИ` → `соглашение об ИИ`.

**Структура промпта (ветка ZH):**
- `NEWS IDIOMS` — стиль Sina News:
  - `Inside X` → `X内幕` (НЕ `X内部`)
  - `X slams Y` / `X hits Y` → `X抨击Y`
  - `X unveils Y` → `X发布Y`
  - `won't go public` → `不上市`
  - `always-on` → `常驻`
  - `kill switch` → `紧急停止按钮`

**Процедура пере-перевода** (при изменении промпта):
1. Задеплоить воркер (`npx wrangler deploy`)
2. `UPDATE voices SET quote_ru = NULL` (или `quote_zh`)
3. `curl -H "Authorization: Bearer $ADMIN_TOKEN" /translate-voices?lang=ru&limit=20`
4. `python3 scripts/update_readme.py`
5. Коммит README × N + push

**Стоимость:** 1 LLM-вызов на язык на батч (13 voices → 2 вызова).

**Бэкап перед очисткой:** сначала выгрузить JSON —
`npx wrangler d1 execute ... --json "SELECT id, quote, quote_ru, quote_zh FROM voices" > backup.json`

### Категории
`frontier_labs`, `researchers`, `safety_philosophy`, `investors`, `crypto`, `enterprise`, `mathematics`


---

## 17. Thinking mode Qwen3 — `/no_think` (2026-10-19)

**Проблема:** `@cf/qwen/qwen3-30b-a3b-fp8` включает thinking mode по умолчанию. Измерено: ~16% вызовов упираются в `completion_tokens: 2000` (максимум, обрезан) → **63 neurons/вызов** против **~20 neurons/вызов** в норме. Thinking mode съедает весь бюджет вывода до генерации JSON — JSON обрезается или пустой.

**Исправление (коммит `578804a`):** Добавлен `\n /no_think` в **user message** в 3 местах:
- `runCollection()` (строка ~232) — сбор cron
- `backfill-topic-relevance` (строка ~1196) — ручной backfill
- `/classify` (строка ~1307) — прямая классификация

**Примечание:** `/no_think` работает в **user message**, не в system prompt (Qwen GitHub Discussion #1329). **Пробел перед слэшем** обязателен (`\n /no_think`, не `\n/no_think`).

**Эффект:** `completion_tokens` падает с ~500-2000 до ~300-500; `neurons/вызов` с ~63 до ~20. Без потери качества для классификации (структурированное извлечение).

## 18. Self-Heal и Cycle Lock (2026-10-25)

**Проблема:** Cloudflare Cron может пропускать batch'и или дублировать запуски.

**Исправление:**
- Таблица `cycle_lock` (D1, миграция 0017) — атомарный лок через `owner` + `expires_at`, `SELECT owner` (не `changes()`).
- `tryAcquireLock(env, owner)` — взятие/освобождение лока.
- `runCollectionCycle(env, ctx, batch, generateProtocol, scheduledTime?)` — выделенная функция с локом + опциональный протокол.
- **Self-heal** внутри `scheduled()` (per-batch): если у источников batch'а 0 items сегодня → форсировать сбор.
- `/run-cycle` (Bearer-защищён, в `PROTECTED_PREFIXES`) — ручной/внешний триггер с idempotency-first + `ctx.waitUntil` + `202`.

## 19. Human-оси: переход к достижениям (2026-10-25)

**Проблема:** Gap Index измерял AI *capability* vs Human *проблемы* (войны, катастрофы) — научно некорректное сравнение.

**Исправление (коммит `2c3fd2d`):**
- **Новые Human-оси:** `h1_science` (наука), `h2_engineering` (инфраструктура), `h3_culture` (искусство), `h4_institutions` (университеты), `h5_wellbeing` (здоровье), `h6_governance` (права).
- **Веса:** 0.20/0.20/0.20/0.15/0.15/0.10 (сумма = 1.0).
- **Промпт:** Правило 14 — приоритет достижениям (наука, инженерия, культура, институты) над общими катастрофами.
- **Источники:** +ScienceDaily, +SpaceNews, +The Atlantic, +Inside Higher Ed, +Science, +MIT News. Удалены: BAIR, NIST, EU AI Act, OECD, TechNode, The Decoder.

**Эффект:** Gap Index теперь измеряет **Human Progress vs AI Progress** — научно корректно.

## 20. Источники: Human Achievements (2026-10-25)

**Всего: 60 (AI: 32, Human: 28)**

**AI (30):** OpenAI, Anthropic, Google DeepMind, Meta AI, Mistral, Hugging Face, arXiv ×4, MIT Tech Review, The Verge, Ars Technica, AI Alignment, Import AI, AI News, Politico Tech, The Hill Policy, CBS Tech, WSJ World, AI Now, Latent Space, TechCrunch, WSJ Tech, BBC, FT AI, Guardian AI, Quantum Insider, DARPA, Synced Review.

**Human (30):** WHO, Benton, Reuters Institute, Noema, Politico Politics, The Hill News, NPR, CBS World, CBS Politics, CPJ, Pew, EFF, Our World in Data, ТАСС, FT Chinese, Al Jazeera, The Hindu, Aeon, Psyche, HRW, 3 Quarks, Axios, **Science**, **MIT News (Engineering)**, **ScienceDaily**, **SpaceNews**, **The Atlantic**, **Inside Higher Ed**.

*По вопросам — см. docs/methodology.md (математика Gap) и scripts/audit.sh (что проверяется).*
