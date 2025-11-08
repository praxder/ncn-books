# Feature Specification: Reading Log

**Feature Branch**: `001-reading-log`
**Created**: 2025-11-08
**Status**: Draft
**Input**: User description: "Reading Log – A website book log that tracks current reads, completion status, and personal notes. Similar to GoodReads but more focused on data and statistics and graphs. Allows users to add books, update reading status of books, and view statistics for a single book and all books combined (like total number of pages, total physical size of books, approx reading time, etc.). When adding a book, the user should only be required to input the books title, and optionally the author, and then the website should search and pull matching books from online that match those criteria, and ask the user to select which one to add. The app should have an export and import functionality."

## Clarifications

### Session 2025-11-08

- Q: Can a user add the same book to their reading log multiple times (e.g., different editions or formats)? → A: Yes - Allow if different editions/formats (different ISBN)
- Q: Which book metadata API should the system use? → A: Google Books primary, Open Library fallback
- Q: How should books be organized/sorted in the main library view by default? → A: Recently updated first (most recently added/modified)
- Q: Where should user reading log data be stored? → A: Browser-based storage (localStorage/IndexedDB)
- Q: How many book search results should be displayed at once? → A: Top 20 results with "load more" option

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Book to Reading Log (Priority: P1)

Users can quickly add books to their reading log by searching with minimal input (just a title), selecting from matching results, and having the book added to their collection with complete metadata.

**Why this priority**: This is the foundation of the entire application. Without the ability to add books, no other features can function. This represents the minimum viable product that delivers immediate value.

**Independent Test**: Can be fully tested by entering a book title, selecting from search results, and verifying the book appears in the user's reading log with complete metadata (title, author, page count, etc.). Delivers value by allowing users to start building their book collection.

**Acceptance Scenarios**:

1. **Given** I am on the reading log homepage, **When** I enter a book title "The Hobbit" and click search, **Then** I see the top 20 matching books with cover images, authors, and publication details, with a "Load More" button if additional results exist
2. **Given** I see search results for "The Hobbit", **When** I select "The Hobbit by J.R.R. Tolkien (1937 edition)" and click "Add to Log", **Then** the book is added to my reading log with default status "Not Started" and I am redirected to my library view showing the newly added book at the top
3. **Given** I am adding a book, **When** I enter both title "1984" and author "George Orwell", **Then** the search results are filtered to show only books by that author
4. **Given** I search for "zzxqxqxqx nonexistent book", **When** no matches are found, **Then** I see a friendly message "No books found. Try a different search term" with the option to add a book manually

---

### User Story 2 - Track Reading Status and Progress (Priority: P2)

Users can update the reading status of books in their log (Not Started, Currently Reading, Completed, Did Not Finish) and add personal notes to track thoughts, quotes, or reading dates.

**Why this priority**: This is the core "log" functionality that differentiates this from a simple wishlist. Once users can add books (P1), tracking their reading journey is the next most valuable feature.

**Independent Test**: Can be fully tested by adding a book, changing its status from "Not Started" to "Currently Reading" to "Completed", adding personal notes, and verifying all changes persist. Delivers value by helping users organize and remember their reading experience.

**Acceptance Scenarios**:

1. **Given** I have a book in my log with status "Not Started", **When** I click the status dropdown and select "Currently Reading", **Then** the book's status updates and a "Started On" date is automatically recorded as today
2. **Given** I am viewing a book with status "Currently Reading", **When** I click "Add Note" and enter "Great character development in chapter 5", **Then** the note is saved with a timestamp and appears in the book's notes section
3. **Given** I have a book in "Currently Reading" status, **When** I change the status to "Completed", **Then** the book is marked complete, a "Finished On" date is recorded, and I am prompted to optionally add a final note or rating
4. **Given** I have multiple books in my log, **When** I filter by status "Currently Reading", **Then** I see only books with that status

---

### User Story 3 - View Statistics and Insights (Priority: P3)

Users can view comprehensive statistics for individual books and aggregate statistics across their entire reading log, including page counts, physical book dimensions, estimated reading time, and visual graphs showing reading trends.

**Why this priority**: This is the key differentiator from GoodReads that the user specifically requested. With books added (P1) and status tracked (P2), statistics provide the analytical value that makes the app unique.

**Independent Test**: Can be fully tested by adding multiple books with different statuses, navigating to the statistics view, and verifying accurate calculations for total pages, book dimensions, reading time, and visual graphs. Delivers value by providing insights into reading habits and accomplishments.

**Acceptance Scenarios**:

1. **Given** I have 5 books in my log (2 completed, 2 currently reading, 1 not started), **When** I navigate to "My Statistics", **Then** I see an overview dashboard with total books (5), completed (2), in progress (2), total pages read, and a pie chart showing status distribution
2. **Given** I am viewing my statistics dashboard, **When** I look at the "Reading Metrics" section, **Then** I see total pages across all books, total physical shelf space (in both cm and inches), and estimated total reading time based on average reading speed
3. **Given** I am viewing a single book's detail page, **When** I scroll to the statistics section, **Then** I see book-specific data: page count, physical dimensions, estimated reading time for this book, and when I started/finished it
4. **Given** I have completed books over several months, **When** I view the "Reading Trends" graph, **Then** I see a line or bar chart showing books completed per month and pages read per month

---

### User Story 4 - Export and Import Reading Data (Priority: P4)

Users can export their entire reading log (books, statuses, notes) to a file for backup or migration, and import reading data from a previously exported file to restore or transfer their collection.

**Why this priority**: This provides data portability and backup security, important for user trust but not critical for initial launch. Can be added after core reading features are proven.

**Independent Test**: Can be fully tested by creating a reading log with books and notes, exporting to a file, clearing the log, importing from the file, and verifying all data is restored accurately. Delivers value by giving users confidence their data is safe and portable.

**Acceptance Scenarios**:

1. **Given** I have 10 books in my reading log with various statuses and notes, **When** I click "Export Data" and choose JSON format, **Then** a file "ncn-books-export-2025-11-08.json" downloads containing all my books, statuses, notes, and dates
2. **Given** I have an exported data file, **When** I click "Import Data", select the file, and confirm the import, **Then** all books, statuses, and notes from the file are added to my reading log (with duplicate detection)
3. **Given** I am importing data, **When** the file contains a book already in my log, **Then** I am prompted to choose: skip, replace, or merge the data
4. **Given** I attempt to import an invalid file, **When** the file format is incorrect, **Then** I see an error message "Invalid file format. Please upload a valid NCN Books export file" and no data is changed

---

### Edge Cases

- What happens when a book search API is unavailable or rate-limited?
  - System automatically attempts Open Library if Google Books API fails or is rate-limited; if both APIs unavailable, display friendly error message and allow manual book entry
- How does the system handle books with missing metadata (no page count, dimensions, etc.)?
  - Allow users to optionally enter missing data manually; statistics calculate based on available data only
- What happens when importing data that conflicts with existing data?
  - Provide conflict resolution UI: skip duplicate, replace existing, or merge notes
- How are physical book dimensions handled for ebooks or audiobooks?
  - Mark dimension as "N/A - Digital" and exclude from physical shelf space calculations
- What happens if a user adds the same book twice manually?
  - System allows different editions/formats (different ISBNs) of the same title; warns only if identical ISBN already exists in log
- How is estimated reading time calculated for users with different reading speeds?
  - Use industry average (250 words per minute / ~60 pages per hour) as default; allow users to customize in settings
- What happens if user clears browser data or switches browsers?
  - Data stored in browser storage is lost; users must rely on previously exported backup files and use import feature to restore data. System should display a prominent reminder encouraging regular exports
- What happens if browser storage quota is exceeded?
  - Display warning when approaching storage limits; prompt user to export and optionally delete old completed books to free space

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to search for books by entering a title (required) and optionally an author name
- **FR-002**: System MUST retrieve matching books from Google Books API (primary source) and display top 20 results with cover image, title, author, and publication year; provide "Load More" button to show additional results in batches of 20; if Google Books API fails, automatically retry with Open Library API
- **FR-003**: System MUST allow users to select a book from search results and add it to their reading log
- **FR-004**: System MUST store book metadata including title, author, ISBN, page count, physical dimensions, cover image URL, and publication details
- **FR-005**: System MUST support reading statuses: Not Started, Currently Reading, Completed, and Did Not Finish (DNF)
- **FR-006**: Users MUST be able to update a book's reading status from any status to any other status
- **FR-007**: System MUST automatically record dates when status changes to "Currently Reading" (started date) and "Completed" (finished date)
- **FR-008**: Users MUST be able to add, edit, and delete personal notes for each book
- **FR-009**: System MUST display aggregate statistics including: total books, books by status, total pages (all books), total pages read (completed books only), total physical shelf space, and estimated reading time
- **FR-010**: System MUST display individual book statistics including: page count, physical dimensions, estimated reading time, and reading dates
- **FR-011**: System MUST provide visual graphs showing: status distribution (pie chart), reading trends over time (line/bar chart), and pages read per month
- **FR-012**: Users MUST be able to export their entire reading log to a downloadable file in JSON format
- **FR-013**: Users MUST be able to import reading data from a previously exported file
- **FR-014**: System MUST detect duplicate books (by ISBN) during import and provide conflict resolution options; different editions/formats with different ISBNs are allowed
- **FR-015**: System MUST validate imported file format and reject invalid files with clear error messages
- **FR-016**: Users MUST be able to filter their reading log by status (show only Currently Reading, Completed, etc.)
- **FR-017**: Library view MUST display books sorted by most recently updated (added or modified) first by default, with the option to change sort order
- **FR-018**: System MUST persist all user data (books, reading entries, notes) in browser storage using localStorage for preferences and IndexedDB for structured book data
- **FR-019**: System MUST handle missing book metadata gracefully by displaying "Not Available" for missing fields and excluding from relevant statistics
- **FR-020**: System MUST provide manual book entry option when search fails or for books not in online databases

### Key Entities *(include if feature involves data)*

- **Book**: Represents a book in the user's reading log
  - Core attributes: title, author, ISBN (uniqueness identifier - different editions have different ISBNs), page count, physical dimensions (height, width, thickness), cover image URL, publication year
  - Relationships: belongs to one User, has many Notes
  - Uniqueness: ISBN serves as the unique identifier; users can have multiple books with the same title but different ISBNs (e.g., hardcover vs ebook editions)

- **Reading Entry**: Represents a user's relationship with a specific book
  - Core attributes: status (Not Started, Currently Reading, Completed, DNF), started date, finished date, last updated timestamp
  - Relationships: belongs to one User and one Book
  - Sorting: Last updated timestamp determines default display order in library view

- **Note**: Personal annotations for a book
  - Core attributes: text content, created timestamp, updated timestamp
  - Relationships: belongs to one Reading Entry

- **User**: Individual using the reading log
  - Core attributes: unique identifier, reading preferences (e.g., custom reading speed for time estimates)
  - Relationships: has many Reading Entries

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a book to their reading log in under 30 seconds from homepage to confirmation
- **SC-002**: Book search returns initial 20 results within 3 seconds for 95% of queries; "Load More" requests return within 2 seconds
- **SC-003**: Statistics dashboard loads and displays all metrics within 2 seconds for libraries up to 1,000 books
- **SC-004**: 90% of users successfully add their first book without assistance or documentation
- **SC-005**: Data export completes within 5 seconds for libraries up to 500 books
- **SC-006**: Data import with conflict resolution completes within 10 seconds for files containing up to 500 books
- **SC-007**: Users can update book status and add notes in under 15 seconds
- **SC-008**: Statistics accurately calculate totals with zero margin of error for all numerical metrics
- **SC-009**: Visual graphs render correctly and are interactive (hover for details) on both desktop and mobile devices
- **SC-010**: System handles book search API failures gracefully with clear user messaging and fallback to manual entry

## Assumptions

- Book metadata will be sourced from Google Books API (primary) with Open Library as fallback; both provide ISBN, page counts, cover images, and physical dimensions
- Average reading speed is 250 words per minute (~60 pages per hour) for estimated reading time calculations
- Physical dimensions are stored in metric (cm) and displayed in both metric and imperial (inches)
- Users will primarily access the application via web browsers (desktop and mobile responsive design)
- Each user's reading log is private and not shared with other users
- User data is stored client-side in browser storage (localStorage for simple data, IndexedDB for structured data and larger datasets)
- Data persistence relies on browser storage; users are responsible for exporting backups via the export feature
- Export file format is JSON for maximum data portability and human readability
- Books without ISBN (very old books, self-published) can still be added with reduced metadata
- Notes are plain text without rich formatting (no markdown, images, etc.) for MVP
- Statistics update in real-time when reading entries are modified
- The application supports a single user initially (multi-user support is future enhancement)
- No server-side backend or user authentication required for MVP

## Out of Scope

The following are explicitly **not** included in this feature:

- Social features (sharing reading lists, following other users, book recommendations from friends)
- Book ratings or reviews intended for public consumption
- Integration with e-reader devices or apps to track reading progress automatically
- Book purchase links or e-commerce functionality
- Book club or discussion forum features
- Advanced search filters (by genre, publication date range, publisher, etc.)
- Reading goals or challenges (e.g., "Read 50 books this year")
- Mobile native applications (iOS/Android apps) - web-only for this feature
- User authentication system (assumed to exist separately or to be added in future phase)
