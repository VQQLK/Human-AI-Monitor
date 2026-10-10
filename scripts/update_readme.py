#!/usr/bin/env python3
"""
update_readme.py — update "Current State of Development" in README.{md,ru.md,zh.md}
with live values from /gap-history API.

History-based: no forecast. Each point = one protocol (finals accumulate,
current interim is the latest point). X-axis = week_end (DD/MM).
"""
import argparse
import json
import re
import subprocess
import sys
import html
import re
import time
from datetime import datetime, timezone
from pathlib import Path

API = "https://human-ai-monitor-collector.human-ai-monitor.workers.dev"
ROOT = Path(__file__).resolve().parents[1]

MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня",
             "июля", "августа", "сентября", "октября", "ноября", "декабря"]
MONTHS_EN = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]

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
        "score_title": "🟢 Humanity (bars) vs 🔴 AI (line) | History",
        "y_score": "Score",
        "y_gap": "Gap",
        "legend_score_anchor": "#### 📈 Score Dynamics (Humanity vs AI)",
        "legend_score": "> 📊 **Chart Legend:** 🟢 **Bars = Humanity** | 🔴 **Line = AI**. History since first final protocol.",
        "hist_header": "#### 📚 Historical Protocols",
        "hist_col_week": "Week", "hist_col_ai": "AI", "hist_col_human": "Humanity",
        "hist_col_gap": "Gap", "hist_col_items": "Items", "hist_col_sample": "Sample",
        "hist_col_type": "Type",
        "type_interim": "INTERIM", "type_final": "FINAL",
        "interim_note": "Last point is INTERIM — will be replaced by FINAL on Monday.",
        "interim_ref_prefix": "📌 Interim (reference, not on chart):",
        "voices_header": "Voices",
        "daily_header": "#### 📅 Daily Gap trajectory",
        "daily_col_date": "Date",
        "daily_col_ci": "CI95",
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
        "score_title": "🟢 Человечество (столбики) vs 🔴 ИИ (линия) | История",
        "y_score": "Оценка",
        "y_gap": "Разрыв",
        "legend_score_anchor": "#### 📈 Динамика оценок (Человечество vs ИИ)",
        "legend_score": "> 📊 **Легенда графика:** 🟢 **Столбики = Человечество** | 🔴 **Линия = ИИ**. История с первого финального протокола.",
        "hist_header": "#### 📚 История протоколов",
        "hist_col_week": "Неделя", "hist_col_ai": "ИИ", "hist_col_human": "Человечество",
        "hist_col_gap": "Разрыв", "hist_col_items": "Элементов", "hist_col_sample": "Выборка",
        "hist_col_type": "Тип",
        "type_interim": "ПРОМЕЖУТОЧНЫЙ", "type_final": "ФИНАЛЬНЫЙ",
        "interim_note": "Последняя точка — ПРОМЕЖУТОЧНАЯ, будет заменена ФИНАЛЬНОЙ в понедельник.",
        "interim_ref_prefix": "📌 Промежуточный протокол (справочно, не на графике):",
        "voices_header": "Мнения",
        "daily_header": "#### 📅 Ежедневная траектория Gap",
        "daily_col_date": "Дата",
        "daily_col_ci": "CI95",
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
        "score_title": "🟢 人类 (柱状) vs 🔴 人工智能 (折线) | 历史",
        "y_score": "得分",
        "y_gap": "差距",
        "legend_score_anchor": "#### 📈 得分动态 (人类 vs 人工智能)",
        "legend_score": "> 📊 **图例：** 🟢 **柱状图 = 人类** | 🔴 **折线 = 人工智能**。自首个最终版协议起的历史。",
        "hist_header": "#### 📚 协议历史",
        "hist_col_week": "周", "hist_col_ai": "AI", "hist_col_human": "人类",
        "hist_col_gap": "差距", "hist_col_items": "项目", "hist_col_sample": "样本",
        "hist_col_type": "类型",
        "type_interim": "临时版", "type_final": "最终版",
        "interim_note": "最后一点为临时版，将于周一替换为最终版。",
        "interim_ref_prefix": "📌 临时协议（仅供参考，不在图表上）：",
        "voices_header": "声音",
        "daily_header": "#### 📅 每日差距轨迹",
        "daily_col_date": "日期",
        "daily_col_ci": "CI95",
    },
}

INTERP = {
    "en": {
        "Humanity is ahead": "Humanity is ahead",
        "AI is ahead": "AI is ahead",
        "Balanced": "Balanced",
    },
    "ru": {
        "Humanity is ahead": "Человечество впереди",
        "AI is ahead": "ИИ впереди",
        "Balanced": "Сбалансировано",
    },
    "zh": {
        "Humanity is ahead": "人类领先",
        "AI is ahead": "人工智能领先",
        "Balanced": "均衡",
    },
}

SIG_STATUS = {
    "en": {1: "Significant", 0: "Inconclusive"},
    "ru": {1: "Значимо",      0: "Неопределённо"},
    "zh": {1: "显著",          0: "不确定"},
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

def fetch_daily_snapshots():
    try:
        data = fetch_json(f"{API}/daily-snapshots?limit=30")
        return data.get("snapshots", [])
    except Exception as e:
        print(f"[update_readme] /daily-snapshots fetch failed: {e}", file=sys.stderr)
        return []

def fetch_voices(limit=50):
    try:
        data = fetch_json(f"{API}/voices?limit={limit}")
        return data.get("voices", [])
    except Exception as e:
        print(f"[update_readme] /voices fetch failed: {e}", file=sys.stderr)
        return []




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


def week_end_to_ddmm(week_end):
    """'2026-10-04' -> '04/10'."""
    y, m, d = week_end.split("-")
    return f"{d}/{m}"


def fmt_gap(g):
    sign = "+" if g >= 0 else "\u2212"
    return f"{sign}{abs(g):.3f}"


def build_score_mermaid(weeks, lang):
    """Build mermaid block for Score Dynamics (finals only, history)."""
    finals = [w for w in weeks if not w.get("is_interim")]
    if len(finals) == 0:
        x_axis, bar_line, ai_line = '"—"', "0", "0"
    elif len(finals) == 1:
        w = finals[0]
        lbl = week_end_to_ddmm(w["week_end"])
        x_axis = f'"{lbl}", "{lbl}"'
        bar_line = f"{w['human']:.3f}, {w['human']:.3f}"
        ai_line = f"{w['ai']:.3f}, {w['ai']:.3f}"
    else:
        labels = [week_end_to_ddmm(w["week_end"]) for w in finals]
        human_data = [f"{w['human']:.3f}" for w in finals]
        ai_data = [f"{w['ai']:.3f}" for w in finals]
        x_axis = ", ".join(f'"{l}"' for l in labels)
        bar_line = ", ".join(human_data)
        ai_line = ", ".join(ai_data)
    L = STRINGS[lang]
    title = L["score_title"]
    y_axis_label = L["y_score"]
    return f'''```mermaid
xychart-beta
    title "{title}"
    x-axis [{x_axis}]
    y-axis "{y_axis_label}" 0.40 --> 0.80
    bar [{bar_line}]
    line [{ai_line}]
```'''


def build_gap_mermaid(weeks, lang):
    """Build mermaid block for Gap Index Dynamics (finals only, history)."""
    finals = [w for w in weeks if not w.get("is_interim")]
    if len(finals) == 0:
        x_axis, gap_line = '"—"', "0"
    elif len(finals) == 1:
        w = finals[0]
        lbl = week_end_to_ddmm(w["week_end"])
        x_axis = f'"{lbl}", "{lbl}"'
        gap_line = f"{w['gap']:.3f}, {w['gap']:.3f}"
    else:
        labels = [week_end_to_ddmm(w["week_end"]) for w in finals]
        gap_line = ", ".join(f"{w['gap']:.3f}" for w in finals)
        x_axis = ", ".join(f'"{l}"' for l in labels)
    titles = {
        "en": "Gap Index | Positive = Humanity leading, Negative = AI leading",
        "ru": "Индекс разрыва | Положительный = Человечество впереди, Отрицательный = ИИ впереди",
        "zh": "差距指数 | 正值 = 人类领先，负值 = 人工智能领先",
    }
    y_axis_label = STRINGS[lang]["y_gap"]
    return f'''```mermaid
xychart-beta
    title "{titles[lang]}"
    x-axis [{x_axis}]
    y-axis "{y_axis_label}" -0.15 --> 0.25
    line [{gap_line}]
```'''


def build_daily_mermaid(snapshots, lang):
    """Build mermaid block for daily Gap trajectory. Returns None if < 2 points."""
    if not snapshots or len(snapshots) < 2:
        return None
    rows = sorted(snapshots, key=lambda s: s["snapshot_date"])[-30:]
    labels = [week_end_to_ddmm(s["snapshot_date"]) for s in rows]
    gaps = [s["gap"] for s in rows]
    gap_line = ", ".join(f"{g:.3f}" for g in gaps)
    x_axis = ", ".join(f'"{l}"' for l in labels)
    y_min = min(gaps) - 0.1
    y_max = max(gaps) + 0.1
    titles = {
        "en": "Daily Gap | Positive = Humanity leading, Negative = AI leading",
        "ru": "Ежедневный Gap | Положительный = Человечество впереди, Отрицательный = ИИ впереди",
        "zh": "每日差距 | 正值 = 人类领先，负值 = 人工智能领先",
    }
    y_axis_label = STRINGS[lang]["y_gap"]
    return f'''```mermaid
xychart-beta
    title "{titles[lang]}"
    x-axis [{x_axis}]
    y-axis "{y_axis_label}" {y_min:.3f} --> {y_max:.3f}
    line [{gap_line}]
```'''


def build_daily_table(snapshots, lang):
    """Build markdown table for daily snapshots (newest first). Returns "" if < 2 points."""
    if not snapshots or len(snapshots) < 2:
        return ""
    L = STRINGS[lang]
    rows = sorted(snapshots, key=lambda s: s["snapshot_date"], reverse=True)[:30]
    header = (f"| {L['daily_col_date']} | {L['hist_col_ai']} | {L['hist_col_human']} "
              f"| {L['hist_col_gap']} | {L['daily_col_ci']} "
              f"| {L['hist_col_items']} | {L['hist_col_sample']} | {L['hist_col_type']} |")
    sep = "|---|---|---|---|---|---|---|---|"
    lines = [header, sep]
    for s in rows:
        ci_lo = s.get("gap_ci95_low")
        ci_hi = s.get("gap_ci95_high")
        ci = f"[{fmt_gap(ci_lo)}, {fmt_gap(ci_hi)}]" if ci_lo is not None and ci_hi is not None else "—"
        date_lbl = week_end_to_ddmm(s["snapshot_date"])
        ai = f"{s['ai_score']:.3f}" if s.get("ai_score") is not None else "—"
        human = f"{s['human_score']:.3f}" if s.get("human_score") is not None else "—"
        gap = fmt_gap(s["gap"]) if s.get("gap") is not None else "—"
        items = s.get("items_count") if s.get("items_count") is not None else "—"
        sample = s.get("sample_size") if s.get("sample_size") is not None else "—"
        typ = L["type_interim"] if s["is_interim"] == 1 else L["type_final"]
        lines.append(f"| {date_lbl} | {ai} | {human} | {gap} | {ci} | {items} | {sample} | {typ} |")
    return "\n".join(lines)


def build_history_table(weeks, lang):
    """Build markdown table for finals only (chart history)."""
    L = STRINGS[lang]
    header = (f"| {L['hist_col_week']} | {L['hist_col_ai']} | {L['hist_col_human']} "
              f"| {L['hist_col_gap']} | {L['daily_col_ci']} "
              f"| {L['hist_col_items']} | {L['hist_col_sample']} | {L['hist_col_type']} |")
    sep = "|---|---|---|---|---|---|---|---|"
    rows = []
    for w in weeks:
        typ = L["type_interim"] if w["is_interim"] == 1 else L["type_final"]
        items = w["items"] if w["items"] is not None else "—"
        sample = w["sample"] if w["sample"] is not None else "—"
        ci_lo = w.get("gap_ci95_low")
        ci_hi = w.get("gap_ci95_high")
        ci = f"[{fmt_gap(ci_lo)}, {fmt_gap(ci_hi)}]" if ci_lo is not None and ci_hi is not None else "—"
        rows.append(
            f"| {week_end_to_ddmm(w['week_end'])} "
            f"| {w['ai']:.3f} | {w['human']:.3f} | {fmt_gap(w['gap'])} "
            f"| {ci} | {items} | {sample} | {typ} |"
        )
    return f"{L['hist_header']}\n\n{header}\n{sep}\n" + "\n".join(rows)


def build_interim_reference(interims, lang):
    """Build reference blockquote for the current interim (not on chart)."""
    if not interims:
        return ""
    w = interims[-1]
    # Interim regenerates daily; week_end is always in the future.
    # Show the actual generation date instead.
    gen = w.get("generated_at") or w.get("recorded_at") or w["week_end"]
    lbl = week_end_to_ddmm(gen[:10])
    items = w["items"] if w["items"] is not None else "—"
    sample = w["sample"] if w["sample"] is not None else "—"
    L = STRINGS[lang]
    sep = "" if lang == "zh" else " "
    return (
        f"> {L['interim_ref_prefix']}{sep}{lbl} — "
        f"{L['hist_col_ai']} {w['ai']:.3f} · {L['hist_col_human']} {w['human']:.3f} · {L['hist_col_gap']} {fmt_gap(w['gap'])} · "
        f"{items} / {sample} items.\n"
        f"> {L['interim_note']}"
    )



def build_voices_markdown(voices, lang):
    if not voices:
        return None
    L = STRINGS[lang]
    
    cats = {
        "en": {
            "frontier_labs": "🧠 Frontier Labs",
            "researchers": "🧪 AI Researchers",
            "safety_philosophy": "🌍 AI Safety & Philosophy",
            "investors": "💼 Investors & Tech Leaders",
            "policy": "🏛️ Policy & Government",
            "crypto": "🔐 Crypto",
            "enterprise": "🏢 Enterprise AI",
            "mathematics": "🧮 Mathematics Community",
        },
        "ru": {
            "frontier_labs": "🧠 Лаборатории переднего края",
            "researchers": "🧪 Исследователи ИИ",
            "safety_philosophy": "🌍 Безопасность и философия ИИ",
            "investors": "💼 Инвесторы и техлидеры",
            "policy": "🏛️ Политика и государство",
            "crypto": "🔐 Крипто",
            "enterprise": "🏢 Enterprise AI",
            "mathematics": "🧮 Математическое сообщество",
        },
        "zh": {
            "frontier_labs": "🧠 前沿实验室",
            "researchers": "🧪 AI研究人员",
            "safety_philosophy": "🌍 AI安全与哲学",
            "investors": "💼 投资人与科技领袖",
            "policy": "🏛️ 政策与政府",
            "crypto": "🔐 加密货币",
            "enterprise": "🏢 企业AI",
            "mathematics": "🧮 数学界",
        }
    }
    
    grouped = {}
    for v in voices:
        cat = v.get("category", "other")
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append(v)
    
    lines = [f"## {L['voices_header']}\n"]
    for cat_key, cat_voices in grouped.items():
        if cat_key not in cats[lang]:
            continue
        lines.append(f"### {cats[lang][cat_key]}\n")
        for v in cat_voices:
            quote = v.get(f"quote_{lang}") or v.get("quote", "")
            quote = html.unescape(quote) # Очистка от &#039; и т.д.
            
            lines.append(f"**{v['speaker']} ({v['affiliation']}) — {v['date']}**\n")
            lines.append(f"> {quote}\n")
            source_url = v.get("url")
            if source_url:
                lines.append(f"— *[{v['source']}]({source_url})*\n")
            else:
                lines.append(f"— *{v['source']}*\n")
    
    return "\n".join(lines).strip() + "\n"

def update_readme(path, lang, weeks, snapshots=None, voices=None, dry=False):
    text = path.read_text(encoding="utf-8")
    original = text
    L = STRINGS[lang]

    if not weeks:
        print(f"  {path.name}: no weeks, skipping")
        return False

    latest = weeks[-1]

    # Дата берётся из протокола (generated_at), а не из «сейчас».
    # Так Updated/Baseline/Value меняются только при новом протоколе.
    if latest.get("generated_at"):
        dt = datetime.fromisoformat(latest["generated_at"].replace("Z", "+00:00"))
    else:
        dt = datetime.now(timezone.utc)

    ai = latest["ai"]
    human = latest["human"]
    gap_val = latest["gap"]
    sample = latest["sample"]
    items_count = latest["items"]
    shifts = latest["shifts"] or 0
    interp_en = latest["interpretation"] or ""
    interp_loc = INTERP[lang].get(interp_en, interp_en)
    _sig = int(latest.get("statistically_significant") or 0)
    sig_loc = SIG_STATUS[lang][_sig]
    _ci_lo = latest.get("gap_ci95_low")
    _ci_hi = latest.get("gap_ci95_high")
    ci_str = f"[{fmt_gap(_ci_lo)}, {fmt_gap(_ci_hi)}]" if _ci_lo is not None and _ci_hi is not None else "n/a"
    shifts_status = L["shifts_none"] if shifts == 0 else L["shifts_some"]

    date_long = fmt_date(dt, lang)
    mm_dd = fmt_mmdd(dt)
    dd_mm = fmt_ddmmyy(dt)

    # ── 1. Updated date (preserve trailing whitespace) ──
    prefix = re.escape(L["updated_prefix"])
    text = re.sub(rf"^({prefix})[ \t]+[^\n]*?([ \t]*)$",
                  lambda m: f"{m.group(1)} {date_long}{m.group(2)}",
                  text, count=1, flags=re.MULTILINE)

    # ── 2. Baseline ──
    if lang == "en":
        baseline = f"**Baseline:** Updated on {date_long} — based on {items_count} items (sample size: {sample})."
    elif lang == "ru":
        baseline = f"**Базовая линия:** Обновлено {date_long} — на основе {items_count} элементов (размер выборки: {sample})."
    else:
        baseline = f"**基线：** {date_long}更新 — 基于 {items_count} 个项目（样本量：{sample}）。"
    prefix = re.escape(L["baseline_prefix"])
    text = re.sub(rf"^{prefix}[ \t]+[^\n]*$", baseline, text, count=1, flags=re.MULTILINE)

    # ── 3. Gap Index table (latest values) ──
    if lang == "en":
        rows = [
            (r"^\| Metric \| Value \(\d{2}-\d{2}\) \| Status \|$",
             f"| Metric | Value ({mm_dd}) | Status |"),
            (r"^\| \*\*🟢 Humanity Score\*\* \| 🌐 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🟢 Humanity Score** | 🌐 **{human:.3f}** | {L['status_current']} |"),
            (r"^\| \*\*🔴 AI Score\*\* \| 🤖 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🔴 AI Score** | 🤖 **{ai:.3f}** | {L['status_current']} |"),
            (r"^\| \*\*⚖️ Gap Index\*\* \| ⚖️ \*\*[+\-−][\d.]+\*\* \| [^|]+ \|(\n\| \*\*📊 CI95\*\* \| [^\n]*)?",
             f"| **⚖️ Gap Index** | ⚖️ **{fmt_gap(gap_val)}** | {interp_loc} |\n| **📊 CI95** | **{ci_str}** | {sig_loc} |"),
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
             f"| **🟢 Оценка Человечества** | 🌐 **{human:.3f}** | {L['status_current']} |"),
            (r"^\| \*\*🔴 Оценка ИИ\*\* \| 🤖 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🔴 Оценка ИИ** | 🤖 **{ai:.3f}** | {L['status_current']} |"),
            (r"^\| \*\*⚖️ Индекс разрыва\*\* \| ⚖️ \*\*[+\-−][\d.]+\*\* \| [^|]+ \|(\n\| \*\*📊 CI95\*\* \| [^\n]*)?",
             f"| **⚖️ Индекс разрыва** | ⚖️ **{fmt_gap(gap_val)}** | {interp_loc} |\n| **📊 CI95** | **{ci_str}** | {sig_loc} |"),
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
             f"| **🟢 人类得分** | 🌐 **{human:.3f}** | {L['status_current']} |"),
            (r"^\| \*\*🔴 人工智能得分\*\* \| 🤖 \*\*[\d.]+\*\* \| [^|]+ \|$",
             f"| **🔴 人工智能得分** | 🤖 **{ai:.3f}** | {L['status_current']} |"),
            (r"^\| \*\*⚖️ 差距指数\*\* \| ⚖️ \*\*[+\-−][\d.]+\*\* \| [^|]+ \|(\n\| \*\*📊 CI95\*\* \| [^\n]*)?",
             f"| **⚖️ 差距指数** | ⚖️ **{fmt_gap(gap_val)}** | {interp_loc} |\n| **📊 CI95** | **{ci_str}** | {sig_loc} |"),
            (r"^\| \*\*⚡ 阈值变化\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **⚡ 阈值变化** | **{shifts}** | {shifts_status} |"),
            (r"^\| \*\*📈 分析项目\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **📈 分析项目** | **{items_count}** | {L['items_status']} |"),
            (r"^\| \*\*🔬 样本量（贝叶斯）\*\* \| \*\*\d+\*\* \| [^|]+ \|$",
             f"| **🔬 样本量（贝叶斯）** | **{sample}** | {L['sample_status']} |"),
        ]
    for pat, rep in rows:
        text = re.sub(pat, rep, text, count=1, flags=re.MULTILINE)

    # ── 3b. Replace Chart Legend for Score Dynamics (localized) ──
    # Match: anchor heading + blank line + one-or-more "> ..." lines + blank line
    anchor = re.escape(L["legend_score_anchor"])
    legend_re = re.compile(rf"({anchor}\n\n)(?:> [^\n]*\n)+(\n)(```mermaid)", re.MULTILINE)
    text = legend_re.sub(lambda m: f"{m.group(1)}{L['legend_score']}\n{m.group(2)}{m.group(3)}", text, count=1)

    # ── 4. Replace both mermaid blocks ──
    parts = re.split(r"(```mermaid\n.*?\n```)", text, flags=re.DOTALL)
    if len(parts) < 5:
        print(f"  {path.name}: expected 2 mermaid blocks, found {(len(parts)-1)//2}")
        return False
    parts[1] = build_score_mermaid(weeks, lang)
    parts[3] = build_gap_mermaid(weeks, lang)
    text = "".join(parts)

    # ── 5. History table (finals only) + interim reference blockquote ──
    finals = [w for w in weeks if not w.get("is_interim")]
    interims = [w for w in weeks if w.get("is_interim")]
    history_md = build_history_table(finals, lang)
    interim_ref = build_interim_reference(interims, lang)
    daily_md = build_daily_mermaid(snapshots or [], lang)
    daily_table_md = build_daily_table(snapshots or [], lang)
    blocks = []
    if daily_md:
        daily_parts = [f"{L['daily_header']}\n\n{daily_md}"]
        if daily_table_md:
            daily_parts.append(daily_table_md)
        blocks.append("\n\n".join(daily_parts).rstrip())
    blocks.append(history_md.rstrip())
    if interim_ref:
        blocks.append(interim_ref.rstrip())
    insert_block = "\n\n" + "\n\n".join(blocks) + "\n"

    # Update Voices section dynamically
    voices_md = build_voices_markdown(voices or [], lang)
    if voices_md:
        pattern = r'(?m)^## ' + re.escape(L['voices_header']) + r'\s*\n.*?(?=\n## |\Z)'
        if re.search(pattern, text, re.DOTALL):
            text = re.sub(pattern, voices_md.rstrip() + '\n', text, flags=re.DOTALL)
        else:
            text = text.rstrip() + '\n\n' + voices_md.rstrip() + '\n'




    m2 = list(re.finditer(r"```mermaid\n.*?\n```", text, flags=re.DOTALL))
    if len(m2) < 2:
        print(f"  {path.name}: mermaid blocks not found after replace")
        return False
    after_m2 = m2[1].end()
    m_sep = re.search(r"\n---\n", text[after_m2:])
    if not m_sep:
        print(f"  {path.name}: '---' separator not found after graphs")
        return False
    sep_pos = after_m2 + m_sep.start()

    # Idempotent: strip previous history section between graphs and separator.
    segment = text[after_m2:sep_pos]
    idx = segment.find(L["daily_header"])
    if idx == -1:
        idx = segment.find(L["hist_header"])
    if idx != -1:
        head = segment[:idx].rstrip("\n")
        text = text[:after_m2] + head + text[sep_pos:]
        m_sep = re.search(r"\n---\n", text[after_m2:])
        sep_pos = after_m2 + m_sep.start()

    text = text[:sep_pos] + insert_block + text[sep_pos:]

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
                if shown <= 30:
                    print(f"    L{i+1}:")
                    print(f"      - {a}")
                    print(f"      + {b}")
        if shown > 30:
            print(f"    ... and {shown - 30} more")
        return True

    path.write_text(text, encoding="utf-8")
    print(f"  {path.name}: UPDATED")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--root", default=str(ROOT))
    ap.add_argument("--weeks-file", help="JSON file with {weeks: [...]} to skip live fetch")
    args = ap.parse_args()
    root = Path(args.root)

    if args.weeks_file:
        print(f"[update_readme] weeks-file: {args.weeks_file}")
        data = json.loads(Path(args.weeks_file).read_text())
    else:
        print(f"[update_readme] API: {API}")
        data = fetch_json(f"{API}/gap-history")

    weeks = data.get("weeks", [])
    snapshots = fetch_daily_snapshots()
    voices = fetch_voices()
    print(f"[update_readme] weeks: {len(weeks)}, snapshots: {len(snapshots)}, voices: {len(voices)}")
    if weeks:
        w = weeks[-1]
        print(f"  latest: {w['week_end']} ai={w['ai']} human={w['human']} "
              f"gap={w['gap']} items={w['items']} sample={w['sample']} "
              f"interim={w['is_interim']}")

    for lang in ("en", "ru", "zh"):
        path = root / STRINGS[lang]["path"]
        if not path.exists():
            print(f"  {path.name}: NOT FOUND", file=sys.stderr)
            continue
        try:
            update_readme(path, lang, weeks, snapshots=snapshots, voices=voices, dry=args.dry)
        except Exception as e:
            print(f"  {path.name}: ERROR {e}", file=sys.stderr)
            return 1

    print(f"[update_readme] done (dry={args.dry})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
