# Human–AI Monitor Methodology

**Version:** 1.0.1  
**Date:** September 27, 2026  
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

The monitoring system is built on a **symmetric structure**: 6 axes describe the **artificial** (AI), 6 describe the **human** (Humanity). The symmetry is not accidental — it reflects a hypothesis: **AI development and Humanity's development are linked**, and the gap between them is the key variable.

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

An axis outside the symmetric 6+6 structure, describing global AI development dynamics:

| Parameter | Description |
|:---|:---|
| **Keywords** | WAICO, export controls, AI race, sovereign AI, open weights, compute divide, frontier AI |
| **Actors** | Western cartel (Anthropic, OpenAI, Google, xAI) · WAICO · Open market |
| **Revision threshold** | Institutional entrenchment of one bloc as dominant |

## 3. Gap Index

### 3.1. Formula

The Gap Index is the **key metric** of the project. It measures the **gap** between AI development and the state of Humanity:

$$
G = \frac{1}{6}\sum_{i=1}^{6} a_i - \frac{1}{6}\sum_{j=1}^{6} h_j
$$

where:
- $a_i \in [0, 1]$ — level of the i-th AI axis;
- $h_j \in [0, 1]$ — level of the j-th Humanity axis.

By the **symmetry hypothesis** (§2), both groups are equivalent — 6 AI axes and 6 Humanity axes describe measurements of comparable significance. Therefore aggregation is a **simple arithmetic mean**: it is the only function invariant under permutation of axes within a group.

### 3.2. Aggregation

Aggregation is a **simple arithmetic mean** within each group:

$$
\text{AI\_score} = \frac{1}{6}\sum_{i=1}^{6} \ell(a_i), \qquad
\text{Human\_score} = \frac{1}{6}\sum_{j=1}^{6} \ell(h_j)
$$

The geopolitical axis $g$ is measured and published in `index_history`, but is **not included** in either $\text{AI\_score}$ or $\text{Human\_score}$.

This formulation matches the current implementation in `src/services/gap-computation.ts`.

**Evolution to Bayesian inference.** A Bayesian reformulation — with posterior distributions on each axis level and 95% credible intervals for the Gap — is described in [`docs/bayesian_framework.md`](bayesian_framework.md). It preserves the same simple-mean aggregation and the same axis structure, replacing point estimates with distributions.

### 3.3. Interpretation

| Value of $G$ | Interpretation |
|--------------|----------------|
| $G > 0.3$ | **Critical asymmetry:** AI significantly ahead |
| $0.1 < G \leq 0.3$ | **Moderate asymmetry:** AI ahead |
| $\|G\| \leq 0.1$ | Symmetric development (norm) |
| $-0.3 \leq G < -0.1$ | Moderate asymmetry in favor of Humanity |
| $G < -0.3$ | **Anomaly:** Humanity significantly ahead |

### 3.4. Dynamics $G(t)$

The Gap Index is **not a scalar** but a **trajectory**. We record it weekly and analyze:
- **Trend:** rising / falling / stable.
- **Acceleration:** second derivative.
- **Attractors:** where the system is heading.

**Key hypothesis:** sustained growth of $G$ with no threshold shifts on AI axes is **not singularity**, but **divergence**. It is the main risk.

The Bayesian reformulation ([`docs/bayesian_framework.md`](bayesian_framework.md)) adds a 95% credible interval to each weekly value, which makes the trend statistically interpretable even at small weekly sample sizes.

---

## 4. Monitoring Procedure

### 4.1. Weekly Cycle

1. **Data collection** (Monday, 06:00 UTC):
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

---

## 7. Directions for Methodology Development

- [ ] **Formal criteria** for distinguishing instrumental autonomy, functional self-improvement, and genuine self-creation.
- [ ] **Empirical verification** of full introspection in LLMs.
- [ ] **Long-term dynamics** of RSI cycles: saturation vs. acceleration.
- [ ] **Integration with global indices** (V-Dem, WHR, Pew) — automation.
- [ ] **Independent methodology audit** — inviting mathematicians and philosophers.
- [x] **Multilingual support** — EN / RU / ZH.
- [ ] **Bayesian inference** — posterior distributions on axis levels + 95% credible intervals for the Gap (see [`docs/bayesian_framework.md`](bayesian_framework.md)).
- [ ] **Public API** — for researchers and journalists.

---

## 8. Invitation

If you are a mathematician, philosopher, sociologist, or AI researcher — we invite you to collaborate.

**The project is open. The code is open. The data is open.**

**Together — We Are Strong. The road will be mastered by the one who walks it.**

---

**Contact:**  
GitHub Issues: https://github.com/VQQLK/Human-AI-Monitor/issues
