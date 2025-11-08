import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Book } from '../models/book.model';
import { ReadingEntry } from '../models/reading-entry.model';
import { Note } from '../models/note.model';
import { UserPreference } from '../models/user-preference.model';

export interface ExportData {
  version: string;
  exportDate: string;
  books: Book[];
  readingEntries: ReadingEntry[];
  notes: Note[];
  preferences: UserPreference[];
}

export interface ImportResult {
  success: boolean;
  booksImported: number;
  entriesImported: number;
  notesImported: number;
  preferencesImported: number;
  conflicts: ImportConflict[];
  errors: string[];
}

export interface ImportConflict {
  type: 'book' | 'entry' | 'note' | 'preference';
  identifier: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportImportService {
  private readonly EXPORT_VERSION = '1.0';

  constructor(private storage: StorageService) { }

  /**
   * Export all data to JSON
   */
  async exportData(): Promise<ExportData> {
    const [books, entries, notes, preferences] = await Promise.all([
      this.storage.getAllBooks(),
      this.storage.getAllReadingEntries(),
      this.storage.getAllNotes(),
      this.storage.getAllPreferences()
    ]);

    return {
      version: this.EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      books,
      readingEntries: entries,
      notes,
      preferences
    };
  }

  /**
   * Download export as JSON file
   */
  async downloadExport(): Promise<void> {
    const data = await this.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ncn-books-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import data from JSON
   */
  async importData(data: ExportData, strategy: 'merge' | 'replace' = 'merge'): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      booksImported: 0,
      entriesImported: 0,
      notesImported: 0,
      preferencesImported: 0,
      conflicts: [],
      errors: []
    };

    try {
      // Validate data structure
      if (!this.validateImportData(data)) {
        result.errors.push('Invalid import data format');
        return result;
      }

      // Handle replace strategy
      if (strategy === 'replace') {
        await this.clearAllData();
      }

      // Import books
      for (const book of data.books) {
        try {
          const existing = await this.storage.getBook(book.isbn);
          if (existing && strategy === 'merge') {
            // Check if imported book is newer
            if (new Date(book.addedAt) > new Date(existing.addedAt)) {
              await this.storage.updateBook(book.isbn, book);
              result.booksImported++;
            } else {
              result.conflicts.push({
                type: 'book',
                identifier: book.isbn,
                message: `Book "${book.title}" already exists and is newer`
              });
            }
          } else {
            await this.storage.addBook(book);
            result.booksImported++;
          }
        } catch (error) {
          result.errors.push(`Failed to import book ${book.isbn}: ${error}`);
        }
      }

      // Import reading entries
      for (const entry of data.readingEntries) {
        try {
          const existing = await this.storage.getReadingEntry(entry.id);
          if (existing && strategy === 'merge') {
            // Keep the most recently updated entry
            if (new Date(entry.lastUpdated) > new Date(existing.lastUpdated)) {
              await this.storage.updateReadingEntry(entry.id, {
                status: entry.status,
                startedDate: entry.startedDate,
                finishedDate: entry.finishedDate,
                currentPage: entry.currentPage
              });
              result.entriesImported++;
            } else {
              result.conflicts.push({
                type: 'entry',
                identifier: entry.id.toString(),
                message: `Entry for book ${entry.isbn} already exists and is newer`
              });
            }
          } else {
            await this.storage.addReadingEntry(entry);
            result.entriesImported++;
          }
        } catch (error) {
          result.errors.push(`Failed to import entry ${entry.id}: ${error}`);
        }
      }

      // Import notes
      for (const note of data.notes) {
        try {
          const existing = await this.storage.getNote(note.id);
          if (existing && strategy === 'merge') {
            // Keep the most recently updated note
            if (new Date(note.updatedAt) > new Date(existing.updatedAt)) {
              await this.storage.updateNote(note.id, note.content);
              result.notesImported++;
            } else {
              result.conflicts.push({
                type: 'note',
                identifier: note.id.toString(),
                message: `Note ${note.id} already exists and is newer`
              });
            }
          } else {
            await this.storage.addNote(note);
            result.notesImported++;
          }
        } catch (error) {
          result.errors.push(`Failed to import note ${note.id}: ${error}`);
        }
      }

      // Import preferences
      for (const pref of data.preferences) {
        try {
          await this.storage.setPreference(pref.key, pref.value);
          result.preferencesImported++;
        } catch (error) {
          result.errors.push(`Failed to import preference ${pref.key}: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push(`Import failed: ${error}`);
      return result;
    }
  }

  /**
   * Import from file
   */
  async importFromFile(file: File, strategy: 'merge' | 'replace' = 'merge'): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);
      return await this.importData(data, strategy);
    } catch (error) {
      return {
        success: false,
        booksImported: 0,
        entriesImported: 0,
        notesImported: 0,
        preferencesImported: 0,
        conflicts: [],
        errors: [`Failed to parse import file: ${error}`]
      };
    }
  }

  /**
   * Validate import data structure
   */
  private validateImportData(data: any): data is ExportData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.exportDate === 'string' &&
      Array.isArray(data.books) &&
      Array.isArray(data.readingEntries) &&
      Array.isArray(data.notes) &&
      Array.isArray(data.preferences)
    );
  }

  /**
   * Clear all data from database
   */
  private async clearAllData(): Promise<void> {
    await Promise.all([
      this.storage.clearAllBooks(),
      this.storage.clearAllNotes(),
      this.storage.clearAllPreferences()
    ]);
  }
}
