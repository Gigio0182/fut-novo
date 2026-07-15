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

{{input}}

Examples:

- Improve card spacing and readability in `src/PowerRanking.tsx`.
- Refine mobile layout in `src/App.tsx` and related CSS.
- Make the ranking section feel cleaner without changing the data flow.
