"use client";

import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/supabaseClient";
import { Loader2, LogOut, UserCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { type User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import AdminDashboard from "../admin/admin-dashboard/page";
import StudentDashboard from "../student/studentDashboard/page";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const queryClient = useQueryClient(); // [NUEVO] Para limpiar caché al salir

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      } finally {
        setIsUserLoading(false);
      }
    };
    getUser();
  }, []);

  const { role, loading: roleLoading, error: roleError } = useUserRole(user);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // 1. Limpiar caché de React Query (Datos)
      queryClient.removeQueries();
      queryClient.clear();

      // 2. Limpiar localStorage (UI Store y persistencia vieja si queda)
      if (typeof window !== "undefined") {
        localStorage.removeItem("ui-storage");
        sessionStorage.clear();
      }

      // 3. Cerrar sesión en Supabase
      await supabase.auth.signOut();

      window.location.href = "/auth";
    } catch (error: any) {
      alert("Error: " + error.message);
      setSigningOut(false);
    }
  };

  const handleGoToProfile = () => {
    window.dispatchEvent(new CustomEvent("changeTab", { detail: "perfil" }));
  };

  if (isUserLoading || roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">
          Cargando interfaz...
        </p>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/auth";
    return null;
  }

  if (roleError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>Error cargando el rol. Intenta recargar.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Recargar
        </button>
      </div>
    );
  }

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
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-background/10 hover:bg-background/20 transition-colors"
                title="Ver Manual"
              >
                <span className="hidden sm:inline">📘 Ver manual</span>
              </button>
              <button
                onClick={handleGoToProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-background/10 hover:bg-background/20 transition-colors"
                title="Ir a Perfil"
              >
                <UserCircle className="h-4 w-4 hidden sm:block" />
                <span className="capitalize">{role?.toLowerCase()}</span>
              </button>
              <ModeToggle />
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-background/20 transition-colors"
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
        {role === "ADMINISTRADOR" ? (
          <AdminDashboard user={user} />
        ) : (
          <StudentDashboard user={user} />
        )}
      </main>
    </div>
  );
}
