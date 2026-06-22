import { Component, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { 
  LucideLayoutDashboard, 
  LucideLogOut, 
  LucideLogIn, 
  LucideSun, 
  LucideMoon,
  LucideUser
} from '@lucide/angular';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    LucideLayoutDashboard,
    LucideLogOut,
    LucideLogIn,
    LucideSun,
    LucideMoon,
    LucideUser
  ],
  template: `
    <header class="header-nav">
      <div class="container header-container">
        <a routerLink="/" class="logo-link">
          <img src="/logo.jpg" alt="Logo" class="logo-img" />
          <span class="logo-text">Vitrina <span class="accent-text">Victoria</span></span>
        </a>

        <nav class="nav-links">
          <a routerLink="/catalogo" class="nav-item catalog-link">Catálogo</a>
          
          @if (authService.currentUser(); as user) {
            <a routerLink="/dashboard" class="nav-item dashboard-link">
              <svg lucideLayoutDashboard class="btn-icon"></svg>
              Panel
            </a>
            
            <div class="user-badge" (click)="toggleDropdown()">
              <span class="user-name">{{ user.nombre_completo.split(' ')[0] }}</span>
              <span class="user-role">{{ user.rol === 'admin' ? 'Admin' : (user.rol === 'docente' ? 'Tutor' : 'Alumno') }}</span>
              
              @if (isDropdownOpen()) {
                <div class="dropdown-menu glass-panel">
                  <div class="dropdown-header">
                    <p class="dropdown-full-name">{{ user.nombre_completo }}</p>
                    <p class="dropdown-school-name">{{ user.instituciones?.nombre || 'General' }}</p>
                  </div>
                  <hr class="dropdown-divider">
                  <a routerLink="/perfil" class="dropdown-item">
                    <svg lucideUser></svg>
                    Editar Perfil
                  </a>
                  <button (click)="logout()" class="dropdown-item logout-btn">
                    <svg lucideLogOut></svg>
                    Cerrar Sesión
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth" class="btn btn-glass btn-login">
              <svg lucideLogIn [size]="16"></svg>
              Acceso Docente/Alumno
            </a>
          }

          <button (click)="toggleTheme()" class="theme-toggle" aria-label="Cambiar tema">
            @if (isDarkMode()) {
              <svg lucideSun class="theme-icon"></svg>
            } @else {
              <svg lucideMoon class="theme-icon"></svg>
            }
          </button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--glass-bg);
      border-bottom: 1px solid var(--glass-border);
      backdrop-filter: var(--glass-blur);
      box-shadow: var(--glass-shadow);
      height: 72px;
      display: flex;
      align-items: center;
      transition: background var(--transition-normal), border var(--transition-normal);
    }
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--text-primary);
    }
    .logo-img {
      width: 36px;
      height: 36px;
      object-fit: contain;
      border-radius: var(--radius-sm);
    }
    .logo-text {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: -0.5px;
    }
    .accent-text {
      color: var(--primary-color);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-item {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: color var(--transition-fast);
    }
    .nav-item:hover {
      color: var(--primary-color);
    }
    .dashboard-link {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--primary-light);
      color: var(--primary-dark);
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius-sm);
    }
    .dashboard-link:hover {
      background: var(--primary-color);
      color: #ffffff;
    }
    .btn-icon {
      width: 16px;
      height: 16px;
    }
    .btn-login {
      font-size: 0.85rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
    }
    .theme-toggle {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .theme-toggle:hover {
      background: var(--bg-tertiary);
      color: var(--primary-color);
    }
    .theme-icon {
      width: 20px;
      height: 20px;
    }
    .user-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      background: var(--bg-tertiary);
      padding: 0.35rem 1rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      position: relative;
      border: 1px solid var(--border-color);
      user-select: none;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .user-role {
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 240px;
      padding: 1rem;
      z-index: 110;
      cursor: default;
    }
    .dropdown-header {
      margin-bottom: 0.5rem;
    }
    .dropdown-full-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    .dropdown-school-name {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .dropdown-divider {
      border: 0;
      border-top: 1px solid var(--border-color);
      margin: 0.5rem 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      width: 100%;
      padding: 0.5rem 0;
      font-size: 0.85rem;
      color: var(--text-secondary);
      cursor: pointer;
      text-align: left;
      transition: color var(--transition-fast);
    }
    .dropdown-item svg {
      width: 16px;
      height: 16px;
    }
    .dropdown-item:hover {
      color: var(--accent-color);
    }
    .logout-btn:hover {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .nav-links {
        gap: 0.75rem;
      }
      .nav-item {
        display: none; /* Ocultar menú en móvil para simplificar */
      }
      .catalog-link {
        display: inline-flex; /* Mantener Catálogo visible */
        font-size: 0.85rem;
      }
      .dashboard-link {
        display: flex;
        font-size: 0.85rem;
        padding: 0.4rem 0.6rem;
      }
      .logo-text {
        font-size: 1.15rem;
      }
      .btn-login {
        font-size: 0.75rem;
        padding: 0.4rem 0.6rem;
      }
    }
    @media (max-width: 480px) {
      .logo-text {
        font-size: 1rem;
      }
      .logo-img {
        width: 28px;
        height: 28px;
      }
      .nav-links {
        gap: 0.5rem;
      }
      .btn-login {
        font-size: 0.7rem;
        padding: 0.35rem 0.5rem;
      }
      .user-badge {
        padding: 0.25rem 0.5rem;
      }
      .user-name {
        font-size: 0.75rem;
      }
      .user-role {
        display: none; /* Ocultar rol para ahorrar espacio en móvil muy pequeño */
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  isDarkMode = signal<boolean>(false);
  isDropdownOpen = signal<boolean>(false);

  constructor() {
    // Detectar tema guardado
    const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);

    // Cerrar dropdown si se hace click fuera
    effect(() => {
      if (this.isDropdownOpen()) {
        const handler = () => this.isDropdownOpen.set(false);
        // Esperar un tick para no cerrar inmediatamente en el click de apertura
        setTimeout(() => document.addEventListener('click', handler, { once: true }), 0);
      }
    });
  }

  toggleTheme() {
    const nextDark = !this.isDarkMode();
    this.isDarkMode.set(nextDark);
    this.applyTheme(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  async logout() {
    const confirmacion = await this.alertService.confirm({
      title: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas salir de tu cuenta?',
      confirmText: 'Sí, salir',
      cancelText: 'Cancelar',
      type: 'warning'
    });

    if (!confirmacion) return;

    try {
      await this.authService.logout();
      this.isDropdownOpen.set(false);
      this.alertService.success('Sesión cerrada correctamente.');
      this.router.navigate(['/']);
    } catch (err) {
      console.error(err);
      this.alertService.error('Ocurrió un error al intentar cerrar sesión.');
    }
  }
}
