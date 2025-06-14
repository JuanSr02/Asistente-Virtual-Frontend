import api from "./api"
import { API_ROUTES } from "../config"

// Servicio para manejar operaciones relacionadas con planes de estudio
const planesEstudioService = {
  /**
   * Obtiene todos los planes de estudio
   * @returns {Promise} Promesa con la respuesta
   */
  obtenerPlanes: async () => {
    try {
      const response = await api.get(API_ROUTES.ADMIN.PLANES_ESTUDIO)
      // La respuesta ya es un array de PlanEstudioResponseDTO
      return response.data
    } catch (error) {
      console.error("Error al obtener planes de estudio:", error)
      throw error
    }
  },

  /**
   * Carga un nuevo plan de estudio desde un archivo Excel
   * @param {File} file - Archivo Excel con los datos del plan
   * @returns {Promise} Promesa con la respuesta
   */
  cargarPlan: async (file) => {
    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", file)

      // Configuración especial para FormData
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }

      const response = await api.post(API_ROUTES.ADMIN.CARGAR_PLAN, formData, config)
      return response.data
    } catch (error) {
      console.error("Error al cargar plan de estudio:", error)
      throw error
    }
  },

  /**
   * Elimina un plan de estudio por su código
   * @param {string} codigoPlan - Código único del plan de estudio
   * @returns {Promise} Promesa con la respuesta
   */
  eliminarPlan: async (codigoPlan) => {
    try {
      const response = await api.delete(`${API_ROUTES.ADMIN.ELIMINAR_PLAN}?codigo=${codigoPlan}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar plan de estudio:", error)
      throw error
    }
  },

  /**
   * Obtiene todas las materias de un plan específico
   * @param {string} codigoPlan - Código del plan de estudio
   * @returns {Promise} Promesa con la lista de materias
   */
  obtenerMateriasPorPlan: async (codigoPlan) => {
    try {
      const response = await api.get(`${API_ROUTES.SHARED.MATERIAS_POR_PLAN}?codigoPlan=${codigoPlan}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener materias por plan:", error)
      throw error
    }
  },
}

export default planesEstudioService
