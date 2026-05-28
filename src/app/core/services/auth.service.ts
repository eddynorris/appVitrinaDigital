import { Injectable, inject, signal, NgZone } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Session, User } from '@supabase/supabase-js';

export interface Perfil {
  id: string;
  nombre_completo: string;
  rol: 'admin' | 'docente' | 'alumno';
  institucion_id?: string;
  docente_tutor_id?: string;
  whatsapp_contacto?: string;
  created_at?: string;
  instituciones?: {
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private zone = inject(NgZone);

  // Signals para estado reactivo moderno
  readonly currentUser = signal<Perfil | null>(null);
  readonly loading = signal<boolean>(true);

  constructor() {
    this.inicializarAuth();
  }

  private async inicializarAuth() {
    // 1. Obtener la sesión inicial
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    await this.manejarCambioSesion(session);

    // 2. Escuchar cambios de estado de autenticación dentro de la zona de Angular
    this.supabaseService.client.auth.onAuthStateChange(async (_event, session) => {
      this.zone.run(async () => {
        await this.manejarCambioSesion(session);
      });
    });
  }

  private async manejarCambioSesion(session: Session | null) {
    this.loading.set(true);
    if (session?.user) {
      try {
        const perfil = await this.cargarPerfilUsuario(session.user.id);
        this.currentUser.set(perfil);
      } catch (error) {
        console.error('Error al cargar perfil de usuario:', error);
        this.currentUser.set(null);
      }
    } else {
      this.currentUser.set(null);
    }
    this.loading.set(false);
  }

  private async cargarPerfilUsuario(userId: string): Promise<Perfil> {
    const { data, error } = await this.supabaseService.client
      .from('perfiles')
      .select(`
        *,
        instituciones (nombre)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as unknown as Perfil;
  }

  // Obtener todos los docentes de un colegio (para asociar a un alumno con su tutor)
  async getDocentesPorInstitucion(institucionId: string): Promise<Perfil[]> {
    const { data, error } = await this.supabaseService.client
      .from('perfiles')
      .select('id, nombre_completo, whatsapp_contacto, rol')
      .eq('institucion_id', institucionId)
      .eq('rol', 'docente');

    if (error) throw error;
    return data || [];
  }

  // Inicio de Sesión con Google
  async loginConGoogle(): Promise<void> {
    const { error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
    if (error) throw error;
  }

  // Inicio de Sesión
  async login(email: string, contrasena: string): Promise<void> {
    const { error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password: contrasena
    });
    if (error) throw error;
  }

  // Registro de un nuevo perfil
  async registrarUsuario(
    email: string, 
    contrasena: string, 
    nombreCompleto: string, 
    rol: 'admin' | 'docente' | 'alumno', 
    institucionId: string, 
    docenteTutorId?: string, 
    whatsapp?: string
  ): Promise<void> {
    // 0. Validar si el correo ya existe en perfiles antes de registrar para evitar falsos registros exitosos
    const { data: perfilExistente, error: searchError } = await this.supabaseService.client
      .from('perfiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (searchError) {
      console.warn('Error al verificar correo existente:', searchError);
    }

    if (perfilExistente) {
      throw new Error('El correo electrónico ya está registrado con otra cuenta.');
    }

    // Validar si el WhatsApp ya existe en perfiles para evitar duplicados
    if (whatsapp && whatsapp.trim() !== '' && whatsapp.trim() !== '+51') {
      const { data: whatsappExistente, error: phoneError } = await this.supabaseService.client
        .from('perfiles')
        .select('id')
        .eq('whatsapp_contacto', whatsapp.trim())
        .maybeSingle();

      if (phoneError) {
        console.warn('Error al verificar whatsapp existente:', phoneError);
      }

      if (whatsappExistente) {
        throw new Error('El número de WhatsApp ya está registrado con otra cuenta.');
      }
    }

    // 1. Crear el usuario en auth (utiliza la api de supabase en cliente)
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password: contrasena,
      options: {
        data: {
          nombre_completo: nombreCompleto,
          rol,
          institucion_id: institucionId,
          whatsapp_contacto: whatsapp || null
        }
      }
    });

    if (error) throw error;

    // 2. Si es alumno y se especificó un tutor, y tenemos el usuario, actualizar la tabla perfiles
    if (rol === 'alumno' && docenteTutorId && data.user?.id) {
      const { error: updateError } = await this.supabaseService.client
        .from('perfiles')
        .update({ docente_tutor_id: docenteTutorId })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.warn('No se pudo actualizar el tutor del alumno:', updateError);
      }
    }
  }

  // Actualizar perfil del usuario actual de forma segura
  async actualizarPerfil(updates: Partial<Perfil>): Promise<void> {
    const user = this.currentUser();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await this.supabaseService.client
      .from('perfiles')
      .update(updates)
      .eq('id', user.id)
      .select(`
        *,
        instituciones (nombre)
      `);

    if (error) throw error;
    if (data && data.length > 0) {
      this.currentUser.set(data[0] as unknown as Perfil);
    }
  }

  // Cambiar contraseña de forma segura llamando a Supabase Auth
  async cambiarContrasena(nuevaContrasena: string): Promise<void> {
    const { error } = await this.supabaseService.client.auth.updateUser({
      password: nuevaContrasena
    });
    if (error) throw error;
  }

  // Cerrar Sesión
  async logout(): Promise<void> {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw error;
    this.currentUser.set(null);
  }
}
