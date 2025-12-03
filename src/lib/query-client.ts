import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los datos se consideran "frescos" por 5 minutos (no se revalidan automáticamente)
      staleTime: 1000 * 60 * 5,
      // Garbage collection: caché se mantiene 10 minutos si no se usa
      gcTime: 1000 * 60 * 10,
      // Reintentar 1 vez en caso de fallo de red
      retry: 1,
      // Desactivar refetch al cambiar de ventana en desarrollo para evitar ruido
      refetchOnWindowFocus: process.env.NODE_ENV === "production",
    },
  },
});
