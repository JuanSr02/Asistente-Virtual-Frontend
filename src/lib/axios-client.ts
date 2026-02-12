import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, AXIOS_CONFIG } from "@/lib/config";
import { supabase } from "@/supabaseClient";

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  ...AXIOS_CONFIG,
});

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
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
  (error: AxiosError) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o token inválido detectado por Axios.");
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
