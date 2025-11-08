import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ReadingLogService } from '../../../core/services/reading-log.service';
import { StorageService } from '../../../core/services/storage.service';
import { Book } from '../../../core/models/book.model';
import { ReadingEntry, ReadingStatus } from '../../../core/models/reading-entry.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FilterBarComponent } from '../../../shared/components/filter-bar/filter-bar.component';

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
    LoadingSpinnerComponent,
    FilterBarComponent
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent implements OnInit {
  allBooks: BookWithEntry[] = [];
  filteredBooks: BookWithEntry[] = [];
  selectedStatuses: ReadingStatus[] = [];
  isLoading = true;

  constructor(
    private readingLog: ReadingLogService,
    private storage: StorageService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadFilterPreference();
    await this.loadBooks();
  }

  /**
   * Load saved filter preference
   */
  async loadFilterPreference(): Promise<void> {
    try {
      const pref = await this.storage.getPreference('library-status-filter');
      if (pref?.value && Array.isArray(pref.value)) {
        this.selectedStatuses = pref.value;
      }
    } catch (error) {
      console.error('Error loading filter preference:', error);
    }
  }

  /**
   * Load all books with their reading entries
   */
  async loadBooks(): Promise<void> {
    this.isLoading = true;
    try {
      this.allBooks = await this.readingLog.getAllBooksWithEntries();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading books:', error);
      this.allBooks = [];
      this.filteredBooks = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Apply status filters
   */
  applyFilters(): void {
    if (this.selectedStatuses.length === 0) {
      this.filteredBooks = this.allBooks;
    } else {
      this.filteredBooks = this.allBooks.filter(item =>
        this.selectedStatuses.includes(item.entry.status)
      );
    }
  }

  /**
   * Handle status filter change
   */
  async onStatusFilterChange(statuses: ReadingStatus[]): Promise<void> {
    this.selectedStatuses = statuses;
    this.applyFilters();

    // Save preference
    try {
      await this.storage.setPreference('library-status-filter', statuses);
    } catch (error) {
      console.error('Error saving filter preference:', error);
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
