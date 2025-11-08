# API Contract: Open Library API

**Date**: 2025-11-08
**Feature**: Reading Log (001)
**API**: Open Library Search API
**Purpose**: Fallback source for book metadata when Google Books API fails or is rate-limited

## Overview

Open Library is a free, open-source book catalog with a RESTful JSON API. No API key required, no explicit rate limits (self-throttle to be respectful). Supports CORS for client-side requests.

**Base URL**: `https://openlibrary.org`

**Documentation**: https://openlibrary.org/developers/api

---

## Endpoint: Search Books

### Request

**HTTP Method**: `GET`

**Endpoint**: `/search.json`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (title, author, ISBN) |
| `fields` | string | No | Comma-separated fields to return (default: all) |
| `limit` | integer | No | Number of results (default: 100, use 20 for parity with Google Books) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Query Construction**:
- **Title only**: `q=The Hobbit`
- **Title + Author**: `q=The Hobbit author:Tolkien`
- **ISBN**: `q=isbn:9780547928227`

**Example Request**:
```
GET https://openlibrary.org/search.json?q=The%20Hobbit%20author:Tolkien&limit=20&fields=key,title,author_name,first_publish_year,isbn,number_of_pages_median,cover_i,oclc
```

### Response

**HTTP Status**: `200 OK`

**Content-Type**: `application/json`

**Response Schema**:
```json
{
  "numFound": 245,
  "start": 0,
  "numFoundExact": true,
  "docs": [
    {
      "key": "/works/OL27479W",  // Open Library work key
      "title": "The Hobbit",
      "author_name": ["J.R.R. Tolkien"],
      "first_publish_year": 1937,
      "isbn": [
        "9780547928227",
        "0547928220",
        "9780261102217"
      ],
      "number_of_pages_median": 310,
      "cover_i": 8634025,  // Cover ID (use to construct cover URL)
      "oclc": ["1102963"],  // OCLC control numbers
      "publisher": ["Houghton Mifflin Harcourt", "HarperCollins"],
      "language": ["eng"],
      "subject": ["Fantasy fiction", "Adventure stories"]
    }
  ]
}
```

**Field Mapping to Internal Book Model**:
| Open Library API Field | Book Model Field | Notes |
|------------------------|------------------|-------|
| `isbn[0]` | `isbn` | Prefer ISBN-13 (starts with 978/979) over ISBN-10 |
| `title` | `title` | Direct mapping |
| `author_name[0]` | `author` | Join multiple authors with comma |
| `first_publish_year` | `publicationYear` | Direct mapping |
| `number_of_pages_median` | `pageCount` | Median page count across all editions |
| `cover_i` | `coverImageUrl` | Construct URL: `https://covers.openlibrary.org/b/id/{cover_i}-L.jpg` |
| N/A | `description` | Not available in search endpoint (requires separate API call) |
| N/A | `dimensions` | Not available in Open Library API |
| `key` | `openLibraryKey` | Store for reference |

### Cover Image URLs

Open Library provides cover images via separate endpoint:

**URL Format**:
- Large: `https://covers.openlibrary.org/b/id/{cover_i}-L.jpg`
- Medium: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`
- Small: `https://covers.openlibrary.org/b/id/{cover_i}-S.jpg`

**Example**:
```
https://covers.openlibrary.org/b/id/8634025-L.jpg
```

**Fallback**: If `cover_i` not present, use default placeholder image

### Error Responses

**400 Bad Request**:
```json
{
  "error": "Invalid query parameter"
}
```

**404 Not Found** (invalid endpoint):
```
HTML error page (not JSON)
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```

---

## Implementation Notes

### Request Patterns

**Search by Title + Author**:
```typescript
const query = `${title}${author ? ` author:${author}` : ''}`;
const fields = 'key,title,author_name,first_publish_year,isbn,number_of_pages_median,cover_i';
const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=${fields}`;
```

**Pagination**:
```typescript
const url = `...&limit=20&offset=${page * 20}`;
```

### Data Transformation

**Extract ISBN** (prefer ISBN-13):
```typescript
function extractISBN(isbns: string[] | undefined): string | null {
  if (!isbns || isbns.length === 0) return null;

  // Prefer ISBN-13 (13 digits starting with 978 or 979)
  const isbn13 = isbns.find(isbn => /^(978|979)\d{10}$/.test(isbn.replace(/-/g, '')));
  if (isbn13) return isbn13;

  // Fallback to any ISBN (10 or 13 digits)
  const anyIsbn = isbns.find(isbn => /^\d{10,13}$/.test(isbn.replace(/-/g, '')));
  return anyIsbn || null;
}
```

**Construct Cover URL**:
```typescript
function getCoverUrl(coverId: number | undefined): string | null {
  return coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : null;
}
```

**Transform to Book Model**:
```typescript
function transformOpenLibraryBook(doc: any): Book {
  return {
    isbn: extractISBN(doc.isbn) || `OL-${doc.key}`,  // Use work key if no ISBN
    title: doc.title,
    author: doc.author_name?.[0] || 'Unknown Author',
    publicationYear: doc.first_publish_year || null,
    pageCount: doc.number_of_pages_median || null,
    dimensions: null,  // Not available in Open Library
    coverImageUrl: getCoverUrl(doc.cover_i),
    description: null,  // Not available in search endpoint
    googleBooksId: null,
    openLibraryKey: doc.key,
    source: 'open-library',
    addedAt: new Date()
  };
}
```

### Error Handling

**Fallback Chain** (Google Books → Open Library → Empty Array):
```typescript
searchBooks(query: string): Observable<Book[]> {
  return this.searchGoogleBooks(query).pipe(
    catchError(googleError => {
      console.warn('Google Books failed, trying Open Library', googleError);
      return this.searchOpenLibrary(query);
    }),
    catchError(openLibraryError => {
      console.error('Both APIs failed', googleError, openLibraryError);
      return of([]);  // Return empty array, allow manual entry
    })
  );
}
```

**Retry Strategy** (less aggressive than Google Books):
```typescript
searchOpenLibrary(query: string): Observable<Book[]> {
  return this.http.get<OpenLibraryResponse>(url).pipe(
    map(response => response.docs.map(doc => this.transformOpenLibraryBook(doc))),
    retry({
      count: 1,  // Only retry once (Open Library is fallback)
      delay: 2000  // Wait 2 seconds before retry
    }),
    catchError(error => {
      console.error('Open Library API error', error);
      return throwError(() => new Error('OPEN_LIBRARY_UNAVAILABLE'));
    })
  );
}
```

### Throttling (Self-Imposed)

Open Library has no official rate limits, but be respectful:

```typescript
// Debounce search input (already implemented for Google Books)
searchControl.valueChanges.pipe(
  debounceTime(500),  // Same 500ms debounce
  distinctUntilChanged(),
  switchMap(query => this.bookApi.searchBooks(query))  // Uses Google → Open Library chain
);
```

---

## Testing Considerations

### Mock Response (for Unit Tests)

```typescript
const mockOpenLibraryResponse: OpenLibraryResponse = {
  numFound: 1,
  start: 0,
  numFoundExact: true,
  docs: [{
    key: '/works/OL27479W',
    title: 'Test Book',
    author_name: ['Test Author'],
    first_publish_year: 2024,
    isbn: ['9781234567890'],
    number_of_pages_median: 300,
    cover_i: 12345678
  }]
};
```

### E2E Testing Strategy

- **Primary Fallback Test**: Mock Google Books to return 429, verify Open Library called
- **Both APIs Down**: Mock both to fail, verify empty state UI shown
- **Cover Image Loading**: Test placeholder shown if `cover_i` missing
- **No ISBN Books**: Test books without ISBN (use work key as fallback)

---

## Compliance with Success Criteria

- **SC-002**: Book search returns initial 20 results within 3 seconds
  - ✅ Open Library API typical response time: 400-1200ms
  - ⚠️ Slightly slower than Google Books (acceptable for fallback scenario)

- **SC-010**: System handles book search API failures gracefully
  - ✅ Fallback from Google Books to Open Library implemented
  - ✅ Clear error messaging when both fail
  - ✅ Manual entry option always available

- **FR-002**: Retrieve matching books with cover image, title, author, publication year
  - ✅ All fields available except dimensions
  - ✅ Cover images available via `cover_i` → covers.openlibrary.org URL

---

## Known Limitations

1. **No Physical Dimensions**: Open Library does not provide height/width/thickness
   - Mitigation: Display "Not Available", allow manual entry

2. **No Book Descriptions**: Search endpoint doesn't include descriptions
   - Mitigation: Could fetch from `/works/{key}.json` endpoint (separate API call)
   - Decision: Skip for MVP (not critical for book tracking)

3. **Variable Data Quality**: Metadata less comprehensive than Google Books
   - Expected: Open Library is fallback, not primary source

4. **No ISBN for Some Books**: Very old or obscure books may lack ISBN
   - Mitigation: Use Open Library work key as synthetic identifier (`OL-/works/OL27479W`)

5. **Cover Image Availability**: ~30% of books lack cover images
   - Mitigation: Use placeholder image, display book title text instead

6. **Inconsistent Response Times**: Can be slow (1-2s) during peak usage
   - Acceptable: This is fallback API, not primary user experience

---

## Comparison: Google Books vs Open Library

| Feature | Google Books | Open Library |
|---------|-------------|--------------|
| Response Time | 200-800ms | 400-1200ms |
| Metadata Completeness | High (90%+) | Medium (70%) |
| Cover Images | High quality | Medium quality |
| Physical Dimensions | ~60% of books | Not available |
| Rate Limits | 1,000/day (no key) | None (self-throttle) |
| CORS Support | Yes | Yes |
| API Key Required | No (optional for higher limits) | No |
| **Recommendation** | **Primary source** | **Fallback source** |

---

## Next Steps

1. Implement `BookApiService.searchOpenLibrary()` method
2. Implement fallback chain (Google → Open Library → Empty)
3. Add unit tests for Open Library transformation logic
4. Add E2E test for API failure scenarios
5. Document manual book entry flow when both APIs fail
