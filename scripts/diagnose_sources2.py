#!/usr/bin/env python3
# diagnose_sources2.py - batch 2 (read-only): AI pool, voices integrity, SSL probe, storage, git
import os, sys, re, json, ssl, shutil, subprocess, urllib.request
from datetime import datetime, timezone
from collections import Counter
import concurrent.futures as cf
import yaml

NOW = datetime.now(timezone.utc)
root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
cfg = os.path.join(root, "config")

def hdr(t):
    print("\n" + "=" * 72)
    print(t)
    print("=" * 72)

sh = yaml.safe_load(open(os.path.join(cfg, "sources_human.yaml"), encoding="utf-8")).get("rss", [])
sa = yaml.safe_load(open(os.path.join(cfg, "sources_ai.yaml"), encoding="utf-8")).get("rss", [])
vy = yaml.safe_load(open(os.path.join(cfg, "voices.yaml"), encoding="utf-8"))
voices = vy.get("voices", [])
H = {s.get("name") for s in sh}
A = {s.get("name") for s in sa}

# ---- B. Структурный аудит AI-пула ----
hdr("B. Структурный аудит AI-пула (n=%d)" % len(sa))
def dups(seq):
    return sorted({x for x in seq if x and seq.count(x) > 1})
names_ai = [s.get("name") for s in sa]
feeds_ai = [re.sub(r"^https?://", "", str(s.get("url") or "").lower()).rstrip("/") for s in sa]
doms_ai = [str(s.get("url") or "http:///").split("//")[-1].split("/")[0].replace("www.", "") for s in sa]
print("  дубликаты имён:", dups(names_ai) or "нет")
print("  дубликаты фидов:", dups(feeds_ai) or "нет")
print("  дубликаты доменов:", dups(doms_ai) or "нет")
print("  AI.lang:", dict(Counter(str(s.get("lang") or "?") for s in sa)))
print("  AI.tier:", dict(Counter(str(s.get("tier") or "?") for s in sa)))
if any("category" in s for s in sa):
    print("  AI.category:", dict(Counter(str(s.get("category")) for s in sa if "category" in s)))
print("  AI: без lang:", [s.get("name") for s in sa if not s.get("lang")] or "нет")
print("  AI: полный список имён:")
for s in sa:
    print("    -", s.get("name"), "|", s.get("lang", "?"), "| tier", s.get("tier", "?"), "|", str(s.get("url"))[:70])

# ---- C. Voices -> источники ----
hdr("C. Целостность Voices -> источники (n=%d)" % len(voices))
empty_refs, dangling = [], {}
for v in voices:
    refs = v.get("sources") or []
    if not refs:
        empty_refs.append(v.get("name", "?"))
    for r in refs:
        if r not in H and r not in A:
            dangling.setdefault(r, []).append(v.get("name", "?"))
print("  Voices с ПУСТЫМ sources:[]: %d из %d" % (len(empty_refs), len(voices)))
print("   ", "; ".join(empty_refs))
print("  Висячие ссылки (нет ни в HUMAN, ни в AI):", len(dangling))
for k in sorted(dangling):
    print("   '%s'  <-  %s" % (k, ", ".join(dangling[k])))
print("\n  Справка по всем voices (name | category | refs):")
for v in voices:
    refs = ",".join(v.get("sources") or []) or "-"
    print("   %-38s | %-17s | %s" % (str(v.get("name", "?"))[:38], str(v.get("category", "?"))[:17], refs[:70]))

# ---- D. Языковое покрытие ключевых слов ----
hdr("D. Скрипты ключевых слов voices (latin / cyrillic / CJK)")
n_lat = n_cyr = n_cjk = 0
cyr_l, cjk_l = [], []
for v in voices:
    sset = set()
    for k in (v.get("keywords") or []):
        if re.search(r"[\u4e00-\u9fff]", k): sset.add("cjk")
        if re.search(r"[\u0400-\u04FF]", k): sset.add("cyr")
        if re.search(r"[A-Za-z]", k): sset.add("lat")
    if "lat" in sset: n_lat += 1
    if "cyr" in sset: n_cyr += 1; cyr_l.append(v.get("name", "?"))
    if "cjk" in sset: n_cjk += 1; cjk_l.append(v.get("name", "?"))
print("  latin: %d/%d   cyrillic: %d   CJK: %d" % (n_lat, len(voices), n_cyr, n_cjk))
print("  cyrillic у:", ", ".join(cyr_l[:12]) + (" ..." if len(cyr_l) > 12 else ""))
print("  CJK у:", ", ".join(cjk_l) if cjk_l else "НЕТ - китайские имена (马斯克, 梁文锋...) в FT中文网 не совпадут ни с одним voice")

# ---- E. Как код потребляет voices/tier/weight/enabled ----
hdr("E. Использование в коде: voices/sources/min_relevance/tier/weight/enabled")
pats = ("voices", "voice.get", "min_relevance", "title_only_below",
        "'sources'", '"sources"', "'tier'", '"tier"', "'weight'", '"weight"', "'enabled'", '"enabled"')
seen = 0
for dirpath, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__", ".venv", "venv", "diagnostics", "scripts")]
    for f in sorted(files):
        if not f.endswith(".py"):
            continue
        p = os.path.join(dirpath, f)
        try:
            lines = open(p, encoding="utf-8", errors="replace").read().splitlines()
        except Exception:
            continue
        for i, ln in enumerate(lines, 1):
            st = ln.strip()
            if st.startswith("#"):
                continue
            if any(pt in ln for pt in pats):
                print("  %s:%d: %s" % (os.path.relpath(p, root), i, st[:150]))
                seen += 1
        if seen > 100:
            break
    if seen > 100:
        break
if seen == 0:
    print("  (совпадений нет - код матчинга voices лежит вне collector, см. секцию G)")

# ---- F. Живой пробинг всех фидов ----
hdr("F. Живой пробинг фидов HUMAN+AI (SSL: v=verified, u=unverified-fallback)")

def parse_dates(raw):
    out = []
    fmts = ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z",
            "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%d", "%Y/%m/%d")
    for t in re.findall(r"<(?:pubDate|published|updated|dc:date)[^>]*>([^<]{8,64})<", raw)[:400]:
        t = t.strip()
        for f in fmts:
            try:
                d = datetime.strptime(t, f)
                out.append(d if d.tzinfo else d.replace(tzinfo=timezone.utc))
                break
            except ValueError:
                pass
    return out

try:
    import certifi as _certifi
    CTX_V = ssl.create_default_context(cafile=_certifi.where())
except Exception:
    CTX_V = ssl.create_default_context()
CTX_U = ssl._create_unverified_context()

def probe(name, url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) human-ai-diag/2"})
    err = None
    for ctx, mode in ((CTX_V, "v"), (CTX_U, "u")):
        try:
            with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
                raw = r.read(2500000).decode("utf-8", "replace")
            n_items = len(re.findall(r"<item[\s>]", raw)) + len(re.findall(r"<entry[\s>]", raw))
            ds = parse_dates(raw)
            if ds:
                age = round((NOW - max(ds)).total_seconds() / 86400, 1)
                i7 = sum(1 for d in ds if (NOW - d).total_seconds() <= 7 * 86400)
                o30 = round(100.0 * sum(1 for d in ds if (NOW - d).total_seconds() > 30 * 86400) / len(ds))
            else:
                age = i7 = o30 = None
            return name, dict(n=n_items, age=age, i7=i7, o30=o30, mode=mode, err=None)
        except Exception as e:
            err = type(e).__name__ + ": " + str(e)[:70]
    return name, dict(n=None, age=None, i7=None, o30=None, mode="-", err=err)

targets = [("H:" + str(s.get("name", "?")), s.get("url")) for s in sh if s.get("url")] + \
          [("A:" + str(s.get("name", "?")), s.get("url")) for s in sa if s.get("url")]
res = {}
with cf.ThreadPoolExecutor(max_workers=12) as ex:
    futs = [ex.submit(probe, n, u) for n, u in targets]
    for fu in cf.as_completed(futs):
        try:
            n, d = fu.result()
            res[n] = d
        except Exception:
            pass
fmt = lambda x, w: ("-" if x is None else str(x)).rjust(w)
print("  обработано: %d/%d" % (len(res), len(targets)))
print("  %-48s | %4s | %6s | %3s | %5s | %3s | %s" % ("источник", "n", "свеж(д)", "7д", ">30д%", "SSL", "ошибка"))
for n, u in targets:
    d = res.get(n)
    if not d:
        print("  %-48s | (нет результата)" % n[:48]); continue
    print("  %-48s | %4s | %6s | %3s | %5s | %3s | %s" % (
        n[:48], fmt(d["n"], 4), fmt(d["age"], 6), fmt(d["i7"], 3), fmt(d["o30"], 5), d["mode"], d["err"] or ""))

# ---- G. Хранилище ----
hdr("G. Хранилище: поиск статей/бд в родителе %s" % os.path.dirname(root))
parent = os.path.dirname(root)
try:
    print("  [соседи]:", ", ".join(sorted(d for d in os.listdir(parent) if not d.startswith("."))))
except Exception as e:
    print("  родитель недоступен:", e)
hits = 0
for dirpath, dirs, files in os.walk(parent):
    dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__", ".venv", "venv")]
    if os.path.relpath(dirpath, parent).count(os.sep) > 3:
        dirs[:] = []
        continue
    for f in files:
        if f.endswith((".db", ".sqlite", ".sqlite3", ".jsonl", ".parquet")):
            fp = os.path.join(dirpath, f)
            try:
                mb = os.path.getsize(fp) / 1e6
            except OSError:
                mb = -1
            print("  %s  (%.1f MB)" % (os.path.relpath(fp, parent), mb))
            hits += 1
    if hits > 40:
        break
if hits == 0:
    print("  (*.db/*.sqlite*/jsonl/parquet не найдено и здесь)")

# ---- H. Git ----
hdr("H. Git")
for cmd in (["git", "status", "--short"], ["git", "log", "-3", "--oneline"], ["git", "branch", "--show-current"]):
    try:
        o = subprocess.run(cmd, cwd=root, capture_output=True, text=True, timeout=15)
        print("  $ " + " ".join(cmd))
        print((o.stdout.strip() or "(пусто)")[:600])
    except Exception as e:
        print("  $ " + " ".join(cmd) + " -> " + str(e))

# ---- Сохранение артефактов ----
for fn in ("sources_ai.yaml", "axes_ai.yaml", "axes_human.yaml", "voices.yaml", "sources_human.yaml"):
    src = os.path.join(cfg, fn)
    if os.path.exists(src):
        shutil.copy(src, os.path.join(root, "diagnostics", "copy_" + fn))
J = dict(when=NOW.isoformat(), human_n=len(sh), ai_n=len(sa), voices_n=len(voices),
         empty_refs=empty_refs, dangling=dangling,
         keyword_scripts=dict(latin=n_lat, cyrillic=n_cyr, cjk=n_cjk, cjk_voices=cjk_l),
         probe={n: d for n, d in res.items()})
with open(os.path.join(root, "diagnostics", "audit2_summary.json"), "w", encoding="utf-8") as f:
    json.dump(J, f, ensure_ascii=False, indent=1, default=str)
print("\n[saved] diagnostics/audit2_summary.json + копии конфигов в diagnostics/")

# ---- I. Дампы (в конце: при обрезке сообщения теряются последними) ----
hdr("I. Дампы: sources_ai.yaml / axes_ai.yaml / axes_human.yaml")
for fn in ("sources_ai.yaml", "axes_ai.yaml", "axes_human.yaml"):
    p = os.path.join(cfg, fn)
    print("\n### config/" + fn)
    print(open(p, encoding="utf-8").read() if os.path.exists(p) else "(файл не найден)")
