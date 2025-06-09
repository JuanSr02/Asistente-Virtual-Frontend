"use client"

import { useState, useEffect } from "react"
import estadisticasService from "../../services/estadisticasService"
import planesEstudioService from "../../services/planesEstudioService"
import PieChart from "./charts/PieChart"
import BarChart from "./charts/BarChart"

export default function EstadisticasMateria() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para los comboboxes
  const [planes, setPlanes] = useState([])
  const [materias, setMaterias] = useState([])
  const [planSeleccionado, setPlanSeleccionado] = useState("")
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("")

  // Estados de carga
  const [loadingPlanes, setLoadingPlanes] = useState(true)
  const [loadingMaterias, setLoadingMaterias] = useState(false)

  // Cargar planes al montar el componente
  useEffect(() => {
    cargarPlanes()
  }, [])

  // Cargar materias cuando se selecciona un plan
  useEffect(() => {
    if (planSeleccionado) {
      cargarMaterias(planSeleccionado)
      // Limpiar materia seleccionada y estadísticas cuando cambia el plan
      setMateriaSeleccionada("")
      setEstadisticas(null)
    } else {
      setMaterias([])
      setMateriaSeleccionada("")
      setEstadisticas(null)
    }
  }, [planSeleccionado])

  // Cargar estadísticas cuando se selecciona una materia
  useEffect(() => {
    if (materiaSeleccionada) {
      buscarEstadisticas(materiaSeleccionada)
    } else {
      setEstadisticas(null)
    }
  }, [materiaSeleccionada])

  const cargarPlanes = async () => {
    setLoadingPlanes(true)
    try {
      const data = await planesEstudioService.obtenerPlanes()
      setPlanes(data)
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
    } catch (err) {
      console.error("Error al cargar materias:", err)
      setError("No se pudieron cargar las materias del plan seleccionado.")
      setMaterias([])
    } finally {
      setLoadingMaterias(false)
    }
  }

  const buscarEstadisticas = async (codigoMateria) => {
    setLoading(true)
    setError(null)
    try {
      const data = await estadisticasService.obtenerEstadisticasMateria(codigoMateria)
      setEstadisticas(data)
    } catch (err) {
      console.error("Error al cargar estadísticas de materia:", err)
      setError("No se encontraron estadísticas para la materia seleccionada.")
      setEstadisticas(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="estadisticas-materia">
      <h3 className="section-subtitle">Estadísticas por Materia</h3>

      {/* Selectores en cascada */}
      <div className="selectors-section">
        <div className="selectors-grid">
          {/* Selector de Plan */}
          <div className="selector-group">
            <label htmlFor="plan-select" className="selector-label">
              Plan de Estudio
            </label>
            <select
              id="plan-select"
              value={planSeleccionado}
              onChange={(e) => setPlanSeleccionado(e.target.value)}
              disabled={loadingPlanes}
              className="selector-input"
            >
              <option value="">{loadingPlanes ? "Cargando planes..." : "Seleccione un plan"}</option>
              {planes.map((plan) => (
                <option key={plan.codigo} value={plan.codigo}>
                  {plan.propuesta}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Materia */}
          <div className="selector-group">
            <label htmlFor="materia-select" className="selector-label">
              Materia
            </label>
            <select
              id="materia-select"
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
              disabled={!planSeleccionado || loadingMaterias || materias.length === 0}
              className="selector-input"
            >
              <option value="">
                {!planSeleccionado
                  ? "Primero seleccione un plan"
                  : loadingMaterias
                    ? "Cargando materias..."
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

        {/* Información adicional */}
        {planSeleccionado && (
          <div className="selection-info">
            <span className="info-item">
              <strong>Plan seleccionado:</strong> {planes.find((p) => p.codigo === planSeleccionado)?.propuesta}
            </span>
            {materiaSeleccionada && (
              <span className="info-item">
                <strong>Materia seleccionada:</strong> {materias.find((m) => m.codigo === materiaSeleccionada)?.nombre}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mensajes de estado */}
      {error && <div className="error-message">{error}</div>}

      {/* Indicador de carga */}
      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>Cargando estadísticas de la materia...</span>
        </div>
      )}

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

          {/* Verificar si hay datos */}
          {estadisticas.totalRendidos === 0 ? (
            <div className="no-statistics-state">
              <div className="no-stats-icon">📊</div>
              <h4>No hay estadísticas disponibles</h4>
              <p>Esta materia aún no tiene exámenes rendidos registrados en el sistema.</p>
              <div className="no-stats-details">
                <span>
                  • Total de exámenes rendidos: <strong>0</strong>
                </span>
                <span>• No hay datos suficientes para generar estadísticas</span>
                <span>• Las estadísticas aparecerán cuando se registren exámenes</span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!estadisticas && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h4>Seleccione un plan y una materia</h4>
          <p>Elija un plan de estudio y luego una materia para ver las estadísticas detalladas</p>
        </div>
      )}
    </div>
  )
}
