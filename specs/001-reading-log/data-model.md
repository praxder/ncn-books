# Data Model: Reading Log

**Date**: 2025-11-08
**Feature**: Reading Log (001)
**Storage**: IndexedDB via Dexie.js 3.x
**Purpose**: Define the client-side database schema, entities, relationships, validation rules, and state transitions

## Overview

The Reading Log data model consists of four primary entities stored in IndexedDB: Books, Reading Entries, Notes, and User Preferences. All data is stored locally in the browser with no server-side persistence.

**Key Design Principles**:
- **ISBN as Primary Key**: Books are uniquely identified by ISBN (allows same title, different editions)
- **Transactional Integrity**: All mutations use Dex

ie.js transactions
- **Soft Deletes**: No hard deletes; mark as deleted for potential undo functionality
- **Timestamps**: Track creation and last update for all mutable entities

---

## Dexie.js Database Configuration

### Database Name & Version

```typescript
const db = new Dexie('NCNBooksDB');

db.version(1).stores({
  books: 'isbn, title, author, publicationYear',
  readingEntries: '++id, isbn, status, lastUpdated, startedDate, finishedDate',
  notes: '++id, readingEntryId, createdAt, updatedAt',
  preferences: 'key'  // Key-value store for user settings
});
```

**Indexing Strategy**:
- **Primary Keys**: `isbn` (books), auto-increment `++id` (readingEntries, notes), `key` (preferences)
- **Indexed Fields**: Fields used in queries (filtering, sorting)
- **Non-Indexed**: Large text fields (description, note content, cover URLs)

---

## Entity Definitions

### 1. Book

Represents a book with metadata sourced from Google Books API or Open Library API.

**TypeScript Interface**:
```typescript
interface Book {
  // Primary Key
  isbn: string;  // ISBN-10 or ISBN-13 (unique identifier)

  // Core Metadata
  title: string;
  author: string;  // Primary author (comma-separated if multiple)
  publicationYear: number | null;  // Null if unknown

  // Physical Properties
  pageCount: number | null;
  dimensions: {
    height: number | null;   // in centimeters
    width: number | null;    // in centimeters
    thickness: number | null; // in centimeters
  } | null;

  // Digital Properties
  coverImageUrl: string | null;  // URL to cover image (high-res preferred)
  description: string | null;     // Book summary/blurb

  // API Metadata
  googleBooksId: string | null;   // Google Books volume ID
  openLibraryKey: string | null;  // Open Library work key
  source: 'google-books' | 'open-library' | 'manual';  // How book was added

  // Timestamps
  addedAt: Date;  // When book was added to library
}
```

**Dexie.js Schema**:
```typescript
books: 'isbn, title, author, publicationYear'
```

**Validation Rules**:
- `isbn`: Required, non-empty string, regex: `/^(978|979)?[\d\-]{9,13}$/`
- `title`: Required, non-empty string, max 500 chars
- `author`: Required, non-empty string, max 200 chars
- `pageCount`: Optional, positive integer or null
- `dimensions.height/width/thickness`: Optional, positive decimal or null
- `coverImageUrl`: Optional, valid URL or null

**Business Rules**:
- Books with identical ISBN cannot be added (duplicate detection)
- Different editions (different ISBNs) of same title are allowed
- Manual entry allowed when ISBN unavailable (generate synthetic ISBN: `MANUAL-{timestamp}`)

---

### 2. Reading Entry

Represents a user's relationship with a specific book (status, dates, progress).

**TypeScript Interface**:
```typescript
interface ReadingEntry {
  // Primary Key
  id: number;  // Auto-increment

  // Foreign Key
  isbn: string;  // References Book.isbn

  // Reading Status
  status: 'Not Started' | 'Currently Reading' | 'Completed' | 'Did Not Finish';

  // Dates
  startedDate: Date | null;   // When status changed to "Currently Reading"
  finishedDate: Date | null;  // When status changed to "Completed" or "DNF"
  lastUpdated: Date;          // Last time status or dates were modified

  // Future Enhancement (Optional)
  currentPage: number | null;  // Track page progress (P5 feature)
}
```

**Dexie.js Schema**:
```typescript
readingEntries: '++id, isbn, status, lastUpdated, startedDate, finishedDate'
```

**Validation Rules**:
- `isbn`: Required, must reference existing Book
- `status`: Required, one of four enum values
- `startedDate`: Optional, valid Date or null, cannot be in future
- `finishedDate`: Optional, valid Date or null, cannot be before `startedDate`, cannot be in future
- `lastUpdated`: Required, auto-set to current timestamp on any update

**Business Rules**:
- Each book (ISBN) has exactly one Reading Entry
- Status transitions trigger automatic date updates:
  - → "Currently Reading": Set `startedDate` to today if null
  - → "Completed" or "DNF": Set `finishedDate` to today if null
- `lastUpdated` timestamp determines sort order in Library view

**State Transition Diagram**:
```
     ┌──────────────┐
     │ Not Started  │
     └──────┬───────┘
            │
            ↓
  ┌─────────────────────┐
  │ Currently Reading   │
  └────┬───────────┬────┘
       │           │
       ↓           ↓
┌──────────┐  ┌────────────────┐
│Completed │  │ Did Not Finish │
└──────────┘  └────────────────┘

All transitions bidirectional (user can change status freely)
```

---

### 3. Note

Personal annotations for a book.

**TypeScript Interface**:
```typescript
interface Note {
  // Primary Key
  id: number;  // Auto-increment

  // Foreign Key
  readingEntryId: number;  // References ReadingEntry.id

  // Content
  content: string;  // Note text (plain text, max 10,000 chars)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Dexie.js Schema**:
```typescript
notes: '++id, readingEntryId, createdAt, updatedAt'
```

**Validation Rules**:
- `readingEntryId`: Required, must reference existing ReadingEntry
- `content`: Required, non-empty string, max 10,000 chars, plain text only
- `createdAt`: Required, auto-set on creation
- `updatedAt`: Required, auto-set to current timestamp on update

**Business Rules**:
- Multiple notes allowed per Reading Entry (no limit)
- Notes displayed in chronological order (sorted by `createdAt` descending)
- Deleting a Reading Entry cascades to delete all associated Notes

---

### 4. User Preferences

Key-value store for application settings.

**TypeScript Interface**:
```typescript
interface UserPreference {
  // Primary Key
  key: string;  // Preference identifier (e.g., 'readingSpeed', 'theme')

  // Value
  value: any;  // JSON-serializable value

  // Timestamp
  updatedAt: Date;
}
```

**Dexie.js Schema**:
```typescript
preferences: 'key'
```

**Predefined Keys**:
- `readingSpeed`: Number (words per minute, default: 250)
- `defaultSort`: String ('recent' | 'title' | 'author', default: 'recent')
- `theme`: String ('light' | 'dark' | 'system', default: 'system')
- `lastExportDate`: Date (track when user last exported data)

**Validation Rules**:
- `key`: Required, non-empty string
- `value`: Required, must be JSON-serializable
- `updatedAt`: Required, auto-set on update

**Business Rules**:
- Preferences stored in IndexedDB (not localStorage) for consistency
- Defaults applied if preference key not found
- Export does NOT include preferences (only books/entries/notes)

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│      Book       │
│  PK: isbn       │
└────────┬────────┘
         │
         │ 1:1
         │
         ↓
┌─────────────────┐
│ Reading Entry   │
│  PK: id         │
│  FK: isbn       │
└────────┬────────┘
         │
         │ 1:N
         │
         ↓
┌─────────────────┐
│      Note       │
│  PK: id         │
│  FK: readingE..│
└─────────────────┘

┌─────────────────┐
│ User Preference │
│  PK: key        │
│ (standalone)    │
└─────────────────┘
```

### Referential Integrity

- **Book ↔ Reading Entry**: One-to-one (enforced in application logic)
- **Reading Entry ↔ Notes**: One-to-many (cascade delete)
- **No Foreign Key Constraints in IndexedDB**: Integrity enforced in TypeScript services

---

## Data Operations

### Create Operations

**Add Book**:
1. Validate ISBN format and required fields
2. Check if ISBN already exists (reject if duplicate)
3. Create Book record with `addedAt = now()`
4. Create Reading Entry with `status = 'Not Started'`, `lastUpdated = now()`
5. Commit transaction

**Add Note**:
1. Validate `readingEntryId` exists
2. Validate `content` (non-empty, max length)
3. Create Note with `createdAt = now()`, `updatedAt = now()`
4. Update Reading Entry `lastUpdated = now()` (triggers re-sort)

### Update Operations

**Update Reading Status**:
1. Validate new status is one of four enum values
2. If transitioning to "Currently Reading" and `startedDate` is null, set to today
3. If transitioning to "Completed" or "DNF" and `finishedDate` is null, set to today
4. Update `status` and `lastUpdated = now()`

**Edit Note**:
1. Validate `content` (non-empty, max length)
2. Update `content` and `updatedAt = now()`
3. Update Reading Entry `lastUpdated = now()`

### Delete Operations

**Delete Book**:
1. Fetch all Notes for Reading Entry (via `readingEntryId`)
2. Delete all Notes
3. Delete Reading Entry
4. Delete Book
5. Commit transaction (all-or-nothing)

**Delete Note**:
1. Delete Note record
2. Update Reading Entry `lastUpdated = now()`

### Query Operations

**Get All Books (Library View)**:
```typescript
// Default sort: most recently updated first
db.readingEntries
  .orderBy('lastUpdated')
  .reverse()  // Descending
  .toArray()
  .then(entries => {
    const isbns = entries.map(e => e.isbn);
    return db.books.where('isbn').anyOf(isbns).toArray();
  });
```

**Filter by Status**:
```typescript
db.readingEntries
  .where('status').equals('Currently Reading')
  .toArray();
```

**Search by Title**:
```typescript
db.books
  .where('title').startsWithIgnoreCase(searchTerm)
  .toArray();
```

---

## Data Export Format (JSON)

**Export Schema**:
```json
{
  "version": "1.0.0",
  "exportDate": "2025-11-08T12:00:00.000Z",
  "data": {
    "books": [ /* Book[] */ ],
    "readingEntries": [ /* ReadingEntry[] */ ],
    "notes": [ /* Note[] */ ]
  }
}
```

**Import Rules**:
- Validate schema version compatibility
- Detect duplicates by ISBN
- Prompt user for conflict resolution (skip, replace, merge)
- Merge strategy: Combine notes, keep most recent status

---

## IndexedDB Schema Migrations

**Version 1 (Initial)**:
```typescript
db.version(1).stores({
  books: 'isbn, title, author, publicationYear',
  readingEntries: '++id, isbn, status, lastUpdated, startedDate, finishedDate',
  notes: '++id, readingEntryId, createdAt, updatedAt',
  preferences: 'key'
});
```

**Future Version 2 (Example - Current Page Tracking)**:
```typescript
db.version(2).stores({
  // Same as v1, no schema changes needed (adding field to existing table)
}).upgrade(tx => {
  // Add 'currentPage' field to all existing readingEntries
  return tx.table('readingEntries').toCollection().modify(entry => {
    entry.currentPage = null;
  });
});
```

**Migration Best Practices**:
- Never remove indexes without incrementing version
- Always provide `.upgrade()` function for data transformations
- Test migrations with production-like data volumes

---

## Summary

- **4 Tables**: Books, Reading Entries, Notes, User Preferences
- **Primary Keys**: ISBN (books), auto-increment IDs (entries/notes), key (preferences)
- **Relationships**: Book 1:1 Reading Entry 1:N Notes
- **Validation**: TypeScript interfaces + runtime checks in services
- **Integrity**: Application-level enforcement (no DB constraints)
- **Export/Import**: JSON format with schema versioning

**Next Step**: Implement `StorageService` (TypeScript) wrapping Dexie.js database with all CRUD operations documented above.
