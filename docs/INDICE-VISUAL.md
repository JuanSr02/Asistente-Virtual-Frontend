# 📚 Índice Visual de Documentación

## Mapa de Navegación

```
📁 Documentación Técnica - Asistente Virtual UNSL
│
├─ 📄 README.md
│   └─ Índice principal y guía de inicio
│
├─ 📊 00-resumen-ejecutivo.md
│   ├─ Información del proyecto
│   ├─ Arquitectura técnica
│   ├─ Módulos principales
│   ├─ Métricas del proyecto
│   └─ Roadmap futuro
│
├─ 🏗️ 01-arquitectura.md
│   ├─ Visión general
│   ├─ Diagrama de arquitectura
│   ├─ Patrones de diseño
│   ├─ Flujo de datos
│   └─ Decisiones arquitectónicas
│
├─ 🛠️ 02-stack-tecnologico.md
│   ├─ Frontend (Next.js, React, TypeScript)
│   ├─ Estilos y UI (Tailwind, ShadCN)
│   ├─ Estado (Zustand, TanStack Query)
│   ├─ Backend (Spring Boot, Supabase)
│   └─ Herramientas de desarrollo
│
├─ 📁 03-estructura-proyecto.md
│   ├─ Árbol de directorios
│   ├─ Descripción de carpetas
│   ├─ Convenciones de nomenclatura
│   └─ Patrones de organización
│
├─ 🔌 05-servicios-api.md
│   ├─ Cliente HTTP (Axios)
│   ├─ Servicios implementados
│   ├─ Tipos TypeScript
│   ├─ Manejo de errores
│   └─ Testing de servicios
│
├─ 🔐 07-autenticacion.md
│   ├─ Arquitectura de auth
│   ├─ Métodos soportados
│   ├─ Flujos de autenticación
│   ├─ Sistema de roles
│   └─ Protección de rutas
│
├─ ⚙️ 10-configuracion-deployment.md
│   ├─ Variables de entorno
│   ├─ Configuración local
│   ├─ Deployment en Vercel
│   ├─ Build de producción
│   └─ CI/CD
│
├─ 📊 11-diagramas.md
│   ├─ Diagrama de arquitectura general
│   ├─ Flujo de autenticación
│   ├─ Flujo de datos con TanStack Query
│   ├─ Estructura de rutas
│   ├─ Sistema de recomendaciones
│   └─ Gestión de estado global
│
├─ 🎯 12-guia-desarrollo.md
│   ├─ Setup inicial
│   ├─ Convenciones de código
│   ├─ Flujo de trabajo con Git
│   ├─ Testing
│   └─ Debugging
│
└─ 📖 16-glosario.md
    ├─ Términos generales
    ├─ Tecnologías frontend
    ├─ Gestión de estado
    ├─ Backend y APIs
    ├─ Patrones y arquitectura
    └─ Términos del dominio
```

---

## Guía de Lectura Recomendada

### Para Nuevos Desarrolladores

1. **Inicio Rápido**:
   - 📄 README.md
   - 📊 00-resumen-ejecutivo.md
   - 🎯 12-guia-desarrollo.md

2. **Comprensión del Proyecto**:
   - 🏗️ 01-arquitectura.md
   - 🛠️ 02-stack-tecnologico.md
   - 📁 03-estructura-proyecto.md

3. **Desarrollo Práctico**:
   - 🔌 05-servicios-api.md
   - 🔐 07-autenticacion.md
   - 📊 11-diagramas.md

### Para Arquitectos/Tech Leads

1. **Visión Técnica**:
   - 📊 00-resumen-ejecutivo.md
   - 🏗️ 01-arquitectura.md
   - 📊 11-diagramas.md

2. **Decisiones Técnicas**:
   - 🛠️ 02-stack-tecnologico.md
   - ⚙️ 10-configuracion-deployment.md

### Para DevOps/Deployment

1. **Configuración**:
   - ⚙️ 10-configuracion-deployment.md
   - 🛠️ 02-stack-tecnologico.md

2. **Monitoreo**:
   - 📊 00-resumen-ejecutivo.md (sección de métricas)

### Para QA/Testing

1. **Testing**:
   - 🎯 12-guia-desarrollo.md (sección de testing)
   - 🔌 05-servicios-api.md (testing de servicios)

---

## Documentos por Categoría

### 📋 Información General

- README.md
- 00-resumen-ejecutivo.md
- 16-glosario.md

### 🏗️ Arquitectura y Diseño

- 01-arquitectura.md
- 02-stack-tecnologico.md
- 03-estructura-proyecto.md
- 11-diagramas.md

### 💻 Desarrollo

- 05-servicios-api.md
- 07-autenticacion.md
- 12-guia-desarrollo.md

### 🚀 Deployment y Configuración

- 10-configuracion-deployment.md

---

## Búsqueda Rápida

### ¿Cómo hacer...?

| Tarea                             | Documento                      |
| --------------------------------- | ------------------------------ |
| Configurar el proyecto localmente | 12-guia-desarrollo.md          |
| Agregar un nuevo servicio API     | 05-servicios-api.md            |
| Implementar autenticación         | 07-autenticacion.md            |
| Crear un componente               | 12-guia-desarrollo.md          |
| Hacer deploy a producción         | 10-configuracion-deployment.md |
| Entender la arquitectura          | 01-arquitectura.md             |
| Ver diagramas del sistema         | 11-diagramas.md                |
| Buscar un término técnico         | 16-glosario.md                 |

### ¿Dónde está...?

| Información             | Documento                      |
| ----------------------- | ------------------------------ |
| Variables de entorno    | 10-configuracion-deployment.md |
| Estructura de carpetas  | 03-estructura-proyecto.md      |
| Lista de dependencias   | 02-stack-tecnologico.md        |
| Endpoints de API        | 05-servicios-api.md            |
| Flujos de autenticación | 07-autenticacion.md            |
| Convenciones de código  | 12-guia-desarrollo.md          |
| Métricas del proyecto   | 00-resumen-ejecutivo.md        |

---

## Estadísticas de Documentación

- **Total de documentos**: 11
- **Páginas totales**: ~120+ páginas (estimado)
- **Diagramas**: 13+ diagramas Mermaid
- **Ejemplos de código**: 100+
- **Última actualización**: Febrero 2026

---

## Contribuir a la Documentación

### Agregar Nueva Documentación

1. Crear archivo en formato Markdown
2. Seguir la nomenclatura: `##-nombre-documento.md`
3. Agregar al índice en README.md
4. Actualizar este índice visual

### Actualizar Documentación Existente

1. Editar el archivo correspondiente
2. Actualizar fecha de "Última actualización"
3. Crear commit con mensaje descriptivo

### Reportar Errores

Si encuentras errores en la documentación:

1. Crear issue en GitHub
2. Etiquetar como "documentation"
3. Describir el error y la ubicación

---

## Formato de Documentos

Todos los documentos siguen este formato:

```markdown
# 🎯 Título del Documento

## Sección 1

Contenido...

## Sección 2

Contenido...

---

**Próximo**: [Siguiente Documento →](./siguiente.md)
```

---

## Recursos Adicionales

- 📚 [Documentación de Next.js](https://nextjs.org/docs)
- 📚 [Documentación de React](https://react.dev)
- 📚 [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- 📚 [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

---

**Volver a**: [README Principal →](./README.md)
