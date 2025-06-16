"use client"

import { useEffect, useRef, useState } from "react"

export default function PieChart({ data, title, colors = [], showHover = false }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const defaultColors = [
    "#4299e1", "#48bb78", "#ed8936", "#9f7aea", "#38b2ac",
    "#f56565", "#ecc94b", "#667eea", "#f093fb", "#4fd1c7",
  ]

  const chartColors = colors.length > 0 ? colors : defaultColors

  // Ajustar tamaño del canvas a su contenedor
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        const size = Math.min(width, 350)
        setDimensions({ width: size, height: size })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const entries = Object.entries(data)
    const values = entries.map(([, value]) => value)
    const total = values.reduce((sum, value) => sum + value, 0)
    if (total === 0) return

    let currentAngle = -Math.PI / 2

    entries.forEach(([label, value], index) => {
      const sliceAngle = (value / total) * 2 * Math.PI
      const isHovered = showHover && hoveredSegment === index

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(
        centerX,
        centerY,
        radius + (isHovered ? 5 : 0),
        currentAngle,
        currentAngle + sliceAngle
      )
      ctx.closePath()
      ctx.fillStyle = chartColors[index % chartColors.length]
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      currentAngle += sliceAngle
    })

    if (showHover) {
      const isPointInSegment = (x, y, centerX, centerY, radius, startAngle, endAngle) => {
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > radius) return false

        let angle = Math.atan2(dy, dx)
        if (angle < 0) angle += 2 * Math.PI

        startAngle += Math.PI / 2
        endAngle += Math.PI / 2
        if (startAngle < 0) startAngle += 2 * Math.PI
        if (endAngle < 0) endAngle += 2 * Math.PI

        if (startAngle > endAngle) {
          return angle >= startAngle || angle <= endAngle
        }
        return angle >= startAngle && angle <= endAngle
      }

      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        let found = false
        let angle = -Math.PI / 2

        entries.forEach(([_, value], index) => {
          const sliceAngle = (value / total) * 2 * Math.PI
          const inSegment = isPointInSegment(x, y, centerX, centerY, radius, angle, angle + sliceAngle)
          if (inSegment) {
            setHoveredSegment(index)
            found = true
          }
          angle += sliceAngle
        })

        if (!found) setHoveredSegment(null)
      }

      const handleMouseLeave = () => setHoveredSegment(null)

      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [data, chartColors, hoveredSegment, dimensions, showHover])

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
      <div className="relative" ref={containerRef}>
        <canvas ref={canvasRef} className="mx-auto" />
        <div className="flex flex-col gap-3 mt-6 w-full">
          {Object.entries(data).map(([label, value], index) => (
            <div
              key={label}
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                showHover && hoveredSegment === index ? "bg-gray-100" : ""
              }`}
              onMouseEnter={() => showHover && setHoveredSegment(index)}
              onMouseLeave={() => showHover && setHoveredSegment(null)}
            >
              <div
                className="w-3.5 h-3.5 rounded"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <span className="text-gray-700 font-medium flex-1">{label}</span>
              <span className="text-gray-600">({value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
