import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ReadingStatus } from '../../../core/models/reading-entry.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent {
  @Input() selectedStatuses: ReadingStatus[] = [];
  @Output() statusesChanged = new EventEmitter<ReadingStatus[]>();

  availableStatuses: ReadingStatus[] = [
    'Not Started',
    'Currently Reading',
    'Completed',
    'Did Not Finish'
  ];

  /**
   * Toggle status selection
   */
  toggleStatus(status: ReadingStatus): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index > -1) {
      this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
    } else {
      this.selectedStatuses = [...this.selectedStatuses, status];
    }
    this.statusesChanged.emit(this.selectedStatuses);
  }

  /**
   * Check if status is selected
   */
  isSelected(status: ReadingStatus): boolean {
    return this.selectedStatuses.includes(status);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedStatuses = [];
    this.statusesChanged.emit(this.selectedStatuses);
  }

  /**
   * Check if all filters are cleared
   */
  get isShowingAll(): boolean {
    return this.selectedStatuses.length === 0;
  }
}
