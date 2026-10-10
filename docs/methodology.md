# Human–AI Monitor Methodology

**Version:** 1.0.2  
**Date:** September 29, 2026  
**Status:** working document, open for review  
**Language:** [🇷🇺 Русский](methodology.ru.md) | [🇨🇳 中文](methodology.zh.md)

---

## 1. Why Methodology Matters

The question "Is singularity arriving?" has been debated since 1993 — since Vernor Vinge's essay. Over thirty years, dozens of definitions have emerged, but **not a single measurable criterion**.

Tech leaders proclaim singularity. Alignment researchers admit there is no plan. Regulators offer voluntary measures. Scientists warn of misaligned goals.

**But no one publishes a weekly report with numbers.**

Human–AI Monitor proposes an **operationalized structure**: 13 axes (12+1) with explicit thresholds, each of which is **falsifiable**. We do not predict the future — we **record the present**.

---

## 2. Thirteen Axes (12+1)

The monitoring system has **two parallel groups of axes**: 6 describe the **artificial** (AI), 6 describe the **human** (Humanity). Both groups are monitored weekly.

### 2.1. AI Axes (RSI — Recursive Self-Improvement)

| Symbol | Name | What Is Measured | Threshold for Reassessment |
|--------|------|------------------|----------------------------|
| **SMD** | Self-Modification Depth | Depth of self-modification (L0–L4) | Reproducible L4 in 2+ independent systems |
| **ITQ** | Improvement Trajectory Quality | Slope, acceleration, plateau exit | Sustained transfer + Acceleration > 0 |
| **AGG** | Autonomous Goal Generation | Novelty, feasibility, quality of goals | Expert significance without external assignment |
| **Cycle Velocity** | Cycle Velocity | Time between generations of improvements | <2 months + completion rate >50% |
| **Verification** | Verification Hierarchy | Who verifies: formally / execution / LLM / self-assessment | False positive <5% without oversight |
| **Hexad** | Phase Transition Detection | MMD between SGD and Gaussian surrogate | Sustained exceedance in 2+ systems |

### 2.2. Humanity Axes (HHI — Human Horizon Index)

| Symbol | Name | What Is Measured | Alarm Threshold |
|--------|------|------------------|-----------------|
| **H1 Agency** | Human Agency | Ability to make decisions without delegating to AI | Sustained decline in key domains |
| **H2 Sovereignty** | Cognitive Sovereignty | Critical thinking, independence of judgment | Growing share unable to distinguish AI content |
| **H3 Wellbeing** | Wellbeing & Mental Health | Mental health, loneliness, anxiety | Rising anxiety and loneliness among youth |
| **H4 Equity** | Equity & Access | Distribution of AI benefits, digital inequality | Growing compute divide |
| **H5 Meaning** | Meaning & Purpose | Meaning in life, job satisfaction | Decline in share finding meaning in work |
| **H6 Democracy** | Democratic Resilience | Trust in institutions, resilience to disinformation | Sustained decline in trust |

---


### 2.3. Geopolitical Axis (Geopolitics)

An axis outside the 6+6 structure, describing global AI development dynamics:

| Parameter | Description |
|:---|:---|
| **Keywords** | WAICO, export controls, AI race, sovereign AI, open weights, compute divide, frontier AI |
| **Actors** | Western cartel (Anthropic, OpenAI, Google, xAI) · WAICO · Open market |
| **Revision threshold** | Institutional entrenchment of one bloc as dominant |

## 3. Gap Index (Bayesian formulation)

### 3.1. Formula

$$
G = \frac{1}{6}\sum_{j=1}^{6} h_j - \frac{1}{6}\sum_{i=1}^{6} a_i
$$

where:
- $a_i \in [0, 1]$ — level of the i-th AI axis;
- $h_j \in [0, 1]$ — level of the j-th Humanity axis.

Sign convention: **$G > 0$ — Humanity accelerating faster; $G < 0$ — AI accelerating faster.**

Each axis level is a **random variable** with a posterior Beta distribution (§3.2). Two aggregation modes are supported:

- **Baseline (equal weights):** $\text{AI\_score} = \frac{1}{6}\sum_{i=1}^{6} \ell(a_i)$ — the simple arithmetic mean, invariant under permutation of axes within a group.
- **Production (expert weights):** $\text{AI\_score} = \sum_{i=1}^{6} w_i^{AI} \cdot \ell(a_i)$ with $\sum_i w_i^{AI} = 1$. See §3.2 for the weight table and §6 for the rationale.

The choice of mode is documented; results are reproducible either way.

### 3.2. Aggregation and Uncertainty

Axis levels are estimated as posterior distributions. For each axis $a$, the level is modeled as:

$$
\ell(a) \mid S_a \sim \mathrm{Beta}\left(\alpha_0 + \sum_{s \in S_a} v_s^{+},\ \beta_0 + \sum_{s \in S_a} v_s^{-}\right)
$$

with a non-informative **Jeffreys prior** ($\alpha_0 = \beta_0 = 1/2$). Each signal contributes a voice $v_s = r_s \cdot \pi(\sigma_s, d_s)$, split into positive and negative parts.

In the baseline case (equal weights), aggregation is a **simple arithmetic mean** within each group:

$$
\text{AI\_score} = \frac{1}{6}\sum_{i=1}^{6} \ell(a_i), \qquad
\text{Human\_score} = \frac{1}{6}\sum_{j=1}^{6} \ell(h_j)
$$

The geopolitical axis $g$ is measured and published in `index_history`, but is **not included** in either $\text{AI\_score}$ or $\text{Human\_score}$.

The **Gap distribution** $G = \text{Human\_score} - \text{AI\_score}$ is constructed by Monte Carlo ($M = 10{,}000$ samples), yielding a mean and a 95% credible interval. Full mathematical treatment: [`docs/bayesian_framework.md`](bayesian_framework.md).


**Bayesian implementation.** In the production code (`src/services/bayesian-gap.ts`),
each axis level $a_i$ and $h_j$ is modeled as a **Beta posterior distribution**
$\text{Beta}(\alpha, \beta)$ with Jeffreys prior $(\alpha_0, \beta_0) = (0.5, 0.5)$.
In the production implementation, axis weights are applied and the sum is computed via **Monte Carlo sampling** (M = 10,000 draws):

$$
AI\_score^{(k)} = \sum_{i=1}^{6} w_i^{AI} \cdot s_i^{(k)}, \quad
G^{(k)} = Human\_score^{(k)} - AI\_score^{(k)}, \quad k = 1, \dots, M
$$

where $s_i^{(k)} \sim \text{Beta}(\alpha_i, \beta_i)$. The final Gap Index is the
posterior mean of $G^{(k)}$ with a 95% credible interval. This provides a
statistically rigorous quantification of uncertainty.

**Expert weights (production).** Axis weights are expert estimates, not derived from labeled data:

| AI axis | Weight | Rationale |
|---------|--------|-----------|
| SMD | 0.20 | Self-modification depth — core RSI signal |
| ITQ | 0.15 | Improvement trajectory quality |
| AGG | 0.15 | Autonomous goal generation |
| Cycle Velocity | 0.20 | Rate of improvement cycles |
| Verification | 0.20 | Verification hierarchy |
| Hexad | 0.10 | Phase transition detection |

| Humanity axis | Weight | Rationale |
|---------------|--------|-----------|
| H1 Agency | 0.20 | Human agency |
| H2 Sovereignty | 0.15 | Cognitive sovereignty |
| H3 Wellbeing | 0.20 | Wellbeing & mental health |
| H4 Equity | 0.15 | Equity & access |
| H5 Meaning | 0.15 | Meaning & purpose |
| H6 Democracy | 0.15 | Democratic resilience |

$\sum_i w_i^{AI} = \sum_j w_j^{H} = 1.0$. Weights are open for calibration; see §6 for limitations.

### 3.3. Interpretation

The Gap $G$ is reported with a **single label** derived from its 95% credible
interval:

| CI95 of $G$ | Label |
|---------|-------|
| Strictly above 0 | Humanity is ahead |
| Strictly below 0 | AI is ahead |
| Contains 0 | Inconclusive |

The label reports only whether the sign of $G$ is resolved by the current
sample. **Magnitude is not encoded in the label** — it is carried by the
numeric `gap` field and its CI95. A small |G| with a narrow CI95 can therefore
be labeled "AI is ahead"; a larger |G| with a wide CI95 is "Inconclusive".

**Worked example — 2026-10-05.**

| Field | Value | Reading |
|-------|-------|---------|
| `gap` | −0.31 | Point estimate (magnitude) |
| `gap_ci95` | [−0.61, +0.01] | 95% credible interval |
| `interpretation` | `Inconclusive` | CI95 contains zero — direction not resolved |

The magnitude (|G| = 0.31) is visible; the direction is not asserted. Both
facts are reported separately.

**On the numeric field `statistically_significant`.** The API also exposes a
boolean `statistically_significant` (1 when CI95 strictly excludes zero). It
is derived from the same condition as the label and is retained for
machine-readable analyses and backward compatibility. It is not shown in
README or protocol markdown; the label carries that information for human
readers.

**Note on source correlation.** The real CI95 may be ≈ 1.2–1.4× wider than
nominal, because items from the same source are not independent evidence
(see `HANDOFF.md §14.2.1`). This is already reflected in the label decision:
wider intervals are more likely to yield `Inconclusive`.


### 3.4. Dynamics $G(t)$

The Gap Index is **not a scalar** but a **trajectory**. We record it weekly and analyze:
- **Trend:** rising / falling / stable.
- **Acceleration:** second derivative.
- **Attractors:** where the system is heading.

**Key hypothesis:** sustained negative trend of $G$ — that is, AI levels rising faster than Humanity levels, with no threshold shifts on AI axes — is **not singularity**, but **divergence**. It is the main risk.

Each weekly value carries a 95% credible interval, which makes the trend statistically interpretable even at small weekly sample sizes.

### 3.5. Implementation status

This document describes the project's **canonical Bayesian methodology**. The implementation in `src/services/gap-computation.ts` follows this formulation. See `migrations/0011_bayesian_gap.sql` for the extended `gap_history` schema. Detailed mathematical treatment: [`docs/bayesian_framework.md`](bayesian_framework.md).

---

## 4. Monitoring Procedure

### 4.1. Weekly Cycle

1. **Data collection** (daily, 5 batches at 13:00, 13:15, 13:30, 13:45, 23:00 UTC):
   - RSS feeds (arXiv, labs, analytics).
   - News sources (AP, Reuters, BBC).
   - Global indices (quarterly).

2. **Classification** (LLM):
   - Each item is classified along 13 axes (12+1).
   - Model: Cloudflare Workers AI (`@cf/qwen/qwen3-30b-a3b-fp8`).
   - Prompts: open, in `prompts/`.

3. **Deduplication** (D1):
   - Duplicate removal by hash.
   - Storage of all items with dates.

4. **Protocol generation** (Markdown):
   - Sections for 13 axes (12+1) + Gap Index.
   - Threshold shift markers (yes/no/uncertain).
   - Links to primary sources.

5. **Publication**:
   - `data/protocols/YYYY-MM-DD.md` — in Git.
   - API endpoint — for researchers.

### 4.2. Criteria for Including a Signal

A signal is included in the protocol if:
- **Relevance** ≥ 0.4 (LLM score).
- **Source** is verifiable (primary source, peer-reviewed publication, official statement).
- **Date** is within the week.

### 4.3. Threshold Shift Assessment

| Value | Meaning |
|-------|---------|
| **yes** | Threshold clearly reached (reproducible, confirmed) |
| **no** | Threshold not reached |
| **uncertain** | Insufficient data / claim without empirics |

---

## 5. Principles

### 5.1. Transparency

All prompts, sources, and formulas are **open**. Anyone can reproduce the protocol.

### 5.2. Reproducibility

Every protocol links to:
- **Hashes** of source data.
- **Version** of the classifier.
- **Date** of generation.

### 5.3. Falsifiability

Every threshold is a **verifiable claim**. If it is reached — the forecast is revised.

### 5.4. Independence

The project is **not affiliated** with any lab, state, or political organization. Open-weight models — no external APIs.

### 5.5. Free Forever

MIT License. Use, fork, improve — **free**.

---

## 6. Limitations

1. **Dependence on public sources.** Internal data of companies (reasoning chains, metrics) — unavailable.

2. **Interpretive uncertainty.** Distinguishing genuine autonomy from sophisticated imitation is a matter of debate.

3. **Sample limitation.** Analysis covers verified cases; others may exist outside the public field.

4. **Signal independence.** Within an axis, items are assumed independent, though a single source may produce correlated items (a series of news items about one event). This may inflate confidence at small weekly sample sizes.

5. **LLM classification.** The model may err. All results are open for verification.

6. **Expert weights.** Axis weights in §3.2 are expert estimates, not derived from labeled data or theoretical first principles. Alternative weightings are possible. Changing weights affects the magnitudes of $\text{AI\_score}$ and $\text{Human\_score}$, but not their qualitative interpretation (§3.3), which remains stable as long as the sign of $G$ is unchanged.

7. **Construct validity.** AI axes reflect news about AI benchmarks (extraction); Humanity axes reflect news discourse about human development (interpretation). Both are classified by the same pipeline, but describe different types of evidence. Direct comparability of scales is **not** assumed.

---

## 7. Directions for Methodology Development

- [ ] **Formal criteria** for distinguishing instrumental autonomy, functional self-improvement, and genuine self-creation.
- [ ] **Empirical verification** of full introspection in LLMs.
- [ ] **Long-term dynamics** of RSI cycles: saturation vs. acceleration.
- [ ] **Integration with global indices** (V-Dem, WHR, Pew) — automation.
- [ ] **Independent methodology audit** — inviting mathematicians and philosophers.
- [x] **Multilingual support** — EN / RU / ZH.
- [x] **Bayesian methodology documentation** — canonical formulation (see [`docs/bayesian_framework.md`](bayesian_framework.md)).
- [x] **Code migration to Bayesian model** — `gap-computation.ts` implements the Beta posterior + Monte Carlo framework.
- [ ] **Public API** — for researchers and journalists.

---

## 8. Invitation

If you are a mathematician, philosopher, sociologist, or AI researcher — we invite you to collaborate.

**The project is open. The code is open. The data is open.**

**Together — We Are Strong. The road will be mastered by the one who walks it.**

---

**Contact:**  
GitHub Issues: https://github.com/VQQLK/Human-AI-Monitor/issues
