import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBookOpen } from '@lucide/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LucideBookOpen],
  template: `
    <footer class="footer">
      <div class="container footer-container">
        <div class="footer-left">
          <p class="footer-title">Vitrina Digital Escolar</p>
          <p class="footer-subtitle">I.E. "La Victoria" — Abancay, Apurímac</p>
        </div>
        
        <div class="footer-middle">
          <div class="legal-links">
            <a routerLink="/terminos-y-condiciones" class="legal-link">Términos y Condiciones</a>
            <span class="separator">•</span>
            <a routerLink="/politica-de-privacidad" class="legal-link">Política de Privacidad</a>
          </div>
          <div class="reclamaciones-wrapper">
            <a href="mailto:reclamaciones.ielavictoria&#64;gmail.com?subject=Reclamacion%20-%20Vitrina%20Digital%20La%20Victoria" class="btn-reclamaciones">
              <svg lucideBookOpen class="book-icon"></svg>
              <span>Libro de Reclamaciones</span>
            </a>
          </div>
        </div>

        <div class="footer-right">
          <p class="footer-copy">&copy; {{ anioActual }} I.E. La Victoria. Todos los derechos reservados.</p>
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
      gap: 2rem;
    }
    .footer-left, .footer-right {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .footer-title {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--text-primary);
    }
    .footer-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .footer-middle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .legal-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    .legal-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
      transition: color var(--transition-fast);
    }
    .legal-link:hover {
      color: var(--primary-color);
    }
    .separator {
      color: var(--text-muted);
      opacity: 0.5;
    }
    .reclamaciones-wrapper {
      display: flex;
      justify-content: center;
    }
    .btn-reclamaciones {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 0.45rem 1rem;
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 700;
      transition: all var(--transition-fast);
    }
    .btn-reclamaciones:hover {
      background: var(--primary-light);
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateY(-1px);
    }
    .book-icon {
      width: 14px;
      height: 14px;
    }
    .footer-copy {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
      text-align: right;
    }
    .footer-tagline {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: right;
    }

    @media (max-width: 1024px) {
      .footer-container {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.5rem;
      }
      .footer-copy, .footer-tagline {
        text-align: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly anioActual = new Date().getFullYear();
}
