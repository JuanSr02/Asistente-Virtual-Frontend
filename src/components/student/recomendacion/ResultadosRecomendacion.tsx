"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookCopy, Calendar, ThumbsUp, BarChart2 } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

interface ResultadosProps {
  recomendaciones: any[];
  criterio: string;
  planCodigo?: string; // Necesitamos el plan para redirigir
}

export function ResultadosRecomendacion({
  recomendaciones,
  criterio,
  planCodigo,
}: ResultadosProps) {
  const { setActiveTab, setStatsParams } = useUIStore();

  // Handler para la navegación mágica
  const handleVerEstadisticas = (codigoMateria: string) => {
    if (!planCodigo) return;

    // 1. Seteamos los parámetros para que Estadísticas sepa qué cargar
    setStatsParams({
      plan: planCodigo,
      materia: codigoMateria,
      periodo: "TODOS_LOS_TIEMPOS",
    });

    // 2. Cambiamos la pestaña
    setActiveTab("estadisticas");

    // Scroll top suave por si acaso
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (recomendaciones.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-4 animate-fade-in">
        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <ThumbsUp className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            ¡Felicitaciones!
          </h3>
          <p className="text-muted-foreground mt-1">
            No tienes más finales para rendir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 animate-fade-in">
      {recomendaciones.map((final, index) => (
        <Card
          key={final.codigoMateria}
          className="hover:shadow-md transition-all flex flex-col"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {final.nombreMateria}
                  </CardTitle>
                </div>
              </div>
              {criterio === "ESTADISTICAS" && final.estadisticas && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Aprobación:{" "}
                  {final.estadisticas.porcentajeAprobados.toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <InfoCriterio final={final} criterio={criterio} />

            {criterio === "ESTADISTICAS" && planCodigo && (
              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-950/50"
                  onClick={() => handleVerEstadisticas(final.codigoMateria)}
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Ver estadísticas detalladas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InfoCriterio({ final, criterio }: { final: any; criterio: string }) {
  if (criterio === "CORRELATIVAS") {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
        <BookCopy className="h-4 w-4" />
        <span>
          Es correlativa de <strong>{final.vecesEsCorrelativa}</strong> materias
          futuras.
        </span>
      </div>
    );
  }

if (criterio === "VENCIMIENTO") {
  const estaVencida = final.semanasParaVencimiento < 0;
  // Si está vencida, también es crítico (<= 4), así que mantenemos el color rojo
  const esCritico = final.semanasParaVencimiento <= 4;

  return (
    <div
      className={`flex items-center gap-2 text-sm p-2 rounded ${
        esCritico
          ? "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20"
          : "text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/20"
      }`}
    >
      <Calendar className="h-4 w-4" />
      <span>
        {estaVencida
          ? "Materia Vencida (Averigua si puedes pedir extensión de regularidad si no lo has hecho)"
          : `Vence el ${final.fechaVencimiento} (Regularidad: ${final.fechaRegularidad})`}
      </span>
    </div>
  );
}

  if (criterio === "ESTADISTICAS" && final.estadisticas) {
    return (
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-muted p-2 rounded">
          <div className="font-bold">
            {final.estadisticas.promedioNotas.toFixed(1)}
          </div>
          <div className="text-muted-foreground">Promedio</div>
        </div>
        <div className="bg-muted p-2 rounded">
          <div className="font-bold">
            {final.estadisticas.promedioDiasEstudio.toFixed(1)}
          </div>
          <div className="text-muted-foreground">Días Est.</div>
        </div>
        <div className="bg-muted p-2 rounded">
          <div className="font-bold">
            {final.estadisticas.promedioDificultad.toFixed(1)}
          </div>
          <div className="text-muted-foreground">Dificultad</div>
        </div>
      </div>
    );
  }

  return null;
}
