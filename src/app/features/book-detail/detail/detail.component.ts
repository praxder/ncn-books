import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReadingLogService } from '../../../core/services/reading-log.service';
import { Book } from '../../../core/models/book.model';
import { ReadingEntry, ReadingStatus } from '../../../core/models/reading-entry.model';
import { Note } from '../../../core/models/note.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {
  book: Book | null = null;
  entry: ReadingEntry | null = null;
  notes: Note[] = [];
  isLoading = true;

  statuses: ReadingStatus[] = ['Not Started', 'Currently Reading', 'Completed', 'Did Not Finish'];

  // Note management
  isAddingNote = false;
  newNoteControl = new FormControl('', [Validators.required, Validators.maxLength(10000)]);
  editingNoteId: number | null = null;
  editNoteControl = new FormControl('', [Validators.required, Validators.maxLength(10000)]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readingLog: ReadingLogService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    const isbn = this.route.snapshot.paramMap.get('isbn');
    if (!isbn) {
      this.router.navigate(['/library']);
      return;
    }

    await this.loadBookDetails(isbn);
  }

  /**
   * Load book with its reading entry and notes
   */
  async loadBookDetails(isbn: string): Promise<void> {
    this.isLoading = true;
    try {
      const result = await this.readingLog.getBookWithEntry(isbn);
      if (!result) {
        this.snackBar.open('Book not found', 'Close', { duration: 3000 });
        this.router.navigate(['/library']);
        return;
      }

      this.book = result.book;
      this.entry = result.entry;

      // Load notes
      this.notes = await this.readingLog.getNotesForEntry(result.entry.id);
    } catch (error) {
      console.error('Error loading book details:', error);
      this.snackBar.open('Error loading book details', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Update reading status
   */
  async updateStatus(newStatus: ReadingStatus): Promise<void> {
    if (!this.entry) return;

    try {
      await this.readingLog.updateStatus(this.entry.id, newStatus);
      this.entry.status = newStatus;

      // Update dates based on status
      if (newStatus === 'Currently Reading' && !this.entry.startedDate) {
        this.entry.startedDate = new Date();
      }
      if ((newStatus === 'Completed' || newStatus === 'Did Not Finish') && !this.entry.finishedDate) {
        this.entry.finishedDate = new Date();
      }
      this.entry.lastUpdated = new Date();

      this.snackBar.open('Status updated!', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error updating status:', error);
      this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
    }
  }

  /**
   * Get status chip color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'Not Started':
        return 'default';
      case 'Currently Reading':
        return 'primary';
      case 'Completed':
        return 'accent';
      case 'Did Not Finish':
        return 'warn';
      default:
        return 'default';
    }
  }

  /**
   * Delete book
   */
  async deleteBook(): Promise<void> {
    if (!this.book) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Book',
        message: `Are you sure you want to delete "${this.book.title}"? This will also delete all notes.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed && this.book) {
        try {
          await this.readingLog.deleteBook(this.book.isbn);
          this.snackBar.open('Book deleted', 'Close', { duration: 2000 });
          this.router.navigate(['/library']);
        } catch (error) {
          console.error('Error deleting book:', error);
          this.snackBar.open('Error deleting book', 'Close', { duration: 3000 });
        }
      }
    });
  }

  /**
   * Navigate back to library
   */
  goBack(): void {
    this.router.navigate(['/library']);
  }

  /**
   * Show add note form
   */
  showAddNoteForm(): void {
    this.isAddingNote = true;
    this.newNoteControl.reset();
  }

  /**
   * Cancel adding note
   */
  cancelAddNote(): void {
    this.isAddingNote = false;
    this.newNoteControl.reset();
  }

  /**
   * Add new note
   */
  async addNote(): Promise<void> {
    if (!this.entry || !this.newNoteControl.valid) return;

    const content = this.newNoteControl.value?.trim();
    if (!content) return;

    try {
      const noteId = await this.readingLog.addNote(this.entry.id, content);

      // Add to local array
      const newNote: Note = {
        id: noteId,
        readingEntryId: this.entry.id,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.notes.unshift(newNote); // Add to beginning (most recent first)

      this.snackBar.open('Note added!', 'Close', { duration: 2000 });
      this.isAddingNote = false;
      this.newNoteControl.reset();
    } catch (error) {
      console.error('Error adding note:', error);
      this.snackBar.open('Error adding note', 'Close', { duration: 3000 });
    }
  }

  /**
   * Start editing note
   */
  startEditNote(note: Note): void {
    this.editingNoteId = note.id;
    this.editNoteControl.setValue(note.content);
  }

  /**
   * Cancel editing note
   */
  cancelEditNote(): void {
    this.editingNoteId = null;
    this.editNoteControl.reset();
  }

  /**
   * Save edited note
   */
  async saveEditNote(note: Note): Promise<void> {
    if (!this.editNoteControl.valid) return;

    const content = this.editNoteControl.value?.trim();
    if (!content) return;

    try {
      await this.readingLog.updateNote(note.id, content);

      // Update local array
      note.content = content;
      note.updatedAt = new Date();

      this.snackBar.open('Note updated!', 'Close', { duration: 2000 });
      this.editingNoteId = null;
      this.editNoteControl.reset();
    } catch (error) {
      console.error('Error updating note:', error);
      this.snackBar.open('Error updating note', 'Close', { duration: 3000 });
    }
  }

  /**
   * Delete note
   */
  async deleteNote(note: Note): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Note',
        message: 'Are you sure you want to delete this note?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.readingLog.deleteNote(note.id);

          // Remove from local array
          this.notes = this.notes.filter(n => n.id !== note.id);

          this.snackBar.open('Note deleted', 'Close', { duration: 2000 });
        } catch (error) {
          console.error('Error deleting note:', error);
          this.snackBar.open('Error deleting note', 'Close', { duration: 3000 });
        }
      }
    });
  }
}
