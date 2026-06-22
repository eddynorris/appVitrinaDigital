import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { AuthService, Perfil } from '../../core/services/auth.service';
import { SupabaseService, Producto, Categoria } from '../../core/services/supabase.service';
import { ImageService } from '../../core/services/image.service';
import { AlertService } from '../../core/services/alert.service';
import { 
  LucidePlus, 
  LucideUpload, 
  LucidePencil, 
  LucideTrash2, 
  LucideFileText, 
  LucideSparkles, 
  LucideCopy,
  LucideAlertCircle
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  imports: [
    ReactiveFormsModule, 
    CurrencyPipe,
    RouterLink,
    LucidePlus,
    LucideUpload,
    LucidePencil,
    LucideTrash2,
    LucideFileText,
    LucideSparkles,
    LucideCopy,
    LucideAlertCircle
  ],
  template: `
    <div class="dashboard-page container">
      <!-- ALERTA DE PERFIL INCOMPLETO -->
      @if (user() && !user()?.institucion_id) {
        <div class="warning-banner glass-panel animate-fade-in">
          <svg lucideAlertCircle class="warning-icon"></svg>
          <div class="warning-content">
            <h4>¡Perfil Incompleto!</h4>
            <p>Para poder publicar productos en la vitrina, debes seleccionar tu institución educativa y confirmar tu rol en tu perfil.</p>
          </div>
          <a routerLink="/perfil" class="btn btn-primary btn-sm">Completar Perfil</a>
        </div>
      }

      <!-- Encabezado del Panel -->
      <header class="dashboard-header glass-panel">
        <div class="header-user-info">
          <h2>Panel de Administración</h2>
          <p>Bienvenido, <strong>{{ user()?.nombre_completo }}</strong> • {{ user()?.instituciones?.nombre || 'General' }}</p>
        </div>
        <div class="header-actions" style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          @if (user()?.rol === 'admin') {
            <a routerLink="/dashboard/instituciones" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
              Gestionar Colegios
            </a>
          }
          @if (!isFormOpen()) {
            <button 
              class="btn btn-primary" 
              (click)="openCreateForm()"
              [disabled]="!user()?.institucion_id"
            >
              <svg lucidePlus [size]="16"></svg>
              Nuevo Producto
            </button>
          } @else {
            <button class="btn btn-secondary" (click)="closeForm()">
              Volver al Listado
            </button>
          }
        </div>
      </header>

      <div class="dashboard-layout">
        <!-- ÁREA CENTRAL: FORMULARIO O TABLA DE PRODUCTOS -->
        <main class="dashboard-main">
          @if (isFormOpen()) {
            <!-- Formulario de Producto -->
            <div class="form-container glass-panel">
              <h3>{{ isEditing() ? 'Editar' : 'Añadir' }} Producto</h3>
              
              <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="product-form">
                <div class="form-row">
                  <div class="form-group flex-2">
                    <label class="form-label" for="nombre">Nombre del Producto</label>
                    <input id="nombre" type="text" class="form-input" [class.input-invalid]="isFieldInvalid('nombre')" formControlName="nombre" placeholder="Ej. Jarra de Cerámica Pintada" />
                    @if (isFieldInvalid('nombre')) {
                      <span class="error-text">El nombre es obligatorio.</span>
                    }
                  </div>
                  
                  <div class="form-group flex-1">
                    <label class="form-label" for="precio">Precio (S/.)</label>
                    <input id="precio" type="number" step="0.10" class="form-input" [class.input-invalid]="isFieldInvalid('precio')" formControlName="precio" placeholder="0.00" />
                    @if (isFieldInvalid('precio')) {
                      <span class="error-text">El precio es obligatorio y debe ser mayor o igual a 0.</span>
                    }
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label" for="categoria">Categoría</label>
                    <select id="categoria" class="form-input" [class.input-invalid]="isFieldInvalid('categoria_id')" formControlName="categoria_id">
                      <option value="">Selecciona una categoría</option>
                      @for (cat of categories(); track cat.id) {
                        <option [value]="cat.id">{{ cat.nombre }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('categoria_id')) {
                      <span class="error-text">La categoría es obligatoria.</span>
                    }
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label" for="estado">Estado de Publicación</label>
                    <select id="estado" class="form-input" formControlName="estado">
                      <option value="publicado">Publicado (Visible en catálogo)</option>
                      <option value="borrador">Borrador (Privado)</option>
                      <option value="pausado">Pausado (Sin opción de compra)</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="descripcion">Descripción</label>
                  <textarea id="descripcion" rows="4" class="form-input" [class.input-invalid]="isFieldInvalid('descripcion')" formControlName="descripcion" placeholder="Describe los materiales, dimensiones y el taller donde se fabricó el producto..."></textarea>
                  @if (isFieldInvalid('descripcion')) {
                    <span class="error-text">La descripción es obligatoria.</span>
                  }
                </div>

                <!-- Subida de imágenes/videos con Compresión del Cliente -->
                <div class="form-group">
                  <label class="form-label">Fotos o Videos del Producto</label>
                  <div 
                    class="drag-drop-area"
                    [class.input-invalid]="showImageError()"
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event)"
                    (click)="fileInput.click()"
                  >
                    <input 
                      #fileInput 
                      type="file" 
                      multiple 
                      accept="image/*,video/*" 
                      style="display: none" 
                      (change)="onFileSelected($event)"
                    />
                    <svg lucideUpload class="upload-icon"></svg>
                    <p class="upload-title">Arrastra tus fotos o videos aquí o haz clic para buscar</p>
                    <p class="upload-subtitle">Las imágenes se optimizan automáticamente. Los videos deben pesar menos de 15MB (MP4/WebM).</p>
                  </div>

                  @if (showImageError()) {
                    <span class="error-text" style="margin-top: 0.5rem; display: block; text-align: center;">Debes subir al menos una foto o video del producto.</span>
                  }

                  @if (uploadingImage()) {
                    <div class="upload-progress">
                      <div class="spinner-sm"></div>
                      Comprimiendo y subiendo imagen...
                    </div>
                  }

                  <!-- Previsualización de imágenes/videos subidas -->
                  @if (uploadedImages().length > 0) {
                    <div class="preview-grid">
                      @for (img of uploadedImages(); track img; let idx = $index) {
                        <div class="preview-item">
                          @if (isVideo(img)) {
                            <video [src]="img" class="table-thumb" style="width: 100%; height: 100%; object-fit: cover;" autoplay muted loop playsinline></video>
                          } @else {
                            <img [src]="img" alt="Vista previa del producto" />
                          }
                          <button type="button" class="btn-remove-img" (click)="removeImage(idx)">
                            &times;
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="closeForm()" [disabled]="saving()">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="saving()">
                    @if (saving()) {
                      Guardando...
                    } @else {
                      Guardar Producto
                    }
                  </button>
                </div>
              </form>
            </div>
          } @else {
            <!-- Listado de Productos -->
            <div class="table-container glass-panel">
              <div class="table-header">
                <h3>Mis Productos Publicados</h3>
              </div>

              @if (loadingProducts()) {
                <div class="table-loader">
                  <div class="loader"></div>
                  <p>Cargando productos...</p>
                </div>
              } @else if (myProducts().length === 0) {
                <div class="table-empty">
                  <svg lucideFileText></svg>
                  <p>Aún no has registrado ningún producto. ¡Presiona "Nuevo Producto" para empezar!</p>
                </div>
              } @else {
                <div class="table-scroll">
                  <table class="products-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (prod of myProducts(); track prod.id) {
                        <tr>
                          <td>
                            @if (isVideo(prod.imagenes[0])) {
                              <video [src]="prod.imagenes[0]" class="table-thumb" style="width: 48px; height: 48px; object-fit: cover;" autoplay muted loop playsinline></video>
                            } @else {
                              <img [src]="prod.imagenes[0]" alt="Producto" class="table-thumb" />
                            }
                          </td>
                          <td class="table-name-cell">
                            <strong>{{ prod.nombre }}</strong>
                          </td>
                          <td>{{ prod.categorias?.nombre }}</td>
                          <td>{{ prod.precio | currency:'PEN':'S/. ' }}</td>
                          <td>
                            <span class="status-pill" [class]="prod.estado">
                              {{ prod.estado === 'publicado' ? 'Publicado' : (prod.estado === 'borrador' ? 'Borrador' : (prod.estado === 'pausado' ? 'Pausado' : 'Vendido')) }}
                            </span>
                          </td>
                          <td>
                            <div class="table-actions">
                              <button class="btn-action-edit" (click)="openEditForm(prod)" title="Editar">
                                <svg lucidePencil [size]="16"></svg>
                              </button>
                              <button class="btn-action-delete" (click)="deleteProduct(prod.id!)" title="Eliminar">
                                <svg lucideTrash2 [size]="16"></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Controles de Paginación -->
                @if (totalCount() > pageSize()) {
                  <div class="pagination-container glass-panel animate-fade-in">
                    <span class="pagination-info">
                      Mostrando {{ minRange }} a {{ maxRange }} de {{ totalCount() }} productos
                    </span>
                    <div class="pagination-buttons">
                      <button 
                        type="button"
                        class="btn-pagination" 
                        [disabled]="currentPage() === 1"
                        (click)="changePage(currentPage() - 1)"
                        aria-label="Página anterior"
                      >
                        &laquo; Anterior
                      </button>
                      
                      @for (p of getPagesArray(); track p) {
                        <button 
                          type="button"
                          class="btn-pagination-num" 
                          [class.active]="p === currentPage()"
                          (click)="changePage(p)"
                        >
                          {{ p }}
                        </button>
                      }
                      
                      <button 
                        type="button"
                        class="btn-pagination" 
                        [disabled]="currentPage() === totalPages"
                        (click)="changePage(currentPage() + 1)"
                        aria-label="Página siguiente"
                      >
                        Siguiente &raquo;
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          }
        </main>

        <!-- PANEL LATERAL: ASISTENTE IA PARA PRODUCTOS (Tabs) -->
        <aside class="dashboard-sidebar">
          <div class="sidebar-widget glass-panel primary-border" style="padding: 1.25rem;">
            <div class="widget-header" style="margin-bottom: 1rem;">
              <svg lucideSparkles [size]="20" class="widget-icon" style="color: var(--primary-color);"></svg>
              <h4 style="font-size: 1rem; font-weight: 700; margin: 0;">Asistente IA del Producto</h4>
            </div>
            
            <!-- Sub-menú de Pestañas Premium -->
            <div class="tab-menu" style="display: flex; gap: 0.25rem; background: var(--bg-tertiary); padding: 0.25rem; border-radius: var(--radius-sm); margin-bottom: 1rem; border: 1px solid var(--border-color);">
              <button 
                type="button"
                class="tab-btn" 
                [class.active]="activeTab() === 'fotos'" 
                (click)="activeTab.set('fotos')"
                style="flex: 1; padding: 0.5rem 0.25rem; font-size: 0.72rem; font-weight: 700; border: none; background: transparent; cursor: pointer; border-radius: 4px; color: var(--text-secondary); transition: all var(--transition-fast);"
              >
                📸 Fotos
              </button>
              <button 
                type="button"
                class="tab-btn" 
                [class.active]="activeTab() === 'redaccion'" 
                (click)="activeTab.set('redaccion')"
                style="flex: 1; padding: 0.5rem 0.25rem; font-size: 0.72rem; font-weight: 700; border: none; background: transparent; cursor: pointer; border-radius: 4px; color: var(--text-secondary); transition: all var(--transition-fast);"
              >
                ✍️ Redacción
              </button>
              <button 
                type="button"
                class="tab-btn" 
                [class.active]="activeTab() === 'comercial'" 
                (click)="activeTab.set('comercial')"
                style="flex: 1; padding: 0.5rem 0.25rem; font-size: 0.72rem; font-weight: 700; border: none; background: transparent; cursor: pointer; border-radius: 4px; color: var(--text-secondary); transition: all var(--transition-fast);"
              >
                📢 Comercial
              </button>
            </div>

            <!-- CONTENIDO DE PESTAÑA: FOTOS -->
            @if (activeTab() === 'fotos') {
              <div class="tab-content animate-fade-in" style="display: flex; flex-direction: column; gap: 0.85rem;">
                <p class="widget-text" style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                  Herramientas gratuitas para optimizar o generar fotos de tus productos:
                </p>
                <div class="ai-links" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
                  <a href="https://gemini.google.com" target="_blank" class="ai-link-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 0.72rem; padding: 0.4rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-primary); transition: all var(--transition-fast);">
                    <span>♊</span> Gemini Chat
                  </a>
                  <a href="https://chat.qwenlm.ai" target="_blank" class="ai-link-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 0.72rem; padding: 0.4rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-primary); transition: all var(--transition-fast);">
                    <span>🤖</span> Qwen Chat
                  </a>
                  <a href="https://image.z.ai/" target="_blank" class="ai-link-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 0.72rem; padding: 0.4rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-primary); transition: all var(--transition-fast);">
                    <span>⚡</span> Z.ai Image
                  </a>
                  <a href="https://labs.google/fx/es/tools/flow" target="_blank" class="ai-link-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 0.72rem; padding: 0.4rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-primary); transition: all var(--transition-fast);">
                    <span>🌊</span> Google Flow
                  </a>
                </div>
                <div class="prompt-selector-wrapper">
                  <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Estilo de Foto (ref. imagen cargada):</label>
                  <select class="form-input" style="font-size: 0.78rem; padding: 0.4rem; height: auto;" (change)="onPromptStyleChange($event)">
                    <option value="estudio">Fondo de Estudio Minimalista</option>
                    <option value="organico">Bodegón Orgánico (Postres/Plantas)</option>
                    <option value="catalogo">Catálogo Comercial de Lujo</option>
                    <option value="flatlay">Vista Cenital (Flat Lay) Creativo</option>
                  </select>
                </div>
                <div class="prompt-box" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem; font-size: 0.72rem; font-family: monospace; color: var(--text-primary); word-break: break-word; max-height: 100px; overflow-y: auto;">
                  {{ activeImagePrompt() }}
                </div>
                <button type="button" class="btn btn-glass" style="font-size: 0.75rem; padding: 0.45rem 1rem; width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.35rem;" (click)="copyToClipboard(activeImagePrompt())">
                  <svg lucideCopy [size]="12"></svg>
                  Copiar Prompt de Imagen
                </button>
              </div>
            }

            <!-- CONTENIDO DE PESTAÑA: REDACCIÓN -->
            @if (activeTab() === 'redaccion') {
              <div class="tab-content animate-fade-in" style="display: flex; flex-direction: column; gap: 0.85rem;">
                <p class="widget-text" style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                  Adjunta la foto de tu producto en Gemini Chat para obtener una descripción optimizada para SEO en un solo párrafo:
                </p>
                <div class="prompt-box" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem; font-size: 0.72rem; font-family: monospace; color: var(--text-primary); word-break: break-word; max-height: 120px; overflow-y: auto;">
                  {{ activeRedaccionPrompt }}
                </div>
                <button type="button" class="btn btn-glass" style="font-size: 0.75rem; padding: 0.45rem 1rem; width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.35rem;" (click)="copyToClipboard(activeRedaccionPrompt)">
                  <svg lucideCopy [size]="12"></svg>
                  Copiar Prompt de Redacción
                </button>
              </div>
            }

            <!-- CONTENIDO DE PESTAÑA: COMERCIAL -->
            @if (activeTab() === 'comercial') {
              <div class="tab-content animate-fade-in" style="display: flex; flex-direction: column; gap: 0.85rem;">
                <p class="widget-text" style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                  Genera campañas comerciales y de WhatsApp para Google Omni en Flow:
                </p>
                <div class="prompt-selector-wrapper">
                  <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Tipo de Prompt Comercial:</label>
                  <select class="form-input" style="font-size: 0.78rem; padding: 0.4rem; height: auto;" (change)="onComercialStyleChange($event)">
                    <option value="whatsapp">Mensaje persuasivo para WhatsApp</option>
                    <option value="lanzamiento">Campaña de Lanzamiento Digital</option>
                    <option value="seo">Ficha Técnica y Palabras Clave SEO</option>
                    <option value="instagram">Publicación para Instagram/FB</option>
                  </select>
                </div>
                <div class="prompt-box" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem; font-size: 0.72rem; font-family: monospace; color: var(--text-primary); word-break: break-word; max-height: 100px; overflow-y: auto;">
                  {{ activeComercialPrompt() }}
                </div>
                <button type="button" class="btn btn-glass" style="font-size: 0.75rem; padding: 0.45rem 1rem; width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.35rem;" (click)="copyToClipboard(activeComercialPrompt())">
                  <svg lucideCopy [size]="12"></svg>
                  Copiar Prompt Comercial
                </button>
              </div>
            }

            @if (promptCopied()) {
              <div class="copy-alert animate-fade-in" style="font-size: 0.72rem; color: var(--success-color); font-weight: 700; text-align: center; margin-top: 0.5rem;">
                ¡Copiado al portapapeles con éxito!
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Header */
    .dashboard-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-user-info h2 {
      font-size: 1.5rem;
    }
    .header-user-info p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    /* Layout */
    .dashboard-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
      align-items: start;
    }
    .dashboard-main {
      min-width: 0;
      width: 100%;
    }

    /* Formulario */
    .form-container {
      padding: 2rem;
    }
    .form-container h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.5rem;
    }
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .input-invalid {
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15) !important;
    }
    .error-text {
      display: block;
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.25rem;
      font-weight: 500;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    
    /* Drag & Drop */
    .drag-drop-area {
      border: 2px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      background: var(--bg-tertiary);
      transition: all var(--transition-fast);
    }
    .drag-drop-area:hover {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }
    .upload-icon {
      width: 32px;
      height: 32px;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .upload-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .upload-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .upload-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--primary-color);
      margin-top: 0.5rem;
    }
    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(99, 57, 27, 0.2);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.6s infinite linear;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .preview-item {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }
    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .btn-remove-img {
      position: absolute;
      top: 2px;
      right: 2px;
      background: rgba(239, 68, 68, 0.85);
      color: white;
      border: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
    }
    .btn-remove-img:hover {
      background: rgb(239, 68, 68);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      border-top: 1px solid var(--border-light);
      padding-top: 1.25rem;
      margin-top: 0.5rem;
    }

    /* Tabla */
    .table-container {
      padding: 1.5rem;
    }
    .table-header {
      margin-bottom: 1.25rem;
    }
    .table-loader, .table-empty {
      padding: 3rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary);
    }
    .table-empty svg {
      width: 40px;
      height: 40px;
      color: var(--text-muted);
    }
    .table-scroll {
      width: 100%;
      overflow-x: auto;
    }
    .products-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .products-table th, .products-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border-light);
      font-size: 0.9rem;
    }
    .products-table th {
      font-family: var(--font-heading);
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
    }
    .table-thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }
    .table-name-cell {
      color: var(--text-primary);
    }
    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .status-pill.publicado {
      background: var(--success-light);
      color: var(--success-color);
    }
    .status-pill.borrador {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }
    .status-pill.pausado {
      background: #fef3c7;
      color: #d97706;
    }
    .status-pill.vendido {
      background: #eff6ff;
      color: #2563eb;
    }
    
    .table-actions {
      display: flex;
      gap: 0.5rem;
    }
    .table-actions button {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .table-actions button:hover {
      background: var(--bg-tertiary);
    }
    .btn-action-edit:hover {
      color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
    .btn-action-delete:hover {
      color: #ef4444 !important;
      border-color: #ef4444 !important;
    }

    /* Sidebar Widgets */
    .dashboard-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .sidebar-widget {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .success-border {
      border-left: 4px solid var(--success-color);
    }
    .primary-border {
      border-left: 4px solid var(--primary-color);
    }
    .widget-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .widget-icon {
      font-size: 1.25rem;
    }
    .widget-header h4 {
      font-size: 1rem;
      font-weight: 600;
    }
    .widget-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .widget-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .ai-links {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.4rem;
      margin-top: 0.25rem;
    }
    .ai-link-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.4rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .ai-link-btn:hover {
      background: var(--primary-light);
      color: var(--primary-dark);
      border-color: var(--primary-color);
    }
    .ai-icon {
      font-size: 0.9rem;
    }
    .widget-divider {
      border: 0;
      border-top: 1px solid var(--border-light);
      margin: 0.5rem 0;
    }
    .prompt-selector-wrapper {
      margin-bottom: 0.5rem;
    }
    .prompt-box {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      font-size: 0.75rem;
      color: var(--text-primary);
      user-select: all;
    }
    .btn-copy-prompt {
      font-size: 0.8rem;
      padding: 0.45rem 1rem;
    }
    .copy-alert {
      font-size: 0.75rem;
      color: var(--success-color);
      font-weight: 500;
      text-align: center;
    }

    .warning-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1.25rem 2rem;
      background: rgba(217, 119, 6, 0.05);
      border: 1px solid rgba(217, 119, 6, 0.15);
      border-left: 4px solid #d97706;
      border-radius: var(--radius-md);
      margin-bottom: 0.5rem;
    }
    .warning-icon {
      width: 28px;
      height: 28px;
      color: #d97706;
      flex-shrink: 0;
    }
    .warning-content {
      flex: 1;
    }
    .warning-content h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #d97706;
      margin-bottom: 0.25rem;
    }
    .warning-content p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      text-decoration: none;
    }

    @media (max-width: 992px) {
      .dashboard-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 768px) {
      .warning-banner {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.25rem;
      }
      .warning-banner .btn-sm {
        width: 100%;
        text-align: center;
      }
      .form-row {
        flex-direction: column;
        gap: 1rem;
      }
      .form-container {
        padding: 1.25rem;
      }
      .form-actions {
        flex-direction: column-reverse;
        gap: 0.75rem;
        width: 100%;
      }
      .form-actions .btn {
        width: 100%;
        text-align: center;
        justify-content: center;
      }
      .table-container {
        padding: 0.75rem;
      }
      .products-table th, .products-table td {
        padding: 0.6rem 0.5rem;
        font-size: 0.8rem;
      }
    }

    /* Paginación Profesional */
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
      border-top: 1px solid var(--border-light);
      position: relative;
      z-index: 10;
    }
    .pagination-info {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .btn-pagination {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.45rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-pagination:hover:not(:disabled) {
      background: var(--primary-light);
      color: var(--primary-dark);
      border-color: var(--primary-color);
    }
    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-pagination-num {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .btn-pagination-num:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .btn-pagination-num.active {
      background: var(--primary-color);
      color: #ffffff;
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(192, 142, 77, 0.25);
    }
    [data-theme="dark"] .btn-pagination-num.active {
      color: #1c120c;
    }
    @media (max-width: 576px) {
      .pagination-container {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    /* Warning Banner Dark Mode */
    [data-theme="dark"] .warning-banner {
      background: rgba(217, 119, 6, 0.1);
      border-color: rgba(217, 119, 6, 0.2);
      border-left-color: #f59e0b;
    }
    [data-theme="dark"] .warning-content h4 {
      color: #f59e0b;
    }
    [data-theme="dark"] .warning-icon {
      color: #f59e0b;
    }

    /* Estilos del Sub-menú de Pestañas del Asistente IA */
    .tab-btn:hover {
      color: var(--primary-color) !important;
      background: rgba(255, 255, 255, 0.05);
    }
    .tab-btn.active {
      background: var(--bg-secondary) !important;
      color: var(--primary-color) !important;
      box-shadow: var(--shadow-sm);
    }
    [data-theme="dark"] .tab-btn.active {
      background: var(--bg-primary) !important;
      color: var(--primary-color) !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private imageService = inject(ImageService);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  readonly user = this.authService.currentUser;
  
  readonly myProducts = signal<Producto[]>([]);
  readonly loadingProducts = signal<boolean>(true);
  readonly categories = signal<Categoria[]>([]);

  // Paginación
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);
  readonly totalCount = signal<number>(0);

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize());
  }

  get minRange(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  get maxRange(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  }

  getPagesArray(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    if (current <= 3) {
      end = 5;
    } else if (current >= total - 2) {
      start = total - 4;
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
      this.cargarMisProductos();
    }
  }
  readonly isFormOpen = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly uploadingImage = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  // Asistente IA (Pestañas y Prompts)
  readonly activeTab = signal<'fotos' | 'redaccion' | 'comercial'>('fotos');
  readonly promptCopied = signal<boolean>(false);
  
  readonly activeImagePrompt = signal<string>('Tomando como base la imagen adjunta de mi producto, genera una fotografía de estudio publicitaria de alta calidad. Coloca el producto en primer plano sobre un fondo minimalista y limpio de color neutro crema suave con iluminación difusa de estudio y sombras sutiles en la base.');
  
  readonly activeRedaccionPrompt = 'Analiza la imagen adjunta de mi producto. Escribe una descripción comercial, profesional y optimizada para SEO en un único párrafo de máximo 4 líneas. Detalla de forma realista los materiales, acabados y texturas que observas, mencionando que fue hecho a mano por estudiantes del taller técnico del colegio [Tu Colegio]. Mantén un tono sumamente atractivo.';

  readonly activeComercialPrompt = signal<string>('Analiza la imagen de mi producto y redacta un mensaje corto y persuasivo ideal para compartir por WhatsApp. Debe incluir emojis llamativos, resaltar que es un producto hecho a mano por estudiantes del taller de [Tu Colegio], indicar el precio [Precio], y terminar con un llamado a la acción claro para que el cliente lo compre.');

  readonly uploadedImages = signal<string[]>([]);
  readonly showImageError = signal<boolean>(false);
  
  productForm!: FormGroup;
  editingProductId: string | null = null;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async ngOnInit() {
    // Esperar si la sesión se está cargando (evita que se intente cargar los productos sin el perfil listo)
    if (this.authService.loading()) {
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          if (!this.authService.loading()) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }

    this.cargarCategorias();
    this.cargarMisProductos();
  }

  private initForm() {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0)]],
      categoria_id: ['', [Validators.required]],
      estado: ['publicado', [Validators.required]]
    });
  }

  async cargarCategorias() {
    try {
      const cats = await this.supabaseService.getCategorias();
      this.categories.set(cats);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  }

  async cargarMisProductos() {
    this.loadingProducts.set(true);
    const currentUserProfile = this.user();
    if (!currentUserProfile) return;

    try {
      let from = (this.currentPage() - 1) * this.pageSize();
      let to = from + this.pageSize() - 1;

      let query = this.supabaseService.client
        .from('productos')
        .select(`
          *,
          categorias (nombre),
          instituciones (nombre)
        `, { count: 'exact' })
        .filter(
          currentUserProfile.rol === 'alumno' ? 'creado_por' : 'institucion_id', 
          'eq', 
          currentUserProfile.rol === 'alumno' ? currentUserProfile.id : currentUserProfile.institucion_id
        )
        .order('created_at', { ascending: false });

      let { data, count, error } = await query.range(from, to);
      if (error) throw error;

      const total = count || 0;
      // Lógica de recuperación si la página actual quedó vacía después de una eliminación
      if (this.currentPage() > 1 && (!data || data.length === 0) && total > 0) {
        const newPage = Math.ceil(total / this.pageSize());
        this.currentPage.set(newPage);
        from = (newPage - 1) * this.pageSize();
        to = from + this.pageSize() - 1;
        
        const retryQuery = this.supabaseService.client
          .from('productos')
          .select(`
            *,
            categorias (nombre),
            instituciones (nombre)
          `, { count: 'exact' })
          .filter(
            currentUserProfile.rol === 'alumno' ? 'creado_por' : 'institucion_id', 
            'eq', 
            currentUserProfile.rol === 'alumno' ? currentUserProfile.id : currentUserProfile.institucion_id
          )
          .order('created_at', { ascending: false })
          .range(from, to);

        const retryRes = await retryQuery;
        if (retryRes.error) throw retryRes.error;
        data = retryRes.data;
      }

      this.myProducts.set((data as unknown as Producto[]) || []);
      this.totalCount.set(total);
    } catch (err) {
      console.error('Error al cargar mis productos:', err);
    } finally {
      this.loadingProducts.set(false);
      this.cdr.markForCheck();
    }
  }

  openCreateForm() {
    this.isEditing.set(false);
    this.editingProductId = null;
    this.uploadedImages.set([]);
    this.showImageError.set(false);
    this.initForm();
    this.isFormOpen.set(true);
  }

  openEditForm(producto: Producto) {
    this.isEditing.set(true);
    this.editingProductId = producto.id || null;
    this.uploadedImages.set(producto.imagenes);
    this.showImageError.set(false);
    
    this.productForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria_id: producto.categoria_id,
      estado: producto.estado
    });

    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.isEditing.set(false);
    this.editingProductId = null;
    this.uploadedImages.set([]);
    this.showImageError.set(false);
  }

  // --- SUBIDA DE IMÁGENES Y VIDEOS ---
  async processFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    
    this.uploadingImage.set(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tamaño máximo si es video (límite 15MB)
        if (file.type.startsWith('video/')) {
          const maxVideoSize = 15 * 1024 * 1024; // 15MB
          if (file.size > maxVideoSize) {
            this.alertService.warning(`El video "${file.name}" supera el límite de 15MB.`);
            continue;
          }
        }
        
        // 1. COMPRIMIR EN EL CLIENTE (solo imágenes)
        const compressedFile = await this.imageService.comprimirImagen(file);
        
        // 2. SUBIR A SUPABASE STORAGE
        const publicUrl = await this.supabaseService.subirImagen(compressedFile);
        
        // 3. AGREGAR A LA LISTA
        this.uploadedImages.update(imgs => [...imgs, publicUrl]);
        this.showImageError.set(false);
      }
    } catch (err) {
      console.error('Error al subir archivo:', err);
      this.alertService.error('Ocurrió un error al subir el archivo. Verifica tu conexión.');
    } finally {
      this.uploadingImage.set(false);
      this.cdr.markForCheck();
    }
  }

  isVideo(url: string): boolean {
    return url ? (/\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('/product-images/video-') || url.startsWith('data:video/')) : false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.processFiles(input.files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.processFiles(event.dataTransfer?.files || null);
  }

  removeImage(index: number) {
    this.uploadedImages.update(imgs => {
      const nextImgs = imgs.filter((_, idx) => idx !== index);
      if (nextImgs.length === 0) {
        this.showImageError.set(true);
      }
      return nextImgs;
    });
  }

  // --- GUARDAR PRODUCTO ---
  async saveProduct() {
    if (this.productForm.invalid || this.uploadedImages().length === 0) {
      this.productForm.markAllAsTouched();
      if (this.uploadedImages().length === 0) {
        this.showImageError.set(true);
        this.alertService.warning('Por favor, sube al menos una foto o video para el producto.');
      } else {
        this.alertService.warning('Por favor, completa todos los campos obligatorios del formulario.');
      }
      this.cdr.markForCheck();
      return;
    }

    this.saving.set(true);
    const formVal = this.productForm.value;
    const currentUserProfile = this.user();
    
    if (!currentUserProfile) return;

    // Obtener el tutor encargado:
    // Si es alumno, su docente_tutor_id. Si es docente, su propio id.
    const docenteContactoId = currentUserProfile.rol === 'alumno' 
      ? (currentUserProfile.docente_tutor_id || currentUserProfile.id) // Fallback si no tiene
      : currentUserProfile.id;

    // Payload parcial para actualización (excluye creado_por y institucion_id que son inmutables)
    const payload: Partial<Producto> = {
      nombre: formVal.nombre,
      descripcion: formVal.descripcion,
      precio: parseFloat(formVal.precio),
      imagenes: this.uploadedImages(),
      categoria_id: formVal.categoria_id,
      estado: formVal.estado,
      docente_contacto_id: docenteContactoId
    };

    try {
      if (this.isEditing() && this.editingProductId) {
        await this.supabaseService.actualizarProducto(this.editingProductId, payload);
        this.alertService.success('Producto actualizado con éxito.');
      } else {
        const fullPayload: Producto = {
          ...payload,
          institucion_id: currentUserProfile.institucion_id || '',
          creado_por: currentUserProfile.id
        } as Producto;
        await this.supabaseService.crearProducto(fullPayload);
        this.alertService.success('Producto creado y publicado con éxito.');
        this.currentPage.set(1);
      }
      this.closeForm();
      this.cargarMisProductos();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      this.alertService.error('Error al guardar el producto. Comprueba los campos.');
    } finally {
      this.saving.set(false);
      this.cdr.markForCheck();
    }
  }

  async deleteProduct(id: string) {
    const confirmacion = await this.alertService.confirm({
      title: '¿Eliminar producto?',
      message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmacion) return;

    try {
      await this.supabaseService.eliminarProducto(id);
      this.alertService.success('Producto eliminado con éxito.');
      this.cargarMisProductos();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      this.alertService.error('No se pudo eliminar el producto.');
    }
  }

  // Copiar cualquier texto al portapapeles
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.promptCopied.set(true);
      setTimeout(() => this.promptCopied.set(false), 3000);
    });
  }

  // Manejar el cambio de estilo de prompt de imagen (con input de imagen)
  onPromptStyleChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'estudio') {
      this.activeImagePrompt.set('Tomando como base la imagen adjunta de mi producto, genera una fotografía de estudio publicitaria de alta calidad. Coloca el producto en primer plano sobre un fondo minimalista y limpio de color neutro crema suave con iluminación difusa de estudio y sombras sutiles en la base.');
    } else if (value === 'organico') {
      this.activeImagePrompt.set('Tomando como base la imagen adjunta de mi producto, genera una fotografía de estilo bodegón orgánico. Coloca el producto sobre una mesa de madera rústica limpia, con luz natural difusa de una ventana lateral, y un fondo desenfocado (bokeh) de plantas o ambiente natural.');
    } else if (value === 'catalogo') {
      this.activeImagePrompt.set('Tomando como base la imagen adjunta de mi producto, genera una fotografía de catálogo comercial de lujo. Coloca el producto de forma artística sobre una base texturizada moderna de mármol o piedra, con luz lateral nítida que resalte sus texturas y costuras, y sombras elegantes bien definidas.');
    } else if (value === 'flatlay') {
      this.activeImagePrompt.set('Tomando como base la imagen adjunta de mi producto, genera una fotografía en plano cenital (flat lay). Organiza el producto estéticamente sobre un fondo mate de color pastel suave, rodeado de algunos elementos artesanales minimalistas que complementen su origen hecho a mano.');
    }
  }

  // Manejar el cambio de estilo de prompt comercial
  onComercialStyleChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'whatsapp') {
      this.activeComercialPrompt.set('Analiza la imagen de mi producto y redacta un mensaje corto y persuasivo ideal para compartir por WhatsApp. Debe incluir emojis llamativos, resaltar que es un producto hecho a mano por estudiantes del taller de [Tu Colegio], indicar el precio [Precio], y terminar con un llamado a la acción claro para que el cliente lo compre.');
    } else if (value === 'lanzamiento') {
      this.activeComercialPrompt.set('Analiza la imagen de mi producto y diseña una estrategia corta de lanzamiento digital para Google Omni/Flow. Propón un eslogan principal pegajoso, 3 beneficios clave del producto orientados al cliente local, y una idea de publicación promocional llamativa.');
    } else if (value === 'seo') {
      this.activeComercialPrompt.set('Analiza la imagen adjunta de mi producto y genera una ficha técnica profesional y optimizada para buscadores (SEO). Incluye una lista de 4 palabras clave de alto tráfico, los materiales de fabricación deducidos de la imagen y los cuidados recomendados del producto, todo redactado de forma eficiente.');
    } else if (value === 'instagram') {
      this.activeComercialPrompt.set('Analiza la imagen de mi producto y redacta un post creativo para redes sociales. Usa un gancho inicial que capte la atención, destaca la dedicación de los alumnos de [Tu Colegio] al crear esta pieza única a mano, e incluye hashtags estratégicos como #EmprendimientoEscolar #HechoAMano #LaVictoria.');
    }
  }
}
