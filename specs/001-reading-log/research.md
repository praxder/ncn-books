# Research: Reading Log Technical Decisions

**Date**: 2025-11-08
**Feature**: Reading Log (001)
**Purpose**: Document technology choices, best practices, and implementation patterns for Angular + IndexedDB book tracking application deployed to GitHub Pages

## Overview

This document consolidates research findings for building a client-side-only book tracking application. All decisions prioritize simplicity, data integrity, and GitHub Pages compatibility (static hosting only).

---

## 1. Frontend Framework: Angular 17+ with Standalone Components

### Decision

Use **Angular 17+** with the new standalone components API (no NgModules).

### Rationale

- **Static Build Output**: Angular CLI produces optimized static files perfect for GitHub Pages deployment
- **TypeScript Native**: Strong typing reduces bugs in data operations (critical for IndexedDB interactions)
- **Standalone Components**: Simpler architecture, faster builds, better tree-shaking vs NgModule approach
- **Mature Ecosystem**: Angular Material (UI), RxJS (reactive patterns), robust testing tools
- **Performance**: Ahead-of-time (AOT) compilation and built-in lazy loading support 60fps interactions
- **Long-term Support**: Angular has predictable release cycles with 18-month LTS per major version

### Alternatives Considered

| Framework | Rejected Because |
|-----------|------------------|
| React | Requires additional state management library; more setup for routing; less opinionated (more decisions needed) |
| Vue 3 | Smaller ecosystem for data visualization (Chart.js integration less mature than Angular); composition API similar complexity to Angular standalone |
| Svelte | Smaller library ecosystem; less mature IndexedDB tooling; team unfamiliar with compile-time framework |

### Best Practices for Angular 17+

1. **Use Standalone Components**: Avoid NgModules entirely for simplicity
2. **Lazy Load Feature Routes**: Load library, statistics, settings on-demand
3. **Signals for State**: Use Angular 17 signals for reactive state instead of manual RxJS subjects where appropriate
4. **Inject Functions**: Use `inject()` function instead of constructor injection for cleaner code
5. **OnPush Change Detection**: Set `changeDetection: ChangeDetectionStrategy.OnPush` on all components for performance

**References**:
- [Angular.io Standalone Components Guide](https://angular.io/guide/standalone-components)
- [Angular Performance Checklist](https://angular.io/guide/performance-best-practices)

---

## 2. Local Data Storage: IndexedDB via Dexie.js

### Decision

Use **Dexie.js 3.x** as IndexedDB wrapper for all structured data storage.

### Rationale

- **Transaction Safety**: Dexie.js provides Promise-based API with automatic transaction management (critical for Data Integrity principle)
- **Querying**: Rich query API with indexes for efficient filtering/sorting (needed for "Recently Updated" default sort)
- **Schema Versioning**: Built-in migration system for future data model changes
- **TypeScript Support**: Excellent type definitions for type-safe database operations
- **Size**: Only ~20KB gzipped (minimal bundle impact)
- **Browser Support**: Works in all modern browsers (Chrome 24+, Firefox 16+, Safari 8+, Edge 12+)

### Alternatives Considered

| Solution | Rejected Because |
|----------|------------------|
| Raw IndexedDB API | Too verbose; manual transaction management error-prone; no migration system |
| LocalForage | Simpler but limited querying (forces client-side filtering); no schema versioning |
| PouchDB | Designed for sync (unnecessary complexity); larger bundle size (~140KB); CouchDB-oriented |
| idb (Jake Archibald) | Minimal wrapper; still requires manual schema versioning and migration code |

### Best Practices for Dexie.js

1. **Define Schema Up Front**: Explicit version() calls with upgrade functions for migrations
2. **Use Transactions**: Wrap multi-table operations in `db.transaction('rw', ...)` for atomicity
3. **Index Strategically**: Create indexes only on fields used for filtering/sorting (e.g., `lastUpdated`, `status`, `isbn`)
4. **Error Handling**: Always `.catch()` on Dexie operations; display user-friendly messages
5. **Bulk Operations**: Use `bulkAdd()`, `bulkPut()` for import operations (faster than individual adds)

**Schema Design Pattern**:
```typescript
const db = new Dexie('NCNBooksDB');
db.version(1).stores({
  books: 'isbn, title, author',  // Primary key: isbn
  readingEntries: '++id, isbn, status, lastUpdated', // Auto-increment id, indexed fields
  notes: '++id, readingEntryId, createdAt'
});
```

**References**:
- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB Best Practices (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#best_practices)

---

## 3. State Management: RxJS + Angular Signals

### Decision

Use **RxJS 7.x Observables** for async operations (API calls, IndexedDB) and **Angular Signals** for synchronous state.

### Rationale

- **RxJS for Async**: Perfect for API calls with retry logic (Google Books → Open Library fallback), debouncing search input
- **Signals for Sync State**: Simpler than BehaviorSubjects for component state (e.g., current filter, sort order)
- **Native Integration**: Both are first-class citizens in Angular 17+
- **No Additional Dependencies**: Avoid NgRx/Akita complexity for single-user app

### Pattern

- **Services expose Observables** for data streams (e.g., `bookApi.search()` returns `Observable<Book[]>`)
- **Components use Signals** for local UI state (e.g., `selectedStatus = signal('All')`)
- **AsyncPipe in templates** for automatic subscription management

### Best Practices

1. **Operator Chains**: Use `pipe()` with operators like `catchError`, `retry`, `debounceTime` for robust API handling
2. **Share Subscriptions**: Use `shareReplay(1)` for expensive operations (e.g., statistics calculations)
3. **Unsubscribe Pattern**: Prefer `async` pipe in templates over manual `.subscribe()` to avoid memory leaks
4. **Effect for Side Effects**: Use `effect()` to sync signals to localStorage (e.g., save user preferences)

**References**:
- [RxJS Operators Decision Tree](https://rxjs.dev/operator-decision-tree)
- [Angular Signals Guide](https://angular.io/guide/signals)

---

## 4. UI Components: Angular Material 17+

### Decision

Use **Angular Material 17+** for UI components with **Tailwind CSS 3.x** for utility styling.

### Rationale

- **Accessibility**: Material components meet WCAG 2.1 AA out-of-the-box (Constitution requirement)
- **Theming**: Built-in dark mode support via Material theming system
- **Mobile-Ready**: Responsive components (important for mobile viewport support)
- **Form Controls**: Robust form components with validation (needed for manual book entry, settings)
- **Tailwind for Layout**: Use Tailwind utilities for spacing, responsive grid; Material for interactive components

### Component Selection

| Use Case | Material Component | Tailwind Classes |
|----------|-------------------|------------------|
| Book cards | mat-card | Tailwind grid layout |
| Search input | mat-form-field + mat-input | Tailwind margins/padding |
| Status dropdown | mat-select | - |
| Filters | mat-chip (selectable) | Tailwind flex layout |
| Statistics cards | mat-card | Tailwind grid |
| Modals | mat-dialog | - |
| Loading | mat-progress-spinner | Tailwind centering |

### Best Practices

1. **Lazy Load Material Modules**: Import only components you use per feature (reduces bundle size)
2. **Custom Theme**: Define primary/accent colors matching NCN Books brand
3. **Mobile-First**: Test all Material components on 320px viewport (smallest target)
4. **Tailwind Purge**: Configure PurgeCSS to remove unused Tailwind classes in production

**References**:
- [Angular Material Component Library](https://material.angular.io/components)
- [Tailwind CSS + Angular Setup](https://tailwindcss.com/docs/guides/angular)

---

## 5. Data Visualization: Chart.js 4.x + ng2-charts

### Decision

Use **Chart.js 4.x** with **ng2-charts** Angular wrapper for all graphs and charts.

### Rationale

- **Lightweight**: ~40KB gzipped (smaller than D3.js)
- **Chart Types**: Supports pie charts (status distribution) and line/bar charts (reading trends)
- **Responsive**: Built-in responsive behavior for mobile
- **Canvas-Based**: Hardware-accelerated rendering for smooth 60fps animations
- **ng2-charts**: Official Angular wrapper with TypeScript types

### Chart Usage Plan

| Requirement | Chart Type | Chart.js Config |
|-------------|------------|-----------------|
| Status distribution | Doughnut (hollow pie) | `type: 'doughnut'`, custom colors per status |
| Books completed per month | Bar chart | `type: 'bar'`, x-axis: months, y-axis: count |
| Pages read per month | Line chart | `type: 'line'`, x-axis: months, y-axis: pages |

### Best Practices

1. **Lazy Load Charts**: Only load Chart.js library when user navigates to Statistics view
2. **Memoize Data**: Cache calculated statistics; recalculate only when IndexedDB data changes
3. **Accessibility**: Provide `aria-label` describing chart data for screen readers
4. **Interaction**: Enable hover tooltips showing exact values

**References**:
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [ng2-charts GitHub](https://github.com/valor-software/ng2-charts)

---

## 6. Book Metadata APIs: Google Books + Open Library

### Decision

Use **Google Books API** as primary source with **Open Library API** as fallback.

### Rationale

- **Google Books API**:
  - More comprehensive metadata (page counts, dimensions often available)
  - Better cover image quality (high-resolution thumbnails)
  - Faster response times (99.9% uptime SLA)
  - Free tier: 1,000 requests/day (sufficient for single user)

- **Open Library API**:
  - Fully open-source (no API key required)
  - Better coverage for older/obscure books
  - No rate limits (self-throttle to be respectful)

### Integration Pattern

```typescript
// Waterfall fallback pattern
searchBooks(title: string, author?: string): Observable<Book[]> {
  return this.googleBooksApi.search(title, author).pipe(
    catchError(error => {
      console.warn('Google Books failed, trying Open Library', error);
      return this.openLibraryApi.search(title, author);
    }),
    catchError(error => {
      console.error('Both APIs failed', error);
      return of([]); // Return empty array, allow manual entry
    })
  );
}
```

### Best Practices

1. **CORS Proxy**: Both APIs support CORS; no proxy needed for GitHub Pages deployment
2. **Rate Limiting**: Debounce search input (500ms) to reduce API calls
3. **Caching**: Cache search results in-memory for session duration (avoid duplicate API calls)
4. **Error Messages**: Distinguish between "No results" vs "API error" for user clarity

**API Endpoints**:
- Google Books: `https://www.googleapis.com/books/v1/volumes?q={query}`
- Open Library: `https://openlibrary.org/search.json?q={query}`

**References**:
- [Google Books API Documentation](https://developers.google.com/books/docs/v1/using)
- [Open Library API Documentation](https://openlibrary.org/developers/api)

---

## 7. Deployment: GitHub Pages with GitHub Actions

### Decision

Deploy via **GitHub Actions** workflow to **GitHub Pages** on every push to `main` branch.

### Rationale

- **Free Hosting**: GitHub Pages free for public repos
- **CI/CD Integration**: Automatic builds/deploys with GitHub Actions
- **HTTPS**: Free SSL certificate via GitHub
- **Custom Domain Support**: Can add custom domain later if needed
- **Static Files Only**: Perfect match for Angular SPA (no server-side rendering needed)

### GitHub Actions Workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:prod  # Angular production build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/ncn-books  # Angular output directory
```

### Best Practices

1. **Base Href**: Set `--base-href=/repo-name/` for GitHub Pages subdirectory deployment
2. **404 Handling**: Copy `index.html` to `404.html` for SPA routing support
3. **Build Optimization**: Enable AOT, production mode, minification in `angular.json`
4. **Cache Busting**: Angular CLI automatically adds content hashes to filenames

**References**:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Deploying Angular to GitHub Pages](https://angular.io/guide/deployment#deploy-to-github-pages)

---

## 8. Testing Strategy

### Decision

Three-tier testing: **Unit (Jasmine/Karma)**, **Integration (Angular Testing Library)**, **E2E (Cypress)**.

### Rationale

- **Unit Tests**: Fast, test individual services/components in isolation
- **Integration Tests**: Verify component + service interactions (e.g., search component + book API service)
- **E2E Tests**: Validate critical user journeys end-to-end in real browser

### Test Coverage Targets

| Test Type | Target Coverage | Priority Areas |
|-----------|----------------|----------------|
| Unit | 80% code coverage | Core services (storage, book-api, reading-log, statistics, export-import) |
| Integration | All critical components | Search results, book detail, statistics dashboard |
| E2E | All P1-P2 user stories | Add book, update status, view statistics |

### Testing Tools

- **Jasmine**: Test framework (built into Angular CLI)
- **Karma**: Test runner for unit tests in real browsers
- **Angular Testing Library**: Component testing with user-centric queries
- **Cypress**: E2E testing with time-travel debugging

### Best Practices

1. **Mock IndexedDB**: Use in-memory mock for unit tests (avoid real browser DB)
2. **Mock HTTP**: Use `HttpClientTestingModule` for API service tests
3. **Accessibility Testing**: Include `axe-core` in Cypress tests to validate WCAG compliance
4. **Snapshot Tests**: Use sparingly; prefer behavioral assertions over HTML snapshots

**References**:
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

---

## 9. Performance Optimization

### Decision

Implement lazy loading, code splitting, and Progressive Web App (PWA) features for offline support.

### Key Optimizations

1. **Lazy Loading**: Load feature routes on-demand (reduces initial bundle by ~60%)
2. **Image Optimization**: Use `loading="lazy"` for book cover images
3. **Virtual Scrolling**: Use Angular CDK Virtual Scroll for library list (handles 1,000+ books smoothly)
4. **Service Worker**: Cache static assets for offline viewing of existing library
5. **Bundle Size**: Target <300KB initial bundle (gzipped)

### PWA Features (Optional P5 Enhancement)

- **Offline Mode**: View existing books when offline (service worker caches IndexedDB data)
- **Install Prompt**: Allow users to "install" app to home screen
- **Background Sync**: Queue API calls when offline, retry when online

### Performance Metrics

- **Lighthouse Score**: Target 90+ on Performance, Accessibility, Best Practices
- **First Contentful Paint**: <1.5s on 4G
- **Time to Interactive**: <3.5s on 4G

**References**:
- [Angular Performance Checklist](https://angular.io/guide/performance-best-practices)
- [Web.dev Performance Guides](https://web.dev/fast/)

---

## 10. Accessibility (WCAG 2.1 AA Compliance)

### Decision

Meet WCAG 2.1 Level AA for all features (Constitution requirement).

### Key Requirements

- **Keyboard Navigation**: All interactive elements accessible via Tab/Enter/Space
- **Screen Reader Support**: Proper ARIA labels on all charts, buttons, form inputs
- **Color Contrast**: 4.5:1 minimum for text, 3:1 for large text/graphics
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Alternative Text**: Alt text for book cover images (use book title as fallback)

### Testing Tools

- **axe DevTools**: Browser extension for automated accessibility audits
- **Lighthouse Accessibility Audit**: Built into Chrome DevTools
- **Cypress axe Plugin**: Automated accessibility testing in E2E tests
- **NVDA/VoiceOver**: Manual screen reader testing

### Best Practices

1. **Semantic HTML**: Use `<button>` for actions, `<a>` for navigation, `<form>` for inputs
2. **ARIA Labels**: Add `aria-label` to icon-only buttons, charts without visible labels
3. **Error Messages**: Link form errors to inputs via `aria-describedby`
4. **Skip Links**: Provide "Skip to main content" link for keyboard users

**References**:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular Accessibility Guide](https://angular.io/guide/accessibility)

---

## Summary Table: All Technology Decisions

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Framework | Angular 17+ (standalone) | TypeScript, static build, mature ecosystem, GitHub Pages compatible |
| State Management | RxJS + Signals | Native Angular integration, no extra dependencies |
| Data Storage | Dexie.js (IndexedDB) | Transaction safety, querying, migrations, type-safe |
| UI Components | Angular Material 17+ | WCAG 2.1 AA, mobile-ready, theming, forms |
| Styling | Tailwind CSS 3.x | Utility-first, small bundle with PurgeCSS |
| Data Visualization | Chart.js 4.x + ng2-charts | Lightweight, responsive, canvas-based |
| Book Metadata | Google Books + Open Library | Comprehensive metadata, fallback for reliability |
| Deployment | GitHub Pages + Actions | Free, automated CI/CD, HTTPS, static hosting |
| Testing | Jasmine/Karma, Cypress | Unit, integration, E2E coverage |
| Accessibility | WCAG 2.1 AA | axe-core, keyboard nav, ARIA labels |

---

## Next Steps

This research document informs the following Phase 1 deliverables:

1. **data-model.md**: IndexedDB schema design using Dexie.js patterns documented above
2. **contracts/google-books-api.md**: Integration spec for Google Books API
3. **contracts/open-library-api.md**: Integration spec for Open Library API
4. **quickstart.md**: Development environment setup with Angular CLI, dependencies installation

All decisions documented here adhere to the NCN Books Constitution principles (User-Centered Design, Data Integrity, Simplicity, Incremental Progress, Quality Through Testing).
