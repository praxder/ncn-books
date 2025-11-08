# API Contract: Google Books API

**Date**: 2025-11-08
**Feature**: Reading Log (001)
**API**: Google Books API v1
**Purpose**: Primary source for book metadata (titles, authors, ISBNs, page counts, cover images, dimensions)

## Overview

Google Books API provides comprehensive book metadata via REST API. No API key required for basic usage (1,000 requests/day limit applies without key). Supports CORS for client-side JavaScript requests.

**Base URL**: `https://www.googleapis.com/books/v1`

**Documentation**: https://developers.google.com/books/docs/v1/using

---

## Endpoint: Search Books

### Request

**HTTP Method**: `GET`

**Endpoint**: `/volumes`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (title, author, ISBN) |
| `maxResults` | integer | No | Number of results to return (default: 10, max: 40) |
| `startIndex` | integer | No | Pagination offset (default: 0) |
| `projection` | string | No | Set to 'full' for complete metadata |

**Query Construction**:
- **Title only**: `q=The Hobbit`
- **Title + Author**: `q=The Hobbit+inauthor:Tolkien`
- **ISBN**: `q=isbn:9780547928227`

**Example Request**:
```
GET https://www.googleapis.com/books/v1/volumes?q=The+Hobbit+inauthor:Tolkien&maxResults=20&projection=full
```

### Response

**HTTP Status**: `200 OK`

**Content-Type**: `application/json`

**Response Schema**:
```json
{
  "kind": "books#volumes",
  "totalItems": 245,
  "items": [
    {
      "kind": "books#volume",
      "id": "hFfhrCWiLSMC",  // Google Books volume ID
      "selfLink": "https://www.googleapis.com/books/v1/volumes/hFfhrCWiLSMC",
      "volumeInfo": {
        "title": "The Hobbit",
        "authors": ["J.R.R. Tolkien"],
        "publisher": "Houghton Mifflin Harcourt",
        "publishedDate": "2012-02-15",
        "description": "A great modern classic...",
        "industryIdentifiers": [
          {
            "type": "ISBN_13",
            "identifier": "9780547928227"
          },
          {
            "type": "ISBN_10",
            "identifier": "0547928220"
          }
        ],
        "pageCount": 366,
        "dimensions": {
          "height": "20.3 cm",
          "width": "13.5 cm",
          "thickness": "2.5 cm"
        },
        "printType": "BOOK",
        "categories": ["Fiction", "Fantasy"],
        "averageRating": 4.5,
        "ratingsCount": 3456,
        "imageLinks": {
          "smallThumbnail": "http://books.google.com/books/content?id=hFfhrCWiLSMC&printsec=frontcover&img=1&zoom=5",
          "thumbnail": "http://books.google.com/books/content?id=hFfhrCWiLSMC&printsec=frontcover&img=1&zoom=1"
        },
        "language": "en",
        "previewLink": "http://books.google.com/books?id=hFfhrCWiLSMC&printsec=frontcover&dq=The+Hobbit",
        "infoLink": "http://books.google.com/books?id=hFfhrCWiLSMC&dq=The+Hobbit",
        "canonicalVolumeLink": "https://books.google.com/books/about/The_Hobbit.html?hl=&id=hFfhrCWiLSMC"
      }
    }
  ]
}
```

**Field Mapping to Internal Book Model**:
| Google Books API Field | Book Model Field | Notes |
|------------------------|------------------|-------|
| `volumeInfo.industryIdentifiers[0].identifier` | `isbn` | Prefer ISBN_13 over ISBN_10 |
| `volumeInfo.title` | `title` | Direct mapping |
| `volumeInfo.authors[0]` | `author` | Join multiple authors with comma if needed |
| `volumeInfo.publishedDate` | `publicationYear` | Extract year from date string (e.g., "2012-02-15" → 2012) |
| `volumeInfo.pageCount` | `pageCount` | Direct mapping |
| `volumeInfo.dimensions.height` | `dimensions.height` | Parse numeric value from "20.3 cm" → 20.3 |
| `volumeInfo.dimensions.width` | `dimensions.width` | Parse numeric value |
| `volumeInfo.dimensions.thickness` | `dimensions.thickness` | Parse numeric value |
| `volumeInfo.imageLinks.thumbnail` | `coverImageUrl` | Use thumbnail, fallback to smallThumbnail |
| `volumeInfo.description` | `description` | Direct mapping |
| `id` | `googleBooksId` | Store for reference |

### Error Responses

**400 Bad Request**:
```json
{
  "error": {
    "code": 400,
    "message": "Missing required parameter: q",
    "errors": [...]
  }
}
```

**429 Too Many Requests** (Rate Limit Exceeded):
```json
{
  "error": {
    "code": 429,
    "message": "Rate limit exceeded. Try again later."
  }
}
```

**503 Service Unavailable** (API Down):
```json
{
  "error": {
    "code": 503,
    "message": "The service is currently unavailable"
  }
}
```

---

## Implementation Notes

### Request Patterns

**Search by Title + Author (Primary Use Case)**:
```typescript
const query = `${title}${author ? `+inauthor:${author}` : ''}`;
const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&projection=full`;
```

**Pagination ("Load More" Button)**:
```typescript
// First request: startIndex=0, maxResults=20
// Second request: startIndex=20, maxResults=20
// Third request: startIndex=40, maxResults=20
const url = `...&maxResults=20&startIndex=${page * 20}`;
```

### Data Transformation

**Parse Dimensions** (handle "20.3 cm" format):
```typescript
function parseDimension(dim: string | undefined): number | null {
  if (!dim) return null;
  const match = dim.match(/^([\d.]+)/);  // Extract numeric part
  return match ? parseFloat(match[1]) : null;
}
```

**Extract ISBN** (prefer ISBN-13):
```typescript
function extractISBN(identifiers: any[]): string | null {
  const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
  if (isbn13) return isbn13.identifier;

  const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
  return isbn10 ? isbn10.identifier : null;
}
```

**Parse Publication Year**:
```typescript
function extractYear(publishedDate: string): number | null {
  const match = publishedDate.match(/^(\d{4})/);
  return match ? parseInt(match[1]) : null;
}
```

### Error Handling

**Retry Strategy** (use RxJS `retry`):
```typescript
searchBooks(query: string): Observable<Book[]> {
  return this.http.get<GoogleBooksResponse>(url).pipe(
    map(response => this.transformResults(response)),
    retry({
      count: 2,
      delay: 1000,  // Wait 1 second between retries
      resetOnSuccess: true
    }),
    catchError(error => {
      if (error.status === 429) {
        console.warn('Google Books rate limit exceeded');
        return throwError(() => new Error('RATE_LIMIT'));
      }
      if (error.status >= 500) {
        console.warn('Google Books service unavailable');
        return throwError(() => new Error('SERVICE_UNAVAILABLE'));
      }
      return throwError(() => error);
    })
  );
}
```

### Caching Strategy

**In-Memory Cache** (session-based):
```typescript
private searchCache = new Map<string, Book[]>();

searchBooks(query: string): Observable<Book[]> {
  const cacheKey = query.toLowerCase();

  if (this.searchCache.has(cacheKey)) {
    return of(this.searchCache.get(cacheKey)!);
  }

  return this.http.get<GoogleBooksResponse>(url).pipe(
    map(response => this.transformResults(response)),
    tap(books => this.searchCache.set(cacheKey, books))
  );
}
```

### Rate Limiting (Client-Side)

**Debounce Search Input** (reduce API calls):
```typescript
// In search component
searchControl.valueChanges.pipe(
  debounceTime(500),  // Wait 500ms after user stops typing
  distinctUntilChanged(),  // Only if value actually changed
  switchMap(query => this.bookApi.searchBooks(query))
).subscribe(results => { /* ... */ });
```

---

## Testing Considerations

### Mock Response (for Unit Tests)

```typescript
const mockGoogleBooksResponse: GoogleBooksResponse = {
  kind: 'books#volumes',
  totalItems: 1,
  items: [{
    id: 'test-id-123',
    volumeInfo: {
      title: 'Test Book',
      authors: ['Test Author'],
      publishedDate: '2024-01-01',
      industryIdentifiers: [
        { type: 'ISBN_13', identifier: '9781234567890' }
      ],
      pageCount: 300,
      dimensions: {
        height: '20 cm',
        width: '15 cm',
        thickness: '2 cm'
      },
      imageLinks: {
        thumbnail: 'https://example.com/cover.jpg'
      },
      description: 'Test description'
    }
  }]
};
```

### E2E Testing Strategy

- **Network Stubbing**: Use Cypress `cy.intercept()` to mock API responses
- **Rate Limit Simulation**: Test fallback to Open Library when Google returns 429
- **Empty Results**: Test user flow when no books found
- **Slow Network**: Simulate 3G connection with delayed responses

---

## Compliance with Success Criteria

- **SC-002**: Book search returns initial 20 results within 3 seconds
  - ✅ Google Books API typical response time: 200-800ms
  - ✅ Client-side transformation adds <100ms
  - ✅ Total: <1s for 95% of queries (exceeds target)

- **FR-002**: Retrieve matching books with cover image, title, author, publication year
  - ✅ All fields available in `volumeInfo` object
  - ✅ Cover images available in `imageLinks.thumbnail`

---

## Known Limitations

1. **Dimensions Not Always Available**: ~40% of books lack physical dimension data
   - Mitigation: Display "Not Available" in UI, exclude from shelf space calculations

2. **Rate Limiting**: 1,000 requests/day without API key
   - Mitigation: Implement client-side debouncing, caching, fallback to Open Library

3. **ISBN Variations**: Some books have only ISBN-10 or only ISBN-13
   - Mitigation: Accept both formats, normalize to ISBN-13 when possible

4. **Multiple Editions**: Search returns many editions of same title
   - Expected: User selects desired edition from results list

5. **Image URLs Use HTTP**: Some cover URLs use HTTP not HTTPS
   - Mitigation: Rewrite URLs to HTTPS or proxy through HTTPS endpoint

---

## Next Steps

1. Implement `BookApiService.searchGoogleBooks()` method
2. Implement data transformation functions (dimension parsing, ISBN extraction)
3. Add unit tests for transformation logic
4. Add E2E test for search flow with mocked API responses
5. Document fallback to Open Library (see `open-library-api.md`)
