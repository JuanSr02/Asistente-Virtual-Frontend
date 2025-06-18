// 🌐 API
export const API_BASE_URL = "http://localhost:8080"

export const API_ROUTES = {
  ADMIN: {
    PLANES_ESTUDIO: "/api/admin/planes-estudio",
    CARGAR_PLAN: "/api/admin/planes-estudio/carga",
    ELIMINAR_PLAN: "/api/admin/planes-estudio",
  },
  SHARED: {
    ESTADISTICAS_GENERALES: "/api/shared/estadisticas/generales",
    ESTADISTICAS_MATERIA: "/api/shared/estadisticas/materia",
    ESTADISTICAS_GENERALES_RAPIDO: "/api/shared/fast/estadisticas/generales",
    ESTADISTICAS_MATERIA_RAPIDO: "/api/shared/fast/estadisticas/materia",
    MATERIAS_POR_PLAN: "/api/shared/planes-estudio/materias",
  },
  ESTUDIANTE: {
    // futuras rutas de estudiante
  },
}

// ⚙️ Axios
export const AXIOS_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
}

// ⚙️ App config
export const APP_CONFIG = {
  NAME: "Asistente Virtual - Sistema Académico",
  PAGINATION_SIZE: 10,
  FILES: {
    ALLOWED_TYPES: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    ALLOWED_EXTENSIONS: [".xls", ".xlsx"],
  },
}
