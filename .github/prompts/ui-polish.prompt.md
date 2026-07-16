---
mode: agent
description: Polish one focused UI area while preserving existing visual language
tools: ["codebase", "editFiles", "search", "terminal"]
---

You are working in the `Fut_Novo_V2` repository.

Objective:

- Improve one specific UI area for clarity, hierarchy, spacing, responsiveness, or readability with minimal scope.

Workflow:

1. Discovery

- Start from the exact screen, component, or file named in the request.
- Summarize current UI issue and one polish hypothesis in up to 6 lines.
- Identify the smallest set of style/markup changes needed.

2. Implementation

- Preserve established visual language, spacing rhythm, and component structure.
- Make only focused UI changes required by the request.
- Avoid unrelated refactors or theme redesign unless explicitly requested.

3. Validation

- Confirm desktop and mobile behavior for the touched area.
- Run npm run build.
- Run npm run lint if changes touch lint-sensitive patterns.

4. Report

- Return a concise final report using the exact output format below.

Acceptance criteria:

- UI issue is visibly improved in the requested area.
- Layout remains stable on desktop and mobile.
- No unrelated visual regressions introduced.
- Validation results are included.

Output format:

1. UI improvements made

- One short paragraph.

2. Files changed

- path/to/file — one-line reason per file.

3. Validation

- Build: pass or fail.
- Lint: pass, fail, or not run.
- Responsive check: pass or fail.

4. Residual risks
   List only if relevant. Otherwise write: None.

Execution rules:

- Keep polish intentional, subtle, and consistent with existing design language.
- Do not introduce broad redesign patterns unless requested.
- Keep response concise and implementation-focused.

Task:
{{input}}

Examples:

- Improve table readability and spacing in src/PowerRanking.tsx.
- Fix cramped filter tabs on small screens in src/PowerRanking.tsx.
- Improve visual hierarchy in header section of src/App.tsx.
