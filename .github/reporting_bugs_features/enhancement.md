Enhancement
Prompt to use in chat
/enhancement

Text structure

Current situation:
What should be added:
Business rule:
Affected scope (files/components):
Acceptance criteria:
Constraints (optional):

Required sources

Use #file:docs/upload-button-feature.md
Use #file:docs/team-setup-and-match-lifecycle.md
Use #file:docs/ranking-page-specification.md

Execution rules

Treat the files above as source of truth.
Implement only the requested delta.
Preserve current layout and architecture unless explicitly requested otherwise.
If ambiguous, choose the lowest-impact option and state it in the final summary.

Expected response format

1. What was added
2. Files changed
3. Validation performed
4. Residual risks

Example
Current situation: ranking has no team filter.
What should be added: add a team filter at the top of the table.
Business rule: selecting one team filters the list without mutating base data.
Affected scope: src/PowerRanking.tsx.
Acceptance criteria:
Filter applies and clears correctly.
Ranking returns to initial state after clearing filter.
Constraints: keep current layout.
