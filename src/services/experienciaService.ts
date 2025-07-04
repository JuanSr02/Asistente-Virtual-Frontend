import api from "./api"
import { API_ROUTES } from "../lib/config"

export interface ExperienciaResponseDTO {
  id: number
  dificultad: number
  diasEstudio: number
  horasDiarias: number
  intentosPrevios: number
  modalidad: string
  recursos: string
  motivacion: string
  fechaExamen: string
  nota: number
  codigoMateria: string
  nombreMateria: string
}

export interface ExperienciaDTO {
  examenId: number
  dificultad: number
  diasEstudio: number
  horasDiarias: number
  intentosPrevios: number
  modalidad: string
  recursos: string
  motivacion: string
  linkResumen: string
}

export interface ActualizarExperienciaDTO {
  dificultad?: number
  diasEstudio?: number
  horasDiarias?: number
  intentosPrevios?: number
  modalidad?: string
  recursos?: string
  motivacion?: string
  linkResumen?: string
}

export interface ExamenDisponibleDTO {
  id: number
  nombreMateria: string
  fechaExamen: string
  nota: number
}

const experienciaService = {
  obtenerExperienciasPorMateria: async (codigoMateria: string): Promise<ExperienciaResponseDTO[]> => {
    try {
      const response = await api.get(`${API_ROUTES.SHARED.EXPERIENCIAS_POR_MATERIA}/${codigoMateria}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener experiencias por materia:", error)
      throw error
    }
  },

  obtenerExperienciasPorEstudiante: async (idEstudiante: number): Promise<ExperienciaResponseDTO[]> => {
    try {
      const response = await api.get(`${API_ROUTES.SHARED.EXPERIENCIAS_POR_ESTUDIANTE}/${idEstudiante}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener experiencias por estudiante:", error)
      throw error
    }
  },

  obtenerExamenesPorEstudiante: async (idEstudiante: number): Promise<ExamenDisponibleDTO[]> => {
    try {
      const response = await api.get(`${API_ROUTES.SHARED.EXAMENES_POR_ESTUDIANTE}/${idEstudiante}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener exámenes por estudiante:", error)
      throw error
    }
  },

  crearExperiencia: async (experienciaDTO: ExperienciaDTO): Promise<ExperienciaResponseDTO> => {
    try {
      const response = await api.post(API_ROUTES.SHARED.EXPERIENCIAS, experienciaDTO)
      return response.data
    } catch (error) {
      console.error("Error al crear experiencia:", error)
      throw error
    }
  },

  actualizarExperiencia: async (id: number, dto: ActualizarExperienciaDTO): Promise<ExperienciaResponseDTO> => {
    try {
      const response = await api.patch(`${API_ROUTES.SHARED.EXPERIENCIAS}/${id}`, dto)
      return response.data
    } catch (error) {
      console.error("Error al actualizar experiencia:", error)
      throw error
    }
  },

  eliminarExperiencia: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ROUTES.SHARED.EXPERIENCIAS}/${id}`)
    } catch (error) {
      console.error("Error al eliminar experiencia:", error)
      throw error
    }
  },
}

export default experienciaService
