"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Users } from "lucide-react";

interface Props {
  inscripciones: any[];
  onBaja: (id: number) => void;
  onVer: (inscripcion: any) => void; // Nueva prop
  isProcessing: boolean;
}

export function MisInscripciones({
  inscripciones,
  onBaja,
  onVer,
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
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg border gap-3"
              >
                <div>
                  <p className="font-medium text-sm">{ins.materiaNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {ins.turno} {ins.anio}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVer(ins)}
                    className="flex-1 sm:flex-none"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => {
                      onBaja(ins.id);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
