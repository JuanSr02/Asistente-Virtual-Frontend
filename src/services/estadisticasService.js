import api from "./api"
import { API_ROUTES } from "../config"

// Servicio para manejar operaciones relacionadas con estadísticas
const estadisticasService = {
  /**
   * Obtiene estadísticas generales del sistema
   * @returns {Promise} Promesa con la respuesta
   */
  obtenerEstadisticasGenerales: async () => {
    try {
      const response = await api.get(API_ROUTES.SHARED.ESTADISTICAS_GENERALES)
      return response.data
    } catch (error) {
      console.error("Error al obtener estadísticas generales:", error)
      throw error
    }
  },

  /**
   * Obtiene estadísticas de una materia específica
   * @param {string} codigoMateria - Código único de la materia
   * @returns {Promise} Promesa con la respuesta
   */
  obtenerEstadisticasMateria: async (codigoMateria) => {
    try {
      const response = await api.get(`${API_ROUTES.SHARED.ESTADISTICAS_MATERIA}/${codigoMateria}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener estadísticas de materia:", error)
      throw error
    }
  },
}

export default estadisticasService
