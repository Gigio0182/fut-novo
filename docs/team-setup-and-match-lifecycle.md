# Team Setup and Match Lifecycle Specification

## 1. Purpose

This document defines how teams are configured and how a match is processed from creation to final completion (`finished`). It provides implementation-ready rules for data shape, workflow phases, validations, event handling, ranking updates, and auditability.

## 2. Scope

In scope:

- Team setup and registration.
- Match creation and pre-match validation.
- Match runtime event ingestion (goals, cards, substitutions, etc.).
- Match state transitions until completion.
- Finalization logic and post-match updates.
- Error handling and recovery.

Out of scope:

- Tournament bracket generation.
- Cross-season migration.
- Advanced forecasting or simulation.
- Media assets management.

## 3. Core Concepts

- Team: a registered entity that can participate in matches.
- Athlete: player associated with one team for a given match context.
- Match: contest between a home team and an away team.
- Match Event: timestamped action that affects score, stats, discipline, or state.
- Match State: lifecycle stage (`draft`, `scheduled`, `in_progress`, `paused`, `finished`, `canceled`).

## 4. Team Setup

### 4.1 Required Team Fields

Minimum team contract:

```ts
interface Team {
  id: string;
  name: string;
  shortCode: string; // example: MCI, RMA
  active: boolean;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}
```

### 4.2 Team Validation Rules

1. `name` is required and trimmed.
2. `shortCode` is required, uppercase, and unique.
3. A team must be `active` to be scheduled in a new match.
4. Team identity is based on `id`, not display name.

### 4.3 Team Setup Flow

1. Create team record.
2. Validate uniqueness (`shortCode`).
3. Save team.
4. Expose in match creation selector.

## 5. Match Setup

### 5.1 Required Match Fields

```ts
type MatchState =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "paused"
  | "finished"
  | "canceled";

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string; // ISO date-time
  state: MatchState;
  score: {
    home: number;
    away: number;
  };
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 5.2 Match Setup Validation

1. Home and away teams must exist.
2. Home and away teams must be different.
3. Both teams must be active.
4. Initial score starts at `0-0`.
5. Initial state must be `draft` or `scheduled`.

### 5.3 Optional Pre-Match Rosters

```ts
interface MatchRosterEntry {
  matchId: string;
  teamId: string;
  athleteId: string;
  isStarter: boolean;
  shirtNumber?: number;
}
```

Roster validation:

1. Athlete must belong to roster team.
2. Duplicates in same match/team are not allowed.
3. Starter constraints are enforced by business rule (for example max 11).

## 6. Match Lifecycle (Until Finished)

## Phase A - Draft

- Match exists but is not playable yet.
- Teams may still be adjusted.
- No runtime events accepted.

Entry:

- Created manually or by scheduler.

Exit:

- Move to `scheduled` after validation.

## Phase B - Scheduled

- Match is locked for team pairing.
- Runtime events still blocked.
- Start action is enabled.

Entry condition:

- Valid teams and valid schedule.

Exit:

- Start match -> state `in_progress` and set `startedAt`.

## Phase C - In Progress

- Runtime events are accepted.
- Score and player stats update continuously.
- Event stream is append-only.

Accepted event types (minimum set):

- `goal`
- `assist`
- `own_goal`
- `yellow_card`
- `red_card`
- `substitution`
- `mvp_mark`
- `worst_player_mark`
- `pause`
- `resume`
- `finish`

## Phase D - Paused

- Match temporarily halted.
- Normal game events blocked except `resume` or `finish`.

Entry:

- `pause` event from `in_progress`.

Exit:

- `resume` -> back to `in_progress`.
- `finish` -> state `finished`.

## Phase E - Finished

- Match is completed and immutable for normal actions.
- Final score and aggregate stats are persisted.
- Ranking update pipeline is triggered.

Entry:

- `finish` event from `in_progress` or `paused`.
- Set `finishedAt` timestamp.

Exit:

- None (terminal state).

## 7. Match Event Model

```ts
type MatchEventType =
  | "goal"
  | "assist"
  | "own_goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "mvp_mark"
  | "worst_player_mark"
  | "pause"
  | "resume"
  | "finish";

interface MatchEvent {
  id: string;
  matchId: string;
  minute?: number;
  type: MatchEventType;
  teamId?: string;
  athleteId?: string;
  relatedAthleteId?: string; // example assist target or substitution pair
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}
```

Event rules:

1. Events are append-only.
2. Events must reference a valid `matchId`.
3. Team or athlete references must belong to this match context.
4. Events rejected if state does not allow them.

## 8. Score and Stats Handling

### 8.1 Score updates

- `goal` increments scoring team.
- `own_goal` increments opponent score.

### 8.2 Athlete stats updates

Common additive counters per event:

- Goal scorer: `g +1`.
- Assist provider: `a +1` when present.
- MVP markers: `mvp +1`.
- Defensive markers (`md`) or similar counters follow business rules.

### 8.3 Idempotency guard

To avoid duplicate processing:

1. Require unique event `id`.
2. Ignore already-processed event IDs.
3. Keep event processing transaction-safe.

## 9. State Transition Matrix

Allowed transitions:

- `draft -> scheduled`
- `scheduled -> in_progress`
- `in_progress -> paused`
- `paused -> in_progress`
- `in_progress -> finished`
- `paused -> finished`
- `draft -> canceled`
- `scheduled -> canceled`

Rejected transitions (examples):

- `finished -> in_progress`
- `finished -> paused`
- `canceled -> in_progress`

## 10. Finalization (`finished`) Behavior

When finishing a match:

1. Validate match is in `in_progress` or `paused`.
2. Persist `finish` event.
3. Set state to `finished`.
4. Set `finishedAt`.
5. Freeze live event ingestion.
6. Compute and persist final score snapshot.
7. Publish post-match update (for ranking or feed).
8. Return immutable summary payload.

## 11. Ranking Integration

After `finished`, update ranking data in this order:

1. Team-level outcomes (win/draw/loss, goals for/against, points).
2. Athlete-level aggregates (goals, assists, MVP, etc.).
3. Recompute leaderboard sorting.
4. Persist new ranking snapshot.

Minimum consistency rule:

- Ranking update must run once per match completion.

## 12. Error Handling

Expected validation errors:

- Team not found.
- Same team on both sides.
- Event rejected for current state.
- Athlete does not belong to match/team.
- Duplicate event id.

Error response shape (suggested):

```ts
interface DomainError {
  code: string;
  message: string;
  details?: string;
}
```

## 13. Observability and Audit

Recommended logs per transition:

- Match id, previous state, next state.
- Event id and type.
- Processing result (`applied`, `rejected`, `duplicate`).
- Timestamp and actor (user/system).

Audit requirements:

1. Preserve full event history.
2. Preserve final match summary snapshot.
3. Allow replay for diagnostics.

## 14. Suggested API Surface

- `POST /teams`
- `GET /teams`
- `POST /matches`
- `GET /matches/:id`
- `POST /matches/:id/start`
- `POST /matches/:id/events`
- `POST /matches/:id/pause`
- `POST /matches/:id/resume`
- `POST /matches/:id/finish`
- `GET /matches/:id/summary`

## 15. Test Plan

### Unit tests

- Team and match validation rules.
- State transition guards.
- Event application and score calculation.
- Finalization idempotency.

### Integration tests

- End-to-end lifecycle: `scheduled -> in_progress -> finished`.
- Pause and resume branch.
- Duplicate event handling.
- Ranking update triggered once on finish.

### Manual tests

1. Create two teams.
2. Create and schedule a match.
3. Start match.
4. Add goals and assists.
5. Pause and resume.
6. Finish match.
7. Confirm score and ranking updates.

## 16. Acceptance Criteria

1. Team setup validates unique code and active status.
2. Match setup blocks invalid pairings.
3. Runtime events are accepted only in allowed states.
4. Score and athlete counters are correct after event sequence.
5. Match reaches terminal `finished` state and blocks further runtime events.
6. Ranking update executes exactly once after finish.

## 17. Repository Notes

Current project (`src/App.tsx` and `src/PowerRanking.tsx`) renders static ranking data and does not yet implement a full match engine. This document is the target behavior spec to guide future implementation.
