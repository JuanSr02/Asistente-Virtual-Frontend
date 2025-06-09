"use client"

import { useEffect, useRef, useState } from "react"

// Componente mejorado de gráfico de barras usando Canvas
export default function BarChart({ data, title, color = "#4299e1", maxBars = 5 }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 })
  const [hoveredBar, setHoveredBar] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 })

  // Función para ajustar el tamaño del canvas al contenedor
  const updateDimensions = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
      setDimensions({ width: width, height: 300 })
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
      ctx.fillStyle = hoveredBar === index ? shadeColor(color, 20) : color
      ctx.fillRect(x, y, barWidth - barSpacing, barHeight)

      // Dibujar valor encima de la barra
      ctx.fillStyle = "#2d3748"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(
        typeof value === "number" ? value.toFixed(2) : value.toString(),
        x + (barWidth - barSpacing) / 2,
        y - 5,
      )

      // Guardar coordenadas para detección de hover
      canvas.dataset[`bar${index}`] = JSON.stringify({
        x,
        y,
        width: barWidth - barSpacing,
        height: barHeight,
        label,
        value: typeof value === "number" ? value.toFixed(2) : value,
      })
    })

    // Función para manejar el hover
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let found = false

      // Verificar si el mouse está sobre alguna barra
      for (let i = 0; i < entries.length; i++) {
        const barData = JSON.parse(canvas.dataset[`bar${i}`] || "{}")
        if (x >= barData.x && x <= barData.x + barData.width && y >= barData.y && y <= barData.y + barData.height) {
          setTooltip({
            visible: true,
            text: `${barData.label}: ${barData.value}`,
            x: e.clientX,
            y: e.clientY,
          })
          setHoveredBar(i)
          found = true
          break
        }
      }

      if (!found) {
        setTooltip({ visible: false, text: "", x: 0, y: 0 })
        setHoveredBar(null)
      }
    }

    const handleMouseLeave = () => {
      setTooltip({ visible: false, text: "", x: 0, y: 0 })
      setHoveredBar(null)
    }

    // Agregar event listeners
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [data, color, maxBars, hoveredBar, dimensions])

  // Función para oscurecer o aclarar un color
  const shadeColor = (color, percent) => {
    let R = Number.parseInt(color.substring(1, 3), 16)
    let G = Number.parseInt(color.substring(3, 5), 16)
    let B = Number.parseInt(color.substring(5, 7), 16)

    R = Number.parseInt((R * (100 + percent)) / 100)
    G = Number.parseInt((G * (100 + percent)) / 100)
    B = Number.parseInt((B * (100 + percent)) / 100)

    R = R < 255 ? R : 255
    G = G < 255 ? G : 255
    B = B < 255 ? B : 255

    const RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16)
    const GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16)
    const BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16)

    return "#" + RR + GG + BB
  }

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
      <div className="chart-wrapper" ref={containerRef}>
        <canvas ref={canvasRef} height={dimensions.height} className="bar-canvas" />
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
      </div>
    </div>
  )
}
