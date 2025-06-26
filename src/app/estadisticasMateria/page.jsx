"use client"

import { useState, useEffect } from "react"
import estadisticasService from "@/services/estadisticasService"
import planesEstudioService from "@/services/planesEstudioService"
import PieChart from "@/components/charts/PieChart"
import BarChart from "@/components/charts/BarChart"
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton"
import { useSessionPersistence } from "@/hooks/useSessionPersistence"

export default function EstadisticasMateria() {
  const { estadisticasState, setEstadisticasState } = useSessionPersistence()

  const [estadisticas, setEstadisticas] = useState(() => {
    // Intentar cargar datos guardados del localStorage
    const savedData = localStorage.getItem("estadisticasMateria")
    return savedData ? JSON.parse(savedData) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState("")

  // Estados para los comboboxes - usar el estado persistente
  const [planes, setPlanes] = useState([])
  const [materias, setMaterias] = useState([])
  const [planSeleccionado, setPlanSeleccionado] = useState(estadisticasState.planSeleccionado)
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(estadisticasState.materiaSeleccionada)

  // Estados de carga
  const [loadingPlanes, setLoadingPlanes] = useState(true)
  const [loadingMaterias, setLoadingMaterias] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(() => {
    const savedTime = localStorage.getItem("estadisticasMateriaTime")
    return savedTime ? new Date(savedTime) : null
  })

  // Sincronizar estados locales con el estado persistente
  useEffect(() => {
    setPlanSeleccionado(estadisticasState.planSeleccionado)
    setMateriaSeleccionada(estadisticasState.materiaSeleccionada)
  }, [estadisticasState.planSeleccionado, estadisticasState.materiaSeleccionada])

  // Cargar planes al montar el componente
  useEffect(() => {
    cargarPlanes()
  }, [])

  // Cargar materias cuando se selecciona un plan
  useEffect(() => {
    if (planSeleccionado) {
      setEstadisticasState("planSeleccionado", planSeleccionado)
      cargarMaterias(planSeleccionado)
      // Solo limpiar materia seleccionada si cambia el plan y no estamos cargando desde estado persistente
      if (materiaSeleccionada && materiaSeleccionada !== estadisticasState.materiaSeleccionada) {
        setMateriaSeleccionada("")
        setEstadisticasState("materiaSeleccionada", "")
        setEstadisticas(null)
        localStorage.removeItem("estadisticasMateria")
        localStorage.removeItem("estadisticasMateriaTime")
        localStorage.removeItem("savedMateriaCode")
      }
    } else {
      setEstadisticasState("planSeleccionado", "")
      setMaterias([])
      setMateriaSeleccionada("")
      setEstadisticasState("materiaSeleccionada", "")
      setEstadisticas(null)
      localStorage.removeItem("estadisticasMateria")
      localStorage.removeItem("estadisticasMateriaTime")
      localStorage.removeItem("savedMateriaCode")
    }
  }, [planSeleccionado])

  // Cargar estadísticas cuando se selecciona una materia
  useEffect(() => {
    if (materiaSeleccionada) {
      setEstadisticasState("materiaSeleccionada", materiaSeleccionada)
      // Solo cargar si no hay datos guardados para esta materia
      const savedData = localStorage.getItem("estadisticasMateria")
      const savedMateria = localStorage.getItem("savedMateriaCode")
      if (!savedData || savedMateria !== materiaSeleccionada) {
        buscarEstadisticasRapido(materiaSeleccionada)
      }
    } else {
      setEstadisticasState("materiaSeleccionada", "")
      setEstadisticas(null)
      localStorage.removeItem("estadisticasMateria")
      localStorage.removeItem("estadisticasMateriaTime")
      localStorage.removeItem("savedMateriaCode")
    }
  }, [materiaSeleccionada])

  const cargarPlanes = async () => {
    setLoadingPlanes(true)
    try {
      const data = await planesEstudioService.obtenerPlanes()
      setPlanes(data)

      // Si hay un plan guardado, verificar que exista en los datos cargados
      if (
        estadisticasState.planSeleccionado &&
        !data.some((plan) => plan.codigo === estadisticasState.planSeleccionado)
      ) {
        setPlanSeleccionado("")
        setEstadisticasState("planSeleccionado", "")
        setEstadisticasState("materiaSeleccionada", "")
        localStorage.removeItem("estadisticasMateria")
        localStorage.removeItem("estadisticasMateriaTime")
        localStorage.removeItem("savedMateriaCode")
      }
    } catch (err) {
      console.error("Error al cargar planes:", err)
      setError("No se pudieron cargar los planes de estudio.")
    } finally {
      setLoadingPlanes(false)
    }
  }

  const cargarMaterias = async (codigoPlan) => {
    setLoadingMaterias(true)
    setError(null)
    try {
      const data = await planesEstudioService.obtenerMateriasPorPlan(codigoPlan)
      setMaterias(data)

      // Si hay una materia guardada, verificar que exista en los datos cargados
      if (
        estadisticasState.materiaSeleccionada &&
        !data.some((materia) => materia.codigo === estadisticasState.materiaSeleccionada)
      ) {
        setMateriaSeleccionada("")
        setEstadisticasState("materiaSeleccionada", "")
        localStorage.removeItem("estadisticasMateria")
        localStorage.removeItem("estadisticasMateriaTime")
        localStorage.removeItem("savedMateriaCode")
      }
    } catch (err) {
      console.error("Error al cargar materias:", err)
      setError("No se pudieron cargar las materias del plan seleccionado.")
      setMaterias([])
    } finally {
      setLoadingMaterias(false)
    }
  }

  // Función para cargar estadísticas rápidas (cacheadas con fallback automático)
  const buscarEstadisticasRapido = async (codigoMateria) => {
    setLoading(true)
    setError(null)
    setLoadingMessage("Cargando estadísticas...")

    try {
      const data = await estadisticasService.obtenerEstadisticasMateriaRapido(codigoMateria)
      setEstadisticas(data)
      const now = new Date()
      setLastUpdate(now)

      // Guardar en localStorage
      localStorage.setItem("estadisticasMateria", JSON.stringify(data))
      localStorage.setItem("estadisticasMateriaTime", now.toISOString())
      localStorage.setItem("savedMateriaCode", codigoMateria)
    } catch (err) {
      console.error("Error al cargar estadísticas de materia:", err)
      setError("No se encontraron estadísticas para la materia seleccionada.")
      setEstadisticas(null)
    } finally {
      setLoading(false)
      setLoadingMessage("")
    }
  }

  // Función para refrescar datos (usando el endpoint completo)
  const refrescarDatos = async () => {
    if (!materiaSeleccionada) return

    setLoading(true)
    setError(null)
    setLoadingMessage("Actualizando estadísticas...")

    try {
      const data = await estadisticasService.obtenerEstadisticasMateria(materiaSeleccionada)
      setEstadisticas(data)
      const now = new Date()
      setLastUpdate(now)

      // Guardar en localStorage
      localStorage.setItem("estadisticasMateria", JSON.stringify(data))
      localStorage.setItem("estadisticasMateriaTime", now.toISOString())
      localStorage.setItem("savedMateriaCode", materiaSeleccionada)
    } catch (err) {
      console.error("Error al refrescar estadísticas de materia:", err)
      setError("No se pudieron actualizar las estadísticas para la materia seleccionada.")
    } finally {
      setLoading(false)
      setLoadingMessage("")
    }
  }

  // Función para formatear la fecha correctamente (dd/mm/yyyy)
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Estadísticas por Materia</h3>
        <div className="flex items-center gap-4">
          {loadingMessage && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">{loadingMessage}</span>
            </div>
          )}
          {lastUpdate && !loadingMessage && (
            <span className="text-sm text-gray-500">Última actualización: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <button
            onClick={refrescarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={!materiaSeleccionada || loading}
          >
            <span>🔄</span> Refrescar
          </button>
        </div>
      </div>

      {/* Selectores en cascada */}
      <div className="bg-gray-50 rounded-xl p-8 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Selector de Plan */}
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-select" className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              Plan de Estudio
            </label>
            <select
              id="plan-select"
              value={planSeleccionado}
              onChange={(e) => setPlanSeleccionado(e.target.value)}
              disabled={loadingPlanes}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white text-gray-800 transition-all cursor-pointer focus:outline-none focus:border-blue-500 focus:shadow-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">{loadingPlanes ? "Cargando..." : "Seleccione un plan"}</option>
              {planes.map((plan) => (
                <option key={plan.codigo} value={plan.codigo}>
                  {plan.propuesta + " (" +plan.codigo + ")"}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Materia */}
          <div className="flex flex-col gap-2">
            <label htmlFor="materia-select" className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              Materia
            </label>
            <select
              id="materia-select"
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
              disabled={!planSeleccionado || loadingMaterias || materias.length === 0}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white text-gray-800 transition-all cursor-pointer focus:outline-none focus:border-blue-500 focus:shadow-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {!planSeleccionado
                  ? "Primero seleccione un plan"
                  : loadingMaterias
                    ? "Cargando..."
                    : materias.length === 0
                      ? "No hay materias disponibles"
                      : "Seleccione una materia"}
              </option>
              {materias.map((materia) => (
                <option key={materia.codigo} value={materia.codigo}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span>⚠️</span>
            <strong>Error al cargar estadísticas</strong>
          </div>
          <p className="mb-3">{error}</p>
          {materiaSeleccionada && (
            <button
              onClick={() => buscarEstadisticasRapido(materiaSeleccionada)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
            <MetricSkeleton />
          </div>
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartSkeleton type="pie" />
              <ChartSkeleton type="pie" />
            </div>
            <ChartSkeleton type="bar" />
          </div>
        </div>
      )}

      {/* Resultados */}
      {estadisticas && (
        <div>
          {/* Header de la materia */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-8 text-center shadow-lg">
            <h4 className="text-2xl font-bold mb-2">{estadisticas.nombreMateria}</h4>
            <span className="block text-base opacity-90 mb-2">Código: {estadisticas.codigoMateria}</span>
            <span className="block text-sm opacity-80">
              Última actualización: {formatearFecha(estadisticas.fechaUltimaActualizacion)}
            </span>
          </div>

          {/* Verificar si hay datos */}
          {estadisticas.totalRendidos === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mx-0">
              <div className="text-6xl mb-6 opacity-60">📊</div>
              <h4 className="text-2xl text-gray-800 mb-4 font-semibold">No hay estadísticas disponibles</h4>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                Esta materia aún no tiene exámenes rendidos registrados en el sistema.
              </p>
              <div className="flex flex-col gap-3 bg-white p-6 rounded-lg border-l-4 border-orange-500 max-w-md mx-auto text-left">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  ℹ️ Total de exámenes rendidos: <strong className="text-gray-800 font-semibold">0</strong>
                </span>
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  ℹ️ No hay datos suficientes para generar estadísticas
                </span>
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  ℹ️ Las estadísticas aparecerán cuando se registren exámenes
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Métricas principales - Primera fila */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-blue-500">
                  <div className="text-3xl opacity-80">👥</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Total Rendidos</h5>
                    <div className="text-3xl font-bold text-gray-800">{estadisticas.totalRendidos}</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-green-500">
                  <div className="text-3xl opacity-80">✅</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Aprobados</h5>
                    <div className="text-3xl font-bold text-gray-800">{estadisticas.aprobados}</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-red-500">
                  <div className="text-3xl opacity-80">❌</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Reprobados</h5>
                    <div className="text-3xl font-bold text-gray-800">{estadisticas.reprobados}</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-orange-500">
                  <div className="text-3xl opacity-80">📊</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">% Aprobados</h5>
                    <div className="text-3xl font-bold text-gray-800">
                      {estadisticas.porcentajeAprobados.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas principales - Segunda fila */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-teal-500">
                  <div className="text-3xl opacity-80">🎯</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Promedio Notas</h5>
                    <div className="text-3xl font-bold text-gray-800">{estadisticas.promedioNotas.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-gray-500">
                  <div className="text-3xl opacity-80">📅</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Promedio Días</h5>
                    <div className="text-3xl font-bold text-gray-800">
                      {estadisticas.promedioDiasEstudio.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-gray-500">
                  <div className="text-3xl opacity-80">⏰</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Promedio Horas</h5>
                    <div className="text-3xl font-bold text-gray-800">
                      {estadisticas.promedioHorasDiarias.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-purple-500">
                  <div className="text-3xl opacity-80">⭐</div>
                  <div>
                    <h5 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Promedio Dificultad</h5>
                    <div className="text-3xl font-bold text-gray-800">{estadisticas.promedioDificultad.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              {/* Gráficos de distribución */}
              <div className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
                  <PieChart
                    data={estadisticas.distribucionModalidad}
                    title="Distribución por Modalidad"
                    colors={["#4299e1", "#48bb78", "#ed8936"]}
                    showHover={false}
                  />

                  <PieChart
                    data={estadisticas.distribucionRecursos}
                    title="Recursos Utilizados"
                    colors={["#9f7aea", "#38b2ac", "#f56565"]}
                    showHover={false}
                  />
                </div>

                <BarChart
                  data={estadisticas.distribucionDificultad}
                  title="Distribución de Dificultad (1-10)"
                  colors={["#ed8936", "#48bb78", "#4299e1"]}
                  maxBars={10}
                  useIntegers={true}
                  showTooltip={false}
                  showBaseLabels={true}
                  baseLabels={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!estadisticas && !loading && !error && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-4 opacity-50">📊</div>
          <h4 className="text-xl text-gray-600 mb-2 font-semibold">Seleccione un plan y una materia</h4>
          <p className="text-base text-gray-500 max-w-md mx-auto">
            Elija un plan de estudio y luego una materia para ver las estadísticas detalladas
          </p>
        </div>
      )}
    </div>
  )
}
