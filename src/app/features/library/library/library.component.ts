import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ReadingLogService } from '../../../core/services/reading-log.service';
import { Book } from '../../../core/models/book.model';
import { ReadingEntry } from '../../../core/models/reading-entry.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface BookWithEntry {
  book: Book;
  entry: ReadingEntry;
}

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent implements OnInit {
  books: BookWithEntry[] = [];
  isLoading = true;

  constructor(
    private readingLog: ReadingLogService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadBooks();
  }

  /**
   * Load all books with their reading entries
   */
  async loadBooks(): Promise<void> {
    this.isLoading = true;
    try {
      this.books = await this.readingLog.getAllBooksWithEntries();
    } catch (error) {
      console.error('Error loading books:', error);
      this.books = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Navigate to book detail page
   */
  viewBookDetail(isbn: string): void {
    this.router.navigate(['/book', isbn]);
  }

  /**
   * Navigate to search page
   */
  goToSearch(): void {
    this.router.navigate(['/search']);
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
}
