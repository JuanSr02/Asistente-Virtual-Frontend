"use client"

import { useState, useEffect, useRef } from "react"
import inscripcionService from "@/services/inscripcionService"
import historiaAcademicaService from "@/services/historiaAcademicaService"
import personaService from "@/services/personaService"
import materiaService from "@/services/materiaService"
import { useInscripcionPersistence } from "@/hooks/useInscripcionPersistence"
import { useModalPersistence } from "@/hooks/useModalPersistence"
import Modal from "@/components/modals/Modal"
import { useConfirmacionPersistence } from "@/hooks/useConfirmacionPersistence"

export default function Inscripcion({ user }) {
  // Hook de persistencia
  const { state, updateState, clearSelections, shouldRefreshData, invalidateCache, markDataAsFresh, isInitialized } =
    useInscripcionPersistence()

  // Hook de persistencia del modal
  const {
    isOpen: showInscriptos,
    data: inscripcionConsultada,
    openModal: openInscriptosModal,
    closeModal: closeInscriptosModal,
    updateModalData: updateInscriptosData,
    isInitialized: isModalInitialized,
  } = useModalPersistence("inscriptos-modal")

  // Estados locales (no persistidos)
  const [showConfirmacion, setShowConfirmacion] = useConfirmacionPersistence()
  const [inscriptosConsulta, setInscriptosConsulta] = useState([])
  const [loadingInscriptos, setLoadingInscriptos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingInscripcion, setLoadingInscripcion] = useState(false)
  const [loadingEliminacion, setLoadingEliminacion] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Ref para evitar múltiples cargas
  const hasLoadedInitialData = useRef(false)

  // Mesas disponibles
  const mesas = ["FEBRERO", "MARZO", "JULIO", "AGOSTO", "NOVIEMBRE", "DICIEMBRE"]

  // Cargar datos iniciales cuando el usuario está disponible y el estado está inicializado
  useEffect(() => {
    if (user && isInitialized && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true

      // Si necesitamos refrescar datos o no tenemos datos básicos
      if (shouldRefreshData()) {
        console.log("Cargando datos iniciales de inscripción...")
        cargarDatosIniciales()
      } else {
        console.log("Usando datos de inscripción guardados")
        setLoading(false)
      }
    }
  }, [user, isInitialized, shouldRefreshData])

  // Cargar inscriptos si el modal está abierto al inicializar
  useEffect(() => {
    if (showInscriptos && inscripcionConsultada && isModalInitialized && state.persona) {
      console.log("Recargando inscriptos para modal persistido...")
      cargarInscriptosParaModal(inscripcionConsultada)
    }
  }, [showInscriptos, inscripcionConsultada, isModalInitialized, state.persona])

  const cargarDatosIniciales = async () => {
    setLoading(true)
    setError(null)

    try {
      // Obtener persona (usar cache si existe)
      let personaData = state.persona
      if (!personaData) {
        personaData = await personaService.obtenerPersonaPorSupabaseId(user.id)
        if (!personaData) {
          personaData = await personaService.obtenerPersonaPorEmail(user.email)
        }

        if (!personaData) {
          setError("No se encontró tu perfil en el sistema. Contacta al administrador.")
          return
        }

        updateState({ persona: personaData })
      }

      // Verificar historia académica (usar cache si existe)
      let historia = state.historiaAcademica
      if (!historia) {
        historia = await historiaAcademicaService.verificarHistoriaAcademica(personaData.id)
        updateState({ historiaAcademica: historia })
      }

      // Solo cargar materias e inscripciones si tiene historia académica
      if (historia) {
        await Promise.all([cargarMateriasDisponibles(personaData.id), cargarInscripcionesEstudiante(personaData.id)])
      } else {
        // Limpiar datos relacionados con inscripciones si no hay historia
        updateState({
          materiasDisponibles: [],
          inscripcionesEstudiante: [],
          materiaSeleccionada: null,
          mesaSeleccionada: "",
          anioSeleccionado: "",
          inscripcionExitosa: null,
          companerosInscriptos: [],
        })
      }
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err)
      setError("Error al cargar tus datos. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const cargarMateriasDisponibles = async (estudianteId) => {
    try {
      const materias = await inscripcionService.obtenerMateriasParaInscripcion(estudianteId)
      updateState({ materiasDisponibles: materias || [] })
    } catch (err) {
      console.error("Error al cargar materias disponibles:", err)
      updateState({ materiasDisponibles: [] })
    }
  }

  const cargarInscripcionesEstudiante = async (estudianteId) => {
    try {
      const inscripciones = await inscripcionService.obtenerInscripcionesEstudiante(estudianteId)

      // Enriquecer inscripciones con nombres de materias
      const inscripcionesConNombres = await enriquecerInscripcionesConNombres(inscripciones || [])

      updateState({ inscripcionesEstudiante: inscripcionesConNombres })
    } catch (err) {
      console.error("Error al cargar inscripciones del estudiante:", err)
      updateState({ inscripcionesEstudiante: [] })
    }
  }

  // Función para enriquecer inscripciones con nombres de materias usando Supabase
  const enriquecerInscripcionesConNombres = async (inscripciones) => {
    if (!inscripciones || inscripciones.length === 0) return []

    try {
      console.log("Inscripciones a enriquecer:", inscripciones)

      // Obtener códigos únicos de materias que necesitan nombres
      const materiasParaBuscar = inscripciones
        .filter((inscripcion) => !inscripcion.materiaNombre) // Solo las que no tienen nombre
        .map((inscripcion) => ({
          codigo: inscripcion.materiaCodigo,
          plan: inscripcion.materiaPlan,
        }))

      // Eliminar duplicados basándose en código + plan
      const materiasUnicas = materiasParaBuscar.filter(
        (materia, index, self) =>
          index === self.findIndex((m) => m.codigo === materia.codigo && m.plan === materia.plan),
      )

      if (materiasUnicas.length === 0) {
        console.log("Todas las inscripciones ya tienen nombres")
        return inscripciones // Ya todas tienen nombres
      }

      console.log("Materias únicas para buscar nombres:", materiasUnicas)

      // Obtener información de materias desde Supabase
      const materiasInfo = await materiaService.obtenerMateriasPorCodigos(materiasUnicas)

      console.log("Información de materias obtenida:", materiasInfo)

      // Crear mapa de código+plan -> nombre para búsqueda rápida
      const mapaNombres = {}
      materiasInfo.forEach((materia) => {
        const key = `${materia.codigo}-${materia.plan_de_estudio_codigo}`
        mapaNombres[key] = materia.nombre
      })

      console.log("Mapa de nombres creado:", mapaNombres)

      // Enriquecer inscripciones con nombres
      const inscripcionesEnriquecidas = inscripciones.map((inscripcion) => {
        // Si ya tiene nombre, no hacer nada
        if (inscripcion.materiaNombre) {
          return inscripcion
        }

        // Buscar el nombre en el mapa
        const key = `${inscripcion.materiaCodigo}-${inscripcion.materiaPlan}`
        const nombreMateria = mapaNombres[key]

        console.log(`Buscando nombre para ${key}: ${nombreMateria || "NO ENCONTRADO"}`)

        return {
          ...inscripcion,
          materiaNombre: nombreMateria || `Materia ${inscripcion.materiaCodigo}`, // Fallback
        }
      })

      console.log("Inscripciones enriquecidas finales:", inscripcionesEnriquecidas)
      return inscripcionesEnriquecidas
    } catch (error) {
      console.error("Error al enriquecer inscripciones con nombres:", error)
      // En caso de error, devolver inscripciones con nombres por defecto
      return inscripciones.map((inscripcion) => ({
        ...inscripcion,
        materiaNombre: inscripcion.materiaNombre || `Materia ${inscripcion.materiaCodigo}`,
      }))
    }
  }

  // Función auxiliar para cargar inscriptos (usada tanto para nueva consulta como para modal persistido)
  const cargarInscriptosParaModal = async (inscripcion) => {
    setLoadingInscriptos(true)
    setError(null)

    try {
      console.log("Consultando inscriptos para:", inscripcion)

      const inscriptos = await inscripcionService.obtenerInscriptosConEmails(
        inscripcion.materiaCodigo,
        inscripcion.anio,
        inscripcion.turno,
      )

      console.log("Inscriptos obtenidos:", inscriptos)
      setInscriptosConsulta(inscriptos || [])
    } catch (err) {
      console.error("Error al consultar inscriptos:", err)
      setError("Error al consultar los inscriptos. Intenta nuevamente.")
    } finally {
      setLoadingInscriptos(false)
    }
  }

  // Función para consultar inscriptos de una materia específica
  const consultarInscriptos = async (inscripcion) => {
    // Abrir modal y guardar datos de la inscripción
    openInscriptosModal(inscripcion, "inscriptos")

    // Cargar inscriptos
    await cargarInscriptosParaModal(inscripcion)
  }

  // Función para copiar email al portapapeles
  const copiarEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email)
      setSuccess(`Email ${email} copiado al portapapeles`)
    } catch (err) {
      console.error("Error al copiar email:", err)
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = email
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setSuccess(`Email ${email} copiado al portapapeles`)
    }
  }

  // Función para forzar recarga completa de datos (sin cache)
  const forzarRecargaDatos = async () => {
    if (!state.persona || !state.historiaAcademica) return

    console.log("Forzando recarga completa de datos de inscripción...")

    // Invalidar cache primero
    invalidateCache()

    setLoading(true)
    setError(null)

    try {
      const [materias, inscripciones] = await Promise.all([
        inscripcionService.obtenerMateriasParaInscripcion(state.persona.id),
        inscripcionService.obtenerInscripcionesEstudiante(state.persona.id),
      ])

      // Enriquecer inscripciones con nombres
      const inscripcionesConNombres = await enriquecerInscripcionesConNombres(inscripciones || [])

      console.log("Datos recargados:", { materias, inscripciones: inscripcionesConNombres })

      updateState({
        materiasDisponibles: materias || [],
        inscripcionesEstudiante: inscripcionesConNombres,
      })

      // Marcar datos como frescos
      markDataAsFresh()

      setSuccess("Datos actualizados correctamente.")
    } catch (err) {
      console.error("Error al forzar recarga de datos:", err)
      setError("Error al actualizar los datos. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const calcularAnioMesa = (mesa) => {
    const ahora = new Date()
    const anioActual = ahora.getFullYear()
    const mesActual = ahora.getMonth() + 1

    const mesesNumeros = {
      FEBRERO: 2,
      MARZO: 3,
      JULIO: 7,
      AGOSTO: 8,
      NOVIEMBRE: 11,
      DICIEMBRE: 12,
    }

    const mesMesa = mesesNumeros[mesa]

    if (mesMesa < mesActual || (mesMesa === mesActual && ahora.getDate() > 10)) {
      return anioActual + 1
    }

    return anioActual
  }

  const handleSeleccionarMateria = (materia) => {
    updateState({
      materiaSeleccionada: materia,
      mesaSeleccionada: "",
      anioSeleccionado: "",
      inscripcionExitosa: null,
      companerosInscriptos: [],
    })
    setShowConfirmacion(false)
  }

  const handleSeleccionarMesa = (mesa) => {
    const anio = calcularAnioMesa(mesa)
    updateState({
      mesaSeleccionada: mesa,
      anioSeleccionado: anio,
    })
    setShowConfirmacion(true)
  }

  const handleConfirmarInscripcion = async () => {
    if (!state.materiaSeleccionada || !state.mesaSeleccionada || !state.anioSeleccionado || !state.historiaAcademica) {
      setError("Faltan datos para completar la inscripción.")
      return
    }

    setLoadingInscripcion(true)
    setError(null)

    try {
      const dto = {
        turno: state.mesaSeleccionada,
        anio: state.anioSeleccionado,
        materiaCodigo: state.materiaSeleccionada.codigo,
        materiaPlan: state.historiaAcademica.plan_de_estudio_codigo,
        estudianteId: state.persona.id,
      }

      console.log("Creando inscripción con datos:", dto)

      const inscripcionCreada = await inscripcionService.crearInscripcion(dto)

      // Obtener compañeros inscriptos
      const companeros = await inscripcionService.obtenerInscriptosConEmails(
        state.materiaSeleccionada.codigo,
        state.anioSeleccionado,
        state.mesaSeleccionada,
      )

      // Filtrar al usuario actual de la lista
      const companerosFiltered = companeros.filter((c) => c.estudianteId !== state.persona.id)

      updateState({
        inscripcionExitosa: inscripcionCreada,
        companerosInscriptos: companerosFiltered,
      })

      setShowConfirmacion(false)
      setSuccess("¡Inscripción realizada exitosamente!")

      // FORZAR recarga de datos sin usar cache
      console.log("Forzando recarga de datos después de inscripción exitosa...")

      // Recargar datos directamente sin depender del cache
      try {
        const [nuevasMaterias, nuevasInscripciones] = await Promise.all([
          inscripcionService.obtenerMateriasParaInscripcion(state.persona.id),
          inscripcionService.obtenerInscripcionesEstudiante(state.persona.id),
        ])

        // Enriquecer nuevas inscripciones con nombres
        const nuevasInscripcionesConNombres = await enriquecerInscripcionesConNombres(nuevasInscripciones || [])

        console.log("Nuevas inscripciones cargadas:", nuevasInscripcionesConNombres)

        // Actualizar estado con datos frescos
        updateState({
          materiasDisponibles: nuevasMaterias || [],
          inscripcionesEstudiante: nuevasInscripcionesConNombres,
          lastUpdate: new Date().toISOString(), // Forzar actualización del timestamp
          // LIMPIAR SELECCIÓN DE MATERIA Y MESA
          materiaSeleccionada: null,
          mesaSeleccionada: "",
          anioSeleccionado: "",
        })
      } catch (reloadError) {
        console.error("Error al recargar datos después de inscripción:", reloadError)
        // Aún así mostrar éxito, pero avisar del problema de recarga
        setError(
          "Inscripción exitosa, pero hubo un problema al actualizar la lista. Recarga la página para ver los cambios.",
        )
      }

      // Limpiar selecciones después de un delay para mostrar el éxito
      setTimeout(() => {
        clearSelections()
      }, 5000)
    } catch (err) {
      console.error("Error al crear inscripción:", err)

      let errorMessage = "Error al crear la inscripción."
      if (err.response?.status === 409) {
        errorMessage = "Ya estás inscripto a esta materia en este período."
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }

      setError(errorMessage)
    } finally {
      setLoadingInscripcion(false)
    }
  }

  const handleEliminarInscripcion = async (inscripcion) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar tu inscripción a ${inscripcion.materiaNombre} (${inscripcion.turno} ${inscripcion.anio})?`,
      )
    ) {
      return
    }

    setLoadingEliminacion(inscripcion.id)
    setError(null)

    try {
      await inscripcionService.eliminarInscripcion(inscripcion.id)
      setSuccess("Inscripción eliminada correctamente.")

      // FORZAR recarga de datos sin usar cache
      console.log("Forzando recarga de datos después de eliminar inscripción...")

      try {
        const [nuevasMaterias, nuevasInscripciones] = await Promise.all([
          inscripcionService.obtenerMateriasParaInscripcion(state.persona.id),
          inscripcionService.obtenerInscripcionesEstudiante(state.persona.id),
        ])

        // Enriquecer inscripciones con nombres
        const nuevasInscripcionesConNombres = await enriquecerInscripcionesConNombres(nuevasInscripciones || [])

        console.log("Datos actualizados después de eliminar:", {
          nuevasMaterias,
          inscripciones: nuevasInscripcionesConNombres,
        })

        // Actualizar estado con datos frescos
        updateState({
          materiasDisponibles: nuevasMaterias || [],
          inscripcionesEstudiante: nuevasInscripcionesConNombres,
          lastUpdate: new Date().toISOString(), // Forzar actualización del timestamp
        })
      } catch (reloadError) {
        console.error("Error al recargar datos después de eliminar:", reloadError)
        setError(
          "Inscripción eliminada, pero hubo un problema al actualizar la lista. Recarga la página para ver los cambios.",
        )
      }

      // Limpiar inscripción exitosa si era la misma materia
      if (state.inscripcionExitosa && state.inscripcionExitosa.materiaCodigo === inscripcion.materiaCodigo) {
        updateState({
          inscripcionExitosa: null,
          companerosInscriptos: [],
        })
      }
    } catch (err) {
      console.error("Error al eliminar inscripción:", err)
      setError("Error al eliminar la inscripción.")
    } finally {
      setLoadingEliminacion(null)
    }
  }

  // Filtrar materias que ya tienen inscripción
  const materiasCodigosInscriptos = state.inscripcionesEstudiante.map((i) => i.materiaCodigo)
  const materiasDisponiblesFiltradas = state.materiasDisponibles.filter(
    (m) => !materiasCodigosInscriptos.includes(m.codigo),
  )

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  // Mostrar loading mientras no esté inicializado
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Inicializando inscripciones...</p>
      </div>
    )
  }

  if (loading && !state.persona) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando información de inscripciones...</p>
      </div>
    )
  }

  if (!state.persona) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Perfil no encontrado</h3>
        <p className="text-gray-600">No se pudo encontrar tu perfil en el sistema.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✏️ Inscripción a Mesas de Examen</h2>
        <p className="text-gray-600 mb-2">
          Inscríbete a las mesas de examen disponibles para tus materias pendientes.
          <br />
          La idea de esta inscripción es poner en contacto estudiantes para estudiar en conjunto
        </p>
        
        {state.historiaAcademica && (
          <div className="flex justify-end mt-2">
            <button
              onClick={forzarRecargaDatos}
              disabled={loading}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "🔄 Actualizar datos"}
            </button>
          </div>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Importante:</strong> Esta inscripción es propia del Asistente Virtual y es independiente del
            sistema SIU GUARANÍ.
          </p>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Estado de historia académica - Si no tiene historia, mostrar solo esto */}
      {!state.historiaAcademica ? (
        <div className="bg-white p-8 rounded-lg shadow-md border border-orange-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Debes cargar una historia académica</h3>
            <p className="text-gray-600 mb-6">
              Para poder inscribirte a mesas de examen, necesitas tener tu historia académica cargada en el sistema.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">📚</div>
                <div>
                  <h4 className="font-semibold text-blue-800">¿Cómo cargar mi historia académica?</h4>
                </div>
              </div>
              <ol className="text-sm text-blue-700 space-y-2 ml-8">
                <li>
                  1. Ve a la pestaña <strong>"Recomendación"</strong>
                </li>
                <li>2. Selecciona tu plan de estudio</li>
                <li>3. Sube tu archivo Excel con las materias cursadas</li>
                <li>4. Una vez cargada, podrás inscribirte a mesas de examen</li>
              </ol>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  // Cambiar a la pestaña de recomendación
                  const event = new CustomEvent("changeTab", { detail: "recomendacion" })
                  window.dispatchEvent(event)
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors transform hover:-translate-y-0.5"
              >
                📚 Ir a Recomendación
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Si tiene historia académica, mostrar todo el contenido de inscripción
        <>
          {/* Mensaje de inscripción exitosa */}
          {state.inscripcionExitosa && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🎉 ¡Has sido inscripto con éxito a la materia!
              </h3>
              <p className="text-blue-700 mb-4">Se notificó a los compañeros que también rinden tu inscripción.</p>

              {state.companerosInscriptos.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Compañeros inscriptos ({state.companerosInscriptos.length}):
                  </h4>
                  <div className="space-y-2">
                    {state.companerosInscriptos.map((companero) => (
                      <div key={companero.id} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{companero.estudianteNombre}</span>
                          {companero.email && <span className="text-sm text-gray-600">{companero.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-blue-600">Eres el primero en inscribirte a esta mesa.</p>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Panel izquierdo - Materias disponibles */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Materias Disponibles para Rendir</h3>

              {materiasDisponiblesFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📚</div>
                  <p>No tienes materias disponibles para inscribirte</p>
                  <p className="text-sm mt-2">
                    {state.materiasDisponibles.length > 0
                      ? "Ya estás inscripto a todas las materias disponibles"
                      : "No hay materias pendientes de rendir"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materiasDisponiblesFiltradas.map((materia) => (
                    <div
                      key={materia.codigo}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        state.materiaSeleccionada?.codigo === materia.codigo
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSeleccionarMateria(materia)}
                    >
                      <h4 className="font-semibold">{materia.nombre}</h4>
                      <p className="text-sm text-gray-600">Código: {materia.codigo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel derecho - Mesas disponibles */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Mesas de Examen</h3>

              {!state.materiaSeleccionada ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👈</div>
                  <p>Selecciona una materia para ver las mesas disponibles</p>
                </div>
              ) : (
                <div>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-800">Materia seleccionada:</h4>
                    <p className="text-blue-700">{state.materiaSeleccionada.nombre}</p>
                  </div>

                  <div className="space-y-3">
                    {mesas.map((mesa) => {
                      const anio = calcularAnioMesa(mesa)
                      return (
                        <button
                          key={mesa}
                          onClick={() => handleSeleccionarMesa(mesa)}
                          className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {mesa} {anio}
                            </span>
                            <span className="text-sm text-gray-500">
                              {mesa === "FEBRERO" || mesa === "MARZO" ? "Próximo año" : "Este año"}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal de confirmación */}
          {showConfirmacion && (
<div
  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 p-4"
  role="dialog"
  aria-modal="true"
  tabIndex={-1}
  style={{
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: "1rem",
  }}
>
              <div className="bg-white rounded-xl w-full max-w-md">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirmar Inscripción</h3>

                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="font-medium">Materia:</span>
                      <p className="text-gray-600">{state.materiaSeleccionada?.nombre}</p>
                    </div>
                    <div>
                      <span className="font-medium">Mesa:</span>
                      <p className="text-gray-600">
                        {state.mesaSeleccionada} {state.anioSeleccionado}
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-yellow-800">
                      Al confirmar, se notificará a otros estudiantes que también están inscriptos a esta mesa.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmarInscripcion}
                      disabled={loadingInscripcion}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {loadingInscripcion ? "Inscribiendo..." : "Confirmar Inscripción"}
                    </button>
                    <button
                      onClick={() => setShowConfirmacion(false)}
                      disabled={loadingInscripcion}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de inscriptos usando el componente Modal */}
          <Modal
            isOpen={showInscriptos}
            onClose={closeInscriptosModal}
            title={`Inscriptos a ${inscripcionConsultada?.materiaNombre || "la materia"}`}
            maxWidth="48rem"
          >
            {inscripcionConsultada && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Mesa:</strong> {inscripcionConsultada.turno} {inscripcionConsultada.anio}
                </p>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {loadingInscriptos ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-600">Cargando inscriptos...</p>
                </div>
              ) : inscriptosConsulta.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No hay otros inscriptos en esta mesa</p>
                  <p className="text-sm mt-1">Eres el único inscripto por ahora</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">Total de inscriptos: {inscriptosConsulta.length}</p>
                  {inscriptosConsulta.map((inscripto) => (
                    <div key={inscripto.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{inscripto.estudianteNombre}</h4>
                          {inscripto.email && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">📧 {inscripto.email}</span>
                              <button
                                onClick={() => copiarEmail(inscripto.email)}
                                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
                                title="Copiar email"
                              >
                                📋 Copiar
                              </button>
                            </div>
                          )}
                          {inscripto.estudianteId === state.persona?.id && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Tú</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>

          {/* Mis inscripciones */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Mis Inscripciones</h3>

            {state.inscripcionesEstudiante.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No tienes inscripciones activas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.inscripcionesEstudiante.map((inscripcion) => (
                  <div key={inscripcion.id} className="p-4 border border-gray-200 rounded-lg bg-green-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{inscripcion.materiaNombre}</h4>
                        <p className="text-sm text-gray-600">
                          {inscripcion.materiaCodigo} • {inscripcion.turno} {inscripcion.anio}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => consultarInscriptos(inscripcion)}
                          disabled={loadingInscriptos}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {loadingInscriptos ? "..." : "👥 Ver inscriptos"}
                        </button>
                        <button
                          onClick={() => handleEliminarInscripcion(inscripcion)}
                          disabled={loadingEliminacion === inscripcion.id}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {loadingEliminacion === inscripcion.id ? "Eliminando..." : "🗑️ Eliminar"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
