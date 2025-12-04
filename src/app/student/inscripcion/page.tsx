"use client";

import { useState } from "react";
import { type User } from "@supabase/supabase-js";
import { usePersona } from "@/hooks/domain/usePersona"; // NUEVO
import { useInscripciones } from "@/hooks/domain/useInscripciones";
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { MateriasDisponibles } from "@/components/student/inscripcion/MateriasDisponibles";
import { MisInscripciones } from "@/components/student/inscripcion/MisInscripciones";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

export default function Inscripcion({ user }: { user: User }) {
  // 1. Obtener Persona
  const { data: persona, isLoading: isLoadingPersona } = usePersona(
    user.id,
    user.email
  );

  // 2. Obtener Historia (Depende de persona)
  const { historia, isLoadingHistoria } = useHistoriaAcademica(persona?.id);

  // 3. Hook de Inscripciones (Depende de persona e historia)
  const {
    materiasDisponibles,
    misInscripciones,
    isLoadingData,
    inscribirse,
    isInscribiendo,
    darseDeBaja,
    isDandoseDeBaja,
  } = useInscripciones(persona?.id, !!historia);

  // 4. Estado Local UI
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<any | null>(
    null
  );
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string>("");

  // Helpers
  const mesas = [
    "FEBRERO",
    "MARZO",
    "JULIO",
    "AGOSTO",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  const calcularAnio = (mesa: string) => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const mesMesa =
      {
        FEBRERO: 2,
        MARZO: 3,
        JULIO: 7,
        AGOSTO: 8,
        NOVIEMBRE: 11,
        DICIEMBRE: 12,
      }[mesa] || 12;

    return mesMesa < mesActual ? hoy.getFullYear() + 1 : hoy.getFullYear();
  };

  const handleInscribirse = async () => {
    if (!materiaSeleccionada || !mesaSeleccionada || !historia || !persona)
      return;

    try {
      await inscribirse({
        turno: mesaSeleccionada,
        anio: calcularAnio(mesaSeleccionada),
        materiaCodigo: materiaSeleccionada.codigo,
        materiaPlan: historia.plan_de_estudio_codigo,
        estudianteId: persona.id, // Usamos el ID numérico correcto
      });
      setMateriaSeleccionada(null);
      setMesaSeleccionada("");
    } catch (error) {
      // Error manejado en hook
    }
  };

  if (isLoadingPersona || isLoadingHistoria || isLoadingData) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!historia) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold">Falta Historia Académica</h3>
        <p className="text-muted-foreground mb-4">
          Debes cargar tu historia académica en la sección "Sugerencias" para
          poder inscribirte.
        </p>
        <Button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("changeTab", { detail: "recomendacion" })
            )
          }
        >
          Ir a Cargar Historia
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <MateriasDisponibles
          materias={materiasDisponibles}
          onSelect={setMateriaSeleccionada}
          seleccionada={materiaSeleccionada}
        />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Confirmar Mesa</CardTitle>
              <CardDescription>
                {materiaSeleccionada
                  ? `Para: ${materiaSeleccionada.nombre}`
                  : "Selecciona una materia primero"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={mesaSeleccionada}
                onValueChange={setMesaSeleccionada}
                disabled={!materiaSeleccionada}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un turno" />
                </SelectTrigger>
                <SelectContent>
                  {mesas.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m} {calcularAnio(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="w-full"
                disabled={
                  !materiaSeleccionada || !mesaSeleccionada || isInscribiendo
                }
                onClick={handleInscribirse}
              >
                {isInscribiendo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Confirmar Inscripción
              </Button>
            </CardContent>
          </Card>

          <MisInscripciones
            inscripciones={misInscripciones}
            onBaja={darseDeBaja}
            isProcessing={isDandoseDeBaja}
          />
        </div>
      </div>
    </div>
  );
}
