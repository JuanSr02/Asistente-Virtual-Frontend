import { useMutation, useQueryClient } from "@tanstack/react-query";
import perfilService from "@/services/perfilService";
import { studentKeys } from "@/lib/query-keys"; // Reutilizamos keys o creamos nuevas si fuera necesario
import { toast } from "sonner"; // Usamos Sonner en lugar del hook legacy use-toast
import type { ActualizarPerfilDTO } from "@/lib/types/perfil";
import { useRouter } from "next/navigation";

export function usePerfil(userId: string, rolUsuario: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userIdInt = parseInt(userId);

  // 1. Mutación: Actualizar Perfil (incluye contraseña si viene en el DTO)
  const actualizarMutation = useMutation({
    mutationFn: (datos: ActualizarPerfilDTO) =>
      perfilService.actualizarPerfil(userIdInt, datos, rolUsuario),
    onSuccess: (data, variables) => {
      // Construimos mensaje de éxito basado en lo que se cambió
      const campos = [];
      if (variables.nombreApellido) campos.push("nombre");
      if (variables.mail) campos.push("email");
      if (variables.telefono) campos.push("teléfono");
      if (variables.contrasenia) campos.push("contraseña");

      toast.success("Perfil actualizado", {
        description: `Se actualizó: ${campos.join(", ")}`,
      });

      if (variables.contrasenia) {
        toast.info("Contraseña cambiada", {
          description:
            "Deberás iniciar sesión nuevamente en tu próxima visita.",
          duration: 5000,
        });
      }

      // Invalidamos la cache de la persona para que se reflejen los cambios en la UI
      // studentKeys.persona usa el UUID, así que invalidamos todo 'student' para estar seguros
      // o 'admin' si fuera el caso. Por simplicidad invalidamos todo.
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error("Error al actualizar:", error);
      if (error?.response?.status === 500) {
        // Ajuste para error de email duplicado común
        toast.error("Error al actualizar", {
          description: "Es posible que el email ya esté en uso.",
        });
      } else {
        toast.error("Error al actualizar", {
          description: error.message || "Ocurrió un error inesperado.",
        });
      }
    },
  });

  // 2. Mutación: Eliminar Cuenta
  const eliminarMutation = useMutation({
    mutationFn: () => perfilService.eliminarCuenta(userIdInt, rolUsuario),
    onSuccess: () => {
      toast.success("Cuenta eliminada", {
        description: "Tu cuenta ha sido eliminada correctamente. Hasta luego.",
      });
      router.push("/auth");
    },
    onError: (error: any) => {
      toast.error("Error al eliminar cuenta", {
        description: error.message || "No se pudo eliminar la cuenta.",
      });
    },
  });

  return {
    actualizarPerfil: actualizarMutation.mutateAsync,
    isUpdating: actualizarMutation.isPending,
    eliminarCuenta: eliminarMutation.mutateAsync,
    isDeleting: eliminarMutation.isPending,
  };
}
