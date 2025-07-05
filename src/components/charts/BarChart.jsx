"use client";

import { useEffect, useRef, useState } from "react";

// Utilidad para oscurecer colores (hover)
const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.min(255, parseInt((R * (100 + percent)) / 100));
  G = Math.min(255, parseInt((G * (100 + percent)) / 100));
  B = Math.min(255, parseInt((B * (100 + percent)) / 100));

  return (
    "#" +
    R.toString(16).padStart(2, "0") +
    G.toString(16).padStart(2, "0") +
    B.toString(16).padStart(2, "0")
  );
};

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
  showHover = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const barDataRef = useRef([]);
  const [hoveredLabel, setHoveredLabel] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

  const defaultColors = ["#4299e1", "#48bb78", "#ed8936"];

  // Redimensionar canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: 300 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Dibujo principal
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (
      !ctx ||
      !data ||
      Object.keys(data).length === 0 ||
      dimensions.width === 0
    )
      return;

    const padding = 40;
    const chartWidth = dimensions.width - padding * 2;
    const chartHeight = dimensions.height - padding * 2;
    const entries = Object.entries(data).slice(0, maxBars);
    const values = entries.map(([, value]) => value);
    const maxValue = Math.max(...values);

    if (maxValue === 0) return;

    const barWidth = chartWidth / entries.length;
    const barSpacing = barWidth * 0.1;
    const barColors = colors.length > 0 ? colors : defaultColors;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    barDataRef.current = [];

    entries.forEach(([label, value], i) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + i * barWidth + barSpacing / 2;
      const y = canvas.height - padding - barHeight;
      const width = barWidth - barSpacing;
      const color = barColors[i % barColors.length];

      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, barHeight);

      ctx.fillStyle = "#2d3748";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        typeof value === "number"
          ? useIntegers
            ? Math.round(value).toString()
            : value.toFixed(2)
          : value.toString(),
        x + width / 2,
        y - 5
      );

      barDataRef.current.push({ x, y, width, height: barHeight, label, color });
    });

    if (showBaseLabels) {
      ctx.fillStyle = "#4a5568";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      entries.forEach((_, i) => {
        const x = padding + i * barWidth + barSpacing / 2;
        const displayLabel = baseLabels[i] || (i + 1).toString();
        ctx.fillText(
          displayLabel,
          x + (barWidth - barSpacing) / 2,
          canvas.height - padding + 15
        );
      });
    }

    // Hover activado solo si showHover es true
    const handleMouseMove = (e) => {
      if (!showHover) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hovered = barDataRef.current.find(
        (bar) =>
          mouseX >= bar.x &&
          mouseX <= bar.x + bar.width &&
          mouseY >= bar.y &&
          mouseY <= bar.y + bar.height
      );

      if (hovered) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        entries.forEach(([label, value], i) => {
          const bar = barDataRef.current[i];
          ctx.fillStyle =
            bar === hovered ? shadeColor(bar.color, 20) : bar.color;
          ctx.fillRect(bar.x, bar.y, bar.width, bar.height);

          ctx.fillStyle = "#2d3748";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            typeof value === "number"
              ? useIntegers
                ? Math.round(value).toString()
                : value.toFixed(2)
              : value.toString(),
            bar.x + bar.width / 2,
            bar.y - 5
          );
        });

        if (showBaseLabels) {
          ctx.fillStyle = "#4a5568";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          entries.forEach((_, i) => {
            const x = padding + i * barWidth + barSpacing / 2;
            const displayLabel = baseLabels[i] || (i + 1).toString();
            ctx.fillText(
              displayLabel,
              x + (barWidth - barSpacing) / 2,
              canvas.height - padding + 15
            );
          });
        }

        if (showNameBelow) setHoveredLabel(hovered.label);
      } else {
        setHoveredLabel("");
      }
    };

    if (showHover) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", () => setHoveredLabel(""));
    }

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", () => setHoveredLabel(""));
    };
  }, [
    data,
    dimensions,
    colors,
    maxBars,
    useIntegers,
    showBaseLabels,
    baseLabels,
    showNameBelow,
    showHover,
  ]);

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h4 className="text-base text-gray-600 mb-4 text-center font-semibold">
          {title}
        </h4>
        <div className="text-center py-8 text-gray-400 italic">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h4 className="text-base text-gray-600 mb-4 text-center font-semibold">
        {title}
      </h4>
      <div className="relative w-full" ref={containerRef}>
        <canvas ref={canvasRef} height={dimensions.height} className="w-full" />
        {showNameBelow && (
          <div
            className={`text-center mt-2 min-h-[2rem] p-2 bg-gray-100 rounded text-sm font-medium text-gray-700 transition-opacity duration-300 ease-in-out ${
              hoveredLabel ? "opacity-100" : "opacity-0"
            }`}
          >
            {hoveredLabel}
          </div>
        )}
      </div>
    </div>
  );
}
