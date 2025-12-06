"use client";

import { useState, useEffect } from "react";
import personaService from "@/services/personaService";
import type { User } from "@supabase/supabase-js";

type UserRole = "ADMINISTRADOR" | "ESTUDIANTE" | null;

export function useUserRole(user: User | null): {
  role: UserRole;
  loading: boolean;
  error: string | null;
} {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        setLoading(true);
        // Consultamos la tabla 'persona' que es la fuente de verdad
        const persona = await personaService.obtenerPersonaPorSupabaseId(
          user.id
        );

        if (persona) {
          // Asumimos que el string en DB coincide, si no, mapeamos
          setRole(persona.rol_usuario as UserRole);
        } else {
          // Fallback: Intentar por email si no tiene ID vinculado aun
          const personaByEmail = await personaService.obtenerPersonaPorEmail(
            user.email!
          );
          if (personaByEmail) {
            setRole(personaByEmail.rol_usuario as UserRole);
          } else {
            // Si no existe en persona, por defecto es ESTUDIANTE (o null si prefieres bloquear)
            console.warn(
              "Usuario no encontrado en tabla persona, asignando rol por defecto."
            );
            setRole("ESTUDIANTE");
          }
        }
      } catch (err) {
        console.error("Error obteniendo rol:", err);
        setError("Error al verificar permisos.");
        setRole("ESTUDIANTE"); // Fallback seguro
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading, error };
}
