# Quickstart Guide: Reading Log Development Environment

**Date**: 2025-11-08
**Feature**: Reading Log (001)
**Purpose**: Step-by-step guide to set up local development environment for Angular + IndexedDB book tracking application

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or higher (LTS recommended)
- **npm**: v10.x or higher (comes with Node.js)
- **Git**: v2.x or higher
- **Code Editor**: VS Code recommended (with Angular extensions)
- **Web Browser**: Chrome 90+ or Firefox 88+ (for development/testing)

**Check installed versions**:
```bash
node --version  # Should output v20.x.x or higher
npm --version   # Should output v10.x.x or higher
git --version   # Should output v2.x.x or higher
```

---

## Step 1: Create Angular Project

### 1.1 Install Angular CLI Globally

```bash
npm install -g @angular/cli@17
```

**Verify installation**:
```bash
ng version  # Should output Angular CLI 17.x.x
```

### 1.2 Create New Angular Workspace

```bash
# Navigate to your projects directory
cd ~/projects  # Or wherever you keep projects

# Create new Angular app with standalone components
ng new ncn-books --standalone --routing --style=scss

# When prompted:
# ? Would you like to enable Server-Side Rendering (SSR) and Static Site Generation? No
# ? Do you want to enable prerendering (SSG)? No
```

**Options explained**:
- `--standalone`: Use new standalone components API (no NgModules)
- `--routing`: Generate routing module for navigation
- `--style=scss`: Use SCSS for styling (supports Tailwind + custom styles)
- SSR disabled: Static site for GitHub Pages deployment

### 1.3 Navigate to Project

```bash
cd ncn-books
```

---

## Step 2: Install Dependencies

### 2.1 Install Core Dependencies

```bash
npm install dexie@^3.2.4 \
            dexie-angular@^1.0.1 \
            @angular/material@^17.0.0 \
            @angular/cdk@^17.0.0 \
            chart.js@^4.4.0 \
            ng2-charts@^5.0.0
```

**Dependencies explained**:
- `dexie`: IndexedDB wrapper for local data storage
- `dexie-angular`: Angular integration for Dexie
- `@angular/material`: Material Design UI components
- `@angular/cdk`: Component Dev Kit (required for Material)
- `chart.js`: Charting library for statistics
- `ng2-charts`: Angular wrapper for Chart.js

### 2.2 Install Dev Dependencies

```bash
npm install --save-dev tailwindcss@^3.4.0 \
                       postcss@^8.4.0 \
                       autoprefixer@^10.4.0 \
                       cypress@^13.6.0 \
                       @types/chart.js
```

**Dev dependencies explained**:
- `tailwindcss`: Utility-first CSS framework
- `postcss` & `autoprefixer`: CSS processing tools (required for Tailwind)
- `cypress`: End-to-end testing framework
- `@types/chart.js`: TypeScript definitions for Chart.js

---

## Step 3: Configure Tailwind CSS

### 3.1 Initialize Tailwind

```bash
npx tailwindcss init
```

This creates `tailwind.config.js` in the project root.

### 3.2 Configure Tailwind Content Paths

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",  // Scan all Angular templates and TypeScript files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3.3 Add Tailwind to Global Styles

Edit `src/styles.scss` and add at the top:
```scss
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Your custom global styles below */
```

---

## Step 4: Configure Angular Material

### 4.1 Add Angular Material

```bash
ng add @angular/material
```

**When prompted**:
- Choose a prebuilt theme: **Indigo/Pink** (or custom theme later)
- Set up global Angular Material typography styles: **Yes**
- Include browser animations: **Yes**

This automatically:
- Adds Material imports to `app.config.ts`
- Creates `src/theme.scss` (if custom theme)
- Updates `angular.json` with Material assets

### 4.2 Verify Material Setup

Check that `src/index.html` includes Material icons:
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

---

## Step 5: Configure Cypress for E2E Testing

### 5.1 Initialize Cypress

```bash
npx cypress open
```

This will:
- Create `cypress/` directory
- Generate `cypress.config.ts`
- Open Cypress UI (close it for now)

### 5.2 Update Cypress Config

Edit `cypress.config.ts`:
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',  // Angular dev server
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,  // Disable video recording (faster tests)
    screenshotOnRunFailure: true
  },
});
```

### 5.3 Install Cypress Type Definitions

Already included with Cypress, but verify in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["cypress", "node"]
  }
}
```

---

## Step 6: Create Project Structure

### 6.1 Create Core Services Directory

```bash
mkdir -p src/app/core/services
mkdir -p src/app/core/models
```

### 6.2 Create Feature Modules Directories

```bash
mkdir -p src/app/features/library
mkdir -p src/app/features/book-search
mkdir -p src/app/features/book-detail
mkdir -p src/app/features/statistics
mkdir -p src/app/features/settings
```

### 6.3 Create Shared Components Directory

```bash
mkdir -p src/app/shared/components
mkdir -p src/app/shared/pipes
mkdir -p src/app/shared/directives
```

### 6.4 Create Assets Directories

```bash
mkdir -p src/assets/icons
mkdir -p src/assets/images
```

---

## Step 7: Configure GitHub Pages Deployment

### 7.1 Create GitHub Actions Workflow

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Angular app
        run: npm run build:prod

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist/ncn-books/browser'

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### 7.2 Add Build Script

Edit `package.json` and add to `scripts`:
```json
{
  "scripts": {
    "build:prod": "ng build --configuration production --base-href /ncn-books/"
  }
}
```

**Note**: Replace `/ncn-books/` with your actual GitHub repository name.

### 7.3 Configure Angular for GitHub Pages

Edit `angular.json`:
```json
{
  "projects": {
    "ncn-books": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "outputPath": "dist/ncn-books",
              "baseHref": "/ncn-books/",  // Add this line
              ...
            }
          }
        }
      }
    }
  }
}
```

---

## Step 8: Initialize Git Repository

### 8.1 Create .gitignore

Angular CLI already creates `.gitignore`. Verify it includes:
```
/node_modules
/dist
/.angular
/cypress/videos
/cypress/screenshots
.env
```

### 8.2 Initialize Git

```bash
git init
git add .
git commit -m "Initial commit: Angular 17 + Dexie.js + Material + Tailwind setup"
```

### 8.3 Create GitHub Repository and Push

```bash
# Create repository on GitHub: https://github.com/new
# Name it "ncn-books"

# Link local repo to GitHub
git remote add origin https://github.com/YOUR-USERNAME/ncn-books.git
git branch -M main
git push -u origin main
```

---

## Step 9: Run Development Server

### 9.1 Start Angular Dev Server

```bash
ng serve
```

**Output**:
```
✔ Browser application bundle generation complete.

Initial Chunk Files | Names         |  Raw Size
main.js             | main          | 250.45 kB |
styles.css          | styles        |  15.23 kB |

                    | Initial Total | 265.68 kB

Application bundle generation complete. [1.234 seconds]

Watch mode enabled. Watching for file changes...
➜  Local:   http://localhost:4200/
```

### 9.2 Open in Browser

Navigate to `http://localhost:4200/`

You should see the default Angular welcome page.

### 9.3 Verify Hot Reload

Edit `src/app/app.component.html` and save. The browser should automatically reload.

---

## Step 10: Verify Installation

### 10.1 Check Angular Material

Generate a test Material component:
```bash
ng generate component test-material --standalone
```

Edit `src/app/test-material/test-material.component.ts`:
```typescript
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-test-material',
  standalone: true,
  imports: [MatButtonModule],
  template: `<button mat-raised-button color="primary">Test Button</button>`
})
export class TestMaterialComponent {}
```

Add to `app.component.html`:
```html
<app-test-material></app-test-material>
```

Import in `app.component.ts`:
```typescript
import { TestMaterialComponent } from './test-material/test-material.component';

@Component({
  imports: [TestMaterialComponent]
})
```

**Expected**: Blue Material button displays in browser.

### 10.2 Check Tailwind CSS

Edit `test-material.component.html`:
```html
<div class="p-4 bg-blue-500 text-white">
  Tailwind CSS Working!
</div>
```

**Expected**: Blue background with white text and padding.

### 10.3 Check Dexie.js

Create a test service:
```bash
ng generate service core/services/test-db --skip-tests
```

Edit `src/app/core/services/test-db.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

interface TestItem {
  id?: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TestDbService extends Dexie {
  testTable!: Table<TestItem, number>;

  constructor() {
    super('TestDB');
    this.version(1).stores({
      testTable: '++id, name'
    });
  }

  async addItem(name: string) {
    return await this.testTable.add({ name });
  }

  async getItems() {
    return await this.testTable.toArray();
  }
}
```

In browser console:
```javascript
// Inject service and test
const db = new TestDbService();
await db.addItem('Test');
console.log(await db.getItems());  // Should output: [{id: 1, name: 'Test'}]
```

**Expected**: No errors, data stored in IndexedDB.

---

## Step 11: Run Tests

### 11.1 Run Unit Tests

```bash
npm run test
```

**Expected**: Karma opens browser, default tests pass.

### 11.2 Run E2E Tests (Cypress)

```bash
# Terminal 1: Start dev server
ng serve

# Terminal 2: Open Cypress
npx cypress open
```

**Expected**: Cypress UI opens, you can create and run E2E tests.

---

## Common Issues & Troubleshooting

### Issue: `npm install` fails

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Tailwind styles not applying

**Solution**: Verify `tailwind.config.js` content paths include `./src/**/*.{html,ts}`

### Issue: Angular Material icons not showing

**Solution**: Check `index.html` includes Material Icons font link

### Issue: Cypress can't connect to dev server

**Solution**:
- Ensure `ng serve` is running on port 4200
- Check `cypress.config.ts` has `baseUrl: 'http://localhost:4200'`

### Issue: GitHub Pages deployment fails

**Solution**:
- Ensure `baseHref` in `angular.json` matches your repo name
- Check GitHub repository settings → Pages → Source is set to "GitHub Actions"

---

## Next Steps

Your development environment is now ready! Proceed to implementation:

1. **Implement Data Model**: Create `Book`, `ReadingEntry`, `Note` models (see `data-model.md`)
2. **Create Storage Service**: Implement Dexie.js database wrapper
3. **Implement Book API Service**: Google Books + Open Library integration (see `contracts/`)
4. **Build Library Component**: Display books, filtering, sorting
5. **Build Search Component**: Book search with API integration
6. **Build Statistics Dashboard**: Charts and metrics
7. **Implement Export/Import**: JSON data portability

**Development Workflow**:
1. Create feature branch: `git checkout -b feature/library-view`
2. Implement feature following spec
3. Write unit tests for services
4. Write E2E test for user journey
5. Commit frequently (small increments)
6. Push to GitHub and create PR

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `ng serve` | Start dev server on localhost:4200 |
| `ng generate component <name> --standalone` | Create new standalone component |
| `ng generate service <name>` | Create new service |
| `ng build` | Build for development |
| `npm run build:prod` | Build for production (GitHub Pages) |
| `npm run test` | Run unit tests with Karma |
| `npx cypress open` | Open Cypress E2E test UI |
| `npx cypress run` | Run Cypress tests headlessly |
| `ng lint` | Run linter (if configured) |

---

## Development Best Practices

1. **Code Formatting**: Use Prettier (install extension in VS Code)
2. **Commit Messages**: Use conventional commits (e.g., `feat: add book search`, `fix: correct ISBN validation`)
3. **Branch Naming**: `feature/<name>`, `fix/<name>`, `refactor/<name>`
4. **Testing**: Write tests BEFORE implementation (TDD encouraged per constitution)
5. **Small Commits**: Commit working code frequently (per Constitution principle III)
6. **Code Review**: Self-review changes before pushing

---

## Additional Resources

- **Angular Documentation**: https://angular.io/docs
- **Angular Material**: https://material.angular.io/
- **Dexie.js Guide**: https://dexie.org/docs/Tutorial/Getting-started
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Chart.js Documentation**: https://www.chartjs.org/docs/latest/
- **Cypress Best Practices**: https://docs.cypress.io/guides/references/best-practices

---

**Environment Ready!** 🚀

You can now begin implementing the Reading Log feature. Refer to `spec.md`, `data-model.md`, and API contracts for implementation details.
