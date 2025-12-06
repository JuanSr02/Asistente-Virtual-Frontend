import { useQuery } from "@tanstack/react-query";
import estadisticasService from "@/services/estadisticasService";
import { adminKeys } from "@/lib/query-keys";

export function useEstadisticasCarrera(planCodigo: string, periodo: string) {
  const query = useQuery({
    queryKey: adminKeys.stats.carrera(planCodigo, periodo),
    queryFn: () =>
      estadisticasService.obtenerEstadisticasPorCarrera(planCodigo, periodo),
    enabled: !!planCodigo, // Solo ejecuta si hay un plan seleccionado
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  return {
    estadisticas: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
