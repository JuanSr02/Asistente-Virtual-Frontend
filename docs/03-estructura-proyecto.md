# 📁 Estructura del Proyecto

## Árbol de Directorios

```
Asistente-Virtual-Frontend/
├── .git/                          # Control de versiones Git
├── .next/                         # Build output de Next.js (generado)
├── node_modules/                  # Dependencias (generado)
├── public/                        # Archivos estáticos públicos
│   ├── favicon.ico               # Favicon del sitio
│   ├── manifest.json             # PWA manifest
│   └── [otros assets estáticos]
├── src/                          # Código fuente principal
│   ├── app/                      # App Router de Next.js 16
│   │   ├── admin/               # Módulo de administración
│   │   │   ├── dashboard/       # Dashboard de admin
│   │   │   ├── estadisticas/    # Estadísticas globales
│   │   │   ├── planes/          # Gestión de planes de estudio
│   │   │   ├── layout.tsx       # Layout de admin
│   │   │   └── page.tsx         # Página principal de admin
│   │   ├── auth/                # Módulo de autenticación
│   │   │   ├── login/           # Página de login
│   │   │   └── register/        # Página de registro
│   │   ├── dashboard/           # Dashboard compartido
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── estadisticasMateria/ # Estadísticas por materia
│   │   │   └── page.tsx
│   │   ├── perfil/              # Perfil de usuario
│   │   │   └── page.tsx
│   │   ├── politica-privacidad/ # Política de privacidad
│   │   │   └── page.tsx
│   │   ├── reset-password/      # Reseteo de contraseña
│   │   │   └── page.tsx
│   │   ├── student/             # Módulo de estudiantes
│   │   │   ├── experiencias/    # Experiencias de examen
│   │   │   ├── historia/        # Historia académica
│   │   │   ├── inscripciones/   # Inscripciones a mesas
│   │   │   └── recomendaciones/ # Sugerencias de finales
│   │   ├── terminos-condiciones/# Términos y condiciones
│   │   │   └── page.tsx
│   │   ├── globals.css          # Estilos globales
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Página de inicio
│   ├── components/              # Componentes React
│   │   ├── charts/              # Componentes de gráficos
│   │   │   ├── AprobacionChart.tsx
│   │   │   ├── DesertionChart.tsx
│   │   │   └── RendimientoChart.tsx
│   │   ├── layout/              # Componentes de layout
│   │   │   └── client-layout.tsx
│   │   ├── modals/              # Componentes de modales
│   │   │   ├── ConfirmModal.tsx
│   │   │   └── [otros modales]
│   │   ├── providers/           # Providers de contexto
│   │   │   └── query-provider.tsx
│   │   ├── shared/              # Componentes compartidos
│   │   │   └── [componentes comunes]
│   │   ├── student/             # Componentes de estudiantes
│   │   │   ├── ExperienciaCard.tsx
│   │   │   ├── HistoriaTable.tsx
│   │   │   ├── InscripcionCard.tsx
│   │   │   └── RecomendacionCard.tsx
│   │   ├── ui/                  # Componentes UI base (ShadCN)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── [otros componentes UI]
│   │   ├── mode-toggle.tsx      # Toggle de tema claro/oscuro
│   │   ├── Skeleton.tsx         # Componente de skeleton loading
│   │   └── theme-provider.tsx   # Provider de temas
│   ├── hooks/                   # Hooks personalizados
│   │   ├── domain/              # Hooks de dominio
│   │   │   ├── useEstadisticasCarrera.ts
│   │   │   ├── useEstadisticasGenerales.ts
│   │   │   ├── useEstadisticasMateria.ts
│   │   │   ├── useExperiencias.ts
│   │   │   ├── useHistoriaAcademica.ts
│   │   │   ├── useInscripciones.ts
│   │   │   ├── usePerfil.ts
│   │   │   ├── usePersona.ts
│   │   │   ├── usePlanesEstudio.ts
│   │   │   └── useRecomendaciones.ts
│   │   ├── use-confirm.ts       # Hook de confirmación
│   │   ├── use-mobile.tsx       # Hook de detección mobile
│   │   ├── use-toast.ts         # Hook de toasts
│   │   └── useUserRole.ts       # Hook de rol de usuario
│   ├── lib/                     # Librerías y utilidades
│   │   ├── schemas/             # Schemas de validación Zod
│   │   │   ├── auth.schema.ts
│   │   │   ├── experiencia.schema.ts
│   │   │   ├── inscripcion.schema.ts
│   │   │   ├── perfil.schema.ts
│   │   │   └── plan.schema.ts
│   │   ├── supabase/            # Configuración de Supabase
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── types/               # Tipos TypeScript
│   │   │   └── index.ts
│   │   ├── axios-client.ts      # Cliente Axios configurado
│   │   ├── config.ts            # Configuración de la app
│   │   ├── query-client.ts      # Cliente de TanStack Query
│   │   ├── query-keys.ts        # Keys de queries
│   │   └── utils.ts             # Utilidades generales
│   ├── providers/               # Providers globales
│   │   └── [providers]
│   ├── services/                # Servicios de API
│   │   ├── api.ts               # Configuración base de API
│   │   ├── estadisticasService.ts
│   │   ├── experienciaService.ts
│   │   ├── historiaAcademicaService.ts
│   │   ├── inscripcionService.ts
│   │   ├── materiaService.ts
│   │   ├── perfilService.ts
│   │   ├── personaService.ts
│   │   ├── planesEstudioService.ts
│   │   └── recomendacionService.ts
│   ├── stores/                  # Stores de Zustand
│   │   ├── modal-store.ts       # Store de modales
│   │   └── ui-store.ts          # Store de UI
│   ├── proxy.ts                 # Proxy de configuración
│   └── supabaseClient.ts        # Cliente de Supabase
├── docs/                        # Documentación técnica
│   ├── README.md
│   ├── 01-arquitectura.md
│   ├── 02-stack-tecnologico.md
│   └── [otros documentos]
├── .gitattributes               # Atributos de Git
├── .gitignore                   # Archivos ignorados por Git
├── components.json              # Configuración de ShadCN UI
├── next.config.js               # Configuración de Next.js
├── package.json                 # Dependencias y scripts
├── package-lock.json            # Lock de dependencias (npm)
├── postcss.config.js            # Configuración de PostCSS
├── README.md                    # Documentación principal
├── tailwind.config.ts           # Configuración de Tailwind CSS
└── tsconfig.json                # Configuración de TypeScript
```

---

## Descripción de Carpetas Principales

### 📂 `/src/app`

Contiene las rutas de la aplicación siguiendo el **App Router** de Next.js 16.

**Estructura de rutas**:
- Cada carpeta representa una ruta
- `page.tsx` define el componente de la página
- `layout.tsx` define el layout compartido
- Rutas anidadas mediante carpetas anidadas

**Módulos principales**:

#### `admin/`
Módulo completo de administración con:
- Dashboard de estadísticas
- Gestión de planes de estudio
- Analíticas por carrera
- CRUD de administradores

#### `student/`
Módulo de funcionalidades para estudiantes:
- Historia académica
- Recomendaciones de finales
- Inscripciones a mesas
- Experiencias de examen

#### `auth/`
Sistema de autenticación:
- Login
- Registro
- Reset de contraseña

---

### 📂 `/src/components`

Componentes React organizados por categoría.

#### `charts/`
Componentes de visualización de datos con Recharts:
- Gráficos de barras
- Gráficos de líneas
- Gráficos circulares

#### `layout/`
Componentes de estructura:
- `client-layout.tsx`: Layout del cliente con providers

#### `modals/`
Componentes de modales reutilizables:
- Modal de confirmación
- Modales de formularios

#### `student/`
Componentes específicos del módulo de estudiantes:
- Cards de experiencias
- Tablas de historia académica
- Cards de recomendaciones

#### `ui/`
Componentes base de UI (ShadCN):
- Botones, inputs, selects
- Cards, dialogs, dropdowns
- Toasts, tooltips
- **Totalmente personalizables**

---

### 📂 `/src/hooks`

Hooks personalizados para lógica reutilizable.

#### `domain/`
Hooks de dominio que encapsulan lógica de negocio:
- **useExperiencias**: CRUD de experiencias de examen
- **useHistoriaAcademica**: Gestión de historia académica
- **useInscripciones**: Inscripciones a mesas
- **usePlanesEstudio**: Planes de estudio
- **useRecomendaciones**: Sugerencias de finales
- **useEstadisticas***: Estadísticas varias

#### Hooks generales:
- **use-toast**: Gestión de notificaciones
- **use-mobile**: Detección de dispositivos móviles
- **useUserRole**: Gestión de roles de usuario

---

### 📂 `/src/lib`

Librerías, configuraciones y utilidades.

#### `schemas/`
Schemas de validación con Zod:
- Validación de formularios
- Type-safe data validation

#### `supabase/`
Configuración de Supabase:
- Cliente para componentes del cliente
- Cliente para componentes del servidor

#### `types/`
Tipos TypeScript compartidos:
- Interfaces de dominio
- Types de API responses

#### Archivos principales:
- **axios-client.ts**: Cliente HTTP configurado
- **config.ts**: Configuración centralizada (URLs, constantes)
- **query-client.ts**: Configuración de TanStack Query
- **query-keys.ts**: Keys organizadas para queries
- **utils.ts**: Utilidades generales (cn, formatters, etc.)

---

### 📂 `/src/services`

Servicios que encapsulan llamadas a APIs.

**Patrón Repository**: Cada servicio actúa como un repositorio.

**Servicios implementados**:
- `estadisticasService.ts`: Estadísticas y analíticas
- `experienciaService.ts`: CRUD de experiencias
- `historiaAcademicaService.ts`: Historia académica
- `inscripcionService.ts`: Inscripciones
- `materiaService.ts`: Materias
- `perfilService.ts`: Perfil de usuario
- `personaService.ts`: Datos de persona
- `planesEstudioService.ts`: Planes de estudio
- `recomendacionService.ts`: Recomendaciones

---

### 📂 `/src/stores`

Stores de Zustand para estado global del cliente.

- **modal-store.ts**: Estado de modales (abrir/cerrar, datos)
- **ui-store.ts**: Estado de UI (sidebar, preferencias)

---

### 📂 `/public`

Archivos estáticos servidos directamente.

- `favicon.ico`: Icono del sitio
- `manifest.json`: Configuración PWA
- Imágenes, logos, etc.

---

## Convenciones de Nomenclatura

### Archivos y Carpetas

- **Componentes React**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useUserData.ts`)
- **Servicios**: camelCase con sufijo `Service` (`userService.ts`)
- **Utilidades**: camelCase (`formatDate.ts`)
- **Tipos**: PascalCase (`User.ts`, `ApiResponse.ts`)
- **Constantes**: UPPER_SNAKE_CASE en archivos camelCase (`config.ts`)

### Rutas (App Router)

- **Carpetas de ruta**: kebab-case (`reset-password/`)
- **Archivos especiales**: lowercase (`page.tsx`, `layout.tsx`)

---

## Archivos de Configuración

### `next.config.js`
Configuración de Next.js:
- PWA con next-pwa
- Webpack customization
- Optimizaciones de desarrollo

### `tailwind.config.ts`
Configuración de Tailwind:
- Tema personalizado
- Colores extendidos
- Animaciones custom
- Plugins

### `tsconfig.json`
Configuración de TypeScript:
- Strict mode
- Path aliases (`@/*`)
- Compiler options

### `components.json`
Configuración de ShadCN UI:
- Ruta de componentes
- Aliases
- Tema base

### `package.json`
Metadatos del proyecto:
- Dependencias
- Scripts
- Configuración de herramientas

---

## Patrones de Organización

### 1. **Colocation**
Los archivos relacionados se mantienen cerca:
```
student/
├── experiencias/
│   ├── page.tsx          # Página
│   ├── components/       # Componentes específicos
│   └── hooks/            # Hooks específicos (si aplica)
```

### 2. **Separation of Concerns**
Separación clara entre:
- Presentación (components)
- Lógica (hooks, services)
- Estado (stores)
- Configuración (lib)

### 3. **Feature-based Structure**
Organización por features/módulos:
- `student/`: Todo lo relacionado con estudiantes
- `admin/`: Todo lo relacionado con administración

---

## Rutas de Importación

### Path Aliases Configurados

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Ejemplos de Importación

```typescript
// ✅ Correcto - usando alias
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { API_ROUTES } from '@/lib/config';

// ❌ Incorrecto - ruta relativa larga
import { Button } from '../../../components/ui/button';
```

---

## Archivos Generados (No Commitear)

- `.next/`: Build output de Next.js
- `node_modules/`: Dependencias
- `out/`: Export estático (si se usa)
- `.env.local`: Variables de entorno locales

---

**Próximo**: [Componentes →](./04-componentes.md)
