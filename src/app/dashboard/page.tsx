"use client";

import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import AdminDashboard from "../admin/admin-dashboard/page";
import StudentDashboard from "../student/studentDashboard/page";
import { supabase } from "@/supabaseClient";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { Loader2, LogOut, UserCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { type User } from "@supabase/supabase-js";

export default function Dashboard() {
  // 1. Estado local para el usuario (ya no viene por props)
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [signingOut, setSigningOut] = useState(false);
  const { clearAllSession } = useSessionPersistence();

  // 2. Efecto para obtener el usuario actual al montar
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error obteniendo usuario en Dashboard:", error);
      } finally {
        setIsUserLoading(false);
      }
    };
    getUser();
  }, []);

  // 3. El hook de rol ahora depende del estado local 'user'
  const { role, loading: roleLoading, error: roleError } = useUserRole(user);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      clearAllSession();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // La redirección la maneja el middleware o router refresh
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error: " + error.message);
      setSigningOut(false);
    }
  };

  const handleGoToProfile = () => {
    const event = new CustomEvent("changeTab", { detail: "perfil" });
    window.dispatchEvent(event);
  };

  // --- COMBINAMOS ESTADOS DE CARGA ---
  // Esperamos a tener el usuario Y su rol
  if (isUserLoading || roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background p-4 text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-foreground font-semibold">
          {isUserLoading ? "Cargando usuario..." : "Verificando permisos..."}
        </p>
      </div>
    );
  }

  // --- MANEJO DE ERRORES ---
  if (!user) {
    // Si terminó de cargar y no hay usuario, algo falló gravemente o el middleware no interceptó.
    // Redirigimos manualmente por seguridad.
    if (typeof window !== "undefined") window.location.href = "/auth";
    return null;
  }

  if (roleError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-background p-4">
        {/* ... (UI de error existente) ... */}
        <div className="text-center">
          <p>Error cargando el rol. Intenta recargar.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">
                Asistente Virtual
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() =>
                  window.open("https://youtu.be/eJyXexJL2LE", "_blank")
                }
                className="
                flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold
                bg-background/10 hover:bg-background/20 transition-colors
              "
                title="Ver Manual de Uso"
              >
                <span className="hidden sm:inline">📘 Ver manual</span>
              </button>
              <button
                onClick={handleGoToProfile}
                className="
                flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold
                bg-background/10 hover:bg-background/20 transition-colors
              "
                title="Ir a Perfil"
              >
                <UserCircle className="h-4 w-4 hidden sm:block" />
                <span className="capitalize">{role?.toLowerCase()}</span>
              </button>
              <ModeToggle />
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="
                h-9 w-9 inline-flex items-center justify-center whitespace-nowrap rounded-md
                text-sm font-medium text-white hover:bg-background/20
                transition-colors disabled:opacity-50
              "
                title="Cerrar Sesión"
              >
                {signingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Aquí pasamos el usuario que acabamos de obtener al componente hijo correspondiente */}
        {role === "ADMINISTRADOR" ? (
          <AdminDashboard user={user} />
        ) : (
          <StudentDashboard user={user} />
        )}
      </main>
    </div>
  );
}
