import axiosClient from "@/lib/axios-client";

// Re-exportamos la instancia para mantener compatibilidad con el código existente
// que importa 'api' desde este archivo.
const api = axiosClient;

export default api;
