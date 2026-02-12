# 📚 Documentación Técnica - Asistente Virtual UNSL

## 📋 Índice de Documentación

Esta carpeta contiene la documentación técnica completa del proyecto **Asistente Virtual de Soporte Académico** para la Universidad Nacional de San Luis (UNSL).

### 📂 Estructura de la Documentación

1. **[Arquitectura del Sistema](./01-arquitectura.md)** - Visión general de la arquitectura, patrones y decisiones de diseño
2. **[Stack Tecnológico](./02-stack-tecnologico.md)** - Tecnologías, librerías y herramientas utilizadas
3. **[Estructura del Proyecto](./03-estructura-proyecto.md)** - Organización de carpetas y archivos
4. **[Componentes](./04-componentes.md)** - Documentación de componentes React y UI
5. **[Servicios y API](./05-servicios-api.md)** - Integración con backend y servicios externos
6. **[Estado Global](./06-estado-global.md)** - Gestión de estado con Zustand y TanStack Query
7. **[Autenticación y Autorización](./07-autenticacion.md)** - Sistema de auth con Supabase
8. **[Rutas y Navegación](./08-rutas-navegacion.md)** - Estructura de rutas y protección
9. **[Hooks Personalizados](./09-hooks.md)** - Hooks reutilizables del proyecto
10. **[Configuración y Deployment](./10-configuracion-deployment.md)** - Variables de entorno y despliegue
11. **[Diagramas](./11-diagramas.md)** - Diagramas de arquitectura, flujo y componentes
12. **[Guía de Desarrollo](./12-guia-desarrollo.md)** - Mejores prácticas y convenciones
13. **[Testing y Calidad](./13-testing-calidad.md)** - Herramientas de calidad y guía de testing (futuro)
14. **[Performance y Optimización](./14-performance.md)** - Técnicas de optimización implementadas
15. **[Troubleshooting](./15-troubleshooting.md)** - Solución de problemas comunes

---

## 🎯 Resumen Ejecutivo

### Descripción del Proyecto

El **Asistente Virtual** es una Progressive Web Application (PWA) diseñada para optimizar la trayectoria académica de los estudiantes del Departamento de Informática de la UNSL. La plataforma ofrece:

- ✅ **Sugerencias inteligentes** de finales basadas en algoritmos de recomendación
- 📊 **Dashboard personalizado** con métricas de rendimiento académico
- 📝 **Sistema colaborativo** de experiencias de examen
- 👥 **Inscripción social** para coordinar mesas de examen
- 📈 **Analíticas avanzadas** para administradores

### Tecnologías Principales

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Spring Boot (Java) + Supabase (BaaS)
- **Estado**: Zustand + TanStack Query v5
- **UI**: ShadCN UI + Radix UI
- **Deployment**: Vercel

### Enlaces Importantes

- 🌐 **Aplicación en Producción**: [https://asistenteestudiantil.vercel.app](https://asistenteestudiantil.vercel.app)
- 🔙 **Backend Repository**: [GitHub - Asistente-Virtual-Backend](https://github.com/JuanSr02/Asistente-Virtual-Backend)
- 📦 **Frontend Repository**: [GitHub - Asistente-Virtual-Frontend](https://github.com/JuanSr02/Asistente-Virtual-Frontend)

---

## 🚀 Quick Start

### Prerequisitos

```bash
Node.js >= 18.17.0
pnpm >= 8.0.0
```

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JuanSr02/Asistente-Virtual-Frontend.git

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
pnpm dev
```

### Scripts Disponibles

```bash
pnpm dev          # Modo desarrollo con Turbopack
pnpm dev:legacy   # Modo desarrollo sin Turbopack
pnpm build        # Build de producción
pnpm start        # Servidor de producción
pnpm lint         # Ejecutar linter
pnpm lint:fix     # Corregir errores de linting
pnpm type-check   # Verificar tipos TypeScript
pnpm format       # Formatear código con Prettier
```

---

## 👥 Roles de Usuario

### 🎓 Estudiante

- Gestión de historia académica
- Sugerencias de finales
- Inscripción a mesas de examen
- Compartir experiencias de examen
- Dashboard personal

### 🛠️ Administrador

- Gestión de planes de estudio
- Analíticas globales
- Estadísticas por carrera
- Administración de usuarios

---

## 📊 Métricas del Proyecto

- **Líneas de código**: ~15,000+
- **Componentes React**: 50+
- **Hooks personalizados**: 14+
- **Servicios API**: 10+
- **Rutas protegidas**: 15+
- **Dependencias**: 30+

---

## 🤝 Contribución

Para contribuir al proyecto, consulta la [Guía de Desarrollo](./12-guia-desarrollo.md) que incluye:

- Convenciones de código
- Flujo de trabajo con Git
- Estándares de commits
- Proceso de revisión de código

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## ✍️ Autor

**Juan Sánchez**  
📧 juanma2002123@gmail.com  
🎓 Universidad Nacional de San Luis

---

**Última actualización**: Febrero 2026
