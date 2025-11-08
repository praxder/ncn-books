import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Book } from '../models/book.model';
import { ReadingEntry } from '../models/reading-entry.model';
import { Note } from '../models/note.model';
import { UserPreference } from '../models/user-preference.model';

/**
 * Storage service providing CRUD operations for all entities
 *
 * All database operations use Dexie transactions for data integrity.
 * This service is the single source of truth for data access.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private db: DbService) {}

  // ============================================================
  // BOOK OPERATIONS
  // ============================================================

  /**
   * Add a new book to the database
   * @throws Error if book with same ISBN already exists
   */
  async addBook(book: Book): Promise<string> {
    const existing = await this.db.books.get(book.isbn);
    if (existing) {
      throw new Error(`Book with ISBN ${book.isbn} already exists`);
    }
    return await this.db.books.add(book);
  }

  /**
   * Get a book by ISBN
   */
  async getBook(isbn: string): Promise<Book | undefined> {
    return await this.db.books.get(isbn);
  }

  /**
   * Get all books
   */
  async getAllBooks(): Promise<Book[]> {
    return await this.db.books.toArray();
  }

  /**
   * Update a book
   */
  async updateBook(isbn: string, changes: Partial<Book>): Promise<number> {
    return await this.db.books.update(isbn, changes);
  }

  /**
   * Delete a book (also deletes associated reading entry and notes)
   */
  async deleteBook(isbn: string): Promise<void> {
    await this.db.transaction('rw', [this.db.books, this.db.readingEntries, this.db.notes], async () => {
      // Find reading entry for this book
      const entry = await this.db.readingEntries.where('isbn').equals(isbn).first();

      if (entry) {
        // Delete all notes for this reading entry
        await this.db.notes.where('readingEntryId').equals(entry.id).delete();

        // Delete reading entry
        await this.db.readingEntries.delete(entry.id);
      }

      // Delete book
      await this.db.books.delete(isbn);
    });
  }

  // ============================================================
  // READING ENTRY OPERATIONS
  // ============================================================

  /**
   * Add a new reading entry
   */
  async addReadingEntry(entry: Omit<ReadingEntry, 'id'>): Promise<number> {
    return await this.db.readingEntries.add(entry as ReadingEntry);
  }

  /**
   * Get reading entry by ID
   */
  async getReadingEntry(id: number): Promise<ReadingEntry | undefined> {
    return await this.db.readingEntries.get(id);
  }

  /**
   * Get reading entry by ISBN
   */
  async getReadingEntryByIsbn(isbn: string): Promise<ReadingEntry | undefined> {
    return await this.db.readingEntries.where('isbn').equals(isbn).first();
  }

  /**
   * Get all reading entries
   */
  async getAllReadingEntries(): Promise<ReadingEntry[]> {
    return await this.db.readingEntries.toArray();
  }

  /**
   * Get reading entries sorted by last updated (most recent first)
   */
  async getReadingEntriesByRecentlyUpdated(): Promise<ReadingEntry[]> {
    return await this.db.readingEntries.orderBy('lastUpdated').reverse().toArray();
  }

  /**
   * Get reading entries filtered by status
   */
  async getReadingEntriesByStatus(status: string): Promise<ReadingEntry[]> {
    return await this.db.readingEntries.where('status').equals(status).toArray();
  }

  /**
   * Update a reading entry
   */
  async updateReadingEntry(id: number, changes: Partial<ReadingEntry>): Promise<number> {
    const updates = { ...changes, lastUpdated: new Date() };
    return await this.db.readingEntries.update(id, updates);
  }

  /**
   * Delete a reading entry (also deletes associated notes)
   */
  async deleteReadingEntry(id: number): Promise<void> {
    await this.db.transaction('rw', [this.db.readingEntries, this.db.notes], async () => {
      // Delete all notes for this reading entry
      await this.db.notes.where('readingEntryId').equals(id).delete();

      // Delete reading entry
      await this.db.readingEntries.delete(id);
    });
  }

  // ============================================================
  // NOTE OPERATIONS
  // ============================================================

  /**
   * Add a new note
   */
  async addNote(note: Omit<Note, 'id'>): Promise<number> {
    return await this.db.notes.add(note as Note);
  }

  /**
   * Get note by ID
   */
  async getNote(id: number): Promise<Note | undefined> {
    return await this.db.notes.get(id);
  }

  /**
   * Get all notes for a reading entry
   */
  async getNotesByReadingEntry(readingEntryId: number): Promise<Note[]> {
    return await this.db.notes
      .where('readingEntryId')
      .equals(readingEntryId)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * Update a note
   */
  async updateNote(id: number, content: string): Promise<number> {
    return await this.db.notes.update(id, {
      content,
      updatedAt: new Date()
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(id: number): Promise<void> {
    await this.db.notes.delete(id);
  }

  // ============================================================
  // USER PREFERENCE OPERATIONS
  // ============================================================

  /**
   * Get a preference value by key
   */
  async getPreference(key: string): Promise<any | undefined> {
    const pref = await this.db.preferences.get(key);
    return pref?.value;
  }

  /**
   * Set a preference value
   */
  async setPreference(key: string, value: any): Promise<string> {
    return await this.db.preferences.put({
      key,
      value,
      updatedAt: new Date()
    });
  }

  /**
   * Delete a preference
   */
  async deletePreference(key: string): Promise<void> {
    await this.db.preferences.delete(key);
  }

  // ============================================================
  // UTILITY OPERATIONS
  // ============================================================

  /**
   * Clear all data (useful for testing/reset)
   */
  async clearAllData(): Promise<void> {
    await this.db.transaction('rw', [this.db.books, this.db.readingEntries, this.db.notes, this.db.preferences], async () => {
      await this.db.books.clear();
      await this.db.readingEntries.clear();
      await this.db.notes.clear();
      await this.db.preferences.clear();
    });
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ books: number; entries: number; notes: number }> {
    const [books, entries, notes] = await Promise.all([
      this.db.books.count(),
      this.db.readingEntries.count(),
      this.db.notes.count()
    ]);
    return { books, entries, notes };
  }
}
