---

# Asistente Virtual de Soporte Académico - UNSL 🎓🚀

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge\&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge\&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge\&logo=supabase)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Java-brightgreen?style=for-the-badge\&logo=springboot)

> **Plataforma integral para optimizar la trayectoria académica de los estudiantes del Departamento de Informática de la UNSL.**

🌐 **Sitio Web:** [https://asistenteestudiantil.vercel.app](https://asistenteestudiantil.vercel.app)
🔙 **Backend Java (API REST):** [https://github.com/JuanSr02/Asistente-Virtual-Backend](https://github.com/JuanSr02/Asistente-Virtual-Backend)
🗄️ **BaaS Secundario:** Supabase (DB + Auth)

El **Asistente Virtual** es una PWA diseñada para reducir la incertidumbre académica. Brinda sugerencias de finales, conecta estudiantes y centraliza experiencias de examen basándose en datos reales.

---

## ✨ Características Principales

### 👨‍🎓 Funcionalidades para Estudiantes

- **Sugerencias Inteligentes:** Algoritmo que analiza historia académica real considerando:
  - Correlativas futuras.
  - Vencimiento de regularidades.
  - Estadísticas de dificultad y aprobación.

- **Procesamiento de Analíticos:** Carga automática de archivos PDF/Excel del SIU Guaraní.
- **Experiencias de Examen:** Sistema colaborativo con modalidad, dificultad, recursos y tips.
- **Inscripción Social (no oficial):** Permite coordinar mesas, ver quién rinde y compartir contacto.
- **Dashboard Personal:** Métricas visuales de rendimiento y progreso.

### 🛠️ Funciones para Administradores

- Gestión integral de **planes de estudio** y materias.
- Analíticas globales: tasas de aprobación, deserción y materias críticas.
- Estadísticas detalladas por carrera.

---

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 16 (App Router)**
- **TypeScript**
- **Tailwind CSS + ShadCN UI + Radix UI**
- **Zustand** (estado global)
- **TanStack Query v5** (caché y server state)
- **Recharts**, Lucide React
- **PWA** via next-pwa
- **Axios** como cliente HTTP

### Backend

#### 🔧 API Principal (Custom Backend)

- **Java Spring Boot**
- **API REST propia** alojada en el repo:
  [https://github.com/JuanSr02/Asistente-Virtual-Backend](https://github.com/JuanSr02/Asistente-Virtual-Backend)
- Procesa lógica avanzada:
  - Parsing del historial académico.
  - Algoritmos de recomendación.
  - Endpoints optimizados para análisis y estadísticas.

#### 🗄️ BaaS de Soporte

- **Supabase**
  - Autenticación (Email/Password + Google OAuth)
  - Base de Datos PostgreSQL
  - Storage opcional

---

## 🤝 Contribución

1. Hacé Fork del repositorio.
2. Creá una rama: `git checkout -b feature/NuevaFuncionalidad`.
3. Commit: `git commit -m "Agrega nueva funcionalidad"`.
4. Push: `git push origin feature/NuevaFuncionalidad`.
5. Abrí un Pull Request.

Desarrollado con ❤️ por Juan Sánchez para la Universidad Nacional de San Luis.
