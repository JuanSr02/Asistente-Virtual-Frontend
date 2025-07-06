"use client";

import { useState, useEffect } from "react";
import PlanesEstudio from "../planes-estudio/page";
import Estadisticas from "../estadisticas/page";
import Perfil from "@/app/perfil/page";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { BookOpen, BarChart3, UserCircle, LayoutDashboard } from "lucide-react";

// --- LÓGICA DEL COMPONENTE SIN CAMBIOS ---
export default function AdminDashboard({ user }) {
  const { dashboardState, setDashboardState, updateLastVisited } =
    useSessionPersistence();
  const [activeTab, setActiveTab] = useState(dashboardState.activeTab);

  useEffect(() => {
    updateLastVisited();
  }, []);

  useEffect(() => {
    setActiveTab(dashboardState.activeTab);
  }, [dashboardState.activeTab]);

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

  // Array de pestañas para evitar repetición en el JSX
  const tabs = [
    { id: "planes", label: "Planes de Estudio", icon: BookOpen },
    { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
    { id: "perfil", label: "Perfil", icon: UserCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "planes":
        return <PlanesEstudio />;
      case "estadisticas":
        return <Estadisticas />;
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Pestañas de navegación */}
            <div className="flex items-center">
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
                  <tab.icon className="h-5 w-5" />
                  {/* El texto de la pestaña se muestra solo en pantallas 'sm' y más grandes */}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Información del usuario (oculto en pantallas muy pequeñas) */}
            <div className="hidden md:block text-right">
              <span className="text-xs text-gray-500">
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
