#!/usr/bin/env python3
"""
repo_audit.py — consistency audit для Human-AI Monitor (EN/RU/ZH).

Рождён из находок сессии 2026-09. Запуск локально:
    python3 scripts/repo_audit.py
CI: .github/workflows/docs-check.yml (push / PR / еженедельно).

Коды выхода: 0 = ок (warn допустимы), 1 = есть FAIL.
"""
import pathlib, re, sys, json

ROOT = pathlib.Path(__file__).resolve().parents[1]
FAILS, WARNS, OKS = [], [], []

def fail(msg): FAILS.append(msg)
def warn(msg): WARNS.append(msg)
def ok(msg):   OKS.append(msg)
def read(p):   return pathlib.Path(p).read_text(encoding="utf-8")

READMES = ["README.md", "README.ru.md", "README.zh.md"]
CHANGELOGS = {"CHANGELOG.md": "[Unreleased]",
              "CHANGELOG.ru.md": "[Неопубликовано]",
              "CHANGELOG.zh.md": "[未发布]"}
COC = ["CODE_OF_CONDUCT.md", "CODE_OF_CONDUCT.ru.md", "CODE_OF_CONDUCT.zh.md"]

# ---------- 1. Дерево <-> диск ----------
GLYPH = re.compile(r"[├└]──\s*")

def tree_entries(text):
    entries, stack = [], []
    for raw in text.split("\n"):
        m = GLYPH.search(raw)
        if not m:
            continue
        col = m.start()
        while stack and stack[-1][0] >= col:
            stack.pop()
        tok = raw[m.end():].split("←")[0]
        tok = re.split(r"[（(]", tok)[0].strip().rstrip(".,;")
        if not tok or ".." in tok:
            continue
        base = "/".join(d for _, d in stack)
        entries.append((f"{base}/{tok}" if base else tok, tok.endswith("/")))
        if tok.endswith("/"):
            stack.append((col, tok.rstrip("/")))
    return entries

for f in READMES:
    entries = tree_entries(read(ROOT / f))
    missing = sorted({t.rstrip("/") for t, _ in entries
                      if "*" not in t and not (ROOT / t.rstrip("/")).exists()})
    if missing:
        fail(f"tree->disk {f}: нет на диске: {missing}")
    else:
        ok(f"tree->disk {f}: {len(entries)} записей, всё существует")
    listed = {t.split("/")[-1] for t, _ in entries}
    orphans = sorted(p.name for p in ROOT.glob("*.md") if p.name not in listed)
    if orphans:
        fail(f"disk->tree {f}: не отражены в дереве: {orphans}")
    else:
        ok(f"disk->tree {f}: top-level *.md покрыты")

# ---------- 2. Паритет заголовков README ----------
heads = {}
for f in READMES:
    t = read(ROOT / f)
    heads[f] = (len(re.findall(r"^## ", t, re.M)), len(re.findall(r"^### ", t, re.M)))
if len(set(heads.values())) != 1:
    fail(f"README headings: расходятся H2/H3: {heads}")
else:
    h2, h3 = next(iter(heads.values()))
    ok(f"README headings: H2={h2} H3={h3} ×3")

# ---------- 3. Отпечаток релизной секции CHANGELOG ----------
def changelog_sections(text):
    lines = text.split("\n")
    idx = [i for i, l in enumerate(lines) if l.startswith("## [")]
    out = []
    for k, i in enumerate(idx):
        end = idx[k + 1] if k + 1 < len(idx) else len(lines)
        body = lines[i + 1:end]
        out.append({"header": lines[i].strip(),
                    "titles": sum(1 for l in body if l.startswith("- **")),
                    "h3": sum(1 for l in body if l.startswith("### "))})
    return out

fps, sec_counts = {}, {}
for f in CHANGELOGS:
    secs = changelog_sections(read(ROOT / f))
    sec_counts[f] = len(secs)
    lead = [s for s in secs if s["titles"] > 0]
    if not lead:
        fail(f"CHANGELOG {f}: нет непустых секций")
        continue
    fps[f] = (lead[0]["titles"], lead[0]["h3"], lead[0]["header"])

if len(fps) == 3:
    vals = {v[:2] for v in fps.values()}
    if len(vals) != 1:
        fail(f"CHANGELOG fingerprint: расходится: { {k: v[:2] for k, v in fps.items()} }")
    else:
        t, h = next(iter(vals))
        ok(f"CHANGELOG fingerprint: {t} титулов / {h} секций ×3")
    vt = []
    for fname, v in fps.items():
        m = re.search(r"\[(\d+\.\d+\.\d+)", v[2])
        if m is None and CHANGELOGS[fname] in v[2]:
            # Ведущая секция — канонический Unreleased: версия из первой релизной секции
            for s in changelog_sections(read(ROOT / fname))[1:]:
                m2 = re.search(r"\[(\d+\.\d+\.\d+)", s["header"])
                if m2:
                    m = m2
                    break
        vt.append(m.group(1) if m else None)
    if len({x for x in vt if x}) > 1:
        fail(f"CHANGELOG: версии релизных секций расходятся: {vt}")
    if any(x is None for x in vt):
        warn(f"CHANGELOG: не найдена релизная секция с версией: {vt}")
    else:
        ok(f"CHANGELOG: релизная секция {vt[0]} ×3")

if sec_counts["CHANGELOG.ru.md"] != sec_counts["CHANGELOG.zh.md"]:
    warn(f"CHANGELOG: RU/ZH глубина различается: {sec_counts}")
else:
    ok(f"CHANGELOG: глубина согласована (RU/ZH={sec_counts['CHANGELOG.ru.md']}, EN={sec_counts['CHANGELOG.md']} минималистичен по дизайну)")

# ---------- 4. Канонические пары ----------
CANON = ["README", "CHANGELOG", "CONTRIBUTING", "MANIFESTO", "CODE_OF_CONDUCT"]
gap = [f"{b}{s}" for b in CANON for s in (".ru.md", ".zh.md")
       if not (ROOT / f"{b}{s}").exists() or (ROOT / f"{b}{s}").stat().st_size == 0]
if gap:
    fail(f"canon pairs: отсутствуют/пусты: {gap}")
else:
    ok("canon pairs: 5 документов × {ru,zh} на месте")

# ---------- 4b. docs/: EN+RU по дизайну (AGENTS.md rule 3) ----------
docs_gap = []
for d in sorted((ROOT / "docs").glob("*.md")):
    if d.name.endswith(".ru.md"):
        continue
    ru = d.with_name(d.stem + ".ru.md")
    if not ru.exists() or ru.stat().st_size == 0:
        docs_gap.append(d.name)
if docs_gap:
    fail(f"docs pairs: нет RU-зеркала: {docs_gap}")
else:
    en_n = sum(1 for d in (ROOT / "docs").glob("*.md") if not d.name.endswith(".ru.md"))
    ok(f"docs pairs: {en_n} документов × {{en,ru}} (по дизайну; ZH по запросу)")

# ---------- 5. Версия: единая истина ----------
pkg = re.search(r'"version":\s*"([^"]+)"', read(ROOT / "package.json"))
cit = re.search(r"^version:\s*(\S+)\s*$", read(ROOT / "CITATION.cff"), re.M)
cit_date = re.search(r"^date-released:\s*(\d{4}-\d{2}-\d{2})\s*$", read(ROOT / "CITATION.cff"), re.M)
idx_src = read(ROOT / "src" / "index.ts")
imports_pkg = ('from "../package.json"' in idx_src) or ("from '../package.json'" in idx_src)
hard = re.findall(r'version:\s*"(\d+\.\d+\.\d+)"', idx_src)
if not (pkg and cit):
    fail("version: package.json/CITATION.cff не распарсились")
elif hard:
    fail(f"version: index.ts хардкодит {hard} — должен импортировать package.json")
elif not imports_pkg:
    fail("version: index.ts не импортирует package.json")
elif pkg.group(1) != cit.group(1):
    fail(f"version: расходится: package.json={pkg.group(1)}, CITATION={cit.group(1)}")
else:
    ok(f"version: {pkg.group(1)} согласована (package.json = CITATION.cff; index.ts импортирует package.json)")
m_cl = re.search(r"^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})", read(ROOT / "CHANGELOG.md"), re.M)
if cit_date and m_cl:
    if cit_date.group(1) != m_cl.group(2):
        fail(f"release date: CITATION={cit_date.group(1)} vs CHANGELOG {m_cl.group(1)}={m_cl.group(2)}")
    else:
        ok(f"release date: {cit_date.group(1)} согласована (CITATION.cff = CHANGELOG {m_cl.group(1)})")

# ---------- 6. Ссылки CoC в каждом README ----------
for f in READMES:
    t = read(ROOT / f)
    miss = [c for c in COC
            if not re.search(r"^- \[.*\]\(" + re.escape(c) + r"\)", t, re.M)]
    if miss:
        fail(f"CoC links {f}: нет пунктов списка для {miss}")
    else:
        ok(f"CoC links {f}: 3/3 языка")

# ---------- 7. Регрессии-паттерны ----------
MD_FILES = [p for p in ROOT.rglob("*.md")
            if ".git" not in p.parts and "node_modules" not in p.parts]
REGRESSIONS = [
    (r"我们在起",             "ZH-опечатка девиза (пропущена 一)"),
    (r"我们在一起 - 就很强大", "старая форма девиза (утверждённый ZH-перевод: 就是力量)"),
    (r"我们在在一起",          "двойной 在 (артефакт правки)"),
    (r"带来更大的利益",         "利益 вместо 福祉 в closing-фразе"),
    (r"Многопользовательская", "ошибка перевода multilingual"),
    (r"Нью-Дели»",            "висячая » у Нью-Дели"),
    (r'New Delhi"\.',         "висячая кавычка у New Delhi"),
    (r"^\s*curl\s*$",         "разорванная curl-команда"),
    (r"6 tables:",            "неверное число таблиц D1"),
    (r"Критикуй аргумент",     "невежливая форма в принципе 1"),
]
hits = 0
for p in MD_FILES:
    for i, l in enumerate(p.read_text(encoding="utf-8").split("\n"), 1):
        for pat, why in REGRESSIONS:
            if re.search(pat, l):
                fail(f"regression {p.relative_to(ROOT)}:{i}: {why}")
                hits += 1
if hits == 0:
    ok(f"regressions: 0 вхождений по {len(REGRESSIONS)} паттернам в {len(MD_FILES)} файлах")

if "Приносить благо" in read(ROOT / "README.md"):
    fail("regression README.md: русская closing-строка в EN-файле")

tr = read(ROOT / "src" / "services" / "translation.ts")
if "我们在起" in tr or "带来更大的利益" in tr:
    fail("translation.ts: в ZH-глоссарий вернулись до-канонные формы (ожидаются утверждённые переводы каноничных EN-фраз)")
elif "我们在一起，就是力量！" not in tr or "为他人带来更大的福祉" not in tr:
    fail("translation.ts: в ZH-глоссарии нет утверждённых переводов каноничных EN-фраз")
else:
    ok("translation.ts: ZH-глоссарий = утверждённые переводы каноничных EN-фраз (EN — канон, RU/ZH — зеркала)")

# ---------- 8. Cron-батчи: wrangler == ключи CRON_BATCH_META ----------
w_clean = re.sub(r"/\*.*?\*/", "", read(ROOT / "wrangler.jsonc"), flags=re.S)
w_clean = re.sub(r"^\s*//.*$", "", w_clean, flags=re.M)
try:
    crons_wr = set(json.loads(w_clean)["triggers"]["crons"])
except Exception as e:
    crons_wr = set(); fail(f"cron: wrangler.jsonc не распарсился: {e}")
m_blk = re.search(r"export const CRON_BATCH_META[^=]*=\s*\{(.*?)\n\};", read(ROOT / "src" / "index.ts"), re.S)
if not m_blk:
    fail("cron: CRON_BATCH_META не найден в src/index.ts")
else:
    crons_code = set(re.findall(r'"((?:[\d*/]+ ){4}[\d*/]+)"', m_blk.group(1)))
    if crons_wr != crons_code:
        fail(f"cron: триггеры расходятся: wrangler={sorted(crons_wr)} vs config={sorted(crons_code)}")
    else:
        ok(f"cron: триггеры согласованы ({len(crons_wr)}) — wrangler.jsonc == CRON_BATCH_META")

# ---------- Отчёт ----------
print("=" * 62)
for m in OKS:   print(" ✅", m)
for m in WARNS: print(" ⚠️ ", m)
for m in FAILS: print(" ❌", m)
print("=" * 62)
print(f"Итог: {len(OKS)} ok / {len(WARNS)} warn / {len(FAILS)} FAIL")
sys.exit(1 if FAILS else 0)
