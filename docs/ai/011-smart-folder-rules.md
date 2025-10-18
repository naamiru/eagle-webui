# Smart Folder Rule Expansion

## Objective
- Extend the smart folder parser and evaluator defined in `docs/ai/010-smart-folder.md` / `data/smart-folders.ts` so that Eagle’s rule set can be executed locally.
- Maintain the existing fault-tolerant behaviour: invalid rules are skipped with `console.error`, and processing continues.

## Guardrails
- Update `SmartFolderRule` (and supporting helpers) without regressing the already-implemented `type` and `name` rules.
- When parsing:
  - Reject rules whose `property` is not recognised or whose `method`/`value` payload does not meet the requirements below.
  - Treat string comparisons as case-insensitive unless the section says otherwise; accept values supplied as either strings or numbers. Convert non-string inputs to strings (preserving any whitespace already present on string values) before applying lowercasing for comparisons.
  - For array payloads, coerce each entry to the expected primitive type (string ↔ number conversions allowed). Drop entries that cannot be converted; if nothing valid remains and the rule requires a value, skip the rule.
- When evaluating:
  - Reuse the same `conditions` semantics from `docs/ai/010-smart-folder.md`.
  - Short-circuit quickly (e.g. return `false` as soon as a mandatory criterion fails).
  - Never mutate the source `Item`; operate directly on the existing object without cloning.
- Continue logging issues through the existing `logIssue` helper with a precise message (`Unsupported <property> rule method`, `Invalid <property> rule value`, etc.).
- Add comprehensive unit coverage in `data/smart-folders.test.ts` for each new rule, plus importer coverage where item shape changes are required.

## Shared Helpers To Introduce
- String helpers:
  - `normalizeText(value: string | number): string` → stringified when necessary, lowercased, preserving original whitespace for string inputs.
  - `normalizeStringArray(value: unknown): string[]` → iterate arrays, stringifying convertible entries (numbers allowed) while preserving whitespace on string values; drop everything else.
  - `matchesTextRule(method, candidate, value?, regex?)` to unify the `name`, `url`, `annotation`, `folderName`, and comment comparisons.
- Numeric helpers:
  - `readNumberList(value: unknown): number[]` returning only finite numbers (accept strings or numbers, using `Number.parseFloat` for strings).
  - `compareNumber(method, subject, values)` handling the `>`, `>=`, `=`, `<`, `<=`, `between` semantics (see sections below for exact inclusivity rules).
- Collection helpers:
  - `toStringSet(values: string[]): Set<string>` for set-based comparisons.
  - `hasIntersection(a: Set<string>, b: Set<string>): boolean`.
- Date helpers:
  - Expose a shared constant `DAY_MS = 86_400_000` to keep comparisons consistent.
  - Provide a small utility (or inline check) to ensure rule timestamps are finite numbers before evaluation; otherwise log and skip the rule.

## Rule Specifications

### `tags`
- **Method**: `"union" | "intersection" | "equal" | "identity" | "empty" | "not-empty"`.
- **Value**:
  - Required for `"union" | "intersection" | "equal" | "identity"`: non-empty array of tag strings after normalisation.
  - Ignored for `"empty" | "not-empty"`.
- **Evaluation** (case-sensitive, using the exact tag strings stored in the item metadata):
  - `union`: at least one tag in `value` exists in `item.tags`.
  - `intersection`: every tag in `value` exists in `item.tags`.
  - `equal`: the sets are identical (ignore order, ignore duplicates). Both sides must contain the same unique values.
  - `identity`: none of the tags in `value` appear in `item.tags`.
  - `empty`: `item.tags.length === 0`.
  - `not-empty`: `item.tags.length > 0`.

### `folders`
- Same method/value validation as `tags`, but compare against `item.folders` (case-sensitive folder IDs).
  - `"empty"` and `"not-empty"` inspect `item.folders.length`.

### `folderName`
- **Dependencies**: Reuse the folder map already produced by the importer / store (`Map<string, Folder>`). Thread this map into the smart folder rule helpers (e.g. via the store constructor) so folder names can be resolved without additional global state.
- **Method**: `"contain" | "uncontain" | "startWith" | "endWith" | "equal" | "empty" | "not-empty" | "regex"`.
- **Value**: required for all methods except `"empty"` / `"not-empty"`; parse and normalise as per the `name` rule.
- **Evaluation**:
  - Resolve the set of folders (`Folder` objects) for each `item.folders` entry; ignore ids that are missing in the map.
  - For `"empty"` / `"not-empty"`: rely on `item.folders.length` (after filtering invalid ids). `"empty"` succeeds when the filtered list is empty.
  - For the other methods: succeed when at least one folder name passes the text comparison helper.

### `color`
- **Method**: `"similar" | "accuracy" | "grayscale"`.
- **Value**:
  - `"similar"` / `"accuracy"`: required hex colour `#RRGGBB` (case-insensitive).
  - `"grayscale"`: ignores the value field.
- **Evaluation**:
  - Items without a non-empty `item.palettes` array never match.
  - Weighted distance: convert palette entries into RGB triples and ratios (`ratio / 100` yields each weight). If every ratio is `0`, bail early and treat as no match.
  - Distance metric (redmean):  
    ```
    ΔR = R1 - R2
    ΔG = G1 - G2
    ΔB = B1 - B2
    R̄ = (R1 + R2) / 2
    distance = sqrt((2 + R̄ / 256) * ΔR^2 + 4 * ΔG^2 + (2 + (255 - R̄) / 256) * ΔB^2)
    ```
  - Compute the weighted sum across the palette: `Σ(distance_i * weight_i)`.
  - `"similar"`: match when the total weighted distance `< 150`.
  - `"accuracy"`: match when the total weighted distance `< 100`.
  - `"grayscale"`: every palette entry must be near-neutral. Treat a colour as grayscale when `max(rgb) - min(rgb) <= 8`. All entries must satisfy the condition.

### `createTime`
- **Method**: `"before" | "after" | "between" | "on" | "within"`.
- **Value**: array of numeric values (integers or floats allowed after coercion).
  - `"before" | "after" | "on"`: first element required; ignore extras.
  - `"between"`: first two elements required (start, end); ignore extras. Treat `value[0] > value[1]` as invalid.
  - `"within"`: first element required, interpreted as a positive integer day count.
- **Evaluation**:
  - Compare against `item.modificationTime` (ms).
  - Interpret `"before"`, `"after"`, `"between"`, `"on"` using the raw rule timestamps as provided by Eagle (each already aligned to the user’s local midnight inside the desktop app’s timezone). Avoid recomputing midnight with the browser’s locale.
    - `"before"`: `itemTime < value[0] + DAY_MS`.
    - `"after"`: `itemTime >= value[0]`.
    - `"between"`: inclusive start (`>= value[0]`), exclusive end (`< value[1] + DAY_MS`).
    - `"on"`: same as `"between"` with identical start/end.
  - `"within"`: treat `value[0]` as a non-negative day count; match when `item.modificationTime >= Date.now() - value[0] * DAY_MS`. Values ≤ 0 effectively mean “match everything”.

### `mtime` / `btime`
- Identical method/value rules as `createTime`, but compare against `item.mtime` and `item.btime` respectively.

### `url` / `annotation`
- Same text methods as `name` (including regex semantics), reusing the shared helper.
- `"empty"` / `"not-empty"` operate on the raw string length (whitespace counts as content).
- Inputs should be lowercased during parsing while preserving whitespace; the item values should be lowercased on demand before comparison (except regex, which uses the raw string with the `i` flag).

### `width` / `height`
- **Method**: `">" | ">=" | "=" | "<" | "<=" | "between"`.
- **Value**: numeric array, same requirements as `createTime`.
- **Evaluation**:
  - `"between"`: inclusive on both ends (`min <= value <= max`).
  - Other comparators use standard semantics.

### `fileSize`
- Same methods/value requirements as `width`.
- Additional required field `unit`: `"kb" | "mb" | "gb"`.
- Normalise values to bytes before comparing:
  - `kb` → `value * 1024`
  - `mb` → `value * 1024 * 1024`
  - `gb` → `value * 1024 * 1024 * 1024`
- Always compare against `item.size` (bytes).

### `shape`
- **Method**: `"equal" | "unequal"`.
- **Value**: `"landscape" | "portrait" | "square" | "panoramic-landscape" | "panoramic-portrait" | "custom"`.
- **Evaluation**:
  - Compute aspect ratio using `width` and `height` (floating-point).
  - Interpret shapes as:
    - `landscape`: `width > height`.
    - `portrait`: `height > width`.
    - `square`: `abs(width - height) <= 1`.
    - `panoramic-landscape`: `width >= height * 2`.
    - `panoramic-portrait`: `height >= width * 2`.
    - `custom`: rule must include numeric `width` and `height` fields; match when both dimensions equal the item dimensions exactly.
  - `"unequal"` negates the result of `"equal"`.

### `rating`
- **Method**: `"equal" | "unequal" | "contain"`.
- **Value**: string value (post-normalisation).
- **Evaluation**:
  - Convert `item.star` to string (e.g. `"3"`).
  - `"equal"` / `"unequal"` perform exact string equality.
  - `"contain"` succeeds when the item string includes the rule value substring (case-sensitive).

### `comments`
- **Importer changes**: extend `RawItemMetadata` normalisation to capture the optional `comments` array, storing it on `Item` as:
  ```ts
  type ItemComment = { id: string; annotation: string };
  comments?: ItemComment[];
  ```
- **Method**: same text methods as `annotation`.
- **Value**: string value required except for `"empty" | "not-empty"`.
- **Evaluation**:
  - `"empty"`: matches when `item.comments` is missing or has `length === 0` (annotation content is ignored).
  - `"not-empty"`: matches when `item.comments?.length ?? 0` is greater than zero.
  - Other methods: succeed when any comment annotation passes the text rule.

### `duration`
- Same numeric methods/value rules as `width`.
- Required `unit`: `"s" | "m" | "h"`, converted to seconds (`s → 1`, `m → 60`, `h → 3600`).
- Compare against `item.duration` (seconds). Items with `duration <= 0` never match.

### `fontActivated`
- **Method**: `"activate" | "deactivate"`.
- Eagle’s metadata does not expose the actual activation state; until we have a reliable signal, treat both methods as “is a font item”:
  - Match when `item.fontMetas !== undefined`.
  - During parsing, log a warning for any `fontActivated` rule (e.g. `"fontActivated <method> rule cannot be evaluated; treating as font presence"`).

### `bpm`
- Same numeric methods/value rules as `width`, using `item.bpm`.
- Items with `bpm <= 0` never match.

## Testing Expectations
- Add targeted unit tests in `data/smart-folders.test.ts` covering:
  - Parsing acceptance/rejection for each rule type (including malformed payloads).
  - Evaluation correctness for representative positive/negative cases.
  - Interaction with condition booleans (`boolean: "FALSE"`) where relevant.
- Extend `data/library/import-metadata.test.ts` (or introduce a new dedicated test) to ensure the importer populates `comments` and that the folder map is passed into the smart folder builder.
- If new helpers warrant isolated tests, add them under `data/__tests__/` following the existing Vitest setup.

## Follow-up Notes
- Update type definitions (`data/types.ts`, `data/smart-folders.ts`) and any consumer modules impacted by the new `Item` shape or helper signatures.
- Review UI components that rely on smart folder previews in case additional fields (e.g. comments) demand serialization adjustments.
