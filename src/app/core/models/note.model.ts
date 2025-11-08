/**
 * Note model representing personal annotations for a book
 */
export interface Note {
  // Primary Key
  id: number;  // Auto-increment

  // Foreign Key
  readingEntryId: number;  // References ReadingEntry.id

  // Content
  content: string;  // Note text (plain text, max 10,000 chars)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
