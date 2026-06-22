import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideScale, LucideAlertTriangle } from '@lucide/angular';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink, LucideArrowLeft, LucideScale, LucideAlertTriangle],
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
            <svg lucideScale class="legal-icon"></svg>
          </div>
          <div class="header-info">
            <h1>Términos y Condiciones de Uso</h1>
            <p class="subtitle">Última actualización: Junio de 2026</p>
          </div>
        </div>

        <div class="legal-content">
          <div class="alert-box-warning">
            <svg lucideAlertTriangle class="alert-icon"></svg>
            <div class="alert-text">
              <strong>Importante:</strong> La Vitrina Digital Escolar de la <strong>I.E. "La Victoria" de Abancay, Apurímac</strong> es una plataforma estrictamente expositora y educativa. No procesamos pagos, ventas ni envíos directos.
            </div>
          </div>

          <section class="legal-section">
            <h2>1. Declaración de Identidad y Objeto</h2>
            <p>
              El presente sitio web (en adelante, la "Plataforma") es un catálogo digital y una iniciativa pedagógica sin fines de lucro, desarrollada por y para la <strong>Institución Educativa "La Victoria"</strong>, ubicada en la ciudad de <strong>Abancay, Apurímac, Perú</strong>.
            </p>
            <p>
              Su objetivo principal es fomentar las competencias de emprendimiento, creatividad y educación técnica de nuestras estudiantes a través de la exhibición pública de sus trabajos y proyectos escolares.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Exclusividad del Catálogo e Intermediación</h2>
            <p>
              La Plataforma actúa única y exclusivamente bajo la modalidad de <strong>Catálogo Digital Informativo (Vitrina)</strong>. 
            </p>
            <ul>
              <li><strong>No somos tienda en línea:</strong> La Plataforma no cuenta con pasarelas de pago, no procesa transacciones monetarias electrónicas, tarjetas de crédito/débito, transferencias ni cobros directos.</li>
              <li><strong>Rol de los docentes tutores:</strong> Para salvaguardar la integridad y privacidad de nuestras alumnas (quienes en su mayoría son menores de edad), toda consulta comercial, negociación o coordinación de entrega es gestionada única y exclusivamente por el <strong>Docente Tutor asignado</strong> al proyecto a través de canales de comunicación externos (tales como WhatsApp o llamadas telefónicas).</li>
              <li><strong>Exención de Responsabilidad:</strong> La I.E. "La Victoria" de Abancay, el personal técnico y los desarrolladores del sistema no se hacen responsables de los acuerdos privados, transacciones, calidad, garantía o la logística de entrega acordados entre el comprador interesado y el docente de contacto.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Registro de Cuentas y Acceso Educativo</h2>
            <p>
              La creación de perfiles y la publicación de productos en el catálogo está restringida estrictamente a:
            </p>
            <ol>
              <li>Estudiantes matriculadas en la I.E. "La Victoria" de Abancay (con rol <code>alumno</code>).</li>
              <li>Personal docente y administrativo autorizado por la institución (con roles <code>docente</code> o <code>admin</code>).</li>
            </ol>
            <p>
              El registro se realiza de manera segura mediante autenticación de cuentas (Google OAuth) y la información de perfil es completada bajo la supervisión directa del docente tutor correspondiente.
            </p>
          </section>

          <section class="legal-section">
            <h2>4. Protección de Datos y Menores de Edad</h2>
            <p>
              En cumplimiento estricto con la Ley N° 29733 (Ley de Protección de Datos Personales de Perú) y su Reglamento:
            </p>
            <ul>
              <li>Las alumnas menores de 14 años deben contar con la autorización y consentimiento expreso de sus padres o tutores legales antes de registrar sus perfiles en la plataforma.</li>
              <li>Queda terminantemente prohibido publicar datos de contacto directo de las estudiantes (tales como números telefónicos personales, correos personales o direcciones del hogar). El único contacto público expuesto para transacciones será el del docente tutor designado.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Propiedad Intelectual de las Creaciones</h2>
            <p>
              Todos los productos, artesanías, confecciones, postres, piezas de arte y desarrollos publicados en este portal son propiedad intelectual y creaciones originales de las estudiantes de la I.E. "La Victoria" de Abancay. 
            </p>
            <p>
              Queda estrictamente prohibido el uso de imágenes, nombres o descripciones del catálogo para su explotación comercial externa por terceros sin la debida autorización de la institución y de la estudiante creadora.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Reglas de Contenido y Uso Aceptable</h2>
            <p>
              Tanto las alumnas como los docentes se comprometen a subir información verídica y apropiada. Está prohibida la publicación de cualquier contenido que:
            </p>
            <ul>
              <li>Infrinja marcas registradas o derechos de autor de terceros.</li>
              <li>Contenga imágenes, lenguaje u alusiones obscenas, violentas, políticas o discriminatorias.</li>
              <li>Promueva la venta de productos nocivos, ilícitos o restringidos para menores (bebidas alcohólicas, medicamentos, etc.).</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>7. Modificaciones a los Términos</h2>
            <p>
              La dirección de la Institución Educativa "La Victoria" de Abancay se reserva el derecho de actualizar, modificar o suspender los presentes Términos y Condiciones, así como el funcionamiento del portal, en concordancia con las directivas del Ministerio de Educación (MINEDU) y las normativas legales peruanas aplicables.
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
    .alert-box-warning {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--radius-sm);
      color: #b45309;
    }
    [data-theme="dark"] .alert-box-warning {
      background: rgba(245, 158, 11, 0.04);
      border-color: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }
    .alert-icon {
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
export class TerminosComponent {}
