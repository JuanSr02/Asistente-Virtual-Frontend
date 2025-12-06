export const sharedKeys = {
  all: ["shared"] as const,
  planes: () => [...sharedKeys.all, "planes"] as const,
  materiasPorPlan: (plan: string) =>
    [...sharedKeys.all, "materias", plan] as const,
};

export const studentKeys = {
  all: ["student"] as const,
  persona: (userId: string) => [...studentKeys.all, "persona", userId] as const,
  historia: (userId: string) =>
    [...studentKeys.all, "historia", userId] as const,
  planes: () => sharedKeys.planes(), // Alias para compatibilidad
  recomendaciones: (userId: string, criterio: string) =>
    [...studentKeys.all, "recomendaciones", userId, criterio] as const,
  materiasInscripcion: (userId: string) =>
    [...studentKeys.all, "materias-inscripcion", userId] as const,
  misInscripciones: (userId: string) =>
    [...studentKeys.all, "mis-inscripciones", userId] as const,
  inscriptosMesa: (materiaId: string, turno: string) =>
    [...studentKeys.all, "inscriptos", materiaId, turno] as const,
  experiencias: {
    misExperiencias: (userId: string) =>
      [...studentKeys.all, "experiencias", "mias", userId] as const,
    porMateria: (materiaId: string) =>
      [...studentKeys.all, "experiencias", "materia", materiaId] as const,
    examenesDisponibles: (userId: string) =>
      [...studentKeys.all, "experiencias", "disponibles", userId] as const,
  },
};
export const adminKeys = {
  all: ["admin"] as const,
  stats: {
    general: () => [...adminKeys.all, "stats", "general"] as const,
    carrera: (plan: string, periodo: string) =>
      [...adminKeys.all, "stats", "carrera", plan, periodo] as const,
    materia: (codigo: string, periodo: string) =>
      [...adminKeys.all, "stats", "materia", codigo, periodo] as const,
  },
};
