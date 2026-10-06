# PRODUCT.md — BlindSpot Frontend Product Context

## Primary User
Frontend or full-stack developer on a team with **no QA staff**, shipping fast.
**Core Question:** *"What broke, since when, and can you prove it?"*

## Positioning & Differentiator
**Trustworthy and explicit**, not louder. AI QA agent that runs plain English user flows in real browsers and records evidence.
- `Passed · healed`: explicit status and review queue for self-healed runs. Never silent.
- `Expected vs. Observed`: failure summaries lead with plain English facts before AI analysis.
- `Observed ≠ Inferred`: evidence and AI output are visibly distinct; AI output is always inside `<Inference>`.
- `Cost chip`: duration, actions, estimated cost on every run.

## Design Principles
1. **Observed ≠ Inferred:** Evidence and AI output look different; AI output is always labelled.
2. **Nothing silent:** Retries, recoveries, heals, and timeouts appear in the timeline.
3. **Failure-first:** Regressions → Failures → Flaky → Passing.
4. **Plain English first,** raw data one click away.
5. **Deep-link to exact moment:** step, action, and timestamp in URL.
6. **Show cost** of every run.
7. **Dense, calm, keyboard-friendly.**
8. **Never rely on colour alone:** icon + label + colour always.
9. **Readable on a projector.**
