import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatisticsService, ReadingStats, StatusDistribution } from '../../../core/services/statistics.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: ReadingStats | null = null;
  statusDistribution: StatusDistribution[] = [];
  booksPerMonth: { month: string; count: number }[] = [];
  totalPagesRead = 0;
  isLoading = true;

  constructor(private statisticsService: StatisticsService) {}

  async ngOnInit(): Promise<void> {
    await this.loadStatistics();
  }

  /**
   * Load all statistics
   */
  async loadStatistics(): Promise<void> {
    this.isLoading = true;
    try {
      [this.stats, this.statusDistribution, this.booksPerMonth, this.totalPagesRead] = await Promise.all([
        this.statisticsService.getReadingStats(),
        this.statisticsService.getStatusDistribution(),
        this.statisticsService.getBooksReadPerMonth(),
        this.statisticsService.getTotalPagesRead()
      ]);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get color for status chip
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
   * Get maximum count for monthly chart scaling
   */
  getMaxMonthCount(): number {
    return Math.max(...this.booksPerMonth.map(m => m.count), 1);
  }

  /**
   * Get total books completed this year
   */
  getTotalBooksThisYear(): number {
    return this.booksPerMonth.reduce((sum, m) => sum + m.count, 0);
  }
}
