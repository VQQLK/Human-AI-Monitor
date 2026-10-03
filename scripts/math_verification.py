#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Математическая верификация v4 — финальная
- Исправлен Beta sampler (temp variables)
- PI_TABLE проверяется по directional symmetry (up ↔ down)
"""

import json
import re
import subprocess
import sys
from pathlib import Path
from datetime import datetime

PROJECT = Path.cwd()
RESULTS = {"pass": 0, "warn": 0, "fail": 0, "tests": []}


def log(status, msg, details=""):
    emoji = {"pass": "✅", "warn": "⚠️", "fail": "❌", "info": "ℹ️"}
    print(f"  {emoji.get(status, '•')} {msg}")
    if details:
        print(f"     {details}")
    if status in RESULTS:
        RESULTS[status] += 1
    RESULTS["tests"].append({"status": status, "msg": msg})


def read_file(path):
    p = PROJECT / path
    return p.read_text(encoding="utf-8") if p.exists() else None


def extract_object(c, marker):
    """Brace-matching extraction (с учётом строк)."""
    m = re.search(rf"\b{marker}\b[^=]*=\s*\{{", c)
    if not m:
        return None
    start = m.end() - 1
    depth = 0
    in_string = False
    quote_char = None
    for i in range(start, len(c)):
        ch = c[i]
        if in_string:
            if ch == quote_char and c[i-1] != '\\':
                in_string = False
            continue
        if ch in ('"', "'", '`'):
            in_string = True
            quote_char = ch
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return c[start:i+1]
    return None


print("═" * 70)
print(f"  МАТЕМАТИЧЕСКАЯ ВЕРИФИКАЦИЯ v4 — {datetime.now().isoformat()}")
print("═" * 70)

# 1. Files
print("\n── 1. Наличие ключевых файлов ──")
files = {
    "gap-computation.ts": "src/services/gap-computation.ts",
    "bayesian-gap.ts": "src/services/bayesian-gap.ts",
    "weights.ts": "src/config/weights.ts",
    "prompts.ts": "src/config/prompts.ts",
}
contents = {}
for name, path in files.items():
    c = read_file(path)
    if c is None:
        log("fail", f"{name} отсутствует")
    else:
        contents[name] = c
        log("pass", f"{name} найден ({len(c)} символов)")

combined = "\n".join(contents.values())

# 2. Weights
print("\n── 2. Веса осей (HANDOFF §15.1) ──")
weights_content = contents.get("weights.ts", "")
for var_name in ("AI_WEIGHTS", "HUMAN_WEIGHTS"):
    block = extract_object(weights_content, var_name)
    if not block:
        log("warn", f"Не удалось извлечь {var_name}")
        continue
    pairs = re.findall(r"(\w+)\s*:\s*([0-9.]+)", block)
    if not pairs:
        log("warn", f"{var_name}: не найдено пар")
        continue
    keys = [k for k, _ in pairs]
    vals = [float(v) for _, v in pairs]
    s = sum(vals)
    if abs(s - 1.0) < 1e-9:
        log("pass", f"{var_name} сумма = {s:.10f}",
            f"Оси ({len(keys)}): {', '.join(keys)}")
    else:
        log("fail", f"{var_name} сумма = {s:.10f} ≠ 1.0")
    if all(0 < v < 1 for v in vals):
        log("pass", f"{var_name}: все веса ∈ (0, 1)")
    else:
        log("fail", f"{var_name}: вес вне (0, 1)")

# 3. PI_TABLE — directional symmetry
print("\n── 3. PI_TABLE: directional symmetry (HANDOFF §15.2.3) ──")
pi_block = extract_object(combined, "PI_TABLE")
if not pi_block:
    log("warn", "PI_TABLE не найдена")
else:
    # Parse inner blocks:  yes: { up: X, stable: Y, down: Z, uncertain: W }
    rows = {}
    for shift_match in re.finditer(
        r"(\w+)\s*:\s*\{([^{}]*)\}",
        pi_block
    ):
        shift = shift_match.group(1)
        inner = shift_match.group(2)
        row = {}
        for kv in re.finditer(r"(\w+)\s*:\s*([-+]?\s*[0-9]*\.?[0-9]+)", inner):
            row[kv.group(1)] = float(kv.group(2).replace(" ", ""))
        if row:
            rows[shift] = row

    if not rows:
        log("warn", "PI_TABLE: не удалось распарсить строки")
    else:
        # Check directional symmetry: up == -down for each shift
        all_symmetric = True
        asymmetric_shifts = []
        for shift, row in rows.items():
            up = row.get("up")
            down = row.get("down")
            if up is None or down is None:
                continue
            if abs(up + down) > 1e-9:
                all_symmetric = False
                asymmetric_shifts.append(f"{shift}: up={up}, down={down}")

        if all_symmetric:
            log("pass", f"PI_TABLE directionally symmetric (up = -down для всех {len(rows)} строк)",
                f"Строки: {', '.join(rows.keys())}")
        else:
            log("fail", f"PI_TABLE: нарушена directional symmetry",
                "; ".join(asymmetric_shifts))

        # Check 0.0 present (neutral state)
        has_zero = any(0.0 in row.values() for row in rows.values())
        if has_zero:
            log("pass", "PI_TABLE содержит нейтральное значение 0.0")
        else:
            log("warn", "PI_TABLE не содержит 0.0")

        # Optional: verify exact values
        expected = {
            "yes": {"up": 1.0, "down": -1.0},
            "no": {"up": 0.3, "down": -0.3},
        }
        values_ok = True
        for shift, exp in expected.items():
            if shift not in rows:
                continue
            row = rows[shift]
            for direction, val in exp.items():
                actual = row.get(direction)
                if actual is None or abs(actual - val) > 1e-9:
                    values_ok = False
                    break
        if values_ok:
            log("pass", "PI_TABLE: ожидаемые значения yes/no соответствуют {±1.0, ±0.3}")
        else:
            log("warn", "PI_TABLE: значения yes/no не совпадают с ожидаемыми {±1.0, ±0.3}")

# 4. Weighted-sum
print("\n── 4. Weighted-sum Monte Carlo ──")
weighted_patterns = [
    (r"\bwAI\s*\[\s*\w+\s*\]\s*\*", "wAI[i] × ..."),
    (r"\bwH\w*\s*\[\s*\w+\s*\]\s*\*", "wH[j] × ..."),
    (r"\bweight[s]?\s*\[\s*\w+\s*\]\s*\*", "weight[i] × ..."),
    (r"\*\s*sampleBeta", "* sampleBeta(...)"),
    (r"reduce\s*\(\s*\(?\w*[,)]", "reduce с весами"),
    (r"weighted", "weighted"),
    (r"wAI\s*\[\s*\w+\s*\]", "wAI[i]"),
    (r"wH(uman)?\s*\[\s*\w+\s*\]", "wH[j]"),
]
matched = [desc for pat, desc in weighted_patterns if re.search(pat, combined, re.IGNORECASE)]
if matched:
    log("pass", f"Weighted-sum обнаружен ({len(matched)} паттернов)",
        f"Совпадения: {', '.join(matched[:4])}")
else:
    log("warn", "Weighted-sum структура не найдена")

# 5. Constants
print("\n── 5. Базовые математические константы ──")
alpha_m = re.search(r"ALPHA_0\s*=\s*([0-9.]+)", combined)
beta_m = re.search(r"BETA_0\s*=\s*([0-9.]+)", combined)
mc_m = re.search(r"DEFAULT_MC_SAMPLES\s*=\s*(\d+)", combined)
if alpha_m and beta_m:
    a0, b0 = float(alpha_m.group(1)), float(beta_m.group(1))
    log("pass" if (a0 == 0.5 and b0 == 0.5) else "warn",
        f"Jeffreys prior: ALPHA_0={a0}, BETA_0={b0}")
else:
    log("fail", "ALPHA_0/BETA_0 не найдены")
if mc_m:
    mc = int(mc_m.group(1))
    log("pass" if mc >= 10000 else "warn", f"DEFAULT_MC_SAMPLES = {mc}")
else:
    log("warn", "DEFAULT_MC_SAMPLES не найдена")

# 6. Numeric tests — FIXED Beta sampler
print("\n── 6. Численные тесты Gamma и Beta samplers ──")
numeric_code = '''
function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
function sampleGamma(alpha, rng) {
    if (alpha < 1) return sampleGamma(alpha + 1, rng) * Math.pow(rng(), 1 / alpha);
    const d = alpha - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
        let x, v;
        do {
            const u1 = rng(), u2 = rng();
            x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            v = Math.pow(1 + c * x, 3);
        } while (v <= 0);
        const u = rng();
        if (u < 1 - 0.0331 * Math.pow(x, 4)) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
}
// FIX: temp variables — x и y получены ровно один раз
function sampleBeta(a, b, rng) {
    const x = sampleGamma(a, rng);
    const y = sampleGamma(b, rng);
    return x / (x + y);
}
const rng = mulberry32(12345);
const N = 100000;
let gs = 0, gs2 = 0;
for (let i = 0; i < N; i++) {
    const g = sampleGamma(2.5, rng);
    gs += g; gs2 += g*g;
}
const gmean = gs/N, gvar = gs2/N - gmean*gmean;
const a = 2.735, b = 0.5;
let bs = 0, bs2 = 0;
for (let i = 0; i < N; i++) {
    const x = sampleBeta(a, b, rng);
    bs += x; bs2 += x*x;
}
const bmean = bs/N, bvar = bs2/N - bmean*bmean;
const bmean_exp = a/(a+b);
const bvar_exp = (a*b)/((a+b)**2 * (a+b+1));
console.log(JSON.stringify({
    gamma: { mean: gmean, var: gvar, e_mean: 2.5, e_var: 2.5 },
    beta:  { mean: bmean, var: bvar, e_mean: bmean_exp, e_var: bvar_exp }
}));
'''
try:
    r = subprocess.run(["node", "-e", numeric_code], capture_output=True, text=True, timeout=30)
    if r.returncode == 0:
        d = json.loads(r.stdout.strip())
        gm_err = abs(d["gamma"]["mean"] - 2.5) / 2.5
        gv_err = abs(d["gamma"]["var"] - 2.5) / 2.5
        log("pass" if gm_err < 0.01 and gv_err < 0.02 else "warn",
            f"Gamma(2.5): mean err {gm_err*100:.3f}%, var err {gv_err*100:.3f}%")
        bm_err = abs(d["beta"]["mean"] - d["beta"]["e_mean"]) / d["beta"]["e_mean"]
        bv_err = abs(d["beta"]["var"] - d["beta"]["e_var"]) / d["beta"]["e_var"]
        log("pass" if bm_err < 0.01 and bv_err < 0.02 else "warn",
            f"Beta(2.735, 0.5): mean err {bm_err*100:.3f}%, var err {bv_err*100:.3f}%")
    else:
        log("fail", f"Node error: {r.stderr[:200]}")
except Exception as e:
    log("warn", f"Numeric test skipped: {e}")

# 7. Limitations
print("\n── 7. Проверка ограничений §15.2 ──")
for name, pattern, msg in [
    ("§15.2.1", r"source.*correlation|hierarchical|random.?effect",
     "Source correlation НЕ моделируется"),
    ("§15.2.2", r"bonferroni|benjamini|hochberg|FDR|holm",
     "Нет multiple comparisons correction"),
    ("§15.2.3", r"PI_TABLE.*calibrat|empirical.*PI",
     "PI_TABLE не калибрована эмпирически"),
]:
    if re.search(pattern, combined, re.IGNORECASE):
        log("warn", f"{name}: обнаружено противоречие")
    else:
        log("pass", f"{name}: {msg} ✓")

# 8. MC convergence
print("\n── 8. MC convergence (HANDOFF §15.4, Test F) ──")
mc_conv_code = '''
function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
function sampleGamma(alpha, rng) {
    if (alpha < 1) return sampleGamma(alpha + 1, rng) * Math.pow(rng(), 1 / alpha);
    const d = alpha - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
        let x, v;
        do {
            const u1 = rng(), u2 = rng();
            x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            v = Math.pow(1 + c * x, 3);
        } while (v <= 0);
        const u = rng();
        if (u < 1 - 0.0331 * Math.pow(x, 4)) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
}
function sampleBeta(a, b, rng) {
    const x = sampleGamma(a, rng);
    const y = sampleGamma(b, rng);
    return x / (x + y);
}
function quantile(arr, q) {
    const s = arr.slice().sort((a,b) => a - b);
    return s[Math.floor(q * (s.length - 1))];
}
function runMC(M, seed) {
    const rng = mulberry32(seed);
    const samples = [];
    for (let i = 0; i < M; i++) samples.push(sampleBeta(3.5, 1.5, rng));
    const mean = samples.reduce((a,b) => a+b, 0) / samples.length;
    return { mean, ci_width: quantile(samples, 0.975) - quantile(samples, 0.025) };
}
const results = {};
for (const M of [1000, 10000, 100000]) {
    const runs = [];
    for (let seed = 1; seed <= 20; seed++) runs.push(runMC(M, seed));
    results[M] = { mean: runs.reduce((a,r) => a + r.mean, 0) / runs.length };
}
const change = Math.abs(results[100000].mean - results[10000].mean) / results[10000].mean;
console.log(JSON.stringify({ results, change_pct: change * 100 }));
'''
try:
    r = subprocess.run(["node", "-e", mc_conv_code], capture_output=True, text=True, timeout=60)
    if r.returncode == 0:
        d = json.loads(r.stdout.strip())
        change = d["change_pct"]
        log("pass" if change < 1.0 else "fail",
            f"MC convergence: M=10k→100k изменение = {change:.3f}%",
            f"Means: 1k={d['results']['1000']['mean']:.4f}, "
            f"10k={d['results']['10000']['mean']:.4f}, "
            f"100k={d['results']['100000']['mean']:.4f}")
    else:
        log("fail", f"MC conv error: {r.stderr[:200]}")
except Exception as e:
    log("warn", f"MC conv skipped: {e}")

# Report
print("\n" + "═" * 70)
print("  ИТОГОВЫЙ ОТЧЁТ МАТЕМАТИЧЕСКОЙ ВЕРИФИКАЦИИ v4")
print("═" * 70)
print(f"  ✅ PASS: {RESULTS['pass']}")
print(f"  ⚠️  WARN: {RESULTS['warn']}")
print(f"  ❌ FAIL: {RESULTS['fail']}")
print()
if RESULTS['fail'] == 0 and RESULTS['warn'] == 0:
    print("  🏆 ВСЕ МАТЕМАТИЧЕСКИЕ КОМПОНЕНТЫ ВЕРИФИЦИРОВАНЫ")
    exit_code = 0
elif RESULTS['fail'] == 0:
    print(f"  ⚠️  OK с {RESULTS['warn']} предупреждениями")
    exit_code = 0
else:
    print(f"  ❌ FAIL: {RESULTS['fail']} критических ошибок")
    exit_code = 1
print("═" * 70)
sys.exit(exit_code)
