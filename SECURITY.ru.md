# Политика безопасности

> **Language:** [🇺🇸 English](SECURITY.md) • [🇷🇺 Русский](SECURITY.ru.md) • [🇨🇳 中文](SECURITY.zh.md)

## Поддерживаемые версии

| Версия  | Поддержка            |
|---------|----------------------|
| 1.0.x   | ✅ Активная поддержка |
| < 1.0   | ❌ Снята с поддержки  |

Обновления безопасности получает только последняя минорная версия.

## Сообщение об уязвимости

**Пожалуйста, НЕ создавайте публичный GitHub Issue для ошибок безопасности.**

Доступны два канала:

1. **Предпочтительный — GitHub Private Vulnerability Reporting**
   [Сообщить об уязвимости](https://github.com/VQQLK/Human-AI-Monitor/security/advisories/new) — приватно, с отслеживанием, обсуждение с мейнтейнерами.

2. **Резервный — Email**
   [REDACTED@example.invalid](mailto:REDACTED@example.invalid) с темой `[SECURITY] Human-AI Monitor`.

### Что включить в сообщение

- Затронутая версия / коммит
- Шаги воспроизведения (curl-команда, скрипт, скриншот)
- Оценка воздействия (критичность, эксплуатируемость)
- Ваше имя / ник для credit (опционально)

### Ожидаемое время ответа

| Этап                   | Срок                                         |
|------------------------|----------------------------------------------|
| Подтверждение          | ≤ 48 часов                                   |
| Первичная оценка       | ≤ 7 дней                                     |
| Исправление            | ≤ 30 дней (критично), ≤ 90 дней (не критично) |
| Публичное раскрытие    | Согласованно, по умолчанию 90 дней после фикса |

## Область действия

### В области действия

- **Edge runtime** — Cloudflare Worker (`src/index.ts`, `src/services/`, `src/auth.ts`)
- **HTTP API** — публичные endpoints, аутентификация, валидация ввода
- **HTML views** — роуты `/protocols/*/view` (XSS, инъекции)
- **D1-запросы** — SQL-инъекции, обход авторизации
- **Работа с секретами** — ротация, утечка, timing-атаки
- **CI/CD** — GitHub Actions workflow в `.github/workflows/`

### Вне области действия

- **Dev-зависимости** — `wrangler`, `miniflare`, `vitest`, `undici` (не влияют на runtime)
- **Платформа Cloudflare** — сообщайте напрямую в [Cloudflare](https://www.cloudflare.com/security/)
- **Социальная инженерия** — фишинг, претекстинг против мейнтейнеров
- **DoS на free tier** — Cloudflare применяет rate limiting на edge
- **Опечатки в документации** — открывайте обычный issue

## Практики безопасности

- **Аутентификация**: Bearer-токены сравниваются через `timingSafeEqual` (constant-time)
- **Dual-secret ротация**: `ADMIN_SECRET_CURRENT` + `ADMIN_SECRET_PREVIOUS` (24-часовое окно)
- **HTTP method guard**: только `GET`, `HEAD`, `OPTIONS` и `POST /translate-document`
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Referrer-Policy`, `Permissions-Policy`
- **CORS**: wildcard `*` (намеренно — read-only публичный API, без credentials)
- **D1**: параметризованные запросы через `.bind()`, без конкатенации строк
- **HTML rendering**: полное экранирование пользовательского контента
- **2FA**: включена на GitHub и Cloudflare

## Ротация секретов

| Секрет                                  | Частота          | Скрипт                              |
|-----------------------------------------|------------------|-------------------------------------|
| `ADMIN_SECRET_CURRENT` / `PREVIOUS`     | Каждые 90 дней   | `scripts/rotate_admin_secret.sh`    |
| `GITHUB_PAT`                            | Каждые 90–180 дней | Вручную (fine-grained PAT)         |
| `CLOUDFLARE_API_TOKEN`                  | Каждые 12 месяцев | Cloudflare dashboard               |

Полная процедура: [`scripts/rotate_admin_secret.sh`](scripts/rotate_admin_secret.sh)

## Управление зависимостями

- `npm audit` — часть чеклиста релиза
- 0 high/critical уязвимостей на каждом релизе
- Production-зависимости: только `js-yaml`
- Dev-зависимости обновляются на минорных релизах `wrangler`

## Политика раскрытия

- **Согласованное раскрытие**, по умолчанию 90 дней после выхода фикса
- **Указание авторства** в `CHANGELOG.md` (с вашего разрешения)
- **CVE** будет запрошен при необходимости

## Атрибуция

Политика следует общепринятой практике open source. См. [руководство GitHub по согласованному раскрытию](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

---

**Вместе — Мы Сила. Дорогу осилит идущий.**
