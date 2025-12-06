import { useQuery } from "@tanstack/react-query";
import estadisticasService from "@/services/estadisticasService";
import { adminKeys } from "@/lib/query-keys";

export function useEstadisticasGenerales() {
  const query = useQuery({
    queryKey: adminKeys.stats.general(),
    queryFn: estadisticasService.obtenerEstadisticasGenerales,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  });

  return {
    estadisticas: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
