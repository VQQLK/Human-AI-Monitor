# Human–AI Monitor: A Brief for Mathematicians

**Version:** 0.1.0  
**Date:** September 17, 2026  
**Language:** [🇷🇺 Русский](math_brief.ru.md)

---

## 1. The Project in One Paragraph

We are building an **open monitoring system** that simultaneously tracks the development of artificial intelligence (6 axes) and the state of humanity (6 axes), computes a **Gap Index** — a quantitative measure of divergence between them — and publishes weekly protocols. This is not journalism, and not forecasting. It is an **attempt to operationalize a question that has remained rhetorical**: is singularity arriving, and what is happening to humanity in the process.

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

### 2.2. Humanity Axes (HHI)

| Symbol | What Is Measured | Alarm Threshold |
|--------|------------------|-----------------|
| H1 Agency | Human agency | Sustained decline in key domains |
| H2 Sovereignty | Cognitive sovereignty | Growing share unable to distinguish AI content |
| H3 Wellbeing | Wellbeing | Rising anxiety and loneliness among youth |
| H4 Equity | Equity and access | Growing compute divide |
| H5 Meaning | Meaning and purpose | Decline in share finding meaning in work |
| H6 Democracy | Institutional resilience | Decline in trust in institutions |

### 2.3. Gap Index

G = Σ(w_i^AI · a_i) − Σ(w_j^H · h_j)

where a_i, h_j ∈ [0, 1] are axis levels, w are normalized weights.

**Interpretation:**
- |G| < 0.1 — symmetric development;
- G > 0 — AI ahead of Humanity (main risk);
- G < 0 — Humanity ahead (unlikely, but recorded).

---

## 3. Why This Interests Mathematicians

### 3.1. Formalizing the Unformalizable

Singularity is a concept that has so far been defined **literarily** (Vinge, Good, Altman). We propose a **measurable structure**: 6 axes with explicit thresholds, each **falsifiable**.

This is an attempt to turn **speculation into hypothesis**, and hypothesis into **observable quantity**.

### 3.2. AI ↔ Human Symmetry

The 12 axes form a **symmetric structure**: 6 parameters describing the **artificial**, 6 describing the **human**. The symmetry is not accidental — it reflects the hypothesis: **AI development and Humanity's development are linked**, and the gap between them is the key variable.

### 3.3. Open Mathematical Problems

**Problem 1. Criterion for Genuine RSI.**

When is a system's self-modification **sustained improvement**, and when is it **saturation**? Related to computability theory (Kleene's recursion theorem, halting problem) and information theory (Kolmogorov complexity).

**Formalization:** let S be a self-improving system, S_t its state at time t. RSI is the process S_{t+1} = f(S_t), where f is the system itself (reflexivity). Sustainability means: lim_{t→∞} (d/dt) Capability(S_t) > 0. Question: under what conditions on f is this satisfied?

**Problem 2. Phase Transition Detection.**

The MMD detector (Hexad) is a heuristic. A rigorous theory is needed: **how to distinguish a phase transition from noise** in a self-improving system?

**Formalization:** let X_t be the trajectory of SGD iterations. We compute MMD(X_t, N(0, I)) — distance to a Gaussian surrogate. Question: does there exist a threshold τ such that MMD > τ statistically significantly indicates violation of local asymptotic normality (LAN)?

**Problem 3. Verification Without an Oracle.**

The verification hierarchy (formal verifiers → execution → LLM judges → self-assessment) is a **partial order**. When can the system **close the loop without a human**? This is a question about the **computational complexity of self-reference**.

**Formalization:** let V = {v_1, ..., v_n} be a hierarchy of verifiers, where v_i < v_j means "v_i is less reliable than v_j". The system can close the loop without a human if there exists v_i such that false_positive_rate(v_i) < 5% and v_i is autonomously applicable. Question: what is the minimum complexity of v_i?

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

- **Now:** weekly protocol in Markdown.
- **In 6 months:** Android app with push notifications.
- **In a year:** public API for researchers, journalists, politicians.
- **In 3 years:** global monitoring standard — open, reproducible, independent.
- **Ultimately:** an instrument of awareness — not just data, but a **mirror of civilization**.

### 5.3. Philosophical Meaning

The project is built on one question: **"What does it mean to see one's own path?"**

We do not predict the future. We **observe the present** — clearly, systematically, openly.

**Knowledge of one's own path cannot be a privilege.**

---

## 6. What Has Been Done

| Component | Status |
|-----------|--------|
| Architecture | Cloudflare Workers + D1 + Workers AI |
| Classifier | Cloudflare Workers AI (Qwen 3, open-weight) |
| Configuration | `wrangler.jsonc` with D1 binding |
| Infrastructure | D1 created (EEUR), 4 tables populated |
| Code | TypeScript, single Worker (9 endpoints) |
| Documentation | README, MANIFESTO, docs/, research/ |
| Methodology | `docs/methodology.md` |
| Architecture | `docs/architecture.md` |
| Manifesto | `MANIFESTO.md` |
| Live API | https://human-ai-monitor-collector.human-ai-monitor.workers.dev |

**Remaining:** Refactoring `src/index.ts` into modules, real tests, Android APK.

---

## 7. Invitation

If you are a mathematician, and any of the open problems (formalizing RSI, phase transition detection, verification without an oracle, Gap Index dynamics) interests you — we invite you to collaborate.

**The project is open. The code is open. The data is open.**

**Together — We Are Strong. The road will be mastered by the one who walks it.**

---

**Contacts:**
- GitHub: https://github.com/VQQLK/Human-AI-Monitor
- Issues: https://github.com/VQQLK/Human-AI-Monitor/issues
