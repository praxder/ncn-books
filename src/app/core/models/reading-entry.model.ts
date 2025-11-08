/**
 * Reading Entry model representing a user's relationship with a book
 */

export type ReadingStatus = 'Not Started' | 'Currently Reading' | 'Completed' | 'Did Not Finish';

export interface ReadingEntry {
  // Primary Key
  id: number;  // Auto-increment

  // Foreign Key
  isbn: string;  // References Book.isbn

  // Reading Status
  status: ReadingStatus;

  // Dates
  startedDate: Date | null;   // When status changed to "Currently Reading"
  finishedDate: Date | null;  // When status changed to "Completed" or "DNF"
  lastUpdated: Date;          // Last time status or dates were modified

  // Future Enhancement (Optional)
  currentPage?: number | null;  // Track page progress (P5 feature)
}
