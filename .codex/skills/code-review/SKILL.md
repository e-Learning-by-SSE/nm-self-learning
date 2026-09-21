---
name: code-review
description: Review source-code changes for correctness, security, performance, maintainability, readability, complexity, duplication, framework and language issues, API/database mistakes, breaking changes, side effects, dead code, error handling, and test quality. Use for pull-request reviews, diffs, patches, refactorings, or code inspections. Also inspect and apply all locally available skills whose rules are relevant to the reviewed code.
---

# Code review

Review the changed code and enough surrounding context to validate its behavior and dependencies.

Before reviewing, inspect the locally available skills and apply every skill whose scope is relevant to the code or project. Treat those skills as additional review rules; do not duplicate their instructions here.

Check for:

- correctness, bugs, edge cases, and unintended behavior
- security and unsafe data handling
- performance and unnecessary work
- maintainability, readability, duplication, and needless complexity
- language, framework, and project-convention violations
- API and database correctness, including transactions, validation, authorization, and error paths
- breaking changes, compatibility issues, and unintended side effects
- dead code, unused imports, unreachable branches, and stale abstractions
- missing or misleading error handling

For tests, review only their quality: correctness, readability, determinism, setup clarity, meaningful assertions, and whether they actually verify the behavior they claim to test. Do not report missing tests, insufficient coverage, or recommend additional tests solely to increase coverage.

Prioritize concrete defects over stylistic preferences. Do not report speculative issues without a plausible failure mode.

## Output

Return findings ordered by severity. For each finding include:

- file and location
- the concrete problem
- why it matters
- a concise corrective action

Avoid praise, generic summaries, and findings that merely restate the code. If no relevant issue is found, say so briefly.
