"use client";

import { useState, useEffect, useRef } from "react";
import inscripcionService from "@/services/inscripcionService";
import historiaAcademicaService from "@/services/historiaAcademicaService";
import personaService from "@/services/personaService";
import materiaService from "@/services/materiaService";
import { useInscripcionPersistence } from "@/hooks/useInscripcionPersistence";
import { useModalPersistence } from "@/hooks/useModalPersistence";
import Modal from "@/components/modals/Modal";
import { useConfirmacionPersistence } from "@/hooks/useConfirmacionPersistence";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Pencil,
  RefreshCw,
  Users,
  Trash2,
  GraduationCap,
  ClipboardCopy,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// --- LÓGICA DEL COMPONENTE SIN CAMBIOS ---
export default function Inscripcion({ user }) {
  const {
    state,
    updateState,
    clearSelections,
    shouldRefreshData,
    invalidateCache,
    markDataAsFresh,
    isInitialized,
  } = useInscripcionPersistence();
  const {
    isOpen: showInscriptos,
    data: inscripcionConsultada,
    openModal: openInscriptosModal,
    closeModal: closeInscriptosModal,
    isInitialized: isModalInitialized,
  } = useModalPersistence("inscriptos-modal");
  const [showConfirmacion, setShowConfirmacion] = useConfirmacionPersistence();
  const [inscriptosConsulta, setInscriptosConsulta] = useState([]);
  const [loadingInscriptos, setLoadingInscriptos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingInscripcion, setLoadingInscripcion] = useState(false);
  const [loadingEliminacion, setLoadingEliminacion] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const hasLoadedInitialData = useRef(false);
  const mesas = [
    "FEBRERO",
    "MARZO",
    "JULIO",
    "AGOSTO",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  useEffect(() => {
    if (user && isInitialized && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      if (shouldRefreshData()) cargarDatosIniciales();
      else setLoading(false);
    }
  }, [user, isInitialized, shouldRefreshData]);

  useEffect(() => {
    if (
      showInscriptos &&
      inscripcionConsultada &&
      isModalInitialized &&
      state.persona
    ) {
      cargarInscriptosParaModal(inscripcionConsultada);
    }
  }, [
    showInscriptos,
    inscripcionConsultada,
    isModalInitialized,
    state.persona,
  ]);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    setError(null);
    try {
      let personaData = state.persona;
      if (!personaData) {
        personaData = await personaService.obtenerPersonaPorSupabaseId(user.id);
        if (!personaData)
          personaData = await personaService.obtenerPersonaPorEmail(user.email);
        if (!personaData) {
          setError("No se encontró tu perfil en el sistema.");
          return;
        }
        updateState({ persona: personaData });
      }
      let historia = await historiaAcademicaService.verificarHistoriaAcademica(
        personaData.id
      );
      if (!historia) {
        updateState({ historiaAcademica: undefined });
        return;
      }
      updateState({ historiaAcademica: historia });
      if (historia) {
        await Promise.all([
          cargarMateriasDisponibles(personaData.id),
          cargarInscripcionesEstudiante(personaData.id),
        ]);
      } else {
        updateState({
          materiasDisponibles: [],
          inscripcionesEstudiante: [],
          materiaSeleccionada: null,
          mesaSeleccionada: "",
          anioSeleccionado: "",
          inscripcionExitosa: null,
          companerosInscriptos: [],
        });
      }
    } catch (err) {
      setError("Error al cargar tus datos.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMateriasDisponibles = async (estudianteId) => {
    try {
      const materias =
        await inscripcionService.obtenerMateriasParaInscripcion(estudianteId);
      updateState({ materiasDisponibles: materias || [] });
    } catch (err) {
      updateState({ materiasDisponibles: [] });
    }
  };

  const cargarInscripcionesEstudiante = async (estudianteId) => {
    try {
      const inscripciones =
        await inscripcionService.obtenerInscripcionesEstudiante(estudianteId);
      const inscripcionesConNombres = await enriquecerInscripcionesConNombres(
        inscripciones || []
      );
      updateState({ inscripcionesEstudiante: inscripcionesConNombres });
    } catch (err) {
      updateState({ inscripcionesEstudiante: [] });
    }
  };

  const enriquecerInscripcionesConNombres = async (inscripciones) => {
    if (!inscripciones || inscripciones.length === 0) return [];
    try {
      const materiasParaBuscar = inscripciones
        .filter((i) => !i.materiaNombre)
        .map((i) => ({ codigo: i.materiaCodigo, plan: i.materiaPlan }));
      const materiasUnicas = materiasParaBuscar.filter(
        (m, i, self) =>
          i ===
          self.findIndex((s) => s.codigo === m.codigo && s.plan === m.plan)
      );
      if (materiasUnicas.length === 0) return inscripciones;
      const materiasInfo =
        await materiaService.obtenerMateriasPorCodigos(materiasUnicas);
      const mapaNombres = {};
      materiasInfo.forEach((m) => {
        mapaNombres[`${m.codigo}-${m.plan_de_estudio_codigo}`] = m.nombre;
      });
      return inscripciones.map((i) =>
        i.materiaNombre
          ? i
          : {
              ...i,
              materiaNombre:
                mapaNombres[`${i.materiaCodigo}-${i.materiaPlan}`] ||
                `Materia ${i.materiaCodigo}`,
            }
      );
    } catch (error) {
      return inscripciones.map((i) => ({
        ...i,
        materiaNombre: i.materiaNombre || `Materia ${i.materiaCodigo}`,
      }));
    }
  };

  const cargarInscriptosParaModal = async (inscripcion) => {
    setLoadingInscriptos(true);
    setError(null);
    try {
      const inscriptos = await inscripcionService.obtenerInscriptosConEmails(
        inscripcion.materiaCodigo,
        inscripcion.anio,
        inscripcion.turno
      );
      setInscriptosConsulta(inscriptos || []);
    } catch (err) {
      setError("Error al consultar los inscriptos.");
    } finally {
      setLoadingInscriptos(false);
    }
  };

  const consultarInscriptos = async (inscripcion) => {
    openInscriptosModal(inscripcion, "inscriptos");
    await cargarInscriptosParaModal(inscripcion);
  };

  const copiarEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setSuccess(`Email ${email} copiado`);
    } catch (err) {
      setSuccess(`Email ${email} copiado`);
    }
  };

  const forzarRecargaDatos = async () => {
    if (!state.persona || !state.historiaAcademica) return;
    invalidateCache();
    setLoading(true);
    setError(null);
    try {
      const [materias, inscripciones] = await Promise.all([
        inscripcionService.obtenerMateriasParaInscripcion(state.persona.id),
        inscripcionService.obtenerInscripcionesEstudiante(state.persona.id),
      ]);
      const inscripcionesConNombres = await enriquecerInscripcionesConNombres(
        inscripciones || []
      );
      updateState({
        materiasDisponibles: materias || [],
        inscripcionesEstudiante: inscripcionesConNombres,
      });
      markDataAsFresh();
      setSuccess("Datos actualizados.");
    } catch (err) {
      setError("Error al actualizar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const calcularAnioMesa = (mesa) => {
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;
    const mesesNumeros = {
      FEBRERO: 2,
      MARZO: 3,
      JULIO: 7,
      AGOSTO: 8,
      NOVIEMBRE: 11,
      DICIEMBRE: 12,
    };
    const mesMesa = mesesNumeros[mesa];
    if (mesMesa < mesActual || (mesMesa === mesActual && ahora.getDate() > 10))
      return anioActual + 1;
    return anioActual;
  };

  const handleSeleccionarMateria = (materia) => {
    updateState({
      materiaSeleccionada: materia,
      mesaSeleccionada: "",
      anioSeleccionado: "",
      inscripcionExitosa: null,
      companerosInscriptos: [],
    });
    setShowConfirmacion(false);
  };

  const handleSeleccionarMesa = (mesa) => {
    const anio = calcularAnioMesa(mesa);
    updateState({ mesaSeleccionada: mesa, anioSeleccionado: anio });
    setShowConfirmacion(true);
  };

  const handleConfirmarInscripcion = async () => {
    if (
      !state.materiaSeleccionada ||
      !state.mesaSeleccionada ||
      !state.anioSeleccionado ||
      !state.historiaAcademica
    ) {
      setError("Faltan datos para la inscripción.");
      return;
    }
    setLoadingInscripcion(true);
    setError(null);
    try {
      const dto = {
        turno: state.mesaSeleccionada,
        anio: state.anioSeleccionado,
        materiaCodigo: state.materiaSeleccionada.codigo,
        materiaPlan: state.historiaAcademica.plan_de_estudio_codigo,
        estudianteId: state.persona.id,
      };
      const inscripcionCreada = await inscripcionService.crearInscripcion(dto);
      const companeros = await inscripcionService.obtenerInscriptosConEmails(
        state.materiaSeleccionada.codigo,
        state.anioSeleccionado,
        state.mesaSeleccionada
      );
      const companerosFiltered = companeros.filter(
        (c) => c.estudianteId !== state.persona.id
      );
      updateState({
        inscripcionExitosa: inscripcionCreada,
        companerosInscriptos: companerosFiltered,
      });
      setShowConfirmacion(false);
      setSuccess("¡Inscripción realizada!");
      try {
        const [nuevasMaterias, nuevasInscripciones] = await Promise.all([
          inscripcionService.obtenerMateriasParaInscripcion(state.persona.id),
          inscripcionService.obtenerInscripcionesEstudiante(state.persona.id),
        ]);
        const nuevasInscripcionesConNombres =
          await enriquecerInscripcionesConNombres(nuevasInscripciones || []);
        updateState({
          materiasDisponibles: nuevasMaterias || [],
          inscripcionesEstudiante: nuevasInscripcionesConNombres,
          lastUpdate: new Date().toISOString(),
          materiaSeleccionada: null,
          mesaSeleccionada: "",
          anioSeleccionado: "",
        });
      } catch (reloadError) {
        setError(
          "Inscripción exitosa, pero hubo un problema al actualizar la lista."
        );
      }
      setTimeout(() => clearSelections(), 5000);
    } catch (err) {
      let errorMessage = "Error al crear la inscripción.";
      if (err.response?.status === 409)
        errorMessage = "Ya estás inscripto a esta materia en este período.";
      else if (err.response?.data?.message)
        errorMessage = err.response.data.message;
      setError(errorMessage);
    } finally {
      setLoadingInscripcion(false);
    }
  };

  const handleEliminarInscripcion = async (inscripcion) => {
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar tu inscripción a ${inscripcion.materiaNombre}?`
      )
    )
      return;
    setLoadingEliminacion(inscripcion.id);
    setError(null);
    try {
      await inscripcionService.eliminarInscripcion(inscripcion.id);
      setSuccess("Inscripción eliminada.");
      try {
        const [nuevasMaterias, nuevasInscripciones] = await Promise.all([
          inscripcionService.obtenerMateriasParaInscripcion(state.persona.id),
          inscripcionService.obtenerInscripcionesEstudiante(state.persona.id),
        ]);
        const nuevasInscripcionesConNombres =
          await enriquecerInscripcionesConNombres(nuevasInscripciones || []);
        updateState({
          materiasDisponibles: nuevasMaterias || [],
          inscripcionesEstudiante: nuevasInscripcionesConNombres,
          lastUpdate: new Date().toISOString(),
        });
      } catch (reloadError) {
        setError(
          "Inscripción eliminada, pero hubo un problema al actualizar la lista."
        );
      }
      if (
        state.inscripcionExitosa &&
        state.inscripcionExitosa.materiaCodigo === inscripcion.materiaCodigo
      ) {
        updateState({ inscripcionExitosa: null, companerosInscriptos: [] });
      }
    } catch (err) {
      setError("Error al eliminar la inscripción.");
    } finally {
      setLoadingEliminacion(null);
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const materiasCodigosInscriptos = state.inscripcionesEstudiante.map(
    (i) => i.materiaCodigo
  );
  const materiasDisponiblesFiltradas = state.materiasDisponibles.filter(
    (m) => !materiasCodigosInscriptos.includes(m.codigo)
  );

  if (!isInitialized || (loading && !state.persona)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!state.persona) {
    return (
      <Card className="text-center p-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <CardTitle>Perfil no encontrado</CardTitle>
        <CardDescription>No se pudo encontrar tu perfil.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 via-white to-blue-50">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
            <Pencil className="w-6 h-6 text-blue-600" />
            Inscripción a Mesas de Examen
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Inscríbete para ponerte en contacto con compañeros y estudiar en
            conjunto.{" "}
            <strong className="text-yellow-800">
              Recuerda que esta inscripción es independiente del SIU Guaraní.
            </strong>
          </CardDescription>
        </CardHeader>
        {state.historiaAcademica && (
          <CardFooter className="bg-transparent justify-end">
            <Button
              size="sm"
              onClick={forzarRecargaDatos}
              disabled={loading}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar Datos
            </Button>
          </CardFooter>
        )}
      </Card>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {!state.historiaAcademica ? (
        <Card>
          <CardHeader className="text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <CardTitle>Carga tu Historia Académica Primero</CardTitle>
            <CardDescription>
              Para inscribirte a mesas de examen, ve a la pestaña "Sugerencias"
              y sube tu historia académica.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("changeTab", { detail: "recomendacion" })
                )
              }
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Ir a Sugerencias
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {state.inscripcionExitosa && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>🎉 ¡Inscripción exitosa!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Se notificó a tus compañeros. ¡Mucha suerte en el examen!
                </p>
                {state.companerosInscriptos.length > 0 ? (
                  <>
                    <h4 className="font-semibold mb-2">
                      Compañeros inscriptos ({state.companerosInscriptos.length}
                      ):
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {state.companerosInscriptos.map((c) => (
                        <div
                          key={c.id}
                          className="bg-background p-2 rounded border text-sm"
                        >
                          {c.estudianteNombre}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>Eres el/la primero/a en inscribirte.</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Materias Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                {materiasDisponiblesFiltradas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tienes materias disponibles para inscribirte.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {materiasDisponiblesFiltradas.map((m) => (
                      <div
                        key={m.codigo}
                        onClick={() => handleSeleccionarMateria(m)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${state.materiaSeleccionada?.codigo === m.codigo ? "border-blue-500 bg-blue-50" : "hover:bg-muted"}`}
                      >
                        <p className="font-semibold">{m.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          Código: {m.codigo}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Mesas de Examen</CardTitle>
              </CardHeader>
              <CardContent>
                {!state.materiaSeleccionada ? (
                  <p className="text-center text-muted-foreground py-8">
                    Selecciona una materia para ver las mesas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
                      <p className="font-semibold text-blue-800">
                        Materia: {state.materiaSeleccionada.nombre}
                      </p>
                    </div>
                    {mesas.map((mesa) => (
                      <button
                        key={mesa}
                        onClick={() => handleSeleccionarMesa(mesa)}
                        className="w-full p-3 border rounded-lg hover:bg-muted transition-colors flex justify-between items-center text-left"
                      >
                        <span className="font-medium">
                          {mesa} {calcularAnioMesa(mesa)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mis Inscripciones</CardTitle>
            </CardHeader>
            <CardContent>
              {state.inscripcionesEstudiante.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tienes inscripciones activas.
                </p>
              ) : (
                <div className="space-y-3">
                  {state.inscripcionesEstudiante.map((i) => (
                    <div
                      key={i.id}
                      className="p-3 border bg-green-50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div>
                        <p className="font-semibold">{i.materiaNombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {i.turno} {i.anio}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => consultarInscriptos(i)}
                          disabled={loadingInscriptos}
                          className="flex-1 sm:flex-none bg-blue-400 hover:bg-blue-500 text-white"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEliminarInscripcion(i)}
                          disabled={loadingEliminacion === i.id}
                          className="flex-1 sm:flex-none"
                        >
                          {loadingEliminacion === i.id ? (
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

          {showConfirmacion && (
            <Modal
              isOpen={showConfirmacion}
              onClose={() => setShowConfirmacion(false)}
              title="Confirmar Inscripción"
            >
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Materia:</p>
                  <p>{state.materiaSeleccionada?.nombre}</p>
                </div>
                <div>
                  <p className="font-medium">Mesa:</p>
                  <p>
                    {state.mesaSeleccionada} {state.anioSeleccionado}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                  Se notificará a otros estudiantes inscriptos.
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleConfirmarInscripcion}
                  disabled={loadingInscripcion}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loadingInscripcion ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscribiendo...
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmacion(false)}
                  disabled={loadingInscripcion}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </Modal>
          )}

          <Modal
            isOpen={showInscriptos}
            onClose={closeInscriptosModal}
            title={`Inscriptos a ${inscripcionConsultada?.materiaNombre || "la materia"}`}
          >
            {inscripcionConsultada && (
              <p className="bg-blue-50 p-2 rounded-md mb-4 text-sm">
                Mesa: {inscripcionConsultada.turno} {inscripcionConsultada.anio}
              </p>
            )}
            <div className="max-h-96 overflow-y-auto pr-2">
              {loadingInscriptos ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : inscriptosConsulta.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay otros inscriptos.
                </p>
              ) : (
                <div className="space-y-2">
                  {inscriptosConsulta.map((i) => (
                    <div
                      key={i.id}
                      className="p-3 border rounded-md flex justify-between items-center"
                    >
                      <p className="font-medium">
                        {i.estudianteNombre}{" "}
                        {i.estudianteId === state.persona?.id && (
                          <span className="text-xs font-normal text-blue-600">
                            (Tú)
                          </span>
                        )}
                      </p>
                      {i.email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copiarEmail(i.email)}
                        >
                          <ClipboardCopy className="h-4 w-4 mr-2" />
                          Copiar Email
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
