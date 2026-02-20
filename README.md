# Vermont Town Name Cleaner

A specialized web utility designed to standardize and clean Vermont town names against official state geographic identifiers. It uses fuzzy matching and a comprehensive alias table to resolve inconsistent data entries to their official municipal counterparts.

## Features

-   **Excel & CSV Support**: Drag and drop `.xlsx`, `.xls`, or `.csv` files.
-   **Intelligent Matching**: Uses Jaro-Winkler distance and a lookup dictionary to handle typos, abbreviations, and village names (e.g., mapping "Quechee" to "Hartford").
-   **Interactive Resolution**:
    -   **Exact Match**: Validated against official town list.
    -   **Alias**: Maps historical names or villages to towns.
    -   **Fuzzy**: Auto-corrects minor spelling errors.
    -   **Ambiguous**: Flags names that could refer to multiple entities (e.g., "Barre" -> City vs. Town).
-   **Data Enrichment**: Optionally append official GEOIDs, County, RPC, and agency codes to the output.
-   **Performance**: Uses Web Workers to process large datasets without freezing the UI and virtualization for rendering large tables.
-   **Privacy**: All processing happens client-side in the browser; no data is uploaded to a server.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:

```bash
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

The app will run at `http://localhost:5173`.

### Build

Create a production build:

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

## Data Sources

This tool utilizes open data provided by the Vermont Center for Geographic Information (VCGI):
-   **Town Boundaries**: [VT Open Geodata Portal](https://geodata.vermont.gov/datasets/3f464b0e1980450e9026430a635bff0a_0/)
-   **Alias Table**: Custom curated list of villages, hamlets, and historical names mapping to official towns.
