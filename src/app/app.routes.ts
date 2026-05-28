import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Colegio de Artes - Vitrina Victoria'
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent),
    title: 'Catálogo de Emprendimiento - Vitrina Victoria'
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Ficha del Producto - Vitrina Victoria'
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent),
    title: 'Iniciar Sesión - Vitrina Victoria'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Panel de Control - Vitrina Victoria'
  },
  {
    path: 'dashboard/instituciones',
    loadComponent: () => import('./pages/dashboard/instituciones/instituciones.component').then(m => m.InstitucionesComponent),
    canActivate: [authGuard],
    title: 'Gestión de Instituciones - Vitrina Victoria'
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard],
    title: 'Mi Perfil - Vitrina Victoria'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
