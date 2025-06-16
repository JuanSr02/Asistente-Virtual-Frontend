import api from "./api"
import { API_ROUTES } from "../config"

const planesEstudioService = {
  obtenerPlanes: async () => {
    try {
      const response = await api.get(API_ROUTES.ADMIN.PLANES_ESTUDIO)
      return response.data
    } catch (error) {
      console.error("Error al obtener planes de estudio:", error)
      throw error
    }
  },

  cargarPlan: async (file) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const config = { headers: { "Content-Type": "multipart/form-data" } }
      const response = await api.post(API_ROUTES.ADMIN.CARGAR_PLAN, formData, config)
      return response.data
    } catch (error) {
      console.error("Error al cargar plan de estudio:", error)
      throw error
    }
  },

  eliminarPlan: async (codigoPlan) => {
    try {
      const response = await api.delete(`${API_ROUTES.ADMIN.ELIMINAR_PLAN}?codigo=${codigoPlan}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar plan de estudio:", error)
      throw error
    }
  },

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
