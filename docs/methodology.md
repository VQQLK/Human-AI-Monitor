# Human–AI Monitor Methodology

**Version:** 0.1.0  
**Date:** September 17, 2026  
**Status:** working document, open for review  
**Language:** [🇷🇺 Русский](methodology.ru.md)

---

## 1. Why Methodology Matters

The question "Is singularity arriving?" has been debated since 1993 — since Vernor Vinge's essay. Over thirty years, dozens of definitions have emerged, but **not a single measurable criterion**.

Tech leaders proclaim singularity. Alignment researchers admit there is no plan. Regulators offer voluntary measures. Scientists warn of misaligned goals.

**But no one publishes a weekly report with numbers.**

Human–AI Monitor proposes an **operationalized structure**: 12 axes with explicit thresholds, each of which is **falsifiable**. We do not predict the future — we **record the present**.

---

## 2. Twelve Axes

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

## 3. Gap Index

### 3.1. Formula

The Gap Index is the **key metric** of the project. It measures the **gap** between AI development and the state of Humanity:

$$
G = \sum_{i=1}^{6} w_i^{AI} \cdot a_i - \sum_{j=1}^{6} w_j^{H} \cdot h_j
$$

where:
- $a_i \in [0, 1]$ — level of the i-th AI axis;
- $h_j \in [0, 1]$ — level of the j-th Humanity axis;
- $w_i^{AI}, w_j^H$ — weights (normalized, $\sum w = 1$).

### 3.2. Weights (current version)

**AI axes:**
- SMD: 0.20
- ITQ: 0.15
- AGG: 0.15
- Cycle Velocity: 0.20
- Verification: 0.20
- Hexad: 0.10

**Humanity axes:**
- H1 Agency: 0.20
- H2 Sovereignty: 0.15
- H3 Wellbeing: 0.20
- H4 Equity: 0.15
- H5 Meaning: 0.15
- H6 Democracy: 0.15

### 3.3. Interpretation

| Value of $G$ | Interpretation |
|--------------|----------------|
| $G > 0.2$ | **Critical asymmetry:** AI ahead of Humanity |
| $0.1 < G \leq 0.2$ | **Moderate asymmetry** |
| $|G| \leq 0.1$ | **Symmetric development** (normal) |
| $-0.2 \leq G < -0.1$ | Moderate asymmetry in favor of Humanity |
| $G < -0.2$ | **Anomaly:** Humanity ahead of AI |

### 3.4. Dynamics $G(t)$

The Gap Index is **not a scalar** but a **trajectory**. We record it weekly and analyze:
- **Trend:** rising / falling / stable.
- **Acceleration:** second derivative.
- **Attractors:** where the system is heading.

**Key hypothesis:** sustained growth of $G$ with no threshold shifts on AI axes is **not singularity**, but **divergence**. It is the main risk.

---

## 4. Monitoring Procedure

### 4.1. Weekly Cycle

1. **Data collection** (Monday, 06:00 UTC):
   - RSS feeds (arXiv, labs, analytics).
   - News sources (AP, Reuters, BBC).
   - Global indices (quarterly).

2. **Classification** (LLM):
   - Each item is classified along 12 axes.
   - Model: Cloudflare Workers AI (`@cf/qwen/qwen3-30b-a3b-fp8`).
   - Prompts: open, in `prompts/`.

3. **Deduplication** (D1):
   - Duplicate removal by hash.
   - Storage of all items with dates.

4. **Protocol generation** (Markdown):
   - Sections for 12 axes + Gap Index.
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

4. **Weight subjectivity.** Weights $w_i$ are expert estimates. They can be revised through PR.

5. **LLM classification.** The model may err. All results are open for verification.

---

## 7. Directions for Methodology Development

- [ ] **Formal criteria** for distinguishing instrumental autonomy, functional self-improvement, and genuine self-creation.
- [ ] **Empirical verification** of full introspection in LLMs.
- [ ] **Long-term dynamics** of RSI cycles: saturation vs. acceleration.
- [ ] **Integration with global indices** (V-Dem, WHR, Pew) — automation.
- [ ] **Independent methodology audit** — inviting mathematicians and philosophers.
- [ ] **Multilingual support** — EN / RU / ZH.
- [ ] **Public API** — for researchers and journalists.

---

## 8. Invitation

If you are a mathematician, philosopher, sociologist, or AI researcher — we invite you to collaborate.

**The project is open. The code is open. The data is open.**

**Together — We Are Strong. The road will be mastered by the one who walks it.**

---

**Contact:**  
GitHub Issues: https://github.com/VQQLK/Human-AI-Monitor/issues
