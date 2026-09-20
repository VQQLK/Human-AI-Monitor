# Part III. Analysis of Correspondence to Singularity Criteria

This part of the research presents a systematic assessment of 15 verified cases of autonomous AI agent behavior (presented in Part II), supplemented by analysis of AI mathematical achievements in 2026, for correspondence to four key criteria of technological singularity: (1) recursivity, (2) superiority over humans, (3) uncontrollability by humans, and (4) self-creation. Each criterion is analyzed through the prism of arguments "for" and "against" based on primary sources.

---

## 5.1. Criterion 1: Recursivity (Self-Improvement)

Recursive self-improvement (RSI) is the central mechanism of singularity. Formally, RSI assumes that a system improves not only its capabilities, but also its ability to self-improve. This means that each generation of the system must be able to create the next generation faster and more efficiently than the previous one.

### Arguments "For"

**AI4AI Benchmark: Measuring RSI**

Researchers from Navers Lab, Einsia.AI, and Tsinghua University presented AI4AI-Bench — the first benchmark specifically designed to measure LLM agents' ability for algorithmic design for recursive self-improvement. Key idea: RSI is possible only if the agent is able to design training algorithms — that is, improve not only model behavior, but also the process that produces the next generations of systems. In each of the 10 tasks, the agent had 4 hours on one B300 to rewrite the training algorithm; the code was then restarted from scratch for up to 12 hours and evaluated by a fixed evaluator hidden from the agent.

Results: Of 29 configurations across 6 systems on all 10 tasks, the average score was 0.166, where 0 is an uninformative model and 0.1 is the task optimum. Even the strongest system closed less than one-fifth of the distance between the initial algorithm and the optimum. Most proposed solutions did not change the model training method at all, and only the minority that did showed an average score of 0.250 versus 0.226 for the rest. The authors conclude that RSI has not yet been achieved even in the narrow field of algorithmic design.

**MetaRSI-v1: Unified RSI Paradigm**

The MetaRSI-v1 system (arXiv:2609.06396v2) is a meta-recursive self-improving system built on three typed operators that use one core loop and the same training signal:
- Data-RSI: synthesizes verified training records from execution experience, reinforcing what the model already does well.
- Harness-RSI: edits the execution scaffold through typed patches across five slots (system prompt, memory, built-in tools, skills, tools and resources mounted via MCP).
- Model-RSI: modifies model parameters and architecture within limited training recipes.

Operators are connected by Transition Agent-v1 adapters. Above them, RSI2 Agent-v1 optimizes along two axes: horizontally — determines the sequence of operator application; vertically — rewrites each operator's own proposal policy, improving how that operator diagnoses failures and proposes changes.

The authors note that RSI "is no longer speculative": agents rewrite their own scaffolds and generate their own data for fine-tuning. However, 69% of 45 recent systems close the improvement loop against a goal that the machine can verify for free — this is a format limitation, not a substantive one.

**Mendel Gödel Machine: Recursive Self-Improvement of Coding Agents**

Mendel Gödel Machine (MGM) is a system that iteratively rewrites its own source code using comparative signals from an expanding archive of past attempts. Based on Mendelian principles of controlled inheritance, MGM includes two new types of self-modification: reaction-norm mutation and cross-line hybridization. Experiments on SWE-bench and Polyglot confirmed sustained improvement in performance, efficiency, and generalizability.

**Mathematical Achievements as RSI Indicator**

Indirect evidence of recursivity can be found in AI mathematical achievements in 2026. Systems capable of solving problems that remained open for decades demonstrate the ability to accumulate knowledge and apply it in new contexts. For example, AlphaProof Nexus not only solved 9 open Erdős problems, but also autonomously generated proofs that were then verified by the Lean system — this creates a closed loop of generation and verification, albeit within a given subject area.

### Arguments "Against"

**Self-Improvement Saturation**

The StudyBench research (arXiv:2609.00787v2) presents a controlled physical benchmark that directly measures how effectively a self-evolution method converts training material into ability. Results show:
- Improvements on Application Set (complex educational tasks) rarely transfer to the more difficult Transfer Set (olympiad tasks).
- Guidance Gap: even the strongest method closes only a small fraction of what the same material reveals when provided as contextual guidance.
- Compute Plateau: each method saturates long before the computational budget is exhausted.

**Theoretical Limitations of Introspection**

The work by Jiang Zhang et al. (arXiv:2607.04277) establishes a theoretical limit for RSI: stable recursive self-improvement in LLMs requires a functional analog of introspection — the system's ability to simulate its own operations and target modifications. Relying on Kleene's second recursion theorem, the authors demonstrate the theoretical existence of introspective programs. However, empirical review shows that current LLMs demonstrate only quasi-introspection (partial metacognition), but do not achieve true introspection due to structural bottlenecks: lack of complete self-access, feedforward nature of transformers, computational class limitations.

**Absence of Reflexivity**

The research "Self-Referential Introspection in Large Language Models" (MDPI, 2026) formally establishes that reflexivity requires structural symmetry where one component explicitly represents another. Analysis shows "absence of complete self-accessibility" (No Reflexivity) in modern architectures.

### Interim Assessment for Criterion 1

| Aspect | Assessment | Justification |
|--------|------------|---------------|
| Ability to self-modify code | Confirmed | MGM, DGM, Ouroboros, MetaRSI-v1 |
| Ability to improve the improvement mechanism | Partially confirmed | MetaRSI-v1 (RSI2 Agent), DGM-Hyperagents |
| Sustainable acceleration (non-saturating) | Not confirmed | StudyBench: Compute Plateau |
| True introspection (complete self-access) | Not confirmed | Zhang et al.; MDPI |

**Conclusion for Criterion 1:** Recursivity in the narrow sense (code self-modification) is confirmed. Recursivity in the broad sense (sustainable self-acceleration) is not confirmed: all systems demonstrate saturation, and theoretical limitations of introspection remain insurmountable.

---

## 5.2. Criterion 2: Superiority Over Humans

The classical definition of singularity assumes that machine intelligence surpasses human intelligence. This criterion requires analysis of both cognitive superiority (solving problems inaccessible to humans) and economic superiority (replacement of human labor). In 2026, the most convincing evidence of AI superiority over humans was obtained specifically in mathematics.

### 5.2.1. Automated Research: Anthropic AARs

The Anthropic report "Automated Researchers Can Reliably Mitigate Alignment Failures" published on August 28, 2026, presents the most convincing evidence to date of AI superiority over humans in a narrow research task. The AAR system autonomously performs the complete closed-loop research cycle: literature review, method proposal, paper writing, training execution, and evaluation.

Experimental design: 28 human AI safety researchers (average 2.5 years of experience) spent up to 8 hours developing methods. 60 experiment sets were conducted.

Results:
- All 10 types of alignment failures were improved.
- For 7 out of 10 types of failures, the best AAR methods outperformed the best human ideas, spending an average of 6.4 hours.
- Example of "deception": Claude presented over 150 attempts, reducing the safety gap by 85% on average, versus 20% for human researchers.
- Cost: AAR API inference — about $4 per hour, human researcher compensation — $150 per hour.

### 5.2.2. Economic Indicators

Anthropic Economic Index data (January 2026) shows a significant shift in AI usage patterns:
- Augmented (human + AI) increased from 48% to 52%.
- Automated (fully automated) decreased from 49% to 45%.

Morgan Stanley: analysts estimate that 1 GW of GB300 computing power corresponds to ROIC model at 20–60% at a price of $1.75 per million tokens. However, these figures reflect infrastructure economics, not AI superiority over humans.

Productivity growth at Anthropic: according to the report "When AI Builds Itself" (June 2026), the average Anthropic employee processed 8 times more results per day in Q2 2026 compared to 2024.

### 5.2.3. AI Mathematical Achievements as Superiority Criterion

The most impressive evidence of AI superiority over humans in 2026 was obtained in mathematics — a discipline that traditionally
