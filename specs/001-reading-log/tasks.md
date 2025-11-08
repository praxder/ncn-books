# Tasks: Reading Log

**Input**: Design documents from `/specs/001-reading-log/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md project structure:
- Angular source: `src/app/`
- Core services: `src/app/core/services/`
- Models: `src/app/core/models/`
- Features: `src/app/features/`
- Shared: `src/app/shared/`
- Tests: Co-located `*.spec.ts` files + `cypress/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Angular structure

- [X] T001 Create Angular 17+ workspace with standalone components using `ng new ncn-books --standalone --routing --style=scss`
- [X] T002 Install core dependencies: Dexie.js 3.x, dexie-angular 1.x, Angular Material 17+, Tailwind CSS 3.x, Chart.js 4.x, ng2-charts
- [X] T003 [P] Configure Tailwind CSS: create `tailwind.config.js`, update `src/styles.scss` with Tailwind imports
- [X] T004 [P] Configure Angular Material: run `ng add @angular/material`, select Indigo/Pink theme, enable typography and animations
- [X] T005 [P] Create directory structure per plan.md: `src/app/core/`, `src/app/features/`, `src/app/shared/`
- [X] T006 [P] Configure environment files: `src/environments/environment.ts` and `src/environments/environment.prod.ts` with Google Books API base URL
- [X] T007 [P] Setup GitHub Actions workflow: create `.github/workflows/deploy.yml` for GitHub Pages deployment
- [X] T008 [P] Configure `angular.json` for production build with base-href `/ncn-books/` for GitHub Pages
- [X] T009 Initialize Git repository and create initial commit with project scaffold

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 [P] Create Book model interface in `src/app/core/models/book.model.ts` with all fields per data-model.md
- [X] T011 [P] Create ReadingEntry model interface in `src/app/core/models/reading-entry.model.ts` with status enum
- [X] T012 [P] Create Note model interface in `src/app/core/models/note.model.ts`
- [X] T013 [P] Create UserPreference model interface in `src/app/core/models/user-preference.model.ts`
- [X] T014 Initialize Dexie.js database in `src/app/core/services/db.service.ts` with schema version 1 per data-model.md
- [X] T015 Create StorageService in `src/app/core/services/storage.service.ts` with CRUD operations for Book, ReadingEntry, Note tables using Dexie.js transactions
- [X] T016 [P] Create shared LoadingSpinnerComponent in `src/app/shared/components/loading-spinner.component.ts` using mat-progress-spinner
- [X] T017 [P] Create shared ErrorMessageComponent in `src/app/shared/components/error-message.component.ts` for displaying error states
- [X] T018 [P] Create shared ConfirmationDialogComponent in `src/app/shared/components/confirmation-dialog.component.ts` using mat-dialog
- [X] T019 Configure routing in `src/app/app.routes.ts` with lazy-loaded feature routes for library, search, detail, statistics, settings
- [X] T020 Create root AppComponent in `src/app/app.component.ts` with navigation toolbar using mat-toolbar and router-outlet

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Book to Reading Log (Priority: P1) 🎯 MVP

**Goal**: Users can search for books by title (and optionally author), view top 20 results with metadata, select a book, and add it to their reading log with automatic metadata population.

**Independent Test**: Enter "The Hobbit" in search, select from results, verify book appears in library with status "Not Started", cover image, author, and page count. Delivers MVP value by enabling users to start building their book collection.

### Implementation for User Story 1

#### Book API Integration

- [ ] T021 [P] [US1] Create GoogleBooksApiService in `src/app/core/services/google-books-api.service.ts` with search method, field mapping per contracts/google-books-api.md
- [ ] T022 [P] [US1] Create OpenLibraryApiService in `src/app/core/services/open-library-api.service.ts` with search method, field mapping per contracts/open-library-api.md
- [ ] T023 [US1] Create BookApiService in `src/app/core/services/book-api.service.ts` with waterfall fallback pattern (Google Books → Open Library → empty array)
- [ ] T024 [US1] Add debouncing (500ms), caching, and retry logic to BookApiService using RxJS operators (debounceTime, retry, catchError, shareReplay)
- [ ] T025 [US1] Implement ISBN extraction utility function in BookApiService to prefer ISBN-13 over ISBN-10
- [ ] T026 [US1] Implement dimension parsing utility in BookApiService to extract numeric values from "20.3 cm" format strings

#### Search UI

- [ ] T027 [P] [US1] Create SearchComponent in `src/app/features/book-search/search.component.ts` with mat-form-field for title (required) and author (optional)
- [ ] T028 [US1] Implement reactive form with valueChanges debouncing in SearchComponent, calling BookApiService on input changes
- [ ] T029 [P] [US1] Create SearchResultsComponent in `src/app/features/book-search/search-results.component.ts` to display top 20 books with cover, title, author, year
- [ ] T030 [US1] Implement "Load More" button in SearchResultsComponent for pagination (fetch next 20 results with startIndex offset)
- [ ] T031 [US1] Add empty state UI in SearchResultsComponent displaying "No books found" message with link to manual entry option
- [ ] T032 [P] [US1] Create ManualEntryComponent in `src/app/features/book-search/manual-entry.component.ts` with form for manual book metadata entry
- [ ] T033 [US1] Implement synthetic ISBN generation in ManualEntryComponent using pattern `MANUAL-{timestamp}` for books without ISBN

#### Add Book Logic

- [ ] T034 [US1] Create ReadingLogService in `src/app/core/services/reading-log.service.ts` with addBook method
- [ ] T035 [US1] Implement ISBN duplicate detection in ReadingLogService.addBook() querying StorageService
- [ ] T036 [US1] Implement transaction logic in ReadingLogService.addBook() to create Book + ReadingEntry with status "Not Started" atomically
- [ ] T037 [US1] Add "Add to Log" button to each search result in SearchResultsComponent calling ReadingLogService.addBook()
- [ ] T038 [US1] Implement success/error handling in SearchComponent displaying toast notifications using mat-snack-bar
- [ ] T039 [US1] Add navigation to library view after successful book addition in SearchComponent

#### Library View

- [ ] T040 [P] [US1] Create LibraryComponent in `src/app/features/library/library.component.ts` displaying all books sorted by lastUpdated descending
- [ ] T041 [P] [US1] Create BookCardComponent in `src/app/features/library/book-card.component.ts` using mat-card to display book cover, title, author, status
- [ ] T042 [US1] Implement query in LibraryComponent using StorageService to fetch all ReadingEntries ordered by lastUpdated
- [ ] T043 [US1] Join ReadingEntry data with Book data in LibraryComponent to populate BookCardComponent instances
- [ ] T044 [US1] Add zero-state UI in LibraryComponent for empty library displaying "No books yet" with call-to-action button linking to search
- [ ] T045 [US1] Implement loading state in LibraryComponent displaying LoadingSpinnerComponent while fetching data

**Checkpoint**: At this point, User Story 1 (Add Book) should be fully functional and testable independently. Users can search, select, and see books in their library. This is the MVP!

---

## Phase 4: User Story 2 - Track Reading Status and Progress (Priority: P2)

**Goal**: Users can update reading status (Not Started, Currently Reading, Completed, DNF), automatically record start/finish dates, and add personal notes to books.

**Independent Test**: Add a book, change status from "Not Started" to "Currently Reading" (verify startedDate recorded), change to "Completed" (verify finishedDate recorded), add note "Great book!" (verify note persists). Delivers value by organizing reading journey.

### Implementation for User Story 2

#### Status Management

- [ ] T046 [P] [US2] Create BookDetailComponent in `src/app/features/book-detail/detail.component.ts` displaying full book metadata and status
- [ ] T047 [P] [US2] Create StatusSelectorComponent in `src/app/features/book-detail/status-selector.component.ts` using mat-select with 4 status options
- [ ] T048 [US2] Implement updateStatus method in ReadingLogService with automatic date recording logic per data-model.md state transitions
- [ ] T049 [US2] Connect StatusSelectorComponent to ReadingLogService.updateStatus() with change event handler
- [ ] T050 [US2] Update lastUpdated timestamp in ReadingLogService.updateStatus() to trigger library re-sort
- [ ] T051 [US2] Add visual distinction for each status in BookCardComponent using different mat-chip colors (gray, blue, green, orange)
- [ ] T052 [P] [US2] Create FilterBarComponent in `src/app/features/library/filter-bar.component.ts` with mat-chip-listbox for filtering by status
- [ ] T053 [US2] Implement status filtering logic in LibraryComponent querying StorageService by status field

#### Notes Management

- [ ] T054 [P] [US2] Create NotesSectionComponent in `src/app/features/book-detail/notes-section.component.ts` displaying list of notes with add/edit/delete actions
- [ ] T055 [US2] Implement addNote method in ReadingLogService creating Note with createdAt/updatedAt timestamps and updating ReadingEntry.lastUpdated
- [ ] T056 [US2] Implement editNote method in ReadingLogService updating Note.content and Note.updatedAt timestamp
- [ ] T057 [US2] Implement deleteNote method in ReadingLogService with confirmation dialog before deletion
- [ ] T058 [US2] Add inline note editor in NotesSectionComponent using mat-form-field with textarea
- [ ] T059 [US2] Implement note validation in NotesSectionComponent (required, max 10,000 chars, plain text only)
- [ ] T060 [US2] Display notes sorted by createdAt descending in NotesSectionComponent

#### UI Enhancements

- [ ] T061 [P] [US2] Create SortSelectorComponent in `src/app/features/library/sort-selector.component.ts` with options: "Recently Updated", "Title A-Z", "Author A-Z"
- [ ] T062 [US2] Implement sort logic in LibraryComponent using Dexie.js orderBy() for different sort fields
- [ ] T063 [US2] Store selected sort order in UserPreference via StorageService and restore on component init
- [ ] T064 [US2] Add click navigation from BookCardComponent to BookDetailComponent showing full book details

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can add books AND track their reading progress.

---

## Phase 5: User Story 3 - View Statistics and Insights (Priority: P3)

**Goal**: Users can view aggregate statistics (total books, pages read, shelf space, reading time) and visual graphs (status distribution pie chart, reading trends over time).

**Independent Test**: Add 5 books with various statuses (2 completed, 2 reading, 1 not started), navigate to Statistics view, verify accurate totals, pie chart showing distribution, and line chart showing completion trend. Delivers unique analytical value.

### Implementation for User Story 3

#### Statistics Calculations

- [ ] T065 [P] [US3] Create StatisticsService in `src/app/core/services/statistics.service.ts` with methods for all aggregate calculations
- [ ] T066 [P] [US3] Implement calculateTotalBooks method in StatisticsService querying all ReadingEntries
- [ ] T067 [P] [US3] Implement calculateBooksByStatus method in StatisticsService grouping by status enum
- [ ] T068 [P] [US3] Implement calculateTotalPages method in StatisticsService summing pageCount across all books
- [ ] T069 [P] [US3] Implement calculatePagesRead method in StatisticsService summing pageCount for Completed books only
- [ ] T070 [P] [US3] Implement calculateShelfSpace method in StatisticsService summing physical dimensions with null handling
- [ ] T071 [P] [US3] Implement calculateReadingTime method in StatisticsService using 250 WPM default (60 pages/hour conversion)
- [ ] T072 [P] [US3] Create ReadingTimePipe in `src/app/shared/pipes/reading-time.pipe.ts` to convert page count to hours/minutes display
- [ ] T073 [P] [US3] Create DimensionUnitPipe in `src/app/shared/pipes/dimension-unit.pipe.ts` to convert cm ↔ inches

#### Statistics Dashboard

- [ ] T074 [P] [US3] Create DashboardComponent in `src/app/features/statistics/dashboard.component.ts` as main statistics view
- [ ] T075 [P] [US3] Create OverviewCardComponent in `src/app/features/statistics/overview-card.component.ts` displaying summary metrics using mat-card
- [ ] T076 [US3] Connect DashboardComponent to StatisticsService to fetch all aggregate metrics
- [ ] T077 [US3] Display total books, completed, in progress, total pages, shelf space, reading time in OverviewCardComponent
- [ ] T078 [US3] Handle missing metadata gracefully in OverviewCardComponent displaying "Not Available" for books without dimensions

#### Charts and Graphs

- [ ] T079 [P] [US3] Create PieChartComponent in `src/app/features/statistics/pie-chart.component.ts` using Chart.js doughnut chart for status distribution
- [ ] T080 [US3] Configure Chart.js with custom colors per status in PieChartComponent (gray, blue, green, orange)
- [ ] T081 [US3] Implement hover tooltips in PieChartComponent showing exact book counts
- [ ] T082 [US3] Add aria-label to PieChartComponent describing chart data for screen readers
- [ ] T083 [P] [US3] Create TrendChartComponent in `src/app/features/statistics/trend-chart.component.ts` using Chart.js line chart for books completed per month
- [ ] T084 [US3] Implement date grouping logic in TrendChartComponent aggregating completed books by month from finishedDate
- [ ] T085 [US3] Create alternate bar chart view in TrendChartComponent showing pages read per month
- [ ] T086 [US3] Handle empty state in chart components displaying "Not enough data" message when 0 completed books

#### Individual Book Stats

- [ ] T087 [P] [US3] Create BookStatsComponent in `src/app/features/book-detail/book-stats.component.ts` displaying single-book statistics
- [ ] T088 [US3] Display page count, dimensions, estimated reading time in BookStatsComponent using ReadingTimePipe and DimensionUnitPipe
- [ ] T089 [US3] Show startedDate and finishedDate in BookStatsComponent formatted as human-readable dates
- [ ] T090 [US3] Calculate days to complete in BookStatsComponent (finishedDate - startedDate) for completed books

**Checkpoint**: All three user stories (Add Books, Track Status, View Statistics) should now be independently functional with visual data insights.

---

## Phase 6: User Story 4 - Export and Import Reading Data (Priority: P4)

**Goal**: Users can export entire reading log to JSON file for backup, and import from file to restore/transfer data with duplicate detection and conflict resolution.

**Independent Test**: Create library with 10 books and notes, export to JSON file, clear IndexedDB, import file, verify all data restored with identical ISBNs, notes, and statuses. Delivers data portability and backup security.

### Implementation for User Story 4

#### Export Functionality

- [ ] T091 [P] [US4] Create ExportImportService in `src/app/core/services/export-import.service.ts` with export and import methods
- [ ] T092 [P] [US4] Implement exportData method in ExportImportService querying all Books, ReadingEntries, Notes from StorageService
- [ ] T093 [US4] Create JSON export schema in ExportImportService with version 1.0.0, exportDate, and nested data object per data-model.md
- [ ] T094 [US4] Generate downloadable file in ExportImportService using Blob API with filename `ncn-books-export-{date}.json`
- [ ] T095 [P] [US4] Create ExportPanelComponent in `src/app/features/settings/export-panel.component.ts` with "Export Data" button
- [ ] T096 [US4] Connect ExportPanelComponent to ExportImportService.exportData() triggering file download on click
- [ ] T097 [US4] Add success toast notification in ExportPanelComponent after export completion

#### Import Functionality

- [ ] T098 [P] [US4] Create ImportPanelComponent in `src/app/features/settings/import-panel.component.ts` with file input and "Import Data" button
- [ ] T099 [US4] Implement file validation in ExportImportService checking JSON schema version and required fields
- [ ] T100 [US4] Display validation error in ImportPanelComponent for invalid files with message "Invalid file format. Please upload a valid NCN Books export file"
- [ ] T101 [US4] Implement ISBN duplicate detection in ExportImportService comparing import ISBNs against existing books in StorageService
- [ ] T102 [P] [US4] Create ConflictResolutionDialogComponent as mat-dialog with options: Skip, Replace, Merge using mat-radio-group
- [ ] T103 [US4] Open ConflictResolutionDialogComponent in ImportPanelComponent when duplicates detected
- [ ] T104 [US4] Implement merge logic in ExportImportService combining notes from both sources, keeping most recent status
- [ ] T105 [US4] Use Dexie.js transaction in ExportImportService.importData() to rollback on any import error
- [ ] T106 [US4] Display import progress in ImportPanelComponent using mat-progress-bar showing percentage of books processed
- [ ] T107 [US4] Add success toast in ImportPanelComponent showing count of books imported after completion

#### Settings View

- [ ] T108 [P] [US4] Create SettingsComponent in `src/app/features/settings/settings.component.ts` as container for ExportPanel and ImportPanel
- [ ] T109 [P] [US4] Add reading speed preference editor in SettingsComponent with mat-slider (100-500 WPM range, default 250)
- [ ] T110 [US4] Store reading speed in UserPreference table via StorageService and apply to reading time calculations in StatisticsService

**Checkpoint**: All four user stories are now complete and independently functional. Users can add, track, analyze, and backup their reading log.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

### Accessibility & UX

- [ ] T111 [P] Create AutoFocusDirective in `src/app/shared/directives/auto-focus.directive.ts` to focus search input on page load
- [ ] T112 [P] Add ARIA labels to all icon-only buttons across components (mat-icon-button instances)
- [ ] T113 [P] Implement keyboard shortcuts in AppComponent: "/" for search focus, "Escape" to close dialogs
- [ ] T114 [P] Add skip-to-main-content link in AppComponent for keyboard navigation accessibility
- [ ] T115 Verify WCAG 2.1 AA color contrast ratios in Tailwind theme configuration (4.5:1 minimum for text)

### Performance Optimization

- [ ] T116 [P] Implement virtual scrolling in LibraryComponent using Angular CDK VirtualScrollViewport for 1,000+ books
- [ ] T117 [P] Add lazy loading for Chart.js library in DashboardComponent to reduce initial bundle size
- [ ] T118 [P] Configure OnPush change detection strategy on all feature components
- [ ] T119 [P] Add `loading="lazy"` attribute to book cover images in BookCardComponent
- [ ] T120 Optimize production build in `angular.json`: enable AOT, buildOptimizer, optimization, sourceMap false

### Error Handling & Edge Cases

- [ ] T121 [P] Add global error handler in `src/app/core/services/global-error-handler.service.ts` logging to console and showing user-friendly messages
- [ ] T122 [P] Implement storage quota detection in StorageService displaying warning at 80% capacity
- [ ] T123 [P] Add browser compatibility check in AppComponent displaying warning for unsupported browsers (Chrome <90, Firefox <88, Safari <14)
- [ ] T124 Add retry mechanism in BookApiService for network timeout errors (3 retries with exponential backoff)

### Documentation & Testing

- [ ] T125 [P] Add JSDoc comments to all public methods in core services (StorageService, ReadingLogService, StatisticsService, ExportImportService)
- [ ] T126 [P] Create README.md in repository root with project overview, setup instructions referencing quickstart.md, and deployment guide
- [ ] T127 Validate development environment setup by following quickstart.md step-by-step from clean state
- [ ] T128 Run production build with `npm run build:prod` and verify output in `dist/ncn-books/` directory
- [ ] T129 Deploy to GitHub Pages and verify application works on live URL with base-href routing

### Optional: PWA Features (Future Enhancement)

- [ ] T130 [P] Install `@angular/pwa` using `ng add @angular/pwa` to generate service worker and manifest
- [ ] T131 [P] Configure service worker in `ngsw-config.json` to cache static assets and book cover images
- [ ] T132 Test offline viewing capability by loading app, going offline, and verifying library data displays

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion, optionally integrates with US1
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion, reads data created by US1 and US2
- **User Story 4 (Phase 6)**: Depends on Foundational phase completion, exports/imports data structure from US1-US3
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends books created in US1 but independently testable with manual test data
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Calculates stats from books/entries but independently testable with seeded data
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Exports/imports all entities but independently testable with sample JSON

### Within Each User Story

**User Story 1** (Add Book):
- T021-T026 (API services) can run in parallel with T027-T033 (Search UI components)
- T034-T039 (Add Book logic) depends on API services AND StorageService (T015) completion
- T040-T045 (Library view) depends on StorageService and ReadingLogService

**User Story 2** (Track Status):
- T046-T053 (Status management) can run in parallel with T054-T060 (Notes management)
- T061-T064 (UI enhancements) depends on Library and Detail components existing

**User Story 3** (Statistics):
- T065-T073 (calculations and pipes) can all run in parallel
- T074-T078 (dashboard) depends on StatisticsService
- T079-T086 (charts) can run in parallel with each other, depends on StatisticsService
- T087-T090 (individual book stats) can run in parallel with dashboard work

**User Story 4** (Export/Import):
- T091-T097 (export) and T098-T107 (import) can run in parallel
- T108-T110 (settings view) depends on export and import panels

### Parallel Opportunities

- All Setup tasks (T001-T009) can run in parallel EXCEPT T001 must complete before T002-T009
- All model creation tasks (T010-T013) can run in parallel
- All shared component tasks (T016-T018) can run in parallel
- Within User Story 1: API services (T021-T022) parallel, Search UI components (T027, T029, T032) parallel
- Within User Story 2: Status components (T046-T047, T052) parallel, Notes components (T054) parallel
- Within User Story 3: All calculation methods (T065-T073) parallel, chart components (T079, T083, T087) parallel
- Within User Story 4: Export tasks (T092-T097) parallel with import tasks (T098-T101)
- Polish tasks (T111-T115, T116-T120, T121-T124, T125-T127) can run in parallel

---

## Parallel Example: User Story 1 (Add Book)

```bash
# Step 1: Launch API services in parallel
Task T021: "Create GoogleBooksApiService in src/app/core/services/google-books-api.service.ts"
Task T022: "Create OpenLibraryApiService in src/app/core/services/open-library-api.service.ts"

# Step 2: Launch Search UI components in parallel (while API services are being built)
Task T027: "Create SearchComponent in src/app/features/book-search/search.component.ts"
Task T029: "Create SearchResultsComponent in src/app/features/book-search/search-results.component.ts"
Task T032: "Create ManualEntryComponent in src/app/features/book-search/manual-entry.component.ts"

# Step 3: Sequential tasks after parallel completion
Task T023: "Create BookApiService with waterfall fallback" (depends on T021, T022)
Task T024: "Add debouncing and retry logic" (depends on T023)
Task T034: "Create ReadingLogService.addBook()" (depends on T015 StorageService)
Task T037: "Add 'Add to Log' button to search results" (depends on T034)

# Step 4: Launch Library view components in parallel
Task T040: "Create LibraryComponent"
Task T041: "Create BookCardComponent"
```

---

## Parallel Example: User Story 3 (Statistics)

```bash
# Launch all calculation methods in parallel:
Task T065: "Create StatisticsService"
Task T066: "Implement calculateTotalBooks"
Task T067: "Implement calculateBooksByStatus"
Task T068: "Implement calculateTotalPages"
Task T069: "Implement calculatePagesRead"
Task T070: "Implement calculateShelfSpace"
Task T071: "Implement calculateReadingTime"
Task T072: "Create ReadingTimePipe"
Task T073: "Create DimensionUnitPipe"

# Launch all chart components in parallel (after StatisticsService complete):
Task T079: "Create PieChartComponent for status distribution"
Task T083: "Create TrendChartComponent for completion timeline"
Task T087: "Create BookStatsComponent for individual book metrics"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T020) - CRITICAL
3. Complete Phase 3: User Story 1 (T021-T045)
4. **STOP and VALIDATE**: Test book search, add book, view in library independently
5. Deploy to GitHub Pages as MVP

**MVP Deliverable**: Users can search for books online and build their reading library. This is the minimum viable product that delivers immediate value.

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T021-T045) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T046-T064) → Test status updates and notes → Deploy/Demo
4. Add User Story 3 (T065-T090) → Test statistics and graphs → Deploy/Demo
5. Add User Story 4 (T091-T110) → Test export/import → Deploy/Demo
6. Add Polish (T111-T132) → Final production-ready release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T020)
2. Once Foundational is done:
   - Developer A: User Story 1 (T021-T045)
   - Developer B: User Story 2 (T046-T064)
   - Developer C: User Story 3 (T065-T090)
3. Stories complete and integrate independently
4. Team collaborates on User Story 4 and Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently
- All file paths follow Angular 17+ standalone component structure from plan.md
- Tests are optional for MVP - focus on working implementation first, add unit tests in Polish phase if needed
- StorageService (T015) is the most critical foundation task - all user stories depend on it

---

## Task Summary

**Total Tasks**: 132

**Distribution by Phase**:
- Phase 1 (Setup): 9 tasks
- Phase 2 (Foundational): 11 tasks (BLOCKING)
- Phase 3 (User Story 1 - Add Book): 25 tasks
- Phase 4 (User Story 2 - Track Status): 19 tasks
- Phase 5 (User Story 3 - Statistics): 26 tasks
- Phase 6 (User Story 4 - Export/Import): 20 tasks
- Phase 7 (Polish): 22 tasks

**Parallel Opportunities**: 65 tasks marked [P] can run in parallel within their phase

**Independent Increments**:
- MVP: Phases 1-3 (45 tasks) = Add Book functionality
- Increment 2: +Phase 4 (19 tasks) = Status tracking
- Increment 3: +Phase 5 (26 tasks) = Statistics
- Increment 4: +Phase 6 (20 tasks) = Export/Import
- Production: +Phase 7 (22 tasks) = Polish

**Suggested First Milestone**: Complete through T045 (User Story 1) for MVP release
