# App La Victoria

Vitrina digital de emprendimiento escolar: muestra y vende los productos creados por estudiantes de colegios de La Victoria (Abancay-Apurímac), como artesanía, textiles, repostería, joyería y horticultura. Incluye catálogo público con búsqueda y filtros, página de inicio, detalle de producto, autenticación, perfil y un panel para que las instituciones administren sus productos.

## Características principales

- Página de inicio con hero, historia del proyecto y colección destacada.
- Catálogo público de productos con búsqueda, filtros por colegio y categoría, y paginación.
- Tarjetas de producto reutilizables y detalle de producto.
- Autenticación (login/registro) y gestión de perfil.
- Panel (dashboard) para instituciones con administración de productos.
- Páginas legales (términos y privacidad).
- Backend de datos con Supabase.

## Tecnologías

- Angular 21 (standalone components, signals)
- RxJS
- Supabase (@supabase/supabase-js)
- Lucide (iconos)
- TypeScript
- Vitest (unit tests)
- Playwright (e2e)

## Requisitos previos

- Node.js 20 o superior
- Angular CLI (`npm install -g @angular/cli`)

## Cómo ejecutar

```bash
npm install
ng serve
```

El servidor de desarrollo estará disponible en `http://localhost:4200/`.

## Compilar

```bash
ng build
```

Los artefactos de producción se generan en el directorio `dist/`.

## Pruebas

```bash
ng test        # unit tests (Vitest)
npm run test:e2e  # pruebas end-to-end (Playwright)
```

## Estructura del proyecto

```
src/app/
├── core/          # Guards, servicios y configuración global
│   ├── config/        # Configuración
│   ├── guards/        # Protección de rutas
│   └── services/      # Supabase, autenticación, productos
├── pages/
│   ├── home/          # Página de inicio
│   ├── catalog/       # Catálogo de productos
│   ├── product-detail/ # Detalle de producto
│   ├── auth/          # Login y registro
│   ├── perfil/        # Perfil del usuario
│   ├── dashboard/     # Panel de instituciones
│   └── legal/         # Términos y privacidad
└── shared/        # Componentes reutilizables (header, footer, product-card)
```