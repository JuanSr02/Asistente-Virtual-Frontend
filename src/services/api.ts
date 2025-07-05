import { API_BASE_URL, AXIOS_CONFIG } from "@/lib/config";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";
import { Session } from "@supabase/supabase-js";

// Tipos para la configuración
type ApiConfig = {
  API_BASE_URL: string;
  AXIOS_CONFIG?: AxiosRequestConfig;
};

// Variable para mantener la sesión actual cacheada
let currentSession: Session | null = null;

// Escuchar cambios de autenticación y actualizar cache
supabase.auth.onAuthStateChange((_event, session) => {
  currentSession = session;
});

/**
 * Crea una instancia de axios configurada
 * @param config - Configuración base de la API
 * @returns Instancia de axios configurada
 */
const createApiInstance = ({
  API_BASE_URL,
  AXIOS_CONFIG,
}: ApiConfig): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    ...AXIOS_CONFIG,
  });

  // Interceptor para agregar token JWT a cada request
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Cambiado a InternalAxiosRequestConfig
      // Intentar usar cache
      let token = currentSession?.access_token;

      // Si no hay cache, pedir la sesión actual
      if (!token) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          currentSession = session;
          token = session?.access_token;
        } catch (error) {
          console.error("Error obteniendo sesión:", error);
        }
      }

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Interceptor para manejar errores globalmente
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      handleApiError(error);
      return Promise.reject(error);
    }
  );

  return api;
};

/**
 * Maneja errores de API y muestra notificaciones
 * @param error - Error de Axios
 */
const handleApiError = (error: AxiosError): void => {
  if (error.response) {
    const status = error.response.status;
    const msg = (error.response.data as any)?.message || "Error desconocido";

    switch (status) {
      case 401:
        toast.error("Sesión expirada. Redirigiendo al login...");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
        break;
      case 403:
        toast.warning("No tenés permisos para esta acción.");
        break;
      case 404:
        toast.info("Recurso no encontrado.");
        break;
      case 500:
        toast.error("Error del servidor. Intentalo más tarde.");
        break;
      default:
        toast.error(`Error ${status}: ${msg}`);
        break;
    }
  } else if (error.request) {
    toast.error("No se recibió respuesta del servidor.");
  } else {
    toast.error("Error al enviar la solicitud.");
  }
};

// Instancia de API exportada
const api = createApiInstance({ API_BASE_URL, AXIOS_CONFIG });

export default api;
