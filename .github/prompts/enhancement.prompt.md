---
mode: agent
description: Implement one focused enhancement in this repo
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Implement one focused enhancement with minimal scope.

Execution rules:

- Start from the exact file, component, or behavior named in the request.
- Prefer existing files in `src/` over introducing new abstractions.
- Keep changes localized and avoid unrelated cleanup.
- Reuse existing styles and patterns unless the request explicitly asks for a new visual direction.
- If the enhancement touches UI behavior, inspect the related CSS before creating new structure.
- Validate with the narrowest useful command, usually `npm run build` or `npm run lint`.
- End with a short summary covering files changed and validation performed.

Task:

{{input}}

Examples:

- Improve the mobile layout in `src/PowerRanking.tsx`.
- Add a loading or empty state to `src/App.tsx`.
- Refine spacing and typography in the ranking cards without changing the feature set.
