# Human–AI Monitor: Canonical Bayesian Methodology

**Document version:** v2.0  
**Date:** September 28, 2026  
**Purpose:** systematic statement of the canonical Bayesian methodology (v2.0) currently in production, with a historical outline of the previous point-estimate approach (v1.0.1) it replaced  
**Status:** canonical reference. Open for review.  
**Language:** [🇷🇺 Русский](bayesian_framework.ru.md) | [🇨🇳 中文](bayesian_framework.zh.md)

---

## 1. Introduction

### 1.1 Project

Human–AI Monitor is an open monitoring system that simultaneously tracks the development of artificial intelligence and the state of Humanity and publishes weekly protocols. Its primary product is the **Gap Index**, a quantitative measure of divergence between the level of AI and the level of Humanity.

### 1.2 Measurement Structure

The system operates with **13 axes**:

- **A = {a₁, …, a₆}** — six AI axes (RSI — Recursive Self-Improvement): `SMD` (Self-Modification Depth), `ITQ` (Improvement Trajectory Quality), `AGG` (Autonomous Goal Generation), `Cycle Velocity`, `Verification`, `Hexad`.
- **H = {h₁, …, h₆}** — six Humanity axes (HHI — Human Horizon Index): `H1 Agency`, `H2 Sovereignty`, `H3 Wellbeing`, `H4 Equity`, `H5 Meaning`, `H6 Democracy`.
- **G = {g}** — one geopolitical meta-axis: measured and published, but **not included** in either `AI_score` or `Human_score`.

Structure formula: `13 = 6 + 6 + 1`.

### 1.3 Symmetry Hypothesis

The central hypothesis of the project: **the development of AI and the development of Humanity are linked**, and the gap between them is the key observable variable. The 6↔6 symmetry is not accidental — it reflects the hypothesis that the six RSI axes and the six HHI axes describe measurements of comparable significance.

**Mathematical consequence.** If the symmetry hypothesis is accepted as a postulate, the aggregation function within each group must be **invariant under axis permutation**. Otherwise symmetry is violated at the level of the formula rather than at the level of the theory. This restricts the class of admissible aggregators.

### 1.4 Gap Index

Gap Index `G(t)`:

```
G(t) = AI_score(t) − Human_score(t)
```

where `AI_score` is the aggregated estimate of the AI level, and `Human_score` is the aggregated estimate of the Humanity level.

### 1.5 Data Source

Weekly collection from ~40 RSS sources. Each item is classified by a language model (Qwen 3, `@cf/qwen/qwen3-30b-a3b-fp8`) and receives:

- `r_s ∈ [0, 1]` — relevance (classifier confidence),
- `σ_s ∈ {yes, no, uncertain}` — threshold shift flag,
- `d_s ∈ {up, down, stable, uncertain}` — trend direction,
- `A_s ⊆ (A ∪ H ∪ G)`, `1 ≤ |A_s| ≤ 3` — the set of axes to which the item is assigned.

Over a week, `|S| ≈ 100–200` items accumulate, distributed across axes. The set of items assigned to axis `a` is denoted `S_a`.

---

## 2. Previous Point-Estimate Methodology (v1.0.1)

This was the operative version before 28 September 2026. It is preserved here for historical context; the code in `src/services/gap-computation.ts` has been rewritten to the Bayesian model (§3).

### 2.1 Axis Level

The axis level is computed by the multiplicative formula:

```
ℓ(a) = clamp_[0,1] ( (1/|S_a|) · Σ_{s ∈ S_a} r_s · M_shift(σ_s) · M_dir(d_s) )
```

where `clamp_[0,1](x) = max(0, min(1, x))` is the projection onto the interval.

**Shift multiplier** `M_shift`:

| `σ_s` | `M_shift(σ_s)` |
|---|---|
| yes | 1.5 |
| uncertain | 1.0 |
| no | 0.5 |

**Direction multiplier** `M_dir`:

| `d_s` | `M_dir(d_s)` |
|---|---|
| up | 1.2 |
| stable | 1.0 |
| uncertain | 1.0 |
| down | 0.8 |

For `|S_a| = 0` (no items), it is assumed that `ℓ(a) = 0`.

### 2.2 Aggregation

The code uses the **simple arithmetic mean** within each group:

```
AI_score    = (1/6) · Σ_{i=1}^{6} ℓ(a_i)
Human_score = (1/6) · Σ_{j=1}^{6} ℓ(h_j)
```

The geopolitical axis `g`: `ℓ(g)` is computed and published in `index_history`, but is not included in either `AI_score` or `Human_score`.

### 2.4 Interpretation Thresholds

| Range of `G` | Interpretation |
|---|---|
| `G > 0.3` | AI significantly ahead |
| `0.1 < G ≤ 0.3` | AI ahead |
| `−0.1 ≤ G ≤ 0.1` | Symmetric development (norm) |
| `−0.3 ≤ G < −0.1` | Humanity ahead |
| `G < −0.3` | Humanity significantly ahead |

### 2.5 Limitations of the Current Approach

**Limitation 1. Arbitrary parameters.**
The values `M_shift ∈ {1.5, 1.0, 0.5}` and `M_dir ∈ {1.2, 1.0, 0.8}` are not derived from theory or from calibration on labeled data. This is a set of expert numbers without a documented protocol for obtaining them. As a consequence, the metric is not reproducible: the reader cannot verify why exactly 1.5 and not 1.3.

**Limitation 2. Inconsistency between document and code.**
At the time, code and documentation disagreed: the code used a simple mean, while `methodology.md` (v1.0.1) described a weighted formula. This inconsistency was one of the reasons for the migration to the Bayesian model (§3).

**Limitation 3. Multiplicativity on a bounded interval.**
For `r_s = 1`, `σ_s = yes`, `d_s = up` we get `1 · 1.5 · 1.2 = 1.8`. Before `clamp` is applied, the value exceeds `[0, 1]` by a factor of 1.8. The `clamp` operation becomes dominant over aggregation: the nonlinearity at the boundaries erases the difference between items with high relevance.

**Limitation 4. Asymmetry of effect strength.**
Shift range: `1.5 / 0.5 = 3×`. Direction range: `1.2 / 0.8 = 1.5×`. Why shift affects twice as strongly as direction — not justified.

**Limitation 5. Point estimate without uncertainty.**
The formula returns a single number without an interval. For `|S_a| < 10` (as in the week of September 14–20, 2026: 6 items in the protocol), the standard error of the mean exceeds the width of the neutral zone `[−0.1, 0.1]`, and the interpretation becomes indistinguishable from noise. The metric does not reflect this.

**Limitation 6. Inconsistency with the symmetry hypothesis.**
The hypothesis in §1.3 requires invariance under axis permutation within each group. The weighted-sum formula (§2.3) violates this: the weights `0.20` and `0.15` fix preferences between axes without justification. The simple mean (§2.2) is invariant, but is applied in the code without explicit theoretical motivation.

---

## 3. Bayesian Methodology (v2.0)

The Bayesian model is now the project's canonical formulation (see `methodology.md` §3). It replaces the earlier point-estimate heuristic. The axis level becomes a latent quantity with a posterior distribution; the Gap becomes a distribution, not a scalar.

### 3.1 Problem Statement

For each axis `a ∈ A ∪ H ∪ G` it is required to:

1. Estimate the level `ℓ(a) ∈ [0, 1]` with a full uncertainty distribution.
2. Construct `AI_score`, `Human_score`, `Gap` as distributions.
3. Provide natural updating when new items arrive.

### 3.2 Bayesian Model for One Axis

**Prior distribution.** The axis level `ℓ(a)` is a latent quantity on `[0, 1]`. We use a conjugate prior distribution:

```
ℓ(a) ~ Beta(α₀, β₀)
```

The choice `α₀ = β₀ = 1/2` is the **Jeffreys prior** (Jeffreys 1946), non-informative and invariant under reparameterization. The prior mean `E[ℓ] = 0.5` is a neutral estimate in the absence of data.

**Signal voice.** Each signal `s ∈ S_a` contributes a "voice" `v_s ∈ [−1, 1]`:

```
v_s = r_s · π(σ_s, d_s)
```

where `π` is the deterministic direction table (§3.4).

We split the voice into positive and negative parts:

```
v_s⁺ = max(0, v_s)
v_s⁻ = max(0, −v_s)
```

**Posterior distribution.** Thanks to the conjugacy of the Beta likelihood with the Beta prior:

```
ℓ(a) | S_a ~ Beta( α₀ + Σ_{s ∈ S_a} v_s⁺ ,  β₀ + Σ_{s ∈ S_a} v_s⁻ )
```

**Point estimate:**

```
ℓ̂(a) = ( α₀ + Σ v_s⁺ ) / ( α₀ + β₀ + Σ v_s⁺ + Σ v_s⁻ )
```

**Variance:**

```
Var[ℓ(a) | S_a] = α·β / ( (α+β)² · (α+β+1) )
```

where `α = α₀ + Σ v_s⁺`, `β = β₀ + Σ v_s⁻`.

**95% credible interval** `[q₀.₀₂₅, q₀.₉₇₅]` — quantiles of the Beta distribution.

### 3.3 Aggregation and Gap Index

**AI_score and Human_score.** By the symmetry hypothesis (§1.3) both groups are equivalent, therefore aggregation is a **simple mean**:

```
AI_score    = (1/6) · Σ_{i=1}^{6} ℓ(a_i)
Human_score = (1/6) · Σ_{j=1}^{6} ℓ(h_j)
```

This is the only aggregation that is invariant under axis permutation.

**Important property:** if `ℓ(aᵢ) ~ Beta(αᵢ, βᵢ)` are independent, then `AI_score` **is not distributed as Beta** — it is a sum of Beta-distributed variables for which no closed-form density exists. This is not a defect of the model but its honesty: aggregation really does change the shape of the distribution.

**Gap:**

```
Gap = AI_score − Human_score
```

**Constructing the Gap distribution by Monte Carlo** (Robert & Casella 2004, ch. 3):

1. Sample `M = 10 000` times:
   - `ℓ^(k)(aᵢ) ~ Beta(αᵢ, βᵢ)` for `i = 1..6`
   - `ℓ^(k)(hⱼ) ~ Beta(αⱼ, βⱼ)` for `j = 1..6`
2. Compute `Gap^(k) = AI^(k) − Human^(k)`.
3. Estimates:
   - `Ĝap = mean(Gap^(k))`
   - `CI₉₅ = [q₀.₀₂₅, q₀.₉₇₅]({Gap^(k)})`
   - `Var(Gap) = var({Gap^(k)})`

The choice `M = 10 000` gives a Monte Carlo error of ~`1/√M ≈ 0.01` for the mean and ~0.005 for the quantiles — below the significant precision of publication (2 digits).

### 3.4 Direction Table π

The table `π(σ, d) ∈ [−1, 1]`:

| π | up | stable | down | uncertain |
|---|---|---|---|---|
| **yes** | +1.0 | +0.5 | −1.0 | +0.5 |
| **no** | +0.3 | 0.0 | −0.3 | 0.0 |
| **uncertain** | 0.0 | 0.0 | 0.0 | 0.0 |

**Justification of the values:**

- `(yes, up) = +1.0` — full evidence of growth: the shift is confirmed and the direction is positive.
- `(yes, down) = −1.0` — full evidence of decline: the shift is confirmed and the direction is negative.
- `(yes, stable) = +0.5` — shift present, direction undefined; half in favor of growth (conservative).
- `(no, up/down) = ±0.3` — no shift, but a trend exists; weak evidence (30% of full).
- `(no, stable) = 0.0` — nothing is happening.
- `(uncertain, *) = 0.0` — under uncertainty the signal does not vote (the "do no harm" principle).

The scale `{1.0, 0.5, 0.3, 0.0}` is expert-based and open to calibration. Unlike the v1 multipliers, it is:

- **additive** (does not scale `r_s` but adds a voice),
- **symmetric** (`π(yes, up) = −π(yes, down)`),
- **bounded** (does not go beyond `[−1, 1]`),
- **interpretable** as a fraction of full evidence.

### 3.5 Properties of the Bayesian Model

**Property 1. Correct uncertainty quantification.**
The credible interval `CI₉₅` is constructed from the posterior distribution (Rubin 1984). For small samples, the interval widens automatically, making the interpretation honest.

**Property 2. Consistency with the symmetry hypothesis.**
For `αᵢ = αⱼ` and equal numbers of signals, the distributions of the AI and Human axis levels are symmetric under permutation. No axis is singled out.

**Property 3. Natural updating.**
The posterior of the current week becomes the prior of the next (sequential Bayesian updating). No recomputation of the entire history is required.

**Property 4. Robustness to small samples.**
For `|S_a| = 0` the posterior = prior = `Beta(0.5, 0.5)`, mean 0.5, wide interval. Correct behavior instead of a false zero.

**Property 5. Falsifiability.**
The Gap as a distribution admits a statistical test of the hypothesis "the Gap is significantly different from zero": `P(Gap > 0 | data) > 0.95` — a Bayesian analogue of a one-sided test (Kruschke 2013).

### 3.6 Limitations of the Bayesian Model

**Limitation 1. Independence of signals.** The model assumes independence of signals within an axis. In reality, a single source may produce correlated signals (a series of news items about one event), which inflates confidence. Workaround — random effects per source (in v2.1).

**Limitation 2. Expert nature of π.** The table `π` is an expert scale. Formal calibration requires labeled data, which is not yet available. v2.0 publishes sensitivity to changes in `π`.

**Limitation 3. Stationarity.** The model does not account for trends over long horizons: the posterior of one week does not "remember" the previous one. For long-term analysis, a state-space model (Kalman filter / hierarchical Bayes) will be required.

### 3.7 Inference Procedure

**Input:** signals for the week, grouped by axis.

**Algorithm:**

```
for each axis a ∈ A ∪ H ∪ G:
    α ← 0.5
    β ← 0.5
    for each signal s ∈ S_a:
        v ← r_s · π(σ_s, d_s)
        if v > 0: α ← α + v
        else:     β ← β + (−v)
    posterior[a] ← Beta(α, β)

for each sample k = 1..10000:
    AI_k    ← (1/6) Σ_{i=1..6} Sample(posterior[a_i])
    Human_k ← (1/6) Σ_{j=1..6} Sample(posterior[h_j])
    Gap_k   ← AI_k − Human_k

Gap_mean ← mean({Gap_k})
Gap_CI95 ← [q₀.₀₂₅, q₀.₉₇₅]({Gap_k})
```

**Complexity:** `O(|S| + 12·M)`. On Cloudflare Workers with `M = 10 000` — about 50 ms.

**API response `/gap` in the Bayesian version:**

```json
{
  "week_start": "2026-09-21",
  "ai_score": 0.55,
  "ai_score_ci95": [0.51, 0.59],
  "human_score": 0.53,
  "human_score_ci95": [0.49, 0.57],
  "gap_mean": 0.02,
  "gap_ci95": [-0.05, 0.09],
  "gap_std": 0.04,
  "sample_size": 189,
  "statistically_significant": false,
  "interpretation": "Symmetric development"
}
```

The value, the uncertainty, and the significance flag are published — the three components of a scientifically correct metric.

### 3.8 Interpretation Thresholds in the Bayesian Model

The thresholds `±0.1` and `±0.3` are preserved as a **practical scale**, but with two additions:

1. If `CI₉₅` lies entirely within one interval — the interpretation is stable.
2. If `CI₉₅` crosses the boundary between intervals — the interpretation is marked as unstable.

This addition does not change the scale but makes its application statistically correct.

### 3.9 Correspondence with Project Principles

The Bayesian model corresponds to the five principles stated in `methodology.md` (section 5):

- **Transparency.** All model parameters (`α₀`, `β₀`, the table `π`) are published; the Monte Carlo procedure is reproducible.
- **Reproducibility.** With identical input data and the same seed, the result is bit-for-bit identical. The Monte Carlo estimate itself carries a statistical error of ~`1/√M` relative to the true posterior. In production, the seed is `FNV-1a(week_start)` (see `src/services/bayesian-gap.ts:seedFromString`) — re-running any given week yields exactly the same numbers.
- **Falsifiability.** Every statement about the Gap has an explicit statistical meaning through `CI₉₅` and `P(Gap > 0 | data)`.
- **Independence.** The model relies on an open-weight LLM and open data; the probabilistic apparatus is standard.
- **Free forever.** Monte Carlo at `M = 10 000` fits within the free tier of Cloudflare Workers.

---

## 4. Historical Transition: v1.0.1 → v2.0

| Criterion | Previous v1.0.1 (point estimates) | Canonical v2.0 (Bayesian) |
|---|---|---|
| Axis level | Multiplicative heuristic | Posterior Beta |
| Parameters | 4 unjustified numbers | 2 non-informative priors |
| Aggregation | Simple mean (code) or weights (doc) | Simple mean |
| Gap | Scalar | Distribution |
| Uncertainty | Hidden | Explicit (`CI₉₅`) |
| Small samples | Falsely confident number | Honestly wide interval |
| Updating | Full recomputation | Sequential (posterior → prior) |
| Consistency with §1.3 | Violated by weights | Preserved |
| Falsifiability | Weak | Strong |
| Clamp artifacts | Present | None |

**Conclusion.** The Bayesian model is not "better" than the heuristic in terms of accuracy — both give a point estimate. The Bayesian one is **more honest**: it publishes uncertainty instead of hiding it in parameters, and is consistent with the symmetry hypothesis mathematically rather than declaratively.

---

## 5. References

- Gelman A., Carlin J., Stern H., Dunson D., Vehtari A., Rubin D. (2013). *Bayesian Data Analysis*, 3rd ed. CRC Press.
- Jeffreys H. (1946). An invariant form for the prior probability in estimation problems. *Proc. Royal Soc. A*, 186(1007), 453–461.
- Kass R., Wasserman L. (1996). The selection of prior distributions by formal rules. *JASA*, 91(435), 1343–1370.
- Kruschke J. (2013). Bayesian estimation supersedes the t test. *J. Exp. Psychol. Gen.*, 142(2), 573–603.
- OECD/JRC (2008). *Handbook on Constructing Composite Indicators*. OECD Publishing.
- Robert C., Casella G. (2004). *Monte Carlo Statistical Methods*, 2nd ed. Springer.
- Rubin D. (1984). Bayesianly justifiable and relevant frequency calculations for the applied statistician. *Ann. Stat.*, 12(4), 1151–1172.

---

**End of document.**
