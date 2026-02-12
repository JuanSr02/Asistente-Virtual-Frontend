import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import inscripcionService from "@/services/inscripcionService";
import materiaService from "@/services/materiaService"; // Necesitamos esto
import { studentKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useInscripciones(
  personaId: number | undefined,
  tieneHistoria: boolean,
) {
  const queryClient = useQueryClient();
  const personaKey = personaId?.toString() || "0";

  // 1. Materias Disponibles
  const disponiblesQuery = useQuery({
    queryKey: studentKeys.materiasInscripcion(personaKey),
    queryFn: () =>
      inscripcionService.obtenerMateriasParaInscripcion(personaId!),
    enabled: !!personaId && tieneHistoria,
  });

  // 2. Mis Inscripciones (Con enriquecimiento de nombres)
  const misInscripcionesQuery = useQuery({
    queryKey: studentKeys.misInscripciones(personaKey),
    queryFn: async () => {
      // a. Obtener inscripciones crudas (sin nombres bonitos a veces)
      const inscripciones =
        await inscripcionService.obtenerInscripcionesEstudiante(personaId!);

      if (!inscripciones || inscripciones.length === 0) return [];

      // b. Filtrar las que no tienen nombre
      const sinNombre = inscripciones.filter((i: any) => !i.materiaNombre);
      if (sinNombre.length === 0) return inscripciones;

      // c. Buscar nombres faltantes (Lógica "Enriquecer" restaurada)
      try {
        // Crear lista de códigos únicos para consultar
        const materiasABuscar = sinNombre.map((i: any) => ({
          codigo: i.materiaCodigo,
          plan: i.materiaPlan,
        }));

        // Eliminar duplicados para no consultar lo mismo 2 veces
        const unicas = materiasABuscar.filter(
          (m: any, index: number, self: any[]) =>
            index ===
            self.findIndex((t) => t.codigo === m.codigo && t.plan === m.plan),
        );

        if (unicas.length > 0) {
          const infoMaterias =
            await materiaService.obtenerMateriasPorCodigos(unicas);
          // Crear mapa rápido codigo-plan -> nombre
          const mapaNombres: Record<string, string> = {};
          infoMaterias.forEach((m: any) => {
            mapaNombres[`${m.codigo}-${m.plan_de_estudio_codigo}`] = m.nombre;
          });

          // Asignar nombres encontrados
          return inscripciones.map((i: any) => ({
            ...i,
            materiaNombre:
              i.materiaNombre ||
              mapaNombres[`${i.materiaCodigo}-${i.materiaPlan}`] ||
              `Materia ${i.materiaCodigo}`, // Fallback
          }));
        }
      } catch (err) {
        console.error("Error enriqueciendo nombres:", err);
      }
      return inscripciones;
    },
    enabled: !!personaId && tieneHistoria,
  });

  // 3. Mutaciones (Inscripción / Baja) - Sin cambios mayores
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
        (ins: any) => ins.materiaCodigo === materia.codigo,
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
