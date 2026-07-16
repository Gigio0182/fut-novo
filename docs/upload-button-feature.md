# Upload Button Feature Specification

## 1. Purpose

This document defines the Upload button feature for importing athlete records into the ranking flow. The feature must parse user-provided list lines, normalize athlete names, avoid duplicates, and aggregate cumulative stats in a single athlete record.

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
- System accepts list input (paste, file, or both depending on final UI implementation).

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
- If athlete already exists, update same record by aggregating additive stats.
- If athlete does not exist, create a new record.

### FR-5: Aggregation behavior

For duplicate matches, sum additive fields:

- Goals (`g`)
- Assists (`a`)
- Other additive counters used by business rules

For non-additive fields, use deterministic policy:

- Keep first-seen display name (recommended for stability).
- Team field policy must be explicitly chosen by implementation (`keep-first` or `keep-latest`).

### FR-6: Ranking compatibility

After merge, ranking list processing remains unchanged and consumes deduplicated records.

### FR-7: User feedback

After upload, show summary:

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

### Button states

- Idle: `Upload`
- Processing: `Uploading...` (disabled)
- Completed: return to idle + show toast or inline message
- Error: return to idle + show actionable message

## 8. Data Contract (Logical)

This project currently renders static players in `src/PowerRanking.tsx`. The upload feature should converge on a record model equivalent to:

```ts
interface AthleteRecord {
  name: string; // normalized display value, example: "Joao"
  team?: string;
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

- `src/App.tsx` is currently a shell that renders `PowerRanking`.
- `src/PowerRanking.tsx` currently uses static `PLAYERS` data.
- Upload feature likely requires introducing stateful data source and handlers before replacing static list usage.

## 14. Rollout Checklist

1. Add Upload button UI and input source.
2. Add parse + normalize helper functions.
3. Add merge/upsert function by normalized name.
4. Connect merged data to ranking render path.
5. Add tests for parser and dedup logic.
6. Run `npm run build` and fix regressions.
7. Run `npm run lint` if touched code paths require it.
