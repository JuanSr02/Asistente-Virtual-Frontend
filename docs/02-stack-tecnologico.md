# 🛠️ Stack Tecnológico

## Resumen del Stack

El proyecto utiliza tecnologías modernas y probadas en producción para garantizar rendimiento, escalabilidad y mantenibilidad.

```
Frontend: Next.js 16 + TypeScript + Tailwind CSS
Backend: Spring Boot (Java) + Supabase (BaaS)
Estado: Zustand + TanStack Query v5
UI: ShadCN UI + Radix UI
Deployment: Vercel + Render
```

---

## 🎨 Frontend

### Core Framework

#### **Next.js 16.1.6**
- **Versión**: 16.1.6
- **Características utilizadas**:
  - App Router (nueva arquitectura)
  - React Server Components
  - Server Actions
  - Image Optimization
  - Font Optimization
  - Turbopack (dev bundler)
- **Configuración**: `next.config.js`

#### **React 18.3.1**
- **Características**:
  - Concurrent Rendering
  - Automatic Batching
  - Suspense
  - Server Components
- **React DOM**: 18.3.1

#### **TypeScript 5.8.3**
- **Configuración estricta**: `tsconfig.json`
- **Características**:
  - Type checking completo
  - Strict mode habilitado
  - Path aliases configurados (`@/*`)

---

### Estilos y UI

#### **Tailwind CSS 3.4.17**
- **Plugins**:
  - `tailwindcss-animate`: Animaciones predefinidas
  - `@tailwindcss/container-queries`: Container queries
- **Configuración personalizada**:
  - Sistema de colores extendido
  - Animaciones custom
  - Gradientes personalizados
  - Shadows y spacing custom

#### **ShadCN UI**
- **Componentes utilizados**:
  - Button, Card, Dialog, Dropdown
  - Input, Label, Select, Checkbox
  - Toast, Tooltip, Alert Dialog
- **Características**:
  - Componentes accesibles (ARIA)
  - Totalmente personalizables
  - Copy-paste friendly

#### **Radix UI**
- **Primitivos utilizados**:
  - `@radix-ui/react-alert-dialog`: ^1.1.14
  - `@radix-ui/react-checkbox`: ^1.3.2
  - `@radix-ui/react-dropdown-menu`: ^2.1.15
  - `@radix-ui/react-label`: ^2.1.7
  - `@radix-ui/react-select`: ^2.2.5
  - `@radix-ui/react-slot`: ^1.2.4
  - `@radix-ui/react-toast`: ^1.2.14
  - `@radix-ui/react-tooltip`: ^1.2.7

#### **Lucide React 0.454.0**
- **Iconos**: Librería de iconos moderna y ligera
- **Uso**: Más de 100 iconos utilizados en el proyecto

#### **Google Fonts - Inter**
- **Fuente principal**: Inter
- **Optimización**: Next.js Font Optimization

---

### Estado y Data Fetching

#### **Zustand 5.0.9**
- **Uso**: Estado global del cliente
- **Stores implementados**:
  - `modal-store.ts`: Gestión de modales
  - `ui-store.ts`: Estado de UI (sidebar, theme)
- **Características**:
  - API simple y minimalista
  - No requiere providers
  - Middleware support
  - DevTools integration

#### **TanStack Query 5.90.11**
- **Uso**: Server state management
- **Características utilizadas**:
  - Query caching
  - Automatic refetching
  - Optimistic updates
  - Infinite queries
  - Mutations
- **DevTools**: `@tanstack/react-query-devtools` ^5.91.1

---

### HTTP Client y API

#### **Axios 1.10.0**
- **Configuración**: `src/lib/axios-client.ts`
- **Interceptors**:
  - Request: Inyección automática de JWT token
  - Response: Manejo global de errores
- **Base URL**: Configurada en `src/lib/config.ts`

---

### Autenticación

#### **Supabase**
- **Paquetes**:
  - `@supabase/supabase-js`: ^2.50.0
  - `@supabase/ssr`: ^0.8.0
- **Características utilizadas**:
  - Email/Password authentication
  - Google OAuth
  - Session management
  - Auto token refresh
  - PostgreSQL database
  - Storage (opcional)

---

### Validación

#### **Zod 4.1.13**
- **Uso**: Validación de schemas y tipos
- **Ubicación**: `src/lib/schemas/`
- **Características**:
  - Type-safe validation
  - Runtime type checking
  - Schema composition
  - Error messages personalizados

---

### Utilidades

#### **class-variance-authority 0.7.1**
- **Uso**: Gestión de variantes de componentes
- **Ejemplo**: Variantes de botones, cards, etc.

#### **clsx 2.1.1**
- **Uso**: Composición condicional de clases CSS

#### **tailwind-merge 2.6.0**
- **Uso**: Merge inteligente de clases Tailwind
- **Función**: `cn()` utility en `src/lib/utils.ts`

#### **input-otp 1.4.2**
- **Uso**: Componente de input OTP
- **Características**: Accesible y personalizable

---

### Gráficos y Visualización

#### **Recharts 2.15.4**
- **Uso**: Gráficos y visualizaciones de datos
- **Componentes utilizados**:
  - BarChart
  - LineChart
  - PieChart
  - AreaChart
- **Ubicación**: `src/components/charts/`

---

### PWA

#### **next-pwa 5.6.0**
- **Configuración**: `next.config.js`
- **Características**:
  - Service Worker automático
  - Offline support
  - App manifest
  - Install prompt
- **Deshabilitado en desarrollo**

---

### Temas

#### **next-themes 0.4.6**
- **Uso**: Sistema de temas (light/dark)
- **Características**:
  - Persistencia automática
  - Sin flash de contenido
  - System preference detection

---

### Notificaciones

#### **Sonner 1.7.4**
- **Uso**: Toast notifications elegantes
- **Características**:
  - Animaciones suaves
  - Stacking automático
  - Personalizable

---

### Analytics

#### **@vercel/analytics 1.6.1**
- **Uso**: Analytics de Vercel
- **Métricas**:
  - Page views
  - User interactions
  - Performance metrics

---

## 🔧 Herramientas de Desarrollo

### Linting y Formatting

#### **ESLint 9.29.0**
- **Configuración**: `eslint.config.js`
- **Plugins**:
  - `@typescript-eslint/eslint-plugin`: ^8.35.0
  - `@typescript-eslint/parser`: ^8.35.0
  - `eslint-config-next`: ^15.3.4
  - `eslint-config-prettier`: ^10.1.5
  - `eslint-plugin-prettier`: ^5.5.1

#### **Prettier 3.6.0**
- **Plugins**:
  - `prettier-plugin-tailwindcss`: ^0.6.13
- **Configuración**: `.prettierrc`

---

### Build Tools

#### **PostCSS 8.5.6**
- **Plugins**:
  - `autoprefixer`: ^10.4.21
  - `cssnano`: ^7.0.7 (minificación CSS)

#### **@next/bundle-analyzer 15.3.4**
- **Uso**: Análisis de tamaño de bundles
- **Script**: `pnpm analyze`

---

### Git Hooks

#### **Husky 9.1.7**
- **Hooks configurados**:
  - Pre-commit: Lint y format

#### **lint-staged 15.5.2**
- **Configuración**: `package.json`
- **Acciones**:
  - Prettier en archivos modificados
  - ESLint fix en archivos JS/TS

---

## 🗄️ Backend

### API Principal

#### **Spring Boot (Java)**
- **Repositorio**: [Asistente-Virtual-Backend](https://github.com/JuanSr02/Asistente-Virtual-Backend)
- **URL**: `https://asistente-virtual-backend-wj8t.onrender.com`
- **Funcionalidades**:
  - Algoritmos de recomendación
  - Procesamiento de historias académicas
  - Estadísticas y analíticas
  - CRUD de planes de estudio

### BaaS (Backend as a Service)

#### **Supabase**
- **Servicios utilizados**:
  - Authentication (Email + Google OAuth)
  - PostgreSQL Database
  - Storage (opcional)
  - Real-time subscriptions (futuro)

---

## 🚀 Deployment y Hosting

### **Vercel**
- **Frontend hosting**
- **Características**:
  - Edge Network (CDN global)
  - Automatic HTTPS
  - Preview deployments
  - Analytics integrado
  - Serverless Functions

### **Render**
- **Backend hosting** (Spring Boot)
- **Características**:
  - Auto-deploy desde GitHub
  - Health checks
  - Logs centralizados

---

## 📦 Gestión de Paquetes

### **pnpm 8.0.0+**
- **Razones de elección**:
  - Más rápido que npm/yarn
  - Ahorro de espacio en disco
  - Strict dependency resolution
  - Monorepo support

---

## 🌐 Navegadores Soportados

### Producción
```
> 0.3%
not ie 11
not dead
not op_mini all
```

### Desarrollo
```
last 1 chrome version
last 1 firefox version
last 1 safari version
```

---

## 📊 Comparativa de Versiones

| Tecnología | Versión Actual | Última Estable | Estado |
|-----------|----------------|----------------|--------|
| Next.js | 16.1.6 | 16.x | ✅ Actualizado |
| React | 18.3.1 | 18.3.x | ✅ Actualizado |
| TypeScript | 5.8.3 | 5.8.x | ✅ Actualizado |
| Tailwind | 3.4.17 | 3.4.x | ✅ Actualizado |
| TanStack Query | 5.90.11 | 5.x | ✅ Actualizado |
| Zustand | 5.0.9 | 5.x | ✅ Actualizado |

---

## 🔄 Dependencias Críticas

### Runtime Dependencies (Top 10)

1. **next**: Framework principal
2. **react** + **react-dom**: Librería UI
3. **@supabase/supabase-js**: Autenticación y DB
4. **@tanstack/react-query**: Server state
5. **axios**: HTTP client
6. **zustand**: Client state
7. **zod**: Validación
8. **tailwindcss**: Estilos
9. **lucide-react**: Iconos
10. **recharts**: Gráficos

---

**Próximo**: [Estructura del Proyecto →](./03-estructura-proyecto.md)
