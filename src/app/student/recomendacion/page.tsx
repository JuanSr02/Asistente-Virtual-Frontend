"use client";

import { useState } from "react";
import { type User } from "@supabase/supabase-js";
import { usePersona } from "@/hooks/domain/usePersona"; // NUEVO IMPORT
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { useRecomendaciones } from "@/hooks/domain/useRecomendaciones";
import { CargaHistoria } from "@/components/student/recomendacion/CargaHistoria";
import { ResultadosRecomendacion } from "@/components/student/recomendacion/ResultadosRecomendacion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export default function Recomendacion({ user }: { user: User }) {
  const [criterio, setCriterio] = useState("CORRELATIVAS");

  // 1. Obtener Persona (ID Numérico)
  const { data: persona, isLoading: isLoadingPersona } = usePersona(
    user.id,
    user.email
  );

  // 2. Obtener Historia (usando ID Numérico)
  const {
    historia,
    planes,
    upload,
    isUploading,
    remove,
    isDeleting,
    isLoadingHistoria,
  } = useHistoriaAcademica(persona?.id); // Pasamos undefined si aún no cargó persona

  // 3. Obtener Recomendaciones
  const {
    recomendaciones,
    isLoading: isLoadingRecs,
    refetch,
  } = useRecomendaciones(
    persona?.id, // Pasamos el ID numérico
    criterio,
    !!historia // Solo fetch si hay historia
  );

  // Loading inicial combinado
  if (isLoadingPersona || (persona?.id && isLoadingHistoria)) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  // Caso borde: No se encontró la persona
  if (!persona && !isLoadingPersona) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold">Perfil no encontrado</h3>
        <p className="text-muted-foreground">
          No pudimos vincular tu usuario con un perfil académico. Contacta a
          soporte.
        </p>
      </div>
    );
  }

  // Vista 1: Sin historia cargada
  if (!historia) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        <CargaHistoria
          planes={planes}
          onUpload={(file, plan) => upload({ file, planCodigo: plan })}
          isUploading={isUploading}
        />
      </div>
    );
  }

  // Vista 2: Con historia (Resultados)
  return (
    <div className="space-y-6">
      {/* Header de Estado */}
      <div className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-500 h-6 w-6" />
          <div>
            <h3 className="font-semibold">Historia Académica Activa</h3>
            <p className="text-sm text-muted-foreground">
              Plan: {historia.plan_de_estudio_codigo}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://g3.unsl.edu.ar/g3/", "_blank")}
          >
            SIU Guaraní
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("¿Eliminar historia académica?")) remove();
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">Sugerencias de Finales</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={criterio} onValueChange={setCriterio}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CORRELATIVAS">
                Importancia (Correlativas)
              </SelectItem>
              <SelectItem value="VENCIMIENTO">Vencimiento</SelectItem>
              <SelectItem value="ESTADISTICAS">Dificultad</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoadingRecs}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoadingRecs ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Lista de Resultados */}
      {isLoadingRecs ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <ResultadosRecomendacion
          recomendaciones={recomendaciones}
          criterio={criterio}
        />
      )}
    </div>
  );
}
