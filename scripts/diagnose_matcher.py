#!/usr/bin/env python3
# diagnose_matcher.py - batch 4 (read-only): matcher logic, codegen, UA, quotes schema, replacement candidates
import os, sys, re, ssl, json, urllib.request
import concurrent.futures as cf

root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
src = os.path.join(root, "src")
diag = os.path.join(root, "diagnostics")

def hdr(t):
    print("\n" + "=" * 72)
    print(t)
    print("=" * 72)

# ---- A. Логика матчера: полный дамп src/services/voices.ts ----
hdr("A. src/services/voices.ts (полный дамп)")
p = os.path.join(src, "services", "voices.ts")
if os.path.exists(p):
    lines = open(p, encoding="utf-8", errors="replace").read().splitlines()
    print("  всего строк: %d" % len(lines))
    if len(lines) <= 340:
        for i, ln in enumerate(lines, 1):
            print("  %4d| %s" % (i, ln))
    else:
        for i, ln in enumerate(lines):
            if "sources" in ln:
                for j in range(max(0, i - 6), min(len(lines), i + 7)):
                    print("    %s%d| %s" % (">>" if j == i else "  ", j + 1, lines[j][:160]))
else:
    print("  файл не найден")

# ---- A2. Формат generated/voices.ts (шапка, блок с пустым sources, хвост) ----
hdr("A2. Формат generated/voices.ts (шаблон для ручной кодогенерации)")
g = os.path.join(src, "config", "generated", "voices.ts")
if os.path.exists(g):
    gl = open(g, encoding="utf-8", errors="replace").read().splitlines()
    print("  всего строк: %d" % len(gl))
    print("  --- первые 12 строк ---")
    for i in range(min(12, len(gl))):
        print("  %4d| %s" % (i + 1, gl[i]))
    print("  --- один блок с sources: [] ---")
    for i, ln in enumerate(gl):
        if '"sources": []' in ln:
            for j in range(max(0, i - 10), min(len(gl), i + 4)):
                print("  %4d| %s" % (j + 1, gl[j]))
            break
    print("  --- последние 8 строк ---")
    for i in range(max(0, len(gl) - 8), len(gl)):
        print("  %4d| %s" % (i + 1, gl[i]))

# ---- B. Кодогенерация: кто пишет generated/*.ts ----
hdr("B. Кодогенерация yaml -> ts")
pj = os.path.join(root, "package.json")
if os.path.exists(pj):
    d = json.load(open(pj, encoding="utf-8"))
    print("  package.json scripts:", json.dumps(d.get("scripts", {}), indent=1)[:800])
for sub in (os.path.join(src, "config"), os.path.join(src, "config", "generated")):
    if os.path.isdir(sub):
        print("  [%s]:" % os.path.relpath(sub, root), ", ".join(sorted(os.listdir(sub))[:20]))
pat = re.compile(r"generated|codegen|generate|yaml", re.I)
EXC = {".git", "node_modules", ".venv", "venv", "__pycache__", "diagnostics", "scripts"}
n = 0
for dirpath, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d not in EXC]
    if dirpath.replace(os.sep, "/").endswith("/src/config/generated"):
        continue
    for f in files:
        if f.endswith((".py", ".ts", ".js", ".mjs", ".cjs", ".sh", ".yml", ".yaml")):
            fp = os.path.join(dirpath, f)
            try:
                for i, ln in enumerate(open(fp, encoding="utf-8", errors="replace"), 1):
                    if pat.search(ln) and not ln.strip().startswith(("//", "*", "#")):
                        print("  %s:%d: %s" % (os.path.relpath(fp, root), i, ln.strip()[:150]))
                        n += 1
                        if n > 50:
                            break
            except Exception:
                pass
    if n > 50:
        break
if n == 0:
    print("  (явной кодогенерации не найдено — сгенерируем ts вручную по формату из A2)")

# ---- C. User-Agent и фетчер коллектора ----
hdr("C. User-Agent / fetch в коде коллектора")
n = 0
for dirpath, dirs, files in os.walk(src):
    dirs[:] = [d for d in dirs if d not in ("node_modules", "__pycache__")]
    for f in files:
        if f.endswith((".ts", ".js", ".mjs")):
            fp = os.path.join(dirpath, f)
            try:
                for i, ln in enumerate(open(fp, encoding="utf-8", errors="replace"), 1):
                    if re.search(r"user[-_ ]?agent|fetch\(|axios|undici|parseFeed|rssparser", ln, re.I):
                        print("  %s:%d: %s" % (os.path.relpath(fp, root), i, ln.strip()[:150]))
                        n += 1
                        if n > 30:
                            break
            except Exception:
                pass
    if n > 30:
        break
if n == 0:
    print("  (ничего не найдено)")

# ---- D. Схема quotes (миграция) ----
hdr("D. Миграция voices/quotes")
mdir = os.path.join(root, "migrations")
if os.path.isdir(mdir):
    for f in sorted(os.listdir(mdir)):
        if "voice" in f or "quote" in f:
            print("  --- %s ---" % f)
            print("".join(open(os.path.join(mdir, f), encoding="utf-8", errors="replace").readlines()[:40]))

# ---- E. Кандидаты на замену SpaceNews / Synced ----
hdr("E. Кандидаты замен (SpaceNews / Synced Review)")
CTX_V = ssl.create_default_context()
try:
    import certifi as _c
    CTX_V = ssl.create_default_context(cafile=_c.where())
except Exception:
    pass
CTX_U = ssl._create_unverified_context()
UA_BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def get_raw(url, ua="browser"):
    h = {"User-Agent": UA_BROWSER if ua == "browser" else "Python-urllib/3.11"}
    if ua == "full":
        h = {"User-Agent": UA_BROWSER,
             "Accept": "application/rss+xml, application/xml, text/xml, */*",
             "Accept-Language": "en-US,en;q=0.9",
             "Referer": "https://spacenews.com/"}
    req = urllib.request.Request(url, headers=h)
    for ctx in (CTX_V, CTX_U):
        try:
            with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
                return r.read(1500000).decode("utf-8", "replace")
        except Exception:
            pass
    return None

CANDS = [
    ("Interconnects (замена Synced)", "https://www.interconnects.ai/feed", "browser"),
    ("The Decoder (замена Synced)", "https://www.the-decoder.com/feed/", "browser"),
    ("Space.com (замена SpaceNews)", "https://www.space.com/feeds/all", "browser"),
    ("NASASpaceflight (замена SpaceNews)", "https://www.nasaspaceflight.com/feed/", "browser"),
    ("NASA news-release", "https://www.nasa.gov/news-release/feed/", "browser"),
    ("ESA All", "https://www.esa.int/rssfeed/All", "browser"),
    ("SpaceNews full-headers", "https://spacenews.com/feed/", "full"),
]
def fetch(c):
    label, url, ua = c
    raw = get_raw(url, ua)
    if raw is None:
        return dict(label=label, url=url, ok=False, err="unreachable")
    n = len(re.findall(r"<item[\s>]", raw)) + len(re.findall(r"<entry[\s>]", raw))
    dates = re.findall(r"<(?:pubDate|published|updated)[^>]*>([^<]{8,64})<", raw)[:1]
    return dict(label=label, url=url, ok=True, items=n, first_date=dates[0].strip() if dates else None)
with cf.ThreadPoolExecutor(max_workers=7) as ex:
    results = list(ex.map(fetch, CANDS))
for r in results:
    if r.get("ok"):
        print("  [OK] %-34s items=%-4d дата1: %s" % (r["label"], r["items"], r.get("first_date") or "-"))
    else:
        print("  [ERR] %-34s %s (%s)" % (r["label"], r["url"], r.get("err")))
with open(os.path.join(diag, "audit4_candidates.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=1)
print("  [saved] diagnostics/audit4_candidates.json")
print("\n[готово] это последний диагностический батч — дальше идут патчи")
