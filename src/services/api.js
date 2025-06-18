import axios from "axios"
import { API_BASE_URL, AXIOS_CONFIG } from "../lib/config"
import { supabase } from "../supabaseClient"

// Variable para mantener la sesión actual cacheada
let currentSession = null

// Escuchar cambios de autenticación y actualizar cache
supabase.auth.onAuthStateChange((_event, session) => {
  currentSession = session
})

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  ...AXIOS_CONFIG,
})

// Interceptor para agregar token JWT a cada request
api.interceptors.request.use(
  async (config) => {
    // Intentar usar cache
    const token = currentSession?.access_token

    // Si no hay cache, pedir la sesión actual una sola vez
    if (!token) {
      try {
        const { data } = await supabase.auth.getSession()
        currentSession = data?.session
      } catch (error) {
        console.error("Error obteniendo sesión:", error)
      }
    }

    if (currentSession?.access_token) {
      config.headers.Authorization = `Bearer ${currentSession.access_token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      const msg = error.response.data?.message || "Error desconocido"

      switch (status) {
        case 401:
          toast.error("Sesión expirada. Redirigiendo al login...")
          setTimeout(() => {
            window.location.href = "/" // o "/login"
          }, 1500)
          break
        case 403:
          toast.warning("No tenés permisos para esta acción.")
          break
        case 404:
          toast.info("Recurso no encontrado.")
          break
        case 500:
          toast.error("Error del servidor. Intentalo más tarde.")
          break
        default:
          toast.error(`Error ${status}: ${msg}`)
          break
      }
    } else if (error.request) {
      toast.error("No se recibió respuesta del servidor.")
    } else {
      toast.error("Error al enviar la solicitud.")
    }

    return Promise.reject(error)
  }
)

export default api
