"use client"

import { useState, useEffect } from "react"

export default function Estadisticas() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos carga de datos
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="estadisticas-container">
      <h2 className="section-title">Estadísticas del Sistema</h2>

      {loading ? (
        <div className="loading-indicator">Cargando estadísticas...</div>
      ) : (
        <div className="estadisticas-content">
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Estudiantes Activos</h3>
              <div className="stat-value">1,245</div>
              <div className="stat-trend positive">+5.2% desde el mes pasado</div>
            </div>

            <div className="stat-card">
              <h3>Planes de Estudio</h3>
              <div className="stat-value">8</div>
              <div className="stat-trend">Sin cambios</div>
            </div>

            <div className="stat-card">
              <h3>Materias Activas</h3>
              <div className="stat-value">156</div>
              <div className="stat-trend positive">+3 nuevas materias</div>
            </div>

            <div className="stat-card">
              <h3>Promedio General</h3>
              <div className="stat-value">7.8</div>
              <div className="stat-trend positive">+0.3 puntos</div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3>Distribución de Estudiantes por Carrera</h3>
              <div className="chart-placeholder">
                <p>Aquí se mostrará un gráfico de distribución</p>
              </div>
            </div>

            <div className="chart-card">
              <h3>Rendimiento Académico</h3>
              <div className="chart-placeholder">
                <p>Aquí se mostrará un gráfico de rendimiento</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
