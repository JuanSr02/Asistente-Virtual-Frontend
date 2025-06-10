import api from "./api"
import { API_ROUTES } from "../config"

// Servicio para manejar operaciones relacionadas con estadísticas
const estadisticasService = {
  /**
   * Obtiene estadísticas generales del sistema (versión rápida/cacheada con fallback)
   * @returns {Promise} Promesa con la respuesta
   */
  obtenerEstadisticasGeneralesRapido: async () => {
    try {
      console.log("Intentando obtener estadísticas generales rápidas...")
      const response = await api.get(API_ROUTES.SHARED.ESTADISTICAS_GENERALES_RAPIDO)
      console.log("✅ Estadísticas generales rápidas obtenidas exitosamente")
      return response.data
    } catch (error) {
      console.warn("⚠️ Error al obtener estadísticas generales rápidas:", error)

      // Si es un error 404, intentar con el endpoint normal como fallback
      if (error.response && error.response.status === 404) {
        console.log("🔄 Datos cacheados no disponibles, usando endpoint normal como fallback...")
        try {
          const fallbackResponse = await api.get(API_ROUTES.SHARED.ESTADISTICAS_GENERALES)
          console.log("✅ Estadísticas generales obtenidas desde endpoint normal")
          return fallbackResponse.data
        } catch (fallbackError) {
          console.error("❌ Error en endpoint normal de estadísticas generales:", fallbackError)
          throw fallbackError
        }
      }

      // Si no es un 404, lanzar el error original
      throw error
    }
  },

  /**
   * Obtiene estadísticas generales del sistema (versión completa/actualizada)
   * @returns {Promise} Promesa con la respuesta
   */
  obtenerEstadisticasGenerales: async () => {
    try {
      console.log("Obteniendo estadísticas generales completas...")
      const response = await api.get(API_ROUTES.SHARED.ESTADISTICAS_GENERALES)
      console.log("✅ Estadísticas generales completas obtenidas exitosamente")
      return response.data
    } catch (error) {
      console.error("❌ Error al obtener estadísticas generales:", error)
      throw error
    }
  },

  /**
   * Obtiene estadísticas de una materia específica (versión rápida/cacheada con fallback)
   * @param {string} codigoMateria - Código único de la materia
   * @returns {Promise} Promesa con la respuesta
   */
  obtenerEstadisticasMateriaRapido: async (codigoMateria) => {
    try {
      console.log(`Intentando obtener estadísticas rápidas para materia: ${codigoMateria}`)
      const response = await api.get(`${API_ROUTES.SHARED.ESTADISTICAS_MATERIA_RAPIDO}/${codigoMateria}`)
      console.log(`✅ Estadísticas rápidas de materia ${codigoMateria} obtenidas exitosamente`)
      return response.data
    } catch (error) {
      console.warn(`⚠️ Error al obtener estadísticas rápidas de materia ${codigoMateria}:`, error)

      // Si es un error 404, intentar con el endpoint normal como fallback
      if (error.response && error.response.status === 404) {
        console.log(
          `🔄 Datos cacheados no disponibles para materia ${codigoMateria}, usando endpoint normal como fallback...`,
        )
        try {
          const fallbackResponse = await api.get(`${API_ROUTES.SHARED.ESTADISTICAS_MATERIA}/${codigoMateria}`)
          console.log(`✅ Estadísticas de materia ${codigoMateria} obtenidas desde endpoint normal`)
          return fallbackResponse.data
        } catch (fallbackError) {
          console.error(`❌ Error en endpoint normal de estadísticas de materia ${codigoMateria}:`, fallbackError)
          throw fallbackError
        }
      }

      // Si no es un 404, lanzar el error original
      throw error
    }
  },

  /**
   * Obtiene estadísticas de una materia específica (versión completa/actualizada)
   * @param {string} codigoMateria - Código único de la materia
   * @returns {Promise} Promesa con la respuesta
   */
  obtenerEstadisticasMateria: async (codigoMateria) => {
    try {
      console.log(`Obteniendo estadísticas completas para materia: ${codigoMateria}`)
      const response = await api.get(`${API_ROUTES.SHARED.ESTADISTICAS_MATERIA}/${codigoMateria}`)
      console.log(`✅ Estadísticas completas de materia ${codigoMateria} obtenidas exitosamente`)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener estadísticas de materia ${codigoMateria}:`, error)
      throw error
    }
  },
}

export default estadisticasService
