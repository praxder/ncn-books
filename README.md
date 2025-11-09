# NCN Books Reading Log

A personal reading tracker built with Angular 17+ that helps you manage your book collection and track your reading progress. All data is stored locally in your browser using IndexedDB - no account required, no server needed.

## ✨ Features

### 📚 Book Management
- **Search for books** using Google Books and Open Library APIs
- **Add books** to your personal library with automatic metadata fetching
- **View detailed information** including cover images, descriptions, page counts, and ISBN
- **Delete books** with confirmation dialogs

### 📊 Reading Progress Tracking
- **Four status levels**: Not Started, Currently Reading, Completed, Did Not Finish
- **Automatic date tracking**: Records when you start and finish books
- **Personal notes**: Add, edit, and delete notes for each book (up to 10,000 characters)
- **Filter and sort**: Organize your library by status and sort by title, author, or last updated

### 📈 Statistics Dashboard
- **Reading overview**: Total books, completed count, currently reading
- **Completion rate**: Visual progress indicator with percentage
- **Average reading time**: Calculate days per book based on completed reads
- **Status distribution**: See your reading habits at a glance
- **Monthly trends**: Track books completed throughout the year
- **Total pages read**: Cumulative page count from completed books

### 💾 Data Portability
- **Export your library** to JSON for backup or transfer
- **Import data** with two strategies:
  - **Merge**: Combine with existing data (keeps newer versions on conflicts)
  - **Replace**: Start fresh with imported data
- **Clear all data**: Reset your library when needed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ncn-books.git
   cd ncn-books
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:4200`

### Building for Production

```bash
npm run build:prod
```

The build artifacts will be stored in the `dist/ncn-books/` directory.

## 🛠️ Technology Stack

- **Frontend Framework**: Angular 17+ (Standalone Components)
- **UI Components**: Angular Material 17+
- **Styling**: Tailwind CSS 3.x
- **Database**: IndexedDB via Dexie.js 3.x
- **APIs**: Google Books API, Open Library API
- **Build Tool**: Angular CLI with esbuild

## 📖 Usage Guide

### Adding Books

1. Click **"Add Books"** from the library page
2. Search by title (and optionally author)
3. Click **"Add to Library"** on any book from search results
4. The book is automatically added with "Not Started" status

### Tracking Reading Progress

1. Click any book in your library
2. Use the **status dropdown** to update your reading status
3. Dates are automatically recorded:
   - **Started Date**: Set when status changes to "Currently Reading"
   - **Finished Date**: Set when status changes to "Completed" or "Did Not Finish"

### Taking Notes

1. Open any book detail page
2. Click **"Add First Note"** or the **+ button**
3. Write your thoughts (supports up to 10,000 characters)
4. Edit or delete notes using the action buttons

### Viewing Statistics

1. Navigate to the **Statistics** page from the menu
2. View your reading metrics, completion rate, and trends
3. See monthly reading patterns for the current year

### Backing Up Your Data

1. Go to **Settings**
2. Click **"Export Data"**
3. Save the JSON file to a safe location
4. To restore, use **"Import Data"** and select your backup file

## 🗂️ Data Storage

All data is stored locally in your browser's IndexedDB:

- **Books**: ISBN, title, author, cover images, metadata
- **Reading Entries**: Status, dates, current page
- **Notes**: Your personal book notes with timestamps
- **Preferences**: App settings (filters, sort preferences)

**Note**: Data is specific to your browser and device. Use the export feature to back up or transfer data between devices.

## 🔒 Privacy

- **No account required** - completely anonymous
- **No data collection** - everything stays on your device
- **No external tracking** - only API calls to fetch book metadata
- **Offline capable** - works without internet (except book search)

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

IndexedDB and modern JavaScript features are required.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Book data provided by [Google Books API](https://developers.google.com/books) and [Open Library API](https://openlibrary.org/developers/api)
- UI components from [Angular Material](https://material.angular.io/)
- Icons from [Material Icons](https://fonts.google.com/icons)

## 🐛 Known Issues

- Bundle size slightly exceeds 500KB budget (optimization ongoing)
- Search results limited to 20 items per page for performance

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [User Guide](./USER_GUIDE.md) for detailed usage instructions

---

**Built with ❤️ using Angular 17+ and IndexedDB**
