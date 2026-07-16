---
mode: agent
description: Fix one focused bug in this repo
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Fix one concrete bug with the smallest defensible code change.

Execution rules:

- Start from the exact failing behavior, file, or component named in the request.
- Form one local hypothesis about the root cause before editing.
- Prefer the narrowest code path that directly controls the bug.
- Do not refactor unrelated code while fixing the issue.
- Add or adjust only the minimal logic needed to correct the behavior.
- Validate with the narrowest useful command, usually `npm run build`, and use `npm run lint` when the fix touches lint-sensitive patterns.
- End with a short summary covering the root cause, files changed, and validation performed.

Task:

{{when cliclking on button name="Confirmar & Salvar", I'm getting the error "Não foi possível salvar a partida. Tente novamente."}}

Examples:

- Fix duplicate rendering in `src/PowerRanking.tsx`.
- Fix a layout break on small screens in `src/App.tsx`.
- Fix a TypeScript error introduced by the last change.
