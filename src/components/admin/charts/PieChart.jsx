"use client"

import { useEffect, useRef } from "react"

// Componente simple de gráfico de torta usando Canvas
export default function PieChart({ data, title, colors = [] }) {
  const canvasRef = useRef(null)

  // Colores por defecto
  const defaultColors = [
    "#4299e1",
    "#48bb78",
    "#ed8936",
    "#9f7aea",
    "#38b2ac",
    "#f56565",
    "#ecc94b",
    "#667eea",
    "#f093fb",
    "#4fd1c7",
  ]

  const chartColors = colors.length > 0 ? colors : defaultColors

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calcular total
    const values = Object.values(data)
    const total = values.reduce((sum, value) => sum + value, 0)

    if (total === 0) return

    // Dibujar segmentos
    let currentAngle = -Math.PI / 2 // Empezar desde arriba
    const entries = Object.entries(data)

    entries.forEach(([label, value], index) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      // Dibujar segmento
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = chartColors[index % chartColors.length]
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      currentAngle += sliceAngle
    })
  }, [data, chartColors])

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-container">
        <h4>{title}</h4>
        <div className="no-data">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h4>{title}</h4>
      <div className="pie-chart-wrapper">
        <canvas ref={canvasRef} width={300} height={300} className="pie-canvas" />
        <div className="chart-legend">
          {Object.entries(data).map(([label, value], index) => (
            <div key={label} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
              <span className="legend-label">{label}</span>
              <span className="legend-value">({value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
