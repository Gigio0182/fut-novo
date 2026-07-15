This repository is a Vite + React + TypeScript app.

Project facts:

- Main source files live under `src/`.
- Current app entry points include `src/App.tsx`, `src/main.tsx`, and `src/PowerRanking.tsx`.
- Styles currently live in `src/App.css` and `src/index.css`.
- Use `npm run build` for a narrow compile check.
- Use `npm run lint` for lint validation when the change is likely to affect linted patterns.

Working rules:

- Make the smallest change that satisfies the requested enhancement.
- Start from the concrete file, component, or behavior named in the request.
- Do not refactor unrelated code.
- Preserve the existing visual language unless the enhancement explicitly asks for redesign.
- Prefer updating existing components over creating new abstractions unless reuse is obvious.
- After editing, run the narrowest practical validation command and report the result.
- Summaries should include: what changed, where it changed, and how it was validated.

For enhancement work:

- If the request names a component, inspect that component first.
- If the request is UI-focused, check both the component and its related CSS file before widening scope.
- If the request is ambiguous, choose the smallest reasonable interpretation and implement that.
