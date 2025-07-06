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

// --- LÓGICA DEL COMPONENTE SIN CAMBIOS ---
export default function StudentDashboard({ user }) {
  const { dashboardState, setDashboardState, updateLastVisited } =
    useSessionPersistence();

  const [activeTab, setActiveTab] = useState(
    dashboardState?.activeTab === "planes"
      ? "recomendacion"
      : dashboardState?.activeTab || "recomendacion"
  );

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDashboardState("activeTab", tab);
    updateLastVisited();
  };

  useEffect(() => {
    const handleChangeTab = (event) => {
      const newTab = event.detail;
      if (newTab && newTab !== activeTab) {
        handleTabChange(newTab);
      }
    };
    window.addEventListener("changeTab", handleChangeTab);
    return () => window.removeEventListener("changeTab", handleChangeTab);
  }, [activeTab]);

  // Array de pestañas para un código más limpio
  const tabs = [
    { id: "recomendacion", label: "Recomendación", icon: GraduationCap },
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
          <div className="text-center py-16 text-gray-500 flex flex-col items-center gap-4">
            <LayoutDashboard className="w-12 h-12 text-gray-300" />
            <p className="text-lg">
              Selecciona una opción del menú para comenzar.
            </p>
          </div>
        );
    }
  };

  // --- JSX RESPONSIVE ---
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Barra de navegación de pestañas */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Contenedor de pestañas con scroll horizontal en móvil */}
            <div className="flex-1 overflow-x-auto whitespace-nowrap">
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
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-blue-600 hover:bg-gray-50"
                      }
                    `}
                    aria-current={activeTab === tab.id ? "page" : undefined}
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
              <span className="text-xs text-gray-500 truncate">
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
