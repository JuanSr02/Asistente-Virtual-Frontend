import { useQuery } from "@tanstack/react-query";
import personaService from "@/services/personaService";
import { studentKeys } from "@/lib/query-keys";

export function usePersona(userId: string, email?: string) {
  return useQuery({
    queryKey: studentKeys.persona(userId),
    queryFn: async () => {
      // Intentar por ID de Supabase
      let persona = await personaService.obtenerPersonaPorSupabaseId(userId);

      // Fallback: Intentar por email si no se encuentra por ID (para usuarios migrados)
      if (!persona && email) {
        persona = await personaService.obtenerPersonaPorEmail(email);
      }

      return persona;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hora (el perfil cambia poco)
  });
}
