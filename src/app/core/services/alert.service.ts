import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}

export interface ConfirmModal {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'primary' | 'danger' | 'warning';
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  // Signals reactivos para el estado de las alertas
  readonly toasts = signal<Toast[]>([]);
  readonly modal = signal<ConfirmModal | null>(null);

  private nextToastId = 0;

  // --- MÉTODOS PARA TOASTS ---
  
  success(message: string, duration = 4000): void {
    this.addToast('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.addToast('error', message, duration);
  }

  warning(message: string, duration = 4500): void {
    this.addToast('warning', message, duration);
  }

  info(message: string, duration = 4000): void {
    this.addToast('info', message, duration);
  }

  private addToast(type: 'success' | 'error' | 'warning' | 'info', message: string, duration: number): void {
    const id = this.nextToastId++;
    const newToast: Toast = { id, type, message, duration };
    
    // Agregar toast
    this.toasts.update(current => [...current, newToast]);

    // Eliminar automáticamente tras la duración
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  removeToast(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  // --- MÉTODOS PARA MODAL DE CONFIRMACIÓN ---

  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'primary' | 'danger' | 'warning';
  }): Promise<boolean> {
    // Si ya hay un modal abierto, resolverlo como falso antes de abrir uno nuevo
    const currentModal = this.modal();
    if (currentModal) {
      currentModal.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      this.modal.set({
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'primary',
        resolve: (value: boolean) => {
          resolve(value);
          this.modal.set(null); // Limpiar el modal tras resolverlo
        }
      });
    });
  }

  closeModal(result: boolean): void {
    const currentModal = this.modal();
    if (currentModal) {
      currentModal.resolve(result);
    }
  }
}
