import { useQuery } from "@tanstack/react-query";
import estadisticasService from "@/services/estadisticasService";
import { adminKeys } from "@/lib/query-keys";

export function useEstadisticasMateria(materiaCodigo: string, periodo: string) {
  const query = useQuery({
    queryKey: adminKeys.stats.materia(materiaCodigo, periodo),
    queryFn: () =>
      estadisticasService.obtenerEstadisticasMateriaPorPeriodo(
        materiaCodigo,
        periodo
      ),
    enabled: !!materiaCodigo, // Solo si hay materia seleccionada
    staleTime: 1000 * 60 * 30,
  });

  return {
    estadisticas: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
