import { supabase } from "@/supabaseClient";

export interface Materia {
  codigo: string;
  nombre: string;
  plan_de_estudio_codigo: string;
}

const materiaService = {
  /**
   * Obtiene múltiples materias por sus códigos y planes de estudio
   */
  obtenerMateriasPorCodigos: async (
    materias: { codigo: string; plan: string }[]
  ): Promise<Materia[]> => {
    try {
      if (!materias || materias.length === 0) {
        return [];
      }

      // Hacer consultas individuales en paralelo para cada materia
      const promesasConsultas = materias.map(async (materia) => {
        try {
          const { data, error } = await supabase
            .from("materia")
            .select("codigo, nombre, plan_de_estudio_codigo")
            .eq("codigo", materia.codigo)
            .eq("plan_de_estudio_codigo", materia.plan)
            .single();

          if (error) {
            if (error.code === "PGRST116") {
              // No encontrado - no es un error crítico
              return null;
            }
            throw error;
          }

          return data;
        } catch (error) {
          console.error(
            `Error al consultar materia ${materia.codigo}-${materia.plan}:`,
            error
          );
          return null;
        }
      });

      // Esperar todas las consultas y filtrar nulos
      const resultados = await Promise.all(promesasConsultas);
      const materiasEncontradas = resultados.filter(
        (materia) => materia !== null
      ) as Materia[];

      return materiasEncontradas;
    } catch (error) {
      console.error("Error al obtener materias por códigos:", error);
      return [];
    }
  },

  /**
   * Obtiene todas las materias de un plan de estudio específico
   */
  obtenerMateriasPorPlan: async (planCodigo: string): Promise<Materia[]> => {
    try {
      const { data, error } = await supabase
        .from("materia")
        .select("codigo, nombre, plan_de_estudio_codigo")
        .eq("plan_de_estudio_codigo", planCodigo)
        .order("codigo");

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Error al obtener materias del plan ${planCodigo}:`, error);
      return [];
    }
  },
};

export default materiaService;
