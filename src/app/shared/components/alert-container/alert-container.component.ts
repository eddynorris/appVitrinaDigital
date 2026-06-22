import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';
import { 
  LucideCheckCircle, 
  LucideAlertTriangle, 
  LucideXCircle, 
  LucideInfo, 
  LucideX
} from '@lucide/angular';

@Component({
  selector: 'app-alert-container',
  standalone: true,
  imports: [
    CommonModule,
    LucideCheckCircle,
    LucideAlertTriangle,
    LucideXCircle,
    LucideInfo,
    LucideX
  ],
  template: `
    <!-- TOAST NOTIFICATIONS CONTAINER -->
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toasts(); track toast.id) {
        <div 
          class="toast-card glass-panel" 
          [class]="toast.type"
          role="alert"
        >
          <div class="toast-icon-wrapper">
            @switch (toast.type) {
              @case ('success') {
                <svg lucideCheckCircle class="toast-icon success-icon"></svg>
              }
              @case ('error') {
                <svg lucideXCircle class="toast-icon error-icon"></svg>
              }
              @case ('warning') {
                <svg lucideAlertTriangle class="toast-icon warning-icon"></svg>
              }
              @case ('info') {
                <svg lucideInfo class="toast-icon info-icon"></svg>
              }
            }
          </div>
          
          <div class="toast-message">
            {{ toast.message }}
          </div>
          
          <button 
            type="button" 
            class="toast-close-btn" 
            (click)="removeToast(toast.id)"
            aria-label="Cerrar notificación"
          >
            <svg lucideX [size]="14"></svg>
          </button>
        </div>
      }
    </div>

    <!-- CONFIRMATION MODAL OVERLAY -->
    @if (modal(); as m) {
      <div class="modal-backdrop animate-fade-in" (click)="onBackdropClick($event)">
        <div class="modal-card glass-panel animate-scale-up" [class]="m.type" role="dialog" aria-modal="true">
          <!-- Close button -->
          <button type="button" class="modal-close-x" (click)="closeModal(false)" aria-label="Cerrar modal">
            <svg lucideX [size]="18"></svg>
          </button>

          <!-- Modal Header with Icon -->
          <div class="modal-header-icon-wrapper">
            <div class="modal-type-icon">
              @switch (m.type) {
                @case ('danger') {
                  <svg lucideXCircle [size]="32" class="modal-icon danger-color"></svg>
                }
                @case ('warning') {
                  <svg lucideAlertTriangle [size]="32" class="modal-icon warning-color"></svg>
                }
                @case ('primary') {
                  <svg lucideCheckCircle [size]="32" class="modal-icon primary-color"></svg>
                }
              }
            </div>
          </div>

          <!-- Modal Content -->
          <div class="modal-content-area">
            <h3 class="modal-title">{{ m.title }}</h3>
            <p class="modal-message">{{ m.message }}</p>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions-area">
            <button 
              type="button" 
              class="btn-modal btn-modal-cancel" 
              (click)="closeModal(false)"
            >
              {{ m.cancelText }}
            </button>
            <button 
              type="button" 
              class="btn-modal" 
              [class]="'btn-modal-' + m.type"
              (click)="closeModal(true)"
            >
              {{ m.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* --- CONTENEDOR DE TOASTS --- */
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }

    .toast-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md, 12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      pointer-events: auto;
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      border-left: 5px solid transparent;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    /* Modificador según el tipo de Toast */
    .toast-card.success {
      border-left: 5px solid var(--success-color, #16a34a);
      background: rgba(240, 253, 244, 0.9);
    }
    .toast-card.error {
      border-left: 5px solid var(--error-color, #ef4444);
      background: rgba(254, 242, 242, 0.9);
    }
    .toast-card.warning {
      border-left: 5px solid var(--warning-color, #d97706);
      background: rgba(254, 243, 199, 0.9);
    }
    .toast-card.info {
      border-left: 5px solid var(--info-color, #2563eb);
      background: rgba(239, 246, 255, 0.9);
    }

    .toast-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .toast-icon {
      width: 22px;
      height: 22px;
    }
    .toast-icon.success-icon { color: var(--success-color, #16a34a); }
    .toast-icon.error-icon { color: var(--error-color, #ef4444); }
    .toast-icon.warning-icon { color: var(--warning-color, #d97706); }
    .toast-icon.info-icon { color: var(--info-color, #2563eb); }

    .toast-message {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary, #1e1e1e);
      line-height: 1.4;
      flex: 1;
    }

    .toast-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #7e7e7e);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.2rem;
      border-radius: 50%;
      transition: all 0.2s ease;
    }
    .toast-close-btn:hover {
      background: rgba(0, 0, 0, 0.05);
      color: var(--text-primary, #1e1e1e);
    }

    /* --- BACKDROP DE MODAL --- */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 12, 10, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 11000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-card {
      position: relative;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.35);
      box-shadow: 0 20px 50px rgba(15, 12, 10, 0.15);
      border-radius: 16px;
      width: 100%;
      max-width: 440px;
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      overflow: hidden;
      animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .modal-close-x {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      color: var(--text-muted, #7e7e7e);
      cursor: pointer;
      padding: 0.35rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .modal-close-x:hover {
      background: rgba(0, 0, 0, 0.05);
      color: var(--text-primary, #1e1e1e);
    }

    .modal-header-icon-wrapper {
      margin-bottom: 1.25rem;
    }
    .modal-type-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Configuración por tipos de Modales */
    .modal-card.danger .modal-type-icon {
      background: rgba(254, 242, 242, 1);
    }
    .modal-card.warning .modal-type-icon {
      background: rgba(254, 243, 199, 1);
    }
    .modal-card.primary .modal-type-icon {
      background: rgba(24df, 245, 242, 1);
      /* Tema del proyecto (Café/Dorado del colegio) */
      background: rgba(99, 57, 27, 0.1);
    }

    .modal-icon.danger-color { color: #ef4444; }
    .modal-icon.warning-color { color: #d97706; }
    .modal-icon.primary-color { color: var(--primary-color, #63391b); }

    .modal-content-area {
      margin-bottom: 2rem;
    }
    .modal-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary, #1e1e1e);
      margin-bottom: 0.5rem;
    }
    .modal-message {
      font-size: 0.95rem;
      color: var(--text-secondary, #5e5e5e);
      line-height: 1.5;
      white-space: pre-wrap;
      text-align: left;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .modal-actions-area {
      display: flex;
      gap: 0.75rem;
      width: 100%;
    }

    @media (max-width: 480px) {
      .modal-card {
        padding: 1.75rem 1.25rem;
      }
      .modal-actions-area {
        flex-direction: column;
        gap: 0.5rem;
      }
      .btn-modal {
        width: 100%;
      }
    }

    .btn-modal {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-modal-cancel {
      background: var(--bg-tertiary, #f3f3f3);
      color: var(--text-secondary, #5e5e5e);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .btn-modal-cancel:hover {
      background: rgba(0, 0, 0, 0.06);
      color: var(--text-primary, #1e1e1e);
    }

    .btn-modal-primary {
      background: var(--primary-color, #63391b);
      color: white;
    }
    .btn-modal-primary:hover {
      background: var(--primary-dark, #4d2c14);
      transform: translateY(-1px);
    }

    .btn-modal-danger {
      background: #ef4444;
      color: white;
    }
    .btn-modal-danger:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .btn-modal-warning {
      background: #d97706;
      color: white;
    }
    .btn-modal-warning:hover {
      background: #b45309;
      transform: translateY(-1px);
    }

    /* --- ANIMACIONES --- */
    @keyframes slideInRight {
      from {
        transform: translateX(120%) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }

    @keyframes scaleUp {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertContainerComponent {
  private alertService = inject(AlertService);

  readonly toasts = this.alertService.toasts;
  readonly modal = this.alertService.modal;

  removeToast(id: number): void {
    this.alertService.removeToast(id);
  }

  closeModal(result: boolean): void {
    this.alertService.closeModal(result);
  }

  onBackdropClick(event: MouseEvent): void {
    // Si hace clic directamente en el fondo, cancelar el modal
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal(false);
    }
  }
}
