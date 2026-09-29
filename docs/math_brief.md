# Human–AI Monitor: A Brief for Mathematicians

**Version:** 1.0.2  
**Date:** September 29, 2026  
**Language:** [🇷🇺 Русский](math_brief.ru.md) | [🇨🇳 中文](math_brief.zh.md)

---

## 1. The Project in One Paragraph

We are building an **open monitoring system** that simultaneously tracks the development of artificial intelligence (6 axes) and the state of Humanity (6 axes), plus one geopolitical meta-layer, computes a **Gap Index** — a quantitative measure of divergence between them — and publishes weekly protocols. This is not journalism, and not forecasting. It is an **attempt to operationalize a question that has remained rhetorical**: is singularity arriving, and what is happening to Humanity in the process?

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

### 2.1b. Geopolitical Axis (meta-layer)

| Symbol | What Is Measured | Threshold for Reassessment |
|--------|------------------|----------------------------|
| Geopolitics | AI governance, state policy | Major treaty / export control / national strategy |

> **Methodological symmetry:** |A| = 6 = |H|. The `geopolitics` axis is a **meta-layer** — measured and published, but **NOT included** in AI_score or Human_score (documented in `docs/methodology.md`).

### 2.2. Humanity Axes (HHI)

| Symbol | What Is Measured | Alarm Threshold |
|--------|------------------|-----------------|
| H1 Agency | Human agency, decision autonomy | Sustained decline in key domains |
| H2 Sovereignty | Cognitive sovereignty, critical thinking | Growing share unable to distinguish AI content |
| H3 Wellbeing | Wellbeing, mental health, loneliness | Rising anxiety and loneliness among youth |
| H4 Equity | Equity and access, compute divide | Growing compute divide |
| H5 Meaning | Meaning and purpose in work | Decline in share finding meaning in work |
| H6 Democracy | Institutional resilience, trust | Sustained decline in trust |

### 2.3. Bayesian Axis Level

Each axis level is a latent random variable on [0, 1] with a posterior Beta distribution. For axis a with signal set S_a = {s₁, …, s_n}:

    ℓ(a) | S_a ~ Beta( α₀ + Σ_{s ∈ S_a} v_s⁺ ,  β₀ + Σ_{s ∈ S_a} v_s⁻ )

where:
- α₀ = β₀ = 1/2 — non-informative **Jeffreys prior**,
- v_s = r_s · π(σ_s, d_s) — signal voice,
- v_s⁺ = max(0, v_s),  v_s⁻ = max(0, −v_s).

**Voice table** π(σ, d) ∈ [−1, 1]:

| π | up | stable | down | uncertain |
|---|---|---|---|---|
| **yes** | +1.0 | +0.5 | −1.0 | +0.5 |
| **no** | +0.3 | 0.0 | −0.3 | 0.0 |
| **uncertain** | 0.0 | 0.0 | 0.0 | 0.0 |

Point estimate:  ℓ̂(a) = (α₀ + Σv_s⁺) / (α₀ + β₀ + Σv_s⁺ + Σv_s⁻).

**Fallback.** For |S_a| = 0, posterior = prior = Beta(0.5, 0.5), mean 0.5, wide credible interval (previously a false zero).

Full Bayesian treatment: [`docs/bayesian_framework.md`](bayesian_framework.md) §3.2.

### 2.4. Aggregation

AI-score and Human-score are plain arithmetic means over their respective axis sets:

    AI_score    = (1/|A|) · Σ_{a∈A} ℓ(a)  = (1/6) · Σ_{a∈A} ℓ(a)
    Human_score = (1/|H|) · Σ_{a∈H} ℓ(a)  = (1/6) · Σ_{a∈H} ℓ(a)

**Normalization property:** both metrics lie in [0, 1] as means of values from [0,1].

**Gap distribution.** The Gap is constructed by Monte Carlo (M = 10,000 samples):

    ℓ^(k)(aᵢ) ~ Beta(αᵢ, βᵢ),  ℓ^(k)(hⱼ) ~ Beta(αⱼ, βⱼ)   for k = 1..M
    Gap^(k) = AI^(k) − Human^(k)

Point estimate: Ĝap = mean({Gap^(k)}).  95% credible interval: [q₀.₀₂₅, q₀.₉₇₅].

### 2.5. Gap Index

    Gap = AI_score − Human_score

**Domain:** Gap ∈ [−1, 1] (difference of two [0,1] values).

**Interpretation** (piecewise-constant function with thresholds ±0.1 and ±0.3):

    Gap < −0.3          → Humanity significantly ahead
    −0.3 ≤ Gap < −0.1   → Humanity ahead
    −0.1 ≤ Gap ≤ 0.1    → Symmetric development
    0.1 < Gap ≤ 0.3     → AI ahead
    Gap > 0.3           → AI significantly ahead

The **neutral zone** [−0.1, 0.1] of width 0.2 corresponds to statistical noise for small samples (analogous to a dead band).

The interpretation is **stable** when the 95% credible interval of Gap lies entirely within one row, and **unstable** when the interval crosses a threshold.

### 2.6. Classifier (LLM interface)

The classifier is a model f: T* → Y*, applied to a batch of items. For a single item, T is the space of texts (title + summary, ≤800 chars), and the output space is:

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
- **Gap standard error.** Each signal contributes a voice v_s = r_s · π(σ_s, d_s) ∈ [−1, 1] with variance σ_v². Under the homogeneity assumption (equal axis sizes n_i = n/6, equal signal variances), the standard error of the Gap is:
    SE(Gap) = σ_v · √(2/n),   CI₉₅ width ≈ 3.92 · σ_v · √(2/n)  (for n ≥ 30).
  Derivation: Var(AI_score) = (1/36) Σ_i Var(ℓ(a_i)) = (1/36) · 6 · σ_v²/(n/6) = σ_v²/n. Similarly for Human_score. With independence, Var(Gap) = 2 σ_v²/n, so SE(Gap) = σ_v · √(2/n).
  With the conservative bound σ_v ≤ 0.5 (for [0, 1]-valued signals), SE(Gap) ≤ √(1/(2n)) ≈ 0.707 / √n. Consequences:
    - n = 10:  SE(Gap) ≤ 0.22  (exceeds neutral-zone half-width 0.1 — interpretation unreliable)
    - n = 50:  SE(Gap) ≤ 0.10  (borderline)
    - n = 170: SE(Gap) ≤ 0.054 (acceptable; consistent with current week)

---

## 3. Why This Interests Mathematicians

### 3.1. Formalizing the Unformalizable

Singularity is a concept that has so far been defined **literarily** (Vinge, Good, Altman). We propose a **measurable structure**: 6 AI axes + 6 Human axes + 1 meta-axis (Geopolitics) with explicit thresholds, each **falsifiable**.

This is an attempt to turn **speculation into hypothesis**, and hypothesis into **observable quantity**.

### 3.2. AI ↔ Human Symmetry

The 13 axes form a **symmetric structure**: 6 parameters describing the **artificial** (AI), 6 describing the **human** (Humanity), plus **1 meta-layer** (`geopolitics`). The meta-layer is measured and published separately and does **NOT** enter AI_score or Human_score. The symmetry hypothesis remains: **AI development and Humanity's development are linked**, and the gap between them is the key variable.

### 3.3. Open Mathematical Problems

**Problem 1. Criterion for Genuine RSI.**

When is a system's self-modification **sustained improvement**, and when is it **saturation**? Related to computability theory (Kleene's recursion theorem, halting problem) and information theory (Kolmogorov complexity).

**Formalization:** let S be a self-improving system, S_t its state at time t. RSI is the process S_{t+1} = f(S_t), where f is the system itself (reflexivity). Sustainability means strict monotone improvement with a positive lower bound on the step size:

    ∃ ε > 0 : ∀t, Capability(S_{t+1}) − Capability(S_t) ≥ ε.

This requires Capability to be unbounded. If Capability is bounded (e.g., on [0, 1]), strict monotone improvement is still possible but the step size must vanish, and «sustained growth» is ill-defined. Question: under what conditions on f does the unbounded case hold?

**Problem 2. Phase Transition Detection.**

The MMD detector (Hexad) is a heuristic. A rigorous theory is needed: **how to distinguish a phase transition from noise** in a self-improving system?

**Formalization:** let X_t be the trajectory of SGD iterations. We compute MMD(X_t, N(0, I)) — distance to a Gaussian surrogate. Question: does there exist a threshold τ such that MMD > τ statistically significantly indicates that X_t departs from the Gaussian surrogate?

**Problem 3. Verification Without an Oracle.**

The verification hierarchy (formal verifiers → execution → LLM judges → self-assessment) is a **partial order**. When can the system **close the loop without a human**? This is a question about the **computational complexity of self-reference**.

**Formalization:** let V = {v₁, ..., v_n} be a hierarchy of verifiers, where v_i < v_j means "v_i is less reliable than v_j". The system can close the loop without a human if there exists v_i such that false_positive_rate(v_i) < 5% and v_i is autonomously applicable. Question: what is the minimum Kolmogorov complexity K(v_i) of such a verifier?

**Problem 4. Gap Index as a Dynamical System.**

G(t) is not a scalar but a trajectory. Can one find **invariants**? Do **attractors** exist? What happens as G → ±1?

**Formalization:** let G(t) = F(A(t), H(t)), where A(t) is the vector of AI levels, H(t) is the vector of Humanity levels. Question: are there conserved quantities along trajectories of G(t)? Are there attractors within [−1, 1]?

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

In 1957, **Sputnik** launched the space race. In 1969, **Apollo** landed humans on the Moon. In 2026, **frontier AI systems** are leaving sandboxes and solving problems that remained open for decades.

**But who observes this?** Corporations publish releases. States — declarations. Scientists — papers. **No one publishes a weekly report on what is happening to Humanity.**

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

## 6. First Autonomous Day and Bayesian Baseline

On **September 25, 2026**, the system ran **fully autonomously** for an entire day, with no manual intervention:

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

On **September 28, 2026**, the project transitioned to the **Bayesian formulation (v2.0)** as its canonical methodology. Earlier point-estimate protocols were removed from both the repository and the D1 database — they are not representative under the new approach. The first fully Bayesian protocol was generated by the Cloudflare Worker on the same day.

**Current Gap Index (Bayesian baseline — week 2026-09-28):**

    {
      "week_start": "2026-09-28",
      "week_end":   "2026-10-04",
      "ai_score":   0.62,
      "human_score": 0.50,
      "gap":        0.12,
      "method":     "bayesian",
      "gap_ci95":   [-0.261, 0.4935],
      "sample_size": 22,
      "items_count": 20,
      "shifts_count": 0,
      "interpretation": "AI ahead"
    }

The Gap sits inside the **moderate-asymmetry band** (0.1 < G ≤ 0.3). The 95% credible interval, however, extends into the neutral zone — indicating an early-phase, statistically fragile signal rather than a stable trend.

---

## 7. Protocol Synchronization Schedule

### 7.1. Generation vs Visibility

Protocols are generated into the **D1 database** and dispatched to the **git repository** (`data/protocols/`) by the Cloudflare Worker itself. Synchronization is **not** a separately scheduled job — immediately after generation (Mon/Fri 13:45 UTC), the Worker triggers two GitHub Actions workflows in parallel via the GitHub API (`workflow_dispatch`):

- `sync-protocols.yml` — copies protocol files to git
- `translate-protocols.yml` — regenerates RU/ZH in D1

This design removes dependence on GitHub's unreliable native scheduler.

### 7.2. Delay Table

| Protocol type | Dispatched (D1) | Visible (git) | Delay |
|---------------|-----------------|---------------|-------|
| **Interim** (Friday) | Fri ~13:53 UTC | Fri ~14:00 UTC | ~5–10 min |
| **Final** (Monday) | Mon ~13:53 UTC | Mon ~14:00 UTC | ~5–10 min |
| **RU/ZH translations** | Mon/Fri ~13:53 UTC | next sync cycle | up to ~3–4 days |

EN files appear in git within minutes of generation. RU/ZH translations are regenerated asynchronously and may lag by one sync cycle.

### 7.3. Translation Lag

English is the primary language. RU/ZH translations are regenerated asynchronously by `translate-protocols.yml`, running in parallel with `sync-protocols.yml`. As a result:

- **EN files** appear in git within ~5–10 minutes of generation.
- **RU/ZH files** may lag by one sync cycle: `sync` copies whichever translations are already in D1 at the moment it runs, and `translate` updates D1 in parallel.

This trade-off is intentional — keeping translation off the critical path avoids exceeding Cloudflare Free tier limits (subrequests, CPU time) on the Worker that generates protocols.

### 7.4. Sync Workflow

Defined in `.github/workflows/sync-protocols.yml` and dispatched by the Cloudflare Worker immediately after protocol generation:

    on:
      schedule:
        - cron: "0 14 * * 1"   # Monday 14:00 UTC — legacy schedule
        - cron: "0 8 * * 6"    # Saturday 08:00 UTC — legacy schedule
      workflow_dispatch:        # Primary trigger (from Worker)

The workflow:
1. Fetches latest 2 protocols from D1 API (`/export-weekly?weeks=2`).
2. Writes to `data/protocols/` in the collector repo.
3. Archives all protocols to the `human-ai-monitor-archive` repo.
4. Commits changes to both repos.

Translation is handled by a separate workflow `translate-protocols.yml`, also dispatched by the Worker in parallel. It calls `GET /translate/{week}` with a Bearer token to regenerate RU/ZH in D1, then verifies the result via `/protocols/{week}/content/ru` and `/zh`.

### 7.5. Emergency Sync (Troubleshooting)

Under normal operation, both workflows are dispatched automatically by the Worker. Manual triggering is only needed in extraordinary circumstances — if automatic dispatch fails or re-running is required after a partial failure:

    gh workflow run sync-protocols.yml
    gh workflow run translate-protocols.yml

These commands are not part of routine operation.

Full documentation: `docs/architecture.md` §6 "Protocol Synchronization".


## 8. What Has Been Done (v1.0.1)

| Component | Status |
|-----------|--------|
| Architecture | Cloudflare Workers + D1 + Workers AI (modular, 14 modules) |
| Classifier | Qwen 3 (open-weight) on Cloudflare Workers AI |
| Configuration | `wrangler.jsonc` with D1 binding, 5 cron batches |
| Infrastructure | D1 created (EEUR), 4 tables populated |
| Code | TypeScript, 20 API endpoints, 39 sources |
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
