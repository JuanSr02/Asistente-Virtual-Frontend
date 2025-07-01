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
}

export interface ActualizarExperienciaDTO {
  dificultad?: number
  diasEstudio?: number
  horasDiarias?: number
  intentosPrevios?: number
  modalidad?: string
  recursos?: string
  motivacion?: string
}

export interface ExamenDisponibleDTO {
  id: number
  nombreMateria: string
  fechaExamen: string
  nota: number
}

class ExperienciaService {
  private baseUrl = "/api/shared/experiencias"

  async obtenerExperienciasPorMateria(codigoMateria: string): Promise<ExperienciaResponseDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/por-materia/${codigoMateria}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al obtener experiencias por materia:", error)
      throw error
    }
  }

  async obtenerExperienciasPorEstudiante(idEstudiante: number): Promise<ExperienciaResponseDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/por-estudiante/${idEstudiante}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al obtener experiencias por estudiante:", error)
      throw error
    }
  }

  async obtenerExamenesPorEstudiante(idEstudiante: number): Promise<ExamenDisponibleDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/examenes-por-estudiante/${idEstudiante}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al obtener exámenes por estudiante:", error)
      throw error
    }
  }

  async crearExperiencia(experienciaDTO: ExperienciaDTO): Promise<ExperienciaResponseDTO> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experienciaDTO),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al crear experiencia:", error)
      throw error
    }
  }

  async actualizarExperiencia(id: number, dto: ActualizarExperienciaDTO): Promise<ExperienciaResponseDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al actualizar experiencia:", error)
      throw error
    }
  }

  async eliminarExperiencia(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error al eliminar experiencia:", error)
      throw error
    }
  }
}

const experienciaService = new ExperienciaService()
export default experienciaService
