import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export type SortOption = 'recently-updated' | 'title-asc' | 'author-asc';

export interface SortOptionDisplay {
  value: SortOption;
  label: string;
}

@Component({
  selector: 'app-sort-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './sort-selector.component.html',
  styleUrl: './sort-selector.component.scss'
})
export class SortSelectorComponent {
  @Input() selectedSort: SortOption = 'recently-updated';
  @Output() sortChanged = new EventEmitter<SortOption>();

  sortOptions: SortOptionDisplay[] = [
    { value: 'recently-updated', label: 'Recently Updated' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'author-asc', label: 'Author (A-Z)' }
  ];

  /**
   * Handle sort selection change
   */
  onSortChange(value: SortOption): void {
    this.selectedSort = value;
    this.sortChanged.emit(value);
  }
}
