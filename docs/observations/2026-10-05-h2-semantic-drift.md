# Observation: h2_sovereignty semantic drift

**Date:** 2026-10-05
**Status:** recorded, no action until follow-up
**Severity:** medium (affects Human_score; Gap not statistically significant)

## What was observed

Between 2026-09-28 and 2026-10-05, the `h2_sovereignty` axis accumulated 27 items.
Manual review of reasoning shows ~60% concern **national/territorial sovereignty**
(Hong Kong, Taiwan, Ukraine, Iraq, Iran, Okinawa) rather than **cognitive sovereignty**
(critical thinking, independence of judgment).

Examples of drift:
- "FBI arrests spy on Taiwan leader's family" → reasoning: "national sovereignty"
- "U.S. Marine arrested on Okinawa" → reasoning: "Japan's sovereignty over territory"
- "U.S. forces leave Iraq" → reasoning: "restoration of Iraqi sovereignty"

Examples of correct use (in minority):
- "A life in episodes" → reasoning: "active critical thinking"
- "Scammers manipulate children" → reasoning: "lack of critical thinking"

## Evidence

- 27 items in D1 with `axes LIKE '%h2_sovereignty%'`
- 10 pre-2026-10-02 items show the same pattern → chronic, not regression
- Human_score dropped 0.63 → 0.50; h2 contribution ≈ -0.05

## Hypothesis

The axis name `h2_sovereignty` dominates the definition `critical thinking` in the
LLM prompt. The AI prompt already has this protection (e.g. `itq=... NOT general AI
progress`, `geopolitics=... NOT general tech policy`), but the Human prompt does not.

This is prompt asymmetry, not LLM failure.

## What it does NOT mean

- Not a bug in `classifier.ts` or `bayesian-gap.ts`
- Not a reason to change Human_score, weights, or Gap formula
- Not a regression — the pattern existed since project start

## What to do (deferred, follows §14)

1. Wait one more week — confirm chronicity with a second data point
2. If confirmed, apply §14 protocol:
   - Add `prompt_version` column to D1
   - Hold-out validation on 30 items (Cohen's kappa >= 0.8)
   - Add guard clauses to Human prompt (mirror AI prompt style)
3. Do NOT fix in place (see §12 lesson)

## What NOT to do

- Do not modify `src/config/prompts.ts` without §14 protocol
- Do not re-classify existing items
- Do not touch snapshot, /gap, or weights

## Related

- HANDOFF §14 (measurement instrument change protocol)
- HANDOFF §12 (rejected re-classification experiment — lesson)
- `src/config/prompts.ts` lines 42-44 (Human axes, current state)
- `src/config/prompts.ts` lines 8-12 (AI axes, target state with guard clauses)
