import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import historiaAcademicaService from "@/services/historiaAcademicaService";
import planesEstudioService from "@/services/planesEstudioService";
import { studentKeys } from "@/lib/query-keys";
import { toast } from "sonner";

// CAMBIO: Aceptamos number | null | undefined
export function useHistoriaAcademica(personaId?: number | null) {
  const queryClient = useQueryClient();

  // 1. Obtener Historia Académica
  const historiaQuery = useQuery({
    // Usamos una string segura para la key si es null
    queryKey: studentKeys.historia(personaId ? personaId.toString() : "guest"),
    queryFn: async () => {
      if (!personaId) return null;
      return await historiaAcademicaService.verificarHistoriaAcademica(
        personaId
      );
    },
    enabled: !!personaId, // Solo ejecuta si tenemos el ID numérico
    staleTime: 1000 * 60 * 30,
  });

  // 2. Obtener Planes (Igual que antes)
  const planesQuery = useQuery({
    queryKey: studentKeys.planes(),
    queryFn: planesEstudioService.obtenerPlanes,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // 3. Mutación: Cargar Archivo
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      planCodigo,
    }: {
      file: File;
      planCodigo: string;
    }) => {
      if (!personaId) throw new Error("No se identificó a la persona");

      return await historiaAcademicaService.cargarHistoriaAcademica(
        file,
        personaId, // Usamos el ID numérico real
        planCodigo
      );
    },
    onSuccess: (data) => {
      toast.success(data.mensaje || "Historia académica cargada correctamente");
      if (personaId) {
        queryClient.invalidateQueries({ queryKey: studentKeys.all });
      }
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "Error al procesar el archivo.";
      toast.error(msg);
    },
  });

  // 4. Mutación: Eliminar Historia
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!personaId) throw new Error("No se identificó a la persona");
      await historiaAcademicaService.eliminarHistoriaAcademica(personaId);
    },
    onSuccess: () => {
      toast.success("Historia académica eliminada");
      if (personaId) {
        queryClient.setQueryData(
          studentKeys.historia(personaId.toString()),
          null
        );
        queryClient.invalidateQueries({ queryKey: studentKeys.all });
      }
    },
    onError: () => {
      toast.error("No se pudo eliminar la historia académica.");
    },
  });

  return {
    historia: historiaQuery.data,
    isLoadingHistoria: historiaQuery.isLoading,
    isErrorHistoria: historiaQuery.isError,
    planes: planesQuery.data || [],
    isLoadingPlanes: planesQuery.isLoading,
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
