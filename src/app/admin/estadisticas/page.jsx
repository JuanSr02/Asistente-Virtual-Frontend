"use client";

import { useState, useEffect } from "react";
import EstadisticasGenerales from "../estadisticas-generales/page";
import EstadisticasMateria from "../../estadisticasMateria/page";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";

export default function Estadisticas() {
  const { estadisticasState, setEstadisticasState } = useSessionPersistence();
  const [activeTab, setActiveTab] = useState(estadisticasState.activeTab);

  // Sincronizar el estado local con el persistente
  useEffect(() => {
    setActiveTab(estadisticasState.activeTab);
  }, [estadisticasState.activeTab]);

  // Manejar cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEstadisticasState("activeTab", tab);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-600 pb-2 border-b border-blue-300">
          Estadísticas del Sistema
        </h2>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-2">
        <button
          className={`px-6 py-3 text-base font-medium cursor-pointer border-b-4 transition-all ${
            activeTab === "generales"
              ? "text-blue-500 border-blue-500 font-semibold"
              : "text-gray-600 border-transparent hover:text-gray-800"
          }`}
          onClick={() => handleTabChange("generales")}
        >
          Estadísticas Generales
        </button>
        <button
          className={`px-6 py-3 text-base font-medium cursor-pointer border-b-4 transition-all ${
            activeTab === "materia"
              ? "text-blue-500 border-blue-500 font-semibold"
              : "text-gray-600 border-transparent hover:text-gray-800"
          }`}
          onClick={() => handleTabChange("materia")}
        >
          Estadísticas por Materia
        </button>
      </div>

      {/* Contenido */}
      <div className="min-h-[25rem]">
        {activeTab === "generales" ? (
          <EstadisticasGenerales />
        ) : (
          <EstadisticasMateria />
        )}
      </div>
    </div>
  );
}
