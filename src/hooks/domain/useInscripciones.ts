import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import inscripcionService from "@/services/inscripcionService";
import { studentKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useInscripciones(
  personaId: number | undefined, // CAMBIO: Recibe número
  tieneHistoria: boolean
) {
  const queryClient = useQueryClient();
  // Usamos string para la key, pero el ID real es number
  const personaKey = personaId?.toString() || "0";

  // 1. Materias Disponibles
  const disponiblesQuery = useQuery({
    queryKey: studentKeys.materiasInscripcion(personaKey),
    queryFn: () =>
      inscripcionService.obtenerMateriasParaInscripcion(personaId!),
    enabled: !!personaId && tieneHistoria,
  });

  // 2. Mis Inscripciones
  const misInscripcionesQuery = useQuery({
    queryKey: studentKeys.misInscripciones(personaKey),
    queryFn: () =>
      inscripcionService.obtenerInscripcionesEstudiante(personaId!),
    enabled: !!personaId && tieneHistoria,
  });

  // 3. Mutación: Inscribirse
  const inscribirseMutation = useMutation({
    mutationFn: inscripcionService.crearInscripcion,
    onSuccess: () => {
      toast.success("¡Inscripción realizada con éxito!");
      queryClient.invalidateQueries({
        queryKey: studentKeys.misInscripciones(personaKey),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.materiasInscripcion(personaKey),
      });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "Error al realizar la inscripción.";
      if (error.response?.status === 409) {
        toast.warning("Ya estás inscripto a esta materia.");
      } else {
        toast.error(msg);
      }
    },
  });

  // 4. Mutación: Eliminar Inscripción
  const bajaMutation = useMutation({
    mutationFn: inscripcionService.eliminarInscripcion,
    onSuccess: () => {
      toast.info("Inscripción eliminada.");
      queryClient.invalidateQueries({
        queryKey: studentKeys.misInscripciones(personaKey),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.materiasInscripcion(personaKey),
      });
    },
    onError: () => {
      toast.error("No se pudo eliminar la inscripción.");
    },
  });

  const materiasFiltradas =
    disponiblesQuery.data?.filter((materia) => {
      const yaInscripto = misInscripcionesQuery.data?.some(
        (ins) => ins.materiaCodigo === materia.codigo
      );
      return !yaInscripto;
    }) || [];

  return {
    materiasDisponibles: materiasFiltradas,
    misInscripciones: misInscripcionesQuery.data || [],
    isLoadingData:
      disponiblesQuery.isLoading || misInscripcionesQuery.isLoading,
    inscribirse: inscribirseMutation.mutateAsync,
    isInscribiendo: inscribirseMutation.isPending,
    darseDeBaja: bajaMutation.mutateAsync,
    isDandoseDeBaja: bajaMutation.isPending,
  };
}
