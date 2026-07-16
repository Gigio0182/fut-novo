---
mode: agent
description: Build one focused feature in this repo
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Implement one clearly scoped feature with minimal impact outside the affected flow.

Execution rules:

- Start from the exact file, component, or user-facing behavior named in the request.
- Prefer extending existing components and state flow before introducing new abstractions.
- Keep the implementation narrow and avoid opportunistic refactors.
- If the feature affects UI, inspect the related CSS and preserve the existing visual language unless asked otherwise.
- If the feature needs new state or derived data, keep it local unless there is a clear reuse case.
- Validate with the narrowest useful command, usually `npm run build`, and run `npm run lint` when logic or patterns changed enough to justify it.
- End with a short summary covering the feature added, files changed, and validation performed.

Task:

Plan: Ranking Page Filter/Sort by Tabs
TL;DR: Make the filter tabs clickable and functional. Each tab sorts the player list by a specific metric and highlights the active tab. Current tabs are styled but non-functional; this adds sorting logic and state management.



Examples:

- Add a team search input to `src/PowerRanking.tsx`.
- Add a toggle to switch ranking views in `src/App.tsx`.
- Add a simple empty-state message when no ranking data is available.
