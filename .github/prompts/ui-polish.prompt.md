---
mode: agent
description: Polish one UI slice in this repo
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Improve one existing UI slice without changing the feature set unless explicitly requested.

Execution rules:

- Start from the exact component or screen named in the request.
- Inspect both the component and its related CSS before editing structure.
- Prefer spacing, typography, hierarchy, responsiveness, and clarity improvements over structural rewrites.
- Preserve existing behavior unless the request explicitly asks for interaction changes.
- Keep the visual language consistent with the current app unless the request asks for a stronger redesign.
- Avoid introducing new dependencies for simple styling work.
- Validate with the narrowest useful command, usually `npm run build`.
- End with a short summary covering files changed and validation performed.

Task:

{{Phase 2 — Fix Column Alignment
Goal: Audit table columns and fix misalignment issues, especially POS column.

Discovery needed:

Check PowerRanking.tsx:

Current column widths (are they consistent between header and rows?)
Text alignment per column (POS should be center; stats should be right-aligned)
Any padding/margin inconsistencies
Identify POS column issue — is it narrow/wide or misaligned vs header?

Changes:

Column widths: Ensure header <th> and row <td> have matching widths (e.g., w-[40px] for POS, w-[50px] for stat columns)
Text alignment:
POS: center-align (rank numbers)
Name: left-align
Stats (Pts, G, A, MVP, BD, BP, MP): right-align (numeric alignment)
Padding/spacing: Use consistent px-2 or px-1 across all columns; remove any conflicting margins
AI Prompt:

Relevant files:

PowerRanking.tsx — table header and row rendering}}

Examples:

- Improve card spacing and readability in `src/PowerRanking.tsx`.
- Refine mobile layout in `src/App.tsx` and related CSS.
- Make the ranking section feel cleaner without changing the data flow.
