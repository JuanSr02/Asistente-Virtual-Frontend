import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, AXIOS_CONFIG } from "@/lib/config";
import { supabase } from "@/supabaseClient";

// Crear instancia base
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  ...AXIOS_CONFIG,
});

// Interceptor de Request: Inyectar Token de forma segura
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Obtener sesión fresca directamente de Supabase
      // Esto maneja automáticamente el refresh token si es necesario
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (error) {
      console.error("Error injectando token en Axios:", error);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de Response: Manejo global de errores básicos
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Aquí podríamos agregar logging a Sentry o similar
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido detectado por Axios.");
      // No redirigimos aquí automáticamente para no causar loops,
      // dejamos que el componente o AuthProvider maneje el estado.
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
