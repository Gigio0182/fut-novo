# Ranking Page Specification

## 1. Purpose

This document defines the functional and visual behavior of the Ranking page. It covers page layout, data contracts, sorting and filtering behavior, rendering rules, responsiveness, accessibility, and integration with upload and match lifecycle features.

## 2. Current Implementation Context

The current Ranking page is rendered by `src/PowerRanking.tsx`, mounted in `src/pages/RankingPage.tsx`, and routed from `src/App.tsx`.

Current state:

- Data is loaded from Firestore collection `rankings` ordered by `points` descending.
- Loading and empty states are implemented in `RankingPage`.
- Tabs are functional and re-order rows in-memory by metric.
- Ranking rows are rendered with top-3 highlight rules.
- Ranking updates are persisted via match save flow (`saveMatch` + `updateRankings`).

This specification defines both current expected behavior and target behavior for future iterations.

## 3. User Story

As a user, I want to view the athlete ranking table with clear stats and position highlights, so that I can quickly identify top performers and compare players.

## 4. Scope

In scope:

- Ranking page structure and UI behavior.
- Row rendering and top-3 visual emphasis.
- Tab behavior and filtering contract.
- Sorting logic and ranking consistency.
- Empty, loading, and error states.
- Integration points with upload and match lifecycle data.

Out of scope:

- Authentication and permissions.
- Multi-page routing architecture.
- League/tournament management screens.

## 5. Page Composition

The page has five sections:

1. Status bar (mobile mock shell).
2. Header with page title (`Craques da Volvo`).
3. Horizontal tabs for ranking views.
4. Ranking table with fixed header and scrollable rows.
5. Footer legend explaining metric abbreviations.

## 6. Data Contract

Minimum ranking item shape:

```ts
interface RankingPlayer {
  rank: number;
  name: string;
  team: string;
  g: number; // goals
  a: number; // assists
  mvp: number; // MVP count
  mvpHL: boolean; // MVP visual highlight
  md: number; // best defender or defensive metric
  p: number; // matches played
  pior: number; // worst player count
  ptos: string; // total points (string in current UI)
}
```

Target recommendation for future calculations:

```ts
interface RankingPlayerTarget {
  rank: number;
  name: string;
  team: string;
  g: number;
  a: number;
  mvp: number;
  md: number;
  p: number;
  pior: number;
  ptos: number; // numeric for sorting correctness
}
```

## 7. Rendering Rules

### 7.1 Top-3 treatment

For rows with `rank <= 3`:

- Use medal-style rank badge with color map:
  - 1: gold
  - 2: silver
  - 3: bronze
- Apply special row background and border accent.
- Render points (`ptos`) using accent color.

For `rank > 3`:

- Use alternating row background.
- Render rank as plain mono text.

### 7.2 Cell columns

Table columns and order:

1. `Pos`
2. `Player`
3. `G`
4. `A`
5. `MVP`
6. `MD`
7. `P`
8. `Pior`
9. `Ptos`

### 7.3 MVP emphasis

- If `mvpHL = true`, MVP value appears with highlighted chip style.
- Otherwise render muted value style.

## 8. Ranking Behavior

### 8.1 Sorting source of truth

Current implementation:

1. Base dataset arrives pre-sorted from Firestore by `points` descending.
2. Tab `Todos Jogadores` keeps incoming order.
3. Other tabs sort by selected metric (`g`, `a`, `md`, `p`) descending.
4. Visual position is recalculated from list index in the rendered view.

Target behavior (future hardening):

1. Sort by `ptos` descending.
2. Tie-breaker 1: `g` descending.
3. Tie-breaker 2: `a` descending.
4. Tie-breaker 3: `name` ascending.

After sorting, recompute `rank` sequentially.

### 8.2 Data consistency checks

- `rank` must match visual order.
- Numeric fields must not be `NaN`.
- Missing optional metrics default to zero.

## 9. Tabs and Filter Contract

Current tabs:

- `Todos Jogadores`
- `Goleadores`
- `Garçons`
- `Defensores`
- `Participações`

Target behavior per tab:

1. `Todos Jogadores`: full sorted dataset.
2. `Goleadores`: sorted by goals (`g`) descending.
3. `Garçons`: sorted by assists (`a`) descending.
4. `Defensores`: sorted by defensive metric (`md`) descending.
5. `Participações`: sorted by matches played (`p`) descending.

Rules:

- Active tab has accent styling.
- Tab change must not mutate source dataset.
- Filters apply in-memory to current ranking snapshot.

## 10. States

### 10.1 Loading

Display skeleton rows or loader when data is fetching.

### 10.2 Empty

If dataset is empty:

- Show empty-state message.
- Keep table header visible for orientation.

### 10.3 Error

Target behavior:

- Show inline error message.
- Provide retry action.

Current note:

- Explicit Firestore subscription error UI is not implemented yet.

## 11. Integration Points

### 11.1 Upload integration

Current implementation:

- Upload flow stores new athletes and flags duplicates.
- Existing duplicate names are currently ignored at athlete creation step.
- Ranking rows are updated by match finalization and ranking transaction writes.

Target behavior:

- Parsed and normalized athletes merge into ranking dataset.
- Duplicate names (after normalization) aggregate stats in one record.
- Ranking recomputation runs after merge.

Reference: `docs/upload-button-feature.md`.

### 11.2 Match lifecycle integration

From match finalization:

- `finished` match emits aggregated stat updates.
- Ranking updates exactly once per finished match.
- Page refreshes to show latest standings.

Reference: `docs/team-setup-and-match-lifecycle.md`.

## 12. Accessibility Requirements

1. Ensure sufficient text contrast in all row states.
2. Tabs must be keyboard reachable and have focus styles.
3. Decorative icons/images should have empty alt or aria-hidden.
4. Table semantics should be preserved or replicated for assistive tech.

## 13. Responsiveness Requirements

Current layout targets mobile dimensions (`402 x 903` style shell). Target behavior:

1. On narrow screens, maintain horizontal readability without clipped key values.
2. On wide screens, allow centered card while preserving internal spacing.
3. Keep header and legend readable at all breakpoints.

## 14. Performance Requirements

1. Rendering should remain smooth for typical list sizes (50-500 players).
2. Avoid expensive recomputation on every render.
3. Memoize derived sorted/filtered lists when dynamic data is introduced.

## 15. Suggested Component Boundaries

Recommended structure for maintainability:

- `RankingPage`
- `RankingHeader`
- `RankingTabs`
- `RankingTableHeader`
- `RankingRow`
- `RankingLegend`

Current file `src/PowerRanking.tsx` can be progressively split as complexity grows.

## 16. Test Plan

### Unit tests

- Sorting and tie-breaker correctness.
- Tab-specific ordering logic.
- Rank recomputation after sorting.
- Top-3 style condition flags.

### Integration tests

- Data from upload updates ranking correctly.
- Data from finished match updates ranking once.
- Empty and error states render correctly.

### Manual tests

1. Verify all columns and values align correctly.
2. Verify top-3 visual highlight behavior.
3. Verify each tab changes order as expected.
4. Verify mobile and desktop readability.

## 17. Acceptance Criteria

1. Ranking page displays all required columns and legend definitions.
2. Top-3 rows receive expected highlight treatment.
3. Sorting and tie-breakers are deterministic.
4. Tabs apply correct view behavior.
5. Empty/loading/error states are handled.
6. Upload and match-finish integrations can update ranking data without duplicates.

## 18. Implementation Notes for This Repository

- `src/App.tsx` uses router paths `/` (match flow) and `/ranking` (ranking view).
- `src/pages/RankingPage.tsx` subscribes to Firestore rankings and maps entries to `PowerRanking` props.
- `src/PowerRanking.tsx` is presentation-heavy and now includes tab-based sort behavior.
- Next increment should add explicit error state handling and deterministic tie-breakers in ranking sort logic.
