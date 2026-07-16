Bug Fix
Prompt to use in chat
/bug-fix

Text structure

- Current issue:
- Expected behavior:
- Affected scope (files/components):
- Acceptance criteria:
- Constraints (optional):

Required sources

- Use #file:docs/upload-button-feature.md
- Use #file:docs/team-setup-and-match-lifecycle.md
- Use #file:docs/ranking-page-specification.md

Execution rules

- Treat the files above as source of truth.
- Do not rewrite rules already defined in docs.
- If there is a conflict between request and docs, stop and report the conflict before implementing.
- Apply the narrowest fix and avoid unrelated refactors.

Expected response format

1. Root cause
2. Files changed
3. Validation performed
4. Residual risks

Example
Current issue: duplicate athlete names are created on upload when casing differs.
Expected behavior: Joao, JOAO, and 1. Joao should result in one athlete.
Affected scope: src/App.tsx, ingestion flow.
Acceptance criteria:
Joao and JOAO merge into the same record.
Joao and Joana remain separate.
Constraints: do not refactor UI.

---

What to write for an upload bug (minimal version):

/bug-fix
Current issue: upload creates duplicate athletes when name casing differs.
Expected behavior: Joao, JOAO, and 1. Joao must merge into one athlete.
Affected scope: upload ingestion flow and name matching.
Acceptance criteria:
Joao and JOAO merge.
Joao and Joana remain separate.
Stats are aggregated.
Use #file:docs/upload-button-feature.md as source of truth.

practical rule:

Simple bug: 5 to 8 lines.
Medium bug: 10 to 15 lines.
Complex bug: full template.
