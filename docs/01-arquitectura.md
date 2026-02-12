# 🏗️ Arquitectura del Sistema

## Visión General

El **Asistente Virtual UNSL** está construido siguiendo una arquitectura moderna de aplicación web con separación clara entre frontend y backend, utilizando servicios BaaS (Backend as a Service) para funcionalidades específicas.

## Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Next.js 16 App (PWA)                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   Pages/     │  │  Components  │  │    Hooks     │ │    │
│  │  │   Routes     │  │   (React)    │  │  (Custom)    │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   Zustand    │  │  TanStack    │  │   Axios      │ │    │
│  │  │   (State)    │  │   Query      │  │  (HTTP)      │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                            │
│                                                                  │
│  ┌─────────────────────────┐      ┌──────────────────────────┐ │
│  │   Spring Boot API       │      │   Supabase (BaaS)        │ │
│  │   (Java Backend)        │      │                          │ │
│  │                         │      │  ┌────────────────────┐  │ │
│  │  ┌──────────────────┐   │      │  │  Authentication    │  │ │
│  │  │  Controllers     │   │      │  │  (Email + OAuth)   │  │ │
│  │  └──────────────────┘   │      │  └────────────────────┘  │ │
│  │  ┌──────────────────┐   │      │                          │ │
│  │  │  Services        │   │      │  ┌────────────────────┐  │ │
│  │  │  (Business Logic)│   │      │  │  PostgreSQL DB     │  │ │
│  │  └──────────────────┘   │      │  │  (User Data)       │  │ │
│  │  ┌──────────────────┐   │      │  └────────────────────┘  │ │
│  │  │  Repositories    │   │      │                          │ │
│  │  └──────────────────┘   │      │  ┌────────────────────┐  │ │
│  │  ┌──────────────────┐   │      │  │  Storage           │  │ │
│  │  │  Database        │   │      │  │  (Files)           │  │ │
│  │  │  (PostgreSQL)    │   │      │  └────────────────────┘  │ │
│  │  └──────────────────┘   │      │                          │ │
│  └─────────────────────────┘      └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Patrones de Arquitectura

### 1. **Arquitectura de Capas (Layered Architecture)**

El frontend está organizado en capas claramente definidas:

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │  ← Componentes React, páginas
├─────────────────────────────────────┤
│     Application Layer (Logic)       │  ← Hooks personalizados, stores
├─────────────────────────────────────┤
│     Service Layer (API)             │  ← Servicios, axios client
├─────────────────────────────────────┤
│     Infrastructure Layer            │  ← Config, utils, types
└─────────────────────────────────────┘
```

### 2. **Server-Side Rendering (SSR) + Client-Side Rendering (CSR)**

- **App Router de Next.js 16**: Utiliza el nuevo paradigma de React Server Components
- **Componentes del Servidor**: Para contenido estático y SEO
- **Componentes del Cliente**: Para interactividad y estado

### 3. **Progressive Web App (PWA)**

- **Service Worker**: Cacheo offline y actualizaciones en segundo plano
- **Manifest**: Instalación en dispositivos móviles
- **Optimización**: Carga rápida y experiencia nativa

### 4. **Micro-Frontend Pattern (Modular)**

Cada módulo funcional está encapsulado:

```
src/
├── app/
│   ├── student/        # Módulo de estudiantes
│   ├── admin/          # Módulo de administración
│   └── auth/           # Módulo de autenticación
├── components/
│   ├── student/        # Componentes específicos de estudiantes
│   ├── shared/         # Componentes compartidos
│   └── ui/             # Componentes de UI base
```

## Flujo de Datos

### Flujo de Autenticación

```
Usuario → Login Form → Supabase Auth → JWT Token → Axios Interceptor → API Requests
                                            ↓
                                    Session Storage
                                            ↓
                                    Auto-refresh Token
```

### Flujo de Datos de Aplicación

```
1. Usuario interactúa con UI
         ↓
2. Componente dispara hook personalizado (useQuery/useMutation)
         ↓
3. Hook llama al servicio correspondiente
         ↓
4. Servicio usa axios client con token inyectado
         ↓
5. Request al backend (Spring Boot o Supabase)
         ↓
6. Response procesada por TanStack Query
         ↓
7. Cache actualizado automáticamente
         ↓
8. UI se re-renderiza con nuevos datos
```

## Decisiones de Arquitectura Clave

### 1. **Next.js 16 con App Router**

**Razón**:

- Mejor rendimiento con React Server Components
- Routing basado en sistema de archivos
- Optimización automática de imágenes y fuentes
- SEO mejorado out-of-the-box

### 2. **Dual Backend (Spring Boot + Supabase)**

**Razón**:

- **Spring Boot**: Lógica de negocio compleja (algoritmos de recomendación, procesamiento de datos académicos)
- **Supabase**: Autenticación robusta, base de datos en tiempo real, storage

### 3. **TanStack Query para Server State**

**Razón**:

- Cache inteligente y automático
- Sincronización de datos en segundo plano
- Optimistic updates
- Invalidación automática de queries

### 4. **Zustand para Client State**

**Razón**:

- API simple y minimalista
- No requiere providers
- Excelente rendimiento
- TypeScript first-class support

### 5. **TypeScript Estricto**

**Razón**:

- Type safety en todo el proyecto
- Mejor experiencia de desarrollo (IntelliSense)
- Detección temprana de errores
- Refactoring más seguro

## Patrones de Diseño Implementados

### 1. **Repository Pattern**

Los servicios actúan como repositorios que abstraen la lógica de acceso a datos:

```typescript
// Ejemplo: historiaAcademicaService.ts
export const historiaAcademicaService = {
  obtenerHistoria: async (userId: string) => {
    /* ... */
  },
  cargarHistoria: async (userId: string, file: File) => {
    /* ... */
  },
  // ...
};
```

### 2. **Factory Pattern**

Axios client configurado como factory:

```typescript
// axios-client.ts
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  ...AXIOS_CONFIG,
});
```

### 3. **Observer Pattern**

TanStack Query implementa el patrón observer para sincronización de datos:

```typescript
// Los componentes "observan" las queries
const { data } = useQuery({
  queryKey: ["estudiante", userId],
  queryFn: () => fetchEstudiante(userId),
});
```

### 4. **Singleton Pattern**

Stores de Zustand son singletons:

```typescript
// modal-store.ts
export const useModalStore = create<ModalStore>((set) => ({
  // Estado global único
}));
```

### 5. **Composition Pattern**

Componentes altamente componibles:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

## Seguridad

### Medidas Implementadas

1. **Autenticación JWT**: Tokens seguros con Supabase
2. **HTTPS Only**: Todas las comunicaciones encriptadas
3. **CORS Configurado**: Restricción de orígenes permitidos
4. **Sanitización de Inputs**: Validación con Zod
5. **Protected Routes**: Middleware de autenticación en rutas sensibles
6. **Token Refresh Automático**: Renovación transparente de sesiones

## Escalabilidad

### Estrategias Implementadas

1. **Code Splitting**: Carga bajo demanda de componentes
2. **Image Optimization**: Next.js Image component
3. **API Caching**: TanStack Query cache layer
4. **CDN**: Vercel Edge Network
5. **Lazy Loading**: Componentes y rutas cargados dinámicamente
6. **Memoization**: React.memo y useMemo para optimización

## Monitoreo y Analytics

- **Vercel Analytics**: Métricas de rendimiento y uso
- **Console Logging**: Desarrollo y debugging
- **Error Boundaries**: Captura de errores en producción

---

**Próximo**: [Stack Tecnológico →](./02-stack-tecnologico.md)
