"use client";

import { useEffect } from "react";
import PlanesEstudio from "../planes-estudio/page";
import Estadisticas from "../estadisticas/page";
import Perfil from "@/app/perfil/page";
import { useUIStore } from "@/stores/ui-store";
import { BookOpen, BarChart3, UserCircle } from "lucide-react";
import { type User } from "@supabase/supabase-js";

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { activeTab, setActiveTab } = useUIStore();

  // Lista de pestañas disponibles para Admin
  const tabs = [
    { id: "planes", label: "Planes de Estudio", icon: BookOpen },
    { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
    { id: "perfil", label: "Perfil", icon: UserCircle },
  ];

  // Efecto para asegurar una pestaña válida al montar
  useEffect(() => {
    const validTabs = tabs.map((t) => t.id);
    // Si la tab guardada no es válida para admin (ej: viene de student), forzamos 'planes'
    if (!validTabs.includes(activeTab)) {
      setActiveTab("planes");
    }
  }, []);

  // Compatibilidad con el Header (Botón Perfil)
  useEffect(() => {
    const handleChangeTab = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener("changeTab", handleChangeTab);
    return () => window.removeEventListener("changeTab", handleChangeTab);
  }, [setActiveTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "estadisticas":
        return <Estadisticas />;
      case "perfil":
        return <Perfil />;
      case "planes":
      default:
        // Por defecto siempre Planes, adiós al estado vacío
        return <PlanesEstudio />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30 dark:bg-background">
      {/* Barra de navegación de pestañas */}
      <nav className="bg-background border-b border-border sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Pestañas de navegación */}
            <div className="flex items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 
                    text-sm font-medium border-b-2 transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                        : "text-muted-foreground border-transparent hover:text-blue-600 hover:bg-muted dark:hover:text-blue-400"
                    }
                  `}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Información del usuario */}
            <div className="hidden md:block text-right">
              <span className="text-xs text-muted-foreground">
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
