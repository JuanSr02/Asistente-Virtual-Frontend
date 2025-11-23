"use client";

import { useState, useEffect } from "react";
import Recomendacion from "../recomendacion/page";
import EstadisticasMateria from "@/app/estadisticasMateria/page";
import Inscripcion from "../inscripcion/page";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import ExperienciasExamen from "../experiencias-examen/page";
import Perfil from "@/app/perfil/page";
import {
  GraduationCap,
  MessageSquareQuote,
  PencilRuler,
  BarChart3,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";

// Tipos
interface User {
  id: string;
  email: string;
  // Agrega otras propiedades si el objeto user las tiene
}

interface StudentDashboardProps {
  user: User;
}

// Función para detectar si es dispositivo móvil
function esDispositivoMovil(): boolean {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const { dashboardState, setDashboardState, updateLastVisited } =
    useSessionPersistence();

  const [activeTab, setActiveTab] = useState<string>(
    dashboardState?.activeTab === "planes"
      ? "recomendacion"
      : dashboardState?.activeTab || "recomendacion"
  );

  // NUEVO: Estado para controlar si hay operaciones críticas
  const [criticalOperationInProgress, setCriticalOperationInProgress] =
    useState(false);

  useEffect(() => {
    updateLastVisited();
  }, []);

  useEffect(() => {
    if (dashboardState?.activeTab === "planes") {
      setActiveTab("recomendacion");
      setDashboardState("activeTab", "recomendacion");
    } else {
      setActiveTab(dashboardState?.activeTab || "recomendacion");
    }
  }, [dashboardState?.activeTab]);

  // NUEVO: Escuchar eventos de operaciones críticas desde el componente Recomendacion
  useEffect(() => {
    const handleCriticalOperationStart = () => {
      setCriticalOperationInProgress(true);
    };

    const handleCriticalOperationEnd = () => {
      setCriticalOperationInProgress(false);
    };

    window.addEventListener(
      "criticalOperationStart",
      handleCriticalOperationStart
    );
    window.addEventListener("criticalOperationEnd", handleCriticalOperationEnd);

    return () => {
      window.removeEventListener(
        "criticalOperationStart",
        handleCriticalOperationStart
      );
      window.removeEventListener(
        "criticalOperationEnd",
        handleCriticalOperationEnd
      );
    };
  }, []);

  // NUEVO: Prevenir navegación durante operaciones críticas (solo en desktop)
  useEffect(() => {
    if (!esDispositivoMovil() && criticalOperationInProgress) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue =
          "Hay una operación en progreso. ¿Estás seguro de que quieres salir?";
        return e.returnValue;
      };

      const handlePopState = () => {
        if (criticalOperationInProgress) {
          const confirmLeave = window.confirm(
            "Hay una operación crítica en progreso. ¿Estás seguro de que quieres salir? Esto podría causar problemas con la persistencia de datos."
          );
          if (!confirmLeave) {
            // Prevenir la navegación
            window.history.pushState(null, "", window.location.href);
          }
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      // Agregar estado al historial para detectar navegación hacia atrás
      window.history.pushState(null, "", window.location.href);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [criticalOperationInProgress]);

  const handleTabChange = (tab: string) => {
    // NUEVO: Prevenir cambio de pestaña durante operaciones críticas (solo en desktop)
    if (!esDispositivoMovil() && criticalOperationInProgress) {
      const confirmChange = window.confirm(
        "Hay una operación crítica en progreso. ¿Estás seguro de que quieres cambiar de pestaña? Esto podría causar problemas con la persistencia de datos."
      );
      if (!confirmChange) {
        return; // No cambiar de pestaña
      }
    }

    setActiveTab(tab);
    setDashboardState("activeTab", tab);
    updateLastVisited();
  };

  useEffect(() => {
    const handleChangeTab = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newTab = customEvent.detail;
      if (newTab && newTab !== activeTab) {
        handleTabChange(newTab);
      }
    };

    window.addEventListener("changeTab", handleChangeTab);
    return () => window.removeEventListener("changeTab", handleChangeTab);
  }, [activeTab, criticalOperationInProgress]); // Agregar criticalOperationInProgress como dependencia

  // Array de pestañas para un código más limpio
  const tabs = [
    { id: "recomendacion", label: "Sugerencias", icon: GraduationCap },
    { id: "experiencias", label: "Experiencias", icon: MessageSquareQuote },
    { id: "inscripcion", label: "Inscripción", icon: PencilRuler },
    { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
    { id: "perfil", label: "Perfil", icon: UserCircle },
  ];

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
        return (
          <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
            <LayoutDashboard className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <p className="text-lg">
              Selecciona una opción del menú para comenzar.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30 dark:bg-background">
      {/* NUEVO: Indicador de operación crítica en progreso */}
      {!esDispositivoMovil() && criticalOperationInProgress && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium dark:bg-yellow-600">
          ⚠️ Operación en progreso - No cierres esta ventana ni cambies de
          pestaña
        </div>
      )}

      {/* Barra de navegación de pestañas */}
      <nav className="bg-background border-b border-border sticky top-16 z-30">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Contenedor de pestañas con scroll horizontal en móvil */}
            <div className="flex-1 overflow-x-auto whitespace-nowrap custom-scrollbar pb-1 sm:pb-0">
              <div className="inline-flex items-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
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
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    disabled={
                      !esDispositivoMovil() &&
                      criticalOperationInProgress &&
                      activeTab !== tab.id
                    }
                  >
                    <tab.icon className="h-5 w-5 flex-shrink-0" />
                    {/* El texto se muestra a partir de 'sm' para algunas y 'md' para otras */}
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
            {/* Información del usuario (oculto en pantallas muy pequeñas) */}
            <div className="hidden lg:block text-right pl-4">
              <span className="text-xs text-muted-foreground truncate">
                Usuario: {user.email}
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
