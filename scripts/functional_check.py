#!/usr/bin/env python3
"""
functional_check.py — сквозная проверка функциональности Human-AI Monitor.

В отличие от repo_audit.py (консистентность документации EN/RU/ZH),
этот скрипт проверяет, что код РАБОТАЕТ: собирается, тесты проходят,
и — самое главное по опыту этой сессии — что то, что задеплоено,
совпадает с тем, что лежит в git.

Запуск локально:
    python3 scripts/functional_check.py
    python3 scripts/functional_check.py --skip-live   (без сети, только локальные проверки)

Коды выхода: 0 = ок (warn допустимы), 1 = есть FAIL.
"""
import pathlib, re, sys, json, subprocess, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
LIVE_BASE = "https://human-ai-monitor-collector.human-ai-monitor.workers.dev"
SKIP_LIVE = "--skip-live" in sys.argv

FAILS, WARNS, OKS = [], [], []
def fail(msg): FAILS.append(msg)
def warn(msg): WARNS.append(msg)
def ok(msg):   OKS.append(msg)
def read(p):   return pathlib.Path(p).read_text(encoding="utf-8")

def run(cmd, timeout=300):
    try:
        r = subprocess.run(cmd, cwd=ROOT, shell=True, capture_output=True, text=True, timeout=timeout)
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except subprocess.TimeoutExpired:
        return -1, f"таймаут после {timeout}с"

def tail(text, n=1500):
    return text[-n:] if len(text) > n else text

# ---------- 1. Компиляция ----------
rc, out = run("npx tsc --noEmit -p .")
ok("tsc: компилируется без ошибок") if rc == 0 else fail(f"tsc: ошибки компиляции\n{tail(out)}")

# ---------- 2. Тесты ----------
rc, out = run("npx vitest run")
m = re.search(r"Tests\s+(\d+) passed \((\d+)\)", out)
if rc == 0 and m:
    ok(f"vitest: {m.group(1)}/{m.group(2)} тестов проходят")
elif rc == 0:
    ok("vitest: exit 0 (все тесты прошли; сводная строка не распознана форматированием, но код возврата авторитетен)")
else:
    fail(f"vitest: exit={rc}\n{tail(out)}")

# ---------- 3. repo_audit.py (консистентность документации) ----------
rc, out = run("python3 scripts/repo_audit.py")
ok("repo_audit.py: документация консистентна") if rc == 0 else fail(f"repo_audit.py:\n{tail(out)}")

# ---------- 4. Регрессия: захардкоженная дата в промптах (fix f79dac2) ----------
prompts_src = read(ROOT / "src/config/prompts.ts")
stale = re.findall(r"20\d\d-\d\d-\d\d", prompts_src)
fail(f"prompts.ts: захардкоженная дата вернулась: {stale}") if stale else ok("prompts.ts: даты не захардкожены")

# ---------- 5. Источник правды: сколько источников включено ЛОКАЛЬНО ----------
def count_enabled(path):
    t = read(path)
    return t.count('"name":') - t.count('"enabled": false')

ai_n = count_enabled(ROOT / "src/config/generated/sources_ai.ts")
hu_n = count_enabled(ROOT / "src/config/generated/sources_human.ts")
local_sources = ai_n + hu_n
ok(f"локально активно {local_sources} источников ({ai_n} AI + {hu_n} Human)")

# ---------- 6. Пропускная способность cron-батчей достаточна ----------
index_src = read(ROOT / "src/index.ts")
meta = re.findall(r'maxPerSource:\s*(\d+)', index_src.split("CRON_BATCH_META")[1].split("};")[0]) \
    if "CRON_BATCH_META" in index_src else []
if meta:
    capacity = sum(50 // (int(mp) * 2) for mp in meta)
    if local_sources <= capacity:
        ok(f"cron: пропускная способность {capacity} покрывает {local_sources} источников")
    else:
        fail(f"cron: {local_sources} источников превышает пропускную способность {capacity} — SOURCES.length вырастет за пределы batchConfig")
else:
    warn("cron: не удалось извлечь CRON_BATCH_META для проверки пропускной способности")

if SKIP_LIVE:
    warn("live-проверки пропущены (--skip-live)")
    print("=" * 62)
    for x in OKS:   print(" ✅", x)
    for x in WARNS: print(" ⚠️ ", x)
    for x in FAILS: print(" ❌", x)
    print("=" * 62)
    print(f"Итог: {len(OKS)} ok / {len(WARNS)} warn / {len(FAILS)} FAIL")
    sys.exit(1 if FAILS else 0)

def fetch(path, timeout=20):
    req = urllib.request.Request(LIVE_BASE + path, headers={"User-Agent": "functional_check.py"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body_raw = resp.read().decode("utf-8")
        try:
            body = json.loads(body_raw)
        except json.JSONDecodeError:
            body = body_raw
        return resp.status, body, resp.headers

# ---------- 7. Живой sources_count / version == локальным (главная проверка: разрыв деплоя) ----------
try:
    status, body, _ = fetch("/")
    if status != 200:
        fail(f"live /: статус {status}")
    else:
        live_sources = body.get("sources_count")
        if live_sources == local_sources:
            ok(f"live sources_count={live_sources} == локальному ({local_sources}) — деплой актуален")
        else:
            fail(f"РАЗРЫВ ДЕПЛОЯ: live sources_count={live_sources}, в git сейчас {local_sources}. Нужен `wrangler deploy`.")

        pkg_version = json.loads(read(ROOT / "package.json")).get("version")
        live_version = body.get("version")
        if live_version == pkg_version:
            ok(f"live version={live_version} == package.json")
        else:
            fail(f"РАЗРЫВ ДЕПЛОЯ: live version={live_version}, package.json={pkg_version}")

        # Только простые path === "..." литералы — параметризованные маршруты (/protocols/{week} и т.п.)
        # регexp-ветвятся в коде иначе и сюда намеренно не включены, чтобы не давать ложных срабатываний.
        live_eps = set(body.get("endpoints", []))
        literal_routes = set(re.findall(r'path === "(/[a-zA-Z0-9\-]*)"', index_src))
        missing = literal_routes - live_eps
        if missing:
            fail(f"РАЗРЫВ ДЕПЛОЯ: маршруты есть в коде, но не в live /: {sorted(missing)}")
        else:
            ok(f"live: все {len(literal_routes)} простых маршрутов из кода присутствуют в /")
except Exception as e:
    fail(f"live /: не удалось получить/разобрать ({e})")

# ---------- 8. /health отвечает ----------
try:
    status, body, _ = fetch("/health")
    ok(f"live /health: 200 {body}") if status == 200 else fail(f"live /health: статус {status}")
except Exception as e:
    fail(f"live /health: {e}")

# ---------- 9. /gap — форма и арифметика ----------
try:
    status, body, _ = fetch("/gap")
    if status != 200:
        fail(f"live /gap: статус {status}")
    else:
        a, h, g = body.get("ai_score"), body.get("human_score"), body.get("gap")
        if a is None or h is None or g is None:
            fail(f"live /gap: отсутствуют поля: {body}")
        elif abs(round(a - h, 2) - g) > 0.01:
            fail(f"live /gap: gap={g}, но ai_score-human_score={round(a-h,2)} — не совпадает")
        else:
            ok(f"live /gap: арифметика верна (ai={a}, human={h}, gap={g}, week_start={body.get('week_start')})")
            if not (0 <= a <= 1 and 0 <= h <= 1):
                warn(f"live /gap: ai_score={a} или human_score={h} вне ожидаемого диапазона [0,1]")
except Exception as e:
    fail(f"live /gap: {e}")

# ---------- 10. /drift-events — не копятся ли необработанные превышения ----------
try:
    status, body, _ = fetch("/drift-events")
    if status == 200:
        events = body if isinstance(body, list) else body.get("events", body.get("drift_events", []))
        warn(f"live /drift-events: {len(events)} событий — проверить вручную") if events else ok("live /drift-events: пусто")
    else:
        warn(f"live /drift-events: статус {status} (форма ответа могла измениться)")
except Exception as e:
    warn(f"live /drift-events: {e} (не критично)")

# ---------- 11. Регрессия: no-cache заголовки (более ранний фикс) ----------
try:
    _, _, headers = fetch("/gap")
    cc = headers.get("Cache-Control", "")
    ok(f"live: Cache-Control='{cc}'") if ("no-cache" in cc or "no-store" in cc) else warn(f"live: Cache-Control='{cc}', ожидался no-cache/no-store")
except Exception as e:
    warn(f"live cache-header: {e}")

# ---------- Отчёт ----------
print("=" * 62)
for x in OKS:   print(" ✅", x)
for x in WARNS: print(" ⚠️ ", x)
for x in FAILS: print(" ❌", x)
print("=" * 62)
print(f"Итог: {len(OKS)} ok / {len(WARNS)} warn / {len(FAILS)} FAIL")
sys.exit(1 if FAILS else 0)
