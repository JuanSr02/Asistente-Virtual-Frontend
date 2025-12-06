"use client";

import { useState, useRef } from "react";
import { type User } from "@supabase/supabase-js";
import { usePersona } from "@/hooks/domain/usePersona";
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { useRecomendaciones } from "@/hooks/domain/useRecomendaciones";
import { useConfirm } from "@/components/providers/confirm-dialog-provider"; // [NUEVO]
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
import {
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";
import { toast } from "sonner";

export default function Recomendacion({ user }: { user: User }) {
  const [criterio, setCriterio] = useState("CORRELATIVAS");
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  const { confirm } = useConfirm(); // [NUEVO] Hook de confirmación

  const { data: persona, isLoading: isLoadingPersona } = usePersona(
    user.id,
    user.email
  );

  const {
    historia,
    planes,
    upload,
    isUploading,
    remove,
    isDeleting,
    isLoadingHistoria,
  } = useHistoriaAcademica(persona?.id);

  const {
    recomendaciones,
    isLoading: isLoadingRecs,
    refetch,
  } = useRecomendaciones(persona?.id, criterio, !!historia);

  const handleUpdateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !historia) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
      toast.error("Formato no válido.");
      return;
    }

    try {
      await upload({
        file,
        planCodigo: historia.plan_de_estudio_codigo,
      });
      if (updateFileInputRef.current) updateFileInputRef.current.value = "";
    } catch (error) {
      // Error manejado en hook
    }
  };

  // [NUEVO] Handler con confirmación
  const handleDeleteHistoria = async () => {
    const ok = await confirm({
      title: "¿Eliminar Historia Académica?",
      description:
        "Se borrarán todos tus datos académicos, inscripciones ,experiencias y sugerencias. Tendrás que volver a subir el archivo para ver recomendaciones.",
      confirmText: "Sí, borrar todo",
      variant: "destructive",
    });

    if (ok) {
      remove();
    }
  };

  if (isLoadingPersona || (persona?.id && isLoadingHistoria)) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!persona && !isLoadingPersona) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold">Perfil no encontrado</h3>
        <p className="text-muted-foreground">Contacta a soporte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/30 dark:via-background dark:to-purple-950/30 border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Sugerencias Personalizadas
          </CardTitle>
          <CardDescription className="text-base">
            Hola <strong>{persona?.nombre_apellido}</strong>, estas son las
            mejores opciones para tus próximos finales.
          </CardDescription>
        </CardHeader>
      </Card>

      {!historia ? (
        <div className="max-w-2xl mx-auto mt-8">
          <CargaHistoria
            planes={planes}
            onUpload={(file, plan) => upload({ file, planCodigo: plan })}
            isUploading={isUploading}
          />
        </div>
      ) : (
        <>
          <div className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="text-green-600 dark:text-green-400 h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Historia Académica Activa
                </h3>
                <p className="text-sm text-muted-foreground">
                  Plan: <strong>{historia.plan_de_estudio_codigo}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://g3.unsl.edu.ar/g3/", "_blank")
                }
              >
                SIU Guaraní
              </Button>

              <input
                type="file"
                ref={updateFileInputRef}
                className="hidden"
                accept=".pdf,.xls,.xlsx"
                onChange={handleUpdateUpload}
                disabled={isUploading}
              />
              <Button
                variant="default"
                size="sm"
                onClick={() => updateFileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Actualizar
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteHistoria} // Usamos el nuevo handler
                disabled={isDeleting || isUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Materias Sugeridas
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {recomendaciones.length} encontradas
                </span>
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={criterio} onValueChange={setCriterio}>
                  <SelectTrigger className="w-[220px]">
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
                  variant="outline"
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

            {isLoadingRecs ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <ResultadosRecomendacion
                recomendaciones={recomendaciones}
                criterio={criterio}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
