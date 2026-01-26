# Progress Tracking Implementation Summary

## Overview

Added progress tracking functionality to display the reading progress from Webnovel for imported novels.

## Database Changes

### 1. Migration SQL (`backend/sql/add_progress_columns.sql`)

- Added `progress` column (INTEGER) - chapters read on webnovel
- Added `total_chapters_webnovel` column (INTEGER) - total chapters available on webnovel

### 2. Schema Update (`backend/sql/schema.sql`)

Updated the novels table definition to include:

```sql
total_chapters INTEGER DEFAULT 0,              -- Scraped chapters count
total_chapters_webnovel INTEGER DEFAULT 0,     -- Total chapters on webnovel
progress INTEGER DEFAULT 0,                     -- Chapters read on webnovel
```

## Backend Changes

### 1. Models (`backend/app/models.py`)

Updated the `Novel` model with two new columns:

- `total_chapters_webnovel` - Total chapters on webnovel
- `progress` - Chapters read on webnovel

### 2. Library Parser (`backend/app/services/library_parser.py`)

Enhanced HTML parsing to extract progress information:

- Searches for `<strong class="db ell c_s lh24">` elements
- Extracts progress using regex pattern: `Progress\s+(\d+)/(\d+)`
- Returns `progress` and `total_chapters_webnovel` in novel data

### 3. Library Router (`backend/app/routers/library.py`)

Updated import functionality to:

- Save progress data when creating new novels
- Update progress for existing novels on re-import

## Frontend Changes

### 1. Types (`frontend/src/types/`)

Updated type definitions:

- `shared.ts`: Added `progress` and `total_chapters_webnovel` to Novel interface
- `index.ts`: Updated exports to include new fields

### 2. NovelCard Component (`frontend/src/components/Library/NovelCard.tsx`)

Added progress display:

- Shows webnovel progress when available
- Format: "🌐 Progress on Webnovel: {progress}/{total_chapters_webnovel}"
- Displayed in purple color to distinguish from local progress
- Only shown if both progress > 0 and total_chapters_webnovel > 0

## Usage

### For Users:

1. When importing library HTML from Webnovel, progress is automatically extracted
2. Progress is displayed on novel cards if available
3. Progress updates on re-import of the same library

### For Developers:

To run the migration:

```bash
sqlite3 novels.db < backend/sql/add_progress_columns.sql
```

## Example HTML Format

The parser looks for this format in the imported HTML:

```html
<strong class="db ell c_s lh24">Progress 28/270</strong>
```

Where:

- 28 = chapters read (progress)
- 270 = total chapters available (total_chapters_webnovel)

## Notes

- Progress is optional - novels without progress information will simply not display it
- Existing novels get their progress updated on library re-import
- Progress is separate from scraped chapters count (`total_chapters`)
