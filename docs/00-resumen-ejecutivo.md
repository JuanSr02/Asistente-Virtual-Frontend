# 📋 Resumen Técnico Ejecutivo

## Información del Proyecto

**Nombre**: Asistente Virtual de Soporte Académico - UNSL  
**Tipo**: Progressive Web Application (PWA)  
**Autor**: Juan Sánchez  
**Institución**: Universidad Nacional de San Luis  
**Año**: 2026  
**Licencia**: MIT

**URLs**:

- 🌐 Producción: [https://asistenteestudiantil.vercel.app](https://asistenteestudiantil.vercel.app)
- 🔙 Backend: [GitHub - Backend Repository](https://github.com/JuanSr02/Asistente-Virtual-Backend)
- 💻 Frontend: [GitHub - Frontend Repository](https://github.com/JuanSr02/Asistente-Virtual-Frontend)

---

## Descripción General

El **Asistente Virtual UNSL** es una plataforma web integral diseñada para optimizar la trayectoria académica de estudiantes del Departamento de Informática. La aplicación combina algoritmos de recomendación inteligentes con un sistema colaborativo de experiencias de examen, proporcionando herramientas para:

- Tomar decisiones informadas sobre qué finales rendir
- Compartir y consultar experiencias de exámenes
- Coordinar inscripciones con otros estudiantes
- Visualizar métricas de rendimiento académico
- Gestionar planes de estudio (administradores)

---

## Arquitectura Técnica

### Stack Tecnológico Principal

```
┌─────────────────────────────────────────┐
│           FRONTEND LAYER                │
│  Next.js 16 + React 18 + TypeScript 5   │
│  Tailwind CSS + ShadCN UI + Radix UI    │
│  Zustand + TanStack Query v5            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           BACKEND LAYER                 │
│  Spring Boot (Java) + Supabase (BaaS)  │
│  PostgreSQL + JWT Authentication        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         INFRASTRUCTURE                  │
│  Vercel (Frontend) + Render (Backend)   │
│  Edge Network + Serverless Functions    │
└─────────────────────────────────────────┘
```

### Decisiones Arquitectónicas Clave

1. **Next.js 16 con App Router**: Aprovecha React Server Components para mejor rendimiento y SEO
2. **Dual Backend**: Spring Boot para lógica compleja + Supabase para auth y datos en tiempo real
3. **TanStack Query**: Gestión inteligente de cache y sincronización de datos del servidor
4. **Zustand**: Estado global del cliente simple y eficiente
5. **TypeScript Estricto**: Type safety en todo el proyecto para reducir errores

---

## Módulos Principales

### 1. Módulo de Estudiantes

**Funcionalidades**:

- ✅ Carga de historia académica (PDF/Excel del SIU Guaraní)
- ✅ Sugerencias inteligentes de finales basadas en:
  - Correlativas futuras
  - Vencimiento de regularidades
  - Estadísticas de dificultad
  - Impacto en el plan de estudios
- ✅ Inscripción social a mesas de examen
- ✅ Sistema de experiencias de examen colaborativo
- ✅ Dashboard personal con métricas

**Tecnologías**:

- Hooks personalizados con TanStack Query
- Validación con Zod
- Visualización con Recharts
- Upload de archivos con FormData

### 2. Módulo de Administración

**Funcionalidades**:

- ✅ Gestión de planes de estudio
- ✅ Analíticas globales del sistema
- ✅ Estadísticas por carrera y materia
- ✅ Gestión de administradores

**Tecnologías**:

- Protected routes con verificación de rol
- Gráficos avanzados con Recharts
- Exportación de datos

### 3. Sistema de Autenticación

**Funcionalidades**:

- ✅ Email/Password authentication
- ✅ Google OAuth 2.0
- ✅ Reset de contraseña
- ✅ Auto-refresh de tokens
- ✅ Gestión de sesiones

**Tecnologías**:

- Supabase Auth
- JWT tokens
- Axios interceptors para inyección de tokens

---

## Características Técnicas Destacadas

### Performance

- ⚡ **Lighthouse Score**: 95+ en Performance
- 🚀 **First Contentful Paint**: < 1.5s
- 📦 **Bundle Size**: Optimizado con code splitting
- 🔄 **Caching**: Estrategia inteligente con TanStack Query
- 🖼️ **Image Optimization**: Next.js Image component
- 🔤 **Font Optimization**: Google Fonts con Next.js

### Progressive Web App

- 📱 **Instalable**: Puede instalarse como app nativa
- 🔌 **Offline Support**: Service Worker para cache offline
- 🔔 **Push Notifications**: Preparado para notificaciones (futuro)
- 📲 **Responsive**: Diseño adaptable a todos los dispositivos

### Seguridad

- 🔒 **HTTPS Only**: Todas las comunicaciones encriptadas
- 🔑 **JWT Authentication**: Tokens seguros con expiración
- 🛡️ **CORS Configurado**: Restricción de orígenes
- 🔐 **Row Level Security**: Políticas en Supabase
- ✅ **Input Validation**: Validación con Zod en frontend y backend

### Accesibilidad

- ♿ **ARIA Labels**: Componentes accesibles
- ⌨️ **Keyboard Navigation**: Navegación completa por teclado
- 🎨 **Color Contrast**: WCAG AA compliant
- 🌓 **Dark Mode**: Soporte para tema oscuro

---

## Métricas del Proyecto

### Código

- **Líneas de código**: ~15,000+
- **Componentes React**: 50+
- **Hooks personalizados**: 14+
- **Servicios API**: 10+
- **Rutas**: 20+
- **Archivos TypeScript**: 100+

### Dependencias

- **Runtime**: 30+ paquetes
- **Development**: 15+ paquetes
- **Total Bundle Size**: ~500KB (gzipped)

### Calidad de Código

- **TypeScript Coverage**: 100%
- **ESLint Rules**: Configurado con reglas estrictas
- **Prettier**: Formateo automático
- **Git Hooks**: Pre-commit linting y formatting
- **Testing**: Planificado para futuras iteraciones

---

## Flujos de Datos Principales

### 1. Flujo de Recomendaciones

```
Usuario → Solicita recomendaciones
    ↓
Frontend → useRecomendaciones hook
    ↓
TanStack Query → Cache check
    ↓
Service → recomendacionService
    ↓
Axios → Request con JWT token
    ↓
Spring Boot API → Algoritmo de recomendación
    ↓
Procesa: Historia + Correlativas + Estadísticas
    ↓
Response → Lista priorizada de finales
    ↓
Cache → TanStack Query guarda en cache
    ↓
UI → Renderiza recomendaciones
```

### 2. Flujo de Autenticación

```
Usuario → Ingresa credenciales
    ↓
Login Form → Validación con Zod
    ↓
Supabase Auth → Valida credenciales
    ↓
JWT Token + Session → Guardado en localStorage
    ↓
Axios Interceptor → Inyecta token en requests
    ↓
Protected Routes → Acceso permitido
```

---

## Integración con Backend

### API Endpoints Principales

**Base URL**: `https://asistente-virtual-backend-wj8t.onrender.com`

#### Endpoints de Estudiante

- `GET /api/shared/finales/{userId}` - Materias para rendir
- `GET /api/shared/historia-academica/{userId}` - Historia académica
- `POST /api/shared/historia-academica/{userId}/cargar` - Cargar historia
- `GET /api/shared/recomendaciones/{userId}` - Recomendaciones
- `GET /api/shared/inscripciones/estudiante/{userId}` - Mis inscripciones
- `POST /api/shared/inscripciones` - Inscribirse a mesa

#### Endpoints de Experiencias

- `GET /api/shared/experiencias/por-materia/{materiaId}` - Experiencias de materia
- `GET /api/shared/experiencias/por-estudiante/{userId}` - Mis experiencias
- `POST /api/shared/experiencias` - Crear experiencia
- `PUT /api/shared/experiencias/{id}` - Actualizar experiencia
- `DELETE /api/shared/experiencias/{id}` - Eliminar experiencia

#### Endpoints de Admin

- `GET /api/shared/estadisticas/generales` - Estadísticas globales
- `GET /api/shared/estadisticas/carrera/{planId}` - Stats por carrera
- `POST /api/admin/planes-estudio/carga` - Cargar plan de estudio
- `DELETE /api/admin/planes-estudio/{id}` - Eliminar plan

---

## Deployment y DevOps

### Ambientes

1. **Development**: Local (`localhost:3000`)
2. **Preview**: Vercel preview deployments (por branch)
3. **Production**: Vercel production ([asistenteestudiantil.vercel.app](https://asistenteestudiantil.vercel.app))

### Pipeline de Deployment

```
Git Push → GitHub
    ↓
Vercel Webhook → Triggered
    ↓
Build Process:
  - Install dependencies (pnpm)
  - Type check (tsc)
  - Lint (eslint)
  - Build (next build)
    ↓
Deploy to Edge Network
    ↓
Production Live ✅
```

### Monitoreo

- **Vercel Analytics**: Métricas de uso y performance
- **Error Tracking**: Console logs y error boundaries
- **Performance Monitoring**: Core Web Vitals

---

## Roadmap Futuro

### Corto Plazo

- [ ] Implementar tests unitarios con Jest
- [ ] Implementar tests E2E con Playwright
- [ ] Mejorar cobertura de documentación de componentes
- [ ] Optimizar performance de queries

### Mediano Plazo

- [ ] Notificaciones push para recordatorios de exámenes
- [ ] Sistema de grupos de estudio
- [ ] Calendario de exámenes integrado
- [ ] Modo offline mejorado con PWA

### Largo Plazo

- [ ] Chat en tiempo real entre estudiantes
- [ ] App móvil nativa (React Native)
- [ ] IA para predicción de rendimiento
- [ ] Recomendaciones personalizadas con ML
- [ ] Integración con SIU Guaraní oficial
- [ ] Expansión a otros departamentos

---

## Conclusiones Técnicas

### Fortalezas

✅ **Arquitectura Moderna**: Stack tecnológico actualizado y probado  
✅ **Type Safety**: TypeScript reduce errores en producción  
✅ **Performance**: Optimizaciones avanzadas implementadas  
✅ **Escalabilidad**: Diseño modular y separación de concerns  
✅ **Developer Experience**: Herramientas y convenciones claras  
✅ **User Experience**: UI intuitiva y responsive

### Áreas de Mejora

⚠️ **Testing**: No implementado actualmente - prioridad para próximas iteraciones  
⚠️ **Monitoring**: Sistema de monitoreo básico - puede expandirse con herramientas avanzadas  
⚠️ **Offline**: Funcionalidad PWA básica - puede mejorarse el soporte offline  
⚠️ **Documentación de Componentes**: Algunos componentes necesitan documentación más detallada

---

## Contacto y Soporte

**Desarrollador**: Juan Sánchez  
**Email**: juanma2002123@gmail.com  
**GitHub**: [@JuanSr02](https://github.com/JuanSr02)  
**Universidad**: Universidad Nacional de San Luis

---

## Licencia

Este proyecto está bajo la licencia **MIT**.

---

**Documentación completa**: Ver [docs/README.md](./README.md)

**Última actualización**: Febrero 2026
