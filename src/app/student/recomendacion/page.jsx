"use client";

import { useEffect, useRef, useState } from "react";
import personaService from "@/services/personaService";
import historiaAcademicaService from "@/services/historiaAcademicaService";
import recomendacionService from "@/services/recomendacionService";
import planesEstudioService from "@/services/planesEstudioService";
import { useEnhancedSessionPersistence } from "@/hooks/useEnhancedSessionPersistence";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Upload,
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

export default function Recomendacion({ user }) {
  const {
    state,
    updateState,
    clearRecomendaciones,
    clearAllState,
    isStateStale,
    isInitialized,
  } = useEnhancedSessionPersistence();

  const fileInputRef = useRef(null);
  const updateFileInputRef = useRef(null);
  const hasLoadedInitialData = useRef(false);

  // Estados adicionales para debugging móvil
  const [fileDebugInfo, setFileDebugInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    } catch (err) {
      let errorMessage = "Error al obtener las recomendaciones.";
      if (err.response) {
        const { status, data } = err.response;
        if (status === 404)
          errorMessage = "No se encontraron finales disponibles para rendir.";
        else if (status === 400)
          errorMessage =
            data?.message || "Datos inválidos para obtener recomendaciones.";
        else
          errorMessage =
            data?.message ||
            `Error ${status}: No se pudieron obtener las recomendaciones.`;
      }
      updateState({ error: errorMessage, recomendaciones: [] });
      if (!isAutoLoad) clearRecomendaciones();
    } finally {
      updateState({ loadingRecomendaciones: false });
    }
  };

  // Función mejorada para manejar archivos con mejor compatibilidad móvil
  const handleFileUpload = async (event, isUpdate = false) => {
    console.log("🔍 File upload iniciado", { isMobile, isUpdate });

    const files = event.target.files;
    const file = files?.[0];

    console.log("📱 Event details:", {
      type: event.type,
      target: event.target,
      files: files,
      hasFiles: !!files,
      filesLength: files?.length,
    });

    if (!files || files.length === 0) {
      console.log("❌ No files in event");
      updateState({
        error: "No se seleccionó ningún archivo. Intenta nuevamente.",
      });
      return;
    }

    if (!file) {
      console.log("❌ No file selected");
      updateState({
        error: "No se seleccionó ningún archivo. Intenta nuevamente.",
      });
      return;
    }

    // Debug info para móviles
    setFileDebugInfo({
      hasFiles: !!event.target.files,
      filesLength: event.target.files?.length || 0,
      fileName: file?.name || "No file",
      fileSize: file?.size || 0,
      fileType: file?.type || "No type",
      timestamp: new Date().toISOString(),
    });

    console.log("📱 File debug info:", {
      hasFiles: !!event.target.files,
      filesLength: event.target.files?.length || 0,
      fileName: file?.name || "No file",
      fileSize: file?.size || 0,
      fileType: file?.type || "No type",
    });

    // Validación de archivo mejorada para móviles
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    const isValidExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".xlsx");

    const isValidMimeType =
      fileType.includes("pdf") ||
      fileType.includes("excel") ||
      fileType.includes("spreadsheet") ||
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    console.log("🔍 File validation:", {
      fileName,
      fileType,
      isValidExtension,
      isValidMimeType,
    });

    if (!isValidExtension && !isValidMimeType) {
      updateState({
        error: `Tipo de archivo no permitido. Usa archivos PDF, XLS o XLSX. Archivo detectado: ${fileName} (${fileType})`,
      });
      // Limpiar input
      if (isUpdate && updateFileInputRef.current) {
        updateFileInputRef.current.value = "";
      } else if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const planAUsar = isUpdate
      ? state.historiaAcademica?.plan_de_estudio_codigo
      : state.planSeleccionado;

    if (!planAUsar) {
      updateState({ error: "Por favor, selecciona un plan de estudio." });
      return;
    }

    updateState({ uploading: true, error: null, success: null });

    try {
      console.log("📤 Uploading file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        plan: planAUsar,
        isUpdate,
      });

      let resultado;
      if (isUpdate) {
        resultado = await historiaAcademicaService.actualizarHistoriaAcademica(
          file,
          state.persona.id,
          planAUsar
        );
      } else {
        resultado = await historiaAcademicaService.cargarHistoriaAcademica(
          file,
          state.persona.id,
          planAUsar
        );
      }

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
        }
      }, 2000);
    } catch (err) {
      console.error("❌ Upload error:", err);
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
    } finally {
      updateState({ uploading: false });
      // Limpiar inputs
      if (isUpdate && updateFileInputRef.current) {
        updateFileInputRef.current.value = "";
      } else if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEliminarHistoria = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar toda tu historia académica?"
      )
    )
      return;

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
    }
  };

  const handleCriterioChange = (nuevoCriterio) => {
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

  // Función simplificada para triggear el input de archivo
  const triggerFileInput = (isUpdate = false) => {
    const inputRef = isUpdate ? updateFileInputRef : fileInputRef;
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
    setTimeout(() => {
      const event = new Event("input", { bubbles: true });
      fileInputRef.current?.dispatchEvent(event);
    }, 10000);

  };

  const getDificultadColor = (d) =>
    d >= 7
      ? "text-red-600 bg-red-100"
      : d >= 5
        ? "text-orange-600 bg-orange-100"
        : d >= 3
          ? "text-yellow-600 bg-yellow-100"
          : "text-green-600 bg-green-100";

  const getDificultadTexto = (d) =>
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
      <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            📚 Recomendaciones Personalizadas
          </CardTitle>
          <CardDescription className="text-gray-600">
            Hola {state.persona.nombre_apellido}, aquí tienes las mejores
            recomendaciones para tus próximos finales.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Debug info para móviles - solo mostrar en desarrollo */}
      {process.env.NODE_ENV === "development" && isMobile && fileDebugInfo && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm">🐛 Debug Info (Mobile)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(fileDebugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {state.error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{state.success}</p>
        </div>
      )}

      {!state.historiaAcademica ? (
        <Card>
          <CardHeader className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <CardTitle>Carga tu Historia Académica</CardTitle>
            <CardDescription>
              Para obtener recomendaciones, necesitamos tu historia académica
              completa en formato Excel o PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-lg mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-800">
                ¿No sabes cómo descargarla? Haz clic en el video tutorial.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2"
                onClick={() =>
                  window.open("https://youtu.be/K4uE6e0xp3M", "_blank")
                }
              >
                <Youtube className="mr-2 h-4 w-4" />
                Ver Video
              </Button>
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
                  {state.planes.map((plan) => (
                    <SelectItem key={plan.codigo} value={plan.codigo}>
                      {plan.propuesta} ({plan.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>2. Sube el archivo</Label>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.xls,.xlsx,application/pdf"
                onChange={(e) => handleFileUpload(e, false)}
                onInput={(e) => handleFileUpload(e, false)}
                className="hidden"
                disabled={
                  state.uploading ||
                  !state.planSeleccionado ||
                  state.loadingPlanes
                }
              />

              <button
                className="w-full bg-blue-400 hover:bg-blue-500 text-white"
                onClick={() => triggerFileInput(false)}
                disabled={
                  state.uploading ||
                  !state.planSeleccionado ||
                  state.loadingPlanes
                }
              >
                Subir Historia Academica
              </button>

              {isMobile && (
                <p className="text-xs text-gray-500 text-center">
                  📱 Versión móvil detectada
                </p>
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
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Historia Académica Cargada
                </CardTitle>
                <CardDescription>
                  Plan: {state.historiaAcademica.plan_de_estudio_codigo}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="file"
                  ref={updateFileInputRef}
                  accept=".pdf,.xls,.xlsx"
                  onChange={(e) => handleFileUpload(e, true)}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    width: "1px",
                    height: "1px",
                    opacity: 0,
                  }}
                  disabled={state.uploading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFileInput(true)}
                  disabled={state.uploading}
                  className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 text-white"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {state.uploading ? "Cargando..." : "Actualizar"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEliminarHistoria}
                  disabled={state.uploading}
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
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  Controles de Recomendación
                </CardTitle>
                <CardDescription>
                  Ajusta cómo se ordenan tus recomendaciones.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Select
                  onValueChange={handleCriterioChange}
                  value={state.criterioOrden}
                  disabled={state.loadingRecomendaciones}
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
                  disabled={state.loadingRecomendaciones}
                  className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 text-white"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${state.loadingRecomendaciones ? "animate-spin" : ""}`}
                  />
                  Refrescar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {state.loadingRecomendaciones ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                  <p className="font-semibold text-gray-700">
                    Generando recomendaciones...
                  </p>
                  <p className="text-sm text-gray-500">
                    Esto puede tardar un momento.
                  </p>
                </div>
              ) : state.recomendaciones.length === 0 ? (
                <div className="text-center py-12">
                  <ThumbsUp className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    ¡Felicitaciones!
                  </h3>
                  <p className="text-gray-600">
                    No tienes finales pendientes para rendir según tu historia.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.recomendaciones.map((final, index) => (
                    <Card
                      key={final.codigoMateria}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
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
                          <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                            <BookCopy className="h-5 w-5 text-blue-600" />
                            <p className="text-sm">
                              <strong className="font-semibold text-blue-800">
                                {final.vecesEsCorrelativa || 0}
                              </strong>{" "}
                              materias la requieren como correlativa.
                            </p>
                          </div>
                        )}
                        {state.criterioOrden === "VENCIMIENTO" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <p className="text-xs text-green-800">
                                Regularidad
                              </p>
                              <p className="font-semibold">
                                {final.fechaRegularidad || "N/A"}
                              </p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <p className="text-xs text-orange-800">
                                Vencimiento
                              </p>
                              <p className="font-semibold">
                                {final.fechaVencimiento || "N/A"}
                              </p>
                            </div>
                          </div>
                        )}

                        {state.criterioOrden === "ESTADISTICAS" && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-center">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-xs text-gray-600">Aprobados</p>
                              <p className="font-bold text-sm">
                                {final.estadisticas?.porcentajeAprobados || 0}%
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-xs text-gray-600">Promedio</p>
                              <p className="font-bold text-sm">
                                {(
                                  final.estadisticas?.promedioNotas || 0
                                ).toFixed(1)}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-xs text-gray-600">Días Est.</p>
                              <p className="font-bold text-sm">
                                {final.estadisticas?.promedioDiasEstudio || 0}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-xs text-gray-600">Hrs/Día</p>
                              <p className="font-bold text-sm">
                                {(
                                  final.estadisticas?.promedioHorasDiarias || 0
                                ).toFixed(1)}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg col-span-2 md:col-span-1 lg:col-span-1">
                              <p className="text-xs text-gray-600">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
