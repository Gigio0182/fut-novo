---
mode: agent
description: Implement one focused enhancement with minimal scope and concise output
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Implement one concrete enhancement with the smallest safe change that satisfies the request.

Workflow:

1. Discovery

- Start from the exact behavior, component, or file named in the request.
- Summarize current behavior and one implementation hypothesis in up to 6 lines.
- Identify the narrowest code path to implement the enhancement.

2. Implementation

- Update only the required logic/UI to deliver the enhancement.
- Preserve existing visual language and architecture unless explicitly requested.
- Do not refactor unrelated code.

3. Validation

- Run the narrowest useful validation command.
- Default: npm run build.
- Also run npm run lint when touched files are lint-sensitive.

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

- path/to/file — one-line reason per file.

3. Validation

- Build: pass or fail.
- Lint: pass, fail, or not run.

4. Residual risks

- List only if relevant. Otherwise write: None.
- Execution rules:

- Prefer direct implementation over abstraction-heavy redesign.
- Avoid repeating context provided in the request.
- Keep response concise and implementation-focused.

Task:
{{input}}

Examples:

- Add a filter by team in src/PowerRanking.tsx.
- Add CSV upload parsing in src/App.tsx.
  Add a compact mobile summary card in src/PowerRanking.tsx.
