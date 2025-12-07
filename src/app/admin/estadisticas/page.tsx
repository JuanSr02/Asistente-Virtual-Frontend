"use client";

import { useState } from "react";
import EstadisticasGenerales from "../estadisticas-generales/page";
import EstadisticasMateria from "@/app/estadisticasMateria/page";
import EstadisticasPorCarrera from "../estadisticas-por-carrera/page";
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

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export default function Estadisticas() {
  
  const [activeTab, setActiveTab] = useState("generales");

  const tabs: TabItem[] = [
    { id: "generales", label: "Generales", icon: ListChecks },
    { id: "materia", label: "Por Materia", icon: BarChart3 },
    { id: "carrera", label: "Por Carrera", icon: GraduationCap },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "materia":
        return <EstadisticasMateria />;
      case "carrera":
        return <EstadisticasPorCarrera />;
      case "generales":
      default:
        return <EstadisticasGenerales />;
    }
  };

  return (
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
                  onClick={() => setActiveTab(tab.id)}
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
