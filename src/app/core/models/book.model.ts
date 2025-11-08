/**
 * Book model representing a book with metadata from Google Books or Open Library API
 */
export interface Book {
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
