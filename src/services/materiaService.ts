import { supabase } from "@/supabaseClient";

export interface Materia {
  codigo: string;
  nombre: string;
  plan_de_estudio_codigo: string;
}

const materiaService = {
  /**
   * Obtiene una materia específica por código y plan de estudio
   */
  obtenerMateriaPorCodigoYPlan: async (
    codigo: string,
    planCodigo: string
  ): Promise<Materia | null> => {
    try {

      const { data, error } = await supabase
        .from("materia")
        .select("codigo, nombre, plan_de_estudio_codigo")
        .eq("codigo", codigo)
        .eq("plan_de_estudio_codigo", planCodigo)
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
      console.error(`Error al obtener materia ${codigo}-${planCodigo}:`, error);
      return null;
    }
  },

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

  /**
   * Busca materias por nombre (búsqueda parcial)
   */
  buscarMateriasPorNombre: async (
    nombre: string,
    planCodigo?: string
  ): Promise<Materia[]> => {
    try {
      let query = supabase
        .from("materia")
        .select("codigo, nombre, plan_de_estudio_codigo")
        .ilike("nombre", `%${nombre}%`);

      if (planCodigo) {
        query = query.eq("plan_de_estudio_codigo", planCodigo);
      }

      const { data, error } = await query.order("nombre").limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Error al buscar materias por nombre "${nombre}":`, error);
      return [];
    }
  },

  /**
   * Verifica si existe una materia específica
   */
  existeMateria: async (
    codigo: string,
    planCodigo: string
  ): Promise<boolean> => {
    try {
      const materia = await materiaService.obtenerMateriaPorCodigoYPlan(
        codigo,
        planCodigo
      );
      return materia !== null;
    } catch (error) {
      console.error(
        `Error al verificar existencia de materia ${codigo}-${planCodigo}:`,
        error
      );
      return false;
    }
  },
};

export default materiaService;
