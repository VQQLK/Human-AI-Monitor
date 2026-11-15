#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
diagnose_sources.py — полный аудит источников и Voices (human-ai-monitor).

Только ЧТЕНИЕ конфигов/хранилища + сетевой пробинг RSS. Ничего не меняет.
Пишет отчёты в diagnostics/: sources_report_<ts>.md и sources_report_<ts>.json

Запуск из корня коллекционера:  python3 scripts/diagnose_sources.py .
"""
import sys, os, re, json, ssl, glob, sqlite3, subprocess, urllib.request, urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
from email.utils import parsedate_to_datetime

NOW = datetime.now(timezone.utc)
UA = "Mozilla/5.0 (compatible; monitor-diag/1.0; +report)"
SKIP_DIRS = {".git", ".venv", "venv", "node_modules", "__pycache__", "diagnostics", ".pytest_cache"}

try:
    import yaml as _yaml
    HAVE_YAML = True
except Exception:
    HAVE_YAML = False

# ---------------- keyword scopes for rough topical yield ----------------
AI_KW = {
    "en": [r"\bA\.?I\.?\b", r"\bai\b", r"artificial intelligence", r"\bllm(s)?\b", r"\bgpt(-\d)?\b",
           r"chatgpt", r"machine learning", r"deep learning", r"neural network", r"\bopenai\b",
           r"\banthropic\b", r"deepmind", r"chatbot", r"generative", r"\brobot(s|ics)?\b",
           r"automation", r"foundation model", r"deepseek", r"\bgrok\b", r"\bgemini\b", r"\bclaude\b", r"copilot"],
    "ru": [r"\bии\b", r"искусственн", r"нейросет", r"нейро-", r"машинн", r"алгоритм", r"\bробот",
           r"openai", r"chatgpt", r"\bllm\b", r"deepseek", r"автоматизац", r"генеративн"],
    "zh": [r"人工智能", r"\bAI\b", r"大模型", r"机器学习", r"神经网络", r"算法", r"机器人", r"生成式", r"深度学习", r"聊天机器人"],
    "tr": [r"yapay zek[âa]", r"\bYZ\b", r"chatgpt", r"openai", r"yapay sinir", r"algoritma",
           r"otomasyon", r"\brobot", r"derin [öo]ğrenme", r"makine [öo]ğrenmesi", r"generatif"],
}
KW_RE = {k: [re.compile(p, re.I) for p in v] for k, v in AI_KW.items()}

FEED_KEYS = ("feed", "feed_url", "feedurl", "rss", "rss_url", "url", "link", "src_url")
SITE_KEYS = ("site", "site_url", "homepage", "website", "home", "html_url")
LANG_KEYS = ("lang", "language", "locale", "lang_code", "langauge")
CAT_KEYS = ("category", "categories", "section", "sections", "topic", "topics",
            "tags", "axes", "axis", "beat", "group", "type", "kind", "scope", "focus")
WEIGHT_KEYS = ("weight", "canonical_weight", "priority", "rank", "score")
ENABLE_KEYS = ("enabled", "active", "on", "disabled", "status", "state")

def g1(rec, keys):
    for k in keys:
        if k in rec and rec[k] not in (None, ""):
            return rec[k]
    return None

def norm_url(u):
    if not u or not isinstance(u, str): return None
    u = u.strip().lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^www\.", "", u)
    return u.rstrip("/")

def host_of(u):
    if not u or not isinstance(u, str): return None
    m = re.match(r"^https?://([^/:\s]+)", u.strip().lower())
    return m.group(1) if m else None

# ---------------- YAML ----------------
def mini_yaml(text):
    """Фолбэк-парсер для формы 'список словарей: - key: value' + последующие '  key: value'."""
    docs, cur_doc, cur = {}, None, None
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip() or line.strip().startswith("#"):
            continue
        if not line.startswith((" ", "\t", "-")):
            m = re.match(r"^([^\s:#][^:]*):\s*(.*)$", line)
            if m:
                cur_doc, cur = m.group(1).strip(), None
                docs.setdefault(cur_doc, [])
            continue
        if line.lstrip().startswith("- "):
            cur = {}
            docs.setdefault(cur_doc or "items", []).append(cur)
            rest = line.lstrip()[2:].strip()
        else:
            rest = line.strip()
        if cur is None:
            continue
        m2 = re.match(r"^([\w\-.]+):\s*(.*)$", rest)
        if m2:
            v = m2.group(2).strip().strip("'\"")
            cur[m2.group(1)] = v if v else None
    return docs

def load_yaml_file(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        text = f.read()
    if HAVE_YAML:
        try:
            return _yaml.safe_load(text), None
        except Exception as e:
            return mini_yaml(text), f"safe_load failed ({e}); fallback"
    return mini_yaml(text), "no PyYAML; fallback"

def extract_groups(doc):
    """[(key, [records])] — списки словарей с полем name."""
    groups = []
    def add(k, v):
        if isinstance(v, list) and v:
            dicts = [x for x in v if isinstance(x, dict)]
            if dicts and sum(1 for x in dicts if g1(x, ("name", "id", "title", "handle"))) >= max(1, len(dicts) // 2):
                groups.append((str(k), dicts))
    if isinstance(doc, dict):
        for k, v in doc.items():
            if isinstance(v, dict):
                for k2, v2 in v.items():
                    add(f"{k}.{k2}", v2)
            else:
                add(k, v)
    elif isinstance(doc, list):
        add("(top)", doc)
    return groups

def classify(fname, keys):
    fl = fname.lower()
    if "voice" in fl or any("voice" in k.lower() for k in keys): return "VOICES"
    if "human" in fl: return "HUMAN"
    if "ai" in fl or "voice" in " ".join(keys).lower(): return "AI"
    return "OTHER"

# ---------------- feed probe ----------------
def local(el): return el.tag.split("}")[-1]

def probe(url, lang):
    r = {"url": url, "status": None, "final_url": None, "ct": None, "items": None,
         "dated": None, "newest_age_d": None, "n7": None, "n30": None,
         "stale_pct": None, "ai_hits": None, "ai_scope": None, "feed_title": None, "sample": [], "note": []}
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml,application/xml,application/atom+xml,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            r["status"] = getattr(resp, "status", 200)
            r["final_url"] = resp.geturl()
            r["ct"] = (resp.headers.get("Content-Type") or "").split(";")[0]
            data = resp.read(3_000_000)
    except urllib.error.HTTPError as e:
        r["status"] = e.code; r["note"].append(f"http {e.code}")
        return r
    except Exception as e:
        r["status"] = "ERR"; r["note"].append(type(e).__name__ + ": " + str(e)[:80])
        return r
    if r["final_url"] and host_of(r["final_url"]) != host_of(url):
        r["note"].append("redirect->" + (host_of(r["final_url"]) or "?"))
    try:
        root = ET.fromstring(data)
    except Exception:
        r["note"].append("NOT_XML (" + str(r["ct"]) + ")")
        return r
    rtag = local(root)
    entries = root.findall(".//item") if rtag.lower() != "feed" else root.findall("{http://www.w3.org/2005/Atom}entry")
    if not entries:
        entries = [el for el in root.iter() if local(el) in ("item", "entry")]
    r["items"] = len(entries)
    if not entries:
        r["note"].append("0 items")
        return r
    t0 = [el for el in root if local(el) in ("title",)]
    if t0 and t0[0].text: r["feed_title"] = t0[0].text.strip()[:60]
    dates, titles = [], []
    for it in entries:
        tt = next((el.text for el in it.iter() if local(el) == "title" and el.text), None)
        if tt: titles.append(tt.strip())
        de = next((el for el in it.iter() if local(el) in ("pubDate", "published", "updated", "date") and el.text), None)
        if de is not None:
            try:
                d = parsedate_to_datetime(de.text.strip())
            except Exception:
                try:
                    d = datetime.fromisoformat(de.text.strip().replace("Z", "+00:00"))
                except Exception:
                    d = None
            if d is not None:
                if d.tzinfo is None:
                    d = d.replace(tzinfo=timezone.utc)
                dates.append(d.astimezone(timezone.utc))
    r["dated"] = len(dates)
    if dates:
        newest = max(dates)
        r["newest_age_d"] = round((NOW - newest).total_seconds() / 86400, 1)
        r["n7"] = sum(1 for d in dates if (NOW - d).total_seconds() <= 7 * 86400)
        r["n30"] = sum(1 for d in dates if (NOW - d).total_seconds() <= 30 * 86400)
        r["stale_pct"] = round(100.0 * sum(1 for d in dates if (NOW - d).total_seconds() > 30 * 86400) / len(dates), 1)
    else:
        r["note"].append("no dates")
    r["sample"] = [t[:90] for t in titles[:3]]
    scope = titles[:300]
    r["ai_scope"] = len(scope)
    regs = KW_RE.get((lang or "en").lower().split("-")[0], KW_RE["en"])
    r["ai_hits"] = sum(1 for t in scope for rg in regs if rg.search(t))
    return r

# ---------------- storage scan ----------------
def scan_storage(root, lines_out):
    hits = {"sqlite": [], "jsonl": []}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        depth = os.path.relpath(dirpath, root).count(os.sep)
        if depth > 4: dirnames[:] = []; continue
        for fn in filenames:
            p = os.path.join(dirpath, fn)
            if fn.endswith((".db", ".sqlite", ".sqlite3")): hits["sqlite"].append(p)
            elif fn.endswith((".jsonl", ".ndjson")): hits["jsonl"].append(p)
            elif fn.endswith(".json") and re.search(r"data|storage|output|article|record", dirpath, re.I): hits["jsonl"].append(p)
    src_col = ("source", "source_name", "source_id", "feed", "src", "voice", "voices", "publisher")
    for p in hits["sqlite"][:8]:
        try:
            con = sqlite3.connect(f"file:{p}?mode=ro", uri=True)
            cur = con.cursor()
            tables = [t[0] for t in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()][:25]
            lines_out.append(f"sqlite: {os.path.relpath(p, root)}")
            for t in tables:
                try:
                    cols = [c[1] for c in cur.execute(f"PRAGMA table_info('{t}')").fetchall()]
                    total = cur.execute(f"SELECT COUNT(*) FROM '{t}'").fetchone()[0]
                    scol = next((c for c in cols if c.lower() in src_col), None)
                    seg = f"  - {t}: rows={total}, cols={','.join(cols)[:100]}"
                    if scol and total:
                        grp = cur.execute(f"SELECT {scol}, COUNT(*) FROM '{t}' GROUP BY 1 ORDER BY 2 DESC LIMIT 40").fetchall()
                        seg += " | " + "; ".join(f"{str(k)[:40]}={n}" for k, n in grp)
                    lines_out.append(seg)
                except Exception as e:
                    lines_out.append(f"  - {t}: ERR {str(e)[:60]}")
            con.close()
        except Exception as e:
            lines_out.append(f"sqlite ERR {os.path.relpath(p, root)}: {str(e)[:80]}")
    for p in hits["jsonl"][:8]:
        try:
            n = 0; first = None
            with open(p, encoding="utf-8", errors="replace") as f:
                for i, ln in enumerate(f):
                    if i == 0: first = ln.strip()
                    n += 1
                    if i > 200000: break
            rel = os.path.relpath(p, root)
            keys = ""
            try:
                obj = json.loads(first)
                if isinstance(obj, dict): keys = " keys=" + ",".join(list(obj.keys())[:14])
            except Exception:
                pass
            lines_out.append(f"jsonl: {rel} lines={n}{keys}")
        except Exception as e:
            lines_out.append(f"jsonl ERR {p}: {str(e)[:80]}")
    if not lines_out:
        lines_out.append("(хранилище не найдено: нет *.db/*.sqlite*/jsonl)")

# ---------------- main ----------------
def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    ts = NOW.strftime("%Y-%m-%d %H:%M UTC")
    os.makedirs(os.path.join(root, "diagnostics"), exist_ok=True)

    # discover yaml configs
    cfgs = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        depth = os.path.relpath(dirpath, root).count(os.sep)
        if depth > 3: dirnames[:] = []; continue
        for fn in filenames:
            if fn.endswith((".yaml", ".yml")):
                cfgs.append(os.path.join(dirpath, fn))
    cfgs.sort()

    files = []  # (path, kind, groups, raw, err)
    for p in cfgs:
        doc, err = load_yaml_file(p)
        groups = extract_groups(doc)
        with open(p, encoding="utf-8", errors="replace") as f:
            raw = f.read()
        files.append({"path": os.path.relpath(p, root), "kind": classify(os.path.basename(p), [k for k, _ in groups]),
                      "groups": groups, "raw": raw, "err": err, "size": len(raw)})

    humans = [(f, k, recs) for f in files for k, recs in f["groups"] if f["kind"] in ("HUMAN",)]
    voices = [(f, k, recs) for f in files for k, recs in f["groups"] if f["kind"] in ("VOICES",)]
    others = [(f, k, recs) for f in files for k, recs in f["groups"] if f["kind"] == "OTHER"]

    L = []
    J = {"generated": ts, "root": root, "python": sys.version.split()[0], "pyyaml": HAVE_YAML,
         "files": [], "audit": {}, "composition": {}, "probes": {}, "storage": [], "git": {}}

    L.append("# HUMAN-AI-MONITOR — АУДИТ ИСТОЧНИКОВ И VOICES")
    L.append(f"- root: `{root}`  |  {ts}  |  python {J['python']}  |  PyYAML: {HAVE_YAML}")

    g = subprocess.run(["git", "-C", root, "rev-parse", "--short", "HEAD"], capture_output=True, text=True)
    g2 = subprocess.run(["git", "-C", root, "status", "--porcelain"], capture_output=True, text=True)
    if g.returncode == 0:
        J["git"] = {"head": g.stdout.strip(), "dirty_files": len(g2.stdout.strip().splitlines()) if g2.stdout.strip() else 0}
        L.append(f"- git: `{J['git']['head']}`, изменённых файлов: {J['git']['dirty_files']}")

    L.append("\n## 1. Инвентаризация конфигов")
    for f in files:
        L.append(f"- `{f['path']}` ({f['size']} B, kind={f['kind']}{' ; ' + f['err'] if f['err'] else ''}): "
                 + ", ".join(f"{k}={len(recs)}" for k, recs in f["groups"]))
        J["files"].append({"path": f["path"], "kind": f["kind"], "groups": {k: len(r) for k, r in f["groups"]}, "err": f["err"]})
    n_h = sum(len(r) for _, _, r in humans); n_v = sum(len(r) for _, _, r in voices)
    L.append(f"- Итого: HUMAN={n_h}, VOICES={n_v}, прочие группы={sum(len(r) for _, _, r in others)}")

    # ---- structural audit ----
    L.append("\n## 2. Структурный аудит")
    audit = {}
    def recs_all(sel):
        return [(f["path"], k, rec) for f, k, recs in sel for rec in recs]
    for label, sel in (("HUMAN", humans), ("VOICES", voices)):
        rs = recs_all(sel)
        names = [str(g1(r, ("name", "id", "title", "handle")) or "?") for _, _, r in rs]
        dups_n = sorted({n for n in names if names.count(n) > 1})
        feeds = [g1(r, FEED_KEYS) for _, _, r in rs]
        fnorm = [norm_url(u) for u in feeds]
        dups_f = sorted({u for u in fnorm if u and fnorm.count(u) > 1})
        doms = [host_of(g1(r, FEED_KEYS) or "") or host_of(g1(r, SITE_KEYS) or "") or norm_url(g1(r, FEED_KEYS) or g1(r, SITE_KEYS)) for _, _, r in rs]
        doms = [d for d in doms if d]
        dups_d = sorted({d for d in doms if doms.count(d) > 1})
        missing = {}
        for label2, keys in (("feed_url", FEED_KEYS), ("lang", LANG_KEYS), ("category", CAT_KEYS),
                             ("weight", WEIGHT_KEYS), ("enabled", ENABLE_KEYS)):
            who = [n for (fp, k, r), n in zip(rs, names) if g1(r, keys) is None]
            if who: missing[label2] = who
        audit[label] = {"n": len(rs), "dup_names": dups_n, "dup_feeds": dups_f, "dup_domains": dups_d,
                        "missing_fields": missing, "cross_dom_dup": []}
        L.append(f"### {label} (n={len(rs)})")
        L.append(f"- дубликаты имён: {dups_n or 'нет'}")
        L.append(f"- дубликаты фидов (нормализованные): {dups_f or 'нет'}")
        L.append(f"- дубликаты доменов: {dups_d or 'нет'}")
        L.append(f"- отсутствуют поля: " + ("; ".join(f"{k}: {v}" for k, v in missing.items()) or "нет"))
    # cross human-vs-voices domain overlap
    hd = {host_of(g1(r, FEED_KEYS) or g1(r, SITE_KEYS) or "") for _, _, r in recs_all(humans)}
    vd = {host_of(g1(r, FEED_KEYS) or g1(r, SITE_KEYS) or "") for _, _, r in recs_all(voices)}
    ov = sorted((hd & vd) - {None})
    audit["cross_dom_dup"] = ov
    L.append(f"- пересечение доменов HUMAN∩VOICES: {ov or 'нет'}")
    # http-only feeds (proxy/mixed-era risk)
    http_feeds = [g1(r, FEED_KEYS) for _, _, r in recs_all(humans + voices) if isinstance(g1(r, FEED_KEYS), str) and g1(r, FEED_KEYS).startswith("http://")]
    audit["http_only_feeds"] = http_feeds
    L.append(f"- фиды по http (не https): {http_feeds or 'нет'}")
    J["audit"] = audit

    # ---- composition ----
    L.append("\n## 3. Состав портфеля (по полям конфига)")
    for label, sel in (("HUMAN", humans), ("VOICES", voices)):
        rs = recs_all(sel)
        for label2, keys in (("lang", LANG_KEYS), ("category", CAT_KEYS)):
            vals = [str(g1(r, keys) or "?") for _, _, r in rs]
            from collections import Counter
            cnt = Counter(vals)
            J["composition"][f"{label}_{label2}"] = dict(cnt)
            L.append(f"- {label}.{label2}: " + ", ".join(f"{k}×{v}" for k, v in cnt.most_common()))
        en_v = [str(g1(r, ENABLE_KEYS) or "?") for _, _, r in rs]
        from collections import Counter
        L.append(f"- {label}.enabled: " + ", ".join(f"{k}×{v}" for k, v in Counter(en_v).most_common()))

    # ---- feed probes ----
    L.append("\n## 4. Живой пробинг фидов (HUMAN+VOICES)")
    targets = {}
    for f, k, recs in humans + voices:
        for rec in recs:
            nm = str(g1(rec, ("name", "id", "title", "handle")) or "?")
            fu = g1(rec, FEED_KEYS)
            if isinstance(fu, str) and fu and nm not in targets:
                targets[nm] = (fu, str(g1(rec, LANG_KEYS) or ""))
    probes = {}
    with ThreadPoolExecutor(max_workers=12) as ex:
        futs = {ex.submit(probe, u, lg): (nm, u) for nm, (u, lg) in targets.items()}
        for fut in as_completed(futs):
            nm, u = futs[fut]
            try: probes[nm] = fut.result()
            except Exception as e: probes[nm] = {"url": u, "status": "EXC", "note": [str(e)[:80]]}
    J["probes"] = probes
    hdr = "| источник | HTTP | items | свежая(д) | items/7д | >30д% | AI-hit | примечание |"
    L.append(hdr); L.append("|---|---|---|---|---|---|---|---|")
    for f, k, recs in humans + voices:
        for rec in recs:
            nm = str(g1(rec, ("name", "id", "title", "handle")) or "?")
            p = probes.get(nm)
            if not p:
                fu = g1(rec, FEED_KEYS)
                if fu: L.append(f"| {nm[:34]} | — | — | — | — | — | — | нет feed_url: {norm_url(fu) or '?'} |")
                else:  L.append(f"| {nm[:34]} | — | — | — | — | — | — | нет URL |")
                continue
            notes = "; ".join(p["note"]) if p.get("note") else ("ok" if p.get("status") == 200 else "")
            L.append(f"| {nm[:34]} | {p.get('status')} | {p.get('items')} | {p.get('newest_age_d')} | {p.get('n7')} | {p.get('stale_pct')} | {p.get('ai_hits')}/{p.get('ai_scope')} | {notes[:60]} |")

    # ---- voices dump ----
    L.append("\n## 5. VOICES — исходный YAML")
    vfiles = [f for f in files if f["kind"] in ("VOICES",)]
    if vfiles:
        for f in vfiles:
            body = f["raw"].splitlines()
            L.append(f"### `{f['path']}`")
            L.append("```yaml")
            L.extend(body[:400]); L.append("```")
    else:
        L.append("NOT FOUND: ни один конфиг не классифицирован как VOICES (нет файла/ключа с 'voice'). "
                 "Ниже дамп прочих конфигов — Voices ищем там.")

    # ---- other configs dump ----
    L.append("\n## 6. Прочие конфиги — исходный YAML (кроме sources_human.yaml)")
    ofiles = [f for f in files if f["kind"] == "OTHER" and "sources_human" not in f["path"]]
    for f in ofiles:
        L.append(f"### `{f['path']}`")
        L.append("```yaml")
        L.extend(f["raw"].splitlines()[:200]); L.append("```")
    if not ofiles: L.append("(нет)")

    # ---- sources_human.yaml dump (нужны URL/языки/категории для анализа) ----
    hfiles = [f for f in files if "sources_human" in f["path"]]
    if hfiles:
        L.append("\n## 7. sources_human.yaml — исходный YAML")
        for f in hfiles:
            L.append("```yaml")
            L.extend(f["raw"].splitlines()[:600]); L.append("```")

    # ---- storage ----
    L.append("\n## 8. Хранилище (per-source счётчики)")
    scan_storage(root, J["storage"]); L.extend("- " + s for s in J["storage"])

    # ---- samples for manual review ----
    L.append("\n## 9. Примеры заголовков (первые 3 из каждого фида)")
    for nm, p in probes.items():
        if p.get("sample"):
            L.append(f"- **{nm[:40]}**: " + " // ".join(p["sample"]))

    out_md = "\n".join(L)
    stamp = NOW.strftime("%Y%m%d_%H%M")
    md_path = os.path.join(root, "diagnostics", f"sources_report_{stamp}.md")
    js_path = os.path.join(root, "diagnostics", f"sources_report_{stamp}.json")
    with open(md_path, "w", encoding="utf-8") as f: f.write(out_md + "\n")
    with open(js_path, "w", encoding="utf-8") as f:
        json.dump(J, f, ensure_ascii=False, indent=1, default=str)
    print(out_md)
    print(f"\n[saved] {md_path}\n[saved] {js_path}", file=sys.stderr)

if __name__ == "__main__":
    main()
