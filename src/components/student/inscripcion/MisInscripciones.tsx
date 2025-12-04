"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  inscripciones: any[];
  onBaja: (id: number) => void;
  isProcessing: boolean;
}

export function MisInscripciones({
  inscripciones,
  onBaja,
  isProcessing,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Inscripciones Activas</CardTitle>
      </CardHeader>
      <CardContent>
        {inscripciones.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No estás inscripto a ninguna mesa.
          </p>
        ) : (
          <div className="space-y-3">
            {inscripciones.map((ins) => (
              <div
                key={ins.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-sm">{ins.materiaNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {ins.turno} {ins.anio}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => {
                    if (confirm("¿Anular inscripción?")) onBaja(ins.id);
                  }}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
