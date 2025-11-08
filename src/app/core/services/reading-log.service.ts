import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Book } from '../models/book.model';
import { ReadingEntry, ReadingStatus } from '../models/reading-entry.model';
import { DbService } from './db.service';

/**
 * Reading Log service for managing books and reading entries
 *
 * Provides business logic for adding books, updating statuses, and managing notes
 */
@Injectable({
  providedIn: 'root'
})
export class ReadingLogService {
  constructor(
    private storage: StorageService,
    private db: DbService
  ) {}

  /**
   * Add a book to the reading log
   *
   * Creates both Book and ReadingEntry with status "Not Started" atomically
   * @throws Error if book with same ISBN already exists
   */
  async addBook(book: Book): Promise<{ bookIsbn: string; entryId: number }> {
    // Check for duplicates
    const existingBook = await this.storage.getBook(book.isbn);
    if (existingBook) {
      throw new Error(`Book "${book.title}" (ISBN: ${book.isbn}) is already in your library`);
    }

    // Use transaction to ensure atomicity
    return await this.db.transaction('rw', [this.db.books, this.db.readingEntries], async () => {
      // Add book
      const bookIsbn = await this.storage.addBook(book);

      // Create reading entry with "Not Started" status
      const entry: Omit<ReadingEntry, 'id'> = {
        isbn: book.isbn,
        status: 'Not Started',
        startedDate: null,
        finishedDate: null,
        lastUpdated: new Date()
      };

      const entryId = await this.storage.addReadingEntry(entry);

      return { bookIsbn, entryId };
    });
  }

  /**
   * Update reading status
   *
   * Handles automatic date recording:
   * - → "Currently Reading": Set startedDate if null
   * - → "Completed" or "DNF": Set finishedDate if null
   */
  async updateStatus(entryId: number, newStatus: ReadingStatus): Promise<void> {
    const entry = await this.storage.getReadingEntry(entryId);
    if (!entry) {
      throw new Error('Reading entry not found');
    }

    const updates: Partial<ReadingEntry> = {
      status: newStatus
    };

    // Auto-set dates based on status transitions
    if (newStatus === 'Currently Reading' && !entry.startedDate) {
      updates.startedDate = new Date();
    }

    if ((newStatus === 'Completed' || newStatus === 'Did Not Finish') && !entry.finishedDate) {
      updates.finishedDate = new Date();
    }

    await this.storage.updateReadingEntry(entryId, updates);
  }

  /**
   * Get book with its reading entry
   */
  async getBookWithEntry(isbn: string): Promise<{ book: Book; entry: ReadingEntry } | null> {
    const book = await this.storage.getBook(isbn);
    if (!book) {
      return null;
    }

    const entry = await this.storage.getReadingEntryByIsbn(isbn);
    if (!entry) {
      return null;
    }

    return { book, entry };
  }

  /**
   * Get all books with their reading entries (for library view)
   */
  async getAllBooksWithEntries(): Promise<Array<{ book: Book; entry: ReadingEntry }>> {
    const entries = await this.storage.getReadingEntriesByRecentlyUpdated();
    const results: Array<{ book: Book; entry: ReadingEntry }> = [];

    for (const entry of entries) {
      const book = await this.storage.getBook(entry.isbn);
      if (book) {
        results.push({ book, entry });
      }
    }

    return results;
  }

  /**
   * Get books filtered by status
   */
  async getBooksByStatus(status: ReadingStatus): Promise<Array<{ book: Book; entry: ReadingEntry }>> {
    const entries = await this.storage.getReadingEntriesByStatus(status);
    const results: Array<{ book: Book; entry: ReadingEntry }> = [];

    for (const entry of entries) {
      const book = await this.storage.getBook(entry.isbn);
      if (book) {
        results.push({ book, entry });
      }
    }

    return results;
  }

  /**
   * Delete a book (cascades to reading entry and notes)
   */
  async deleteBook(isbn: string): Promise<void> {
    await this.storage.deleteBook(isbn);
  }

  /**
   * Add a note to a reading entry
   */
  async addNote(readingEntryId: number, content: string): Promise<number> {
    if (!content || content.trim().length === 0) {
      throw new Error('Note content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error('Note content cannot exceed 10,000 characters');
    }

    const note = {
      readingEntryId,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const noteId = await this.storage.addNote(note);

    // Update reading entry's lastUpdated timestamp
    await this.storage.updateReadingEntry(readingEntryId, {});

    return noteId;
  }

  /**
   * Update a note
   */
  async updateNote(noteId: number, content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Note content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error('Note content cannot exceed 10,000 characters');
    }

    const note = await this.storage.getNote(noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    await this.storage.updateNote(noteId, content.trim());

    // Update reading entry's lastUpdated timestamp
    await this.storage.updateReadingEntry(note.readingEntryId, {});
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: number): Promise<void> {
    const note = await this.storage.getNote(noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    await this.storage.deleteNote(noteId);

    // Update reading entry's lastUpdated timestamp
    await this.storage.updateReadingEntry(note.readingEntryId, {});
  }

  /**
   * Get all notes for a reading entry
   */
  async getNotesForEntry(readingEntryId: number) {
    return await this.storage.getNotesByReadingEntry(readingEntryId);
  }
}
