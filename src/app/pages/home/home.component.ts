import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService, Producto } from '../../core/services/supabase.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { 
  LucideArrowRight, 
  LucideSparkles, 
  LucideAward, 
  LucideQuote 
} from '@lucide/angular';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink, 
    ProductCardComponent, 
    LucideArrowRight, 
    LucideSparkles, 
    LucideAward, 
    LucideQuote
  ],
  template: `
    <div class="home-page">
      <!-- 1. SECCIÓN HERO (Ultra-Premium, Inmersiva) -->
      <section class="home-hero">
        <div class="hero-overlay"></div>
        <div class="hero-grid-pattern"></div>
        <div class="container hero-container animate-fade-in">
          <div class="hero-badge-premium">
            <svg lucideSparkles class="badge-icon"></svg>
            <span>Vitrina de Emprendimiento Técnico</span>
          </div>
          <h1 class="hero-title-premium">Talento escolar que<br><span class="gradient-text">trasciende generaciones</span></h1>
          <p class="hero-subtitle-premium">
            Descubre y adquiere piezas artesanales únicas creadas por estudiantes de secundaria técnica de La Victoria. Apoya su aprendizaje, innovación y desarrollo sostenible.
          </p>
          <div class="hero-actions">
            <a routerLink="/catalogo" class="btn btn-primary-gradient hero-btn">
              <span>EXPLORAR COLECCIÓN</span>
              <svg lucideArrowRight class="btn-arrow"></svg>
            </a>
          </div>
        </div>
      </section>

      <!-- 2. SECCIÓN HISTORIA Y ESENCIA -->
      <section class="section home-story container">
        <div class="story-grid">
          <div class="story-text-content">
            <span class="section-badge">NUESTRA ESENCIA</span>
            <h2 class="section-title">Preservando el alma del arte manual</h2>
            <p class="story-desc">
              Cada pieza en La Victoria es el resultado de meses de dedicación, técnica refinada y una conexión 
              profunda con la materia prima. No solo adquieres un objeto único; compartes el legado de docentes 
              que enseñan con paciencia y el talento emergente de jóvenes que transforman su creatividad 
              en proyectos reales y productivos.
            </p>
            
            <div class="stats-row">
              <div class="stat-box">
                <span class="stat-number">100%</span>
                <span class="stat-label">Hecho a mano</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">3+</span>
                <span class="stat-label">Colegios Unidos</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">150+</span>
                <span class="stat-label">Estudiantes</span>
              </div>
            </div>
          </div>
          
          <div class="story-images">
            <div class="story-glow-orb"></div>
            <div class="story-img-card left-card glass-panel">
              <img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80" alt="Cerámica escolar" />
              <div class="image-overlay-title">Taller de Cerámica</div>
            </div>
            <div class="story-img-card right-card glass-panel">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80" alt="Telares y bordados" />
              <div class="image-overlay-title">Diseño de Modas y Confección</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. SECCIÓN CREADOR / PROYECTO DESTACADO (Formato Editorial de Revista) -->
      <section class="section creator-showcase bg-cream-latte">
        <div class="container">
          <div class="creator-grid glass-panel">
            <div class="creator-image-wrapper">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80" alt="Estudiante creadora de La Victoria" class="creator-image-file" />
              <div class="creator-photo-badge">
                <svg lucideAward class="badge-icon"></svg>
                <span>Proyecto Destacado</span>
              </div>
            </div>
            <div class="creator-content">
              <svg lucideQuote class="quote-icon"></svg>
              <h3 class="creator-quote">"El taller técnico me enseñó que puedo crear mis propias oportunidades y emprender a través del arte."</h3>
              <p class="creator-author">Milagros Huamán • Estudiante de 5to de Secundaria</p>
              <p class="creator-desc">
                Milagros lidera la colección de joyería y bisutería fina de este mes. Su trabajo destaca por el uso de resinas y metales pulidos inspirados en la iconografía precolombina, logrando diseños contemporáneos únicos de alta costura.
              </p>
              <a routerLink="/catalogo" class="btn-secondary-outline">
                <span>Ver Colección Especial</span>
                <svg lucideArrowRight class="btn-arrow-small"></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. COLECCIÓN DESTACADA (Dinámica desde Supabase) -->
      <section class="section home-featured bg-alt">
        <div class="container">
          <div class="section-header">
            <div>
              <span class="section-badge">SELECCIÓN ESPECIAL</span>
              <h2 class="section-title">Colección Destacada</h2>
              <p class="section-subtitle">Obras que resaltan por su excepcional calidad y dedicación.</p>
            </div>
            <a routerLink="/catalogo" class="btn-link-premium">
              <span>Explorar Todo el Catálogo</span> 
              <svg lucideArrowRight class="link-arrow"></svg>
            </a>
          </div>

          @if (loading()) {
            <div class="loader-container">
              <div class="spinner"></div>
              <p>Cargando colección destacada...</p>
            </div>
          } @else if (featuredProducts().length === 0) {
            <div class="empty-featured glass-panel">
              <p>Aún no hay productos publicados en el catálogo de producción.</p>
              <a routerLink="/dashboard" class="btn btn-primary-gradient">Subir Primer Producto</a>
            </div>
          } @else {
            <div class="featured-grid">
              @for (prod of featuredProducts(); track prod.id) {
                <app-product-card [producto]="prod" />
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .section {
      padding: 6rem 0;
    }
    
    .bg-alt {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }
    
    .bg-cream-latte {
      background: var(--primary-light);
      border-top: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
    }

    .section-badge {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--accent-color);
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      letter-spacing: -0.8px;
      line-height: 1.2;
    }

    /* 1. HERO SECTION (Ultra-Premium) */
    .home-hero {
      position: relative;
      height: 75vh;
      min-height: 550px;
      display: flex;
      align-items: center;
      background-image: url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=80');
      background-size: cover;
      background-position: center;
      color: #ffffff;
      overflow: hidden;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, rgba(37, 28, 22, 0.75) 0%, rgba(28, 18, 12, 0.94) 100%);
      z-index: 1;
    }

    .hero-grid-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(rgba(192, 142, 77, 0.15) 1px, transparent 1px);
      background-size: 24px 24px;
      z-index: 2;
      opacity: 0.85;
      pointer-events: none;
    }

    .hero-container {
      position: relative;
      z-index: 3;
      max-width: 850px;
      padding: 0 1.5rem;
    }

    .hero-badge-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(192, 142, 77, 0.18);
      border: 1px solid rgba(192, 142, 77, 0.35);
      color: var(--accent-color);
      padding: 0.45rem 1.25rem;
      border-radius: var(--radius-full);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(4px);
    }

    .badge-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .hero-title-premium {
      font-size: 4rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      color: #ffffff;
      letter-spacing: -1.5px;
    }

    .hero-title-premium .gradient-text {
      background: linear-gradient(135deg, var(--accent-color) 0%, #fcd34d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
    }

    .hero-subtitle-premium {
      font-size: 1.25rem;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 2.5rem;
      max-width: 720px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn-primary-gradient {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, var(--accent-color) 0%, #d97706 100%);
      color: #ffffff;
      border: none;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.95rem;
      padding: 1rem 2rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(192, 142, 77, 0.3);
      transition: all var(--transition-normal);
    }

    .btn-primary-gradient:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(192, 142, 77, 0.45);
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }

    .btn-primary-gradient:active {
      transform: translateY(-1px);
    }

    .btn-arrow {
      width: 18px;
      height: 18px;
      transition: transform var(--transition-fast);
    }

    .hero-btn:hover .btn-arrow {
      transform: translateX(4px);
    }


    /* 2. HISTORIA Y ESENCIA */
    .story-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 5rem;
      align-items: center;
    }

    .story-desc {
      color: var(--text-secondary);
      font-size: 1.08rem;
      line-height: 1.8;
      margin-bottom: 2.5rem;
    }

    .stats-row {
      display: flex;
      gap: 3rem;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--primary-color);
      font-family: var(--font-heading);
      line-height: 1;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 1px;
      margin-top: 0.35rem;
    }

    .story-images {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      position: relative;
    }

    .story-glow-orb {
      position: absolute;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: radial-gradient(var(--accent-color) 0%, transparent 70%);
      opacity: 0.15;
      top: 15%;
      left: 15%;
      filter: blur(40px);
      pointer-events: none;
      z-index: 0;
    }

    .story-img-card {
      aspect-ratio: 4/5;
      overflow: hidden;
      border-radius: var(--radius-md);
      position: relative;
      z-index: 1;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: var(--shadow-md);
      background: var(--bg-tertiary);
    }

    .story-img-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .story-img-card:hover img {
      transform: scale(1.06);
    }

    .image-overlay-title {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2rem 1rem 1rem 1rem;
      background: linear-gradient(0deg, rgba(37, 28, 22, 0.85) 0%, transparent 100%);
      color: #ffffff;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.95rem;
      z-index: 2;
    }

    .left-card {
      transform: translateY(2rem);
    }

    .right-card {
      transform: translateY(-2rem);
    }


    /* 3. SECCIÓN CREADOR / PROYECTO DESTACADO (Revista de Lujo) */
    .creator-showcase {
      position: relative;
      overflow: hidden;
    }

    .creator-grid {
      display: grid;
      grid-template-columns: 1fr;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--glass-border);
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      box-shadow: var(--glass-shadow);
      transition: border var(--transition-normal), box-shadow var(--transition-normal);
    }

    .creator-grid:hover {
      border-color: rgba(192, 142, 77, 0.35);
      box-shadow: 0 30px 60px -15px rgba(37, 28, 22, 0.12);
    }

    @media (min-width: 992px) {
      .creator-grid {
        grid-template-columns: 0.95fr 1.05fr;
      }
    }

    .creator-image-wrapper {
      position: relative;
      aspect-ratio: 16/10;
      overflow: hidden;
    }

    @media (min-width: 992px) {
      .creator-image-wrapper {
        aspect-ratio: auto;
        height: 100%;
      }
    }

    .creator-image-file {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .creator-grid:hover .creator-image-file {
      transform: scale(1.03);
    }

    .creator-photo-badge {
      position: absolute;
      top: 24px;
      left: 24px;
      background: rgba(37, 28, 22, 0.85);
      color: var(--accent-color);
      border: 1px solid rgba(192, 142, 77, 0.3);
      padding: 0.45rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      backdrop-filter: blur(4px);
      z-index: 2;
    }

    .creator-content {
      padding: 4rem 3.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      position: relative;
    }

    .quote-icon {
      width: 52px;
      height: 52px;
      color: var(--accent-color);
      opacity: 0.18;
      margin-bottom: 1rem;
    }

    .creator-quote {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 600;
      font-style: italic;
      line-height: 1.35;
      color: var(--text-primary);
      margin-bottom: 1.25rem;
      letter-spacing: -0.5px;
    }

    .creator-author {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--accent-color);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 1.5rem;
    }

    .creator-desc {
      color: var(--text-secondary);
      font-size: 1.02rem;
      line-height: 1.7;
      margin-bottom: 2.25rem;
    }

    .btn-secondary-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: 1.5px solid var(--primary-color);
      color: var(--primary-color);
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0.8rem 1.75rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .btn-secondary-outline:hover {
      background: var(--primary-color);
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .btn-arrow-small {
      width: 14px;
      height: 14px;
      transition: transform var(--transition-fast);
    }

    .btn-secondary-outline:hover .btn-arrow-small {
      transform: translateX(3px);
    }


    /* 4. COLECCIÓN DESTACADA */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 4rem;
    }

    .section-subtitle {
      color: var(--text-secondary);
      font-size: 1.05rem;
    }

    .btn-link-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      transition: all var(--transition-fast);
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 3px;
    }

    .btn-link-premium:hover {
      color: var(--accent-color);
      border-color: var(--accent-color);
    }

    .link-arrow {
      width: 16px;
      height: 16px;
      transition: transform var(--transition-fast);
    }

    .btn-link-premium:hover class.link-arrow,
    .btn-link-premium:hover .link-arrow {
      transform: translateX(4px);
    }

    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .empty-featured {
      padding: 4rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      color: var(--text-secondary);
    }

    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      gap: 1.25rem;
      color: var(--text-secondary);
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 3.5px solid var(--border-light);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .animate-fade-in {
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }


    /* RESPONSIVE */
    @media (max-width: 1024px) {
      .hero-title-premium {
        font-size: 3.25rem;
      }
      .story-grid {
        gap: 3rem;
      }
    }

    @media (max-width: 768px) {
      .section {
        padding: 4rem 0;
      }
      .hero-title-premium {
        font-size: 2.5rem;
      }
      .hero-subtitle-premium {
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }
      .story-grid {
        grid-template-columns: 1fr;
        gap: 4rem;
      }
      .left-card, .right-card {
        transform: translateY(0);
      }
      .stats-row {
        gap: 1.5rem;
        justify-content: space-between;
      }
      .creator-content {
        padding: 2.5rem 1.75rem;
      }
      .creator-quote {
        font-size: 1.6rem;
      }
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  readonly featuredProducts = signal<Producto[]>([]);
  readonly loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      const items = await this.supabaseService.getProductos({
        estado: 'publicado'
      });
      this.featuredProducts.set(items.slice(0, 4));
    } catch (err) {
      console.error('Error al cargar colección destacada de Supabase:', err);
    } finally {
      this.loading.set(false);
    }
  }
}
