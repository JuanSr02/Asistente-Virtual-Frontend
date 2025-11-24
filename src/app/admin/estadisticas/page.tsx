"use client";

import { useState, useEffect } from "react";
import EstadisticasGenerales from "../estadisticas-generales/page";
import EstadisticasMateria from "../../estadisticasMateria/page";
import EstadisticasPorCarrera from "../estadisticas-por-carrera/page";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import {
  ListChecks,
  BarChart3,
  GraduationCap,
  LineChart,
  LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Definimos la interfaz para los objetos de las pestañas
interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Como no tengo el archivo del hook, defino una interfaz local para lo que esperamos recibir.
// Lo ideal sería que el hook useSessionPersistence ya exportara sus propios tipos.
interface EstadisticasState {
  activeTab: string;
}

export default function Estadisticas() {
  // Tipamos el retorno del hook (si el hook no está tipado en su origen)
  const { estadisticasState, setEstadisticasState } =
    useSessionPersistence() as {
      estadisticasState: EstadisticasState;
      setEstadisticasState: (key: string, value: string) => void;
    };

  const [activeTab, setActiveTab] = useState<string>(
    estadisticasState?.activeTab || "generales"
  );

  useEffect(() => {
    if (estadisticasState?.activeTab) {
      setActiveTab(estadisticasState.activeTab);
    }
  }, [estadisticasState?.activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setEstadisticasState("activeTab", tabId);
  };

  const tabs: TabItem[] = [
    { id: "generales", label: "Generales", icon: ListChecks },
    { id: "materia", label: "Por Materia", icon: BarChart3 },
    { id: "carrera", label: "Por Carrera", icon: GraduationCap },
  ];

  const renderContent = (): JSX.Element => {
    switch (activeTab) {
      case "generales":
        return <EstadisticasGenerales />;
      case "materia":
        return <EstadisticasMateria />;
      case "carrera":
        return <EstadisticasPorCarrera />;
      default:
        return (
          <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
            <LineChart className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            <p className="text-lg">Contenido no disponible.</p>
          </div>
        );
    }
  };

  return (
    // Agregado dark:bg-card y bordes adaptativos
    <Card className="w-full shadow-lg border border-gray-200 dark:border-gray-800 dark:bg-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
          <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Estadísticas del Sistema
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Visualiza estadísticas generales, por materia o por carrera
          específica.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6">
          <nav className="flex flex-col sm:flex-row sm:gap-2 -mb-px">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    inline-flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto
                    px-4 py-3 text-sm font-medium border-b-4 transition-all duration-200
                    ${
                      isActive
                        ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold"
                        : "text-muted-foreground border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300 dark:hover:border-gray-700"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="min-h-[25rem]">{renderContent()}</div>
      </CardContent>
    </Card>
  );
}
