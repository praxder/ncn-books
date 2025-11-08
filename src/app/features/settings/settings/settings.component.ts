import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ExportImportService, ImportResult } from '../../../core/services/export-import.service';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  importStrategy: 'merge' | 'replace' = 'merge';
  isExporting = false;
  isImporting = false;

  constructor(
    private exportImportService: ExportImportService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Export data to JSON file
   */
  async exportData(): Promise<void> {
    this.isExporting = true;
    try {
      await this.exportImportService.downloadExport();
      this.snackBar.open('Data exported successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Export error:', error);
      this.snackBar.open('Error exporting data', 'Close', { duration: 3000 });
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Trigger file input for import
   */
  triggerFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.importData(file);
      }
    };
    input.click();
  }

  /**
   * Import data from file
   */
  async importData(file: File): Promise<void> {
    // Confirm import with user
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Import Data',
        message: this.importStrategy === 'replace'
          ? 'This will REPLACE all existing data. Are you sure?'
          : 'This will MERGE imported data with existing data. Conflicts will be resolved by keeping the newer version.',
        confirmText: 'Import',
        cancelText: 'Cancel'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.performImport(file);
      }
    });
  }

  /**
   * Perform the import operation
   */
  private async performImport(file: File): Promise<void> {
    this.isImporting = true;
    try {
      const result: ImportResult = await this.exportImportService.importFromFile(file, this.importStrategy);

      if (result.success) {
        const message = `Import successful! Books: ${result.booksImported}, Entries: ${result.entriesImported}, Notes: ${result.notesImported}`;
        this.snackBar.open(message, 'Close', { duration: 5000 });

        if (result.conflicts.length > 0) {
          this.snackBar.open(`${result.conflicts.length} conflicts skipped (kept existing data)`, 'Close', { duration: 3000 });
        }
      } else {
        const errorMessage = result.errors.length > 0 ? result.errors[0] : 'Import failed';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    } catch (error) {
      console.error('Import error:', error);
      this.snackBar.open('Error importing data', 'Close', { duration: 3000 });
    } finally {
      this.isImporting = false;
    }
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Clear All Data',
        message: 'This will permanently delete ALL books, notes, and preferences. This action cannot be undone!',
        confirmText: 'Delete Everything',
        cancelText: 'Cancel'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          // Note: We don't have a direct clearAll method, so we'll export empty and then import with replace
          await this.exportImportService.importData({
            version: '1.0',
            exportDate: new Date().toISOString(),
            books: [],
            readingEntries: [],
            notes: [],
            preferences: []
          }, 'replace');

          this.snackBar.open('All data cleared', 'Close', { duration: 3000 });
        } catch (error) {
          console.error('Clear data error:', error);
          this.snackBar.open('Error clearing data', 'Close', { duration: 3000 });
        }
      }
    });
  }
}
