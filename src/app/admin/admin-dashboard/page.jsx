"use client";

import { useState, useEffect } from "react";
import PlanesEstudio from "../planes-estudio/page";
import Estadisticas from "../estadisticas/page";
import Perfil from "@/app/perfil/page";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";

// Dashboard específico para administradores
export default function AdminDashboard({ user }) {
  const { dashboardState, setDashboardState, updateLastVisited } =
    useSessionPersistence();
  const [activeTab, setActiveTab] = useState(dashboardState.activeTab);

  // Actualizar la última visita cuando el componente se monta
  useEffect(() => {
    updateLastVisited();
  }, []);

  // Sincronizar el estado local con el persistente
  useEffect(() => {
    setActiveTab(dashboardState.activeTab);
  }, [dashboardState.activeTab]);

  // Manejar cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDashboardState("activeTab", tab);
    updateLastVisited();
  };

  // Escuchar eventos de cambio de pestaña desde otros componentes
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

  // Renderizar el contenido según la pestaña activa
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
          <div className="text-center py-8 text-gray-500">
            Seleccione una opción del menú
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Barra de navegación horizontal */}
      <nav className="bg-white px-8 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex gap-4">
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "planes"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("planes")}
          >
            📚 Planes de Estudio
          </button>
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "estadisticas"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("estadisticas")}
          >
            📊 Estadísticas
          </button>
          <button
            className={`px-6 py-3 text-base font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === "perfil"
                ? "text-blue-500 border-blue-500 font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
            onClick={() => handleTabChange("perfil")}
          >
            👤 Perfil
          </button>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">Usuario: {user.email}</span>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {renderContent()}
      </div>
    </div>
  );
}
