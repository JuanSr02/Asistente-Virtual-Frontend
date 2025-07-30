"use client";

import { useState, useEffect } from "react";
import EstadisticasGenerales from "../estadisticas-generales/page";
import EstadisticasMateria from "../../estadisticasMateria/page";
import EstadisticasPorCarrera from "../estadisticas-por-carrera/page"; // NUEVO IMPORT
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { ListChecks, BarChart3, GraduationCap, LineChart } from "lucide-react"; // NUEVO ICONO

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Estadisticas() {
  const { estadisticasState, setEstadisticasState } = useSessionPersistence();
  const [activeTab, setActiveTab] = useState(estadisticasState.activeTab);

  useEffect(() => {
    setActiveTab(estadisticasState.activeTab);
  }, [estadisticasState.activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEstadisticasState("activeTab", tab);
  };

  const tabs = [
    { id: "generales", label: "Generales", icon: ListChecks },
    { id: "materia", label: "Por Materia", icon: BarChart3 },
    { id: "carrera", label: "Por Carrera", icon: GraduationCap }, // NUEVA TAB
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "generales":
        return <EstadisticasGenerales />;
      case "materia":
        return <EstadisticasMateria />;
      case "carrera":
        return <EstadisticasPorCarrera />; // NUEVO CASO
      default:
        return (
          <div className="text-center py-16 text-gray-500 flex flex-col items-center gap-4">
            <LineChart className="w-12 h-12 text-gray-300" />
            <p className="text-lg">Contenido no disponible.</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full shadow-lg border border-gray-200">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
          <LineChart className="w-6 h-6 text-blue-600" />
          Estadísticas del Sistema
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          Visualiza estadísticas generales, por materia o por carrera
          específica.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border-b border-gray-200 px-4 sm:px-6">
          <nav className="flex flex-col sm:flex-row sm:gap-2 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  inline-flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto
                  px-4 py-3 text-sm font-medium border-b-4 transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "text-blue-600 border-blue-600 font-semibold"
                      : "text-gray-500 border-transparent hover:text-blue-600 hover:border-gray-300"
                  }
                `}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[25rem]">{renderContent()}</div>
      </CardContent>
    </Card>
  );
}
