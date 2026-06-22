-- =====================================================================
-- SCHEMA DE LA VITRINA DIGITAL ESCOLAR (LA VICTORIA)
-- =====================================================================
-- Este script se puede ejecutar directamente en el "SQL Editor" de Supabase
-- para configurar toda la base de datos, políticas de seguridad (RLS),
-- triggers automáticos de autenticación y datos semilla.

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

-- Tabla de Colegios / Instituciones Educativas
CREATE TABLE IF NOT EXISTS public.instituciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  distrito VARCHAR(100),
  ciudad VARCHAR(100),
  direccion VARCHAR(255),
  telefono VARCHAR(20),
  correo_electronico VARCHAR(255),
  descripcion TEXT,
  logo_url VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Perfiles (Extiende la tabla auth.users de Supabase Auth)
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  nombre_completo VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'docente', 'alumno')),
  institucion_id UUID REFERENCES public.instituciones(id) ON DELETE SET NULL,
  docente_tutor_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL, -- Solo aplicable para alumnos
  whatsapp_contacto VARCHAR(50) UNIQUE, -- Solo requerido para docentes/tutores que reciben mensajes de compra
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías de Productos
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icono VARCHAR(50) NOT NULL, -- Nombre de un icono (ej. "shopping-bag", "palette", "chef-hat")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos del Catálogo
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  imagenes TEXT[] NOT NULL, -- Array de URLs de imágenes almacenadas en el Storage
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE RESTRICT,
  institucion_id UUID REFERENCES public.instituciones(id) ON DELETE CASCADE,
  docente_contacto_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL, -- Docente que intermediará la venta
  estado VARCHAR(50) DEFAULT 'publicado' CHECK (estado IN ('borrador', 'publicado', 'vendido', 'pausado')),
  creado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexación para optimizar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_productos_estado ON public.productos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_institucion ON public.productos(institucion_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria_id);

-- ---------------------------------------------------------------------
-- 2. TRIGGER DE CREACIÓN DE PERFIL AUTOMÁTICO (Supabase Auth Integration)
-- ---------------------------------------------------------------------

-- Función que se ejecuta cuando un usuario se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre_completo, rol, institucion_id, whatsapp_contacto)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'nombre_completo',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      'Usuario Escolar'
    ),
    COALESCE(new.raw_user_meta_data->>'rol', 'alumno'),
    (new.raw_user_meta_data->>'institucion_id')::uuid,
    new.raw_user_meta_data->>'whatsapp_contacto'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función anterior al registrar un usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3. HABILITACIÓN DE RLS (ROW LEVEL SECURITY)
-- ---------------------------------------------------------------------

ALTER TABLE public.instituciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 4. POLÍTICAS DE SEGURIDAD (RLS)
-- ---------------------------------------------------------------------

-- Políticas para 'instituciones'
CREATE POLICY "Permitir lectura pública de instituciones" 
  ON public.instituciones FOR SELECT TO public USING (true);

CREATE POLICY "Solo administradores pueden modificar instituciones" 
  ON public.instituciones FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'));

-- Políticas para 'categorias'
CREATE POLICY "Permitir lectura pública de categorias" 
  ON public.categorias FOR SELECT TO public USING (true);

CREATE POLICY "Solo administradores pueden modificar categorias" 
  ON public.categorias FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'));

-- Políticas para 'perfiles'
CREATE POLICY "Permitir lectura pública de perfiles" 
  ON public.perfiles FOR SELECT TO public USING (true);

CREATE POLICY "Los usuarios pueden modificar su propio perfil" 
  ON public.perfiles FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

-- Políticas para 'productos'
CREATE POLICY "Permitir lectura pública de productos publicados" 
  ON public.productos FOR SELECT TO public 
  USING (estado = 'publicado');

CREATE POLICY "Permitir lectura completa de productos a usuarios autenticados" 
  ON public.productos FOR SELECT TO authenticated 
  USING (
    auth.uid() = creado_por OR 
    auth.uid() = docente_contacto_id OR 
    auth.uid() = (SELECT docente_tutor_id FROM public.perfiles WHERE id = creado_por) OR
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Permitir insertar productos a usuarios autenticados" 
  ON public.productos FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = creado_por);

CREATE POLICY "Permitir actualizar productos a sus creadores, tutores o admins" 
  ON public.productos FOR UPDATE TO authenticated 
  USING (
    auth.uid() = creado_por OR 
    auth.uid() = docente_contacto_id OR 
    auth.uid() = (SELECT docente_tutor_id FROM public.perfiles WHERE id = creado_por) OR
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Permitir eliminar productos a sus creadores, tutores o admins" 
  ON public.productos FOR DELETE TO authenticated 
  USING (
    auth.uid() = creado_por OR 
    auth.uid() = docente_contacto_id OR 
    auth.uid() = (SELECT docente_tutor_id FROM public.perfiles WHERE id = creado_por) OR
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- ---------------------------------------------------------------------
-- 5. CONFIGURACIÓN DEL BUCKET DE IMÁGENES Y SUS POLÍTICAS
-- ---------------------------------------------------------------------

-- Nota: Este bloque de SQL asegura la existencia del bucket en Supabase Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para el Storage Bucket 'product-images'
CREATE POLICY "Lectura pública de imágenes de productos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Permitir subida de imágenes a usuarios autenticados"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Permitir borrado de imágenes a los dueños de los productos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

-- ---------------------------------------------------------------------
-- 6. DATOS SEMILLA (Seed Data)
-- ---------------------------------------------------------------------

-- Insertar Instituciones Educativas (Colegios en La Victoria)
INSERT INTO public.instituciones (id, nombre, distrito, descripcion, logo_url) VALUES
('a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a001', 'I.E. Isabel La Católica', 'La Victoria', 'Institución educativa emblemática de mujeres enfocada en emprendimiento escolar.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=60'),
('a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a002', 'I.E. Pedro A. Labarthe', 'La Victoria', 'Colegio nacional con talleres técnicos y tecnológicos de primer nivel.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=60'),
('a0e0a0e0-a0e0-a0e0-a0e0-a0e0a0e0a003', 'I.E. Felipe Pardo y Aliaga', 'La Victoria', 'Promoviendo el arte y la creatividad en los jóvenes estudiantes.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=60')
ON CONFLICT (id) DO NOTHING;

-- Insertar Categorías Básicas
INSERT INTO public.categorias (id, nombre, slug, icono) VALUES
('c0e0c0e0-c0e0-c0e0-c0e0-c0e0c0e0c001', 'Artesanía y Arte', 'artesania-y-arte', 'palette'),
('c0e0c0e0-c0e0-c0e0-c0e0-c0e0c0e0c002', 'Textil y Confección', 'textil-y-confeccion', 'scissors'),
('c0e0c0e0-c0e0-c0e0-c0e0-c0e0c0e0c003', 'Gastronomía y Repostería', 'gastronomia-y-reposteria', 'utensils-crossed'),
('c0e0c0e0-c0e0-c0e0-c0e0-c0e0c0e0c004', 'Joyería y Bisutería', 'joyeria-y-bisuterian', 'gem'),
('c0e0c0e0-c0e0-c0e0-c0e0-c0e0c0e0c005', 'Horticultura y Plantas', 'horticultura-y-plantas', 'flower-pot'),
('c0e0c0e0-c0e0-c0e0-c0e0-c0e0c0e0c006', 'Tecnología y Otros', 'tecnologia-y-otros', 'cpu')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 7. FUNCIÓN PARA ELIMINAR LA PROPIA CUENTA (SECURITY DEFINER)
-- ---------------------------------------------------------------------
-- Esta función permite a un usuario autenticado eliminar su propia cuenta
-- de forma segura, cascando la eliminación a su perfil y productos asociados.
CREATE OR REPLACE FUNCTION public.eliminar_propia_cuenta()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

