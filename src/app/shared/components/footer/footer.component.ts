import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="container footer-container">
        <div class="footer-left">
          <p class="footer-title">Vitrina Digital Escolar</p>
          <p class="footer-subtitle">Municipalidad de La Victoria & Instituciones Educativas Unidas</p>
        </div>
        <div class="footer-right">
          <p class="footer-copy">&copy; {{ anioActual }} Vitrina Victoria. Todos los derechos reservados.</p>
          <p class="footer-tagline">Impulsando el emprendimiento de nuestras estudiantes.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      padding: 2rem 0;
      margin-top: 5rem;
      transition: background-color var(--transition-normal), border-color var(--transition-normal);
    }
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .footer-title {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
    }
    .footer-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .footer-copy {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .footer-tagline {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: right;
    }

    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .footer-tagline {
        text-align: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly anioActual = new Date().getFullYear();
}
