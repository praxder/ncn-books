import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap } from 'rxjs';
import { BookApiService } from '../../../core/services/book-api.service';
import { ReadingLogService } from '../../../core/services/reading-log.service';
import { Book } from '../../../core/models/book.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  books: Book[] = [];
  isLoading = false;
  hasSearched = false;
  currentStartIndex = 0;
  canLoadMore = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bookApi: BookApiService,
    private readingLog: ReadingLogService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      title: ['', Validators.required],
      author: ['']
    });
  }

  ngOnInit(): void {
    // Auto-search on title input change with debouncing (500ms)
    this.searchForm.get('title')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.searchForm.get('title')?.value?.trim()) {
        this.performSearch();
      }
    });

    // Also auto-search on author changes
    this.searchForm.get('author')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.searchForm.get('title')?.value?.trim()) {
        this.performSearch();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Perform search with current form values
   */
  performSearch(): void {
    const title = this.searchForm.get('title')?.value?.trim();
    if (!title) {
      return;
    }

    const author = this.searchForm.get('author')?.value?.trim();

    this.isLoading = true;
    this.currentStartIndex = 0;
    this.hasSearched = true;

    this.bookApi.search(title, author, 20, 0).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.books = results;
        this.canLoadMore = results.length === 20;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.books = [];
        this.canLoadMore = false;
        this.isLoading = false;
      }
    });
  }

  /**
   * Load more results (pagination)
   */
  loadMore(): void {
    const title = this.searchForm.get('title')?.value?.trim();
    if (!title || this.isLoading) {
      return;
    }

    const author = this.searchForm.get('author')?.value?.trim();
    this.currentStartIndex += 20;
    this.isLoading = true;

    this.bookApi.search(title, author, 20, this.currentStartIndex).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.books = [...this.books, ...results];
        this.canLoadMore = results.length === 20;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Load more error:', error);
        this.canLoadMore = false;
        this.isLoading = false;
      }
    });
  }

  /**
   * Clear search and results
   */
  clearSearch(): void {
    this.searchForm.reset();
    this.books = [];
    this.hasSearched = false;
    this.currentStartIndex = 0;
    this.canLoadMore = false;
  }

  /**
   * Add book to library
   */
  async addToLibrary(book: Book): Promise<void> {
    try {
      await this.readingLog.addBook(book);

      this.snackBar.open(`"${book.title}" added to your library!`, 'View Library', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }).onAction().subscribe(() => {
        this.router.navigate(['/library']);
      });

    } catch (error: any) {
      const message = error.message || 'Failed to add book to library';
      this.snackBar.open(message, 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
    }
  }
}
