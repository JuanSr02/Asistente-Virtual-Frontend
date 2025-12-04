"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Props {
  materias: any[];
  onSelect: (materia: any) => void;
  seleccionada: any | null;
}

export function MateriasDisponibles({
  materias,
  onSelect,
  seleccionada,
}: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">1. Materias Disponibles</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {materias.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground text-sm">
            No tienes materias disponibles para inscribirte.
          </p>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {materias.map((m) => (
              <button
                key={m.codigo}
                onClick={() => onSelect(m)}
                className={`w-full text-left p-4 text-sm hover:bg-muted/50 transition-colors flex justify-between items-center
                  ${seleccionada?.codigo === m.codigo ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : ""}
                `}
              >
                <div>
                  <p className="font-medium">{m.nombre}</p>
                  <span className="text-xs text-muted-foreground">
                    {m.codigo}
                  </span>
                </div>
                {seleccionada?.codigo === m.codigo && (
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
