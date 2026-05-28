import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const { data: { session } } = await supabaseService.client.auth.getSession();

  if (session?.user) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  router.navigate(['/auth']);
  return false;
};
