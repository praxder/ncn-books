import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/library',
    pathMatch: 'full'
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library/library.component').then(m => m.LibraryComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/book-search/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'book/:isbn',
    loadComponent: () => import('./features/book-detail/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path: 'statistics',
    loadComponent: () => import('./features/statistics/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '**',
    redirectTo: '/library'
  }
];
