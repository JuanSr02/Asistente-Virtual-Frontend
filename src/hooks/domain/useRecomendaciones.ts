import { useQuery } from "@tanstack/react-query";
import recomendacionService from "@/services/recomendacionService";
import { studentKeys } from "@/lib/query-keys";

export function useRecomendaciones(
  personaId: number | undefined, // CAMBIO: Recibe número
  criterio: string,
  tieneHistoria: boolean,
) {
  const query = useQuery({
    queryKey: studentKeys.recomendaciones(
      personaId?.toString() || "0",
      criterio,
    ),
    queryFn: () =>
      // Ya no hacemos parseInt porque personaId es number
      recomendacionService.obtenerFinalesParaRendir(personaId!, criterio),
    enabled: !!personaId && !!criterio && tieneHistoria,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    recomendaciones: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
