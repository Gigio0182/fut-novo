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

### 5.4 Current Setup Screen Controls (Repository Behavior)

In `src/pages/MatchPage.tsx` team setup step:

- `Start Match` advances to scoring when both teams have at least one athlete.
- `Cancel` aborts current setup and returns to upload/main step.
- Cancel action clears in-progress setup/scoring local state (teams, goals, assists, own-goal events, modal state, and local event timeline).

### 5.5 Navigation Safety (Pending Match Protection)

When a match is in progress (any step between upload completion and success screen), navigating away or refreshing the page triggers a confirmation dialog:

- **Dialog title**: "Cancelar partida?"
- **Dialog message**: Warns user that ongoing match data will be lost.
- **Options**:
  - "Voltar" (Back): Returns to match workflow.
  - "Sair" (Exit): Confirms navigation away or page refresh.
- **Browser close protection**: `beforeunload` event listener warns on tab/window close during active match.
- **Scope**: Applies to steps `teams`, `scoring`, and `awards`. Upload and success steps are unprotected.
- **Implementation**: Context-based state tracking (`PendingMatchContext`) monitors match lifecycle and manages confirmation modal state.

### 5.6 UI Visibility During Configuration

The page title "Craques da Volvo" is conditionally hidden during active match configuration to maximize screen space for team and athlete information:

- **Visible**: Upload step (initial screen) and success step (final screen).
- **Hidden**: Team setup, scoring, and awards steps.
- **Rationale**: Improves content density and readability for team names, athlete lists, and scoring interface on mobile and small viewports.

### 5.7 Team Configuration UI and Instructions

The team setup screen provides clear interaction patterns and guidance optimized for mobile and desktop:

- **Instruction box**: Displays at the top of the teams section with concise guidance text prefixed with bold "Como usar:" label for visual emphasis. Instructions explain: "Clique no nome para mover entre times. Clique no × para remover da partida."
- **Athlete badges**: Each athlete is displayed as a pill/badge component with:
  - Athlete name positioned on the **left side** of the badge (clickable to move to opposite team).
  - Remove button (×) positioned on the **right side** (no visible border).
  - Hover effect on remove button shows red color for clear visual feedback.
  - Clicking the name moves the athlete to the opposite team.
  - Clicking the × removes the athlete from the match entirely.
- **Visual design**: Badges use team-specific colors (Team A: lime/[#d2fc38], Team B: white) to maintain visual distinction.
- **Mobile optimizations**:
  - Main container includes `overflow-y-auto` to allow scrolling on small viewports.
  - Content remains centered with proper viewport height calculation.
  - Responsive grid layout adapts from single column (mobile) to two columns (desktop, md breakpoint).

### 5.8 Match Summary (Súmula) Format

After match completion, a formatted summary is generated for sharing and record-keeping:

**Structure:**
- **Header**: "SÚMULA - [day abbreviation], [date]" (example: "SÚMULA - seg., 27/07/2026")
- **Score line**: "Placar: Time A [goals] x [goals] Time B"
- **Escalações (Lineups)**: List of both teams' athletes with bullet points
  - Format: "* Team Name: athlete1, athlete2, ..."
- **Eventos (Events)**: Sorted list of athletes who contributed (goals/assists)
  - Format: "* Athlete Name ([points] pts) - [details]"
  - Only athletes with goals or assists are included
  - Sorted by points (descending), then by name (ascending)
  - Details show count of goals and assists if applicable
- **Ranking link**: Direct link to the rankings page

**Example:**
```
SÚMULA - seg., 27/07/2026
Placar: Time A 5 x 7 Time B

Escalações
* Time A: Will, GuiR, GuiS, Paulo, Zidas, Otavio, Léo, Rodolfo
* Time B: Walter, Gigio, Grybogi, Lenon, Alan, Nicolas, Wallace

Eventos
* Athlete1 (7 pts) - 2 gols e 1 assist.
* Athlete6 (6 pts) - 1 gol e 2 assist.
* Athlete3 (4.5 pts) - 1 gol e 1 assist.
* Athlete11 (3 pts) - 1 gol.

Ranking
https://fut-novo.vercel.app/ranking
```

**Points Calculation:**
- Base: 0.5 pts
- Each goal: 2.5 pts
- Each assist: 1.5 pts
- MVP award: +3 pts
- Best defender award: +3 pts
- Worst player award: -0.5 pts

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

### 6.1 Current In-Progress UI Event Capture (Repository Behavior)

In the current repository flow (`src/pages/MatchPage.tsx`), scoring events are captured through a per-athlete interaction:

1. User clicks `GOL` on a player row.
2. A modal opens with:

- `Gol contra` checkbox.
- Optional assist picker listing only players from the same team (excluding the scorer).
- `Confirmar` and `Cancelar` actions.

3. On confirm:

- Normal goal -> scorer receives goal and optional assistant receives assist.
- Own goal -> opponent score is incremented by own-goal rule.

4. A visible events list is updated in scoring screen for operator traceability.
5. The newest event row contains a remove action (trash icon) to undo the latest event quickly.
6. Scoring step also exposes `Cancel` beside `Finish Match` to abort current match capture and return to upload/main step.

Current repository cancel behavior note:

- The same cancel action used in setup and scoring clears in-progress local state and returns user to upload step.

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
5. During local UI capture (before finish/save), latest event may be undone in LIFO order; after `finished`, persisted summary is treated as immutable.

## 8. Score and Stats Handling

### 8.1 Score updates

- `goal` increments scoring team.
- `own_goal` increments opponent score.
- Current repository stores own goals in a dedicated `ownGoals` event list in match payload; scoreboard is derived as regular goals + opponent own goals.

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

Current payload note for this repository:

```ts
interface MatchSummaryPayload {
  goals: Array<{ athleteId: string; team: "A" | "B" }>;
  assists: Array<{ athleteId: string; team: "A" | "B" }>;
  ownGoals?: Array<{ athleteId: string; team: "A" | "B" }>;
}
```

### 10.1 Current Post-Finish Summary Export (Repository Behavior)

After a successful match save in `src/pages/MatchPage.tsx` (success step):

1. User can tap `Compartilhar Súmula`.
2. The system generates a text summary with this structure:

- `Súmula do fut - <date/time>`
- `Placar: Time A <goals> x <goals> Time B`
- `Escalações` for Time A and Time B
- `Eventos` with one line per contributing athlete (only who scored and/or assisted), sorted by match points (descending)
- `Prêmios` (MVP, Melhor Defensor, Pior em Campo when present)
- Final reminder line pointing to ranking page URL

3. Points in summary are calculated per athlete using current match rule:

- Base `0.5`
- Goal `+2.5`
- Assist `+1.5`
- MVP `+3`
- Melhor Defensor `+3`
- Pior em Campo `-0.5`

4. Export strategy:

- Prefer Web Share API with plain text payload (`text`) so apps like WhatsApp receive one message.
- Fallback to clipboard copy when share is unavailable.

Summary export is a convenience artifact and does not mutate persisted match or ranking data.

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

Current repository status includes a partial implementation of the lifecycle in UI + Firestore services.

Implemented now:

- Route `/` runs a multi-step match flow (`upload -> teams -> scoring -> awards -> success`).
- Match data is persisted in Firestore collection `matches`.
- Ranking aggregation is applied in Firestore collection `rankings` through transactional updates.
- Goal, assist, MVP, best defender, and bad player counters are accumulated per participant.
- Success step can export/share a text match summary (Súmula) with score, lineups, events, points, and awards.

Not implemented yet (still target behavior from this spec):

- Formal domain states (`draft`, `scheduled`, `in_progress`, `paused`, `finished`, `canceled`) persisted in match model.
- Append-only event store with event IDs, transition guards, and replay.
- Team registry model with `shortCode`, active-state validations, and schedule validation.
- API surface listed in section 14.

Use this document as the target architecture while treating current code as an incremental, simplified baseline.
