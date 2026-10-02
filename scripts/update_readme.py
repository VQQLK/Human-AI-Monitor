#!/usr/bin/env python3
"""
update_readme.py — update "Current State of Development" in README.{md,ru.md,zh.md}
with live values from API.
"""
import argparse
import json
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

API = "https://human-ai-monitor-collector.human-ai-monitor.workers.dev"
ROOT = Path(__file__).resolve().parents[1]

MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня",
             "июля", "августа", "сентября", "октября", "ноября", "декабря"]
MONTHS_EN = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]

INTERP = {
    "en": {
        "AI is significantly ahead": "AI is significantly ahead",
        "AI is ahead": "AI is ahead",
        "Symmetric development": "Symmetric development",
        "Humanity is ahead": "Humanity is ahead",
        "Humanity is significantly ahead": "Humanity is significantly ahead",
    },
    "ru": {
        "AI is significantly ahead": "ИИ значительно впереди",
        "AI is ahead": "ИИ впереди",
        "Symmetric development": "Симметричное развитие",
        "Humanity is ahead": "Человечество впереди",
        "Humanity is significantly ahead": "Человечество значительно впереди",
    },
    "zh": {
        "AI is significantly ahead": "人工智能显著领先",
        "AI is ahead": "人工智能领先",
        "Symmetric development": "对称发展",
        "Humanity is ahead": "人类领先",
        "Humanity is significantly ahead": "人类显著领先",
    },
}

STRINGS = {
    "en": {
        "path": "README.md",
        "status_current": "Current value",
        "shifts_none": "No critical events",
        "shifts_some": "Critical events detected",
        "items_status": "Weekly sample",
        "sample_status": "Axis-signal pairs",
        "updated_prefix": "**Updated:**",
        "baseline_prefix": "**Baseline:**",
        "verified_label": "Verified: ",
    },
    "ru": {
        "path": "README.ru.md",
        "status_current": "Текущее значение",
        "shifts_none": "Критических событий нет",
        "shifts_some": "Обнаружены критические события",
        "items_status": "Недельная выборка",
        "sample_status": "Пары «ось-сигнал»",
        "updated_prefix": "**Обновлено:**",
        "baseline_prefix": "**Базовая линия:**",
        "verified_label": "Проверено: ",
    },
    "zh": {
        "path": "README.zh.md",
        "status_current": "当前值",
        "shifts_none": "无关键事件",
        "shifts_some": "检测到关键事件",
        "items_status": "每周样本",
        "sample_status": "轴-信号对",
        "updated_prefix": "**更新:**",
        "baseline_prefix": "**基线：**",
        "verified_label": "已验证: ",
    },
}

def _curl(url, max_time):
    r = subprocess.run(
        ["curl", "-sSf", "--max-time", str(max_time), url],
        capture_output=True, text=True, check=True
    )
    return r.stdout


def fetch_json(url, retries=3):
    last = None
    for i in range(retries):
        try:
            return json.loads(_curl(url, 30))
        except subprocess.CalledProcessError as e:
            last = e
            if i < retries - 1:
                time.sleep(2 ** i)
    raise last


def fetch_text(url, retries=3):
    last = None
    for i in range(retries):
        try:
            return _curl(url, 60)
        except subprocess.CalledProcessError as e:
            last = e
            if i < retries - 1:
                time.sleep(2 ** i)
    raise last


def parse_items_collected(md):
    for p in (r"\*\*Items collected:\*\*\s*(\d+)",
              r"\*\*Собрано элементов:\*\*\s*(\d+)",
              r"\*\*收集的项目[：:]\*\*\s*(\d+)"):
        m = re.search(p, md)
        if m:
            return int(m.group(1))
    return None


def fmt_date(dt, lang):
    if lang == "zh":
        return f"{dt.year}年{dt.month}月{dt.day}日"
    if lang == "ru":
        return f"{dt.day} {MONTHS_RU[dt.month - 1]} {dt.year}"
    return f"{MONTHS_EN[dt.month - 1]} {dt.day}, {dt.year}"


def fmt_mmdd(dt):
    return f"{dt.month:02d}-{dt.day:02d}"


def fmt_ddmmyy(dt):
    return f"{dt.day:02d}.{dt.month:02d}"


def fmt_gap(g):
    sign = "+" if g >= 0 else "\u2212"
    return f"{sign}{abs(g):.2f}"


def sub_row(text, pattern, new_row):
    return re.sub(pattern, new_row, text, count=1, flags=re.MULTILINE)

def update_readme(path, lang, gap, proto, items_count, dry=False):
    text = path.read_text(encoding="utf-8")
    original = text
    dt = datetime.now(timezone.utc)
    L = STRINGS[lang]
    interp_loc = INTERP[lang].get(gap["interpretation"], gap["interpretation"])

    ai = gap["ai_score"]
    human = gap["human_score"]
    gap_val = gap["gap"]
    sample = gap["sample_size"]
    shifts = proto["shifts_count"]
    shifts_status = L["shifts_none"] if shifts == 0 else L["shifts_some"]

    date_long = fmt_date(dt, lang)
    mm_dd = fmt_mmdd(dt)
    dd_mm = fmt_ddmmyy(dt)

    # 1. Updated line (preserve trailing whitespace for markdown hard-break)
    prefix = re.escape(L["updated_prefix"])
    text = re.sub(rf"^({prefix})[ \t]+[^\n]*?([ \t]*)$",
                  lambda m: f"{m.group(1)} {date_long}{m.group(2)}",
                  text, count=1, flags=re.MULTILINE)

    # 2. Baseline line
    if lang == "en":
        baseline = f"**Baseline:** Updated on {date_long} — based on {items_count} items (sample size: {sample})."
    elif lang == "ru":
        baseline = f"**Базовая линия:** Обновлено {date_long} — на основе {items_count} элементов (размер выборки: {sample})."
    else:
        baseline = f"**基线：** {date_long}更新 — 基于 {items_count} 个项目（样本量：{sample}）。"
    prefix = re.escape(L["baseline_prefix"])
    text = re.sub(rf"^{prefix}[ \t]+[^\n]*$", baseline, text, count=1, flags=re.MULTILINE)

    # 3. Gap Index table — 7 rows
    if lang == "en":
        rows = [
            (r"^\| Metric \| Value \(\d{2}-\d{2}\) \| Status \|$",
             f"| Metric | Value ({mm_dd}) | Status |"),
            (r"^\| \*\*🟢 Humanity Score\*\* \| 🌐 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🟢 Humanity Score** | 🌐 **{human:.2f}** | {L['status_current']} |"),
            (r"^\| \*\*🔴 AI Score\*\* \| 🤖 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🔴 AI Score** | 🤖 **{ai:.2f}** | {L['status_current']} |"),
            (r"^\| \*\*⚖️ Gap Index\*\* \| ⚖️ \*\*[+\-−][\d.]+\*\* \| [^|]+ \|$",
             f"| **⚖️ Gap Index** | ⚖️ **{fmt_gap(gap_val)}** | {interp_loc} |"),
            (r"^\| \*\*⚡ Threshold Shifts\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **⚡ Threshold Shifts** | **{shifts}** | {shifts_status} |"),
            (r"^\| \*\*📈 Items Analyzed\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **📈 Items Analyzed** | **{items_count}** | {L['items_status']} |"),
            (r"^\| \*\*🔬 Sample Size \(Bayesian\)\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **🔬 Sample Size (Bayesian)** | **{sample}** | {L['sample_status']} |"),
        ]
    elif lang == "ru":
        rows = [
            (r"^\| Метрика \| Значение \(\d{2}\.\d{2}\) \| Статус \|$",
             f"| Метрика | Значение ({dd_mm}) | Статус |"),
            (r"^\| \*\*🟢 Оценка Человечества\*\* \| 🌐 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🟢 Оценка Человечества** | 🌐 **{human:.2f}** | {L['status_current']} |"),
            (r"^\| \*\*🔴 Оценка ИИ\*\* \| 🤖 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🔴 Оценка ИИ** | 🤖 **{ai:.2f}** | {L['status_current']} |"),
            (r"^\| \*\*⚖️ Индекс разрыва\*\* \| ⚖️ \*\*[+\-−][\d.]+\*\* \| [^|]+ \|$",
             f"| **⚖️ Индекс разрыва** | ⚖️ **{fmt_gap(gap_val)}** | {interp_loc} |"),
            (r"^\| \*\*⚡ Ключевых сдвигов\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **⚡ Ключевых сдвигов** | **{shifts}** | {shifts_status} |"),
            (r"^\| \*\*📈 Анализированных событий\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **📈 Анализированных событий** | **{items_count}** | {L['items_status']} |"),
            (r"^\| \*\*🔬 Размер выборки \(байесовский\)\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **🔬 Размер выборки (байесовский)** | **{sample}** | {L['sample_status']} |"),
        ]
    else:
        rows = [
            (r"^\| 指标 \| 数值 \(\d{2}-\d{2}\) \| 状态 \|$",
             f"| 指标 | 数值 ({mm_dd}) | 状态 |"),
            (r"^\| \*\*🟢 人类得分\*\* \| 🌐 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🟢 人类得分** | 🌐 **{human:.2f}** | {L['status_current']} |"),
            (r"^\| \*\*🔴 人工智能得分\*\* \| 🤖 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🔴 人工智能得分** | 🤖 **{ai:.2f}** | {L['status_current']} |"),
            (r"^\| \*\*⚖️ 差距指数\*\* \| ⚖️ \*\*[+\-−][\d.]+\*\* \| [^|]+ \|$",
             f"| **⚖️ 差距指数** | ⚖️ **{fmt_gap(gap_val)}** | {interp_loc} |"),
            (r"^\| \*\*⚡ 阈值变化\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **⚡ 阈值变化** | **{shifts}** | {shifts_status} |"),
            (r"^\| \*\*📈 分析项目\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **📈 分析项目** | **{items_count}** | {L['items_status']} |"),
            (r"^\| \*\*🔬 样本量（贝叶斯）\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **🔬 样本量（贝叶斯）** | **{sample}** | {L['sample_status']} |"),
        ]

    for pat, rep in rows:
        text = sub_row(text, pat, rep)

    # 4. Mermaid: Verified label (first occurrence only)
    text = re.sub(rf"({re.escape(L['verified_label'])})[\d]{{2}}-[\d]{{2}}(\*)",
                  rf"\g<1>{mm_dd}\g<2>", text, count=1)

    # 5. Mermaid: x-axis first element (both graphs)
    text = re.sub(r'x-axis \["\d{2}-\d{2}\*"', f'x-axis ["{mm_dd}*"', text)

    # 6. Mermaid: bar[0] in Score Dynamics (only one bar block)
    text = re.sub(r"(bar \[)[\d.]+(,)", rf"\g<1>{human:.2f}\g<2>", text, count=1)

    # 7. Mermaid: line[0] in BOTH graphs via callback
    def line_repl(m):
        idx = text[:m.start()].count("line [")
        val = ai if idx == 0 else gap_val
        return f"{m.group(1)}{val:.2f}{m.group(2)}"
    text = re.sub(r"(line \[)[\d.]+(,)", line_repl, text)

    if text == original:
        print(f"  {path.name}: no changes")
        return False

    if dry:
        print(f"  {path.name}: WOULD change ({len(original)} -> {len(text)} bytes)")
        old_lines = original.split("\n")
        new_lines = text.split("\n")
        shown = 0
        for i in range(max(len(old_lines), len(new_lines))):
            a = old_lines[i] if i < len(old_lines) else "<EOF>"
            b = new_lines[i] if i < len(new_lines) else "<EOF>"
            if a != b:
                shown += 1
                if shown <= 25:
                    print(f"    L{i+1}:")
                    print(f"      - {a}")
                    print(f"      + {b}")
        if shown > 25:
            print(f"    ... and {shown - 25} more")
        return True

    path.write_text(text, encoding="utf-8")
    print(f"  {path.name}: UPDATED")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--root", default=str(ROOT))
    args = ap.parse_args()
    root = Path(args.root)

    print(f"[update_readme] API: {API}")
    print(f"[update_readme] root: {root}")

    gap = fetch_json(f"{API}/gap")
    print(f"  /gap: ai={gap['ai_score']} human={gap['human_score']} "
          f"gap={gap['gap']} sample={gap['sample_size']} "
          f"interp={gap['interpretation']}")

    protos = fetch_json(f"{API}/protocols")["protocols"]
    if not protos:
        print("ERROR: no protocols", file=sys.stderr)
        return 1
    proto = protos[0]
    week = proto["week_start"]
    print(f"  /protocols: week={week} shifts={proto['shifts_count']}")

    md = fetch_text(f"{API}/protocols/{week}/content")
    items_count = parse_items_collected(md)
    if items_count is None:
        print("ERROR: cannot parse Items collected", file=sys.stderr)
        return 1
    print(f"  items_count (from markdown) = {items_count}")

    for lang in ("en", "ru", "zh"):
        path = root / STRINGS[lang]["path"]
        if not path.exists():
            print(f"  {path.name}: NOT FOUND", file=sys.stderr)
            continue
        try:
            update_readme(path, lang, gap, proto, items_count, dry=args.dry)
        except Exception as e:
            print(f"  {path.name}: ERROR {e}", file=sys.stderr)
            return 1

    print(f"[update_readme] done (dry={args.dry})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
