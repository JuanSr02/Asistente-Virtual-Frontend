# 📖 Glosario Técnico

## Términos Generales

### **API (Application Programming Interface)**
Interfaz que permite la comunicación entre diferentes aplicaciones o componentes de software.

### **BaaS (Backend as a Service)**
Servicio que proporciona funcionalidades backend (base de datos, autenticación, storage) sin necesidad de gestionar infraestructura.

### **CDN (Content Delivery Network)**
Red de servidores distribuidos geográficamente que entregan contenido web de forma rápida.

### **CORS (Cross-Origin Resource Sharing)**
Mecanismo que permite que recursos restringidos en una página web sean solicitados desde otro dominio.

### **JWT (JSON Web Token)**
Estándar abierto para crear tokens de acceso que permiten la autenticación y autorización.

### **OAuth**
Protocolo de autorización que permite a aplicaciones obtener acceso limitado a cuentas de usuario.

### **PWA (Progressive Web App)**
Aplicación web que utiliza capacidades modernas para ofrecer una experiencia similar a una app nativa.

### **REST (Representational State Transfer)**
Estilo arquitectónico para diseñar servicios web que utilizan HTTP.

### **SEO (Search Engine Optimization)**
Optimización para motores de búsqueda para mejorar la visibilidad en resultados de búsqueda.

### **SSR (Server-Side Rendering)**
Renderizado de páginas web en el servidor antes de enviarlas al cliente.

### **CSR (Client-Side Rendering)**
Renderizado de páginas web en el navegador del cliente usando JavaScript.

---

## Tecnologías Frontend

### **Next.js**
Framework de React para producción que incluye SSR, SSG, routing, y optimizaciones automáticas.

### **React**
Librería de JavaScript para construir interfaces de usuario basadas en componentes.

### **TypeScript**
Superset de JavaScript que añade tipado estático opcional.

### **Tailwind CSS**
Framework de CSS utility-first para construir diseños personalizados rápidamente.

### **ShadCN UI**
Colección de componentes React accesibles y personalizables construidos con Radix UI.

### **Radix UI**
Librería de componentes primitivos sin estilos para construir sistemas de diseño accesibles.

---

## Gestión de Estado

### **Zustand**
Librería minimalista de gestión de estado para React.

### **TanStack Query (React Query)**
Librería para fetching, caching y sincronización de datos del servidor.

### **Query Key**
Identificador único usado por TanStack Query para cachear y gestionar queries.

### **Mutation**
Operación que modifica datos en el servidor (POST, PUT, DELETE).

### **Optimistic Update**
Actualización de UI antes de recibir confirmación del servidor para mejorar UX.

### **Stale Time**
Tiempo que los datos se consideran "frescos" antes de necesitar refetch.

---

## Backend y APIs

### **Spring Boot**
Framework de Java para crear aplicaciones backend y microservicios.

### **Supabase**
Plataforma BaaS open-source que proporciona base de datos, autenticación y storage.

### **PostgreSQL**
Sistema de gestión de bases de datos relacional open-source.

### **Axios**
Cliente HTTP basado en promesas para navegador y Node.js.

### **Interceptor**
Función que intercepta requests/responses HTTP para modificarlos o manejar errores.

---

## Patrones y Arquitectura

### **App Router**
Nueva arquitectura de routing en Next.js 13+ basada en el sistema de archivos.

### **Server Components**
Componentes de React que se renderizan en el servidor.

### **Client Components**
Componentes de React que se renderizan en el cliente (navegador).

### **Repository Pattern**
Patrón que abstrae la lógica de acceso a datos.

### **Factory Pattern**
Patrón que crea objetos sin especificar la clase exacta.

### **Singleton Pattern**
Patrón que asegura que una clase tenga solo una instancia.

### **Observer Pattern**
Patrón donde un objeto notifica a otros objetos sobre cambios de estado.

---

## Desarrollo

### **Hot Module Replacement (HMR)**
Actualización de módulos en tiempo de ejecución sin recargar la página completa.

### **Turbopack**
Bundler incremental optimizado para JavaScript y TypeScript (sucesor de Webpack).

### **ESLint**
Herramienta de linting para identificar y reportar patrones en código JavaScript/TypeScript.

### **Prettier**
Formateador de código opinionado.

### **Husky**
Herramienta para gestionar Git hooks.

### **lint-staged**
Ejecuta linters en archivos staged de Git.

---

## Testing

### **Unit Test**
Prueba de una unidad individual de código (función, componente).

### **Integration Test**
Prueba de múltiples unidades trabajando juntas.

### **E2E Test (End-to-End)**
Prueba de flujos completos de usuario.

### **Mock**
Objeto simulado que imita el comportamiento de objetos reales.

### **Snapshot Test**
Prueba que compara el output actual con una "snapshot" guardada.

---

## Performance

### **Code Splitting**
División del código en chunks más pequeños que se cargan bajo demanda.

### **Lazy Loading**
Carga diferida de recursos hasta que sean necesarios.

### **Memoization**
Técnica de optimización que guarda resultados de operaciones costosas.

### **Tree Shaking**
Eliminación de código no utilizado del bundle final.

### **Bundle**
Archivo que contiene todo el código JavaScript compilado y empaquetado.

---

## Deployment

### **Vercel**
Plataforma de deployment optimizada para Next.js.

### **CI/CD (Continuous Integration/Continuous Deployment)**
Práctica de automatizar la integración y deployment de código.

### **Environment Variables**
Variables de configuración que cambian según el ambiente (dev, staging, prod).

### **Edge Network**
Red de servidores distribuidos globalmente para entregar contenido rápidamente.

### **Serverless Functions**
Funciones que se ejecutan en la nube sin gestionar servidores.

---

## Seguridad

### **HTTPS**
Protocolo seguro de transferencia de hipertexto.

### **Access Token**
Token que otorga acceso a recursos protegidos.

### **Refresh Token**
Token de larga duración usado para obtener nuevos access tokens.

### **RLS (Row Level Security)**
Política de seguridad a nivel de fila en bases de datos.

### **XSS (Cross-Site Scripting)**
Vulnerabilidad que permite inyectar scripts maliciosos.

### **CSRF (Cross-Site Request Forgery)**
Ataque que fuerza a usuarios a ejecutar acciones no deseadas.

---

## UI/UX

### **Responsive Design**
Diseño que se adapta a diferentes tamaños de pantalla.

### **Mobile-First**
Enfoque de diseño que prioriza dispositivos móviles.

### **Accessibility (a11y)**
Práctica de hacer aplicaciones usables para personas con discapacidades.

### **ARIA (Accessible Rich Internet Applications)**
Especificación para mejorar la accesibilidad de aplicaciones web.

### **Dark Mode**
Esquema de colores oscuro para reducir fatiga visual.

---

## Herramientas

### **Git**
Sistema de control de versiones distribuido.

### **GitHub**
Plataforma de hosting para repositorios Git.

### **VS Code**
Editor de código fuente desarrollado por Microsoft.

### **pnpm**
Gestor de paquetes rápido y eficiente para JavaScript.

### **npm**
Gestor de paquetes por defecto para Node.js.

---

## Conceptos de React

### **Hook**
Función especial que permite usar estado y otras características de React en componentes funcionales.

### **useState**
Hook para agregar estado local a componentes funcionales.

### **useEffect**
Hook para ejecutar efectos secundarios en componentes funcionales.

### **useContext**
Hook para consumir valores de contexto de React.

### **Custom Hook**
Hook personalizado que encapsula lógica reutilizable.

### **Props**
Argumentos que se pasan a componentes React.

### **State**
Datos que cambian con el tiempo en un componente.

### **Component**
Pieza reutilizable de UI en React.

### **JSX**
Extensión de sintaxis de JavaScript que permite escribir HTML en JavaScript.

---

## Conceptos de Next.js

### **Page**
Componente React que representa una ruta en la aplicación.

### **Layout**
Componente que envuelve páginas y comparte UI común.

### **Metadata**
Información sobre la página (título, descripción, etc.) para SEO.

### **Dynamic Route**
Ruta que acepta parámetros dinámicos (ej: `/user/[id]`).

### **Static Generation (SSG)**
Pre-renderizado de páginas en tiempo de build.

### **Incremental Static Regeneration (ISR)**
Actualización de páginas estáticas después del build.

---

## Términos del Dominio

### **Historia Académica**
Registro de todas las materias cursadas por un estudiante.

### **Plan de Estudio**
Conjunto de materias y requisitos para completar una carrera.

### **Correlativa**
Materia que debe aprobarse antes de cursar otra.

### **Regularidad**
Estado de una materia que permite rendir el examen final.

### **Final**
Examen final de una materia.

### **Mesa de Examen**
Instancia de evaluación final en una fecha específica.

### **Inscripción**
Registro de un estudiante para rendir un final.

### **Experiencia de Examen**
Relato de un estudiante sobre cómo fue un examen.

### **Recomendación**
Sugerencia de finales a rendir basada en algoritmos.

---

## Acrónimos Comunes

- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **DB**: Database
- **DTO**: Data Transfer Object
- **HTTP**: Hypertext Transfer Protocol
- **JSON**: JavaScript Object Notation
- **ORM**: Object-Relational Mapping
- **REST**: Representational State Transfer
- **SQL**: Structured Query Language
- **UI**: User Interface
- **UX**: User Experience
- **URL**: Uniform Resource Locator

---

## Referencias

Para más información sobre términos específicos, consultar:

- [MDN Web Docs](https://developer.mozilla.org/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Volver a**: [Índice Principal →](./README.md)
