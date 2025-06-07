"use client"

import { useState } from "react"
import estadisticasService from "../../services/estadisticasService"
import PieChart from "./charts/PieChart"
import BarChart from "./charts/BarChart"

export default function EstadisticasMateria() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [codigoMateria, setCodigoMateria] = useState("")

  const buscarEstadisticas = async () => {
    if (!codigoMateria.trim()) {
      setError("Por favor ingrese un código de materia")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await estadisticasService.obtenerEstadisticasMateria(codigoMateria.trim())
      setEstadisticas(data)
    } catch (err) {
      console.error("Error al cargar estadísticas de materia:", err)
      setError("No se encontraron estadísticas para la materia especificada.")
      setEstadisticas(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    buscarEstadisticas()
  }

  return (
    <div className="estadisticas-materia">
      <h3 className="section-subtitle">Estadísticas por Materia</h3>

      {/* Buscador */}
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Ingrese código de materia (ej: 1, 282, 652)"
              value={codigoMateria}
              onChange={(e) => setCodigoMateria(e.target.value)}
              className="search-input"
            />
            <button type="submit" disabled={loading} className="search-button">
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>

      {/* Mensajes de estado */}
      {error && <div className="error-message">{error}</div>}

      {/* Resultados */}
      {estadisticas && (
        <div className="materia-estadisticas">
          {/* Header de la materia */}
          <div className="materia-header">
            <h4>{estadisticas.nombreMateria}</h4>
            <span className="materia-codigo">Código: {estadisticas.codigoMateria}</span>
            <span className="fecha-actualizacion">
              Última actualización: {new Date(estadisticas.fechaUltimaActualizacion).toLocaleDateString()}
            </span>
          </div>

          {/* Métricas principales */}
          <div className="materia-metrics">
            <div className="metric-card primary">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <h5>Total Rendidos</h5>
                <div className="metric-value">{estadisticas.totalRendidos}</div>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <h5>Aprobados</h5>
                <div className="metric-value">{estadisticas.aprobados}</div>
              </div>
            </div>

            <div className="metric-card danger">
              <div className="metric-icon">❌</div>
              <div className="metric-content">
                <h5>Reprobados</h5>
                <div className="metric-value">{estadisticas.reprobados}</div>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <h5>% Aprobados</h5>
                <div className="metric-value">{estadisticas.porcentajeAprobados.toFixed(1)}%</div>
              </div>
            </div>

            <div className="metric-card info">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <h5>Promedio Notas</h5>
                <div className="metric-value">{estadisticas.promedioNotas.toFixed(2)}</div>
              </div>
            </div>

            <div className="metric-card secondary">
              <div className="metric-icon">📅</div>
              <div className="metric-content">
                <h5>Días de Estudio</h5>
                <div className="metric-value">{estadisticas.promedioDiasEstudio.toFixed(1)}</div>
              </div>
            </div>

            <div className="metric-card secondary">
              <div className="metric-icon">⏰</div>
              <div className="metric-content">
                <h5>Horas Diarias</h5>
                <div className="metric-value">{estadisticas.promedioHorasDiarias.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Gráficos de distribución */}
          <div className="materia-charts">
            <div className="charts-row">
              <PieChart
                data={estadisticas.distribucionModalidad}
                title="Distribución por Modalidad"
                colors={["#4299e1", "#48bb78", "#ed8936"]}
              />

              <PieChart
                data={estadisticas.distribucionRecursos}
                title="Recursos Utilizados"
                colors={["#9f7aea", "#38b2ac", "#f56565"]}
              />
            </div>

            <BarChart
              data={estadisticas.distribucionDificultad}
              title="Distribución de Dificultad (1-10)"
              color="#ed8936"
              maxBars={10}
            />
          </div>
        </div>
      )}

      {!estadisticas && !loading && !error && (
        <div className="empty-state">
          <p>Ingrese un código de materia para ver las estadísticas</p>
        </div>
      )}
    </div>
  )
}
