"use client"

import { useState, useEffect } from "react"
import planesEstudioService from "@/services/planesEstudioService"
import experienciaService from "@/services/experienciaService"
import historiaAcademicaService from "@/services/historiaAcademicaService"
import Modal from "@/components/modals/Modal"
import { useModalPersistence } from "@/hooks/useModalPersistence"
import personaService from "@/services/personaService"

export default function ExperienciasExamen({ user }) {
  // Estados principales
  const [loading, setLoading] = useState(true)
  const [loadingMaterias, setLoadingMaterias] = useState(false)
  const [loadingExperiencias, setLoadingExperiencias] = useState(false)
  const [loadingMisExperiencias, setLoadingMisExperiencias] = useState(false)

  // Estados de datos
  const [planes, setPlanes] = useState([])
  const [materias, setMaterias] = useState([])
  const [experiencias, setExperiencias] = useState([])
  const [misExperiencias, setMisExperiencias] = useState([])
  const [examenesDisponibles, setExamenesDisponibles] = useState([])
  const [persona, setPersona] = useState(null)
  const [historiaAcademica, setHistoriaAcademica] = useState(null)

  // Estados de filtros
  const [planSeleccionado, setPlanSeleccionado] = useState("")
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("")
  const [filtroCalificacion, setFiltroCalificacion] = useState("")

  // Estados de modales
  const {
    isOpen: showCrearModal,
    data: experienciaEditando,
    openModal: openCrearModal,
    closeModal: closeCrearModal,
  } = useModalPersistence("crear-experiencia-modal")

  // Estados del formulario
  const [formData, setFormData] = useState({
    examenId: "",
    dificultad: 5,
    diasEstudio: 1,
    horasDiarias: 1,
    intentosPrevios: 0,
    modalidad: "ESCRITO",
    recursos: [],
    motivacion: "solo para avanzar en la carrera",
  })

  // Estados de notificaciones
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Opciones para el formulario
  const recursosDisponibles = [
    "Libros",
    "Diapositivas",
    "Resumen",
    "Videos",
    "Ejercicios online",
    "Clases particulares",
    "Grupos de estudio",
    "Documentación oficial",
    "Foros",
    "Práctica con compañeros",
  ]

  const motivacionesDisponibles = ["se me vence", "necesito las correlativas", "solo para avanzar en la carrera"]

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    if (planSeleccionado) {
      cargarMaterias(planSeleccionado)
    } else {
      setMaterias([])
      setMateriaSeleccionada("")
    }
  }, [planSeleccionado])

  useEffect(() => {
    if (materiaSeleccionada && filtroCalificacion) {
      cargarExperienciasPorMateria()
    } else {
      setExperiencias([])
    }
  }, [materiaSeleccionada, filtroCalificacion])

  useEffect(() => {
    if (persona?.id) {
      // Verificar historia académica primero
      historiaAcademicaService
        .verificarHistoriaAcademica(persona.id)
        .then((historia) => {
          setHistoriaAcademica(historia)
          if (historia) {
            cargarMisExperiencias()
            cargarExamenesDisponibles()
          }
        })
        .catch((error) => {
          console.error("Error al verificar historia académica:", error)
          setHistoriaAcademica(null)
        })
    }
  }, [persona])

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const cargarDatosIniciales = async () => {
    setLoading(true)
    try {
      // Obtener persona (igual que en inscripción)
      const personaData =
        (await personaService.obtenerPersonaPorSupabaseId(user.id)) ||
        (await personaService.obtenerPersonaPorEmail(user.email))

      if (!personaData) {
        setError("No se encontró tu perfil en el sistema. Contacta al administrador.")
        return
      }

      setPersona(personaData)

      // Verificar historia académica (usar el mismo método que inscripción)
      const historia = await historiaAcademicaService.verificarHistoriaAcademica(personaData.id)

      if (!historia) {
        // No redirigir automáticamente, solo no cargar datos adicionales
        const planesData = await planesEstudioService.obtenerPlanes()
        setPlanes(planesData || [])
        return
      }

      // Solo cargar datos adicionales si tiene historia académica
      const planesData = await planesEstudioService.obtenerPlanes()
      setPlanes(planesData || [])
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError("Error al cargar los datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  const cargarMaterias = async (codigoPlan) => {
    setLoadingMaterias(true)
    try {
      const data = await planesEstudioService.obtenerMateriasPorPlan(codigoPlan)
      setMaterias(data || [])
    } catch (error) {
      console.error("Error al cargar materias:", error)
      setMaterias([])
    } finally {
      setLoadingMaterias(false)
    }
  }

  const cargarExperienciasPorMateria = async () => {
    if (!materiaSeleccionada) return

    setLoadingExperiencias(true)
    try {
      const data = await experienciaService.obtenerExperienciasPorMateria(materiaSeleccionada)
      // Filtrar por calificación si está seleccionada
      const experienciasFiltradas = filtroCalificacion
        ? data.filter((exp) => exp.nota >= Number.parseInt(filtroCalificacion))
        : data
      setExperiencias(experienciasFiltradas)
    } catch (error) {
      console.error("Error al cargar experiencias:", error)
      setExperiencias([])
      setError("Error al cargar las experiencias")
    } finally {
      setLoadingExperiencias(false)
    }
  }

  const cargarMisExperiencias = async () => {
    if (!persona?.id) return

    // Verificar historia académica antes de cargar experiencias
    try {
      const historia = await historiaAcademicaService.verificarHistoriaAcademica(persona.id)
      if (!historia) {
        setMisExperiencias([])
        return
      }
    } catch (error) {
      console.error("Error al verificar historia académica:", error)
      setMisExperiencias([])
      return
    }

    setLoadingMisExperiencias(true)
    try {
      const data = await experienciaService.obtenerExperienciasPorEstudiante(persona.id)
      setMisExperiencias(data)
    } catch (error) {
      console.error("Error al cargar mis experiencias:", error)
      setMisExperiencias([])
    } finally {
      setLoadingMisExperiencias(false)
    }
  }

  const cargarExamenesDisponibles = async () => {
    if (!persona?.id) return

    // Verificar historia académica antes de cargar exámenes
    try {
      const historia = await historiaAcademicaService.verificarHistoriaAcademica(persona.id)
      if (!historia) {
        setExamenesDisponibles([])
        return
      }
    } catch (error) {
      console.error("Error al verificar historia académica:", error)
      setExamenesDisponibles([])
      return
    }

    try {
      const examenes = await experienciaService.obtenerExamenesPorEstudiante(persona.id)
      const examenesConExperiencia = misExperiencias.map((exp) => exp.id)
      const examenesSinExperiencia = examenes.filter((examen) => !examenesConExperiencia.includes(examen.id))
      setExamenesDisponibles(examenesSinExperiencia)
    } catch (error) {
      console.error("Error al cargar exámenes disponibles:", error)
      setExamenesDisponibles([])
    }
  }

  const handleCrearExperiencia = async (e) => {
    e.preventDefault()

    try {
      const experienciaDTO = {
        ...formData,
        recursos: formData.recursos.join(", "),
        examenId: Number.parseInt(formData.examenId),
      }

      if (experienciaEditando) {
        // Actualizar experiencia existente
        await experienciaService.actualizarExperiencia(experienciaEditando.id, experienciaDTO)
        setSuccess("Experiencia actualizada correctamente")
      } else {
        // Crear nueva experiencia
        await experienciaService.crearExperiencia(experienciaDTO)
        setSuccess("Experiencia creada correctamente")
      }

      closeCrearModal()
      resetFormData()
      cargarMisExperiencias()
      cargarExamenesDisponibles()
    } catch (error) {
      console.error("Error al guardar experiencia:", error)
      setError("Error al guardar la experiencia")
    }
  }

  const handleEliminarExperiencia = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta experiencia?")) return

    try {
      await experienciaService.eliminarExperiencia(id)
      setSuccess("Experiencia eliminada correctamente")
      cargarMisExperiencias()
      cargarExamenesDisponibles()
    } catch (error) {
      console.error("Error al eliminar experiencia:", error)
      setError("Error al eliminar la experiencia")
    }
  }

  const handleEditarExperiencia = (experiencia) => {
    setFormData({
      examenId: experiencia.id,
      dificultad: experiencia.dificultad,
      diasEstudio: experiencia.diasEstudio,
      horasDiarias: experiencia.horasDiarias,
      intentosPrevios: experiencia.intentosPrevios,
      modalidad: experiencia.modalidad,
      recursos: experiencia.recursos.split(", "),
      motivacion: experiencia.motivacion,
    })
    openCrearModal(experiencia, "editar")
  }

  const resetFormData = () => {
    setFormData({
      examenId: "",
      dificultad: 5,
      diasEstudio: 1,
      horasDiarias: 1,
      intentosPrevios: 0,
      modalidad: "ESCRITO",
      recursos: [],
      motivacion: "solo para avanzar en la carrera",
    })
  }

  const handleRecursoChange = (recurso) => {
    setFormData((prev) => ({
      ...prev,
      recursos: prev.recursos.includes(recurso)
        ? prev.recursos.filter((r) => r !== recurso)
        : [...prev.recursos, recurso],
    }))
  }

  const getDificultadColor = (dificultad) => {
    if (dificultad >= 8) return "bg-red-100 text-red-800"
    if (dificultad >= 6) return "bg-orange-100 text-orange-800"
    if (dificultad >= 4) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getDificultadTexto = (dificultad) => {
    if (dificultad >= 8) return "Muy Alta"
    if (dificultad >= 6) return "Alta"
    if (dificultad >= 4) return "Media"
    return "Baja"
  }

  const getCalificacionColor = (calificacion) => {
    if (calificacion >= 8) return "text-green-600"
    if (calificacion >= 6) return "text-blue-600"
    if (calificacion >= 4) return "text-orange-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando experiencias...</p>
      </div>
    )
  }

  // Agregar esta verificación después del loading y antes del contenido principal
  if (!historiaAcademica && persona) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">💭 Experiencias de Examen</h2>
          <p className="text-gray-600">
            Descubre las experiencias de otros estudiantes y comparte la tuya para ayudar a la comunidad
          </p>
        </div>

        {/* Mensaje de historia académica faltante */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-orange-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Debes cargar una historia académica</h3>
            <p className="text-gray-600 mb-6">
              Para poder ver y compartir experiencias de examen, necesitas tener tu historia académica cargada en el
              sistema.
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
                <li>4. Una vez cargada, podrás ver y compartir experiencias</li>
              </ol>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de notificación */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{success}</span>
          <button onClick={() => setSuccess("")} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="sr-only">Cerrar</span>✕
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError("")} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="sr-only">Cerrar</span>✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💭 Experiencias de Examen</h2>
        <p className="text-gray-600">
          Descubre las experiencias de otros estudiantes y comparte la tuya para ayudar a la comunidad
        </p>
      </div>

      {/* Filtros para experiencias públicas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Buscar Experiencias</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan de Estudio:</label>
            <select
              value={planSeleccionado}
              onChange={(e) => setPlanSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecciona un plan</option>
              {planes.map((plan) => (
                <option key={plan.codigo} value={plan.codigo}>
                  {plan.propuesta} ({plan.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Materia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Materia:</label>
            <select
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
              disabled={!planSeleccionado || loadingMaterias}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="">
                {!planSeleccionado
                  ? "Selecciona un plan primero"
                  : loadingMaterias
                    ? "Cargando..."
                    : "Selecciona una materia"}
              </option>
              {materias.map((materia) => (
                <option key={materia.codigo} value={materia.codigo}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Calificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Calificación mínima:</label>
            <select
              value={filtroCalificacion}
              onChange={(e) => setFiltroCalificacion(e.target.value)}
              disabled={!materiaSeleccionada}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="">Selecciona calificación mínima</option>
              <option value="4">4 o más</option>
              <option value="6">6 o más</option>
              <option value="8">8 o más</option>
            </select>
          </div>
        </div>
      </div>

      {/* Experiencias públicas */}
      {materiaSeleccionada && filtroCalificacion && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Experiencias Compartidas ({experiencias.length})</h3>

          {loadingExperiencias ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando experiencias...</p>
            </div>
          ) : experiencias.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron experiencias</h4>
              <p className="text-gray-600">Sé el primero en compartir una experiencia para esta materia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiencias.map((experiencia, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Header de la experiencia */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{experiencia.nombreMateria}</h4>
                      <p className="text-gray-600">{experiencia.codigoMateria}</p>
                      <p className="text-sm text-gray-500">
                        Examen: {new Date(experiencia.fechaExamen).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getDificultadColor(
                          experiencia.dificultad,
                        )}`}
                      >
                        Dificultad: {getDificultadTexto(experiencia.dificultad)}
                      </span>
                      <span className={`text-2xl font-bold ${getCalificacionColor(experiencia.nota)}`}>
                        Nota: {experiencia.nota}
                      </span>
                    </div>
                  </div>

                  {/* Estadísticas de estudio */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 mb-1">Días de estudio</p>
                      <p className="text-lg font-bold text-blue-700">{experiencia.diasEstudio}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 mb-1">Horas por día</p>
                      <p className="text-lg font-bold text-green-700">{experiencia.horasDiarias}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 mb-1">Modalidad</p>
                      <p className="text-sm font-bold text-purple-700">{experiencia.modalidad}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 mb-1">Dificultad</p>
                      <p className="text-lg font-bold text-orange-700">{experiencia.dificultad}/10</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 mb-1">Intentos previos</p>
                      <p className="text-lg font-bold text-red-700">{experiencia.intentosPrevios}</p>
                    </div>
                  </div>

                  {/* Recursos utilizados */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">📚 Recursos utilizados:</h5>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{experiencia.recursos}</p>
                  </div>

                  {/* Motivación */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">🎯 Motivación:</h5>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{experiencia.motivacion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mis Experiencias */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Mis Experiencias</h3>
          <button
            onClick={() => {
              resetFormData()
              openCrearModal(null, "crear")
            }}
            disabled={examenesDisponibles.length === 0}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ✍️ Compartir Experiencia
          </button>
        </div>

        {loadingMisExperiencias ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando tus experiencias...</p>
          </div>
        ) : misExperiencias.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">No tienes experiencias compartidas</h4>
            <p className="text-gray-600">Comparte tu primera experiencia para ayudar a otros estudiantes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {misExperiencias.map((experiencia) => (
              <div
                key={experiencia.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Header con acciones */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">{experiencia.nombreMateria}</h4>
                    <p className="text-gray-600">{experiencia.codigoMateria}</p>
                    <p className="text-sm text-gray-500">
                      Examen: {new Date(experiencia.fechaExamen).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditarExperiencia(experiencia)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEliminarExperiencia(experiencia.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Días de estudio</p>
                    <p className="text-lg font-bold text-blue-700">{experiencia.diasEstudio}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Horas por día</p>
                    <p className="text-lg font-bold text-green-700">{experiencia.horasDiarias}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Modalidad</p>
                    <p className="text-sm font-bold text-purple-700">{experiencia.modalidad}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Dificultad</p>
                    <p className="text-lg font-bold text-orange-700">{experiencia.dificultad}/10</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Intentos previos</p>
                    <p className="text-lg font-bold text-red-700">{experiencia.intentosPrevios}</p>
                  </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">📚 Recursos:</h5>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">{experiencia.recursos}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">🎯 Motivación:</h5>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg text-sm">{experiencia.motivacion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar experiencia */}
      <Modal
        isOpen={showCrearModal}
        onClose={closeCrearModal}
        title={experienciaEditando ? "Editar Experiencia" : "Compartir Nueva Experiencia"}
        maxWidth="48rem"
      >
        <div className="p-6">
          <form onSubmit={handleCrearExperiencia} className="space-y-6">
            {/* Selector de examen */}
            {!experienciaEditando && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Examen *</label>
                <select
                  value={formData.examenId}
                  onChange={(e) => setFormData({ ...formData, examenId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona un examen</option>
                  {examenesDisponibles.map((examen) => (
                    <option key={examen.id} value={examen.id}>
                      {examen.materiaNombre} • {examen.fecha} • Nota: {examen.nota}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dificultad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad: {formData.dificultad}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.dificultad}
                  onChange={(e) => setFormData({ ...formData, dificultad: Number.parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muy Fácil</span>
                  <span>Muy Difícil</span>
                </div>
              </div>

              {/* Modalidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad *</label>
                <select
                  value={formData.modalidad}
                  onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ESCRITO">Escrito</option>
                  <option value="ORAL">Oral</option>
                </select>
              </div>

              {/* Días de estudio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Días de estudio</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, diasEstudio: Math.max(1, formData.diasEstudio - 1) })}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={formData.diasEstudio}
                    onChange={(e) => setFormData({ ...formData, diasEstudio: Number.parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, diasEstudio: formData.diasEstudio + 1 })}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Horas diarias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horas por día</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, horasDiarias: Math.max(1, formData.horasDiarias - 1) })}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={formData.horasDiarias}
                    onChange={(e) => setFormData({ ...formData, horasDiarias: Number.parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, horasDiarias: formData.horasDiarias + 1 })}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Intentos previos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intentos previos</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, intentosPrevios: Math.max(0, formData.intentosPrevios - 1) })
                    }
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.intentosPrevios}
                    onChange={(e) =>
                      setFormData({ ...formData, intentosPrevios: Number.parseInt(e.target.value) || 0 })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, intentosPrevios: formData.intentosPrevios + 1 })}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Motivación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivación *</label>
                <select
                  value={formData.motivacion}
                  onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {motivacionesDisponibles.map((motivacion) => (
                    <option key={motivacion} value={motivacion}>
                      {motivacion.charAt(0).toUpperCase() + motivacion.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recursos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recursos utilizados</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {recursosDisponibles.map((recurso) => (
                  <label key={recurso} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recursos.includes(recurso)}
                      onChange={() => handleRecursoChange(recurso)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{recurso}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {experienciaEditando ? "Actualizar Experiencia" : "Compartir Experiencia"}
              </button>
              <button
                type="button"
                onClick={closeCrearModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
