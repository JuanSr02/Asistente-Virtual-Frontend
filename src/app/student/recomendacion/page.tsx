"use client";

import { useEffect, useRef } from "react";
import personaService from "@/services/personaService";
import historiaAcademicaService from "@/services/historiaAcademicaService";
import recomendacionService from "@/services/recomendacionService";
import planesEstudioService from "@/services/planesEstudioService";
import { useEnhancedSessionPersistence } from "@/hooks/useEnhancedSessionPersistence";
import { useSessionPersistence } from "@/hooks/useSessionPersistence"; // PASO 1: Importar useSessionPersistence
import { APP_CONFIG } from "@/lib/config";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Upload,
  Book,
  BookCopy,
  Trash2,
  RefreshCw,
  Sparkles,
  Youtube,
  FileText,
  ThumbsUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter, // PASO 2: Importar CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

// Tipos auxiliares
interface User {
  id: string;
  email: string;
}

interface EstadisticasMateria {
  porcentajeAprobados: number;
  promedioNotas: number;
  promedioDiasEstudio: number;
  promedioHorasDiarias: number;
  promedioDificultad: number;
}

interface FinalRecomendado {
  codigoMateria: string;
  nombreMateria: string;
  fechaRegularidad: string;
  fechaVencimiento: string;
  semanasParaVencimiento: number;
  vecesEsCorrelativa: number;
  estadisticas: EstadisticasMateria;
}

interface Plan {
  codigo: string;
  propuesta: string;
}

function esDispositivoMovil() {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const emitCriticalOperationStart = () => {
  if (!esDispositivoMovil()) {
    window.dispatchEvent(new CustomEvent("criticalOperationStart"));
  }
};

const emitCriticalOperationEnd = () => {
  if (!esDispositivoMovil()) {
    window.dispatchEvent(new CustomEvent("criticalOperationEnd"));
  }
};

export default function Recomendacion({ user }: { user: User }) {
  const {
    state,
    updateState,
    clearRecomendaciones,
    clearAllState,
    isStateStale,
    isInitialized,
    startCriticalOperation,
    endCriticalOperation,
  } = useEnhancedSessionPersistence();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    if (user && isInitialized && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      cargarDatosIniciales();
    }
  }, [user, isInitialized]);

  useEffect(() => {
    if (
      state.persona &&
      !state.historiaAcademica &&
      state.planes.length === 0
    ) {
      cargarPlanes();
    }
  }, [state.persona, state.historiaAcademica, state.planes.length]);

  const cargarDatosIniciales = async () => {
    updateState({ loadingPersona: true, error: null });
    try {
      let personaData = await personaService.obtenerPersonaPorSupabaseId(
        user.id
      );
      if (!personaData)
        personaData = await personaService.obtenerPersonaPorEmail(user.email);
      if (!personaData) {
        updateState({
          error: "No se encontró tu perfil en el sistema.",
          loadingPersona: false,
        });
        return;
      }

      updateState({ persona: personaData, personaId: personaData.id });

      const historia =
        await historiaAcademicaService.verificarHistoriaAcademica(
          personaData.id
        );
      if (historia) {
        updateState({ historiaAcademica: historia });
        const tieneRecomendacionesGuardadas =
          state.recomendaciones.length > 0 &&
          state.personaId === personaData.id &&
          state.lastFetch &&
          !isStateStale(30);
        if (tieneRecomendacionesGuardadas) {
          // Ya están en el estado
        } else {
          await obtenerRecomendaciones(
            personaData.id,
            state.criterioOrden,
            true
          );
        }
      } else {
        updateState({ historiaAcademica: null });
        await cargarPlanes();
      }
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      updateState({
        error: "Error al cargar tus datos. Intenta nuevamente.",
        loadingPersona: false,
      });
    } finally {
      updateState({ loadingPersona: false });
    }
  };

  const cargarPlanes = async () => {
    if (state.loadingPlanes) return;
    updateState({ loadingPlanes: true });
    try {
      const data = await planesEstudioService.obtenerPlanes();
      updateState({ planes: data || [] });
    } catch (err) {
      console.error("Error al cargar planes:", err);
      updateState({ error: "Error al cargar los planes de estudio." });
    } finally {
      updateState({ loadingPlanes: false });
    }
  };

  const obtenerRecomendaciones = async (
    estudianteId = state.persona?.id,
    orden = state.criterioOrden,
    isAutoLoad = false
  ) => {
    if (!estudianteId) return;
    updateState({ loadingRecomendaciones: true, error: null });
    try {
      const data = await recomendacionService.obtenerFinalesParaRendir(
        estudianteId,
        orden
      );
      const recomendacionesArray = Array.isArray(data) ? data : [];
      updateState({
        recomendaciones: recomendacionesArray,
        criterioOrden: orden,
        personaId: estudianteId,
        lastFetch: new Date().toISOString(),
      });
    } catch (err: any) {
      let errorMessage = "Error al obtener las sugerencias.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 404)
          errorMessage = "No se encontraron finales disponibles para rendir.";
        else if (status === 400)
          errorMessage =
            data?.message || "Datos inválidos para obtener sugerencias.";
        else
          errorMessage =
            data?.message ||
            `Error ${status}: No se pudieron obtener las sugerencias.`;
      }
      updateState({ error: errorMessage, recomendaciones: [] });
      if (!isAutoLoad) clearRecomendaciones();
    } finally {
      updateState({ loadingRecomendaciones: false });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isUpdate = false
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    const fileMimeType = file.type;

    if (
      !APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(fileExtension) &&
      !APP_CONFIG.FILES.ALLOWED_TYPES.includes(fileMimeType)
    ) {
      updateState({
        error: `Tipo de archivo no permitido. Use: ${APP_CONFIG.FILES.ALLOWED_EXTENSIONS.join(
          ", "
        )}`,
      });
      if (isUpdate && updateFileInputRef.current)
        updateFileInputRef.current.value = "";
      else if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const planAUsar = isUpdate
      ? state.historiaAcademica?.plan_de_estudio_codigo
      : state.planSeleccionado;
    if (!planAUsar) {
      updateState({ error: "Por favor, selecciona un plan de estudio." });
      return;
    }

    // NUEVO: Iniciar operación crítica
    startCriticalOperation();
    emitCriticalOperationStart();
    updateState({ uploading: true, error: null, success: null });

    try {
      let resultado;

      if (isUpdate)
        resultado = await historiaAcademicaService.actualizarHistoriaAcademica(
          file,
          state.persona.id,
          planAUsar
        );
      else
        resultado = await historiaAcademicaService.cargarHistoriaAcademica(
          file,
          state.persona.id,
          planAUsar
        );

      if (resultado && resultado.mensaje) {
        const accion = isUpdate ? "actualizada" : "cargada";
        let mensaje = `Historia académica ${accion}: ${resultado.mensaje}`;
        if (resultado.cantidadMateriasNuevas)
          mensaje += ` (${resultado.cantidadMateriasNuevas} materias nuevas)`;
        if (resultado.cantidadMateriasActualizadas)
          mensaje += ` (${resultado.cantidadMateriasActualizadas} materias actualizadas)`;
        updateState({ success: mensaje });
      } else {
        const accion = isUpdate ? "actualizada" : "cargada";
        updateState({ success: `Historia académica ${accion} exitosamente` });
      }

      clearRecomendaciones();
      setTimeout(async () => {
        try {
          const historia =
            await historiaAcademicaService.verificarHistoriaAcademica(
              state.persona.id
            );
          if (historia) {
            updateState({
              historiaAcademica: historia,
              criterioOrden: "CORRELATIVAS",
            });
            await obtenerRecomendaciones(state.persona.id, "CORRELATIVAS");
          } else {
            updateState({
              error:
                "La historia se procesó pero no se pudo verificar. Intenta recargar la página.",
            });
          }
        } catch (reloadErr) {
          updateState({
            error:
              "Historia cargada pero hubo un problema al actualizar la vista. Recarga la página.",
          });
        } finally {
          // NUEVO: Finalizar operación crítica
          endCriticalOperation();
          emitCriticalOperationEnd();
        }
      }, 2000);
    } catch (err: any) {
      let errorMessage = "Error al procesar el archivo.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400)
          errorMessage =
            data?.message || "El archivo no tiene el formato correcto.";
        else if (status === 404)
          errorMessage = "Plan de estudio no encontrado.";
        else if (status === 500) errorMessage = data?.message;
        else errorMessage = data?.message || `Error ${status}: ${err.message}`;
      } else if (err.request)
        errorMessage = "No se pudo conectar con el servidor.";
      else errorMessage = err.message || "Error desconocido.";

      updateState({ error: errorMessage });

      // NUEVO: Finalizar operación crítica en caso de error
      endCriticalOperation();
      emitCriticalOperationEnd();
    } finally {
      updateState({ uploading: false });
      if (isUpdate && updateFileInputRef.current)
        updateFileInputRef.current.value = "";
      else if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEliminarHistoria = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar toda tu historia académica?"
      )
    )
      return;

    // NUEVO: Iniciar operación crítica
    startCriticalOperation();
    emitCriticalOperationStart();
    updateState({ uploading: true, error: null, success: null });

    try {
      await historiaAcademicaService.eliminarHistoriaAcademica(
        state.persona.id
      );
      updateState({
        historiaAcademica: null,
        recomendaciones: [],
        criterioOrden: "CORRELATIVAS",
        success: "Historia académica eliminada.",
      });
      clearRecomendaciones();
      if (state.planes.length === 0) await cargarPlanes();
    } catch (err) {
      updateState({ error: "Error al eliminar la historia académica." });
    } finally {
      updateState({ uploading: false });
      endCriticalOperation();
      emitCriticalOperationEnd();
    }
  };

  const handleCriterioChange = (nuevoCriterio: string) => {
    updateState({ criterioOrden: nuevoCriterio });
    if (state.historiaAcademica && state.persona) {
      obtenerRecomendaciones(state.persona.id, nuevoCriterio);
    }
  };

  const handleRefrescarRecomendaciones = () => {
    if (state.historiaAcademica && state.persona) {
      clearRecomendaciones();
      obtenerRecomendaciones(state.persona.id, state.criterioOrden);
    }
  };

  const getDificultadColor = (d: number) =>
    d >= 7
      ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300"
      : d >= 5
        ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300"
        : d >= 3
          ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300"
          : "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300";

  const getDificultadTexto = (d: number) =>
    d >= 7
      ? "Alta"
      : d >= 5
        ? "Media-Alta"
        : d >= 3
          ? "Media"
          : d === 0
            ? "N/A"
            : "Baja";

  useEffect(() => {
    if (state.success || state.error) {
      const timer = setTimeout(() => {
        updateState({ success: null, error: null });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.error, updateState]);

  if (!isInitialized || (state.loadingPersona && !state.persona)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!state.persona) {
    return (
      <Card className="text-center p-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <CardTitle>Perfil no encontrado</CardTitle>
        <CardDescription>
          No se pudo encontrar tu perfil en el sistema.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/30 dark:via-background dark:to-purple-950/30">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
            📚 Sugerencias Personalizadas
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Hola {state.persona.nombre_apellido}, aquí tienes las mejores
            sugerencias para tus próximos finales.
          </CardDescription>
        </CardHeader>
      </Card>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-800 dark:text-red-300 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{state.success}</p>
        </div>
      )}

      {!state.historiaAcademica ? (
        <Card>
          <CardHeader className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <CardTitle>Carga tu Historia Académica</CardTitle>
            <CardDescription>
              Para obtener sugerencias, necesitamos tu historia académica
              completa en formato Excel o PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-lg mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                ¿No sabes cómo descargarla? Haz clic en el video tutorial y
                luego accede al SIU Guarani.
              </p>
              <div className="flex gap-2 justify-center mt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    window.open("https://youtu.be/K4uE6e0xp3M", "_blank")
                  }
                >
                  <Youtube className="mr-2 h-4 w-4" />
                  Ver Video
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    window.open("https://g3.unsl.edu.ar/g3/", "_blank")
                  }
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                >
                  <Book className="mr-2 h-4 w-4" />
                  SIU Guarani (FCFMYN)
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-select">
                1. Selecciona tu plan de estudio
              </Label>
              <Select
                onValueChange={(value) =>
                  updateState({ planSeleccionado: value })
                }
                value={state.planSeleccionado}
                disabled={state.loadingPlanes}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      state.loadingPlanes
                        ? "Cargando planes..."
                        : "Selecciona un plan"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {state.planes.map((plan: Plan) => (
                    <SelectItem key={plan.codigo} value={plan.codigo}>
                      {plan.propuesta} ({plan.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>2. Sube el archivo</Label>
              {esDispositivoMovil() ? (
                <Button
                  className="w-full bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (state.persona?.id && state.planSeleccionado) {
                      const url = `/subida-mobile?personaId=${state.persona.id}&plan=${state.planSeleccionado}`;
                      window.location.href = url;
                    } else {
                      alert("Seleccioná un plan primero.");
                    }
                  }}
                  disabled={state.uploading || state.loadingPlanes}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Historia Académica (modo móvil)
                </Button>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e, false)}
                    accept=".xls,.xlsx,.pdf,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    disabled={
                      state.uploading ||
                      !state.planSeleccionado ||
                      state.loadingPlanes ||
                      state.criticalOperationInProgress
                    }
                  />
                  <Button
                    className="w-full bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      state.uploading ||
                      !state.planSeleccionado ||
                      state.loadingPlanes ||
                      state.criticalOperationInProgress
                    }
                  >
                    {state.uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {state.uploading
                      ? "Cargando..."
                      : "Subir Historia Académica"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
                  Historia Académica Cargada
                </CardTitle>
                <CardDescription>
                  Plan: {state.historiaAcademica.plan_de_estudio_codigo}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Botón para acceder al SIU Guarani */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://g3.unsl.edu.ar/g3/", "_blank")
                  }
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                >
                  <Book className="mr-2 h-4 w-4" />
                  SIU Guarani
                </Button>

                {esDispositivoMovil() ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const plan =
                        state.historiaAcademica?.plan_de_estudio_codigo;
                      const url = `/subida-mobile?personaId=${state.persona?.id}&plan=${plan}&actualizar=true`;
                      window.location.href = url;
                    }}
                    disabled={
                      state.uploading || state.criticalOperationInProgress
                    }
                    className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Actualizar (modo móvil)
                  </Button>
                ) : (
                  <>
                    <input
                      type="file"
                      ref={updateFileInputRef}
                      onChange={(e) => handleFileUpload(e, true)}
                      accept=".xls,.xlsx,.pdf,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      disabled={
                        state.uploading || state.criticalOperationInProgress
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFileInputRef.current?.click()}
                      disabled={
                        state.uploading || state.criticalOperationInProgress
                      }
                      className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {state.uploading ? "Cargando..." : "Actualizar"}
                    </Button>
                  </>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEliminarHistoria}
                  disabled={
                    state.uploading || state.criticalOperationInProgress
                  }
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  Control de Sugerencias
                </CardTitle>
                <CardDescription>
                  Ajusta cómo se ordenan tus sugerencias.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Select
                  onValueChange={handleCriterioChange}
                  value={state.criterioOrden}
                  disabled={
                    state.loadingRecomendaciones ||
                    state.criticalOperationInProgress
                  }
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Ordenar por..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORRELATIVAS">
                      Importancia (Correlativas)
                    </SelectItem>
                    <SelectItem value="VENCIMIENTO">
                      Proximidad de Vencimiento
                    </SelectItem>
                    <SelectItem value="ESTADISTICAS">
                      Dificultad (Estadísticas)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleRefrescarRecomendaciones}
                  disabled={
                    state.loadingRecomendaciones ||
                    state.criticalOperationInProgress
                  }
                  className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      state.loadingRecomendaciones ? "animate-spin" : ""
                    }`}
                  />
                  Refrescar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {state.loadingRecomendaciones ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    Generando sugerencias...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Esto puede tardar un momento.
                  </p>
                </div>
              ) : state.recomendaciones.length === 0 ? (
                <div className="text-center py-12">
                  <ThumbsUp className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground">
                    ¡Felicitaciones!
                  </h3>
                  <p className="text-muted-foreground">
                    No tienes finales pendientes para rendir según tu historia.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.recomendaciones.map(
                    (final: FinalRecomendado, index: number) => (
                      <Card
                        key={final.codigoMateria}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-600 dark:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <div>
                              <CardTitle className="text-base sm:text-lg">
                                {final.nombreMateria}
                              </CardTitle>
                              <CardDescription>
                                Código: {final.codigoMateria}
                              </CardDescription>
                            </div>
                          </div>
                          {state.criterioOrden === "ESTADISTICAS" &&
                            final.estadisticas && (
                              <span
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getDificultadColor(final.estadisticas.promedioDificultad)}`}
                              >
                                Dificultad{" "}
                                {getDificultadTexto(
                                  final.estadisticas.promedioDificultad
                                )}
                              </span>
                            )}
                        </CardHeader>
                        <CardContent>
                          {state.criterioOrden === "CORRELATIVAS" && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-3">
                              <BookCopy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <p className="text-sm">
                                <strong className="font-semibold text-blue-800 dark:text-blue-300">
                                  {final.vecesEsCorrelativa || 0}
                                </strong>{" "}
                                materias la requieren como correlativa.
                              </p>
                            </div>
                          )}
                          {state.criterioOrden === "VENCIMIENTO" &&
                            (() => {
                              // Función para calcular el estado del vencimiento
                              const getVencimientoStatus = (
                                fechaVencimiento: string
                              ) => {
                                if (
                                  !fechaVencimiento ||
                                  fechaVencimiento === "N/A"
                                ) {
                                  return { texto: "N/A", color: "gray" };
                                }

                                const hoy = new Date();
                                // Convertir formato DD-MM-YYYY a YYYY-MM-DD para que Date() lo reconozca
                                const [dia, mes, año] =
                                  fechaVencimiento.split("-");
                                const vencimiento = new Date(
                                  `${año}-${mes}-${dia}`
                                );
                                const diffTime =
                                  vencimiento.getTime() - hoy.getTime();
                                const diffDays = Math.ceil(
                                  diffTime / (1000 * 60 * 60 * 24)
                                );

                                if (diffDays < 0) {
                                  return {
                                    texto: "Materia vencida",
                                    color: "red",
                                    bgColor: "bg-red-50 dark:bg-red-900/20",
                                    textColor: "text-red-800 dark:text-red-300",
                                  };
                                } else if (diffDays <= 30) {
                                  // Falta poco (30 días o menos)
                                  return {
                                    texto: fechaVencimiento + " (Pronto)",
                                    color: "yellow",
                                    bgColor:
                                      "bg-yellow-50 dark:bg-yellow-900/20",
                                    textColor:
                                      "text-yellow-800 dark:text-yellow-300",
                                  };
                                } else {
                                  // Falta mucho (más de 30 días)
                                  return {
                                    texto: fechaVencimiento + " (Lejano)",
                                    color: "green",
                                    bgColor: "bg-green-50 dark:bg-green-900/20",
                                    textColor:
                                      "text-green-800 dark:text-green-300",
                                  };
                                }
                              };

                              const vencimientoStatus = getVencimientoStatus(
                                final.fechaVencimiento
                              );

                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                    <p className="text-xs text-green-800 dark:text-green-300">
                                      Regularidad
                                    </p>
                                    <p className="font-semibold">
                                      {final.fechaRegularidad || "N/A"}
                                    </p>
                                  </div>
                                  <div
                                    className={`${vencimientoStatus.bgColor} p-3 rounded-lg`}
                                  >
                                    <p
                                      className={`text-xs ${vencimientoStatus.textColor}`}
                                    >
                                      Vencimiento
                                    </p>
                                    <p className="font-semibold">
                                      {vencimientoStatus.texto}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          {state.criterioOrden === "ESTADISTICAS" && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-center">
                              <div className="bg-muted p-2 rounded-lg">
                                <p className="text-xs text-muted-foreground">
                                  Aprobados
                                </p>
                                <p className="font-bold text-sm">
                                  {final.estadisticas?.porcentajeAprobados || 0}
                                  %
                                </p>
                              </div>
                              <div className="bg-muted p-2 rounded-lg">
                                <p className="text-xs text-muted-foreground">
                                  Promedio
                                </p>
                                <p className="font-bold text-sm">
                                  {(
                                    final.estadisticas?.promedioNotas || 0
                                  ).toFixed(1)}
                                </p>
                              </div>
                              <div className="bg-muted p-2 rounded-lg">
                                <p className="text-xs text-muted-foreground">
                                  Días Est.
                                </p>
                                <p className="font-bold text-sm">
                                  {final.estadisticas?.promedioDiasEstudio || 0}
                                </p>
                              </div>
                              <div className="bg-muted p-2 rounded-lg">
                                <p className="text-xs text-muted-foreground">
                                  Hrs/Día
                                </p>
                                <p className="font-bold text-sm">
                                  {(
                                    final.estadisticas?.promedioHorasDiarias ||
                                    0
                                  ).toFixed(1)}
                                </p>
                              </div>
                              <div className="bg-muted p-2 rounded-lg col-span-2 md:col-span-1 lg:col-span-1">
                                <p className="text-xs text-muted-foreground">
                                  Dificultad
                                </p>
                                <p className="font-bold text-sm">
                                  {(
                                    final.estadisticas?.promedioDificultad || 0
                                  ).toFixed(1)}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
