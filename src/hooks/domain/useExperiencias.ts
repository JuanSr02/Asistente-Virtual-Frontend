import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import experienciaService from "@/services/experienciaService";
import { studentKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { useEffect } from "react";

export function useExperiencias(userId: string, materiaId?: string) {
  const queryClient = useQueryClient();
  const userIdInt = parseInt(userId);

  // 1. Mis Experiencias
  const misExperienciasQuery = useQuery({
    queryKey: studentKeys.experiencias.misExperiencias(userId),
    queryFn: () =>
      experienciaService.obtenerExperienciasPorEstudiante(userIdInt),
    enabled: !isNaN(userIdInt),
  });

  // 2. Experiencias por Materia (Búsqueda)
  const experienciasMateriaQuery = useQuery({
    queryKey: studentKeys.experiencias.porMateria(materiaId || ""),
    queryFn: () => experienciaService.obtenerExperienciasPorMateria(materiaId!),
    enabled: !!materiaId,
  });

  // 3. Exámenes Disponibles (Para crear nueva experiencia)
  const examenesDisponiblesQuery = useQuery({
    queryKey: studentKeys.experiencias.examenesDisponibles(userId),
    queryFn: async () => {
      // Obtenemos todos los exámenes rendidos por el alumno
      const examenes =
        await experienciaService.obtenerExamenesPorEstudiante(userIdInt);
      // Filtramos los que ya tienen experiencia cargada
      const misExps = misExperienciasQuery.data || [];
      // Extraemos los IDs de exámenes que ya tienen experiencia
      const idsExamenesConExperiencia = new Set(
        misExps.map((e: any) => e.examenId),
      );
      // Retornamos solo los exámenes que NO tienen experiencia aún
      return examenes.filter((e: any) => !idsExamenesConExperiencia.has(e.id));
    },
    enabled: !isNaN(userIdInt) && !misExperienciasQuery.isLoading,
  });

  // Cuando misExperiencias cambia, invalida y refetch automáticamente
  useEffect(() => {
    if (misExperienciasQuery.data) {
      queryClient.invalidateQueries({
        queryKey: studentKeys.experiencias.examenesDisponibles(userId),
      });
    }
  }, [misExperienciasQuery.data?.length, userId, queryClient]);

  // 4. Crear Experiencia
  const crearMutation = useMutation({
    mutationFn: experienciaService.crearExperiencia,
    onSuccess: () => {
      toast.success("Experiencia compartida con éxito");
      queryClient.invalidateQueries({
        queryKey: studentKeys.experiencias.misExperiencias(userId),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.experiencias.examenesDisponibles(userId),
      });
      if (materiaId)
        queryClient.invalidateQueries({
          queryKey: studentKeys.experiencias.porMateria(materiaId),
        });
    },
    onError: () => toast.error("Error al compartir la experiencia"),
  });

  // 5. Actualizar Experiencia
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      experienciaService.actualizarExperiencia(id, data),
    onSuccess: () => {
      toast.success("Experiencia actualizada");
      queryClient.invalidateQueries({
        queryKey: studentKeys.experiencias.misExperiencias(userId),
      });
      if (materiaId)
        queryClient.invalidateQueries({
          queryKey: studentKeys.experiencias.porMateria(materiaId),
        });
    },
    onError: () => toast.error("Error al actualizar"),
  });

  // 6. Eliminar Experiencia
  const eliminarMutation = useMutation({
    mutationFn: experienciaService.eliminarExperiencia,
    onSuccess: () => {
      toast.success("Experiencia eliminada");
      queryClient.invalidateQueries({
        queryKey: studentKeys.experiencias.misExperiencias(userId),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.experiencias.examenesDisponibles(userId),
      });
    },
    onError: () => toast.error("Error al eliminar"),
  });

  return {
    misExperiencias: misExperienciasQuery.data || [],
    isLoadingMisExperiencias: misExperienciasQuery.isLoading,

    experienciasMateria: experienciasMateriaQuery.data || [],
    isLoadingExperienciasMateria: experienciasMateriaQuery.isLoading,

    examenesDisponibles: examenesDisponiblesQuery.data || [],
    isLoadingExamenes: examenesDisponiblesQuery.isLoading,

    crear: crearMutation.mutateAsync,
    actualizar: actualizarMutation.mutateAsync,
    eliminar: eliminarMutation.mutateAsync,

    isProcessing:
      crearMutation.isPending ||
      actualizarMutation.isPending ||
      eliminarMutation.isPending,
  };
}
