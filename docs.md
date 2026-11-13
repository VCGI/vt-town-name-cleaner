# Technical Documentation

## Architecture Overview

The Vermont Town Name Cleaner is a Single Page Application (SPA) built with **React** and **TypeScript**, bundled using **Vite**. It emphasizes client-side processing to ensure data privacy and speed.

### Core Stack

*   **Framework**: React 18
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **File Parsing**: SheetJS (`xlsx`), bundled at build time
*   **Testing**: Vitest
*   **Virtualization**: `@tanstack/react-virtual`
*   **Icons**: Lucide React

## State Management

The application uses a centralized state management approach via `useReducer` located in `reducers/appReducer.ts`.

### Key State Objects

*   **`fileData`**: Raw 2D array of the uploaded spreadsheet.
*   **`lookupData`**: JSON object containing official town metadata and the alias/fuzzy matching dictionary, bundled from `data/vt-town-alias.json` and loaded on demand as its own chunk.
*   **`results`**: Array of `ProcessedRow` objects representing the cleaning status of each row.
*   **`manualOverrides`** & **`ambiguousChoices`**: Dictionaries tracking user interventions.

## Data Processing Pipeline

The core logic is split across three files in `services/`:

*   **`matching.ts`**: Pure matching functions (`preprocess`, `jaroWinkler`, `createMatcher`). No browser APIs, so it is fully unit-tested.
*   **`matchWorker.ts`**: A thin Web Worker entry point that runs a matcher over the unique values.
*   **`matchingService.ts`**: Starts the worker, joins its results back onto the original rows, and applies manual overrides.

1.  **Ingestion**: Files are parsed using SheetJS into a generic 2D array.
2.  **Worker Offloading**: To prevent UI blocking, string matching runs in a **Web Worker** (`matchWorker.ts`, bundled by Vite).
3.  **Matching Logic** (in order; the first step that matches wins):
    *   **Direct Lookup**: The trimmed, lowercased input is checked against the `aliases` dictionary as-is. Normalization only runs if this misses, so a name that already matches is never altered.
    *   **Normalization**: Common abbreviations are expanded (St, Mt, Ft, Jct, N/S/E/W become Saint, Mount, Fort, Junction, North, etc.), and ZIP codes, unit/box prefixes, house numbers, care-of markers, and street names are stripped. A blocklist of generic names (e.g. "west", "boston") is never matched.
    *   **Lookup on the normalized name**, then a **trailing-words** fallback for inputs like "main st peru".
    *   **Fuzzy Matching**: If there is still no match, the **Jaro-Winkler** distance algorithm compares the input against all known aliases. A threshold of `0.85` is used for fuzzy matches.
4.  **Result Aggregation**: The worker returns a map of unique value matches, which is then re-joined with the original row data in the main thread.

## Components

*   **`App.tsx`**: Main container handling initial data fetching and routing between views.
*   **`ProcessingToolbar.tsx`**: Controls for column selection, processing triggers, and export settings.
*   **`DataTable.tsx`**: A virtualized table component capable of rendering thousands of rows efficiently. It handles cell clicking for manual overrides.
*   **`ImportWizard.tsx`**: A UI flow for selecting worksheets and header rows from complex Excel files.
*   **`StatusBadge.tsx`**: Visual indicator for row status (Exact, Fuzzy, Alias, Ambiguous, etc.).

## Data Structures

### `LookupData`
The reference data (`vt-town-alias.json`) structure:
```typescript
interface LookupData {
  towns: Record<string, TownData>; // Key: Official Town Name
  aliases: Record<string, string | { type: 'ambiguous'; options: string[] }>; // Key: Lowercase alias -> Official Name
}
```

### `MatchStatus`
*   `exact`: Input matches official name 1:1.
*   `alias`: Input matches a known village or alternate name (e.g., "Quechee" -> "Hartford").
*   `fuzzy`: Input matches via string distance.
*   `ambiguous`: Input maps to multiple potential towns (e.g., "Barre").
*   `not_found`: No match above threshold.
*   `manual` / `resolved`: User intervention applied.

## Performance Considerations

*   **Virtualization**: The `DataTable` uses windowing to only render rows currently in the viewport, allowing the app to handle datasets with 10k+ rows smoothly.
*   **Memoization**: `useMemo` and `useCallback` are used extensively to prevent unnecessary re-renders during state updates, particularly when filtering the table.
*   **Unique Value Processing**: The Web Worker processes unique values rather than every row. In datasets with high repetition (e.g., state data), this drastically reduces computational load.
