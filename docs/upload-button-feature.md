# Upload Button Feature Specification

## 1. Purpose

This document defines the Upload button feature for importing athlete records into the ranking flow.

Current implementation parses user-provided list lines, normalizes names, and avoids duplicate athlete creation.

Target behavior extends this flow to aggregate cumulative stats in a single athlete record when equivalent names are detected.

## 2. Scope

In scope:

- Upload button interaction and file or paste ingestion.
- Parsing athlete names from multiple input line formats.
- Name normalization before persistence or in-memory merge.
- Duplicate detection using normalized name.
- Aggregation of additive metrics (for example goals and assists).
- Validation feedback to the user after upload.

Out of scope:

- Fuzzy matching (nicknames, phonetic comparisons, near spelling).
- Historical migration of old records.
- Global redesign of ranking UI.

## 3. User Story

As a user, I want to upload athlete entries quickly, so that equivalent names with different casing or numbering prefixes are recognized as the same athlete and their stats are merged instead of creating duplicate rows.

## 4. Supported Input Formats

Each row in the uploaded content can contain a name in one of these formats:

- `Joao`
- `1. Joao`
- `1-Joao`
- `1- Joao`

The feature must extract the correct athlete name from all formats above.

## 5. Functional Requirements

### FR-1: Upload trigger

- User clicks Upload button.
- System accepts pasted list input (current).
- File input is optional future extension.

### FR-2: Row parsing

For each input row:

1. Trim leading and trailing spaces.
2. Remove list prefix if present:
   - `^\\d+\\.\\s*` (example: `1. Joao`)
   - `^\\d+-\\s*` (example: `1- Joao` or `1-Joao`)
3. Trim again after prefix removal.
4. Ignore empty rows.

### FR-3: Name normalization

After parsing, normalize the athlete name with this canonical rule:

1. Lowercase entire string.
2. Uppercase first letter.

Examples:

- `joao` -> `Joao`
- `JOAO` -> `Joao`
- `1- jOaO` -> `Joao`

### FR-4: Existence validation and merge

- Use normalized name as lookup key.
- Current implementation: if athlete already exists, it is flagged as duplicate and not inserted again.
- Target behavior: update same record by aggregating additive stats.
- If athlete does not exist, create a new record.

### FR-5: Aggregation behavior

Target behavior for duplicate matches:

- Goals (`g`)
- Assists (`a`)
- Other additive counters used by business rules

For non-additive fields, use deterministic policy:

- Keep first-seen display name (recommended for stability).
- Team field policy is optional and only applicable if a team attribute exists in the consuming view/model.

### FR-6: Ranking compatibility

After merge, ranking list processing remains unchanged and consumes deduplicated records.

### FR-7: User feedback

Current implementation feedback:

- Shows parsed athletes list.
- Highlights duplicates that already exist and indicates they will be ignored.
- Shows actionable error when input is empty or save fails.

Target summary after upload:

- Total rows read
- Valid rows processed
- New athletes inserted
- Existing athletes updated
- Rows ignored (invalid or empty)

## 6. Non-Functional Requirements

- Deterministic behavior: same input always yields same output.
- Low latency for common uploads (for example 50-500 lines).
- Clear error feedback for malformed input.
- No unrelated UI regressions.

## 7. Suggested UI Behavior

### Upload flow

1. User clicks Upload.
2. User pastes list or selects file.
3. User confirms import.
4. System validates and processes rows.
5. System renders success or warning summary.

Current repository UI note:

- Upload screen is constrained to visible viewport area (below sticky header) to avoid empty page scrolling when no extra content exists.
- Athlete input textarea remains vertically scrollable for long pasted lists.

### Button states

- Idle: `Upload`
- Processing: `Uploading...` (disabled)
- Completed: return to idle + show toast or inline message
- Error: return to idle + show actionable message

### Input readability and mobile behavior

- Upload textarea keeps a mobile-friendly input size to avoid persistent browser zoom side effects during paste/edit interactions.
- Leaving the textarea focus should keep overall page scale stable while preserving textarea internal scroll for long content.

## 8. Data Contract (Logical)

Current repository note:

- Upload and match flow run in `src/pages/MatchPage.tsx`.
- Ranking view reads persisted entries from Firestore in `src/pages/RankingPage.tsx`.

The upload feature should converge on a record model equivalent to:

```ts
interface AthleteRecord {
  name: string; // normalized display value, example: "Joao"
  g: number; // goals
  a: number; // assists
  mvp?: number;
  md?: number;
  p?: number;
  pior?: number;
  ptos?: string | number;
}
```

Recommended internal helper fields:

```ts
interface ParsedUploadRow {
  rawLine: string;
  extractedName: string;
  normalizedName: string;
  stats: Partial<AthleteRecord>;
}
```

## 9. Parsing and Merge Rules (Reference)

```ts
function parseName(rawLine: string): string {
  const trimmed = rawLine.trim();
  const withoutPrefix = trimmed
    .replace(/^\d+\.\s*/, "")
    .replace(/^\d+-\s*/, "")
    .trim();

  return withoutPrefix;
}

function normalizeName(name: string): string {
  if (!name) return "";
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
```

## 10. Edge Cases

- Rows with only prefix and no name (`"1-"`, `"2."`) -> ignore.
- Multiple spaces between tokens -> collapse only if business decides; current minimum is trim.
- Multi-word names (`"joao silva"`) -> result `"Joao silva"` with current rule.
- Distinct names that share prefix (`"Joao"` vs `"Joana"`) must not merge.

## 11. Test Plan

### Unit tests

- Parse accepts: `Joao`, `1. Joao`, `1-Joao`, `1- Joao`.
- Normalize produces canonical first-letter uppercase.
- Merge matches by normalized name.

### Integration tests

- Upload rows: `joao`, `JOAO`, `1. joao` -> one athlete with aggregated stats.
- Upload rows: `Joao`, `Joana` -> two distinct athletes.
- Upload with invalid and empty rows -> ignored count reported.

### Manual tests

- Perform upload from UI with mixed formats.
- Verify ranking table shows one merged row for equivalent names.
- Verify summary counts are correct.

## 12. Acceptance Criteria

1. Feature accepts all four input formats and extracts the same name correctly.
2. Equivalent names after normalization merge into one athlete record.
3. Distinct names remain separated.
4. Additive stats are aggregated correctly.
5. Upload result summary is visible and accurate.
6. Build passes after implementation.

## 13. Implementation Notes for Current Repository

- `src/App.tsx` uses routing with `/` for match flow and `/ranking` for ranking page.
- Upload UI is implemented in `src/pages/MatchPage.tsx` using a textarea paste flow.
- Parsing, normalization, duplicate check, and athlete insertion are implemented in `src/lib/athleteService.ts`.
- Duplicate handling currently follows ignore-existing behavior (no stat merge on upload).
- Match save triggers ranking aggregation via `src/lib/matchService.ts`.

## 14. Rollout Checklist

1. Add Upload button UI and input source.
2. Add parse + normalize helper functions.
3. Add merge/upsert function by normalized name.
4. Connect merged data to ranking render path.
5. Add tests for parser and dedup logic.
6. Run `npm run build` and fix regressions.
7. Run `npm run lint` if touched code paths require it.
