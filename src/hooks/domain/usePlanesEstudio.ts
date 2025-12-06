import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import planesEstudioService, {
  PlanEstudio,
} from "@/services/planesEstudioService";
import { sharedKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function usePlanesEstudio() {
  const queryClient = useQueryClient();

  // 1. Obtener Planes
  const query = useQuery({
    queryKey: sharedKeys.planes(),
    queryFn: planesEstudioService.obtenerPlanes,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  // 2. Cargar Plan (Upload)
  const uploadMutation = useMutation({
    mutationFn: planesEstudioService.cargarPlan,
    onSuccess: (data) => {
      toast.success(
        `Plan cargado: ${data.propuesta} (${data.cantidadMateriasCargadas} materias)`
      );
      queryClient.invalidateQueries({ queryKey: sharedKeys.planes() });
    },
    onError: (error: any) => {
      toast.error("Error al cargar el plan. Verifica el formato del archivo.");
      console.error(error);
    },
  });

  // 3. Eliminar Plan
  const deleteMutation = useMutation({
    mutationFn: planesEstudioService.eliminarPlan,
    onSuccess: () => {
      toast.success("Plan eliminado correctamente.");
      queryClient.invalidateQueries({ queryKey: sharedKeys.planes() });
    },
    onError: (error: any) => {
      toast.error("No se pudo eliminar el plan de estudio.");
    },
  });

  return {
    planes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    uploadPlan: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deletePlan: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
