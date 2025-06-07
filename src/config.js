// Configuración global de la aplicación

// URL base de la API
export const API_BASE_URL = "http://localhost:8080"

// Rutas de la API
export const API_ROUTES = {
  // Rutas de administrador
  ADMIN: {
    PLANES_ESTUDIO: "/api/admin/planes-estudio", // GET para obtener todos los planes
    CARGAR_PLAN: "/api/admin/planes-estudio/carga", // POST para cargar nuevo plan
    ELIMINAR_PLAN: "/api/admin/planes-estudio", // DELETE para eliminar plan
  },
  // Rutas compartidas
  SHARED: {
    ESTADISTICAS_GENERALES: "/api/shared/estadisticas/generales", // GET estadísticas generales
    ESTADISTICAS_MATERIA: "/api/shared/estadisticas/materia", // GET estadísticas por materia
  },
  // Rutas de estudiante
  ESTUDIANTE: {
    // Aquí irán las rutas para estudiantes cuando las necesitemos
  },
}

// Configuración de Axios
export const AXIOS_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
}

// Otras configuraciones
export const APP_CONFIG = {
  APP_NAME: "Asistente Virtual - Sistema Académico",
  PAGINATION_SIZE: 10,
  ALLOWED_FILE_TYPES: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ALLOWED_FILE_EXTENSIONS: [".xls", ".xlsx"],
}
