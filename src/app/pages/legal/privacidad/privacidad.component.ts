import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideShieldCheck, LucideEye } from '@lucide/angular';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink, LucideArrowLeft, LucideShieldCheck, LucideEye],
  template: `
    <div class="legal-page container animate-fade-in">
      <div class="back-navigation">
        <a routerLink="/" class="btn-back">
          <svg lucideArrowLeft></svg>
          Volver al Inicio
        </a>
      </div>

      <div class="legal-container glass-panel">
        <div class="legal-header">
          <div class="legal-icon-wrapper">
            <svg lucideShieldCheck class="legal-icon"></svg>
          </div>
          <div class="header-info">
            <h1>Política de Privacidad</h1>
            <p class="subtitle">Última actualización: Junio de 2026</p>
          </div>
        </div>

        <div class="legal-content">
          <section class="legal-section">
            <h2>1. Declaración de Compromiso y Normativa Aplicable</h2>
            <p>
              La presente Política de Privacidad describe el tratamiento de datos personales realizado a través del portal de la **Vitrina Digital Escolar de la I.E. "La Victoria" de Abancay, Apurímac** (en adelante, la "Plataforma").
            </p>
            <p>
              Nos comprometemos a salvaguardar los datos de carácter personal en concordancia con la **Ley N° 29733 - Ley de Protección de Datos Personales del Perú (LPDP)**, su Reglamento y las directivas emitidas por la Autoridad Nacional de Protección de Datos Personales (ANPD).
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Responsable del Tratamiento de Datos</h2>
            <p>
              El titular y responsable del tratamiento de los bancos de datos de esta web es la **Institución Educativa "La Victoria"**, con domicilio en Abancay, Apurímac, Perú. Para cualquier consulta o contacto relacionado con la protección de datos, puede dirigirse al correo institucional oficial o de manera física en nuestras instalaciones.
            </p>
          </section>

          <section class="legal-section">
            <h2>3. Datos Personales que Recopilamos</h2>
            <p>
              La Plataforma recopila información según el rol que desempeñe el usuario registrado:
            </p>
            <ul>
              <li><strong>Docentes y Administradores:</strong> Nombre completo, correo electrónico institucional/personal (para login), institución educativa y número de teléfono/WhatsApp de contacto (indispensable para gestionar consultas de los productos publicados).</li>
              <li><strong>Alumnos (Menores de Edad):</strong> Nombre completo, correo electrónico de acceso, institución educativa y la vinculación a su respectivo docente tutor. No almacenamos teléfonos personales ni ubicaciones geográficas de estudiantes menores.</li>
              <li><strong>Visitantes del Catálogo:</strong> No recopilamos datos personales de los internautas de forma obligatoria, salvo cookies técnicas estrictamente necesarias para el rendimiento de la web y control de sesión de accesos.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Consentimiento y Protección Especial a Menores de Edad</h2>
            <p>
              Dando cumplimiento al **Artículo 26 del Reglamento de la LPDP (D.S. N° 003-2013-JUS)**, la Plataforma cuenta con medidas de seguridad reforzadas para proteger la información de nuestras estudiantes:
            </p>
            <div class="protection-box">
              <svg lucideEye class="protection-icon"></svg>
              <div>
                <strong>Privacidad Estudiantil:</strong> Nunca publicamos datos de contacto personal de las alumnas (ni teléfono, ni redes sociales, ni correos) de forma abierta en el catálogo. Toda consulta comercial se enruta al docente tutor designado.
              </div>
            </div>
            <ul>
              <li><strong>Consentimiento de Menores de 14 años:</strong> El registro de cualquier alumna menor de 14 años requiere la supervisión y previa autorización por escrito de sus padres, tutores o apoderados. Las escuelas aliadas asumen la obligación de validar e informar este consentimiento antes de permitir el registro.</li>
              <li><strong>Menores de entre 14 y 18 años:</strong> Pueden registrarse de forma directa bajo la supervisión de sus docentes tutores, declarando comprender los presentes términos en compañía de un adulto responsable.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Finalidad del Tratamiento</h2>
            <p>
              Los datos recopilados en la Plataforma se tratarán únicamente para las siguientes finalidades pedagógicas y organizacionales:
            </p>
            <ol>
              <li>Crear las cuentas de acceso al panel de administración (Dashboard) y permitir a las estudiantes registrar sus productos.</li>
              <li>Mostrar la información del producto y el contacto del docente tutor para facilitar la comunicación con compradores interesados.</li>
              <li>Gestionar el soporte técnico y resolver incidencias de acceso.</li>
              <li>Generar reportes estadísticos internos para medir el impacto de los proyectos de emprendimiento estudiantil de la institución.</li>
            </ol>
          </section>

          <section class="legal-section">
            <h2>6. Seguridad y Confidencialidad de la Información</h2>
            <p>
              Implementamos medidas de seguridad técnicas, organizativas y legales para evitar la pérdida, mal uso, alteración o acceso no autorizado a los datos personales.
            </p>
            <ul>
              <li>Los accesos de base de datos están regulados por políticas RLS (Row Level Security) que impiden que usuarios no autorizados consulten perfiles ajenos.</li>
              <li>Las contraseñas de las cuentas son administradas de forma segura y cifrada a través de Supabase Auth (OAuth).</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>7. Ejercicio de los Derechos ARCO</h2>
            <p>
              Conforme a la ley peruana, los usuarios o sus representantes legales (padres de familia) pueden ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong>.
            </p>
            <p>
              Para ejercerlos, puede enviar un correo a la dirección de contacto del colegio o gestionar de forma autónoma la eliminación definitiva de sus datos personales utilizando el botón **"Eliminar mi cuenta definitivamente"** ubicado dentro del menú "Mi Perfil" en la Plataforma. Esto borrará inmediatamente todos sus perfiles y productos de la base de datos de manera irreversible.
            </p>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
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
      font-weight: 600;
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
    .legal-container {
      padding: 3rem;
    }
    .legal-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 1.5rem;
    }
    .legal-icon-wrapper {
      width: 56px;
      height: 56px;
      background: var(--primary-light);
      color: var(--primary-color);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--primary-color);
    }
    .legal-icon {
      width: 28px;
      height: 28px;
    }
    .header-info h1 {
      font-family: var(--font-heading);
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .header-info .subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .legal-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      line-height: 1.7;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .protection-box {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-sm);
      color: #065f46;
      margin-bottom: 1rem;
    }
    [data-theme="dark"] .protection-box {
      background: rgba(16, 185, 129, 0.04);
      border-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }
    .protection-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      margin-top: 0.15rem;
    }
    .legal-section h2 {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }
    .legal-section p {
      margin-bottom: 1rem;
    }
    .legal-section ul, .legal-section ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .legal-section li {
      list-style-position: outside;
    }

    @media (max-width: 768px) {
      .legal-container {
        padding: 1.75rem;
      }
      .legal-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .header-info h1 {
        font-size: 1.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacidadComponent {}
