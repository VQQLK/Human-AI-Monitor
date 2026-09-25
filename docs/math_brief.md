# Human–AI Monitor: A Brief for Mathematicians

**Version:** 1.0.1  
**Date:** September 25, 2026  
**Language:** [🇷🇺 Русский](math_brief.ru.md)

---

## 1. The Project in One Paragraph

We are building an **open monitoring system** that simultaneously tracks the development of artificial intelligence (7 axes) and the state of humanity (6 axes), computes a **Gap Index** — a quantitative measure of divergence between them — and publishes weekly protocols. This is not journalism, and not forecasting. It is an **attempt to operationalize a question that has remained rhetorical**: is singularity arriving, and what is happening to humanity in the process?

As of September 25, 2026, the system has completed its **first fully autonomous daily cycle** — 4 batches collected 33 items from 17 sources, classifier processed them, and an interim protocol for the current week was generated without human intervention.

---

## 2. Formal Structure

### 2.1. AI Axes (RSI)

| Symbol | What Is Measured | Threshold for Reassessment |
|--------|------------------|----------------------------|
| SMD | Depth of self-modification (L0–L4) | Reproducible L4 in 2+ independent systems |
| ITQ | Improvement trajectory (slope, acceleration) | Transfer to Transfer Set + Acceleration > 0 |
| AGG | Autonomous goal generation | Expert significance without external assignment |
| Cycle Velocity | Cycle speed (doubling time) | <2 months + completion rate >50% |
| Verification | Verification hierarchy | False positive rate <5% without oversight |
| Hexad | Phase transition detection (MMD) | Sustained exceedance in 2+ systems |
| **Geopolitics** | AI governance, state policy | Major treaty / export control / national strategy |

> **Methodological asymmetry:** |A| = 7 ≠ 6 = |H|. The `geopolitics` axis is treated as a **meta-layer**, not a symmetric axis (documented in `docs/methodology.md`).

### 2.2. Humanity Axes (HHI)

| Symbol | What Is Measured | Baseline ℓ₀ |
|--------|------------------|-------------|
| H1 Agency | Human agency, decision autonomy | 0.55 |
| H2 Sovereignty | Cognitive sovereignty, critical thinking | 0.50 |
| H3 Wellbeing | Wellbeing, mental health, loneliness | 0.45 |
| H4 Equity | Equity and access, compute divide | 0.40 |
| H5 Meaning | Meaning and purpose in work | 0.50 |
| H6 Democracy | Institutional resilience, trust | 0.45 |

### 2.3. Axis Level Function

For each axis a ∈ A ∪ H and signal set S_a = {s₁, …, s_n} that landed on this axis during a week, the axis level is:

    ℓ(a) = clamp_[0,1]((1/|S_a|) · Σ_{s ∈ S_a} r_s · M_shift(σ_s) · M_dir(d_s))

where:
- r_s ∈ [0, 1] — relevance (classifier confidence),
- σ_s ∈ {yes, no, uncertain} — shift flag,
- d_s ∈ {up, down, stable, uncertain} — direction,
- clamp_[0,1](x) = max(0, min(1, x)) — projection onto [0,1].

**Multipliers** (empirical weights from `src/services/gap-computation.ts`):

    M_shift:  1.5 (yes),  1.0 (uncertain),  0.5 (no)
    M_dir:    1.2 (up),   1.0 (stable/uncertain),  0.8 (down)

**Implementation note:** the multipliers are keyed in English (`yes`/`no`/`uncertain` for shift; `up`/`down`/`stable` for direction) to match the classifier output exactly. The `?? 1` fallback handles any unexpected values gracefully.

This gives the model **full sensitivity** to threshold shifts and directional trends:
- `shift: "yes"` → 50% boost (signal of genuine change)
- `shift: "no"` → 50% penalty (signal of stagnation)
- `direction: "up"` → 20% boost (positive trend)
- `direction: "down"` → 20% penalty (negative trend)

### 2.4. Aggregation

AI-score and Human-score are plain arithmetic means over their respective axis sets:

    AI_score    = (1/|A|) · Σ_{a∈A} ℓ(a)  = (1/7) · Σ_{a∈A} ℓ(a)
    Human_score = (1/|H|) · Σ_{a∈H} ℓ(a)  = (1/6) · Σ_{a∈H} ℓ(a)

**Normalization property:** both metrics lie in [0, 1] as means of values from [0,1].

### 2.5. Gap Index

    Gap = AI_score − Human_score

**Domain:** Gap ∈ [−1, 1] (difference of two [0,1] values).

**Interpretation** (piecewise-constant function with thresholds ±0.1 and ±0.3):

    Gap < −0.3          → Humanity significantly ahead
    −0.3 ≤ Gap < −0.1   → Humanity ahead
    −0.1 ≤ Gap ≤ 0.1    → Symmetric development
    0.1 < Gap ≤ 0.3     → AI ahead
    Gap > 0.3           → AI significantly ahead

The **neutral zone** [−0.1, 0.1] of width 0.2 corresponds to statistical noise for small samples (analogous to a hysteresis dead band).

### 2.6. Classifier (LLM interface)

The classifier is a model f: T → Y, where T is the space of texts (title + summary, ≤800 chars), and the output space is:

    Y = {(A, r, σ, d, ρ)}

where:
- A ⊆ (AI_axes ∪ Human_axes), 1 ≤ |A| ≤ 3 (sparse),
- r ∈ [0, 1] — relevance score,
- σ ∈ {yes, no, uncertain} — shift flag,
- d ∈ {up, down, stable, uncertain} — direction,
- ρ ∈ T — reasoning (1–2 sentences).

**Critical rule:** σ = yes is only permitted when a threshold shift is empirically confirmed (rule 3 in `src/config/prompts.ts`).

### 2.7. Statistical Properties

- **Hash-check before classify:** SHA-256 of URL/title → DB lookup → classify only new items. Empirical saving: ~90% of LLM calls avoided.
- **Batch processing:** 5 batches per day × ~8 sources × ~2-3 items/source ≈ 80-120 classifications/day.
- **Gap robustness:** for |S| < 10, standard error ~ 1/√|S| ≈ 0.3, which exceeds the neutral-zone width (0.2) — interpretation becomes unreliable. Today's n=170 signals yield SE ≈ 0.08 (acceptable).

---

## 3. Why This Interests Mathematicians

### 3.1. Formalizing the Unformalizable

Singularity is a concept that has so far been defined **literarily** (Vinge, Good, Altman). We propose a **measurable structure**: 7 AI axes + 6 Human axes with explicit thresholds, each **falsifiable**.

This is an attempt to turn **speculation into hypothesis**, and hypothesis into **observable quantity**.

### 3.2. AI ↔ Human Symmetry

The 13 axes form an **almost-symmetric structure**: 7 parameters describing the **artificial**, 6 describing the **human**. The asymmetry (`geopolitics` as meta-layer) is a conscious design choice. The symmetry hypothesis remains: **AI development and Humanity's development are linked**, and the gap between them is the key variable.

### 3.3. Open Mathematical Problems

**Problem 1. Criterion for Genuine RSI.**

When is a system's self-modification **sustained improvement**, and when is it **saturation**? Related to computability theory (Kleene's recursion theorem, halting problem) and information theory (Kolmogorov complexity).

**Formalization:** let S be a self-improving system, S_t its state at time t. RSI is the process S_{t+1} = f(S_t), where f is the system itself (reflexivity). Sustainability means: lim_{t→∞} (d/dt) Capability(S_t) > 0. Question: under what conditions on f is this satisfied?

**Problem 2. Phase Transition Detection.**

The MMD detector (Hexad) is a heuristic. A rigorous theory is needed: **how to distinguish a phase transition from noise** in a self-improving system?

**Formalization:** let X_t be the trajectory of SGD iterations. We compute MMD(X_t, N(0, I)) — distance to a Gaussian surrogate. Question: does there exist a threshold τ such that MMD > τ statistically significantly indicates violation of local asymptotic normality (LAN)?

**Problem 3. Verification Without an Oracle.**

The verification hierarchy (formal verifiers → execution → LLM judges → self-assessment) is a **partial order**. When can the system **close the loop without a human**? This is a question about the **computational complexity of self-reference**.

**Formalization:** let V = {v₁, ..., v_n} be a hierarchy of verifiers, where v_i < v_j means "v_i is less reliable than v_j". The system can close the loop without a human if there exists v_i such that false_positive_rate(v_i) < 5% and v_i is autonomously applicable. Question: what is the minimum complexity of v_i?

**Problem 4. Gap Index as a Dynamical System.**

G(t) is not a scalar but a trajectory. Can one find **invariants**? Do **attractors** exist? What happens as G → ∞?

**Formalization:** let G(t) = F(A(t), H(t)), where A(t) is the vector of AI levels, H(t) is the vector of Humanity levels. Question: is G(t) an integrable system? Do conserved quantities exist?

---

## 4. What Makes the Project Unique

### 4.1. Openness

- **Code:** MIT License, fully on GitHub.
- **Data:** all sources, prompts, migrations — open.
- **API:** free public access to protocols and Gap Index.
- **Reproducibility:** every protocol links to hashes of source data.

### 4.2. Independence

- **Not affiliated** with any AI lab, state, or political organization.
- **Open-weight models** (Cloudflare Workers AI: Qwen 3) — no external APIs, no leaks.
- **Cloudflare Workers** — decentralized infrastructure, no single point of failure.

### 4.3. Two-Sidedness

This is **not a monitor of AI**. This is a **monitor of AI + Humanity**. We measure not only what AI does, but **what is happening to us**.

---

## 5. The Scale of the Idea

### 5.1. Historical Analogy

In 1957, **Sputnik** launched the space race. In 1969, **Apollo** landed humans on the Moon. In 2026, **frontier AI systems** are leaving sandboxes and solving problems that remained open for 87 years.

**But who observes this?** Corporations publish releases. States — declarations. Scientists — papers. **No one publishes a weekly report on what is happening to humanity.**

We do.

### 5.2. Potential Transformation

- **Now:** weekly protocol in Markdown, 3 languages (EN/RU/ZH).
- **In 6 months:** Android app with push notifications.
- **In a year:** public API for researchers, journalists, politicians.
- **In 3 years:** global monitoring standard — open, reproducible, independent.
- **Ultimately:** an instrument of awareness — not just data, but a **mirror of civilization**.

### 5.3. Philosophical Meaning

The project is built on one question: **"What does it mean to see one's own path?"**

We do not predict the future. We **observe the present** — clearly, systematically, openly.

**Knowledge of one's own path cannot be a privilege.**

---

## 6. First Autonomous Day — September 25, 2026

For the first time, the system ran **fully autonomously** for an entire day, with no manual intervention:

| Time UTC | Event | Result |
|----------|-------|--------|
| 13:00–13:01 | Batch 1 | 8 items, 2 sources ✅ |
| 13:15–13:17 | Batch 2 | 13 items, 4 sources ✅ |
| 13:30–13:31 | Batch 3 | 8 items, 4 sources ✅ |
| 13:45–13:46 | Batch 4 | 4 items, 2 sources + **interim protocol** ✅ |

**Day summary:**

    Items collected:     33
    Unique sources:      17
    Interim protocol:    week 2026-09-21 (current week)
      - items_count:     170
      - shifts_count:    4
      - is_interim:      1
      - generated_at:    2026-09-25T13:46:38Z

**Current Gap Index (week 2026-09-14):**

    {
      "week_start": "2026-09-14",
      "ai_score": 0.64,
      "human_score": 0.75,
      "gap": -0.1,
      "interpretation": "Humanity is ahead"
    }

Gap sits on the edge of the neutral zone [−0.1, 0.1], indicating the early phase of an asymmetry in humanity's favor.

---

## 7. Protocol Synchronization Schedule

### 7.1. Generation vs Visibility

Protocols are generated into the **D1 database** but appear in the **git repository** (`data/protocols/`) with a delay. This is not a bug — synchronization is handled by a separate GitHub Actions workflow on a schedule.

### 7.2. Delay Table

| Protocol type | Generated (D1) | Visible (git) | Delay |
|---------------|----------------|---------------|-------|
| **Interim** (draft) | Friday 13:45 UTC | **Saturday 08:00 UTC** | ~18 hours |
| **Final** | Monday 13:45 UTC | **Monday 14:00 UTC** | ~15 minutes |

### 7.3. Why the Delay?

- **Interim:** generated Friday 13:45, synced Saturday 08:00 — allows weekend review before publication.
- **Final:** generated Monday 13:45, synced Monday 14:00 — near-immediate publication.

### 7.4. Sync Workflow

Defined in `.github/workflows/sync-protocols.yml`:

    on:
      schedule:
        - cron: "0 14 * * 1"   # Monday 14:00 UTC — sync final
        - cron: "0 8 * * 6"    # Saturday 08:00 UTC — sync interim

The workflow:
1. Fetches latest 2 protocols from D1 API (`/export-weekly?weeks=2`).
2. Writes to `data/protocols/` in the collector repo.
3. Archives all protocols to the `human-ai-monitor-archive` repo.
4. Triggers the translation workflow (EN→RU/ZH).

### 7.5. Manual Sync

    gh workflow run sync-protocols.yml

Full documentation: `docs/architecture.md` §6 "Protocol Synchronization".

---

## 8. What Has Been Done (v1.0.1)

| Component | Status |
|-----------|--------|
| Architecture | Cloudflare Workers + D1 + Workers AI (modular, 14 modules) |
| Classifier | Qwen 3 (open-weight) on Cloudflare Workers AI |
| Configuration | `wrangler.jsonc` with D1 binding, 5 cron batches |
| Infrastructure | D1 created (EEUR), 4 tables populated |
| Code | TypeScript, 20 API endpoints, 41 sources |
| Tests | **66/66 passing** (~75% coverage) |
| Audit | **19/19 ok, 0 warn, 0 FAIL** (`scripts/repo_audit.py`) |
| CI/CD | GitHub Actions: CI, docs-check, sync, translate |
| Documentation | README × 3 (EN/RU/ZH), docs/, research/ × 3 |
| Methodology | `docs/methodology.md`, `docs/math_brief.md` |
| Live API | https://human-ai-monitor-collector.human-ai-monitor.workers.dev |
| Autonomy | ✅ First fully autonomous daily cycle completed (2026-09-25) |

### v1.0.1 Critical Fixes (September 25, 2026)

Two critical bugs were discovered and fixed in the initial v1.0.0 release:

**1. Russian keys in gap-computation.ts (commit `13fa1c1`)**

The multiplier dictionaries `SHIFT_MULT` and `DIR_MULT` were declared with Russian keys (`'да'`/`'нет'`/`'рост'`/`'падение'`), while the classifier returned English keys (`yes`/`no`/`up`/`down`). This caused the lookup to return `undefined`, falling back to `?? 1` (unit multiplier).

**Impact:** The model lost sensitivity to threshold shifts and directional trends, effectively reducing to mean-relevance-per-axis.

**Fix:** Translated all multiplier keys to English, restoring full mathematical model functionality.

**2. Miniflare hang after tests (commit `5f5721d`)**

After all 66 tests passed, Miniflare failed to close WebSocket, ZLIB streams, and FileHandle resources, causing a 10-second timeout hang (24s total runtime instead of ~5s).

**Fix:** Added `test/global-teardown.ts` with 2-second grace period followed by `process.exit(0)`. Reduced `teardownTimeout` from 10s to 3s. Disabled `remoteBindings` in tests.

**Result:** Test suite now completes in **8 seconds** instead of 24 seconds.

---

## 9. Invitation

If you are a mathematician, and any of the open problems (formalizing RSI, phase transition detection, verification without an oracle, Gap Index dynamics) interests you — we invite you to collaborate.

**The project is open. The code is open. The data is open.**

**Together — We Are Strong. The road will be mastered by the one who walks it.**

---

**Contacts:**
- GitHub: https://github.com/VQQLK/Human-AI-Monitor
- Issues: https://github.com/VQQLK/Human-AI-Monitor/issues
- API: https://human-ai-monitor-collector.human-ai-monitor.workers.dev
