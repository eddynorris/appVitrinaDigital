import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase.config';

export interface Institucion {
  id: string;
  nombre: string;
  distrito: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  correo_electronico?: string;
  descripcion?: string;
  logo_url?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  icono: string;
}

export interface Producto {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[];
  categoria_id: string;
  institucion_id: string;
  docente_contacto_id: string;
  estado: 'borrador' | 'publicado' | 'vendido' | 'pausado';
  creado_por?: string;
  created_at?: string;
  updated_at?: string;
  // Campos cruzados (de relaciones)
  categorias?: Categoria;
  instituciones?: Institucion;
  perfiles?: {
    nombre_completo: string;
    whatsapp_contacto: string;
    rol?: string;
  };
  creador?: {
    id?: string;
    nombre_completo: string;
    rol: string;
    tutor?: {
      id?: string;
      nombre_completo: string;
      whatsapp_contacto: string;
      rol: string;
    } | null;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Helper para envolver cualquier promesa en un timeout de 8 segundos
  private async conTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('TIMEOUT_ERROR'));
      }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  // --- MÉTODOS DE INSTITUCIONES ---
  async getInstituciones(): Promise<Institucion[]> {
    return this.conTimeout(
      (async () => {
        const { data, error } = await this.supabase
          .from('instituciones')
          .select('*')
          .order('nombre', { ascending: true });
        
        if (error) throw error;
        return data || [];
      })()
    );
  }

  async crearInstitucion(institucion: Omit<Institucion, 'id'>): Promise<Institucion> {
    return this.conTimeout(
      (async () => {
        const { data, error } = await this.supabase
          .from('instituciones')
          .insert(institucion)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No se pudo crear la institución.');
        return data[0] as Institucion;
      })()
    );
  }

  async actualizarInstitucion(id: string, updates: Partial<Institucion>): Promise<Institucion> {
    return this.conTimeout(
      (async () => {
        const { data, error } = await this.supabase
          .from('instituciones')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No se pudo actualizar la institución.');
        return data[0] as Institucion;
      })()
    );
  }

  async eliminarInstitucion(id: string): Promise<void> {
    return this.conTimeout(
      (async () => {
        const { error } = await this.supabase
          .from('instituciones')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      })()
    );
  }

  // --- MÉTODOS DE CATEGORÍAS ---
  async getCategorias(): Promise<Categoria[]> {
    return this.conTimeout(
      (async () => {
        const { data, error } = await this.supabase
          .from('categorias')
          .select('*')
          .order('nombre', { ascending: true });
        
        if (error) throw error;
        return data || [];
      })()
    );
  }

  // --- MÉTODOS DE PRODUCTOS ---
  async getProductos(filters?: {
    categoriaId?: string;
    institucionId?: string;
    searchQuery?: string;
    estado?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ products: Producto[]; totalCount: number }> {
    return this.conTimeout(
      (async () => {
        let query = this.supabase
          .from('productos')
          .select(`
            *,
            categorias (id, nombre, slug, icono),
            instituciones (id, nombre, distrito, logo_url),
            perfiles:docente_contacto_id (nombre_completo, whatsapp_contacto, rol),
            creador:creado_por (
              id,
              nombre_completo,
              rol,
              tutor:docente_tutor_id (
                id,
                nombre_completo,
                whatsapp_contacto,
                rol
              )
            )
          `, { count: 'exact' });

        if (filters?.estado) {
          query = query.eq('estado', filters.estado);
        } else {
          query = query.eq('estado', 'publicado');
        }

        if (filters?.categoriaId) {
          query = query.eq('categoria_id', filters.categoriaId);
        }

        if (filters?.institucionId) {
          query = query.eq('institucion_id', filters.institucionId);
        }

        if (filters?.searchQuery) {
          query = query.ilike('nombre', `%${filters.searchQuery}%`);
        }

        query = query.order('created_at', { ascending: false });

        if (filters?.page && filters?.pageSize) {
          const from = (filters.page - 1) * filters.pageSize;
          const to = from + filters.pageSize - 1;
          query = query.range(from, to);
        }

        const { data, count, error } = await query;
        if (error) throw error;
        return {
          products: (data as unknown as Producto[]) || [],
          totalCount: count || 0
        };
      })()
    );
  }

  async getProductoById(id: string): Promise<Producto> {
    return this.conTimeout(
      (async () => {
        const { data, error } = await this.supabase
          .from('productos')
          .select(`
            *,
            categorias (id, nombre, slug, icono),
            instituciones (id, nombre, distrito, logo_url),
            perfiles:docente_contacto_id (nombre_completo, whatsapp_contacto, rol),
            creador:creado_por (
              id,
              nombre_completo,
              rol,
              tutor:docente_tutor_id (
                id,
                nombre_completo,
                whatsapp_contacto,
                rol
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as unknown as Producto;
      })()
    );
  }

  async crearProducto(producto: Producto): Promise<Producto> {
    return this.conTimeout(
      (async () => {
        const { data, error } = await this.supabase
          .from('productos')
          .insert(producto)
          .select();

        if (error) throw error;
        return (data && data.length > 0 ? data[0] : producto) as unknown as Producto;
      })()
    );
  }

  async actualizarProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    return this.conTimeout(
      (async () => {
        const { data, error } = await this.supabase
          .from('productos')
          .update(updates)
          .eq('id', id)
          .select();

        if (error) throw error;
        return (data && data.length > 0 ? data[0] : updates) as unknown as Producto;
      })()
    );
  }

  async eliminarProducto(id: string): Promise<void> {
    return this.conTimeout(
      (async () => {
        const { error } = await this.supabase
          .from('productos')
          .delete()
          .eq('id', id);

        if (error) throw error;
      })()
    );
  }

  // --- STORAGE (IMÁGENES) ---
  async subirImagen(file: File): Promise<string> {
    return this.conTimeout(
      (async () => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await this.supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (error) throw error;

        // Obtener la URL pública
        const { data } = this.supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return data.publicUrl;
      })()
    );
  }
}
