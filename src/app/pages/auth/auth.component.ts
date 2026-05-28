import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { 
  LucideGraduationCap, 
  LucideAlertCircle,
  LucideArrowLeft,
  LucideMail,
  LucideLock
} from '@lucide/angular';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule, 
    RouterLink,
    LucideGraduationCap,
    LucideAlertCircle,
    LucideArrowLeft,
    LucideMail,
    LucideLock
  ],
  template: `
    <div class="auth-page-container">
      <!-- 1. PANEL VISUAL DE INSPIRACIÓN (Izquierda - Oculto en móviles) -->
      <div class="auth-visual-side">
        <div class="visual-overlay"></div>
        <div class="visual-content">
          <a routerLink="/" class="btn-back-home">
            <svg lucideArrowLeft class="back-icon"></svg>
            <span>Volver a Inicio</span>
          </a>
          
          <div class="visual-brand-container">
            <div class="visual-logo">
              <svg lucideGraduationCap class="visual-logo-icon"></svg>
              <span class="visual-logo-text">Vitrina <span class="accent-text">Victoria</span></span>
            </div>
            <h1 class="visual-title">Creaciones que narran una historia de aprendizaje</h1>
            <p class="visual-subtitle">
              Apoya e impulsa el talento de jóvenes estudiantes de La Victoria. Cada producto del catálogo representa el esfuerzo de los talleres de educación técnica.
            </p>
          </div>
          
          <div class="visual-footer">
            <div class="feature-badge">
              <span class="badge-dot"></span>
              <span>100% Retorno Social Directo</span>
            </div>
            <p class="copyright-text">© 2026 Vitrina Victoria. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>

      <!-- 2. PANEL DE AUTENTICACIÓN (Derecha / Centrado en móviles) -->
      <div class="auth-form-side">
        <!-- Esferas de brillo ambientado (Glow Orbs) -->
        <div class="glowing-orb orb-gold"></div>
        <div class="glowing-orb orb-espresso"></div>

        <div class="auth-card-wrapper glass-panel animate-fade-in">
          <div class="auth-header">
            <a routerLink="/" class="mobile-logo-link">
              <svg lucideGraduationCap class="logo-icon"></svg>
              <span class="logo-text">Vitrina <span class="accent-text">Victoria</span></span>
            </a>
            <h2 class="auth-title">Acceso Educativo</h2>
            <p class="auth-subtitle">
              Gestiona tus proyectos o accede a tu panel escolar.
            </p>
          </div>

          <!-- Mensaje de error -->
          @if (errorMessage()) {
            <div class="error-alert-box animate-shake">
              <svg lucideAlertCircle class="error-icon"></svg>
              <div class="error-content">
                <span class="error-title">Error de acceso</span>
                <span class="error-message">{{ errorMessage() }}</span>
              </div>
            </div>
          }

          <!-- Google Login (Único método de creación de cuenta activo) -->
          <div class="auth-action-block">
            <button 
              type="button" 
              class="btn-google-premium" 
              (click)="onGoogleLogin()"
              [disabled]="loading() && !showEmailForm()"
            >
              @if (loading() && !showEmailForm()) {
                <div class="spinner-premium"></div>
                <span>Conectando...</span>
              } @else {
                <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Acceder con Google</span>
              }
            </button>
            <p class="helper-text">
              Regístrate o inicia sesión con tu cuenta de Google. Tu perfil escolar se creará automáticamente en tu primera visita.
            </p>
          </div>

          <!-- Divider para acceso administrador/desarrollador -->
          <div class="alt-login-divider">
            <div class="divider-line"></div>
            <button type="button" class="btn-toggle-alt" (click)="showEmailForm.set(!showEmailForm())">
              {{ showEmailForm() ? 'Ocultar ingreso alternativo' : 'Ingreso alternativo con correo' }}
            </button>
            <div class="divider-line"></div>
          </div>

          <!-- Formulario alternativo de login por correo (Docentes/Admin) -->
          @if (showEmailForm()) {
            <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="email-auth-form animate-slide-down">
              <div class="form-group-premium">
                <label class="form-label-premium" for="email">
                  <svg lucideMail class="input-icon-premium"></svg>
                  <span>Correo Electrónico</span>
                </label>
                <div class="input-wrapper-premium">
                  <input 
                    id="email"
                    type="email" 
                    class="form-input-premium" 
                    formControlName="email"
                    placeholder="ejemplo@colegio.edu.pe"
                    [class.input-invalid]="isFieldInvalid(loginForm, 'email')"
                  />
                </div>
                @if (isFieldInvalid(loginForm, 'email')) {
                  <span class="error-subtext">Introduce un correo electrónico válido</span>
                }
              </div>

              <div class="form-group-premium">
                <label class="form-label-premium" for="password">
                  <svg lucideLock class="input-icon-premium"></svg>
                  <span>Contraseña</span>
                </label>
                <div class="input-wrapper-premium">
                  <input 
                    id="password"
                    type="password" 
                    class="form-input-premium" 
                    formControlName="password"
                    placeholder="••••••••"
                    [class.input-invalid]="isFieldInvalid(loginForm, 'password')"
                  />
                </div>
                @if (isFieldInvalid(loginForm, 'password')) {
                  <span class="error-subtext">La contraseña es obligatoria</span>
                }
              </div>

              <button 
                type="submit" 
                class="btn-submit-premium"
                [disabled]="loginForm.invalid || loading()"
              >
                @if (loading() && showEmailForm()) {
                  <div class="spinner-premium light"></div>
                  <span>Verificando credenciales...</span>
                } @else {
                  <span>Ingresar con Correo</span>
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Layout Base: Pantalla dividida en dos */
    .auth-page-container {
      display: grid;
      grid-template-columns: 1fr;
      min-height: calc(100vh - 72px);
      width: 100%;
      background: var(--bg-primary);
      overflow: hidden;
      transition: background var(--transition-normal);
    }

    @media (min-width: 1024px) {
      .auth-page-container {
        grid-template-columns: 1.1fr 0.9fr;
      }
    }

    /* 1. LADO DE INSPIRACIÓN (IZQUIERDO) */
    .auth-visual-side {
      display: none;
      position: relative;
      background-image: url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=80');
      background-size: cover;
      background-position: center;
      padding: 3.5rem;
      flex-direction: column;
      justify-content: space-between;
      color: #ffffff;
      overflow: hidden;
    }

    @media (min-width: 1024px) {
      .auth-visual-side {
        display: flex;
      }
    }

    .visual-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg, 
        rgba(37, 28, 22, 0.94) 0%, 
        rgba(41, 30, 24, 0.8) 50%, 
        rgba(192, 142, 77, 0.15) 100%
      );
      backdrop-filter: blur(1px);
      z-index: 1;
    }

    .visual-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    .btn-back-home {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      padding: 0.6rem 1.2rem;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      backdrop-filter: blur(8px);
      transition: all var(--transition-fast);
    }

    .btn-back-home:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateX(-4px);
    }

    .back-icon {
      width: 16px;
      height: 16px;
    }

    .visual-brand-container {
      max-width: 520px;
      margin-top: 2rem;
    }

    .visual-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .visual-logo-icon {
      width: 44px;
      height: 44px;
      color: var(--accent-color);
      filter: drop-shadow(0 4px 10px rgba(192, 142, 77, 0.4));
    }

    .visual-logo-text {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.8px;
    }

    .visual-title {
      font-family: var(--font-heading);
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 1.25rem;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #ffffff 0%, #f4ebe4 60%, var(--accent-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .visual-subtitle {
      font-size: 1.1rem;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.85);
    }

    .visual-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 2rem;
      margin-top: 2rem;
    }

    .feature-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(192, 142, 77, 0.15);
      border: 1px solid rgba(192, 142, 77, 0.3);
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent-color);
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--accent-color);
      box-shadow: 0 0 8px var(--accent-color);
      animation: pulse-dot 2s infinite alternate;
    }

    @keyframes pulse-dot {
      0% { opacity: 0.4; }
      100% { opacity: 1; }
    }

    .copyright-text {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.5);
    }


    /* 2. LADO DE FORMULARIO (DERECHO) */
    .auth-form-side {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      overflow: hidden;
      min-height: 100%;
    }

    /* Glow Orbs de fondo */
    .glowing-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.14;
      pointer-events: none;
      z-index: 0;
    }

    .orb-gold {
      width: 320px;
      height: 320px;
      background: var(--accent-color);
      top: 10%;
      right: -5%;
      animation: orb-swim 12s infinite alternate ease-in-out;
    }

    .orb-espresso {
      width: 280px;
      height: 280px;
      background: var(--primary-color);
      bottom: 15%;
      left: -5%;
      animation: orb-swim 10s infinite alternate-reverse ease-in-out;
    }

    @keyframes orb-swim {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(30px, -20px) scale(1.15); }
    }

    /* Card principal de autenticación */
    .auth-card-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: 3rem 2.5rem;
      border-radius: var(--radius-lg);
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: 0 20px 40px -10px rgba(37, 28, 22, 0.08);
      backdrop-filter: var(--glass-blur);
      transition: box-shadow var(--transition-normal), border var(--transition-normal);
    }

    .auth-card-wrapper:hover {
      box-shadow: 0 30px 60px -15px rgba(37, 28, 22, 0.12);
      border-color: rgba(192, 142, 77, 0.2);
    }

    .auth-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2rem;
    }

    .mobile-logo-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      margin-bottom: 1rem;
    }

    @media (min-width: 1024px) {
      .mobile-logo-link {
        display: none; /* Se muestra la versión grande al lado izquierdo */
      }
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      color: var(--primary-color);
    }

    .logo-text {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.4rem;
      color: var(--text-primary);
    }

    .auth-title {
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .auth-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
      max-width: 340px;
    }

    /* Botón Google Premium */
    .auth-action-block {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      width: 100%;
    }

    .btn-google-premium {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.85rem;
      background: #ffffff;
      color: #1f2937;
      border: 1px solid #e2e8f0;
      font-size: 1.05rem;
      font-weight: 700;
      padding: 0.9rem 1.5rem;
      width: 100%;
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;
    }

    .btn-google-premium::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: -100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: 0.5s;
    }

    .btn-google-premium:hover:not(:disabled)::after {
      left: 100%;
    }

    .btn-google-premium:hover:not(:disabled) {
      background: #fdfdfd;
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(192, 142, 77, 0.12);
    }

    .btn-google-premium:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 4px 8px rgba(0,0,0,0.04);
    }

    [data-theme="dark"] .btn-google-premium {
      background: #241810;
      color: #f3ebe4;
      border-color: #3d2b1f;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    [data-theme="dark"] .btn-google-premium:hover:not(:disabled) {
      background: #1c120c;
      border-color: rgba(192, 142, 77, 0.3);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }

    .google-icon {
      flex-shrink: 0;
    }

    .helper-text {
      font-size: 0.78rem;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.5;
      max-width: 320px;
    }

    /* Divisor Alternativo */
    .alt-login-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      width: 100%;
      margin: 1.75rem 0 1.25rem 0;
    }

    .divider-line {
      flex-grow: 1;
      height: 1px;
      background-color: var(--border-color);
      opacity: 0.6;
    }

    .btn-toggle-alt {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0 0.5rem;
      transition: color var(--transition-fast);
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .btn-toggle-alt:hover {
      color: var(--primary-color);
    }

    /* Formulario de Login por Correo */
    .email-auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
    }

    .form-group-premium {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-label-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .input-icon-premium {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
    }

    .input-wrapper-premium {
      position: relative;
    }

    .form-input-premium {
      width: 100%;
      padding: 0.8rem 1rem;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border-color);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 0.92rem;
      outline: none;
      transition: all var(--transition-fast);
    }

    .form-input-premium:focus {
      border-color: var(--primary-color);
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(192, 142, 77, 0.12);
    }

    [data-theme="dark"] .form-input-premium:focus {
      background-color: var(--bg-tertiary);
      box-shadow: 0 0 0 3px rgba(192, 142, 77, 0.08);
    }

    .input-invalid {
      border-color: #ef4444 !important;
    }

    .error-subtext {
      font-size: 0.74rem;
      font-weight: 600;
      color: #ef4444;
      margin-top: 0.15rem;
    }

    /* Botón Submit Formulario Correo */
    .btn-submit-premium {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.85rem;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: #ffffff;
      border: none;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.95rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 28, 22, 0.15);
      transition: all var(--transition-fast);
      margin-top: 0.5rem;
    }

    .btn-submit-premium:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 28, 22, 0.25);
    }

    .btn-submit-premium:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    /* Alerta de error estilizada */
    .error-alert-box {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      border-radius: var(--radius-md);
      color: #b91c1c;
      margin-bottom: 1.5rem;
    }

    [data-theme="dark"] .error-alert-box {
      background: rgba(239, 68, 68, 0.06);
      border-color: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }

    .error-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .error-title {
      font-size: 0.85rem;
      font-weight: 700;
    }

    .error-message {
      font-size: 0.8rem;
      line-height: 1.4;
      opacity: 0.9;
    }

    /* Animaciones */
    .animate-fade-in {
      animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-slide-down {
      animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-shake {
      animation: shake 0.4s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-4px); }
      40%, 80% { transform: translateX(4px); }
    }

    /* Spinners */
    .spinner-premium {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(0, 0, 0, 0.15);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .spinner-premium.light {
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
    }

    [data-theme="dark"] .spinner-premium:not(.light) {
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-top-color: #ffffff;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  showEmailForm = signal<boolean>(false);
  isRegisterMode = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  registeredEmail = signal<string>('');

  schools = signal<any[]>([]);
  tutors = signal<any[]>([]);

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor() {
    this.initForms();
  }

  async ngOnInit() {
    try {
      const res = await this.supabaseService.getInstituciones();
      this.schools.set(res);
    } catch (err) {
      console.error('Error al cargar colegios:', err);
    }
  }

  private initForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      nombre_completo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['alumno', [Validators.required]],
      institucion_id: ['', [Validators.required]],
      whatsapp_contacto: ['+51'],
      docente_tutor_id: ['']
    });

    this.registerForm.get('institucion_id')?.valueChanges.subscribe(schoolId => {
      this.loadTutors(schoolId);
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async loadTutors(schoolId: string) {
    if (!schoolId) {
      this.tutors.set([]);
      return;
    }

    try {
      const res = await this.authService.getDocentesPorInstitucion(schoolId);
      this.tutors.set(res);
    } catch (err) {
      console.error('Error al cargar docentes del colegio:', err);
    }
  }

  async onLoginSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error(err);
      this.errorMessage.set(
        err.message === 'Invalid login credentials' 
          ? 'Correo electrónico o contraseña incorrectos.' 
          : 'Ocurrió un error al iniciar sesión. Comprueba tus datos.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogleLogin() {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.loginConGoogle();
    } catch (err: any) {
      console.error(err);
      this.errorMessage.set(
        err.message || 'Ocurrió un error al iniciar sesión con Google.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
