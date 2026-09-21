# Contributing to Human-AI Monitor

Спасибо за интерес к проекту! Мы приветствуем любой вклад — от исправления
опечаток до добавления новых источников данных.

## Как помочь

### 1. Сообщить об ошибке

Откройте issue с описанием:
- Что произошло
- Что ожидалось
- Шаги для воспроизведения
- Окружение (OS, Node.js, pnpm)

### 2. Предложить улучшение

Откройте issue с меткой enhancement:
- Что хотите добавить
- Зачем это нужно проекту
- Как это соответствует миссии

### 3. Добавить источник данных

Отредактируйте config/sources_ai.yaml или config/sources_human.yaml:

    rss:
      - name: "Название источника"
        url: "https://example.com/rss.xml"
        lang: "en"
        tier: 1

### 4. Улучшить классификатор

Промпты для LLM находятся в src/config/prompts.ts:
- CLASSIFY_PROMPT — единый промпт для всех 12 осей (7 AI + 6 Human)
- Модель: Qwen 3 (через Cloudflare Workers AI)

### 5. Написать код

    git clone https://github.com/VQQLK/Human-AI-Monitor.git
    cd Human-AI-Monitor/human-ai-monitor-collector
    pnpm install
    pnpm test
    pnpm dev
    pnpm deploy

Стек:
- Runtime: Cloudflare Workers (TypeScript)
- База данных: Cloudflare D1 (SQLite)
- Тесты: Vitest
- AI: Cloudflare Workers AI (Qwen 3)
- Пакетный менеджер: pnpm

Стиль:
- TypeScript: strict mode (tsconfig.json)
- Форматирование: Prettier (опционально)
- Коммиты: conventional commits (feat, fix, docs, refactor, chore)

Процесс:
1. Fork -> branch (git checkout -b feature/amazing-idea)
2. Commit (git commit -m "feat: add amazing feature")
3. Push (git push origin feature/amazing-idea)
4. Pull Request

---

## Структура проекта

    human-ai-monitor-collector/
    ├── src/
    │   ├── index.ts                    # Главный worker
    │   ├── services/
    │   │   └── gap-computation.ts      # Вычисление Gap Index
    │   └── config/
    │       ├── axes.ts                 # Список 12 осей
    │       ├── prompts.ts              # LLM промпты
    │       └── generated/              # Типы из YAML
    ├── config/
    │   ├── axes_ai.yaml                # 7 AI осей
    │   ├── axes_human.yaml             # 6 Human осей
    │   ├── sources_ai.yaml             # 21 источник ИИ (20 активных)
    │   └── sources_human.yaml          # 15 источников человека (11 активных)
    ├── migrations/
    │   ├── 0001_initial_schema.sql
    │   ├── 0002_add_content_column.sql
    │   └── 0003_update_smd_level.sql
    ├── test/
    │   ├── cheat-detector.spec.ts      # 7 тестов: детектор читерства
    │   ├── classifier.spec.ts          # 15 тестов: классификатор
    │   ├── index.spec.ts               # 8 тестов: API эндпоинты
    │   └── parser.spec.ts               # 14 тестов: парсер
    └── wrangler.jsonc

---

## Этический кодекс

См. CODE_OF_CONDUCT.md.

---

## Чего мы не принимаем

- Платные интеграции — проект принципиально бесплатный.
- Скрытые данные — все источники и промпты публичны.
- Реклама — никакой коммерции.
- Политика — проект вне политических партий.

---

## Ссылки

- README.md — описание проекта (EN)
- README.ru.md — описание проекта (RU)
- CHANGELOG.md — история изменений
- MANIFESTO.md — манифест проекта

---

**Вместе — Мы Сила. Дорогу осилит идущий.**
