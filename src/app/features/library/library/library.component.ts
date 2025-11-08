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
import { SortSelectorComponent, SortOption } from '../../../shared/components/sort-selector/sort-selector.component';

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
    FilterBarComponent,
    SortSelectorComponent
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent implements OnInit {
  allBooks: BookWithEntry[] = [];
  filteredBooks: BookWithEntry[] = [];
  selectedStatuses: ReadingStatus[] = [];
  selectedSort: SortOption = 'recently-updated';
  isLoading = true;

  constructor(
    private readingLog: ReadingLogService,
    private storage: StorageService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadPreferences();
    await this.loadBooks();
  }

  /**
   * Load saved preferences
   */
  async loadPreferences(): Promise<void> {
    try {
      // Load filter preference
      const filterPref = await this.storage.getPreference('library-status-filter');
      if (filterPref?.value && Array.isArray(filterPref.value)) {
        this.selectedStatuses = filterPref.value;
      }

      // Load sort preference
      const sortPref = await this.storage.getPreference('library-sort');
      if (sortPref?.value && typeof sortPref.value === 'string') {
        this.selectedSort = sortPref.value as SortOption;
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
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
   * Apply status filters and sorting
   */
  applyFilters(): void {
    // Filter
    let books = this.allBooks;
    if (this.selectedStatuses.length > 0) {
      books = books.filter(item =>
        this.selectedStatuses.includes(item.entry.status)
      );
    }

    // Sort
    this.filteredBooks = this.sortBooks(books, this.selectedSort);
  }

  /**
   * Sort books based on selected option
   */
  sortBooks(books: BookWithEntry[], sortOption: SortOption): BookWithEntry[] {
    const sorted = [...books];

    switch (sortOption) {
      case 'title-asc':
        return sorted.sort((a, b) =>
          a.book.title.localeCompare(b.book.title)
        );
      case 'author-asc':
        return sorted.sort((a, b) =>
          a.book.author.localeCompare(b.book.author)
        );
      case 'recently-updated':
      default:
        return sorted.sort((a, b) =>
          b.entry.lastUpdated.getTime() - a.entry.lastUpdated.getTime()
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
   * Handle sort change
   */
  async onSortChange(sortOption: SortOption): Promise<void> {
    this.selectedSort = sortOption;
    this.applyFilters();

    // Save preference
    try {
      await this.storage.setPreference('library-sort', sortOption);
    } catch (error) {
      console.error('Error saving sort preference:', error);
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
