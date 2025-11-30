// 🌐 API
export const API_BASE_URL =
  "https://asistente-virtual-backend-wj8t.onrender.com";

export const API_ROUTES = {
  ADMIN: {
    CARGAR_PLAN: "/api/admin/planes-estudio/carga",
    ELIMINAR_PLAN: "/api/admin/planes-estudio",
    CREAR_ADMINISTRADOR: "/api/admin/administradores",
    OBTENER_TODOS_ADMINISTRADORES: "/api/admin/administradores",
    OBTENER_ADMINISTRADOR_POR_ID: "/api/admin/administradores",
    ACTUALIZAR_ADMINISTRADOR: "/api/admin/administradores",
    ELIMINAR_ADMINISTRADOR: "/api/admin/administradores",
  },
  SHARED: {
    ESTADISTICAS_GENERALES: "/api/shared/estadisticas/generales",
    ESTADISTICAS_MATERIA: "/api/shared/estadisticas/materia/",
    ESTADISTICAS_POR_CARRERA: "/api/shared/estadisticas/generales/carrera",
    RECALCULAR_ESTADISTICAS: "/api/shared/estadisticas/recalcular",
    MATERIAS_POR_PLAN: "/api/shared/planes-estudio/materias",
    PLANES_ESTUDIO: "/api/shared/planes-estudio",
    EXPERIENCIAS: "/api/shared/experiencias",
    EXPERIENCIAS_POR_MATERIA: "/api/shared/experiencias/por-materia",
    EXPERIENCIAS_POR_ESTUDIANTE: "/api/shared/experiencias/por-estudiante",
    EXAMENES_POR_ESTUDIANTE: "/api/shared/experiencias/examenes-por-estudiante",
    INSCRIPCIONES: "/api/shared/inscripciones",
    ACTUALIZAR_ESTUDIANTE: "/api/shared/estudiantes",
    ELIMINAR_ESTUDIANTE: "/api/shared/estudiantes",
  },
  ESTUDIANTE: {
    FINALES_PARA_RENDIR: "/api/shared/finales",
    OBTENER_INSCRIPCIONES_POSIBLES: "/api/shared/finales/",
    HISTORIA_ACADEMICA: "/api/shared/historia-academica/",
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
      "application/pdf",
    ],
    ALLOWED_EXTENSIONS: [".xls", ".xlsx", ".pdf"],
  },
};
