import { Component, inject, signal, OnInit, effect, ChangeDetectionStrategy } from '@angular/core';
import { SupabaseService, Producto, Categoria, Institucion } from '../../core/services/supabase.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { 
  LucideSearch, 
  LucideChevronDown, 
  LucideLayoutGrid, 
  LucidePalette, 
  LucideScissors, 
  LucideChefHat, 
  LucideGem, 
  LucideSprout, 
  LucidePackage, 
  LucideInbox,
  LucideSparkles,
  LucideFilter
} from '@lucide/angular';

@Component({
  selector: 'app-catalog',
  imports: [
    ProductCardComponent,
    LucideSearch, 
    LucideChevronDown, 
    LucideLayoutGrid, 
    LucidePalette, 
    LucideScissors, 
    LucideChefHat, 
    LucideGem, 
    LucideSprout, 
    LucidePackage, 
    LucideInbox,
    LucideSparkles,
    LucideFilter
  ],
  template: `
    <div class="catalog-page-container">
      <!-- Fondo dinámico con orbes brillantes -->
      <div class="glow-spot spot-amber"></div>
      <div class="glow-spot spot-salvia"></div>

      <!-- 1. CABECERA DE BÚSQUEDA HERO (Premium) 
      <section class="catalog-hero glass-panel animate-fade-in">
        <div class="hero-decoration">
          <svg lucideSparkles class="decor-icon"></svg>
          <span>Catálogo de Emprendimiento Escolar</span>
        </div>
        <h1 class="catalog-title">Galería de <span class="gradient-text">Creaciones Técnicas</span></h1>
        <p class="catalog-subtitle">
          Adquiere productos únicos de diseño textil, cerámica, repostería y joyería directamente de los colegios de La Victoria.
        </p>
      </section>
      -->
      <!-- 2. BARRA DE FILTROS FLOTANTE Y BÚSQUEDA (Glassmorphism de Lujo) -->
      <section class="floating-filter-bar glass-panel animate-slide-up">
        <div class="search-box-premium">
          <svg lucideSearch class="search-icon-premium"></svg>
          <input 
            type="text" 
            class="form-input-premium search-input-premium" 
            placeholder="Buscar por producto, material, técnica..." 
            (input)="onSearchChange($event)"
            [value]="searchQuery()"
          />
        </div>

        <div class="dropdown-filters-premium">
          <div class="filter-icon-wrapper">
            <svg lucideFilter class="filter-icon-premium"></svg>
            <span class="filter-label">Filtrar por:</span>
          </div>
          <div class="select-premium-wrapper">
            <svg lucideChevronDown class="select-arrow-premium"></svg>
            <select class="form-select-premium" (change)="onSchoolChange($event)">
              <option value="">Todos los Colegios</option>
              @for (school of schools(); track school.id) {
                <option [value]="school.id">{{ school.nombre }}</option>
              }
            </select>
          </div>
        </div>
      </section>

      <!-- 3. SECTOR DE CATEGORÍAS EN PÍLDORAS (Con micro-animación) -->
      <section class="categories-carousel-premium animate-fade-in-delayed">
        <button 
          class="category-pill-premium" 
          [class.active]="selectedCategory() === ''"
          (click)="selectCategory('')"
        >
          <svg lucideLayoutGrid class="cat-icon-premium"></svg>
          <span>Todas</span>
        </button>
        @for (cat of categories(); track cat.id) {
          <button 
            class="category-pill-premium" 
            [class.active]="selectedCategory() === cat.id"
            (click)="selectCategory(cat.id)"
          >
            @switch (cat.slug) {
              @case ('artesania-y-arte') {
                <svg lucidePalette class="cat-icon-premium"></svg>
              }
              @case ('textil-y-confeccion') {
                <svg lucideScissors class="cat-icon-premium"></svg>
              }
              @case ('gastronomia-y-reposteria') {
                <svg lucideChefHat class="cat-icon-premium"></svg>
              }
              @case ('joyeria-y-bisuterian') {
                <svg lucideGem class="cat-icon-premium"></svg>
              }
              @case ('horticultura-y-plantas') {
                <svg lucideSprout class="cat-icon-premium"></svg>
              }
              @default {
                <svg lucidePackage class="cat-icon-premium"></svg>
              }
            }
            <span>{{ cat.nombre }}</span>
          </button>
        }
      </section>

      <!-- 4. CONTENEDOR DE PRODUCTOS -->
      <section class="catalog-grid-section">
        @if (loadingProducts()) {
          <div class="skeleton-grid-premium">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="skeleton-card-premium glass-panel">
                <div class="skeleton-shimmer-image"></div>
                <div class="skeleton-shimmer-badge"></div>
                <div class="skeleton-shimmer-title"></div>
                <div class="skeleton-shimmer-desc"></div>
                <div class="skeleton-shimmer-footer"></div>
              </div>
            }
          </div>
        } @else if (products().length === 0) {
          <div class="empty-state-premium glass-panel animate-fade-in">
            <svg lucideInbox class="empty-icon-premium"></svg>
            <h3>No se encontraron creaciones</h3>
            <p>Prueba ajustando los filtros de búsqueda, colegio o categoría.</p>
          </div>
        } @else {
          <div class="products-grid-premium animate-fade-in-cards">
            @for (prod of products(); track prod.id) {
              <app-product-card [producto]="prod" />
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .catalog-page-container {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding-top: 2rem;
      min-height: 100vh;
    }

    /* Orbes brillantes decorativos en el fondo */
    .glow-spot {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.12;
      pointer-events: none;
      z-index: 0;
    }
    .spot-amber {
      width: 400px;
      height: 400px;
      background: var(--accent-color);
      top: -10%;
      right: -10%;
      animation: float-slow 15s infinite alternate ease-in-out;
    }
    .spot-salvia {
      width: 350px;
      height: 350px;
      background: var(--success-color);
      bottom: 20%;
      left: -10%;
      animation: float-slow 12s infinite alternate-reverse ease-in-out;
    }

    @keyframes float-slow {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(40px, -30px) scale(1.1); }
    }

    /* 1. CABECERA HERO DEL CATALOGO */
    .catalog-hero {
      position: relative;
      z-index: 1;
      padding: 3.5rem 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      border-radius: var(--radius-lg);
    }

    .hero-decoration {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: var(--primary-light);
      color: var(--primary-color);
      padding: 0.4rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1.25rem;
      border: 1px solid var(--border-light);
    }
    [data-theme="dark"] .hero-decoration {
      background: rgba(192, 142, 77, 0.15);
      color: var(--accent-color);
      border-color: rgba(192, 142, 77, 0.25);
    }

    .decor-icon {
      width: 14px;
      height: 14px;
      color: var(--accent-color);
    }

    .catalog-title {
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: -1.2px;
      margin-bottom: 0.75rem;
    }

    .catalog-title .gradient-text {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
    }

    .catalog-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      max-width: 650px;
      line-height: 1.6;
    }


    /* 2. BARRA DE FILTROS FLOTANTE */
    .floating-filter-bar {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.5rem;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      box-shadow: var(--glass-shadow);
      backdrop-filter: var(--glass-blur);
    }

    @media (min-width: 768px) {
      .floating-filter-bar {
        flex-direction: row;
        align-items: center;
        gap: 1.5rem;
      }
    }

    .search-box-premium {
      position: relative;
      flex-grow: 1;
    }

    .search-icon-premium {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      transition: color var(--transition-fast);
    }

    .form-input-premium {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 3rem;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border-color);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 0.95rem;
      outline: none;
      transition: all var(--transition-fast);
    }

    .form-input-premium:focus {
      border-color: var(--primary-color);
      background-color: #ffffff;
      box-shadow: 0 0 0 3.5px rgba(192, 142, 77, 0.15);
    }

    [data-theme="dark"] .form-input-premium:focus {
      background-color: var(--bg-tertiary);
    }

    .search-box-premium:focus-within .search-icon-premium {
      color: var(--primary-color);
    }

    .dropdown-filters-premium {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .dropdown-filters-premium {
        width: 100%;
        border-top: 1px solid var(--border-light);
        padding-top: 1rem;
      }
    }

    .filter-icon-wrapper {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--text-secondary);
    }

    .filter-icon-premium {
      width: 16px;
      height: 16px;
    }

    .filter-label {
      font-size: 0.85rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .select-premium-wrapper {
      position: relative;
      width: 100%;
    }

    @media (min-width: 768px) {
      .select-premium-wrapper {
        width: 240px;
      }
    }

    .form-select-premium {
      width: 100%;
      padding: 0.8rem 2.5rem 0.8rem 1rem;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border-color);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      appearance: none;
      transition: all var(--transition-fast);
    }

    .form-select-premium:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3.5px rgba(192, 142, 77, 0.15);
    }

    .select-arrow-premium {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      pointer-events: none;
    }


    /* 3. PÍLDORAS DE CATEGORÍAS */
    .categories-carousel-premium {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding: 0.25rem 0 0.5rem 0;
      scrollbar-width: none;
      position: relative;
      z-index: 1;
    }

    .categories-carousel-premium::-webkit-scrollbar {
      display: none;
    }

    .category-pill-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      color: var(--text-secondary);
      padding: 0.65rem 1.35rem;
      border-radius: var(--radius-full);
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.88rem;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }

    .cat-icon-premium {
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      transition: transform var(--transition-fast), color var(--transition-fast);
    }

    .category-pill-premium:hover {
      background: var(--bg-secondary);
      color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .category-pill-premium:hover .cat-icon-premium {
      transform: scale(1.18);
      color: var(--primary-color);
    }

    .category-pill-premium.active {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 8px 20px rgba(192, 142, 77, 0.25);
    }

    .category-pill-premium.active .cat-icon-premium {
      color: #ffffff;
    }

    /* 4. GRID DE PRODUCTOS Y SKELETONS */
    .catalog-grid-section {
      position: relative;
      z-index: 1;
      min-height: 400px;
      margin-bottom: 4rem;
    }

    .products-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .skeleton-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .skeleton-card-premium {
      height: 400px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .skeleton-shimmer-image {
      width: 100%;
      height: 200px;
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-light) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer-swipe 1.5s infinite linear;
      border-radius: var(--radius-sm);
    }

    .skeleton-shimmer-badge {
      width: 35%;
      height: 20px;
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-light) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer-swipe 1.5s infinite linear;
      border-radius: var(--radius-full);
    }

    .skeleton-shimmer-title {
      width: 80%;
      height: 24px;
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-light) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer-swipe 1.5s infinite linear;
      border-radius: var(--radius-sm);
    }

    .skeleton-shimmer-desc {
      width: 100%;
      height: 40px;
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-light) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer-swipe 1.5s infinite linear;
      border-radius: var(--radius-sm);
    }

    .skeleton-shimmer-footer {
      margin-top: auto;
      width: 100%;
      height: 38px;
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-light) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer-swipe 1.5s infinite linear;
      border-radius: var(--radius-sm);
    }

    @keyframes shimmer-swipe {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }


    /* ESTADO VACIO */
    .empty-state-premium {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 5rem 2rem;
      gap: 1.25rem;
    }

    .empty-icon-premium {
      width: 56px;
      height: 56px;
      color: var(--text-muted);
      opacity: 0.7;
    }

    .empty-state-premium h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .empty-state-premium p {
      color: var(--text-secondary);
      max-width: 420px;
      font-size: 0.95rem;
      line-height: 1.5;
    }


    /* ANIMACIONES */
    .animate-fade-in {
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-slide-up {
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-fade-in-delayed {
      opacity: 0;
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
    }
    .animate-fade-in-cards {
      opacity: 0;
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(25px); }
      to { opacity: 1; transform: translateY(0); }
    }


    /* RESPONSIVE */
    @media (max-width: 768px) {
      .catalog-hero {
        padding: 2.5rem 1.5rem;
      }
      .catalog-title {
        font-size: 2.25rem;
      }
      .catalog-subtitle {
        font-size: 1rem;
      }
      .category-pill-premium {
        padding: 0.55rem 1.15rem;
        font-size: 0.82rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  // States
  readonly searchQuery = signal<string>('');
  readonly selectedSchool = signal<string>('');
  readonly selectedCategory = signal<string>('');
  
  readonly products = signal<Producto[]>([]);
  readonly loadingProducts = signal<boolean>(true);
  
  readonly schools = signal<Institucion[]>([]);
  readonly categories = signal<Categoria[]>([]);

  private activeRequestId = 0;
  private searchTimeout: any;

  constructor() {
    effect(() => {
      this.cargarProductos();
    }, { allowSignalWrites: true });
  }

  async ngOnInit() {
    try {
      const [resSchools, resCategories] = await Promise.all([
        this.supabaseService.getInstituciones(),
        this.supabaseService.getCategorias()
      ]);
      
      this.schools.set(resSchools);
      this.categories.set(resCategories);
    } catch (err) {
      console.error('Error al inicializar catálogo:', err);
    }
  }

  async cargarProductos() {
    const requestId = ++this.activeRequestId;
    this.loadingProducts.set(true);
    
    try {
      const items = await this.supabaseService.getProductos({
        searchQuery: this.searchQuery(),
        institucionId: this.selectedSchool(),
        categoriaId: this.selectedCategory()
      });
      
      if (requestId === this.activeRequestId) {
        this.products.set(items);
      }
    } catch (err) {
      if (requestId === this.activeRequestId) {
        console.error('Error al cargar productos:', err);
      }
    } finally {
      if (requestId === this.activeRequestId) {
        this.loadingProducts.set(false);
      }
    }
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!value) {
      this.searchQuery.set('');
    } else {
      this.searchTimeout = setTimeout(() => {
        this.searchQuery.set(value);
      }, 300);
    }
  }

  onSchoolChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSchool.set(value);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
  }

  getEmoji(slug: string): string {
    switch (slug) {
      case 'artesania-y-arte': return '🎨';
      case 'textil-y-confeccion': return '🧵';
      case 'gastronomia-y-reposteria': return '🍰';
      case 'joyeria-y-bisuterian': return '💍';
      case 'horticultura-y-plantas': return '🪴';
      default: return '📦';
    }
  }
}
