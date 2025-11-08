import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from '../models/book.model';

interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}

interface GoogleBooksVolume {
  kind: string;
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    dimensions?: {
      height?: string;
      width?: string;
      thickness?: string;
    };
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
  };
}

/**
 * Google Books API service for book metadata
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleBooksApiService {
  private readonly apiUrl = `${environment.googleBooksApiUrl}/volumes`;

  constructor(private http: HttpClient) {}

  /**
   * Search for books by title and optional author
   */
  search(title: string, author?: string, maxResults: number = 20, startIndex: number = 0): Observable<Book[]> {
    let query = title;
    if (author) {
      query += `+inauthor:${author}`;
    }

    const params = {
      q: query,
      maxResults: maxResults.toString(),
      startIndex: startIndex.toString(),
      projection: 'full'
    };

    return this.http.get<GoogleBooksResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        if (!response.items || response.items.length === 0) {
          return [];
        }
        return response.items.map(item => this.mapToBook(item));
      }),
      catchError(error => {
        console.error('Google Books API error:', error);
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
      maxResults: '1',
      projection: 'full'
    };

    return this.http.get<GoogleBooksResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        if (!response.items || response.items.length === 0) {
          return [];
        }
        return response.items.map(item => this.mapToBook(item));
      }),
      catchError(error => {
        console.error('Google Books API error:', error);
        return of([]);
      })
    );
  }

  /**
   * Map Google Books volume to internal Book model
   */
  private mapToBook(volume: GoogleBooksVolume): Book {
    const info = volume.volumeInfo;

    // Extract ISBN (prefer ISBN-13 over ISBN-10)
    const isbn = this.extractIsbn(info.industryIdentifiers);

    // Extract publication year from date
    const publicationYear = info.publishedDate
      ? parseInt(info.publishedDate.substring(0, 4), 10)
      : null;

    // Parse dimensions
    const dimensions = info.dimensions ? {
      height: this.parseDimension(info.dimensions.height),
      width: this.parseDimension(info.dimensions.width),
      thickness: this.parseDimension(info.dimensions.thickness)
    } : null;

    // Get cover image (prefer thumbnail over smallThumbnail)
    const coverImageUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;

    return {
      isbn: isbn || `GOOGLE-${volume.id}`, // Fallback to Google Books ID if no ISBN
      title: info.title,
      author: info.authors ? info.authors.join(', ') : 'Unknown Author',
      publicationYear,
      pageCount: info.pageCount || null,
      dimensions,
      coverImageUrl,
      description: info.description || null,
      googleBooksId: volume.id,
      openLibraryKey: null,
      source: 'google-books',
      addedAt: new Date()
    };
  }

  /**
   * Extract ISBN from industry identifiers (prefer ISBN-13)
   */
  private extractIsbn(identifiers?: Array<{ type: string; identifier: string }>): string | null {
    if (!identifiers || identifiers.length === 0) {
      return null;
    }

    // Try to find ISBN-13
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
    if (isbn13) {
      return isbn13.identifier;
    }

    // Fallback to ISBN-10
    const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
    if (isbn10) {
      return isbn10.identifier;
    }

    // Return first identifier as last resort
    return identifiers[0]?.identifier || null;
  }

  /**
   * Parse dimension string (e.g., "20.3 cm" -> 20.3)
   */
  private parseDimension(dimension: string | undefined): number | null {
    if (!dimension) {
      return null;
    }

    const match = dimension.match(/^([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }
}
