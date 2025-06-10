"use client"

import { useEffect, useRef, useState } from "react"

// Componente mejorado de gráfico de barras usando Canvas
export default function BarChart({
  data,
  title,
  colors = [],
  maxBars = 15,
  useIntegers = false,
  showTooltip = false,
  showNameBelow = false,
  showBaseLabels = false,
  baseLabels = [],
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 })
  const [hoveredLabel, setHoveredLabel] = useState("")

  // Colores por defecto para múltiples barras
  const defaultColors = ["#4299e1", "#48bb78", "#ed8936"]

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

    // Usar colores múltiples si se proporcionan, sino usar el color por defecto
    const barColors = colors.length > 0 ? colors : defaultColors

    // Dibujar barras
    entries.forEach(([label, value], index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + index * barWidth + barSpacing / 2
      const y = canvas.height - padding - barHeight

      // Seleccionar color para esta barra
      const barColor = barColors[index % barColors.length]

      // Dibujar barra con efecto hover
      ctx.fillStyle = hoveredBar === index ? shadeColor(barColor, 20) : barColor
      ctx.fillRect(x, y, barWidth - barSpacing, barHeight)

      // Dibujar valor encima de la barra
      ctx.fillStyle = "#2d3748"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(
        typeof value === "number" ? (useIntegers ? Math.round(value).toString() : value.toFixed(2)) : value.toString(),
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
        value: typeof value === "number" ? (useIntegers ? Math.round(value) : value.toFixed(2)) : value,
      })
    })

    // Dibujar etiquetas en la base si está habilitado
    if (showBaseLabels) {
      ctx.fillStyle = "#4a5568"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"

      entries.forEach(([label, value], index) => {
        const x = padding + index * barWidth + barSpacing / 2
        const baseY = canvas.height - padding + 15 // Un poco debajo de la línea base

        // Usar etiqueta personalizada si está disponible, sino usar el índice + 1
        const displayLabel = baseLabels.length > index ? baseLabels[index] : (index + 1).toString()

        ctx.fillText(displayLabel, x + (barWidth - barSpacing) / 2, baseY)
      })
    }

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
          setHoveredBar(i)
          if (showNameBelow) {
            setHoveredLabel(barData.label)
          }
          found = true
          break
        }
      }

      if (!found) {
        setHoveredBar(null)
        setHoveredLabel("")
      }
    }

    const handleMouseLeave = () => {
      setHoveredBar(null)
      setHoveredLabel("")
    }

    // Agregar event listeners
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [data, colors, maxBars, hoveredBar, dimensions, useIntegers, showNameBelow, showBaseLabels, baseLabels])

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
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h4 className="text-base text-gray-600 mb-4 text-center font-semibold">{title}</h4>
        <div className="text-center py-8 text-gray-400 italic">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h4 className="text-base text-gray-600 mb-4 text-center font-semibold">{title}</h4>
      <div className="relative w-full" ref={containerRef}>
        <canvas ref={canvasRef} height={dimensions.height} className="w-full" />
        {showNameBelow && hoveredLabel && (
          <div className="text-center mt-2 p-2 bg-gray-100 rounded text-sm font-medium text-gray-700">
            {hoveredLabel}
          </div>
        )}
      </div>
    </div>
  )
}
