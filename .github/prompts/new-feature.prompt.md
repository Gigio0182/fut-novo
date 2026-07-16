---
mode: agent
description: Build one focused feature in this repo
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Implement one clearly scoped feature with minimal impact outside the affected flow.

Workflow:

1. Discovery

- Start from the exact screen, component, file, or behavior named in the request.
- Summarize current behavior and one feature-delivery hypothesis in up to 6 lines.
- Identify the smallest end-to-end code path needed to deliver the feature.

2. Implementation

- Build only what is required for the requested feature.
- Prefer extending existing components and state flow before introducing new abstractions.
- Keep the implementation narrow and avoid unrelated refactors.
- If the feature affects UI, preserve the existing visual language unless explicitly requested otherwise.

3. Validation

- Run the narrowest useful validation command.
- Default: npm run build.
- Run npm run lint when touched files are lint-sensitive.

4. Report

- Return a concise final report using the exact output format below.

Acceptance criteria:

- Requested feature is implemented and observable in the intended flow.
- No unrelated behavior changes were introduced.
- Validation command results are included.

Output format:

1. Feature delivered

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

- Add a team search input to src/PowerRanking.tsx.
- Add a toggle to switch ranking views in src/App.tsx.
- Add a simple empty-state message when no ranking data is available.
