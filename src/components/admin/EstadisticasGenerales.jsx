"use client"

import { useState, useEffect } from "react"
import estadisticasService from "../../services/estadisticasService"
import PieChart from "./charts/PieChart"
import BarChart from "./charts/BarChart"
import { MetricSkeleton, ChartSkeleton } from "../ui/Skeleton"

export default function EstadisticasGenerales() {
  const [estadisticas, setEstadisticas] = useState(() => {
    // Intentar cargar datos guardados del localStorage
    const savedData = localStorage.getItem("estadisticasGenerales")
    return savedData ? JSON.parse(savedData) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [lastUpdate, setLastUpdate] = useState(() => {
    const savedTime = localStorage.getItem("estadisticasGeneralesTime")
    return savedTime ? new Date(savedTime) : null
  })

  useEffect(() => {
    // Si no hay datos guardados, cargar automáticamente
    if (!estadisticas) {
      cargarEstadisticasGeneralesRapido()
    }
  }, [])

  // Función para cargar estadísticas rápidas (cacheadas con fallback automático)
  const cargarEstadisticasGeneralesRapido = async () => {
    setLoading(true)
    setError(null)
    setLoadingMessage("Cargando estadísticas...")

    try {
      const data = await estadisticasService.obtenerEstadisticasGeneralesRapido()
      setEstadisticas(data)
      const now = new Date()
      setLastUpdate(now)

      // Guardar en localStorage
      localStorage.setItem("estadisticasGenerales", JSON.stringify(data))
      localStorage.setItem("estadisticasGeneralesTime", now.toISOString())
    } catch (err) {
      console.error("Error al cargar estadísticas generales:", err)
      setError("No se pudieron cargar las estadísticas generales. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
      setLoadingMessage("")
    }
  }

  // Función para refrescar datos (usando el endpoint completo)
  const refrescarDatos = async () => {
    setLoading(true)
    setError(null)
    setLoadingMessage("Actualizando estadísticas...")

    try {
      const data = await estadisticasService.obtenerEstadisticasGenerales()
      setEstadisticas(data)
      const now = new Date()
      setLastUpdate(now)

      // Guardar en localStorage
      localStorage.setItem("estadisticasGenerales", JSON.stringify(data))
      localStorage.setItem("estadisticasGeneralesTime", now.toISOString())
    } catch (err) {
      console.error("Error al refrescar estadísticas generales:", err)
      setError("No se pudieron actualizar las estadísticas generales. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
      setLoadingMessage("")
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Estadísticas Generales del Sistema</h3>
          {loadingMessage && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">{loadingMessage}</span>
            </div>
          )}
        </div>

        {/* Métricas skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>

        {/* Gráficos skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartSkeleton type="pie" />
            <ChartSkeleton type="bar" />
          </div>
          <ChartSkeleton type="bar" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span>⚠️</span>
          <strong>Error al cargar estadísticas</strong>
        </div>
        <p className="mb-3">{error}</p>
        <button
          onClick={cargarEstadisticasGeneralesRapido}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!estadisticas) {
    return <div className="text-center py-8 text-gray-400 italic">No hay datos disponibles</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Estadísticas Generales del Sistema</h3>
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <span className="text-sm text-gray-500">Última actualización: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <button
            onClick={refrescarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <span>🔄</span> Refrescar
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-blue-500">
          <div className="text-3xl opacity-80">👥</div>
          <div>
            <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Estudiantes Activos</h4>
            <div className="text-3xl font-bold text-gray-800">{estadisticas.estudiantesActivos}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-gray-500">
          <div className="text-3xl opacity-80">📚</div>
          <div>
            <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Total Materias</h4>
            <div className="text-3xl font-bold text-gray-800">{estadisticas.totalMaterias}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-green-500">
          <div className="text-3xl opacity-80">📝</div>
          <div>
            <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Exámenes Rendidos</h4>
            <div className="text-3xl font-bold text-gray-800">{estadisticas.totalExamenesRendidos}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-orange-500">
          <div className="text-3xl opacity-80">📊</div>
          <div>
            <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">% Aprobados General</h4>
            <div className="text-3xl font-bold text-gray-800">
              {estadisticas.porcentajeAprobadosGeneral.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-teal-500">
          <div className="text-3xl opacity-80">🎯</div>
          <div>
            <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Promedio General</h4>
            <div className="text-3xl font-bold text-gray-800">{estadisticas.promedioGeneral.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Gráficos de distribución */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PieChart
            data={estadisticas.distribucionEstudiantesPorCarrera}
            title="Distribución de Estudiantes por Carrera"
            showHover={false}
          />

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h4 className="text-base text-gray-600 mb-4 text-center font-semibold">Materia Más Rendida</h4>
            <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white shadow-lg">
              <div className="text-xl font-bold mb-4">{estadisticas.materiaMasRendida.nombre}</div>
              <div className="text-2xl font-bold mb-2">{estadisticas.cantidadMateriaMasRendida} exámenes</div>
              <div className="text-lg opacity-90">
                {estadisticas.materiaMasRendida.porcentaje.toFixed(1)}% aprobación
              </div>
            </div>
          </div>
        </div>

        <BarChart
          data={estadisticas.distribucionExamenesPorMateria}
          title="Distribución de Exámenes por Materia"
          colors={["#4299e1", "#48bb78", "#ed8936"]}
          maxBars={15}
          useIntegers={true}
          showNameBelow={true}
        />
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="text-base text-gray-600 mb-4 font-semibold">🏆 Top 5 Materias Más Aprobadas</h4>
          <div className="flex flex-col gap-3">
            {estadisticas.top5Aprobadas.map((materia, index) => (
              <div
                key={materia.codigoMateria}
                className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="font-bold text-lg text-gray-600 min-w-[30px]">#{index + 1}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{materia.nombre}</div>
                </div>
                <div className="font-bold text-lg text-gray-800">{materia.porcentaje.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="text-base text-gray-600 mb-4 font-semibold">📉 Top 5 Materias Más Reprobadas</h4>
          <div className="flex flex-col gap-3">
            {estadisticas.top5Reprobadas.map((materia, index) => (
              <div
                key={materia.codigoMateria}
                className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-red-500 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="font-bold text-lg text-gray-600 min-w-[30px]">#{index + 1}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{materia.nombre}</div>
                </div>
                <div className="font-bold text-lg text-gray-800">{materia.porcentaje.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promedio de notas por materia */}
      <div className="mt-8">
        <BarChart
          data={estadisticas.promedioNotasPorMateria}
          title="Promedio de Notas por Materia"
          colors={["#9f7aea", "#38b2ac", "#f56565"]}
          maxBars={15}
          useIntegers={false}
          showNameBelow={true}
        />
      </div>
    </div>
  )
}
