import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Vitrina Digital La Victoria'
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent),
    title: 'Catálogo de Emprendimiento - Vitrina Digital La Victoria'
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Ficha del Producto - Vitrina Digital La Victoria'
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent),
    title: 'Iniciar Sesión - Vitrina Digital La Victoria'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Panel de Control - Vitrina Digital La Victoria'
  },
  {
    path: 'dashboard/instituciones',
    loadComponent: () => import('./pages/dashboard/instituciones/instituciones.component').then(m => m.InstitucionesComponent),
    canActivate: [authGuard],
    title: 'Gestión de Instituciones - Vitrina Digital La Victoria'
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard],
    title: 'Mi Perfil - Vitrina Digital La Victoria'
  },
  {
    path: 'terminos-y-condiciones',
    loadComponent: () => import('./pages/legal/terminos/terminos.component').then(m => m.TerminosComponent),
    title: 'Términos y Condiciones - Vitrina Digital La Victoria'
  },
  {
    path: 'politica-de-privacidad',
    loadComponent: () => import('./pages/legal/privacidad/privacidad.component').then(m => m.PrivacidadComponent),
    title: 'Política de Privacidad - Vitrina Digital La Victoria'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
