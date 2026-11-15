#!/usr/bin/env python3
# patch_axes.py — audit 2026-11-15 part 2: axes_human rewiring, +6 sources, Christiano fix
# DRY-RUN: python3 scripts/patch_axes.py
# APPLY:   python3 scripts/patch_axes.py --apply
# без The Conversation (Atom-фид): добавить --no-atom
import re
import sys
from pathlib import Path

APPLY = "--apply" in sys.argv
NO_ATOM = "--no-atom" in sys.argv

F_HUMAN = Path("config/sources_human.yaml")
F_AI = Path("config/sources_ai.yaml")
F_AXES = Path("config/axes_human.yaml")
F_VOICES = Path("config/voices.yaml")
F_TEST = Path("test/index.spec.ts")

for f in (F_HUMAN, F_AI, F_AXES, F_VOICES, F_TEST):
    if not f.exists():
        print("Файл не найден: %s — запускай из корня репозитория" % f)
        sys.exit(2)

NEW_SOURCES = [
    ("WHO", "https://www.who.int/rss-feeds/news-english.xml", 1,
     "WHO news; global health, outbreaks, health systems (audit 2026-11-15); anchors h5_wellbeing"),
    ("CPJ", "https://cpj.org/feed/", 1,
     "Committee to Protect Journalists; press freedom, censorship (audit 2026-11-15); anchors h6_governance"),
    ("Nature Medicine", "https://www.nature.com/nm.rss", 1,
     "medical research, health policy (audit 2026-11-15); anchors h5_wellbeing"),
    ("ArtsJournal", "https://www.artsjournal.com/feed", 2,
     "arts and culture media aggregator (audit 2026-11-15); anchors h3_culture"),
    ("Hyperallergic", "https://hyperallergic.com/rss/", 2,
     "contemporary art, culture policy (audit 2026-11-15); anchors h3_culture"),
]
if not NO_ATOM:
    NEW_SOURCES.append(
        ("The Conversation", "https://theconversation.com/articles.atom", 1,
         "academic expert commentary; universities, science and culture policy (audit 2026-11-15); anchors h3_culture"))

AXES = {
    "h1_science": ["Nature", "Science"],
    "h2_engineering": ["IEEE Spectrum", "MIT News (Engineering)"],
    "h3_culture": ["ArtsJournal", "Hyperallergic"] + ([] if NO_ATOM else ["The Conversation"]),
    "h4_institutions": ["MIT News (Engineering)", "Inside Higher Ed"],
    "h5_wellbeing": ["Science", "WHO", "Nature Medicine"],
    "h6_governance": ["Business & Human Rights Resource Centre", "CPJ"],
}

n_ok = n_skip = n_fail = 0


def mark(fname, status, diff):
    global n_ok, n_skip, n_fail
    if status == "OK":
        n_ok += 1
    elif status == "SKIP":
        n_skip += 1
    else:
        n_fail += 1
    tag = {"OK": "[OK]  ", "SKIP": "[skip]", "FAIL": "[FAIL]"}[status]
    print("%s %s" % (tag, fname))
    for d in diff:
        print("      " + d)


def op_add_sources(text):
    existing = set(re.findall(r"^- name:\s*(.+?)\s*$", text, re.M))
    dups = [s[0] for s in NEW_SOURCES if s[0] in existing]
    if dups:
        return None, ["дубликаты уже в пуле: " + ", ".join(dups)], "FAIL"
    add = []
    for name, url, tier, note in NEW_SOURCES:
        add.append("- name: %s\n" % name)
        add.append("  url: %s\n" % url)
        add.append("  lang: en\n")
        add.append("  tier: %d\n" % tier)
        add.append("  note: %s\n" % note)
    lines = text.splitlines(keepends=True)
    idx = None
    for i, l in enumerate(lines):
        if l.rstrip("\n") == "html_sources:":
            idx = i
            break
    if idx is None:
        if lines and not lines[-1].endswith("\n"):
            lines[-1] += "\n"
        lines = lines + add
    else:
        lines = lines[:idx] + add + lines[idx:]
    return "".join(lines), ["+" + l.rstrip("\n") for l in add], "OK"


def replace_axis(out, axis):
    pat = re.compile(r"^(\s*)%s:\s*(?:#.*)?$" % re.escape(axis))
    for i in range(len(out)):
        m = pat.match(out[i].rstrip("\n"))
        if not m:
            continue
        key_ind = len(m.group(1))
        src_i = src_ind = None
        inline = None
        for j in range(i + 1, len(out)):
            l2 = out[j].rstrip("\n")
            m2 = re.match(r"^(\s*)([A-Za-z_][\w\-]*)\s*:", l2)
            if m2 and len(m2.group(1)) <= key_ind:
                break
            m3 = re.match(r"^(\s*)sources:\s*(\[[^\]]*\])?\s*(?:#.*)?$", l2)
            if m3:
                src_i, src_ind, inline = j, len(m3.group(1)), m3.group(2)
        if src_i is None:
            return out, ["ключ 'sources:' не найден в блоке " + axis], "FAIL"
        if inline is not None:
            old_line = out[src_i].rstrip("\n")
            new_line = " " * src_ind + "sources: [" + ", ".join('"%s"' % s for s in AXES[axis]) + "]\n"
            out[src_i] = new_line
            return out, ["-" + old_line, "+" + new_line.rstrip("\n")], "OK"
        k = src_i + 1
        old = []
        old_ind = None
        while k < len(out):
            s = out[k].rstrip("\n")
            m4 = re.match(r"^(\s*)-\s", s)
            if not m4:
                break
            if old_ind is None:
                old_ind = m4.group(1)
            if m4.group(1) != old_ind:
                break
            old.append(out[k])
            k += 1
        if not old:
            old_ind = " " * (src_ind + 2)
        new_items = [old_ind + "- " + s + "\n" for s in AXES[axis]]
        diff = ["-" + o.rstrip("\n") for o in old] + ["+" + s.rstrip("\n") for s in new_items]
        out[src_i + 1:k] = new_items
        return out, diff, "OK"
    return out, ["ось %s не найдена" % axis], "FAIL"


def op_christiano(text):
    lines = text.splitlines(keepends=True)
    start = None
    for i, l in enumerate(lines):
        if l.rstrip("\n") == "- name: Paul Christiano":
            start = i
            break
    if start is None:
        return None, ["голос 'Paul Christiano' не найден"], "FAIL"
    end = len(lines)
    for j in range(start + 1, len(lines)):
        if lines[j].startswith("- name:"):
            end = j
            break
    for l in lines[start:end]:
        if re.match(r"^\s*sources:", l):
            return None, ["sources уже есть у Christiano"], "SKIP"
    note_i = None
    for j in range(start, end):
        if re.match(r"^\s*note:", lines[j]):
            note_i = j
            break
    if note_i is None:
        return None, ["строка note не найдена в блоке Christiano"], "FAIL"
    ins = "  sources: []\n"
    diff = ["+" + ins.rstrip("\n"), "(вставлено перед: " + lines[note_i].rstrip("\n") + ")"]
    lines = lines[:note_i] + [ins] + lines[note_i:]
    return "".join(lines), diff, "OK"


def op_updated(text):
    if "updated: 2026-11-15-v6" in text:
        return None, ["updated уже 2026-11-15-v6"], "SKIP"
    new_text, n = re.subn(r"^updated:\s*2026-11-15-v5\s*$", "updated: 2026-11-15-v6", text, count=1, flags=re.M)
    if n == 0:
        return None, ["строка 'updated: 2026-11-15-v5' не найдена"], "FAIL"
    return new_text, ["-updated: 2026-11-15-v5", "+updated: 2026-11-15-v6"], "OK"


def op_test(text):
    if "expect(data.sources_count).toBe(SOURCES.length)" in text:
        return None, ["тест уже динамический"], "SKIP"
    old = "expect(data.sources_count).toBe(61);"
    if old not in text:
        return None, ["toBe(61) не найден в index.spec.ts"], "FAIL"
    return text.replace(old, "expect(data.sources_count).toBe(SOURCES.length);", 1), \
        ["-" + old, "+expect(data.sources_count).toBe(SOURCES.length);"], "OK"


def self_check():
    import yaml
    h = yaml.safe_load(F_HUMAN.read_text(encoding="utf-8"))
    a = yaml.safe_load(F_AI.read_text(encoding="utf-8"))
    v = yaml.safe_load(F_VOICES.read_text(encoding="utf-8"))
    ax = yaml.safe_load(F_AXES.read_text(encoding="utf-8"))
    pool = set()
    for s in (h.get("rss") or []) + (h.get("html_sources") or []) + (a.get("rss") or []) + (a.get("html_sources") or []):
        pool.add(s["name"])
    problems = []
    axes = ax.get("axes") or {}
    for aid, want in AXES.items():
        got = (axes.get(aid) or {}).get("sources") or []
        if got != want:
            problems.append("%s: got=%r want=%r" % (aid, got, want))
    n_vd = 0
    for vv in (v.get("voices") or []):
        for s in (vv.get("sources") or []):
            if s not in pool:
                n_vd += 1
                problems.append("voice dangling: %s -> %s" % (vv.get("name"), s))
    ch = [x for x in (v.get("voices") or []) if x.get("name") == "Paul Christiano"]
    if not ch:
        problems.append("голос Paul Christiano отсутствует")
    elif ch[0].get("sources") != []:
        problems.append("Christiano sources=%r" % (ch[0].get("sources"),))
    if v.get("updated") != "2026-11-15-v6":
        problems.append("updated=%r" % (v.get("updated"),))
    return problems, len(pool), n_vd


def main():
    print("=" * 72)
    print("PATCH-AXES  режим: %s%s" % ("APPLY" if APPLY else "DRY-RUN", "  [--no-atom]" if NO_ATOM else ""))
    print("=" * 72)

    t = F_HUMAN.read_text(encoding="utf-8")
    new_human, diff, st = op_add_sources(t)
    mark("config/sources_human.yaml (+%d записей)" % len(NEW_SOURCES), st, diff)

    t = F_AXES.read_text(encoding="utf-8")
    out = t.splitlines(keepends=True)
    for axis in AXES:
        out, diff, st = replace_axis(out, axis)
        mark("config/axes_human.yaml :: " + axis, st, diff)
    new_axes = "".join(out)

    t = F_VOICES.read_text(encoding="utf-8")
    nt1, d1, s1 = op_christiano(t)
    mark("config/voices.yaml :: Paul Christiano sources: []", s1, d1)
    base_v = nt1 if nt1 is not None else t
    nt2, d2, s2 = op_updated(base_v)
    mark("config/voices.yaml :: updated v5 -> v6", s2, d2)
    new_voices = nt2 if nt2 is not None else base_v

    t = F_TEST.read_text(encoding="utf-8")
    nt3, d3, s3 = op_test(t)
    mark("test/index.spec.ts :: sources_count -> SOURCES.length", s3, d3)
    new_test = nt3 if nt3 is not None else t

    print("-" * 72)
    print("ИТОГ: применяемо=%d, skip(уже есть)=%d, FAIL=%d" % (n_ok, n_skip, n_fail))

    if not APPLY:
        print("Это DRY-RUN. Для применения:  python3 scripts/patch_axes.py --apply")
        return

    if n_fail:
        print("APPLY отменён: есть FAIL. Правь план и повтори DRY-RUN.")
        sys.exit(1)

    F_HUMAN.write_text(new_human, encoding="utf-8")
    F_AXES.write_text(new_axes, encoding="utf-8")
    F_VOICES.write_text(new_voices, encoding="utf-8")
    F_TEST.write_text(new_test, encoding="utf-8")
    for f in ("config/sources_human.yaml", "config/axes_human.yaml", "config/voices.yaml", "test/index.spec.ts"):
        print("[written] " + f)

    problems, pool_n, n_vd = self_check()
    if problems:
        print("SELF-CHECK: FAIL")
        for p in problems:
            print("   " + p)
        sys.exit(1)
    print("SELF-CHECK: PASS (pool=%d, voices_dangling=%d, axes=6)" % (pool_n, n_vd))


main()
