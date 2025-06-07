"use client"

import { useState, useEffect } from "react"
import estadisticasService from "../../services/estadisticasService"
import PieChart from "./charts/PieChart"
import BarChart from "./charts/BarChart"

export default function EstadisticasGenerales() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarEstadisticasGenerales()
  }, [])

  const cargarEstadisticasGenerales = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await estadisticasService.obtenerEstadisticasGenerales()
      setEstadisticas(data)
    } catch (err) {
      console.error("Error al cargar estadísticas generales:", err)
      setError("No se pudieron cargar las estadísticas generales.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-indicator">Cargando estadísticas generales...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!estadisticas) {
    return <div className="no-data">No hay datos disponibles</div>
  }

  return (
    <div className="estadisticas-generales">
      <h3 className="section-subtitle">Estadísticas Generales del Sistema</h3>

      {/* Métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h4>Estudiantes Activos</h4>
            <div className="metric-value">{estadisticas.estudiantesActivos}</div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">📚</div>
          <div className="metric-content">
            <h4>Total Materias</h4>
            <div className="metric-value">{estadisticas.totalMaterias}</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">📝</div>
          <div className="metric-content">
            <h4>Exámenes Rendidos</h4>
            <div className="metric-value">{estadisticas.totalExamenesRendidos}</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h4>% Aprobados General</h4>
            <div className="metric-value">{estadisticas.porcentajeAprobadosGeneral.toFixed(1)}%</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h4>Promedio General</h4>
            <div className="metric-value">{estadisticas.promedioGeneral.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Gráficos de distribución */}
      <div className="charts-section">
        <div className="charts-row">
          <PieChart
            data={estadisticas.distribucionEstudiantesPorCarrera}
            title="Distribución de Estudiantes por Carrera"
          />

          <div className="materia-destacada">
            <h4>Materia Más Rendida</h4>
            <div className="destacada-card">
              <div className="destacada-nombre">{estadisticas.materiaMasRendida.nombre}</div>
              <div className="destacada-codigo">Código: {estadisticas.materiaMasRendida.codigoMateria}</div>
              <div className="destacada-cantidad">{estadisticas.cantidadMateriaMasRendida} exámenes</div>
              <div className="destacada-porcentaje">{estadisticas.materiaMasRendida.porcentaje}% aprobación</div>
            </div>
          </div>
        </div>

        <BarChart
          data={estadisticas.distribucionExamenesPorMateria}
          title="Distribución de Exámenes por Materia"
          color="#48bb78"
          maxBars={10}
        />
      </div>

      {/* Rankings */}
      <div className="rankings-section">
        <div className="ranking-container">
          <h4>🏆 Top 5 Materias Más Aprobadas</h4>
          <div className="ranking-list">
            {estadisticas.top5Aprobadas.map((materia, index) => (
              <div key={materia.codigoMateria} className="ranking-item success">
                <div className="ranking-position">#{index + 1}</div>
                <div className="ranking-content">
                  <div className="ranking-name">{materia.nombre}</div>
                  <div className="ranking-code">Código: {materia.codigoMateria}</div>
                </div>
                <div className="ranking-percentage">{materia.porcentaje.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ranking-container">
          <h4>📉 Top 5 Materias Más Reprobadas</h4>
          <div className="ranking-list">
            {estadisticas.top5Reprobadas.map((materia, index) => (
              <div key={materia.codigoMateria} className="ranking-item danger">
                <div className="ranking-position">#{index + 1}</div>
                <div className="ranking-content">
                  <div className="ranking-name">{materia.nombre}</div>
                  <div className="ranking-code">Código: {materia.codigoMateria}</div>
                </div>
                <div className="ranking-percentage">{materia.porcentaje.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promedio de notas por materia */}
      <div className="promedios-section">
        <BarChart
          data={estadisticas.promedioNotasPorMateria}
          title="Promedio de Notas por Materia"
          color="#9f7aea"
          maxBars={15}
        />
      </div>
    </div>
  )
}
