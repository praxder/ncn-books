import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from '../models/book.model';

interface OpenLibraryResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibraryDoc[];
}

interface OpenLibraryDoc {
  key: string;  // Work key like "/works/OL27479W"
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  number_of_pages_median?: number;
  cover_i?: number;  // Cover ID
  publisher?: string[];
  language?: string[];
  subject?: string[];
}

/**
 * Open Library API service for book metadata (fallback)
 */
@Injectable({
  providedIn: 'root'
})
export class OpenLibraryApiService {
  private readonly apiUrl = `${environment.openLibraryApiUrl}/search.json`;
  private readonly coverUrl = 'https://covers.openlibrary.org/b/id';

  constructor(private http: HttpClient) {}

  /**
   * Search for books by title and optional author
   */
  search(title: string, author?: string, limit: number = 20, offset: number = 0): Observable<Book[]> {
    let query = title;
    if (author) {
      query += ` author:${author}`;
    }

    const params = {
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: 'key,title,author_name,first_publish_year,isbn,number_of_pages_median,cover_i'
    };

    return this.http.get<OpenLibraryResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        if (!response.docs || response.docs.length === 0) {
          return [];
        }
        return response.docs.map(doc => this.mapToBook(doc));
      }),
      catchError(error => {
        console.error('Open Library API error:', error);
        return of([]);
      })
    );
  }

  /**
   * Search for books by ISBN
   */
  searchByIsbn(isbn: string): Observable<Book[]> {
    const params = {
      q: `isbn:${isbn}`,
      limit: '1',
      fields: 'key,title,author_name,first_publish_year,isbn,number_of_pages_median,cover_i'
    };

    return this.http.get<OpenLibraryResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        if (!response.docs || response.docs.length === 0) {
          return [];
        }
        return response.docs.map(doc => this.mapToBook(doc));
      }),
      catchError(error => {
        console.error('Open Library API error:', error);
        return of([]);
      })
    );
  }

  /**
   * Map Open Library doc to internal Book model
   */
  private mapToBook(doc: OpenLibraryDoc): Book {
    // Extract ISBN (prefer ISBN-13 over ISBN-10)
    const isbn = this.extractIsbn(doc.isbn);

    // Construct cover image URL if cover_i exists
    const coverImageUrl = doc.cover_i
      ? `${this.coverUrl}/${doc.cover_i}-L.jpg`
      : null;

    return {
      isbn: isbn || `OPENLIBRARY-${doc.key}`, // Fallback to work key if no ISBN
      title: doc.title,
      author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
      publicationYear: doc.first_publish_year || null,
      pageCount: doc.number_of_pages_median || null,
      dimensions: null, // Open Library doesn't provide dimensions
      coverImageUrl,
      description: null, // Not available in search endpoint
      googleBooksId: null,
      openLibraryKey: doc.key,
      source: 'open-library',
      addedAt: new Date()
    };
  }

  /**
   * Extract ISBN from list (prefer ISBN-13)
   */
  private extractIsbn(isbns?: string[]): string | null {
    if (!isbns || isbns.length === 0) {
      return null;
    }

    // Try to find ISBN-13 (starts with 978 or 979)
    const isbn13 = isbns.find(isbn =>
      isbn.startsWith('978') || isbn.startsWith('979')
    );
    if (isbn13) {
      return isbn13;
    }

    // Return first ISBN as fallback
    return isbns[0] || null;
  }
}
