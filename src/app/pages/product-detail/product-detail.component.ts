import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { SupabaseService, Producto } from '../../core/services/supabase.service';
import { 
  LucideArrowLeft, 
  LucideSchool, 
  LucideShieldCheck, 
  LucideAlertCircle 
} from '@lucide/angular';

@Component({
  selector: 'app-product-detail',
  imports: [
    RouterLink, 
    CurrencyPipe,
    LucideArrowLeft,
    LucideSchool,
    LucideShieldCheck,
    LucideAlertCircle
  ],
  template: `
    <div class="detail-page container">
      <div class="back-navigation">
        <a routerLink="/catalogo" class="btn-back">
          <svg lucideArrowLeft></svg>
          Volver al Catálogo
        </a>
      </div>

      @if (loading()) {
        <div class="loading-container glass-panel">
          <div class="loader"></div>
          <p>Cargando detalles del producto...</p>
        </div>
      } @else if (error()) {
        <div class="error-container glass-panel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6M9 9l6 6"/>
          </svg>
          <h3>Ocurrió un error</h3>
          <p>{{ error() }}</p>
          <a routerLink="/" class="btn btn-primary">Ir al Inicio</a>
        </div>
      } @else if (producto(); as prod) {
        <div class="detail-grid">
          <!-- Galería de imágenes/videos (Izquierda) -->
          <div class="gallery-container">
            <div class="main-image-wrapper glass-panel" [class.loaded]="imageLoaded()">
              @if (isVideo(activeImage())) {
                <video 
                  [src]="activeImage()" 
                  class="main-image"
                  [class.loaded]="imageLoaded()"
                  controls
                  autoplay
                  muted
                  playsinline
                  (loadeddata)="imageLoaded.set(true)"
                  style="width: 100%; height: 100%; object-fit: cover;"
                ></video>
              } @else {
                <img 
                  [src]="activeImage() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80'" 
                  [alt]="prod.nombre" 
                  class="main-image"
                  [class.loaded]="imageLoaded()"
                  (load)="imageLoaded.set(true)"
                  (error)="onMainImageError()"
                />
              }
            </div>
            
            @if (prod.imagenes.length > 1) {
              <div class="thumbnails-container">
                @for (img of prod.imagenes; track img) {
                  <button 
                    class="thumbnail-btn glass-panel" 
                    [class.active]="activeImage() === img"
                    (click)="setActiveImage(img)"
                  >
                    @if (isVideo(img)) {
                      <video [src]="img" class="thumbnail-img" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>
                    } @else {
                      <img [src]="img" alt="Miniatura" class="thumbnail-img" />
                    }
                  </button>
                }
              </div>
            }
          </div>

          <!-- Información del Producto (Derecha) -->
          <div class="info-container glass-panel">
            <div class="info-header">
              <span class="category-tag">{{ prod.categorias?.nombre }}</span>
              <span class="school-tag">
                <svg lucideSchool></svg>
                {{ prod.instituciones?.nombre }}
              </span>
            </div>

            <h1 class="product-title">{{ prod.nombre }}</h1>
            
            <div class="price-box">
              <span class="price-label">Precio</span>
              <span class="price-value">{{ prod.precio | currency:'PEN':'S/. ' }}</span>
            </div>

            <hr class="divider">

            <div class="description-box">
              <h3>Descripción</h3>
              <p>{{ prod.descripcion }}</p>
            </div>

            <hr class="divider">

            <!-- Caja de Información de Seguridad y Tutor -->
            <div class="safety-box">
              <div class="safety-header">
                <svg lucideShieldCheck class="safety-icon"></svg>
                <h4>Transacción Segura e Intermediada</h4>
              </div>
              <p class="safety-text">
                Para proteger la privacidad de nuestras alumnas menores de edad, las consultas de compra son gestionadas directamente por el docente tutor asignado al proyecto.
              </p>
              @if (getTutorContacto(prod); as tutor) {
                <div class="tutor-info">
                  <strong>Docente Encargado:</strong> {{ tutor.nombre_completo }}
                </div>
              } @else {
                <div class="tutor-info" style="color: #ef4444; font-weight: 600;">
                  <strong>Docente Encargado:</strong> Pendiente de asignación por el colegio
                </div>
              }
            </div>

            <!-- Botón de WhatsApp Dinámico y Seguro -->
            @if (getTutorContacto(prod); as tutor) {
              <a 
                [href]="getWhatsAppUrl(prod, tutor.whatsapp_contacto)" 
                target="_blank" 
                class="btn btn-success btn-whatsapp-purchase"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.018-5.093-2.87-6.948C16.582 1.97 14.12 1.96 12.01 1.96c-5.438 0-9.863 4.413-9.866 9.83-.001 1.762.483 3.484 1.396 4.969L2.522 21.46l4.981-1.306-.856.5zM18.06 14.88c-.328-.164-1.942-.958-2.242-1.069-.302-.109-.521-.164-.74.164-.219.328-.847 1.069-1.037 1.288-.19.219-.38.246-.708.082-.328-.164-1.386-.511-2.64-1.63-1.002-.895-1.68-2.002-1.876-2.33-.196-.328-.021-.505.143-.668.147-.147.328-.383.493-.574.165-.192.22-.328.328-.547.11-.219.056-.411-.027-.574-.082-.164-.74-1.78-.99-2.41-.247-.614-.497-.532-.68-.541-.176-.009-.38-.009-.584-.009-.204 0-.537.077-.818.384-.282.307-1.077 1.053-1.077 2.569s1.1 2.985 1.252 3.19c.152.204 2.164 3.31 5.242 4.634.732.314 1.302.502 1.748.643.736.233 1.407.2 1.937.12.59-.088 1.943-.794 2.217-1.56.275-.765.275-1.422.193-1.56-.083-.138-.302-.22-.63-.383z"/>
                </svg>
                Me Interesa / Comprar
              </a>
            } @else {
              <div class="no-whatsapp-alert">
                <svg lucideAlertCircle></svg>
                Este producto no tiene un tutor de contacto asignado temporalmente.
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .back-navigation {
      display: flex;
      align-items: center;
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: color var(--transition-fast);
    }
    .btn-back:hover {
      color: var(--primary-color);
    }
    .btn-back svg {
      width: 18px;
      height: 18px;
    }

    /* Grid */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    /* Galería */
    .gallery-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .main-image-wrapper {
      position: relative;
      width: 100%;
      padding-top: 80%; /* 5:4 */
      overflow: hidden;
      background: var(--bg-tertiary);
    }
    .main-image-wrapper::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
      background-size: 200% 100%;
      animation: loading-shimmer 1.5s infinite linear;
      z-index: 1;
      opacity: 1;
      transition: opacity 0.4s ease;
    }
    .main-image-wrapper.loaded::before {
      opacity: 0;
      pointer-events: none;
    }
    @keyframes loading-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .main-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 2;
    }
    .main-image.loaded {
      opacity: 1;
    }
    .thumbnails-container {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .thumbnail-btn {
      width: 80px;
      height: 64px;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm);
    }
    .thumbnail-btn.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-light);
    }
    .thumbnail-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Info */
    .info-container {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .info-header {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .category-tag {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--border-color);
    }
    .school-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--primary-light);
      color: var(--primary-dark);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .school-tag svg {
      width: 12px;
      height: 12px;
    }
    .product-title {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .price-box {
      display: flex;
      flex-direction: column;
    }
    .price-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .price-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .divider {
      border: 0;
      border-top: 1px solid var(--border-light);
    }
    .description-box h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    .description-box p {
      color: var(--text-secondary);
      line-height: 1.7;
    }

    /* Caja de Seguridad */
    .safety-box {
      background: rgba(16, 185, 129, 0.04);
      border: 1px solid rgba(16, 185, 129, 0.15);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    [data-theme="dark"] .safety-box {
      background: rgba(16, 185, 129, 0.02);
      border-color: rgba(16, 185, 129, 0.1);
    }
    .safety-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--success-color);
    }
    .safety-icon {
      width: 20px;
      height: 20px;
    }
    .safety-header h4 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--success-color);
    }
    .safety-text {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .tutor-info {
      font-size: 0.85rem;
      color: var(--text-primary);
      margin-top: 0.25rem;
    }

    /* Botones de acción */
    .btn-whatsapp-purchase {
      font-size: 1.1rem;
      font-weight: 600;
      padding: 1rem 2rem;
      width: 100%;
      box-shadow: 0 4px 20px -2px rgba(16, 185, 129, 0.3);
    }
    .no-whatsapp-alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #ef4444;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-weight: 500;
    }
    [data-theme="dark"] .no-whatsapp-alert {
      background: rgba(239, 68, 68, 0.05);
      border-color: rgba(239, 68, 68, 0.2);
    }
    .no-whatsapp-alert svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    /* Loader */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1.5rem;
    }
    .loader {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-light);
      border-top-color: var(--primary-color);
      border-radius: var(--radius-full);
      animation: spin 1s infinite linear;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    
    .error-container {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .error-container svg {
      width: 48px;
      height: 48px;
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      .product-title {
        font-size: 1.75rem;
      }
      .info-container {
        padding: 1.25rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);

  readonly producto = signal<Producto | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  getTutorContacto(prod: Producto): { nombre_completo: string; whatsapp_contacto: string; rol?: string } | null {
    if (prod.perfiles && prod.perfiles.rol !== 'alumno' && prod.perfiles.whatsapp_contacto) {
      return prod.perfiles;
    }
    if (prod.creador && prod.creador.tutor && prod.creador.tutor.rol !== 'alumno' && prod.creador.tutor.whatsapp_contacto) {
      return prod.creador.tutor;
    }
    return null;
  }
  
  readonly activeImage = signal<string>('');
  readonly imageLoaded = signal<boolean>(false);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Identificador de producto no válido.');
      this.loading.set(false);
      return;
    }

    try {
      const prod = await this.supabaseService.getProductoById(id);
      this.producto.set(prod);
      if (prod.imagenes && prod.imagenes.length > 0) {
        this.activeImage.set(prod.imagenes[0]);
        this.imageLoaded.set(false);
      }
    } catch (err: unknown) {
      console.error('Error al cargar detalle:', err);
      this.error.set('No se pudo encontrar el producto o el servicio no está disponible.');
    } finally {
      this.loading.set(false);
    }
  }

  setActiveImage(imgUrl: string) {
    if (this.activeImage() !== imgUrl) {
      this.imageLoaded.set(false);
      this.activeImage.set(imgUrl);
    }
  }

  isVideo(url: string): boolean {
    return url ? /\.(mp4|webm|ogg|mov)$/i.test(url) : false;
  }

  onMainImageError() {
    this.activeImage.set('https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80');
    this.imageLoaded.set(true);
  }

  getWhatsAppUrl(prod: Producto, teacherPhone: string): string {
    const cleanPhone = teacherPhone.replace(/\D/g, ''); // Limpiar caracteres no numéricos
    // Prefijo internacional para Perú (51) si tiene 9 dígitos (números móviles estándar de Perú)
    const formattedPhone = cleanPhone.length === 9 && !cleanPhone.startsWith('51') 
      ? `51${cleanPhone}` 
      : cleanPhone;

    const message = 
      `¡Hola! Estoy interesado en un producto de la Vitrina Digital:\n\n` +
      `*Producto:* ${prod.nombre}\n` +
      `*Colegio:* ${prod.instituciones?.nombre || 'No especificado'}\n` +
      `*Precio:* S/. ${prod.precio.toFixed(2)}\n\n` +
      `Quisiera consultar si se encuentra disponible y los detalles para realizar la entrega. ¡Muchas gracias!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }
}
