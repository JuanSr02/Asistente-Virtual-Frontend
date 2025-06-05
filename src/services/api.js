import axios from "axios"
import { API_BASE_URL, AXIOS_CONFIG } from "../config"
import { supabase } from "../supabaseClient"

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  ...AXIOS_CONFIG,
})

// Interceptor para agregar el token de autenticación a todas las solicitudes
api.interceptors.request.use(
  async (config) => {
    try {
      // Obtener la sesión actual de Supabase
      const { data } = await supabase.auth.getSession()
      const session = data?.session

      // Si hay una sesión, agregar el token al header
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error("Error al obtener el token de autenticación:", error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores comunes
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      switch (error.response.status) {
        case 401:
          console.error("No autorizado. Por favor, inicie sesión nuevamente.")
          // Aquí podrías redirigir al login o mostrar un mensaje
          break
        case 403:
          console.error("Acceso prohibido. No tiene permisos para esta acción.")
          break
        case 404:
          console.error("Recurso no encontrado.")
          break
        case 500:
          console.error("Error del servidor. Por favor, intente más tarde.")
          break
        default:
          console.error(`Error ${error.response.status}: ${error.response.data.message || "Error desconocido"}`)
      }
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error("No se recibió respuesta del servidor. Verifique su conexión.")
    } else {
      // Algo ocurrió al configurar la solicitud
      console.error("Error al realizar la solicitud:", error.message)
    }

    return Promise.reject(error)
  },
)

export default api
