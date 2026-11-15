#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patch_audit.py — патчи по итогам аудита источников/Voices (2026-11-15).

Режимы:
  python3 scripts/patch_audit.py            — DRY-RUN: только показывает diff
  python3 scripts/patch_audit.py --apply    — применить правки yaml
  python3 scripts/patch_audit.py --code     — + CJK-фикс матчера (src/services/voices.ts)

Ничего не выполняет (node/npm/git не запускает). Откат: git checkout -- <файлы>.
Каждая операция либо находит точный якорь, либо FAIL — половинных записей нет.
"""
import os, sys, difflib

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
APPLY = "--apply" in sys.argv
CODE = "--code" in sys.argv

P_HUMAN = os.path.join(ROOT, "config", "sources_human.yaml")
P_AI = os.path.join(ROOT, "config", "sources_ai.yaml")
P_VOICES = os.path.join(ROOT, "config", "voices.yaml")
P_MATCHER = os.path.join(ROOT, "src", "services", "voices.ts")

def rd(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

fails, skips, done = [], [], []

def replace_once(txt, old, new, tag, all=False):
    if old in txt and old in new:
        # insertion-style (old survives apply): skip if the added block is already there
        extra = [l for l in new.splitlines() if l.strip() and l not in old.splitlines()]
        if extra and "\n".join(extra) in txt:
            return txt, "skip"
        return txt.replace(old, new) if all else txt.replace(old, new, 1), "ok"
    if old in txt:
        return txt.replace(old, new) if all else txt.replace(old, new, 1), "ok"
    probe = [l for l in new.strip().splitlines() if l.strip()]
    if probe and probe[0].strip() in txt:
        return txt, "skip"
    return txt, "fail"

def insert_kw_into_voice(txt, voice, kw, tag):
    lines = txt.split("\n")
    start = None
    for i, ln in enumerate(lines):
        if ln.rstrip() == "- name: " + voice:
            start = i
            break
    if start is None:
        if ("- " + kw) in txt:
            return txt, "skip"
        return txt, "fail"
    end = len(lines)
    for i in range(start + 1, len(lines)):
        if lines[i].startswith("- name:"):
            end = i
            break
    block = range(start, end)
    if ("- " + kw) in [lines[i].strip() for i in block]:
        return txt, "skip"
    # locate end of keywords list: first '  sources:' or '  note:' inside block
    ins = None
    for i in block:
        if i <= start:
            continue
        if lines[i].startswith("  sources:") or lines[i].startswith("  note:"):
            ins = i
            break
    if ins is None:
        # keywords list is the tail of the block
        ins = end
    lines.insert(ins, "  - " + kw)
    return "\n".join(lines), "ok"

def patch_yaml(path, ops):
    name = os.path.relpath(path, ROOT)
    if not os.path.exists(path):
        fails.append((name, "file missing"))
        return None
    orig = rd(path)
    txt = orig
    for tag, kind, args in ops:
        if kind in ("replace", "replace_all"):
            txt, st = replace_once(txt, args[0], args[1], tag, all=(kind == "replace_all"))
        elif kind == "kw":
            txt, st = insert_kw_into_voice(txt, args[0], args[1], tag)
        if st == "ok":
            done.append((name, tag))
        elif st == "skip":
            skips.append((name, tag))
        else:
            fails.append((name, tag))
    return orig, txt

# ---------------- sources_human.yaml ----------------
H_OPS = [
    ("IHE url 404->rss.xml", "replace", (
        "  url: https://www.insidehighered.com/news/feed\n",
        "  url: https://www.insidehighered.com/rss.xml\n",
    )),
    ("B&HRRC +lang/tier/note", "replace", (
        "  url: https://www.business-humanrights.org/en/feeds/latest-news/3/\n",
        "  url: https://www.business-humanrights.org/en/feeds/latest-news/3/\n"
        "  lang: en\n"
        "  tier: 1\n"
        "  note: Business & human rights; labor, supply chains, tech accountability\n",
    )),
    ("SpaceNews -> Space.com", "replace", (
        "- name: SpaceNews\n"
        "  url: https://spacenews.com/feed/\n"
        "  lang: en\n"
        "  tier: 1\n",
        "- name: Space.com\n"
        "  url: https://www.space.com/feeds/all\n"
        "  lang: en\n"
        "  tier: 1\n"
        "  note: replaces SpaceNews (feed dead 403, audit 2026-11-15); space, engineering, science policy\n",
    )),
]

# ---------------- sources_ai.yaml ----------------
A_OPS = [
    ("Anthropic +note (proxy risk)", "replace", (
        "- name: Anthropic News\n"
        "  url: https://raw.githubusercontent.com/0xSMW/rss-feeds/main/feeds/feed_anthropic_news.xml\n"
        "  lang: en\n"
        "  tier: 1\n",
        "- name: Anthropic News\n"
        "  url: https://raw.githubusercontent.com/0xSMW/rss-feeds/main/feeds/feed_anthropic_news.xml\n"
        "  lang: en\n"
        "  tier: 1\n"
        "  note: community proxy 0xSMW — official Anthropic RSS unavailable (limitation logged)\n",
    )),
    ("Mistral -> official RSS", "replace", (
        "- name: Mistral AI\n"
        "  url: https://raw.githubusercontent.com/0xSMW/rss-feeds/main/feeds/feed_mistral_news.xml\n"
        "  lang: en\n"
        "  tier: 1\n",
        "- name: Mistral AI\n"
        "  url: https://mistral.ai/rss.xml\n"
        "  lang: en\n"
        "  tier: 1\n"
        "  note: official RSS — replaces 0xSMW community proxy\n",
    )),
    ("+LessWrong — AI (Russell/Yudkowsky)", "replace", (
        "- name: AI Alignment Forum\n",
        "- name: LessWrong — AI\n"
        "  url: https://www.lesswrong.com/feed.xml\n"
        "  lang: en\n"
        "  tier: 1\n"
        "  note: anchors Russell/Yudkowsky voices (dangling refs fixed 2026-11-15)\n"
        "\n"
        "- name: AI Alignment Forum\n",
    )),
    ("Synced Review -> The Decoder", "replace", (
        "- name: Synced Review\n"
        "  url: https://syncedreview.com/feed/\n"
        "  lang: en\n"
        "  tier: 2\n",
        "- name: The Decoder\n"
        "  url: https://www.the-decoder.com/feed/\n"
        "  lang: en\n"
        "  tier: 2\n"
        "  note: replaces Synced Review (feed dead 403, audit 2026-11-15); daily AI news, EU perspective\n",
    )),
]

# ---------------- voices.yaml ----------------
CJK = [
    ("Elon Musk", "马斯克"),
    ("Jensen Huang", "黄仁勋"),
    ("Sam Altman", "奥尔特曼"),
    ("Mark Zuckerberg", "扎克伯格"),
    ("Demis Hassabis", "哈萨比斯"),
    ("Yann LeCun", "杨立昆"),
    ("Geoffrey Hinton", "辛顿"),
    ("Sundar Pichai", "皮查伊"),
    ("Satya Nadella", "纳德拉"),
    ("Microsoft", "微软"),
    ("Nvidia", "英伟达"),
    ("Google", "谷歌"),
]
V_OPS = [
    ("bump updated", "replace", (
        "updated: 2026-10-08-v4\n",
        "updated: 2026-11-15-v5\n",
    )),
    ("title_only_below doc-note", "replace", (
        "title_only_below: 0.5\n",
        "title_only_below: 0.5\n"
        "# NOTE: matcher (src/services/voices.ts) applies title-only for ALL relevance\n"
        "# values (§12); this parameter is kept for history and is NOT read by code.\n",
    )),
    ("Musk/Bezos: The Hill — News -> — Policy", "replace_all", (
        "  - The Hill — News\n",
        "  - The Hill — Policy\n",
    )),
    ("Gates: CBS News — World -> — Technology", "replace_all", (
        "  - CBS News — World\n",
        "  - CBS News — Technology\n",
    )),
] + [(f"CJK kw {v}: {kw}", "kw", (v, kw)) for v, kw in CJK]

# ---------------- matcher CJK fix ----------------
MATCHER_OLD = (
    "      const re = new RegExp(\n"
    "        `(?<!\\\\p{L})${escapeRegex(keyword.toLowerCase())}(?!\\\\p{L})`,\n"
    "        'u'\n"
    "      );\n"
)
MATCHER_NEW = (
    "      // CJK keywords: \\p{L} lookarounds fail inside CJK text (a CJK name is\n"
    "      // almost always surrounded by other letters), so substring match there.\n"
    "      const kwEsc = escapeRegex(keyword.toLowerCase());\n"
    "      const hasCJK = /[\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff]/.test(kwEsc);\n"
    "      const re = new RegExp(\n"
    "        hasCJK ? kwEsc : `(?<!\\\\p{L})${kwEsc}(?!\\\\p{L})`,\n"
    "        'u'\n"
    "      );\n"
)

def show_diff(name, orig, new):
    d = list(difflib.unified_diff(orig.splitlines(), new.splitlines(),
                                  fromfile="a/" + name, tofile="b/" + name, lineterm="", n=1))
    print("\n".join(d) if d else "  (нет изменений)")

def main():
    print("=" * 72)
    print("PATCH-PLAN  (режим: %s)" % ("APPLY" if APPLY else "DRY-RUN"))
    print("=" * 72)
    results = []
    for path, ops, label in ((P_HUMAN, H_OPS, "sources_human.yaml"),
                             (P_AI, A_OPS, "sources_ai.yaml"),
                             (P_VOICES, V_OPS, "voices.yaml")):
        r = patch_yaml(path, ops)
        if r:
            orig, new = r
            print("\n--- %s ---" % label)
            show_diff(os.path.relpath(path, ROOT), orig, new)
            results.append((path, orig, new))

    if CODE:
        if os.path.exists(P_MATCHER):
            orig = rd(P_MATCHER)
            txt, st = replace_once(orig, MATCHER_OLD, MATCHER_NEW, "matcher CJK fix")
            print("\n--- src/services/voices.ts (CJK fix) ---")
            if st == "ok":
                show_diff(os.path.relpath(P_MATCHER, ROOT), orig, txt)
                results.append((P_MATCHER, orig, txt))
                done.append(("src/services/voices.ts", "matcher CJK fix"))
            elif st == "skip":
                skips.append(("src/services/voices.ts", "matcher CJK fix"))
            else:
                fails.append(("src/services/voices.ts", "matcher anchor not found — код уже менялся, правь вручную"))
        else:
            fails.append(("src/services/voices.ts", "file missing"))

    print("\n" + "=" * 72)
    print("ИТОГ: применяемо=%d, skip(уже есть)=%d, FAIL=%d" % (len(done), len(skips), len(fails)))
    for n, t in skips:
        print("  [SKIP] %s :: %s" % (n, t))
    for n, t in fails:
        print("  [FAIL] %s :: %s" % (n, t))
    if fails and APPLY:
        print("\n!! Есть FAIL — НИ ОДИН файл не записан. Разбери FAIL и перезапусти.")
        return 1

    if APPLY:
        for path, orig, new in results:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new)
            print("[written] %s" % os.path.relpath(path, ROOT))
        print("\nДальше вручную:")
        print("  node scripts/yaml-to-ts.mjs        # регенерация src/config/generated/*.ts")
        print("  npm test                           # vitest")
        print("  git add -A && git commit -m 'feat(sources,voices): audit patches 2026-11-15 "
              "(feeds fix+replace, LessWrong, CJK keywords, matcher CJK fix)'")
    else:
        print("\nЭто DRY-RUN. Для применения:  python3 scripts/patch_audit.py . --apply")
        print("С кодом матчера:             python3 scripts/patch_audit.py . --apply --code")
    return 0

if __name__ == "__main__":
    sys.exit(main())
