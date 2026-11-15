#!/usr/bin/env python3
# diagnose_app.py - batch 3 (read-only): matcher semantics, D1 dump stats, candidate feeds, date forensics
import os, sys, re, ssl, json, urllib.request
import concurrent.futures as cf

root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
parent = os.path.dirname(root)
diag = os.path.join(root, "diagnostics")

def hdr(t):
    print("\n" + "=" * 72)
    print(t)
    print("=" * 72)

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
    req = urllib.request.Request(url, headers=h)
    for ctx in (CTX_V, CTX_U):
        try:
            with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
                return r.read(1500000).decode("utf-8", "replace")
        except Exception:
            pass
    return None

# ---- A. Соседи collector ----
hdr("A. Соседи: %s" % parent)
sibs = sorted(d for d in os.listdir(parent) if os.path.isdir(os.path.join(parent, d)) and d != os.path.basename(root))
for d in sibs:
    p = os.path.join(parent, d)
    print("  [%s]" % d)
    print("   ", ", ".join(sorted(os.listdir(p))[:30]))

# ---- B. Matcher voices: семантика пустых sources ----
hdr("B. Matcher voices в репо-соседях (семантика sources:[])")
CODE_EXT = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".py", ".sql")
SKIP = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", ".next", "build", "scripts", "diagnostics"}
matcher_files = []
for dirpath, dirs, files in os.walk(parent):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for f in files:
        if f.endswith(CODE_EXT):
            p = os.path.join(dirpath, f)
            try:
                txt = open(p, encoding="utf-8", errors="replace").read()
            except Exception:
                continue
            if "title_only_below" in txt or "min_relevance" in txt:
                matcher_files.append(p)
print("  файлы матчера (содержат title_only_below/min_relevance):")
for p in matcher_files:
    print("   ", os.path.relpath(p, parent))
shown = 0
for p in matcher_files:
    lines = open(p, encoding="utf-8", errors="replace").read().splitlines()
    for i, ln in enumerate(lines):
        if "sources" in ln and not ln.strip().startswith(("//", "*", "#")):
            a = max(0, i - 2); b = min(len(lines), i + 3)
            print("  --- %s:%d ---" % (os.path.relpath(p, parent), i + 1))
            for j in range(a, b):
                print("    %s%d| %s" % (">>" if j == i else "  ", j + 1, lines[j][:160]))
            shown += 1
        if shown > 40:
            break
    if shown > 40:
        break
if not matcher_files:
    print("  (матчер не найден в репо-соседях)")

hdr("B2. Кто читает конфиги collector")
pat = re.compile(r"sources_human\.yaml|sources_ai\.yaml|voices\.yaml|axes_ai|axes_human")
n = 0
for dirpath, dirs, files in os.walk(parent):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for f in files:
        if f.endswith(CODE_EXT):
            p = os.path.join(dirpath, f)
            try:
                for i, ln in enumerate(open(p, encoding="utf-8", errors="replace"), 1):
                    if pat.search(ln):
                        print("  %s:%d: %s" % (os.path.relpath(p, parent), i, ln.strip()[:150]))
                        n += 1
                        if n > 40:
                            break
            except Exception:
                pass
    if n > 40:
        break
if n == 0:
    print("  (прямых ссылок на конфиги не найдено)")

# ---- C. D1-дамп: таблицы и объёмы ----
hdr("C. D1-дамп (облачное хранилище)")
for fn in sorted(f for f in os.listdir(parent) if f.endswith(".sql")):
    p = os.path.join(parent, fn)
    print("  %s (%.1f MB)" % (fn, os.path.getsize(p) / 1e6))
    creates, counts = [], {}
    for line in open(p, encoding="utf-8", errors="replace"):
        m = re.match(r"\s*CREATE TABLE\s+\"?(\w+)\"?", line)
        if m:
            creates.append(m.group(1))
        m = re.match(r"\s*INSERT INTO\s+\"?(\w+)\"?", line)
        if m:
            counts[m.group(1)] = counts.get(m.group(1), 0) + 1
    print("  таблицы:", ", ".join(creates))
    print("  INSERT-строк по таблицам:")
    for t, c in sorted(counts.items(), key=lambda kv: -kv[1]):
        print("    %-32s %d" % (t, c))

# ---- D. Пробинг кандидатов на замену мёртвым ----
hdr("D. Кандидаты фидов (замена мёртвым)")
def fetch(label, url, ua="browser"):
    raw = get_raw(url, ua)
    if raw is None:
        return dict(label=label, url=url, ua=ua, ok=False, err="unreachable")
    n = len(re.findall(r"<item[\s>]", raw)) + len(re.findall(r"<entry[\s>]", raw))
    head = re.sub(r"\s+", " ", raw[:200])
    return dict(label=label, url=url, ua=ua, ok=True, bytes=len(raw), items=n, head=head)

CANDS = [
    ("IHE текущий", "https://www.insidehighered.com/news/feed", "browser"),
    ("IHE /rss.xml", "https://www.insidehighered.com/rss.xml", "browser"),
    ("IHE /rss", "https://www.insidehighered.com/rss", "browser"),
    ("IHE /feed", "https://www.insidehighered.com/feed", "browser"),
    ("SpaceNews python-UA", "https://spacenews.com/feed/", "python"),
    ("SpaceNews browser-UA", "https://spacenews.com/feed/", "browser"),
    ("DeepMind blog rss", "https://deepmind.google/blog/rss.xml", "browser"),
    ("Google AI blog rss", "https://blog.google/technology/ai/rss/", "browser"),
    ("Synced browser-UA", "https://syncedreview.com/feed/", "browser"),
    ("LessWrong feed.xml", "https://www.lesswrong.com/feed.xml", "browser"),
    ("LessWrong rss", "https://www.lesswrong.com/rss", "browser"),
    ("Anthropic rss.xml", "https://www.anthropic.com/rss.xml", "browser"),
    ("Anthropic news rss", "https://www.anthropic.com/news/rss.xml", "browser"),
    ("Mistral rss.xml", "https://mistral.ai/rss.xml", "browser"),
    ("Mistral news rss", "https://mistral.ai/news/rss.xml", "browser"),
]
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    futs = [ex.submit(fetch, l, u, ua) for l, u, ua in CANDS]
    results = [f.result() for f in futs]
for r in results:
    if r.get("ok"):
        print("  [OK] %-22s items=%-4d %5.0fKB  %s" % (r["label"], r["items"], r["bytes"] / 1024, r["url"]))
        print("         head: %s" % r["head"][:180])
    else:
        print("  [ERR] %-22s %s (%s)" % (r["label"], r["url"], r.get("err")))
with open(os.path.join(diag, "audit3_candidates.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=1)
print("  [saved] diagnostics/audit3_candidates.json")

# ---- E. Форензика дат: какие теги реально в фидах ----
hdr("E. Форензика дат (Politico / The Hindu / Phys.org / arXiv)")
FORENSICS = [
    ("Politico — Politics", "https://rss.politico.com/politics-news.xml"),
    ("The Hindu", "https://www.thehindu.com/news/international/feeder/default.rss"),
    ("Phys.org", "https://phys.org/rss-feed/"),
    ("arXiv cs.AI", "http://export.arxiv.org/rss/cs.AI"),
]
for label, url in FORENSICS:
    raw = get_raw(url, "browser")
    print("\n  [%s]" % label)
    if not raw:
        print("    недоступен"); continue
    tags = re.findall(r"<([A-Za-z:]*[dD]ate[A-Za-z:]*)[^>]*>([^<]{4,80})<", raw)[:4]
    if tags:
        for t, v in tags:
            print("    <%s> %s" % (t, v.strip()[:70]))
    else:
        print("    тегов *date* в ответе не найдено")
print("\n[готово] пришли вывод целиком — это последняя недостающая часть анализа")
