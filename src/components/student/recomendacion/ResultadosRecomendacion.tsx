"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookCopy, Calendar, TrendingUp } from "lucide-react";

interface ResultadosProps {
  recomendaciones: any[];
  criterio: string;
}

export function ResultadosRecomendacion({
  recomendaciones,
  criterio,
}: ResultadosProps) {
  if (recomendaciones.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se encontraron materias sugeridas para este criterio.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 animate-fade-in">
      {recomendaciones.map((final, index) => (
        <Card
          key={final.codigoMateria}
          className="hover:shadow-md transition-all"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {final.nombreMateria}
                  </CardTitle>
                  <CardDescription>
                    Código: {final.codigoMateria}
                  </CardDescription>
                </div>
              </div>
              {criterio === "ESTADISTICAS" && final.estadisticas && (
                <Badge variant="secondary">
                  Aprobación: {final.estadisticas.porcentajeAprobados}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <InfoCriterio final={final} criterio={criterio} />
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
          Vence el {final.fechaVencimiento} ({final.fechaRegularidad})
        </span>
      </div>
    );
  }

  if (criterio === "ESTADISTICAS" && final.estadisticas) {
    return (
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-muted p-2 rounded">
          <div className="font-bold">{final.estadisticas.promedioNotas}</div>
          <div className="text-muted-foreground">Promedio</div>
        </div>
        <div className="bg-muted p-2 rounded">
          <div className="font-bold">
            {final.estadisticas.promedioDiasEstudio}
          </div>
          <div className="text-muted-foreground">Días Est.</div>
        </div>
        <div className="bg-muted p-2 rounded">
          <div className="font-bold">
            {final.estadisticas.promedioDificultad}
          </div>
          <div className="text-muted-foreground">Dificultad</div>
        </div>
      </div>
    );
  }

  return null;
}
