export const studentKeys = {
  all: ["student"] as const,
  persona: (userId: string) => [...studentKeys.all, "persona", userId] as const, // NUEVO
  historia: (userId: string) =>
    [...studentKeys.all, "historia", userId] as const,
  planes: () => [...studentKeys.all, "planes"] as const,
  recomendaciones: (userId: string, criterio: string) =>
    [...studentKeys.all, "recomendaciones", userId, criterio] as const,
  materiasInscripcion: (userId: string) =>
    [...studentKeys.all, "materias-inscripcion", userId] as const,
  misInscripciones: (userId: string) =>
    [...studentKeys.all, "mis-inscripciones", userId] as const,
  inscriptosMesa: (materiaId: string, turno: string) =>
    [...studentKeys.all, "inscriptos", materiaId, turno] as const,
};
