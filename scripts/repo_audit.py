#!/usr/bin/env python3
"""
repo_audit.py — consistency audit для Human-AI Monitor (EN/RU/ZH).

Рождён из находок сессии 2026-09. Запуск локально:
    python3 scripts/repo_audit.py
CI: .github/workflows/docs-check.yml (push / PR / еженедельно).

Коды выхода: 0 = ок (warn допустимы), 1 = есть FAIL.
"""
import pathlib, re, sys

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
    for v in fps.values():
        m = re.search(r"\[(\d+\.\d+\.\d+)", v[2])
        vt.append(m.group(1) if m else None)
    if len({x for x in vt if x}) > 1:
        fail(f"CHANGELOG: версии ведущей секции расходятся: {vt}")
    if any(x is None for x in vt):
        warn(f"CHANGELOG: ведущая секция не помечена версией: {vt}")
    else:
        ok(f"CHANGELOG: релизная секция {vt[0]} ×3")

if len(set(sec_counts.values())) != 1:
    warn(f"CHANGELOG: историческая глубина различается (только отчёт): {sec_counts}")

# ---------- 4. Канонические пары ----------
CANON = ["README", "CHANGELOG", "CONTRIBUTING", "MANIFESTO", "CODE_OF_CONDUCT"]
gap = [f"{b}{s}" for b in CANON for s in (".ru.md", ".zh.md")
       if not (ROOT / f"{b}{s}").exists() or (ROOT / f"{b}{s}").stat().st_size == 0]
if gap:
    fail(f"canon pairs: отсутствуют/пусты: {gap}")
else:
    ok("canon pairs: 5 документов × {ru,zh} на месте")

# ---------- 5. Версия: единая истина ----------
pkg = re.search(r'"version":\s*"([^"]+)"', read(ROOT / "package.json"))
cit = re.search(r"^version:\s*(\S+)\s*$", read(ROOT / "CITATION.cff"), re.M)
srcs = re.findall(r'version:\s*"(\d+\.\d+\.\d+)"', read(ROOT / "src" / "index.ts"))
if not (pkg and cit and srcs):
    fail("version: не извлеклась из всех трёх источников")
elif len({pkg.group(1), cit.group(1), *srcs}) != 1:
    fail(f"version: расходится: package.json={pkg.group(1)}, CITATION={cit.group(1)}, index.ts={sorted(set(srcs))}")
else:
    ok(f"version: {pkg.group(1)} согласована (package.json, CITATION.cff, index.ts ×{len(srcs)})")

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
    (r"我们在一起 - 就很强大", "старая форма девиза (канон: 就是力量)"),
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
    fail("translation.ts: старый ZH-глоссарий вернулся")
elif "我们在一起，就是力量！" not in tr or "为他人带来更大的福祉" not in tr:
    fail("translation.ts: утверждённый ZH-канон отсутствует в глоссарии")
else:
    ok("translation.ts: ZH-глоссарий = утверждённый канон")

# ---------- Отчёт ----------
print("=" * 62)
for m in OKS:   print(" ✅", m)
for m in WARNS: print(" ⚠️ ", m)
for m in FAILS: print(" ❌", m)
print("=" * 62)
print(f"Итог: {len(OKS)} ok / {len(WARNS)} warn / {len(FAILS)} FAIL")
sys.exit(1 if FAILS else 0)
