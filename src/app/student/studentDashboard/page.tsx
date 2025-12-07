"use client";

import { useState, useEffect } from "react";
import Recomendacion from "../recomendacion/page";
import EstadisticasMateria from "@/app/estadisticasMateria/page";
import Inscripcion from "../inscripcion/page";
import ExperienciasExamen from "../experiencias-examen/page";
import Perfil from "@/app/perfil/page";
import { useUIStore } from "@/stores/ui-store";
import {
  GraduationCap,
  MessageSquareQuote,
  PencilRuler,
  BarChart3,
  UserCircle,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { type User } from "@supabase/supabase-js";

interface StudentDashboardProps {
  user: User;
}

// Función para detectar si es dispositivo móvil
function esDispositivoMovil(): boolean {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  // Usamos el store global de UI
  const { activeTab, setActiveTab } = useUIStore();

  // Estado para controlar si hay operaciones críticas (Mantenemos local porque es efímero)
  const [criticalOperationInProgress, setCriticalOperationInProgress] =
    useState(false);

  // Lista de pestañas disponibles para Estudiante
  const tabs = [
    { id: "recomendacion", label: "Sugerencias", icon: GraduationCap },
    { id: "experiencias", label: "Experiencias", icon: MessageSquareQuote },
    { id: "inscripcion", label: "Inscripción", icon: PencilRuler },
    { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
    { id: "perfil", label: "Perfil", icon: UserCircle },
  ];

  // Efecto para asegurar una pestaña válida al montar
  useEffect(() => {
    const validTabs = tabs.map((t) => t.id);
    if (!validTabs.includes(activeTab)) {
      setActiveTab("recomendacion");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escuchar eventos de operaciones críticas (Uploads masivos, etc)
  useEffect(() => {
    const handleStart = () => setCriticalOperationInProgress(true);
    const handleEnd = () => setCriticalOperationInProgress(false);

    window.addEventListener("criticalOperationStart", handleStart);
    window.addEventListener("criticalOperationEnd", handleEnd);

    return () => {
      window.removeEventListener("criticalOperationStart", handleStart);
      window.removeEventListener("criticalOperationEnd", handleEnd);
    };
  }, []);

  // Prevenir navegación durante operaciones críticas
  useEffect(() => {
    if (!esDispositivoMovil() && criticalOperationInProgress) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Operación en progreso. ¿Salir?";
        return e.returnValue;
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [criticalOperationInProgress]);

  // Manejador seguro de cambio de pestaña
  const handleTabChange = (tab: string) => {
    if (!esDispositivoMovil() && criticalOperationInProgress) {
      if (!confirm("Hay una operación en progreso. ¿Cambiar de pestaña?")) {
        return;
      }
    }
    setActiveTab(tab);
  };

  // Listener para cambios externos (ej: desde Header "Ir a Perfil")
  useEffect(() => {
    const handleChangeTab = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        handleTabChange(customEvent.detail);
      }
    };
    window.addEventListener("changeTab", handleChangeTab);
    return () => window.removeEventListener("changeTab", handleChangeTab);
  }, [criticalOperationInProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "recomendacion":
        return <Recomendacion user={user} />;
      case "inscripcion":
        return <Inscripcion user={user} />;
      case "estadisticas":
        return <EstadisticasMateria />;
      case "experiencias":
        return <ExperienciasExamen user={user} />;
      case "perfil":
        return <Perfil />;
      default:
        // Default safe
        return <Recomendacion user={user} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30 dark:bg-background">
      {!esDispositivoMovil() && criticalOperationInProgress && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium dark:bg-yellow-600">
          ⚠️ Operación en progreso - No cierres esta ventana
        </div>
      )}

      {/* Barra de navegación */}
      <nav className="bg-background border-b border-border sticky top-16 z-30">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-1 overflow-x-auto whitespace-nowrap custom-scrollbar pb-1 sm:pb-0">
              <div className="inline-flex items-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    disabled={
                      !esDispositivoMovil() &&
                      criticalOperationInProgress &&
                      activeTab !== tab.id
                    }
                    className={`
                      inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3
                       text-sm font-medium border-b-2 transition-colors duration-200
                      ${
                        activeTab === tab.id
                          ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                          : "text-muted-foreground border-transparent hover:text-blue-600 hover:bg-muted dark:hover:text-blue-400"
                      }
                      ${
                        !esDispositivoMovil() &&
                        criticalOperationInProgress &&
                        activeTab !== tab.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    `}
                  >
                    <tab.icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={`
                        ${["perfil", "estadisticas"].includes(tab.id) ? "hidden sm:inline" : ""}
                        ${["recomendacion", "experiencias", "inscripcion"].includes(tab.id) ? "hidden md:inline" : ""}
                    `}
                    >
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden lg:block text-right pl-4">
              <span className="text-xs text-muted-foreground truncate">
                Usuario: {user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 w-full container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
