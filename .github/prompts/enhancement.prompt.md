---
mode: agent
description: Implement one focused enhancement in this repo
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Implement one concrete enhancement with minimal impact outside the affected flow.

Workflow:

1. Discovery

- Start from the exact screen, component, file, or behavior named in the request.
- Summarize current behavior and one enhancement hypothesis in up to 6 lines.
- Identify the smallest set of code changes needed.

2. Implementation

- Make only focused code and UI changes required by the request.
- Preserve established visual language, spacing rhythm, and component structure.
- Do not refactor unrelated code.

3. Validation

- Run the narrowest useful validation command.
- Default: npm run build.
- Run npm run lint when touched files are lint-sensitive.

4. Report

- Return a concise final report using the exact output format below.

Acceptance criteria:

- Requested enhancement is implemented and observable.
- No unrelated behavior changes were introduced.
- Validation command results are included.

Output format:

1. What changed

- One short paragraph.

2. Files changed

- path/to/file -- one-line reason per file.

3. Validation

- Build: pass or fail.
- Lint: pass, fail, or not run.

4. Residual risks

- List only if relevant. Otherwise write: None.

Execution rules:

- Prefer direct implementation over broad redesign.
- Avoid repeating context provided in the request.
- Keep response concise and implementation-focused.

Task:
{{input}}

Examples:

- Add a filter by team in src/PowerRanking.tsx.
- Add CSV upload parsing in src/App.tsx.
- Add a compact mobile summary card in src/PowerRanking.tsx.
