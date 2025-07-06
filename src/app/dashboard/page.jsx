"use client";

import { useUserRole } from "@/hooks/useUserRole";
import AdminDashboard from "../admin/admin-dashboard/page";
import StudentDashboard from "../student/studentDashboard/page";
import { supabase } from "@/supabaseClient";
import { useState } from "react";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { Loader2, LogOut, ShieldAlert, UserCircle } from "lucide-react";

// --- LÓGICA DEL COMPONENTE SIN CAMBIOS ---
export default function Dashboard({ user }) {
  const { role, loading, error } = useUserRole(user);
  const [signingOut, setSigningOut] = useState(false);
  const { clearAllSession } = useSessionPersistence();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      clearAllSession();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión: " + error.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setSigningOut(false);
    }
  };

  const handleGoToProfile = () => {
    const event = new CustomEvent("changeTab", { detail: "perfil" });
    window.dispatchEvent(event);
  };

  // --- ESTADO DE CARGA (LOADING) RESPONSIVE Y CON TEMA DE COLOR ORIGINAL ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background p-4 text-center">
        {/* Usamos los colores de tu paleta `primary` para el spinner */}
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-foreground font-semibold">
          Verificando permisos de usuario...
        </p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
    );
  }

  // --- ESTADO DE ERROR RESPONSIVE Y CON TEMA DE COLOR ORIGINAL ---
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="w-full max-w-lg mx-auto text-center p-6 sm:p-8 bg-card rounded-xl shadow-strong border-l-4 border-error-500">
          <ShieldAlert className="mx-auto h-12 w-12 text-error-500 mb-4" />
          <h2 className="text-xl font-bold text-error-700 mb-2">
            Error al Cargar el Dashboard
          </h2>
          <p className="mb-4 text-muted-foreground text-sm">
            No pudimos verificar tu rol de usuario.
          </p>
          <div className="bg-muted p-3 rounded-md text-left text-xs mb-6">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Usuario:</strong>{" "}
              {user?.email}
            </p>
            <p className="text-muted-foreground break-words mt-1">
              <strong className="text-foreground">Error:</strong> {error}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="
                w-full sm:w-auto h-11 px-6 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
                text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
                transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg
              "
            >
              🔄 Reintentar
            </button>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="
                w-full sm:w-auto h-11 px-6 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
                bg-gray-200 hover:bg-gray-300 text-gray-700
                transition-colors disabled:opacity-50
              "
            >
              {signingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "🚪 Cerrar Sesión"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO DEL DASHBOARD RESPONSIVE Y CON EL HEADER ORIGINAL ---
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold">
                Asistente Virtual
              </h1>
            </div>

            {/* Acciones de Usuario */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleGoToProfile}
                className="
                  flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold
                  bg-white/10 hover:bg-white/20 transition-colors
                "
                title="Ir a Perfil"
              >
                <UserCircle className="h-4 w-4 hidden sm:block" />
                <span className="capitalize">{role?.toLowerCase()}</span>
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="
                  h-9 w-9 inline-flex items-center justify-center whitespace-nowrap rounded-md
                  text-sm font-medium text-white hover:bg-white/20
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

      {/* El contenido principal ya está configurado para ser flexible */}
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
