#!/usr/bin/env python3
"""
repo_audit.py — consistency audit для Human-AI Monitor (EN/RU/ZH).

Рождён из находок сессии 2026-09. Запуск локально:
    python3 scripts/repo_audit.py
CI: .github/workflows/docs-check.yml (push / PR / еженедельно).

Коды выхода: 0 = ок (warn допустимы), 1 = есть FAIL.
"""
import pathlib, re, sys, json, fnmatch, subprocess

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

# ---------- 2b. Parity of headings in trilingual docs/ families ----------
TRILINGUAL_DOCS = ["architecture", "methodology", "math_brief", "bayesian_framework"]
for base in TRILINGUAL_DOCS:
    local = {}
    for suffix in ("md", "ru.md", "zh.md"):
        f = ROOT / "docs" / f"{base}.{suffix}"
        if not f.exists():
            fail(f"docs/{base}.{suffix}: not found")
            continue
        tt = read(f)
        local[suffix] = (len(re.findall(r"^## ", tt, re.M)),
                         len(re.findall(r"^### ", tt, re.M)))
    if not local:
        continue
    vals = set(local.values())
    if len(vals) != 1:
        fail(f"docs/{base}.*.md headings: H2/H3 mismatch: {local}")
    else:
        h2, h3 = next(iter(vals))
        ok(f"docs/{base}.*.md headings: H2={h2} H3={h3} x3")

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
    versioned = [s for s in lead if re.search(r"\[\d+\.\d+\.\d+\]", s["header"])]
    ref = versioned[0] if versioned else (lead[0] if lead else None)
    if ref is None:
        fail(f"CHANGELOG {f}: нет непустых секций")
        continue
    fps[f] = (ref["titles"], ref["h3"], ref["header"])

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
    if d.name.endswith(".ru.md") or d.name.endswith(".zh.md"):
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

# Closing slogans removed from protocols (commit 1ab3fb3): closing lives in
# README only. The former ZH-glossary check in translation.ts is obsolete —
# canonical phrases no longer appear in the LLM prompt. Kept the README-level
# regression patterns above (line 215/233) which still guard README content.

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

# ---------- 9. Language navigation ----------
NAV_WHITELIST_GLOBS = (
    ".agents/*",
    "data/protocols/README.md",
    "data/protocols/*.interim.*",
    "data/protocols/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*.md",
)
NAV_RE = re.compile(
    r"(Language|language|Язык|язык|Языки|языки|语言|"
    r"shields\.io/static/v1|img\.shields\.io|badge/lang-)"
)

def nav_whitelisted(rel: str) -> bool:
    return any(fnmatch.fnmatch(rel, pat) for pat in NAV_WHITELIST_GLOBS)

missing_nav = []
for p_ in MD_FILES:
    rel = str(p_.relative_to(ROOT))
    if nav_whitelisted(rel):
        continue
    if not NAV_RE.search(p_.read_text(encoding="utf-8")):
        missing_nav.append(rel)
if missing_nav:
    fail(f"language nav: отсутствует в {len(missing_nav)} файлах: {missing_nav[:5]}")
else:
    ok(f"language nav: все {len(MD_FILES)} .md с навигацией ({len(NAV_WHITELIST_GLOBS)} в whitelist)")

# ---------- 10. Cross-references ----------
LINK_RE = re.compile(r"\]\(([^)]+)\)")
MATH_CHARS = set("{}^\\")

broken_refs = []
for p_ in MD_FILES:
    dirp = p_.parent
    for i, line in enumerate(p_.read_text(encoding="utf-8").split("\n"), 1):
        for m in LINK_RE.finditer(line):
            link = m.group(1).strip()
            if link.startswith(("http://", "https://", "mailto:", "#")):
                continue
            if len(link) == 1 or any(c in MATH_CHARS for c in link):
                continue
            target = link.split("#", 1)[0]
            if not target:
                continue
            if not (dirp / target).exists() and not (ROOT / target).exists():
                broken_refs.append(f"{p_.relative_to(ROOT)}:{i} -> {link}")
if broken_refs:
    fail(f"cross-refs: {len(broken_refs)} битых: {broken_refs[:5]}")
else:
    ok("cross-refs: все markdown-ссылки валидны")

# ---------- 11. Security ----------
def git_ls_files():
    try:
        r = subprocess.run(["git", "ls-files"], cwd=ROOT,
                           capture_output=True, text=True, check=True)
        return r.stdout.splitlines()
    except Exception:
        return []

tracked = git_ls_files()
if not tracked:
    warn("security: git ls-files недоступен — проверки секретов пропущены")
else:
    SENS_RE = re.compile(
        r"(^|/)\.env(\.|$)|(^|/)\.dev\.vars$|\.pem$|\.key$|\.p12$|\.pfx$|"
        r"(^|/)secrets\.(json|ya?ml)$|(^|/)credentials\.(json|ya?ml)$|"
        r"(^|/)id_(rsa|dsa|ecdsa|ed25519)$"
    )
    sens = [f for f in tracked
            if SENS_RE.search(f)
            and not f.endswith((".example", ".sample", ".template"))]
    if sens:
        fail(f"security: чувствительные файлы в git: {sens}")
    else:
        ok("security: нет чувствительных файлов в git")

    PLACE_RE = re.compile(
        r"YOUR_|EXAMPLE|CHANGEME|CHANGE_ME|[xX]{4,}|placeholder|dummy|"
        r"fake|sample|redacted|\*\*\*|<[^>]+>|sk-xxx|api[_-]?key-here"
    )
    SEC_PATS = [
        re.compile(r"AKIA[0-9A-Z]{16}"),
        re.compile(r"gh[pousr]_[A-Za-z0-9]{36,}"),
        re.compile(r"sk-ant-[A-Za-z0-9_-]{20,}"),
        re.compile(r"sk-[A-Za-z0-9]{32,}"),
        re.compile(r"BEGIN (RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY"),
        re.compile(r"api[_-]?key\s*[:=]\s*[A-Za-z0-9_-]{24,}"),
        re.compile(r"secret[_-]?key\s*[:=]\s*[A-Za-z0-9_-]{24,}"),
        re.compile(r"access[_-]?token\s*[:=]\s*[A-Za-z0-9_-]{24,}"),
        re.compile(r"bearer\s+[A-Za-z0-9._-]{30,}", re.I),
    ]
    SKIP_SUFFIX = {".png", ".jpg", ".jpeg", ".svg", ".ico",
                   ".woff", ".woff2", ".ttf", ".lock", ".min.js"}
    secrets_hits = []
    for f in tracked:
        if f.endswith("package-lock.json") or pathlib.Path(f).suffix in SKIP_SUFFIX:
            continue
        fp = ROOT / f
        if not fp.exists():
            continue
        try:
            text = fp.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for ln in text.split("\n"):
            for pat in SEC_PATS:
                if pat.search(ln) and not PLACE_RE.search(ln):
                    secrets_hits.append(f"{f}: {ln.strip()[:80]}")
                    break
    if secrets_hits:
        fail(f"security: {len(secrets_hits)} hardcoded secrets: {secrets_hits[:3]}")
    else:
        ok("security: нет hardcoded secrets")

    gi = ROOT / ".gitignore"
    if gi.exists():
        gi_text = read(gi)
        required = [".env", ".dev.vars", "node_modules", "*.key", "*.pem", ".wrangler"]
        miss = [x for x in required if x not in gi_text]
        if miss:
            warn(f"security: .gitignore не содержит: {miss}")
        else:
            ok(f"security: .gitignore покрывает {len(required)} шаблонов")
    else:
        fail("security: .gitignore отсутствует")

    if (ROOT / "node_modules").exists() and (ROOT / "package.json").exists():
        try:
            r = subprocess.run(["npm", "audit", "--omit=dev", "--json"],
                               cwd=ROOT, capture_output=True, text=True, timeout=90)
            data = json.loads(r.stdout or "{}")
            total = data.get("metadata", {}).get("vulnerabilities", {}).get("total", 0)
            if total:
                fail(f"security: npm audit — {total} уязвимостей (production)")
            else:
                ok("security: npm audit — 0 уязвимостей (production)")
        except Exception as e:
            warn(f"security: npm audit не выполнен: {e}")

# ---------- 12. [Unreleased] header localization ----------
for fname, marker in CHANGELOGS.items():
    txt = read(ROOT / fname)
    if marker not in txt:
        fail(f"{fname}: localized [Unreleased] marker {marker!r} not found")

FORBIDDEN = [
    ("CHANGELOG.ru.md", "[Unreleased]"),
    ("CHANGELOG.ru.md", "[未发布]"),
    ("CHANGELOG.zh.md", "[Unreleased]"),
    ("CHANGELOG.zh.md", "[Неопубликовано]"),
    ("CHANGELOG.md",    "[Неопубликовано]"),
    ("CHANGELOG.md",    "[未发布]"),
]
for fname, bad in FORBIDDEN:
    if bad in read(ROOT / fname):
        fail(f"{fname}: forbidden marker {bad!r} found")

ok("[Unreleased] localization: 3 markers correct, no cross-language leakage")

# ---------- Отчёт ----------
print("=" * 62)
for m in OKS:   print(" ✅", m)
for m in WARNS: print(" ⚠️ ", m)
for m in FAILS: print(" ❌", m)
print("=" * 62)
print(f"Итог: {len(OKS)} ok / {len(WARNS)} warn / {len(FAILS)} FAIL")
sys.exit(1 if FAILS else 0)
