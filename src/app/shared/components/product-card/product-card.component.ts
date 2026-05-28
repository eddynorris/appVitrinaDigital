import { Component, input, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '../../../core/services/supabase.service';
import { LucideSchool, LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, LucideSchool, LucideArrowRight],
  template: `
    @let prod = producto();
    <div class="product-card-premium glass-card">
      <div class="card-image-wrapper-premium" [class.loaded]="imageLoaded()">
        @if (isVideo(imageSrc())) {
          <video 
            [src]="imageSrc()" 
            class="product-image-premium"
            [class.loaded]="imageLoaded()"
            autoplay
            muted
            loop
            playsinline
            (loadeddata)="imageLoaded.set(true)"
          ></video>
        } @else {
          <img 
            [src]="imageSrc()" 
            [alt]="prod.nombre"
            class="product-image-premium"
            [class.loaded]="imageLoaded()"
            (load)="imageLoaded.set(true)"
            (error)="onImageError()"
            loading="lazy"
          />
        }
        <span class="category-badge-premium">{{ prod.categorias?.nombre }}</span>
      </div>

      <div class="card-content-premium">
        <div class="school-badge-wrapper-premium">
          <span class="school-badge-premium">
            <svg lucideSchool class="school-icon-premium"></svg>
            <span>{{ prod.instituciones?.nombre }}</span>
          </span>
        </div>

        <h3 class="product-title-premium" [title]="prod.nombre">{{ prod.nombre }}</h3>
        <p class="product-description-premium">{{ prod.descripcion }}</p>

        <div class="card-footer-premium">
          <div class="price-container-premium">
            <span class="price-label-premium">Valor Estimado</span>
            <span class="price-value-premium">{{ prod.precio | currency:'PEN':'S/. ' }}</span>
          </div>
          <a [routerLink]="['/producto', prod.id]" class="btn-card-premium">
            <span>Ver Ficha</span>
            <svg lucideArrowRight class="btn-arrow-premium"></svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card-premium {
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: var(--radius-md);
      position: relative;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      backdrop-filter: var(--glass-blur);
      overflow: hidden;
      transition: all var(--transition-normal);
    }

    .product-card-premium:hover {
      transform: translateY(-8px);
      border-color: rgba(192, 142, 77, 0.3);
      box-shadow: 0 20px 40px -10px rgba(192, 142, 77, 0.15), var(--glass-shadow);
    }

    [data-theme="dark"] .product-card-premium:hover {
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4), var(--glass-shadow);
    }

    .card-image-wrapper-premium {
      position: relative;
      width: 100%;
      padding-top: 75%; /* 4:3 Aspect Ratio */
      overflow: hidden;
      background: var(--bg-tertiary);
    }

    /* Shimmer effect while loading */
    .card-image-wrapper-premium::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      background-size: 200% 100%;
      animation: loading-shimmer 1.5s infinite linear;
      z-index: 1;
      opacity: 1;
      transition: opacity 0.4s ease;
    }
    [data-theme="dark"] .card-image-wrapper-premium::before {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    }

    .card-image-wrapper-premium.loaded::before {
      opacity: 0;
      pointer-events: none;
    }

    @keyframes loading-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .product-image-premium {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.4s ease, transform var(--transition-slow);
      z-index: 2;
    }

    .product-image-premium.loaded {
      opacity: 1;
    }

    .product-card-premium:hover .product-image-premium.loaded {
      transform: scale(1.05);
    }

    .category-badge-premium {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(37, 28, 22, 0.82);
      color: #ffffff;
      padding: 0.3rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      z-index: 3;
    }

    .card-content-premium {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .school-badge-wrapper-premium {
      margin-bottom: 0.65rem;
    }

    .school-badge-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-color);
      background: var(--primary-light);
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
    }
    [data-theme="dark"] .school-badge-premium {
      background: rgba(192, 142, 77, 0.1);
      color: var(--accent-color);
      border-color: rgba(192, 142, 77, 0.2);
    }

    .school-icon-premium {
      width: 13px;
      height: 13px;
    }

    .product-title-premium {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.3px;
    }

    .product-description-premium {
      font-size: 0.88rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-grow: 1;
      height: 2.8rem; /* Fijo para alinear tarjetas */
      line-height: 1.4;
    }

    .card-footer-premium {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      border-top: 1px solid var(--border-light);
      padding-top: 1rem;
    }

    .price-container-premium {
      display: flex;
      flex-direction: column;
    }

    .price-label-premium {
      font-size: 0.68rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .price-value-premium {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--text-primary) 0%, var(--primary-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    [data-theme="dark"] .price-value-premium {
      background: linear-gradient(135deg, #ffffff 0%, var(--accent-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .btn-card-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--primary-color);
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
      transition: color var(--transition-fast);
      border-bottom: 1.5px solid var(--primary-color);
      padding-bottom: 2px;
      cursor: pointer;
    }

    .btn-card-premium:hover {
      color: var(--accent-color);
      border-color: var(--accent-color);
    }

    .btn-arrow-premium {
      width: 14px;
      height: 14px;
      transition: transform var(--transition-fast);
    }

    .btn-card-premium:hover .btn-arrow-premium {
      transform: translateX(4px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  readonly producto = input.required<Producto>();

  readonly imageSrc = signal<string>('');
  readonly imageLoaded = signal<boolean>(false);
  private fallbackUrl = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80';

  constructor() {
    effect(() => {
      const prod = this.producto();
      this.imageSrc.set(prod.imagenes?.[0] || this.fallbackUrl);
      this.imageLoaded.set(false);
    });
  }

  onImageError() {
    this.imageSrc.set(this.fallbackUrl);
    this.imageLoaded.set(true);
  }

  isVideo(url: string): boolean {
    return url ? /\.(mp4|webm|ogg|mov)$/i.test(url) : false;
  }
}
