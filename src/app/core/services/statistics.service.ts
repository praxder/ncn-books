import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ReadingEntry, ReadingStatus } from '../models/reading-entry.model';

export interface ReadingStats {
  totalBooks: number;
  notStarted: number;
  currentlyReading: number;
  completed: number;
  didNotFinish: number;
  completionRate: number;
  averageReadingTimeInDays: number | null;
}

export interface StatusDistribution {
  status: ReadingStatus;
  count: number;
  percentage: number;
}

export interface ReadingTrend {
  date: Date;
  completed: number;
  started: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor(private storage: StorageService) { }

  /**
   * Calculate comprehensive reading statistics
   */
  async getReadingStats(): Promise<ReadingStats> {
    const entries = await this.storage.getAllReadingEntries();

    const stats: ReadingStats = {
      totalBooks: entries.length,
      notStarted: 0,
      currentlyReading: 0,
      completed: 0,
      didNotFinish: 0,
      completionRate: 0,
      averageReadingTimeInDays: null
    };

    // Count by status
    entries.forEach(entry => {
      switch (entry.status) {
        case 'Not Started':
          stats.notStarted++;
          break;
        case 'Currently Reading':
          stats.currentlyReading++;
          break;
        case 'Completed':
          stats.completed++;
          break;
        case 'Did Not Finish':
          stats.didNotFinish++;
          break;
      }
    });

    // Calculate completion rate
    const attemptedBooks = stats.completed + stats.didNotFinish;
    if (attemptedBooks > 0) {
      stats.completionRate = (stats.completed / attemptedBooks) * 100;
    }

    // Calculate average reading time for completed books
    const completedEntries = entries.filter(e =>
      e.status === 'Completed' &&
      e.startedDate &&
      e.finishedDate
    );

    if (completedEntries.length > 0) {
      const totalDays = completedEntries.reduce((sum, entry) => {
        const start = new Date(entry.startedDate!);
        const finish = new Date(entry.finishedDate!);
        const days = Math.ceil((finish.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      stats.averageReadingTimeInDays = Math.round(totalDays / completedEntries.length);
    }

    return stats;
  }

  /**
   * Get status distribution for pie chart
   */
  async getStatusDistribution(): Promise<StatusDistribution[]> {
    const entries = await this.storage.getAllReadingEntries();
    const total = entries.length;

    if (total === 0) {
      return [];
    }

    const distribution: { [key in ReadingStatus]: number } = {
      'Not Started': 0,
      'Currently Reading': 0,
      'Completed': 0,
      'Did Not Finish': 0
    };

    entries.forEach(entry => {
      distribution[entry.status]++;
    });

    return Object.entries(distribution).map(([status, count]) => ({
      status: status as ReadingStatus,
      count,
      percentage: (count / total) * 100
    }));
  }

  /**
   * Get reading trends over time
   */
  async getReadingTrends(daysBack: number = 30): Promise<ReadingTrend[]> {
    const entries = await this.storage.getAllReadingEntries();
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Create a map of dates to trends
    const trendMap = new Map<string, ReadingTrend>();

    // Initialize all dates
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      trendMap.set(dateKey, {
        date: new Date(d),
        completed: 0,
        started: 0
      });
    }

    // Count books started and completed by date
    entries.forEach(entry => {
      // Count started books
      if (entry.startedDate) {
        const entryStartDate = new Date(entry.startedDate);
        if (entryStartDate >= startDate) {
          const dateKey = entryStartDate.toISOString().split('T')[0];
          const trend = trendMap.get(dateKey);
          if (trend) {
            trend.started++;
          }
        }
      }

      // Count completed books
      if (entry.finishedDate && entry.status === 'Completed') {
        const finishDate = new Date(entry.finishedDate);
        if (finishDate >= startDate) {
          const dateKey = finishDate.toISOString().split('T')[0];
          const trend = trendMap.get(dateKey);
          if (trend) {
            trend.completed++;
          }
        }
      }
    });

    return Array.from(trendMap.values()).sort((a, b) =>
      a.date.getTime() - b.date.getTime()
    );
  }

  /**
   * Get books read per month for the current year
   */
  async getBooksReadPerMonth(): Promise<{ month: string; count: number }[]> {
    const entries = await this.storage.getAllReadingEntries();
    const currentYear = new Date().getFullYear();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthCounts = new Array(12).fill(0);

    entries.forEach(entry => {
      if (entry.finishedDate && entry.status === 'Completed') {
        const finishDate = new Date(entry.finishedDate);
        if (finishDate.getFullYear() === currentYear) {
          monthCounts[finishDate.getMonth()]++;
        }
      }
    });

    return monthNames.map((month, index) => ({
      month,
      count: monthCounts[index]
    }));
  }

  /**
   * Get total pages read from completed books
   */
  async getTotalPagesRead(): Promise<number> {
    const completedEntries = await this.storage.getReadingEntriesByStatus('Completed');
    let totalPages = 0;

    for (const entry of completedEntries) {
      const book = await this.storage.getBook(entry.isbn);
      if (book?.pageCount) {
        totalPages += book.pageCount;
      }
    }

    return totalPages;
  }
}
