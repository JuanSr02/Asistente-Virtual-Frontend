"use client"

import { useEffect, useRef, useState } from "react"

// Componente mejorado de gráfico de torta usando Canvas
export default function PieChart({ data, title, colors = [] }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 })
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

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

  // Función para ajustar el tamaño del canvas al contenedor
  const updateDimensions = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
      // Para un gráfico de torta, queremos mantener una relación de aspecto 1:1
      const size = Math.min(width, 350) // Limitar altura máxima
      setDimensions({ width: size, height: size })
    }
  }

  // Efecto para manejar el redimensionamiento
  useEffect(() => {
    updateDimensions()

    // Agregar event listener para redimensionar
    window.addEventListener("resize", updateDimensions)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Establecer el tamaño del canvas
    canvas.width = dimensions.width
    canvas.height = dimensions.height

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
    const segments = []

    entries.forEach(([label, value], index) => {
      const sliceAngle = (value / total) * 2 * Math.PI
      const isHovered = hoveredSegment === index

      // Dibujar segmento
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius + (isHovered ? 5 : 0), currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = chartColors[index % chartColors.length]
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Guardar información del segmento para detección de hover
      const midAngle = currentAngle + sliceAngle / 2
      segments.push({
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle,
        label,
        value,
        percentage: ((value / total) * 100).toFixed(1),
      })

      currentAngle += sliceAngle
    })

    // Función para verificar si un punto está dentro de un segmento del círculo
    const isPointInSegment = (x, y, centerX, centerY, radius, startAngle, endAngle) => {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > radius) return false

      let angle = Math.atan2(dy, dx)
      if (angle < 0) angle += 2 * Math.PI

      // Ajustar ángulos para que coincidan con nuestro sistema
      startAngle += Math.PI / 2
      if (startAngle < 0) startAngle += 2 * Math.PI

      endAngle += Math.PI / 2
      if (endAngle < 0) endAngle += 2 * Math.PI

      // Manejar el caso donde el segmento cruza el eje x positivo
      if (startAngle > endAngle) {
        return angle >= startAngle || angle <= endAngle
      }

      return angle >= startAngle && angle <= endAngle
    }

    // Función para manejar el hover
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let found = false

      segments.forEach((segment, index) => {
        if (isPointInSegment(x, y, centerX, centerY, radius, segment.startAngle, segment.endAngle)) {
          setTooltip({
            visible: true,
            text: `${segment.label}: ${segment.value} (${segment.percentage}%)`,
            x: e.clientX,
            y: e.clientY,
          })
          setHoveredSegment(index)
          found = true
        }
      })

      if (!found) {
        setTooltip({ visible: false, text: "", x: 0, y: 0 })
        setHoveredSegment(null)
      }
    }

    const handleMouseLeave = () => {
      setTooltip({ visible: false, text: "", x: 0, y: 0 })
      setHoveredSegment(null)
    }

    // Agregar event listeners
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [data, chartColors, hoveredSegment, dimensions])

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-container">
        <h4 className="chart-title">{title}</h4>
        <div className="no-data">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h4 className="chart-title">{title}</h4>
      <div className="pie-chart-wrapper" ref={containerRef}>
        <canvas ref={canvasRef} className="pie-canvas" />
        {tooltip.visible && (
          <div
            className="chart-tooltip"
            style={{
              left: `${tooltip.x + 10}px`,
              top: `${tooltip.y - 30}px`,
            }}
          >
            {tooltip.text}
          </div>
        )}
        <div className="chart-legend">
          {Object.entries(data).map(([label, value], index) => (
            <div
              key={label}
              className="legend-item"
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
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
