"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookCopy, Calendar, ThumbsUp, BarChart2, Info } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

interface ResultadosProps {
  recomendaciones: any[];
  criterio: string;
  planCodigo?: string;
}

export function ResultadosRecomendacion({
  recomendaciones,
  criterio,
  planCodigo,
}: ResultadosProps) {
  const { setActiveTab, setStatsParams } = useUIStore();

  const handleVerEstadisticas = (codigoMateria: string) => {
    if (!planCodigo) return;
    setStatsParams({
      plan: planCodigo,
      materia: codigoMateria,
      periodo: "TODOS_LOS_TIEMPOS",
    });
    setActiveTab("estadisticas");
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
      {/* --- EXPLICACIÓN DEL PUNTAJE (Solo visible en modo ESTADISTICAS) --- */}
      {criterio === "ESTADISTICAS" && (
        <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-md border border-blue-100 dark:border-blue-900 flex gap-3 items-start text-sm text-blue-800 dark:text-blue-300">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">¿Cómo ordenamos estas materias?</span>
            El <strong>Puntaje</strong> te sugiere qué rendir primero combinando dos factores: 
            la <strong>probabilidad de aprobar (70%)</strong> y qué tan <strong>accesible/fácil</strong> es la materia (30%).
          </div>
        </div>
      )}

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
              {/* Badge opcional de aprobación si se desea mantener */}
              {criterio === "ESTADISTICAS" && final.estadisticas && (
                <Badge variant="outline" className="hidden sm:inline-flex border-primary/20 text-primary">
                  {final.estadisticas.porcentajeAprobados.toFixed(0)}% Aprobación
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <InfoCriterio final={final} criterio={criterio} />

            {planCodigo && (
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
      <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2">
        {/* COLUMNA 1: PUNTAJE DESTACADO */}
        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded border border-primary/20 flex flex-col justify-center">
          <div className="font-bold text-primary text-lg">
             {/* Mostramos el puntaje calculado en el backend */}
            {final.estadisticas.puntaje ? final.estadisticas.puntaje.toFixed(0) : "-"}
          </div>
          <div className="text-[10px] text-primary/80 uppercase font-bold tracking-wider">
            Puntaje
          </div>
        </div>

        {/* COLUMNA 2: PROMEDIO */}
        <div className="bg-muted p-2 rounded flex flex-col justify-center">
          <div className="font-bold text-foreground">
            {final.estadisticas.promedioNotas.toFixed(1)}
          </div>
          <div className="text-muted-foreground text-[10px]">Promedio Notas</div>
        </div>

        {/* COLUMNA 3: DIAS ESTUDIO */}
        <div className="bg-muted p-2 rounded flex flex-col justify-center">
          <div className="font-bold text-foreground">
            {final.estadisticas.promedioDiasEstudio.toFixed(0)}
          </div>
          <div className="text-muted-foreground text-[10px]">Promedio Días Estudio</div>
        </div>

        {/* COLUMNA 4: DIFICULTAD */}
        <div className="bg-muted p-2 rounded flex flex-col justify-center">
          <div className="font-bold text-foreground">
            {final.estadisticas.promedioDificultad.toFixed(1)}
          </div>
          <div className="text-muted-foreground text-[10px]">Dificultad promedio</div>
        </div>
      </div>
    );
  }

  return null;
}