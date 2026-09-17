# Contributing to Human–AI Monitor

Спасибо за интерес к проекту! Мы приветствуем любой вклад — от исправления 
опечаток до добавления новых источников данных.

## Как помочь

### 1. Сообщить об ошибке

Откройте issue с описанием:
- Что произошло
- Что ожидалось
- Шаги для воспроизведения
- Окружение (OS, Python, Node.js)

### 2. Предложить улучшение

Откройте issue с меткой `enhancement`:
- Что хотите добавить
- Зачем это нужно проекту
- Как это соответствует миссии

### 3. Добавить источник данных

Отредактируйте `config/sources_ai.yaml` или `config/sources_human.yaml`:

```yaml
rss:
  - name: "Название источника"
    url: "https://example.com/rss.xml"
    lang: "en"
    tier: 1
```

### 4. Улучшить классификатор

Промпты для LLM находятся в `prompts/`:
- `classify_ai.txt` — для 6 осей ИИ
- `classify_human.txt` — для 6 осей Человечества

### 5. Написать код

```bash
git clone https://github.com/your-username/human-ai-monitor.git
cd human-ai-monitor
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
```

**Стиль:**
- Python: PEP 8, type hints обязательны.
- TypeScript: strict mode.
- Коммиты: conventional commits (feat, fix, docs, refactor).

**Процесс:**
1. Fork → branch (`git checkout -b feature/amazing-idea`)
2. Commit (`git commit -m "feat: add amazing feature"`)
3. Push (`git push origin feature/amazing-idea`)
4. Pull Request

---

## Этический кодекс

См. [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Чего мы не принимаем

- **Платные интеграции** — проект принципиально бесплатный.
- **Скрытые данные** — все источники и промпты публичны.
- **Реклама** — никакой коммерции.
- **Политика** — проект вне политических партий.

---

**Вместе — Мы Сила. Дорогу осилит идущий.**
