"use client"

import { useEffect, useRef } from "react"

// Componente simple de gráfico de barras usando Canvas
export default function BarChart({ data, title, color = "#4299e1", maxBars = 10 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Preparar datos (tomar solo los primeros maxBars)
    const entries = Object.entries(data).slice(0, maxBars)
    const values = entries.map(([, value]) => value)
    const maxValue = Math.max(...values)

    if (maxValue === 0) return

    const barWidth = chartWidth / entries.length
    const barSpacing = barWidth * 0.1

    // Dibujar barras
    entries.forEach(([label, value], index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + index * barWidth + barSpacing / 2
      const y = canvas.height - padding - barHeight

      // Dibujar barra
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth - barSpacing, barHeight)

      // Dibujar valor encima de la barra
      ctx.fillStyle = "#2d3748"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x + (barWidth - barSpacing) / 2, y - 5)

      // Dibujar etiqueta (rotada si es muy larga)
      ctx.save()
      ctx.translate(x + (barWidth - barSpacing) / 2, canvas.height - padding + 15)
      if (label.length > 8) {
        ctx.rotate(-Math.PI / 4)
      }
      ctx.fillText(label.length > 15 ? label.substring(0, 12) + "..." : label, 0, 0)
      ctx.restore()
    })
  }, [data, color, maxBars])

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
      <canvas ref={canvasRef} width={500} height={300} className="bar-canvas" />
    </div>
  )
}
