"use client"

import { useState, useEffect } from "react"
import planesEstudioService from "@/services/planesEstudioService"

export default function ExperienciasExamen({ user }) {
  const [experiencias, setExperiencias] = useState([])
  const [planes, setPlanes] = useState([])
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMaterias, setLoadingMaterias] = useState(false)

  // Filtros
  const [planSeleccionado, setPlanSeleccionado] = useState("")
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("")
  const [filtroCalificacion, setFiltroCalificacion] = useState("")

  // Modal para nueva experiencia
  const [showModal, setShowModal] = useState(false)
  const [nuevaExperiencia, setNuevaExperiencia] = useState({
    materia: "",
    calificacion: "",
    dificultad: 5,
    diasEstudio: "",
    horasDiarias: "",
    recursos: "",
    modalidad: "",
    comentarios: "",
    consejos: "",
  })

  // Datos de ejemplo (en una implementación real vendrían de la API)
  const experienciasEjemplo = [
    {
      id: 1,
      nombreMateria: "Cálculo I",
      codigoMateria: "CAL101",
      estudiante: "Ana García",
      calificacion: 8,
      dificultad: 7,
      diasEstudio: 21,
      horasDiarias: 4,
      recursos: "Libros, Videos, Ejercicios online",
      modalidad: "Presencial",
      fecha: "2024-11-15",
      comentarios: "El examen fue más difícil de lo esperado, especialmente los límites.",
      consejos: "Practicar muchos ejercicios de límites y derivadas. Los videos de Khan Academy ayudan mucho.",
    },
    {
      id: 2,
      nombreMateria: "Programación I",
      codigoMateria: "PRG101",
      estudiante: "Carlos López",
      calificacion: 9,
      dificultad: 6,
      diasEstudio: 14,
      horasDiarias: 3,
      recursos: "Documentación, Proyectos prácticos",
      modalidad: "Virtual",
      fecha: "2024-11-10",
      comentarios: "Examen muy práctico, se enfocó en resolver problemas reales.",
      consejos: "Hacer muchos ejercicios de programación. La práctica es clave.",
    },
    {
      id: 3,
      nombreMateria: "Álgebra Lineal",
      codigoMateria: "ALG201",
      estudiante: "María Rodríguez",
      calificacion: 7,
      dificultad: 8,
      diasEstudio: 28,
      horasDiarias: 5,
      recursos: "Libros, Clases particulares, Grupos de estudio",
      modalidad: "Presencial",
      fecha: "2024-11-05",
      comentarios: "Muy teórico, requiere entender bien los conceptos fundamentales.",
      consejos: "No memorizar, entender los conceptos. Los grupos de estudio son muy útiles.",
    },
  ]

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

  const cargarDatosIniciales = async () => {
    setLoading(true)
    try {
      // Cargar planes
      const planesData = await planesEstudioService.obtenerPlanes()
      setPlanes(planesData || [])

      // Cargar experiencias (simuladas)
      setExperiencias(experienciasEjemplo)
    } catch (error) {
      console.error("Error al cargar datos:", error)
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

  const experienciasFiltradas = experiencias.filter((exp) => {
    if (materiaSeleccionada && exp.codigoMateria !== materiaSeleccionada) return false
    if (filtroCalificacion && exp.calificacion < Number.parseInt(filtroCalificacion)) return false
    return true
  })

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

  const handleSubmitExperiencia = (e) => {
    e.preventDefault()
    // Aquí se enviaría la experiencia a la API
    console.log("Nueva experiencia:", nuevaExperiencia)
    setShowModal(false)
    setNuevaExperiencia({
      materia: "",
      calificacion: "",
      dificultad: 5,
      diasEstudio: "",
      horasDiarias: "",
      recursos: "",
      modalidad: "",
      comentarios: "",
      consejos: "",
    })
    // Mostrar mensaje de éxito
    alert("¡Experiencia compartida exitosamente!")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando experiencias...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💭 Experiencias de Examen</h2>
        <p className="text-gray-600">
          Descubre las experiencias de otros estudiantes y comparte la tuya para ayudar a la comunidad
        </p>
      </div>

      {/* Controles y Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filtrar Experiencias</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ✍️ Compartir mi Experiencia
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan de Estudio:</label>
            <select
              value={planSeleccionado}
              onChange={(e) => setPlanSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los planes</option>
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
                    : "Todas las materias"}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las calificaciones</option>
              <option value="4">4 o más</option>
              <option value="6">6 o más</option>
              <option value="8">8 o más</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Experiencias */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Experiencias Compartidas ({experienciasFiltradas.length})
        </h3>

        {experienciasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron experiencias</h4>
            <p className="text-gray-600">
              Intenta ajustar los filtros o sé el primero en compartir una experiencia para esta materia
            </p>
          </div>
        ) : (
          experienciasFiltradas.map((experiencia) => (
            <div
              key={experiencia.id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Header de la experiencia */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{experiencia.nombreMateria}</h4>
                  <p className="text-gray-600">
                    {experiencia.codigoMateria} • Por {experiencia.estudiante}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(experiencia.fecha).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getDificultadColor(
                      experiencia.dificultad,
                    )}`}
                  >
                    {getDificultadTexto(experiencia.dificultad)}
                  </span>
                  <span className={`text-2xl font-bold ${getCalificacionColor(experiencia.calificacion)}`}>
                    {experiencia.calificacion}
                  </span>
                </div>
              </div>

              {/* Estadísticas de estudio */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
              </div>

              {/* Recursos utilizados */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-800 mb-2">📚 Recursos utilizados:</h5>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{experiencia.recursos}</p>
              </div>

              {/* Comentarios */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-800 mb-2">💬 Comentarios sobre el examen:</h5>
                <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{experiencia.comentarios}</p>
              </div>

              {/* Consejos */}
              <div>
                <h5 className="font-semibold text-gray-800 mb-2">💡 Consejos para futuros estudiantes:</h5>
                <p className="text-gray-600 bg-green-50 p-3 rounded-lg">{experiencia.consejos}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para nueva experiencia */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Compartir mi Experiencia</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitExperiencia} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materia *</label>
                    <input
                      type="text"
                      required
                      value={nuevaExperiencia.materia}
                      onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, materia: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Cálculo I"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calificación *</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={nuevaExperiencia.calificacion}
                      onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, calificacion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Días de estudio</label>
                    <input
                      type="number"
                      value={nuevaExperiencia.diasEstudio}
                      onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, diasEstudio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horas por día</label>
                    <input
                      type="number"
                      value={nuevaExperiencia.horasDiarias}
                      onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, horasDiarias: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dificultad (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={nuevaExperiencia.dificultad}
                      onChange={(e) =>
                        setNuevaExperiencia({ ...nuevaExperiencia, dificultad: Number.parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{nuevaExperiencia.dificultad}/10</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                    <select
                      value={nuevaExperiencia.modalidad}
                      onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, modalidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Mixta">Mixta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recursos utilizados</label>
                  <textarea
                    value={nuevaExperiencia.recursos}
                    onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, recursos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Ej: Libros, videos, ejercicios online..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios sobre el examen</label>
                  <textarea
                    value={nuevaExperiencia.comentarios}
                    onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, comentarios: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Describe cómo fue el examen, qué temas se evaluaron, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consejos para futuros estudiantes
                  </label>
                  <textarea
                    value={nuevaExperiencia.consejos}
                    onChange={(e) => setNuevaExperiencia({ ...nuevaExperiencia, consejos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Comparte tus mejores consejos para aprobar esta materia"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Compartir Experiencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
