# Asistente Virtual de Soporte Académico - UNSL 🎓🚀

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)

> **Una plataforma integral para optimizar la trayectoria académica de los estudiantes del Departamento de Informática de la UNSL.**

🌐 **Sitio Web:** [asistenteestudiantil.vercel.app](https://asistenteestudiantil.vercel.app)  
🔙 **Repositorio Backend:** [github.com/JuanSr02/Asistente-Virtual-Backend](https://github.com/JuanSr02/Asistente-Virtual-Backend)

El **Asistente Virtual** es una Progressive Web App (PWA) diseñada para resolver la incertidumbre académica. Ayuda a los estudiantes a decidir qué rendir, encontrar compañeros de estudio y compartir experiencias de exámenes, todo basado en su historia académica real.

---

## ✨ Características Principales

### 👨‍🎓 Para Estudiantes
* **Sugerencias Inteligentes:** Algoritmo de recomendación que analiza tu historia académica y sugiere qué finales rendir basándose en:
    * ⛓️ Cadenas de correlativas futuras.
    * 📅 Fechas de vencimiento de regularidades.
    * 📊 Estadísticas de dificultad y aprobación.
* **Gestión de Historia Académica:** Carga y análisis automático de archivos analíticos (PDF/Excel del SIU Guaraní).
* **Experiencias de Examen:** Una base de conocimiento colaborativa donde los alumnos comparten dificultad, modalidad, recursos y tips sobre mesas finales.
* **Inscripción Social:** Sistema de inscripción *no oficial* para coordinar con otros estudiantes, ver quién rinde en la misma mesa y compartir contactos (Email/WhatsApp).
* **Estadísticas Personales:** Dashboard visual con métricas de progreso, promedios y desempeño.

### 🛠️ Para Administradores
* **Gestión de Planes de Estudio:** Carga masiva y administración de planes y materias.
* **Analíticas Globales:** Visualización de métricas generales de la facultad (tasas de aprobación, deserción, materias "filtro").
* **Estadísticas por Carrera:** Desglose detallado del rendimiento por cada plan de estudio.

---

## 🛠️ Stack Tecnológico

Este proyecto utiliza una arquitectura moderna y escalable:

### Frontend & UI
* **Framework:** [Next.js 14](https://nextjs.org/) (App Router).
* **Lenguaje:** TypeScript.
* **Estilos:** Tailwind CSS.
* **Componentes:** [ShadCN UI](https://ui.shadcn.com/) + Radix UI.
* **Iconos:** Lucide React.
* **Gráficos:** Recharts.
* **PWA:** next-pwa (Instalable en móviles y escritorio).

### Estado & Data Fetching
* **Estado Global:** Zustand (Manejo de UI y Modales).
* **Server State:** TanStack Query v5 (React Query) para caché, sincronización y actualizaciones optimistas.
* **HTTP Client:** Axios.

### Backend & Auth
* **BaaS:** [Supabase](https://supabase.com/).
* **Autenticación:** Supabase Auth (Email/Password + Google OAuth).
* **Base de Datos:** PostgreSQL.

---
## 📂 Estructura del Proyecto
### La estructura sigue las mejores prácticas de Next.js App Router:
src/
├── app/                 # Rutas y páginas (App Router)
│   ├── admin/           # Panel de administración
│   ├── auth/            # Login, Registro, Recuperar contraseña
│   ├── dashboard/       # Dashboard principal (Ruteo según rol)
│   ├── student/         # Funcionalidades de estudiante
│   └── ...
├── components/          # Componentes de UI reutilizables
│   ├── charts/          # Gráficos Recharts
│   ├── modals/          # Modales globales
│   ├── ui/              # Componentes base (ShadCN)
│   └── ...
├── hooks/               # Custom Hooks
│   └── domain/          # Lógica de negocio (usePerfil, useInscripciones, etc.)
├── lib/                 # Utilidades y configuraciones
│   ├── schemas/         # Validaciones Zod
│   ├── supabase/        # Cliente y Middleware de Supabase
│   └── ...
├── services/            # Capa de comunicación con API/Backend
└── stores/              # Estados globales con Zustand

## 🤝 Contribución
¡Las contribuciones son bienvenidas! Si deseas mejorar el Asistente Virtual:
Haz un Fork del repositorio.
Crea una rama para tu feature (git checkout -b feature/NuevaFuncionalidad).
Haz commit de tus cambios (git commit -m 'Agrega nueva funcionalidad').
Push a la rama (git push origin feature/NuevaFuncionalidad).
Abre un Pull Request.

Desarrollado con ❤️ por Juan Sánchez para la Universidad Nacional de San Luis.
