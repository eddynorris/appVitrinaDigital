import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Perfil } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { 
  LucideUser, 
  LucideSchool, 
  LucideShield, 
  LucideCheckCircle, 
  LucideAlertCircle, 
  LucideArrowLeft,
  LucideSave,
  LucideKey
} from '@lucide/angular';

@Component({
  selector: 'app-perfil',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideUser,
    LucideSchool,
    LucideShield,
    LucideCheckCircle,
    LucideAlertCircle,
    LucideArrowLeft,
    LucideSave,
    LucideKey
  ],
  template: `
    <div class="profile-page container">
      <div class="back-navigation">
        <a routerLink="/dashboard" class="btn-back">
          <svg lucideArrowLeft></svg>
          Volver al Panel
        </a>
      </div>

      <div class="profile-container glass-panel">
        <div class="profile-header">
          <div class="avatar-wrapper">
            <svg lucideUser class="avatar-icon"></svg>
          </div>
          <div class="header-info">
            <h2>Mi Perfil Escolar</h2>
            <div class="role-badge-wrapper">
              <span class="role-badge" [class]="user()?.rol">
                <svg lucideShield class="badge-icon"></svg>
                {{ user()?.rol === 'admin' ? 'Administrador' : (user()?.rol === 'docente' ? 'Docente Tutor' : 'Estudiante') }}
              </span>
            </div>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">
            <svg lucideAlertCircle></svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (successMessage()) {
          <div class="success-alert">
            <svg lucideCheckCircle></svg>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
          <div class="form-section">
            <h4>Datos Personales</h4>
            
            <div class="form-group">
              <label class="form-label" for="nombre_completo">Nombre Completo</label>
              <input 
                id="nombre_completo" 
                type="text" 
                class="form-input" 
                formControlName="nombre_completo"
                placeholder="Ej. María Teresa de la Cruz"
                [class.input-invalid]="isFieldInvalid('nombre_completo')"
              />
              @if (isFieldInvalid('nombre_completo')) {
                <span class="error-text">El nombre completo es obligatorio</span>
              }
            </div>

            <!-- WhatsApp de Contacto (Obligatorio para docentes/admins, opcional/deshabilitado para alumnos si no coordinan ventas directamente) -->
            @if (user()?.rol !== 'alumno') {
              <div class="form-group">
                <label class="form-label" for="whatsapp_contacto">WhatsApp de Contacto (Compras)</label>
                <input 
                  id="whatsapp_contacto" 
                  type="text" 
                  class="form-input" 
                  formControlName="whatsapp_contacto"
                  placeholder="Ej. +51999888777"
                  [class.input-invalid]="isFieldInvalid('whatsapp_contacto')"
                />
                @if (isFieldInvalid('whatsapp_contacto')) {
                  <span class="error-text">El WhatsApp es obligatorio y debe tener un formato válido (Ej. +51999888777)</span>
                }
                <span class="helper-text">Requerido para que los interesados del catálogo puedan contactarte directamente por WhatsApp.</span>
              </div>
            } @else {
              <div class="form-group">
                <label class="form-label" for="whatsapp_contacto">Teléfono/WhatsApp (Opcional)</label>
                <input 
                  id="whatsapp_contacto" 
                  type="text" 
                  class="form-input" 
                  formControlName="whatsapp_contacto"
                  placeholder="Ej. +51999888777"
                  [class.input-invalid]="isFieldInvalid('whatsapp_contacto')"
                />
                @if (isFieldInvalid('whatsapp_contacto')) {
                  <span class="error-text">El WhatsApp debe empezar por +51 seguido de 9 dígitos (Ej. +51999888777)</span>
                }
              </div>
            }
          </div>

          <div class="form-section">
            <h4>Detalles de Procedencia</h4>
            
            <div class="form-row">
              <!-- Colegio / Institución -->
              <div class="form-group flex-1">
                <label class="form-label" for="institucion_id">Colegio / Institución</label>
                @if (!user()?.institucion_id) {
                  <select id="institucion_id" class="form-input" formControlName="institucion_id" [class.input-invalid]="isFieldInvalid('institucion_id')">
                    <option value="">Selecciona tu Colegio</option>
                    @for (school of schools(); track school.id) {
                      <option [value]="school.id">{{ school.nombre }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('institucion_id')) {
                    <span class="error-text">La institución es obligatoria</span>
                  }
                } @else {
                  <div class="readonly-box">
                    <svg lucideSchool class="box-icon"></svg>
                    <span>{{ user()?.instituciones?.nombre || 'General' }}</span>
                  </div>
                }
              </div>

              <!-- Rol de Usuario -->
              <div class="form-group flex-1">
                <label class="form-label" for="rol">Rol de Usuario</label>
                @if (!user()?.institucion_id) {
                  <select id="rol" class="form-input" formControlName="rol">
                    <option value="alumno">Estudiante</option>
                    <option value="docente">Docente Tutor</option>
                  </select>
                } @else {
                  <div class="readonly-box">
                    <svg lucideShield class="box-icon"></svg>
                    <span>{{ user()?.rol === 'admin' ? 'Administrador' : (user()?.rol === 'docente' ? 'Docente' : 'Alumno') }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Tutor Asignado (Solo para estudiantes) -->
            @if (user()?.rol === 'alumno' || (!user()?.institucion_id && profileForm.get('rol')?.value === 'alumno')) {
              <div class="form-group select-tutor-group animate-fade-in">
                <label class="form-label" for="docente_tutor_id">Docente Tutor Encargado</label>
                <select id="docente_tutor_id" class="form-input" formControlName="docente_tutor_id" [class.input-invalid]="isFieldInvalid('docente_tutor_id')">
                  <option value="">Ninguno asignado</option>
                  @for (tutor of tutors(); track tutor.id) {
                    <option [value]="tutor.id">{{ tutor.nombre_completo }}</option>
                  }
                </select>
                @if (isFieldInvalid('docente_tutor_id')) {
                  <span class="error-text">Debes seleccionar un docente tutor si eres estudiante</span>
                }
                <span class="helper-text">Las consultas de tus productos serán gestionadas por este docente.</span>
              </div>
            }
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-save" 
              [disabled]="profileForm.invalid || saving()"
            >
              @if (saving()) {
                <div class="spinner-sm"></div>
                Guardando Cambios...
              } @else {
                <svg lucideSave [size]="16" style="margin-right: 0.35rem; display: inline-block; vertical-align: middle;"></svg>
                Guardar Perfil
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Formulario de Cambio de Contraseña -->
      <div class="profile-container glass-panel" style="margin-top: 2rem;">
        <div class="profile-header">
          <div class="avatar-wrapper">
            <svg lucideKey class="avatar-icon"></svg>
          </div>
          <div class="header-info">
            <h2>Cambiar Contraseña</h2>
            <p class="helper-text">Mantén tu cuenta segura actualizando tu clave periódicamente.</p>
          </div>
        </div>

        @if (passwordErrorMessage()) {
          <div class="error-alert">
            <svg lucideAlertCircle></svg>
            <span>{{ passwordErrorMessage() }}</span>
          </div>
        }

        @if (passwordSuccessMessage()) {
          <div class="success-alert">
            <svg lucideCheckCircle></svg>
            <span>{{ passwordSuccessMessage() }}</span>
          </div>
        }

        <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()" class="profile-form">
          <div class="form-section">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label" for="nueva_contrasena">Nueva Contraseña</label>
                <input 
                  id="nueva_contrasena" 
                  type="password" 
                  class="form-input" 
                  formControlName="nueva_contrasena"
                  placeholder="Mínimo 6 caracteres"
                  [class.input-invalid]="isPasswordInvalid('nueva_contrasena')"
                />
                @if (isPasswordInvalid('nueva_contrasena')) {
                  <span class="error-text">La contraseña debe tener al menos 6 caracteres</span>
                }
              </div>

              <div class="form-group flex-1">
                <label class="form-label" for="confirmar_contrasena">Confirmar Nueva Contraseña</label>
                <input 
                  id="confirmar_contrasena" 
                  type="password" 
                  class="form-input" 
                  formControlName="confirmar_contrasena"
                  placeholder="Repite la contraseña"
                  [class.input-invalid]="passwordForm.errors?.['mismatch'] && (passwordForm.get('confirmar_contrasena')?.dirty || passwordForm.get('confirmar_contrasena')?.touched)"
                />
                @if (passwordForm.errors?.['mismatch'] && (passwordForm.get('confirmar_contrasena')?.dirty || passwordForm.get('confirmar_contrasena')?.touched)) {
                  <span class="error-text">Las contraseñas no coinciden</span>
                }
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-save" 
              [disabled]="passwordForm.invalid || updatingPassword()"
            >
              @if (updatingPassword()) {
                <div class="spinner-sm"></div>
                Actualizando...
              } @else {
                <svg lucideSave [size]="16" style="margin-right: 0.35rem; display: inline-block; vertical-align: middle;"></svg>
                Actualizar Contraseña
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 600px;
      margin: 0 auto;
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

    .profile-container {
      padding: 2.5rem;
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 1.5rem;
    }
    .avatar-wrapper {
      width: 64px;
      height: 64px;
      background: var(--primary-light);
      color: var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--primary-color);
    }
    .avatar-icon {
      width: 32px;
      height: 32px;
    }
    .header-info h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      letter-spacing: 0.5px;
    }
    .role-badge.admin {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .role-badge.docente {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .role-badge.alumno {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .badge-icon {
      width: 12px;
      height: 12px;
    }

    .error-alert, .success-alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
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

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-section h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.35rem;
      margin-bottom: 0.25rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }
    
    .readonly-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.9rem;
      pointer-events: none;
      user-select: none;
    }
    .box-icon {
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }
    
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
    .helper-text {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      line-height: 1.35;
    }

    .form-actions {
      border-top: 1px solid var(--border-light);
      padding-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }
    .btn-save {
      min-width: 150px;
      padding: 0.85rem 1.5rem;
      font-weight: 600;
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

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 1.25rem;
      }
      .profile-container {
        padding: 1.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly saving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly tutors = signal<Perfil[]>([]);
  readonly schools = signal<any[]>([]);

  // Password change states
  readonly updatingPassword = signal<boolean>(false);
  readonly passwordErrorMessage = signal<string | null>(null);
  readonly passwordSuccessMessage = signal<string | null>(null);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

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

    const currentUser = this.user();
    if (!currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    // Cargar colegios
    try {
      const res = await this.supabaseService.getInstituciones();
      this.schools.set(res);
    } catch (err) {
      console.error('Error al cargar colegios:', err);
    }

    // Rellenar valores
    this.profileForm.patchValue({
      nombre_completo: currentUser.nombre_completo,
      whatsapp_contacto: currentUser.whatsapp_contacto || '',
      institucion_id: currentUser.institucion_id || '',
      rol: currentUser.rol || 'alumno'
    });

    // Configurar validadores de WhatsApp y Tutor dinámicamente según el Rol
    const updateValidatorsByRole = (rol: string) => {
      const whatsappControl = this.profileForm.get('whatsapp_contacto');
      if (rol !== 'alumno') {
        whatsappControl?.setValidators([Validators.required, Validators.pattern(/^\+51\d{9}$/)]);
      } else {
        // Opcional para alumnos, pero si lo rellenan debe cumplir el formato
        whatsappControl?.setValidators([Validators.pattern(/^\+51\d{9}$/)]);
      }
      whatsappControl?.updateValueAndValidity();
      this.updateTutorsValidator();
    };

    // Si no tiene institución (registro nuevo vía OAuth), configurar validación y listeners
    if (!currentUser.institucion_id) {
      this.profileForm.get('institucion_id')?.setValidators([Validators.required]);
      this.profileForm.get('institucion_id')?.updateValueAndValidity();
      
      // Escuchar cambios de colegio para cargar tutores
      this.profileForm.get('institucion_id')?.valueChanges.subscribe(schoolId => {
        const currentRol = this.profileForm.get('rol')?.value || currentUser.rol;
        if (currentRol === 'alumno') {
          this.loadTutors(schoolId);
        }
      });
    }

    // Escuchar cambios de rol para re-validar
    this.profileForm.get('rol')?.valueChanges.subscribe(rol => {
      updateValidatorsByRole(rol);
      
      const schoolId = this.profileForm.get('institucion_id')?.value || currentUser.institucion_id;
      if (rol === 'alumno' && schoolId) {
        this.loadTutors(schoolId);
      } else if (rol !== 'alumno') {
        this.tutors.set([]);
        this.profileForm.get('docente_tutor_id')?.setValue('');
        this.updateTutorsValidator();
      }
    });

    // Cargar tutores si es alumno
    if (currentUser.rol === 'alumno' && currentUser.institucion_id) {
      try {
        const teachers = await this.authService.getDocentesPorInstitucion(currentUser.institucion_id);
        this.tutors.set(teachers);
        
        if (currentUser.docente_tutor_id) {
          this.profileForm.patchValue({
            docente_tutor_id: currentUser.docente_tutor_id
          });
        }
      } catch (err) {
        console.error('Error al cargar docentes tutores:', err);
      }
    }

    // Inicializar validadores por rol
    updateValidatorsByRole(currentUser.rol || 'alumno');
  }

  async loadTutors(schoolId: string) {
    if (!schoolId) {
      this.tutors.set([]);
      this.updateTutorsValidator();
      return;
    }

    try {
      const res = await this.authService.getDocentesPorInstitucion(schoolId);
      this.tutors.set(res);
      this.updateTutorsValidator();
    } catch (err) {
      console.error('Error al cargar docentes del colegio:', err);
    }
  }

  private updateTutorsValidator() {
    const tutorControl = this.profileForm.get('docente_tutor_id');
    const currentRol = this.profileForm.get('rol')?.value || this.user()?.rol;
    if (currentRol === 'alumno' && this.tutors().length > 0) {
      tutorControl?.setValidators([Validators.required]);
    } else {
      tutorControl?.clearValidators();
    }
    tutorControl?.updateValueAndValidity();
  }

  private initForm() {
    this.profileForm = this.fb.group({
      nombre_completo: ['', [Validators.required]],
      whatsapp_contacto: [''],
      docente_tutor_id: [''],
      institucion_id: [''],
      rol: ['alumno']
    });

    this.passwordForm = this.fb.group({
      nueva_contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_contrasena: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('nueva_contrasena')?.value;
    const confirmPass = g.get('confirmar_contrasena')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPasswordInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit() {
    if (this.profileForm.invalid) return;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const val = this.profileForm.value;
    const currentUser = this.user();

    if (!currentUser) {
      this.saving.set(false);
      return;
    }

    // 0. Validar si el WhatsApp ya está registrado con otra cuenta
    if (val.whatsapp_contacto && val.whatsapp_contacto.trim() !== '' && val.whatsapp_contacto.trim() !== '+51') {
      const { data: whatsappExistente, error: phoneError } = await this.supabaseService.client
        .from('perfiles')
        .select('id')
        .eq('whatsapp_contacto', val.whatsapp_contacto.trim())
        .neq('id', currentUser.id)
        .maybeSingle();

      if (phoneError) {
        console.warn('Error al verificar whatsapp existente:', phoneError);
      }

      if (whatsappExistente) {
        this.errorMessage.set('El número de WhatsApp ya está registrado con otra cuenta.');
        this.saving.set(false);
        return;
      }
    }

    const updates: Partial<Perfil> = {
      nombre_completo: val.nombre_completo,
      whatsapp_contacto: val.whatsapp_contacto || null
    };

    // Si no tiene institución, guardar los nuevos datos de colegio y rol
    if (!currentUser.institucion_id) {
      updates.institucion_id = val.institucion_id;
      updates.rol = val.rol;
    }

    const actualRol = (!currentUser.institucion_id) ? val.rol : currentUser.rol;
    if (actualRol === 'alumno') {
      updates.docente_tutor_id = val.docente_tutor_id || null;
    }

    try {
      await this.authService.actualizarPerfil(updates);
      this.successMessage.set('¡Perfil actualizado con éxito!');
      // Desvanecer mensaje después de 4 segundos
      setTimeout(() => this.successMessage.set(null), 4000);
    } catch (err: any) {
      console.error(err);
      this.errorMessage.set(
        err.message || 'No se pudo guardar el perfil. Inténtalo de nuevo.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  async onPasswordSubmit() {
    if (this.passwordForm.invalid) return;

    this.updatingPassword.set(true);
    this.passwordErrorMessage.set(null);
    this.passwordSuccessMessage.set(null);

    const { nueva_contrasena } = this.passwordForm.value;

    try {
      await this.authService.cambiarContrasena(nueva_contrasena);
      this.passwordSuccessMessage.set('¡Contraseña actualizada con éxito!');
      this.passwordForm.reset();
      setTimeout(() => this.passwordSuccessMessage.set(null), 4000);
    } catch (err: any) {
      console.error(err);
      this.passwordErrorMessage.set(
        err.message || 'No se pudo actualizar la contraseña. Inténtalo de nuevo.'
      );
    } finally {
      this.updatingPassword.set(false);
    }
  }
}
