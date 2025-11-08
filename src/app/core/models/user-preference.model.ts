/**
 * User Preference model for application settings (key-value store)
 */
export interface UserPreference {
  // Primary Key
  key: string;  // Preference identifier (e.g., 'readingSpeed', 'theme')

  // Value
  value: any;  // JSON-serializable value

  // Timestamp
  updatedAt: Date;
}

/**
 * Predefined preference keys with their value types
 */
export type PreferenceKey =
  | 'readingSpeed'      // Number (words per minute, default: 250)
  | 'defaultSort'       // 'recent' | 'title' | 'author' (default: 'recent')
  | 'theme'             // 'light' | 'dark' | 'system' (default: 'system')
  | 'lastExportDate';   // Date (track when user last exported data)
