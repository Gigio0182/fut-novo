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

{{Phase 1 — Remove Status Bar
Goal: Remove decorative iPhone chrome and use full screen space.

Steps:

Locate the status bar in PowerRanking.tsx (renders time, signal, wifi, battery icons)
Remove or delete the status bar JSX section
Adjust top spacing if needed (remove any pt-[8px] or similar padding intended for the status bar)
Verify ranking table starts at the very top with clean alignment
Verification:

Status bar gone ✓
Table title and header row at top of screen ✓
No visual artifacts from removal ✓}}

Examples:

- Improve card spacing and readability in `src/PowerRanking.tsx`.
- Refine mobile layout in `src/App.tsx` and related CSS.
- Make the ranking section feel cleaner without changing the data flow.
