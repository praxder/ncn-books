# NCN Books Reading Log - User Guide

A comprehensive guide to using your personal reading tracker.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Searching and Adding Books](#searching-and-adding-books)
3. [Managing Your Library](#managing-your-library)
4. [Tracking Reading Progress](#tracking-reading-progress)
5. [Taking Notes](#taking-notes)
6. [Viewing Statistics](#viewing-statistics)
7. [Export and Import](#export-and-import)
8. [Tips and Best Practices](#tips-and-best-practices)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### First Launch

When you first open NCN Books, you'll see an empty library. The app is completely local - no account needed, no sign-up required. Your data is stored in your browser's IndexedDB.

### Navigation

The app has four main sections accessible from the top navigation:

- **Library**: View all your books
- **Search**: Find and add new books
- **Statistics**: Track your reading metrics
- **Settings**: Export/import data and manage preferences

## Searching and Adding Books

### How to Search

1. Click **"Add Books"** or navigate to the **Search** page
2. Enter a book title in the search field
3. Optionally, add an author name to narrow results
4. Results appear automatically as you type (500ms debounce)

**Search Features:**
- Auto-search while typing
- Searches both Google Books and Open Library APIs
- Displays up to 20 results per search
- Click "Load More" to see additional results
- Shows cover images, author, publication year, and page count

### Adding a Book

1. Find the book you want in search results
2. Click **"Add to Library"** button
3. The book is added with "Not Started" status
4. A notification confirms the book was added
5. Click "View Library" in the notification to see your collection

**Note**: The app prevents duplicate books by ISBN. If a book is already in your library, you'll see a message.

## Managing Your Library

### Library View

Your library displays all books as cards with:
- Cover image
- Title and author
- Reading status (color-coded chip)
- Page count

### Filtering by Status

Use the filter chips at the top to show only books with specific statuses:
- Click a status chip to filter
- Multiple statuses can be selected
- Click "Show All" to clear filters
- Your filter preference is saved automatically

### Sorting Your Library

Choose how to sort your books:
- **Recently Updated** (default): Shows books you've interacted with recently
- **Title (A-Z)**: Alphabetical by book title
- **Author (A-Z)**: Alphabetical by author name

Your sort preference is saved automatically.

### Viewing Book Details

Click any book card to view:
- Full book metadata (title, author, ISBN, pages, dimensions)
- Cover image
- Description
- Publication information
- Reading status and dates
- All notes for the book

## Tracking Reading Progress

### Status Levels

Books can have four different statuses:

1. **Not Started** (gray): Added but not yet begun
2. **Currently Reading** (blue): Actively reading
3. **Completed** (green): Finished reading
4. **Did Not Finish** (red): Started but abandoned

### Updating Status

1. Open a book's detail page
2. Use the **Reading Status** dropdown
3. Select the new status
4. Dates are automatically updated:
   - **Started Date**: Set when you change to "Currently Reading"
   - **Finished Date**: Set when you change to "Completed" or "Did Not Finish"

### Date Tracking

The app automatically tracks:
- **Added Date**: When you first added the book
- **Started Date**: When you began reading (if applicable)
- **Finished Date**: When you completed or abandoned it (if applicable)
- **Last Updated**: Most recent change to the book entry

These dates are used to calculate statistics like average reading time.

### Deleting a Book

1. Open the book's detail page
2. Click the **"Delete Book"** button
3. Confirm the deletion
4. The book and all its notes are permanently removed

**Warning**: This action cannot be undone unless you have a backup export.

## Taking Notes

### Adding Notes

1. Open a book's detail page
2. Click **"Add First Note"** (if no notes exist) or the **+ button** (if notes exist)
3. Type your thoughts in the text area
4. Click **"Save Note"**

**Note Features:**
- Maximum 10,000 characters per note
- Character counter shows remaining space
- Validation prevents empty notes
- Notes are sorted by creation date (newest first)

### Editing Notes

1. Find the note you want to edit
2. Click the **edit icon** (pencil)
3. Modify the text
4. Click **"Save"** to confirm or **"Cancel"** to discard changes
5. Edit timestamp is automatically updated

### Deleting Notes

1. Find the note you want to delete
2. Click the **delete icon** (trash)
3. Confirm the deletion
4. Note is permanently removed

**Tip**: Take notes as you read to capture thoughts, favorite quotes, or important passages.

## Viewing Statistics

The Statistics dashboard provides insights into your reading habits.

### Summary Cards

Four key metrics at a glance:
- **Total Books**: All books in your library
- **Completed**: Successfully finished books
- **Currently Reading**: Books in progress
- **Pages Read**: Total pages from completed books

### Completion Rate

A circular progress indicator showing:
- Percentage of books completed vs. attempted
- Total completed books
- Total attempted books (completed + did not finish)

### Average Reading Time

Shows the average number of days to complete a book, calculated from:
- Books with both started and finished dates
- Only includes completed books
- Excludes books without date information

### Status Distribution

Horizontal bar chart showing:
- Percentage of books in each status
- Count of books per status
- Visual comparison of your reading habits

### Monthly Trends

Bar chart displaying:
- Books completed each month of the current year
- Hover to see exact counts
- Total completed for the year at bottom

**Tip**: Review your statistics monthly to set reading goals and track progress.

## Export and Import

### Exporting Your Data

**When to Export:**
- Before clearing browser data
- As a regular backup
- To transfer data to another device
- Before making major changes

**How to Export:**
1. Go to **Settings**
2. Click **"Export Data"**
3. A JSON file is automatically downloaded
4. File name includes the current date: `ncn-books-export-2024-01-15.json`

**What's Exported:**
- All books with complete metadata
- All reading entries with statuses and dates
- All notes
- All preferences (filters, sort settings)

### Importing Data

**Import Strategies:**

#### Merge (Recommended)
- Combines imported data with existing data
- Conflicts resolved by keeping the newer version
- Uses timestamps to determine which data is newer
- Safe for regular backups

#### Replace (Destructive)
- Deletes ALL existing data first
- Replaces with imported data
- Use for fresh starts or complete restores
- **Warning**: Cannot be undone

**How to Import:**
1. Go to **Settings**
2. Select your import strategy (Merge or Replace)
3. Click **"Import Data"**
4. Choose your JSON export file
5. Confirm the import
6. Review the import summary showing counts

**Import Results:**
- Books imported count
- Entries imported count
- Notes imported count
- Preferences imported count
- Conflicts detected (with merge strategy)
- Any errors encountered

### Data Format

Export files are JSON with this structure:
```json
{
  "version": "1.0",
  "exportDate": "2024-01-15T10:30:00Z",
  "books": [...],
  "readingEntries": [...],
  "notes": [...],
  "preferences": [...]
}
```

### Clearing All Data

**Use Case**: Start completely fresh with no data

**How to Clear:**
1. Go to **Settings** → **Danger Zone**
2. Click **"Clear All Data"**
3. Confirm the permanent deletion
4. ALL data is removed from IndexedDB

**Warning**: This is permanent and cannot be undone. Export your data first if you might want it back.

## Tips and Best Practices

### General Usage
- **Regular Backups**: Export your data monthly
- **Note-Taking**: Add notes while reading to capture thoughts
- **Status Updates**: Keep statuses current for accurate statistics
- **Search Smart**: Use both title and author for better results

### Data Management
- **Export Before Major Changes**: Always backup before clearing data
- **Descriptive Notes**: Write notes that will make sense later
- **Date Accuracy**: Update status promptly for accurate reading time stats
- **Filter Usage**: Use filters to focus on specific reading goals

### Performance
- **Regular Cleanup**: Delete books you won't track
- **Limit Notes**: While 10,000 chars is allowed, shorter notes load faster
- **Browser Cache**: Occasionally clear browser cache (after exporting!)

### Reading Goals
- **Use Statistics**: Review monthly trends to set realistic goals
- **Track DNF**: Don't be afraid to mark "Did Not Finish" - it's valuable data
- **Sort Strategically**: Use "Recently Updated" to see what needs attention

## Troubleshooting

### Books Not Showing

**Problem**: Added a book but it's not in the library

**Solutions**:
1. Check if filters are active - click "Show All"
2. Try sorting by "Recently Updated"
3. Refresh the page (data persists)
4. Check browser console for errors

### Search Not Working

**Problem**: Search returns no results

**Solutions**:
1. Check internet connection (required for search)
2. Try a different book title
3. Remove special characters from search
4. Try searching without author name
5. Check if API services are down

### Data Lost

**Problem**: All my data disappeared

**Solutions**:
1. Check if you're in the same browser/profile
2. Verify browser hasn't cleared IndexedDB
3. Restore from most recent export file
4. Check browser settings allow IndexedDB storage

### Import Errors

**Problem**: Import failed with errors

**Solutions**:
1. Verify JSON file isn't corrupted
2. Check file is from NCN Books export
3. Try merge strategy instead of replace
4. Review error messages for specific issues
5. Check file version matches app version

### Performance Issues

**Problem**: App is slow or laggy

**Solutions**:
1. Export and clear data, then reimport
2. Reduce number of notes per book
3. Clear browser cache
4. Try a different browser
5. Check available disk space

### Browser Compatibility

**Problem**: Features not working

**Solutions**:
1. Update browser to latest version
2. Enable JavaScript
3. Allow IndexedDB storage
4. Disable browser extensions that might interfere
5. Try in incognito mode to test

## Keyboard Shortcuts

Currently, the app is optimized for mouse/touch interaction. Keyboard navigation follows standard browser conventions:
- **Tab**: Navigate between interactive elements
- **Enter**: Activate buttons and links
- **Escape**: Close dialogs and modals

## Data Privacy

### What's Stored
- All data stays in your browser's IndexedDB
- No data sent to external servers except:
  - Book searches (to Google Books and Open Library APIs)
  - No tracking or analytics

### What's Not Stored
- No user accounts or profiles
- No passwords or authentication tokens
- No usage analytics
- No personal information beyond what you enter

### Data Portability
- Export anytime as JSON
- Import on any device
- No vendor lock-in
- Full control of your data

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [README](./README.md) for technical information
2. Open an issue on GitHub with:
   - Description of the problem
   - Steps to reproduce
   - Browser and version
   - Any error messages
3. Include export file if data-related (remove sensitive notes first)

---

**Happy Reading! 📚**
