import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService, Institucion } from '../../../core/services/supabase.service';
import { 
  LucidePlus, 
  LucideSchool, 
  LucideArrowLeft, 
  LucideCheckCircle, 
  LucideAlertCircle, 
  LucideSave, 
  LucidePencil, 
  LucideTrash2, 
  LucideMapPin, 
  LucidePhone, 
  LucideMail 
} from '@lucide/angular';

@Component({
  selector: 'app-instituciones',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucidePlus,
    LucideSchool,
    LucideArrowLeft,
    LucideCheckCircle,
    LucideAlertCircle,
    LucideSave,
    LucidePencil,
    LucideTrash2,
    LucideMapPin,
    LucidePhone,
    LucideMail
  ],
  template: `
    <div class="instituciones-page container">
      <!-- Navegación y Encabezado -->
      <div class="back-navigation">
        <a routerLink="/dashboard" class="btn-back">
          <svg lucideArrowLeft></svg>
          Volver al Panel
        </a>
      </div>

      <header class="instituciones-header glass-panel">
        <div class="header-info">
          <h2>Gestión de Instituciones Educativas</h2>
          <p>Registra, edita y administra los colegios participantes en la Vitrina Digital.</p>
        </div>
        <div class="header-actions">
          @if (!isFormOpen()) {
            <button class="btn btn-primary" (click)="openCreateForm()">
              <svg lucidePlus [size]="16"></svg>
              Añadir Colegio
            </button>
          } @else {
            <button class="btn btn-secondary" (click)="closeForm()">
              Volver al Listado
            </button>
          }
        </div>
      </header>

      <!-- Alertas de Error y Éxito -->
      @if (errorMessage()) {
        <div class="error-alert animate-fade-in">
          <svg lucideAlertCircle></svg>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      @if (successMessage()) {
        <div class="success-alert animate-fade-in">
          <svg lucideCheckCircle></svg>
          <span>{{ successMessage() }}</span>
        </div>
      }

      <div class="instituciones-layout">
        <!-- SECCIÓN FORMULARIO (Si está abierto) -->
        @if (isFormOpen()) {
          <main class="instituciones-main form-mode animate-fade-in">
            <div class="form-container glass-panel">
              <h3>{{ isEditing() ? 'Editar' : 'Añadir' }} Colegio</h3>
              
              <form [formGroup]="schoolForm" (ngSubmit)="saveSchool()" class="school-form">
                <div class="form-group">
                  <label class="form-label" for="nombre">Nombre de la Institución Educativa</label>
                  <input 
                    id="nombre" 
                    type="text" 
                    class="form-input" 
                    formControlName="nombre" 
                    placeholder="Ej. I.E. Pedro A. Labarthe"
                    [class.input-invalid]="isFieldInvalid('nombre')"
                  />
                  @if (isFieldInvalid('nombre')) {
                    <span class="error-text">El nombre es obligatorio</span>
                  }
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label" for="distrito">Distrito</label>
                    <input 
                      id="distrito" 
                      type="text" 
                      class="form-input" 
                      formControlName="distrito" 
                      placeholder="Ej. La Victoria"
                      [class.input-invalid]="isFieldInvalid('distrito')"
                    />
                    @if (isFieldInvalid('distrito')) {
                      <span class="error-text">El distrito es obligatorio</span>
                    }
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label" for="ciudad">Provincia / Ciudad</label>
                    <input 
                      id="ciudad" 
                      type="text" 
                      class="form-input" 
                      formControlName="ciudad" 
                      placeholder="Ej. Lima"
                      [class.input-invalid]="isFieldInvalid('ciudad')"
                    />
                    @if (isFieldInvalid('ciudad')) {
                      <span class="error-text">La provincia es obligatoria</span>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="direccion">Dirección Física</label>
                  <input 
                    id="direccion" 
                    type="text" 
                    class="form-input" 
                    formControlName="direccion" 
                    placeholder="Ej. Av. Labarthe 1230"
                    [class.input-invalid]="isFieldInvalid('direccion')"
                  />
                  @if (isFieldInvalid('direccion')) {
                    <span class="error-text">La dirección es obligatoria</span>
                  }
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label" for="telefono">Teléfono de Contacto</label>
                    <input 
                      id="telefono" 
                      type="text" 
                      class="form-input" 
                      formControlName="telefono" 
                      placeholder="Ej. (01) 324-5678"
                      [class.input-invalid]="isFieldInvalid('telefono')"
                    />
                    @if (isFieldInvalid('telefono')) {
                      <span class="error-text">El teléfono es obligatorio</span>
                    }
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label" for="correo_electronico">Correo Electrónico</label>
                    <input 
                      id="correo_electronico" 
                      type="email" 
                      class="form-input" 
                      formControlName="correo_electronico" 
                      placeholder="Ej. contacto@colegio.edu.pe"
                      [class.input-invalid]="isFieldInvalid('correo_electronico')"
                    />
                    @if (isFieldInvalid('correo_electronico')) {
                      <span class="error-text">Introduce un correo electrónico válido</span>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="logo_url">URL del Logo (Opcional)</label>
                  <input 
                    id="logo_url" 
                    type="text" 
                    class="form-input" 
                    formControlName="logo_url" 
                    placeholder="https://images.unsplash.com/photo-... o similar"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="descripcion">Descripción / Enfoque Técnico</label>
                  <textarea 
                    id="descripcion" 
                    rows="4" 
                    class="form-input" 
                    formControlName="descripcion" 
                    placeholder="Describe los talleres técnicos del colegio, especialidades u otros detalles importantes..."
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="closeForm()" [disabled]="saving()">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="schoolForm.invalid || saving()">
                    @if (saving()) {
                      <div class="spinner-sm"></div>
                      Guardando...
                    } @else {
                      <svg lucideSave [size]="16" style="margin-right: 0.35rem; display: inline-block; vertical-align: middle;"></svg>
                      Guardar Colegio
                    }
                  </button>
                </div>
              </form>
            </div>
          </main>
        } @else {
          <!-- SECCIÓN LISTADO (Tabla/Tarjetas) -->
          <main class="instituciones-main list-mode">
            <div class="table-container glass-panel">
              @if (loading()) {
                <div class="loader-container">
                  <div class="spinner"></div>
                  <p>Cargando colegios...</p>
                </div>
              } @else if (schools().length === 0) {
                <div class="empty-state">
                  <svg lucideSchool class="empty-icon"></svg>
                  <h3>No hay colegios registrados</h3>
                  <p>Presiona "Añadir Colegio" para registrar la primera institución educativa.</p>
                </div>
              } @else {
                <div class="table-scroll">
                  <table class="schools-table">
                    <thead>
                      <tr>
                        <th>Logo</th>
                        <th>Nombre</th>
                        <th>Ubicación</th>
                        <th>Contacto</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (school of schools(); track school.id) {
                        <tr>
                          <td>
                            <div class="logo-thumbnail">
                              @if (school.logo_url) {
                                <img [src]="school.logo_url" alt="Logo Colegio" />
                              } @else {
                                <svg lucideSchool class="logo-placeholder-icon"></svg>
                              }
                            </div>
                          </td>
                          <td class="school-name-cell">
                            <strong>{{ school.nombre }}</strong>
                            <p class="school-desc-tooltip">{{ school.descripcion || 'Sin descripción adicional.' }}</p>
                          </td>
                          <td>
                            <div class="info-with-icon">
                              <svg lucideMapPin [size]="14"></svg>
                              <span>{{ school.distrito }}, {{ school.ciudad || 'Lima' }}</span>
                            </div>
                            <span class="detail-text">{{ school.direccion }}</span>
                          </td>
                          <td>
                            <div class="info-with-icon">
                              <svg lucidePhone [size]="14"></svg>
                              <span>{{ school.telefono }}</span>
                            </div>
                            <div class="info-with-icon">
                              <svg lucideMail [size]="14"></svg>
                              <span class="detail-text">{{ school.correo_electronico }}</span>
                            </div>
                          </td>
                          <td>
                            <div class="table-actions">
                              <button class="btn-action-edit" (click)="openEditForm(school)" title="Editar">
                                <svg lucidePencil [size]="16"></svg>
                              </button>
                              <button class="btn-action-delete" (click)="deleteSchool(school.id)" title="Eliminar">
                                <svg lucideTrash2 [size]="16"></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </main>
        }
      </div>
    </div>
  `,
  styles: [`
    .instituciones-page {
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

    .instituciones-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-info h2 {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .header-info p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    /* Alertas */
    .error-alert, .success-alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
    }
    .error-alert {
      background: #fdf2f2;
      border: 1px solid #fecdcd;
      color: #ef4444;
    }
    .success-alert {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
    }
    .error-alert svg, .success-alert svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    /* Layout */
    .instituciones-layout {
      width: 100%;
    }

    /* Formulario */
    .form-container {
      padding: 2rem;
      max-width: 700px;
      margin: 0 auto;
    }
    .form-container h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.5rem;
    }
    .school-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }

    .input-invalid {
      border-color: #ef4444 !important;
    }
    .error-text {
      display: block;
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.25rem;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      border-top: 1px solid var(--border-light);
      padding-top: 1.25rem;
      margin-top: 0.5rem;
    }
    
    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s infinite linear;
      display: inline-block;
      vertical-align: middle;
      margin-right: 0.35rem;
    }

    /* Listado y Tabla */
    .table-container {
      padding: 1.5rem;
    }
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem 1rem;
      color: var(--text-secondary);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s infinite linear;
    }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .empty-icon {
      width: 48px;
      height: 48px;
      color: var(--text-muted);
    }
    .empty-state h3 {
      font-size: 1.35rem;
      color: var(--text-primary);
    }
    .empty-state p {
      color: var(--text-secondary);
      max-width: 400px;
    }

    .table-scroll {
      width: 100%;
      overflow-x: auto;
    }
    .schools-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .schools-table th, .schools-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-light);
      font-size: 0.9rem;
      vertical-align: middle;
    }
    .schools-table th {
      font-family: var(--font-heading);
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
    }

    .logo-thumbnail {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      overflow: hidden;
    }
    .logo-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .logo-placeholder-icon {
      width: 24px;
      height: 24px;
      color: var(--text-muted);
    }

    .school-name-cell strong {
      color: var(--text-primary);
      font-size: 0.95rem;
      display: block;
      margin-bottom: 0.25rem;
    }
    .school-desc-tooltip {
      font-size: 0.75rem;
      color: var(--text-muted);
      max-width: 250px;
      line-height: 1.3;
      margin: 0;
    }

    .info-with-icon {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: 0.15rem;
    }
    .info-with-icon svg {
      color: var(--primary-color);
      opacity: 0.8;
      flex-shrink: 0;
    }
    .detail-text {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-left: 1.15rem;
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

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .instituciones-header {
        flex-direction: column;
        align-items: stretch;
      }
      .form-row {
        flex-direction: column;
        gap: 1.25rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstitucionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  readonly schools = signal<Institucion[]>([]);
  readonly loading = signal<boolean>(true);
  readonly isFormOpen = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  schoolForm!: FormGroup;
  editingSchoolId: string | null = null;

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    // Esperar si la sesión se está cargando (evita falsos redireccionamientos en recargas)
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

    // Protección RLS del lado del cliente
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.rol !== 'admin') {
      console.warn('Acceso denegado: Se requiere rol de administrador.');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.cargarColegios();
  }

  private initForm() {
    this.schoolForm = this.fb.group({
      nombre: ['', [Validators.required]],
      distrito: ['', [Validators.required]],
      ciudad: ['Lima', [Validators.required]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      correo_electronico: ['', [Validators.required, Validators.email]],
      descripcion: [''],
      logo_url: ['']
    });
  }

  async cargarColegios() {
    this.loading.set(true);
    this.cdr.markForCheck();
    try {
      const data = await this.supabaseService.getInstituciones();
      this.schools.set(data);
    } catch (err: any) {
      console.error('Error al cargar instituciones:', err);
      this.errorMessage.set('No se pudieron cargar las instituciones educativas.');
    } finally {
      this.loading.set(false);
      this.cdr.markForCheck();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.schoolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  openCreateForm() {
    this.isEditing.set(false);
    this.editingSchoolId = null;
    this.initForm();
    this.isFormOpen.set(true);
  }

  openEditForm(school: Institucion) {
    this.isEditing.set(true);
    this.editingSchoolId = school.id;
    
    // Rellenar formulario con datos del colegio seleccionado
    this.schoolForm.patchValue({
      nombre: school.nombre,
      distrito: school.distrito,
      ciudad: school.ciudad || 'Lima',
      direccion: school.direccion || '',
      telefono: school.telefono || '',
      correo_electronico: school.correo_electronico || '',
      descripcion: school.descripcion || '',
      logo_url: school.logo_url || ''
    });

    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.isEditing.set(false);
    this.editingSchoolId = null;
    this.errorMessage.set(null);
  }

  async saveSchool() {
    if (this.schoolForm.invalid) return;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const val = this.schoolForm.value;
    
    const schoolData: Omit<Institucion, 'id'> = {
      nombre: val.nombre,
      distrito: val.distrito,
      ciudad: val.ciudad,
      direccion: val.direccion,
      telefono: val.telefono,
      correo_electronico: val.correo_electronico,
      descripcion: val.descripcion || null,
      logo_url: val.logo_url || null
    };

    try {
      if (this.isEditing() && this.editingSchoolId) {
        await this.supabaseService.actualizarInstitucion(this.editingSchoolId, schoolData);
        this.successMessage.set('Colegio actualizado con éxito.');
      } else {
        await this.supabaseService.crearInstitucion(schoolData);
        this.successMessage.set('Colegio creado con éxito.');
      }

      this.closeForm();
      await this.cargarColegios();
      
      // Limpiar alertas de éxito tras 4 segundos
      setTimeout(() => this.successMessage.set(null), 4000);
    } catch (err: any) {
      console.error(err);
      this.errorMessage.set(
        err.message?.includes('duplicate key') 
          ? 'Ya existe una institución registrada con ese nombre.' 
          : 'Ocurrió un error al guardar la institución. Inténtalo de nuevo.'
      );
    } finally {
      this.saving.set(false);
      this.cdr.markForCheck();
    }
  }

  async deleteSchool(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este colegio? Esta acción es irreversible y borrará los perfiles y productos asociados.')) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.supabaseService.eliminarInstitucion(id);
      this.successMessage.set('Colegio eliminado exitosamente.');
      await this.cargarColegios();
      setTimeout(() => this.successMessage.set(null), 4000);
    } catch (err: any) {
      console.error(err);
      this.errorMessage.set('No se pudo eliminar el colegio. Comprueba que no tenga registros dependientes.');
    } finally {
      this.cdr.markForCheck();
    }
  }
}
