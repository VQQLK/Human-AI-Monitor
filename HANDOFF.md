# Human-AI Monitor — Handoff

> Documentation for an engineer continuing this work.
> Last updated: 2026-10-07.
> Languages: [English](HANDOFF.md) | [Русский](HANDOFF.ru.md)

## 1. Project overview

Cloudflare Worker that:
- Collects RSS signals from 58 sources (33 AI + 25 Human)
- Classifies items via LLM (@cf/qwen/qwen3-30b-a3b-fp8)
- Computes Bayesian Gap Index: Gap = Human_score − AI_score
- Exposes API: /gap, /axes-history, /protocols, /health, /classify, /voices, /backfill-voices

Stack: TypeScript, Cloudflare Workers, D1 (SQLite), GitHub Actions, Vitest.

Deploy: push to main → workflows → sync-protocols.yml updates README.

## 2. Key files

| Path                              | Role                                         |
| --------------------------------- | -------------------------------------------- |
| src/index.ts                      | HTTP router + cron handler                   |
| src/auth.ts                       | Bearer, isProtectedPath, timingSafeEqual     |
| src/config/sources.ts             | YAML → Source[]                              |
| src/config/axes.ts                | AI_AXES (6), HUMAN_AXES (6), META_AXES (1)   |
| src/config/weights.ts             | Axis weights (sum = 1.0, validated)          |
| src/config/prompts.ts             | LLM prompts (AI + Human)                     |
| src/services/gap-computation.ts   | Bayesian posterior + MC 10000 samples        |
| src/services/bayesian-gap.ts      | Beta sampling, RNG                           |
| config/sources_ai.yaml            | 33 AI sources                                |
| config/sources_human.yaml         | 25 Human sources                             |
| config/axes_ai.yaml               | 6 AI axes + META geopolitics                 |
| config/axes_human.yaml            | 6 Human axes                                 |
| scripts/audit.sh                  | Main audit (v4.9, 147 checks, 15 phases)     |
| scripts/run-audit.sh              | Launcher for audit.sh                        |
| scripts/math_verification.py      | Independent math verification (Phase 15)     |
| scripts/yaml-to-ts.mjs            | YAML → TS generator                          |
| scripts/update_readme.py          | Update README from live API (incl. ## Voices)|
| config/voices.yaml                | 46 curated speakers, 7 categories            |
| src/services/voices.ts            | extractVoice() + saveVoice()                 |
| src/config/generated/voices.ts    | Auto-generated from voices.yaml              |
| migrations/0014_voices.sql        | D1 migration: voices table                   |
| HANDOFF.md                        | This file                                    |

## 3. Current state

- HEAD: latest commit on main (see `git log --oneline -5`)
- **Baseline: 147 checks — 146 PASS / 1 WARN / 0 FAIL** (WARN = transient axis coverage, e.g. `hexad`; always verify via `bash scripts/run-audit.sh`)
- Audit script version: **v4.9** (15 phases; Phase 15 = math verification)
- Math verification: **20/20 PASS** (see §14; runs inside audit as Phase 15)
- Sources: 58 (33 AI + 25 Human)
- Axes: 13 (6 AI + 6 Human + 1 META)
- Source languages: en + ru (TASS) + zh (FT Chinese)
- Batch capacity per run: 60 (planned: 58)
- CF token: 3 permissions (Workers Scripts:Edit, D1:Edit, Workers Builds Config:Edit)
- **Items classification:** 603 items, classified with prompt v1 (no per-item version tracking)
- **Voices extraction:** 13 curated mentions from 46 speakers (7 categories; policy emptied 2026-10-08)

## 4. Known issues (by priority)

### 🟢 h1_agency, h5_meaning coverage — RESOLVED
- Added: Aeon, Psyche (h5_meaning), Oxfam, HRW (h4_equity)

### 🟢 Non-English sources — RESOLVED
- Added: TASS (ru), FT Chinese (zh), Al Jazeera, The Hindu (en, Global South)

### 🟢 META axis geopolitics — intentionally not in /gap
- Computed (49 items, level 0.847) but not returned in /gap
- **Decision:** do NOT expose in /gap (see §12 — scientific integrity rule)
- Currently accessible only via /axes-history

### 🟡 h2_sovereignty semantic drift

**Date recorded:** 2026-10-05 · **Status:** deferred to follow-up

~60% of items tagged `h2_sovereignty` concern **national/territorial sovereignty** (Hong Kong, Taiwan, Ukraine, Iraq, Iran, Okinawa), not **cognitive sovereignty** (critical thinking, independence of judgment). The pattern is chronic — pre-2026-10-02 items show the same drift, not a regression.

**Hypothesis:** axis name dominates the definition `critical thinking` in the LLM prompt. AI prompt already guards against this (`itq=... NOT general AI progress`, `geopolitics=... NOT general tech policy`); Human prompt does not.

**Deferred action (follow §13):** wait one more week to confirm chronicity; if confirmed, apply §13 protocol — add `prompt_version` column, hold-out validation (30 items, Cohen's kappa >= 0.8), add guard clauses mirroring AI prompt style. Do NOT fix in place (see §13 anti-patterns).

**Status of §13 protocol:** not yet applied — instrument unchanged. Triggered only if drift confirmed next week.

### 🟢 Snapshot recomputed — RESOLVED (2026-10-05)
- /gap and /axes-history serve the first FINAL protocol for week 2026-09-28 (recorded_at 2026-10-05, gap = −0.26, AI is ahead)
- Recomputation happens automatically on Monday 14:00 UTC
  (cron sync-protocols.yml → generateProtocol: true)

## 5. Working patterns

NEVER use nano for large edits — breaks unicode, drops chunks.

Use python patch with anchor check:

    from pathlib import Path
    import sys
    p = Path('file.txt')
    c = p.read_text(encoding='utf-8')
    if "old" not in c:
        print("anchor not found"); sys.exit(1)
    c = c.replace("old", "new", 1)
    p.write_text(c, encoding='utf-8')

Always:
1. cp file file.bak_$(date +%Y%m%d) — backup
2. python3 -m py_compile /tmp/patch.py — syntax check
3. python3 /tmp/patch.py — apply
4. bash -n / npx tsc --noEmit — validate
5. npx vitest run — tests
6. bash scripts/run-audit.sh — audit
7. git commit + push

If push is rejected (! [rejected]):
    git pull --rebase origin main
    git push origin main
The bot pushed README — rebase resolves cleanly.

## 6. Quick commands

    # Full audit
    bash scripts/run-audit.sh

    # Tests only
    npx vitest run

    # Type check
    npx tsc --noEmit

    # Regenerate TS from YAML
    node scripts/yaml-to-ts.mjs

    # Probe one source
    curl -sI "https://example.com/feed.xml" | head -5

    # D1 query
    npx wrangler d1 execute human-ai-monitor-db --remote --command "SELECT ..."

    # Live API
    curl -s "https://human-ai-monitor-collector.human-ai-monitor.workers.dev/gap"

## 7. Cron schedule (UTC)

| Time                          | What                              |
| ----------------------------- | --------------------------------- |
| 13:00, 13:15, 13:30, 13:45    | Daytime collection (4 batches)    |
| 23:00                         | Evening collection                |
| 13:45 Tue-Sun                 | Daily interim protocol            |
| 13:45 Mon                     | Weekly FINAL protocol             |
| 14:00 daily (Worker dispatch) | sync-protocols.yml                |
| 14:00 Mon, 08:00 Sat          | sync-protocols.yml (native fallback) |

## 8. How to add a new source

1. Probe RSS: `curl -sI "<URL>" | head -5` → must be 200

2. Add a block to config/sources_ai.yaml or config/sources_human.yaml:

    - name: Name
      url: https://...
      lang: en
      tier: 1
      axes:
      - h1_agency
      note: Description

3. `node scripts/yaml-to-ts.mjs`
4. Update test/index.spec.ts: sources_count = new total
5. `npx vitest run` + `bash scripts/run-audit.sh`
6. git commit + push

## 9. Dangerous spots

- D1 schema `items`: columns hash, title, summary, url, source, date, lang,
  axes, relevance, shift, direction, reasoning, collected_at, temporal_status,
  event_date. NOT `recorded_at`, NOT `created_at` (historical bug).
  NOT `week_start` — that column exists only in `gap_history`, not in `items`.
- sources_ai.yaml does NOT control axes — the LLM does the mapping.
- weights.ts: AI and Human weights must sum to 1.0 (validated on load).
- prompts.ts: edit the AI prompt, do not touch Human (tests depend on it).

## 10. Do NOT

- Force-push to main (linear history is important)
- Delete bot commits `chore: sync latest [skip ci]` — they carry README
- Edit src/config/generated/*.ts manually — they are overwritten by yaml-to-ts.mjs
- Use 2>/dev/null in audit.sh — hides errors (real incident)
- Run `python3` without `-u` in a pipe — output is buffered, appears frozen

## 11. Links

- Repo: https://github.com/VQQLK/Human-AI-Monitor
- Worker: https://human-ai-monitor-collector.human-ai-monitor.workers.dev
- D1 database: human-ai-monitor-db
- Cloudflare dashboard: https://dash.cloudflare.com

---

## 12. Formal falsification criteria for geopolitics_score

**Status: working hypothesis, not established truth.**

Decision to expose `geopolitics_score` as a standalone observable
(not a component of AI_score) rests on **parsimony** under lack of
validation data. It is falsifiable. The following tests must be run
once sufficient history is available (≥ 8 weeks of weekly snapshots).

### Test A — discriminant validity (Campbell & Fiske, 1959)

Hypothesis H1: `geopolitics` is a distinct construct from AI capability.

    # 13x13 correlation matrix across all axes and all weeks
    corr_matrix = compute_correlations(all_axes, all_weeks)

    # H1 acceptance: |Corr(geopolitics, mean(AI_axes))| < 0.4
    # H1 rejection: |Corr| >= 0.4 → geopolitics overlaps AI latent,
    #               should be merged as a component instead of standalone

### Test B — external validation against METR doubling time

Hypothesis H2: adding `geopolitics` improves prediction of an
external capability ground truth (METR doubling time series).

    # METR doubling time per week (external, independent source)
    corr_no_g   = corr(AI_score_without_geopolitics, METR_series)
    corr_with_g = corr(AI_score_with_geopolitics,    METR_series)

    # H2 acceptance: corr_with_g > corr_no_g + 0.05 (statistically significant)
    # H2 rejection:  no significant improvement → geopolitics adds noise
    #                to AI_score, keep standalone

### Test C — predictive lag (leading indicator check)

Hypothesis H3: `geopolitics` at week t predicts AI_score at week t+1.

    # Cross-correlation with lag 1
    corr_lag1 = corr(theta_geopolitics[t], AI_score[t+1])

    # If corr_lag1 > 0.5: geopolitics is a leading indicator.
    #   → may justify inclusion as a predictive term (with appropriate lag)
    # If corr_lag1 < 0.3: geopolitics is contemporaneous / not predictive.
    #   → standalone observable confirmed

### Decision matrix

| Test A | Test B | Test C | Action |
| ------ | ------ | ------ | ------ |
| pass   | pass   | pass   | Include as leading component with lag |
| pass   | pass   | fail   | Merge as component in AI_score |
| pass   | fail   | fail   | **Keep standalone (current)** |
| fail   | —      | —      | Merge geopolitics into AI_WEIGHTS |

### Publication rule (scientific integrity)

**Do NOT expose geopolitics_score in /gap until Tests A/B/C pass.
Currently only in /axes-history.**

Rationale: N = 1 week of data. Posterior Beta(2.735, 0.5) has effective
sample size ≈ 2.2 — dominated by prior. CI95 = [0.372, 0.9998] spans
almost [0, 1]. Publishing this in /gap would create false precision and
mix validated quantities (Capability − Impact) with an unvalidated
experimental observable.

The Gap formula stays: Gap = Human_score − AI_score (6 axes each, sum
of weights = 1.0). geopolitics is exposed as a separate axis via
/axes-history only. Promotion to /gap requires all three tests to pass
first.

This rule operationalizes the project's scientific-truth principle:
**a metric is published only after it has been validated.**

### Until tests are run

- Do NOT change AI_WEIGHTS or HUMAN_WEIGHTS
- Do NOT modify the Gap formula
- Do NOT expose geopolitics_score in /gap until Tests A/B/C pass
- Do expose it via /axes-history (already implemented)
- Do record the reasoning above in any PR that touches this

*Reference: Cronbach & Meehl (1955) construct validity; Campbell & Fiske (1959)
multitrait-multimethod matrix.*


---

## 13. Measurement instrument change protocol

Any change to LLM prompts that produce `axes`, `relevance`, `shift`,
`direction`, or `reasoning` is a **change of the measurement instrument**.
It is not a code refactor. It must follow this protocol.

### Rules

1. **Never overwrite an existing measurement column.**
   `axes` (v1) stays intact. New instrument writes to `axes_v2`.
   Same for any other derived column.

2. **Record provenance for every item.**
   Add (or reuse) columns: `classified_by` (e.g. `"prompt_v1"`),
   `classified_at` (ISO timestamp). Set at classification time.

3. **Validate before switching.**
   Required, all on a hold-out set of at least 30 items:
   - **Test-retest reliability**: same prompt, two runs, Cohen's kappa ≥ 0.8
   - **Inter-rater agreement**: prompt vs human annotator, Cohen's kappa ≥ 0.6
   - **Criterion validity**: if possible, correlate with external ground truth
   - **Convergent validity**: correlate with structurally similar axes

4. **Preregister the switch.**
   Update `docs/methodology.md` (all 3 language versions) with:
   - New prompt version ID
   - Date of switch
   - Validation results (kappa, sample sizes)
   - Rationale and expected effect

5. **Backfill atomically, not incrementally.**
   Either all items are migrated to the new column or none. Avoids
   time confounds and mid-migration mixed states.

6. **Switch the reader, not the data.**
   `gap-computation.ts` reads from one explicit column name
   (`axes` → `axes_v2` in a single commit). Rollback = revert that commit.

### Anti-patterns (do not do)

- Overwriting `axes` with a new prompt's output
- Processing items in chronological order without stratification
- Claiming improvement from distribution shifts alone
- Re-classifying "as we go" while quota or rate limits interrupt
- Applying changes without backup + verified rollback path

### Enforcement

- Any PR that modifies `src/config/prompts.ts` must cite this section
- Any DB migration touching `axes` (or successors) must follow this protocol
- Audit script (`scripts/audit.sh`) may later enforce column presence


---

## 14. Mathematical audit

The mathematical core is **correctly constructed and validated against
peer-reviewed references**. This section documents verified components,
explicit limitations, and formal tests for future validation as data
accumulates.

### 14.1 Verified correct

| Component | Implementation | Reference |
| --------- | -------------- | --------- |
| Gamma sampler | Marsaglia-Tsang with boost for α<1 | Marsaglia & Tsang (2000) |
| Beta sampler | Γ(a)/(Γ(a)+Γ(b)) ratio | Robert & Casella (2004) §2.3 |
| Prior | Jeffreys Beta(0.5, 0.5) | Jeffreys (1946) |
| Posterior update | Generalized evidence accumulation | Valid pseudo-likelihood (see 14.2.1) |
| Weighted-sum MC | Linearity of expectation preserved | Standard MC theory |
| Equal-tailed CI | Empirical quantiles (not normal approx) | Correct for U-shaped Beta |
| Two-sided significance | CI95 does not contain 0 | Bayesian credible interval test |
| Weight validation | Sum = 1.0, each ∈ (0, 1) | Fail-fast at module load |

All eight components are mathematically sound. No errors were found.

### 14.2 Documented limitations

These are not defects. They are explicit **boundaries of applicability**
of the current model, quantified wherever possible.

#### 14.2.1 Source-level correlation not modeled

**Facts.** `betaParamsFromSignals` treats items as independent evidence.
In practice, items from the same source may be correlated. Example:
5 Politico articles on the same bill → 5× the same signal.

**Mathematical impact.** Effective sample size:

    ESS_eff ≈ ESS / (1 + (n_avg − 1) · ρ)

where n_avg = average cluster size, ρ = intra-source correlation.

**Estimated parameters (from observed data):**
- itq: n_avg ≈ 5, ρ ≈ 0.15–0.25 → ESS_eff ≈ 0.55–0.70 × ESS
- Politico Tech: n_avg ≈ 4, ρ ≈ 0.3 → ESS_eff ≈ 0.6 × ESS

**Consequence.** Real CI ≈ nominal CI × √(1 + (n_avg − 1)ρ).
Range: 1.2× to 1.4× wider.

**What is NOT affected:**
- Posterior mean (unbiased regardless of correlation)
- Trend analysis between weeks (bias identical across weeks)
- Rank order of axes

**What IS affected:**
- Absolute CI width (nominal, not exact)
- Significance of marginal results

**For the 2026-10-02 snapshot (historical):** Gap = 0.09, CI95 = [−0.213, +0.400]. Under
ρ = 0.2, real CI ≈ [−0.30, +0.49]. Conclusion (no significance)
unchanged. Formula remains valid for its stated purpose.

#### 14.2.2 Multiple comparisons

**Facts.** 13 axes, each with `isSignificant(ci95)`. Uncorrected α = 0.05.

**FWER.** If all 13 null hypotheses are true: 1 − 0.95¹³ ≈ 0.49.

**Context.** The main output is **one** Gap test (`Gap = Human − AI`),
a single confirmatory hypothesis. Per-axis significance is exploratory
diagnostic output, not a family of confirmatory tests.

**Conclusion.** Multiple-comparisons correction is **not required** for
the primary Gap result. Per-axis p-values are labeled exploratory.

**If per-axis results are ever used for decisions**, apply Bonferroni
(α' = 0.05/13 ≈ 0.0038) or Benjamini-Hochberg FDR.

#### 14.2.3 PI_TABLE as expert estimate

**Facts.** Voice table π(shift, direction) with values {+1.0, +0.5, +0.3,
0.0, −0.3, −0.5, −1.0}.

**Status.** These are expert estimates (same class as axis weights).
They are:
- Internally consistent (symmetric: yes/up = −yes/down)
- Order-preserving (yes > no > uncertain in strength)
- But NOT derived from psychometric literature or empirical calibration.

**Effect on gap.** A systematic scaling error in PI_TABLE scales the
*evidence* but not the *posterior mean* if the error is proportional
across axes. For asymmetric errors, bias affects relative weighting
of axes.

**No correction is warranted at present.** Calibration is possible
(Test E, below) but requires ground-truth annotation that is not yet
collected.

### 14.3 Future improvements (deferred)

Not required for correctness. Listed for future work as data accumulates.

1. **Hierarchical model** — source-level random effects to explicitly
   model correlation structure. Would tighten CI to true width.
2. **PCG64 or xoshiro256** — replacement for mulberry32; passes BigCrush.
   Current implementation is adequate for M = 10000.
3. **Empirical calibration of PI_TABLE** — requires ≥100 annotated items.
4. **Cross-source aggregation** — group items by URL prefix to reduce
   duplicate content (e.g., same press release syndicated).

None of these change the current methodology or results.

### 14.4 Formal falsification criteria

These tests should be run once sufficient data accumulates (≥ 4–8 weeks).
Each is designed to be falsifiable.

#### Test D — Intra-source correlation `[MANUAL]`

> Status: **not automated**. Requires ≥ 4 weeks of data (gate condition).
> Implementation pending — do NOT assume it runs inside audit.sh.

**H0:** Items within a source are independent evidence.

**Method:**
    for source in sources:
        items = fetch(source, week)
        if len(items) < 3: continue
        R = correlation_matrix(items.relevance)
        avg_corr = mean(R[off_diagonal])
        report(source, avg_corr)

**Rejection criterion:** >30% of sources with avg_corr > 0.3 → model
assumption significantly violated; consider hierarchical model.

#### Test E — PI_TABLE calibration `[MANUAL]`

> Status: **not automated**. Requires ≥ 100 annotated items (manual work).
> Deferred until annotation data is collected.

**H0:** v_s = relevance · π(shift, direction) predicts true axis shift.

**Method:**
- 100 items with expert annotation (score ∈ [−1, +1])
- Linear regression: expert_score ~ v_s
- Report R² and slope

**Rejection criterion:** R² < 0.3 → PI_TABLE is too coarse; needs
empirical derivation.

#### Test F — Monte Carlo convergence `[AUTOMATED]`

> Status: **already automated** in `scripts/math_verification.py` §8.
> Runs on every audit as part of Phase 15. See §14.5 for current result
> (change 10k→100k = 0.041%, well under 1% threshold).

**H0:** M = 10000 is sufficient for CI precision.

**Method:**
- Run computeGapIndex with M ∈ {1000, 10000, 100000} × 10 seeds
- Report distribution of gap_std and gap_ci95 width

**Rejection criterion:** >1% change from M=10000 to M=100000 → increase
DEFAULT_MC_SAMPLES.

#### Test G — Empirical FWER `[REJECTED in v3]`

> Status: **removed from math_verification.py in v3.** The v1/v2 design
> checked per-axis CI (not Gap CI), and with n=10 the per-axis
> false-positive rate is ≈11%, not the nominal 5%. Any future
> implementation MUST use Gap-based simulation with n ≥ 100.
> **Do not re-add the old design.**

**H0:** α = 0.05 for each per-axis significance test.

**Method:**
- Simulate 13 independent Beta(1, 1) posteriors (H0 true)
- Run isSignificant() 1000 times
- Count false positives per axis

**Rejection criterion:** rate > 7% (2σ above nominal) → check test
construction. Expected: ~5%.

### 14.5 Summary

The mathematical core is correctly constructed. All methods trace to
peer-reviewed sources. The three documented limitations are boundaries
of applicability, not defects:

- Source correlation affects CI width (~1.2–1.4×), not the point estimate.
- Multiple comparisons are not relevant for the single confirmatory Gap test.
- PI_TABLE is expert estimate; calibration deferred.

The system is suitable for:
- Trend analysis (weekly changes)
- Confirmatory Gap test (single hypothesis)
- Relative comparison of axes

Absolute CI values should be read as nominal with widening under
correlation. This is documented, not hidden.

**No immediate action is required. Tests D–G are for future validation.**

---

## 15. Anti-patterns for external contributors

If you are working with this project for the first time — read this
before making changes. It addresses the most common misunderstandings.

### Do NOT re-open settled scientific decisions

- **Test G** (empirical FWER) — **deliberately removed in v3** of
  `math_verification.py`. The old design (per-axis CI with n=10) was
  conceptually wrong; correct design is Gap-based with n≥100 (§14.4).
  Do not re-add the old version.

- **`geopolitics_score` in `/gap`** — **forbidden** (§12) until
  Tests A/B/C pass. Currently accessible only via `/axes-history`.

- **AI_WEIGHTS / HUMAN_WEIGHTS** — do not change without preregistered
  methodology update. Sum must be exactly 1.0 (validated at module load).

### Common technical mistakes

- **`items` schema**: columns `collected_at`, `date`, `event_date`.
  NO `week_start` (that is only in `gap_history`).
  NO `recorded_at`, NO `created_at` (historical bug — was fixed).

- **64-bit RNG (xoshiro256)**: requires `BigInt`; incompatible with
  `Uint32Array`. `<< 45` in JS shifts modulo 32 — does NOT work as
  intended. If you need a better RNG, use a tested library
  (`pure-rand`, `seedrandom`) or implement with `BigInt`.

- **`sources_ai.yaml` does NOT control axes**: the LLM does the mapping
  via `src/config/prompts.ts`. Adding `axes:` in YAML has no effect
  on classification.

- **CI success ≠ deployed.** `ci.yml` runs `wrangler deploy --dry-run`
  only — it validates compilation, it does NOT deploy. Real deployment
  is manual: `npx wrangler deploy`. After changes to
  `config/sources_*.yaml`, `src/config/prompts.ts`, or `src/index.ts` —
  verify production via `/health` (`sources_count`, `batches_capacity`)
  matches local config. Mismatch = stale deployment.

- **Test F already automated**: it is section 8 of
  `scripts/math_verification.py`, called from Phase 15 in `audit.sh`.
  Do not duplicate.


### Information gaps to be aware of

- **Baseline numbers change**: they reflect the last audit run, not a
  fixed state. Always verify against `bash scripts/run-audit.sh`, not
  against numbers written in this document.

- **A WARN on any axis may be temporary**: it reflects the state right after
  new sources were added, before the next cron run. Not necessarily a defect.

- **Snapshot (`/gap`) may lag behind `items`**: recomputation happens
  on Monday cron (14:00 UTC). If `/gap` shows an old `recorded_at`,
  that is expected until the next scheduled generation.

### Band label collision — "significantly"

The `interpretGap` band label for $|G| > 0.3$ uses the word **significantly**
(`AI is significantly ahead` / `Humanity is significantly ahead`). This is a
**magnitude** label retained from the original specification.

**Known collision.** The same word appears in `statistically_significant` —
a separate boolean field (CI95 strictly excludes zero). The two fields can
disagree. Live example, 2026-10-05:

    gap:                       -0.31
    interpretation:            "AI is significantly ahead"
    gap_ci95:                  [-0.6106, +0.006]
    statistically_significant:  0

Both readings are correct: the band reports a large magnitude; the significance
flag reports that the sign is not resolved by the current sample.

**Reading rule.** Band = magnitude. `statistically_significant` = reliability.
Report both. Do not collapse to one label. User-facing explanation:
`docs/methodology.md` §3.3.

**Resolution — `interpretation_full`.** Since 2026-10-10 the API exposes an
additional field `interpretation_full`: for labels containing `significantly
ahead` it appends ` (statistically confirmed)` or ` (not statistically
confirmed)`, based on `statistically_significant`. The original
`interpretation` field is unchanged. README, protocol markdown, and RU/ZH
translations render the suffixed form; RU/ZH suffixes are substituted via
`%%SIG_NO%%` / `%%SIG_YES%%` markers in `src/services/translation.ts` after
the LLM pass, so no glossary dependency on the full English string.

**Why not rename.** Renaming to "substantially" or "strongly" would require
synchronized changes in: `src/services/bayesian-gap.ts` (2 lines),
`test/bayesian-gap.spec.ts` (2 assertions) + `test/gap-computation.spec.ts` (1 assertion),
`src/services/translation.ts` (RU/ZH suffix localization via %%SIG_NO%% / %%SIG_YES%% markers),
`gap_history` (interpretation column values), README ×3, generated protocol
markdown ×5, and `docs/methodology.{md,ru.md,zh.md}` §3.3.
Decision (2026-10-10): **document the collision** rather than chase a rename.

**Do NOT "fix" this by editing only one file.** Any band-label rename must be
preregistered per §13 (Measurement instrument change protocol).

### When in doubt

Run `bash scripts/run-audit.sh` — it includes Phase 15 (math verification)
and reflects the real current state of the project. Do not trust
hand-written statuses without verification.

For Voices feature: `curl /voices?limit=10` to verify extraction quality.
If count is 0 but items exist, check `extractVoice()` logic — name-in-title is required (title-only since f068120).

---

## 16. Voices feature (automated quote extraction)

Extracts curated mentions from 46 speakers (AI lab leaders, researchers, investors; policy category emptied 2026-10-08) when they are named in news headlines. Includes CJK frontier labs (DeepSeek, Moonshot, Qwen, Zhipu, ByteDance, MiniMax, Tencent).

### Critical extraction logic (DO NOT CHANGE WITHOUT REVIEW)

A mention is extracted **if and only if BOTH** conditions are met:
1. `item.relevance >= 0.2` (configurable via `min_relevance` in `config/voices.yaml`)
2. **At least one keyword** from the speaker's `keywords` list appears in `item.title` (case-insensitive, Unicode-aware word boundary)

> ⚠️ **ANTI-PATTERN**: Do *not* implement "source-only" matching (e.g., attributing an article to a speaker just because it's from "NPR" and "NPR" is in their sources list). This causes massive false positives. The speaker's name/keyword **must** appear in the title. Verified: source-only matching produced 224 false positives vs 116 correct extractions with name-in-title logic. Summary-only matches were removed 2026-10-08 (commit f068120) — produced misleading attributions like 'AMD acquires World Labs' → Fei-Fei Li.

### Flow
- `config/voices.yaml` → `node scripts/yaml-to-ts.mjs` → `src/config/generated/voices.ts`
- `src/services/voices.ts:extractVoice()` called in `runCollection()` after `INSERT INTO items`
  - Uses Unicode-aware word boundaries: `(?<!\p{L})keyword(?!\p{L})` with `/u` flag (commit d7290c2). Required for CJK/cyrillic names like 梁文锋 — `\b` only matches ASCII boundaries.
- `saveVoice()` uses `INSERT OR IGNORE` with `UNIQUE(item_hash, speaker)` — idempotent
  - **Gotcha:** `INSERT OR IGNORE` never deletes or overwrites. When a speaker is removed from `config/voices.yaml`, existing rows in `voices` persist until manual `DELETE FROM voices WHERE speaker = ?`. Verified 2026-10-08 (Sacks removal required manual cleanup).
- `GET /voices?limit=20&category=frontier_labs` — returns curated quotes
- `GET /backfill-voices` (auth required) — retroactively processes all items
- `scripts/update_readme.py` renders `## Voices` section in README.md / .ru / .zh (with timeout resilience)

### Categories
`frontier_labs`, `researchers`, `safety_philosophy`, `investors`, `crypto`, `enterprise`, `mathematics`


---

*For questions — see docs/methodology.md (Gap math) and scripts/audit.sh (what is checked).*
