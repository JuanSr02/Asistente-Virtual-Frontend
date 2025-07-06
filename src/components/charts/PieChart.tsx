"use client";

import { useState, useEffect, useRef, memo, type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

// --- TIPADO DE PROPS ---
interface PieChartProps {
  data: Record<string, number>;
  title: string;
  colors?: string[];
  showHover?: boolean;
}

const PieChart: FC<PieChartProps> = memo(function PieChart({
  data,
  title,
  colors = [],
  showHover = true, // Activado por defecto para una mejor UX
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const defaultColors = [
    "#4299e1",
    "#48bb78",
    "#ed8936",
    "#9f7aea",
    "#38b2ac",
    "#f56565",
  ];
  const chartColors = colors.length > 0 ? colors : defaultColors;

  // --- RESPONSIVIDAD CON RESIZEOBSERVER ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        // Hacemos el gráfico cuadrado, con un tamaño máximo
        const size = Math.min(width, 300);
        setDimensions({ width: size, height: size });
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // --- DIBUJO PRINCIPAL (ADAPTADO A TEMAS Y RESPONSIVIDAD) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (
      !ctx ||
      !data ||
      Object.keys(data).length === 0 ||
      dimensions.width === 0
    )
      return;

    // Obtener color del fondo de la tarjeta para el stroke y crear el efecto de separación
    const computedStyles = getComputedStyle(document.documentElement);
    const cardBackgroundColor = `hsl(${computedStyles.getPropertyValue("--card")})`;

    // Preparar canvas con alta resolución (Retina)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    if (total === 0) return;

    let currentAngle = -Math.PI / 2; // Empezar desde arriba

    // Dibujar segmentos
    entries.forEach(([, value], index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const isHovered = showHover && hoveredSegment === index;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      // El segmento se "expande" si está en hover
      ctx.arc(
        centerX,
        centerY,
        radius + (isHovered ? 5 : 0),
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();

      const color = chartColors[index % chartColors.length];
      if (color) ctx.fillStyle = color;
      ctx.fill();

      // Añadir borde para separar los segmentos
      ctx.strokeStyle = cardBackgroundColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Lógica de hover
    // ... dentro del useEffect de dibujo
    const handleMouseMove = (e: MouseEvent) => {
      if (!showHover) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (dimensions.width / rect.width);
      const y = (e.clientY - rect.top) * (dimensions.height / rect.height);

      let foundSegment = -1;
      let angle = -Math.PI / 2;

      // Usamos un bucle `for...of` con `entries()` que es más seguro y moderno
      for (const [index, [, value]] of entries.entries()) {
        const sliceAngle = (value / total) * 2 * Math.PI;

        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius + 5) {
          let pointAngle = Math.atan2(dy, dx);
          // Normalizar el ángulo para que esté en el mismo rango que el ángulo del segmento
          if (pointAngle < angle) pointAngle += 2 * Math.PI;

          if (pointAngle >= angle && pointAngle <= angle + sliceAngle) {
            foundSegment = index;
            break; // Salimos del bucle una vez que encontramos el segmento
          }
        }
        angle += sliceAngle;
      }

      canvas.style.cursor = foundSegment !== -1 ? "pointer" : "default";
      setHoveredSegment(foundSegment !== -1 ? foundSegment : null);
    };
    // ... el resto del useEffect

    if (showHover) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", () => {
        canvas.style.cursor = "default";
        setHoveredSegment(null);
      });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", () => {});
      }
    };
  }, [data, chartColors, hoveredSegment, dimensions, showHover]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-center font-semibold text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data || Object.keys(data).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-4">
            <PieChartIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
            {/* Contenedor del Canvas */}
            <div
              className="relative flex-shrink-0"
              ref={containerRef}
              style={{ width: dimensions.width, height: dimensions.height }}
            >
              <canvas ref={canvasRef} />
            </div>
            {/* Leyenda */}
            <div className="w-full lg:w-auto flex flex-col gap-2">
              {Object.entries(data).map(([label, value], index) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer ${showHover && hoveredSegment === index ? "bg-muted" : ""}`}
                  onMouseEnter={() => showHover && setHoveredSegment(index)}
                  onMouseLeave={() => showHover && setHoveredSegment(null)}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: chartColors[index % chartColors.length],
                    }}
                  />
                  <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default PieChart;
