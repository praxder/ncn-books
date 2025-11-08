import { Injectable } from '@angular/core';
import { Observable, catchError, of, shareReplay, retry, timer } from 'rxjs';
import { GoogleBooksApiService } from './google-books-api.service';
import { OpenLibraryApiService } from './open-library-api.service';
import { Book } from '../models/book.model';

/**
 * Unified book API service with waterfall fallback, retry logic, and caching
 *
 * Strategy: Try Google Books first, fallback to Open Library if it fails
 * Features:
 * - Automatic retry with exponential backoff (3 attempts)
 * - Result caching via shareReplay
 * - Error handling with graceful fallback
 */
@Injectable({
  providedIn: 'root'
})
export class BookApiService {
  // Simple in-memory cache for search results
  private searchCache = new Map<string, Observable<Book[]>>();

  constructor(
    private googleBooksApi: GoogleBooksApiService,
    private openLibraryApi: OpenLibraryApiService
  ) {}

  /**
   * Search for books with waterfall fallback and caching
   * 1. Check cache first
   * 2. Try Google Books API with retry
   * 3. If fails or returns empty, try Open Library API with retry
   * 4. If both fail, return empty array
   */
  search(title: string, author?: string, maxResults: number = 20, startIndex: number = 0): Observable<Book[]> {
    // Create cache key
    const cacheKey = `${title}-${author || ''}-${maxResults}-${startIndex}`;

    // Return cached result if available
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    // Create new search observable with retry logic
    const search$ = this.googleBooksApi.search(title, author, maxResults, startIndex).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          // Exponential backoff: 1s, 2s, 4s
          const delayMs = Math.pow(2, retryCount - 1) * 1000;
          console.warn(`Retry attempt ${retryCount} after ${delayMs}ms`, error);
          return timer(delayMs);
        }
      }),
      catchError(error => {
        console.warn('Google Books failed after retries, trying Open Library', error);
        return this.openLibraryApi.search(title, author, maxResults, startIndex).pipe(
          retry({
            count: 3,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount - 1) * 1000;
              return timer(delayMs);
            }
          })
        );
      }),
      catchError(error => {
        console.error('Both APIs failed after retries', error);
        return of([]);
      }),
      shareReplay(1) // Cache the result
    );

    // Store in cache
    this.searchCache.set(cacheKey, search$);

    // Clear from cache after 5 minutes
    setTimeout(() => {
      this.searchCache.delete(cacheKey);
    }, 5 * 60 * 1000);

    return search$;
  }

  /**
   * Search by ISBN with waterfall fallback and retry logic
   */
  searchByIsbn(isbn: string): Observable<Book[]> {
    const cacheKey = `isbn-${isbn}`;

    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    const search$ = this.googleBooksApi.searchByIsbn(isbn).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          const delayMs = Math.pow(2, retryCount - 1) * 1000;
          return timer(delayMs);
        }
      }),
      catchError(error => {
        console.warn('Google Books failed, trying Open Library', error);
        return this.openLibraryApi.searchByIsbn(isbn).pipe(
          retry({
            count: 3,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount - 1) * 1000;
              return timer(delayMs);
            }
          })
        );
      }),
      catchError(error => {
        console.error('Both APIs failed', error);
        return of([]);
      }),
      shareReplay(1)
    );

    this.searchCache.set(cacheKey, search$);

    setTimeout(() => {
      this.searchCache.delete(cacheKey);
    }, 5 * 60 * 1000);

    return search$;
  }

  /**
   * Clear all cached search results
   */
  clearCache(): void {
    this.searchCache.clear();
  }
}
