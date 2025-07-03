export interface ActualizarPerfilDTO {
  nombreApellido?: string
  mail?: string
  telefono?: string
}

export interface PerfilUsuario {
  id: number
  mail: string
  nombreApellido: string
  telefono?: string
  rolUsuario: string
}
