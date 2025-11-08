import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Book } from '../models/book.model';
import { ReadingEntry } from '../models/reading-entry.model';
import { Note } from '../models/note.model';
import { UserPreference } from '../models/user-preference.model';

/**
 * Database service for managing IndexedDB via Dexie.js
 *
 * This service initializes the database schema and provides typed table access.
 * All CRUD operations should go through StorageService, not directly through this service.
 */
@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  // Tables
  books!: Table<Book, string>;  // Primary key: isbn (string)
  readingEntries!: Table<ReadingEntry, number>;  // Primary key: id (auto-increment)
  notes!: Table<Note, number>;  // Primary key: id (auto-increment)
  preferences!: Table<UserPreference, string>;  // Primary key: key (string)

  constructor() {
    super('NCNBooksDB');

    // Define schema version 1
    this.version(1).stores({
      books: 'isbn, title, author, publicationYear',
      readingEntries: '++id, isbn, status, lastUpdated, startedDate, finishedDate',
      notes: '++id, readingEntryId, createdAt, updatedAt',
      preferences: 'key'
    });
  }
}
