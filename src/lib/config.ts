// 🌐 API
//export const API_BASE_URL = "http://localhost:8080";
export const API_BASE_URL =
  "https://asistente-virtual-backend-wj8t.onrender.com";

export const API_ROUTES = {
  ADMIN: {
    CARGAR_PLAN: "/api/admin/planes-estudio/carga",
    ELIMINAR_PLAN: "/api/admin/planes-estudio",
    ACTUALIZAR_ADMINISTRADOR: "/api/admin/administradores",
    ELIMINAR_ADMINISTRADOR: "/api/admin/administradores",
  },
  SHARED: {
    ESTADISTICAS_GENERALES: "/api/shared/estadisticas/generales",
    ESTADISTICAS_MATERIA: "/api/shared/estadisticas/materia",
    ESTADISTICAS_GENERALES_RAPIDO: "/api/shared/fast/estadisticas/generales",
    ESTADISTICAS_MATERIA_RAPIDO: "/api/shared/fast/estadisticas/materia",
    MATERIAS_POR_PLAN: "/api/shared/planes-estudio/materias",
    PLANES_ESTUDIO: "/api/shared/planes-estudio",
    EXPERIENCIAS: "/api/shared/experiencias",
    EXPERIENCIAS_POR_MATERIA: "/api/shared/experiencias/por-materia",
    EXPERIENCIAS_POR_ESTUDIANTE: "/api/shared/experiencias/por-estudiante",
    EXAMENES_POR_ESTUDIANTE: "/api/shared/experiencias/examenes-por-estudiante",
    ACTUALIZAR_ESTUDIANTE: "/api/shared/estudiantes",
    ELIMINAR_ESTUDIANTE: "/api/shared/estudiantes",
  },
  ESTUDIANTE: {
    FINALES_PARA_RENDIR: "/api/shared/finales",
    HISTORIA_ACADEMICA: "/api/shared/historia-academica",
  },
};

// ⚙️ Axios
export const AXIOS_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
};

// ⚙️ App config
export const APP_CONFIG = {
  NAME: "Asistente Virtual - Sistema Académico",
  PAGINATION_SIZE: 10,
  FILES: {
    ALLOWED_TYPES: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    ALLOWED_EXTENSIONS: [".xls", ".xlsx", ".pdf"],
  },
};
