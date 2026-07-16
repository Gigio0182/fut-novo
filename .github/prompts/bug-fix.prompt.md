---
mode: agent
description: Fix one focused bug in this repo
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Fix one concrete bug with the smallest defensible code change.

Workflow:

1. Discovery

- Start from the exact failing behavior, file, or component named in the request.
- Form one local root-cause hypothesis in up to 5 lines.
- Identify the narrowest code path that controls the bug.

2. Implementation

- Change only what is required to fix the behavior.
- Do not refactor unrelated code.
- Preserve existing visual and architectural patterns unless the bug requires otherwise.

3. Validation

- Run the narrowest useful validation command.
- Default: npm run build.
- Also run npm run lint when touched files are lint-sensitive.

4. Report

- Return a concise final report using the exact output format below.

Acceptance criteria:

- The reported failing behavior is fixed.
- No unrelated behavior changes were introduced.
- Validation command results are included.

Output format:

1. Root cause

- One short paragraph.

2. Files changed

- path/to/file — one-line reason per file.

3. Validation

- Build: pass or fail.
- Lint: pass, fail, or not run.

4. Residual risks

- List only if relevant. Otherwise write: None.

Execution rules:

- Prefer the narrowest direct fix over broad redesign.
- Avoid repeating context provided in the request.
- Keep response concise and implementation-focused.

Task:
{{input}}

Examples:

- Fix duplicate rendering in src/PowerRanking.tsx.
- Fix a layout break on small screens in src/App.tsx.
- Fix a TypeScript error introduced by the last change.
