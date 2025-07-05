"use client";

import { useEffect, useRef } from "react";
import personaService from "@/services/personaService";
import historiaAcademicaService from "@/services/historiaAcademicaService";
import recomendacionService from "@/services/recomendacionService";
import planesEstudioService from "@/services/planesEstudioService";
import { useEnhancedSessionPersistence } from "@/hooks/useEnhancedSessionPersistence";
import { APP_CONFIG } from "@/lib/config";

export default function Recomendacion({ user }) {
  const {
    state,
    updateState,
    clearRecomendaciones,
    clearAllState,
    isStateStale,
    isInitialized,
  } = useEnhancedSessionPersistence();

  // Referencias para inputs de archivo
  const fileInputRef = useRef(null);
  const updateFileInputRef = useRef(null);
  const hasLoadedInitialData = useRef(false);

  // Cargar datos iniciales cuando el usuario está disponible y el estado está inicializado
  useEffect(() => {
    if (user && isInitialized && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      cargarDatosIniciales();
    }
  }, [user, isInitialized]);

  // Cargar planes cuando se necesiten (solo si no hay historia académica)
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
      // Obtener persona por Supabase ID o email
      let personaData = await personaService.obtenerPersonaPorSupabaseId(
        user.id
      );

      if (!personaData) {
        personaData = await personaService.obtenerPersonaPorEmail(user.email);
      }

      if (!personaData) {
        updateState({
          error:
            "No se encontró tu perfil en el sistema. Contacta al administrador.",
          loadingPersona: false,
        });
        return;
      }

      console.log("Persona encontrada:", personaData);
      updateState({ persona: personaData, personaId: personaData.id });

      // Verificar si tiene historia académica
      const historia =
        await historiaAcademicaService.verificarHistoriaAcademica(
          personaData.id
        );
      console.log("Historia académica:", historia);

      if (historia) {
        updateState({ historiaAcademica: historia });

        // Verificar si hay recomendaciones guardadas para esta persona
        const tieneRecomendacionesGuardadas =
          state.recomendaciones.length > 0 &&
          state.personaId === personaData.id &&
          state.lastFetch &&
          !isStateStale(30); // No más de 30 minutos de antigüedad

        if (tieneRecomendacionesGuardadas) {
          console.log("Usando recomendaciones guardadas");
          // Las recomendaciones ya están en el estado
        } else {
          console.log(
            "No hay recomendaciones guardadas válidas, cargando nuevas"
          );
          await obtenerRecomendaciones(
            personaData.id,
            state.criterioOrden,
            true
          );
        }
      } else {
        updateState({ historiaAcademica: null });
        // Si no tiene historia, cargar planes para que pueda seleccionar uno
        await cargarPlanes();
      }
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      updateState({
        error: "Error al cargar tus datos. Por favor, intenta nuevamente.",
        loadingPersona: false,
      });
    } finally {
      updateState({ loadingPersona: false });
    }
  };

  const cargarPlanes = async () => {
    if (state.loadingPlanes) return; // Evitar múltiples llamadas concurrentes

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
    if (!estudianteId) {
      console.warn("No hay ID de estudiante para obtener recomendaciones");
      return;
    }

    updateState({ loadingRecomendaciones: true, error: null });

    try {
      console.log(
        `Obteniendo recomendaciones para estudiante ${estudianteId} con orden ${orden}`
      );
      const data = await recomendacionService.obtenerFinalesParaRendir(
        estudianteId,
        orden
      );
      console.log("Recomendaciones obtenidas:", data);

      const recomendacionesArray = Array.isArray(data) ? data : [];

      updateState({
        recomendaciones: recomendacionesArray,
        criterioOrden: orden,
        personaId: estudianteId,
        lastFetch: new Date().toISOString(),
      });

      if (!data || data.length === 0) {
        console.log("No se encontraron recomendaciones");
        // No establecer error aquí, es un estado válido
      }
    } catch (err) {
      console.error("Error al obtener recomendaciones:", err);

      let errorMessage = "Error al obtener las recomendaciones.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 404) {
          errorMessage = "No se encontraron finales disponibles para rendir.";
        } else if (status === 400) {
          errorMessage =
            data?.message || "Datos inválidos para obtener recomendaciones.";
        } else {
          errorMessage =
            data?.message ||
            `Error ${status}: No se pudieron obtener las recomendaciones.`;
        }
      }

      updateState({
        error: errorMessage,
        recomendaciones: [], // Limpiar recomendaciones en caso de error
      });

      // Limpiar persistencia en caso de error
      if (!isAutoLoad) {
        clearRecomendaciones();
      }
    } finally {
      updateState({ loadingRecomendaciones: false });
    }
  };

  const handleFileUpload = async (event, isUpdate = false) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    if (!APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      updateState({
        error: `Tipo de archivo no permitido. Use: ${APP_CONFIG.FILES.ALLOWED_EXTENSIONS.join(", ")}`,
      });
      // Limpiar input
      if (isUpdate && updateFileInputRef.current) {
        updateFileInputRef.current.value = "";
      } else if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Para actualización, usar el plan de la historia existente
    const planAUsar = isUpdate
      ? state.historiaAcademica?.plan_de_estudio_codigo
      : state.planSeleccionado;

    if (!planAUsar) {
      updateState({ error: "Por favor, selecciona un plan de estudio." });
      return;
    }

    updateState({ uploading: true, error: null, success: null });

    try {
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

      console.log("Resultado del servicio:", resultado);

      // Mostrar mensaje de éxito más detallado
      if (resultado && resultado.mensaje) {
        const accion = isUpdate ? "actualizada" : "cargada";
        let mensaje = `Historia académica ${accion}: ${resultado.mensaje}`;

        if (resultado.cantidadMateriasNuevas) {
          mensaje += ` (${resultado.cantidadMateriasNuevas} materias nuevas)`;
        }
        if (resultado.cantidadMateriasActualizadas) {
          mensaje += ` (${resultado.cantidadMateriasActualizadas} materias actualizadas)`;
        }

        updateState({ success: mensaje });
      } else {
        const accion = isUpdate ? "actualizada" : "cargada";
        updateState({ success: `Historia académica ${accion} exitosamente` });
      }

      // Limpiar recomendaciones guardadas ya que la historia cambió
      clearRecomendaciones();

      // Esperar un poco antes de recargar para que el backend procese
      setTimeout(async () => {
        try {
          // Recargar historia académica
          const historia =
            await historiaAcademicaService.verificarHistoriaAcademica(
              state.persona.id
            );
          console.log("Historia recargada:", historia);

          if (historia) {
            updateState({
              historiaAcademica: historia,
              criterioOrden: "CORRELATIVAS", // Reset criterio
            });
            // Cargar recomendaciones automáticamente con criterio por defecto
            await obtenerRecomendaciones(state.persona.id, "CORRELATIVAS");
          } else {
            console.warn("No se pudo recargar la historia académica");
            updateState({
              error:
                "La historia se procesó pero no se pudo verificar. Intenta recargar la página.",
            });
          }
        } catch (reloadErr) {
          console.error("Error al recargar historia:", reloadErr);
          updateState({
            error:
              "Historia cargada pero hubo un problema al actualizar la vista. Recarga la página.",
          });
        }
      }, 2000);
    } catch (err) {
      console.error("Error al cargar/actualizar historia:", err);

      // Mensaje de error más específico
      let errorMessage = "Error al procesar el archivo.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 400) {
          errorMessage =
            data?.message || "El archivo no tiene el formato correcto.";
        } else if (status === 404) {
          errorMessage = "Plan de estudio no encontrado.";
        } else if (status === 500) {
          errorMessage = "Error del servidor. Intenta nuevamente.";
        } else {
          errorMessage = data?.message || `Error ${status}: ${err.message}`;
        }
      } else if (err.request) {
        errorMessage = "No se pudo conectar con el servidor.";
      } else {
        errorMessage = err.message || "Error desconocido.";
      }

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
        "¿Estás seguro de que deseas eliminar toda tu historia académica? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    updateState({ uploading: true, error: null, success: null });

    try {
      await historiaAcademicaService.eliminarHistoriaAcademica(
        state.persona.id
      );
      updateState({
        historiaAcademica: null,
        recomendaciones: [],
        criterioOrden: "CORRELATIVAS", // Reset criterio
        success: "Historia académica eliminada correctamente.",
      });

      // Limpiar recomendaciones guardadas
      clearRecomendaciones();

      // Cargar planes para nueva carga
      if (state.planes.length === 0) {
        await cargarPlanes();
      }
    } catch (err) {
      console.error("Error al eliminar historia:", err);
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

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    return fechaStr;
  };

  const getDificultadColor = (dificultad) => {
    if (dificultad >= 7) return "bg-red-100 text-red-800";
    if (dificultad >= 5) return "bg-orange-100 text-orange-800";
    if (dificultad >= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getDificultadTexto = (dificultad) => {
    if (dificultad >= 7) return "Alta";
    if (dificultad >= 5) return "Media-Alta";
    if (dificultad >= 3) return "Media";
    if (dificultad == 0) return "Desconocida";
    return "Baja";
  };

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (state.success || state.error) {
      const timer = setTimeout(() => {
        updateState({ success: null, error: null });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.error, updateState]);

  // Mostrar loading mientras no esté inicializado
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Inicializando...</p>
      </div>
    );
  }

  if (state.loadingPersona && !state.persona) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando tu información...</p>
      </div>
    );
  }

  if (!state.persona) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Perfil no encontrado
        </h3>
        <p className="text-gray-600">
          No se pudo encontrar tu perfil en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📚 Recomendaciones Personalizadas
        </h2>
        <p className="text-gray-600">
          Hola {state.persona.nombre_apellido}, aquí tienes las mejores
          recomendaciones para tus próximos finales
        </p>
      </div>

      {/* Mensajes de estado */}
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{state.error}</span>
          </div>
        </div>
      )}

      {state.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{state.success}</span>
          </div>
        </div>
      )}

      {/* Estado de historia académica */}
      {!state.historiaAcademica ? (
        <div className="bg-white p-8 rounded-lg shadow-md border border-orange-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Debes cargar una historia académica
            </h3>
            <p className="text-gray-600 mb-6">
              Para obtener recomendaciones personalizadas, necesitas subir tu
              historia académica en formato Excel.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium mb-2">
                Recuerda subir tu historia completa para un funcionamiento
                correcto del asistente virtual
              </p>
              <p className="text-blue-700 text-sm mb-3">
                ¿No sabes cómo descargar tu historia académica?
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/watch?v=VIDEO_ID_AQUI",
                      "_blank"
                    )
                  }
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <span>📺</span>
                  Ver video tutorial
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona tu plan de estudio:
              </label>
              <select
                value={state.planSeleccionado}
                onChange={(e) =>
                  updateState({ planSeleccionado: e.target.value })
                }
                disabled={state.loadingPlanes}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {state.loadingPlanes
                    ? "Cargando planes..."
                    : "Selecciona un plan"}
                </option>
                {state.planes.map((plan) => (
                  <option key={plan.codigo} value={plan.codigo}>
                    {plan.propuesta} ({plan.codigo})
                  </option>
                ))}
              </select>
              {state.loadingPlanes && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>Cargando planes de estudio...</span>
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e, false)}
                accept=".xls,.xlsx"
                className="hidden"
                disabled={
                  state.uploading ||
                  !state.planSeleccionado ||
                  state.loadingPlanes
                }
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  state.uploading ||
                  !state.planSeleccionado ||
                  state.loadingPlanes
                }
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  state.uploading ||
                  !state.planSeleccionado ||
                  state.loadingPlanes
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white transform hover:-translate-y-0.5"
                }`}
              >
                {state.uploading
                  ? "Cargando..."
                  : "📁 Subir Historia Académica"}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Formatos permitidos: XLS, XLSX
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Historia académica cargada */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-green-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Historia académica ya cargada
                  </h3>
                  <p className="text-sm text-gray-600">
                    Plan: {state.historiaAcademica.plan_de_estudio_codigo}
                    {state.planes.length > 0 && (
                      <span className="ml-2 text-gray-500">
                        (
                        {state.planes.find(
                          (p) =>
                            p.codigo ===
                            state.historiaAcademica.plan_de_estudio_codigo
                        )?.propuesta || "Plan no encontrado"}
                        )
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-bold-500 whitespace-nowrap">
                    ¿Cursaste más materias?
                  </span>
                  <input
                    type="file"
                    ref={updateFileInputRef}
                    onChange={(e) => handleFileUpload(e, true)}
                    accept=".xls,.xlsx"
                    className="hidden"
                    disabled={state.uploading}
                  />
                  <button
                    onClick={() => updateFileInputRef.current?.click()}
                    disabled={state.uploading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    📚 Actualizar Historia
                  </button>
                </div>
                <button
                  onClick={handleEliminarHistoria}
                  disabled={state.uploading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  🗑️ Eliminar Historia
                </button>
              </div>
            </div>
          </div>

          {/* Controles de recomendación */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Recomendaciones
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleRefrescarRecomendaciones}
                  disabled={state.loadingRecomendaciones}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  title="Refrescar recomendaciones"
                >
                  🔄 Refrescar
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Ordenar por:
              </label>
              <select
                value={state.criterioOrden}
                onChange={(e) => handleCriterioChange(e.target.value)}
                disabled={state.loadingRecomendaciones}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="CORRELATIVAS">Cantidad de correlativas</option>
                <option value="VENCIMIENTO">Fecha de vencimiento</option>
                <option value="ESTADISTICAS">Estadísticas de la materia</option>
              </select>
            </div>
          </div>

          {/* Resultados de recomendaciones */}
          {state.loadingRecomendaciones ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">
                Generando recomendaciones personalizadas...
              </p>
            </div>
          ) : state.recomendaciones.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ¡No tienes finales para rendir!
              </h3>
              <p className="text-gray-600">
                Parece que ya has completado todos los finales disponibles según
                tu historia académica.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Finales recomendados ({state.recomendaciones.length})
              </h3>

              {state.recomendaciones.map((final, index) => (
                <div
                  key={final.codigoMateria}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">
                            {final.nombreMateria}
                          </h4>
                          <p className="text-gray-600">
                            Código: {final.codigoMateria}
                          </p>
                        </div>
                      </div>
                    </div>

                    {state.criterioOrden === "ESTADISTICAS" &&
                      final.estadisticas && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getDificultadColor(
                            final.estadisticas.promedioDificultad
                          )}`}
                        >
                          Dificultad{" "}
                          {getDificultadTexto(
                            final.estadisticas.promedioDificultad
                          )}
                        </span>
                      )}
                  </div>

                  {/* Información específica según criterio */}
                  <div className="grid gap-4">
                    {state.criterioOrden === "CORRELATIVAS" && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Importancia como correlativa:
                        </p>
                        <p className="text-lg font-semibold text-blue-700">
                          {final.vecesEsCorrelativa || 0} materias la requieren
                        </p>
                      </div>
                    )}

                    {state.criterioOrden === "VENCIMIENTO" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Fecha de regularidad:
                          </p>
                          <p className="font-semibold text-green-700">
                            {formatearFecha(final.fechaRegularidad)}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Fecha de vencimiento:
                          </p>
                          <p className="font-semibold text-orange-700">
                            {formatearFecha(final.fechaVencimiento)}
                          </p>
                          {final.semanasParaVencimiento !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              {final.semanasParaVencimiento < 0
                                ? `Vencido hace ${Math.abs(final.semanasParaVencimiento)} semanas`
                                : `${final.semanasParaVencimiento} semanas restantes`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {state.criterioOrden === "ESTADISTICAS" && (
                      <div>
                        {final.estadisticas ? (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 mb-1">
                                % Aprobados
                              </p>
                              <p className="text-lg font-bold text-green-700">
                                {final.estadisticas.porcentajeAprobados || 0}%
                              </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 mb-1">
                                Promedio
                              </p>
                              <p className="text-lg font-bold text-blue-700">
                                {(
                                  final.estadisticas.promedioNotas || 0
                                ).toFixed(1)}
                              </p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 mb-1">
                                Días estudio
                              </p>
                              <p className="text-lg font-bold text-purple-700">
                                {final.estadisticas.promedioDiasEstudio || 0}
                              </p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 mb-1">
                                Horas/día
                              </p>
                              <p className="text-lg font-bold text-yellow-700">
                                {final.estadisticas.promedioHorasDiarias || 0}
                              </p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg text-center">
                              <p className="text-xs text-gray-600 mb-1">
                                Dificultad
                              </p>
                              <p className="text-lg font-bold text-red-700">
                                {(
                                  final.estadisticas.promedioDificultad || 0
                                ).toFixed(1)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-4xl mb-2 opacity-50">📊</div>
                            <p className="text-gray-600 font-medium">
                              No hay estadísticas para esta materia
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Esta materia aún no tiene suficientes datos
                              estadísticos registrados
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
