"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

interface PieChartProps {
  data: Record<string, number>;
  title: string;
  colors?: string[];
  showHover?: boolean;
}

export default function PieChart({
  data,
  title,
  colors = [],
  showHover = false,
}: PieChartProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Colores originales (para modo claro)
  const lightColors = [
    "#4299e1", // Azul
    "#48bb78", // Verde
    "#ed8936", // Naranja
    "#9f7aea", // Morado
    "#38b2ac", // Verde azulado
    "#f56565", // Rojo
    "#ecc94b", // Amarillo
    "#667eea", // Indigo
    "#f093fb", // Rosa
    "#4fd1c7", // Cian
  ];

  // Colores optimizados para modo oscuro (más brillantes/pasteles)
  const darkColors = [
    "#63b3ed",
    "#68d391",
    "#f6ad55",
    "#b794f4",
    "#4fd1c5",
    "#fc8181",
    "#f6e05e",
    "#7f9cf5",
    "#f687b3",
    "#81e6d9",
  ];

  const defaultColors = theme === "dark" ? darkColors : lightColors;
  const chartColors = colors.length > 0 ? colors : defaultColors;

  // Ajustar tamaño del canvas a su contenedor
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Limitamos el tamaño máximo para que no se haga gigante en pantallas grandes
        const size = Math.min(width, 350);
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || dimensions.width === 0)
      return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar escala para alta resolución (Retina displays)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const entries = Object.entries(data);
    const values = entries.map(([, value]) => value);
    const total = values.reduce((sum, value) => sum + value, 0);
    if (total === 0) return;

    let currentAngle = -Math.PI / 2;

    // --- CORRECCIÓN IMPORTANTE MODO OSCURO ---
    // Obtenemos el color de fondo real del contenedor para usarlo como borde
    let borderColor = "#fff";
    if (containerRef.current) {
      const style = getComputedStyle(containerRef.current);
      const bgColor = style.backgroundColor;
      if (bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        borderColor = bgColor;
      } else {
        borderColor = theme === "dark" ? "#020817" : "#ffffff";
      }
    }

    entries.forEach(([label, value], index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const isHovered = showHover && hoveredSegment === index;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius + (isHovered ? 5 : 0),
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();

      // CORRECCIÓN 1: Añadir fallback para asegurar que siempre sea string
      ctx.fillStyle = chartColors[index % chartColors.length] || "#000000";
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    if (showHover) {
      // Nota: La lógica de detección de hover se mantiene simplificada para TSX
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > radius) {
          setHoveredSegment(null);
          return;
        }

        let angle = Math.atan2(dy, dx);
        angle = angle + Math.PI / 2;
        if (angle < 0) angle += 2 * Math.PI;

        let currentCheckAngle = 0;
        let found = false;

        entries.forEach((_, index) => {
          // CORRECCIÓN 2: Usar operador ?? 0 para evitar undefined
          const value = values[index] ?? 0;
          const sliceAngle = (value / total) * 2 * Math.PI;

          if (
            !found &&
            angle >= currentCheckAngle &&
            angle < currentCheckAngle + sliceAngle
          ) {
            setHoveredSegment(index);
            found = true;
          }
          currentCheckAngle += sliceAngle;
        });

        if (!found) setHoveredSegment(null);
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", () => setHoveredSegment(null));

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", () => setHoveredSegment(null));
      };
    }
  }, [data, chartColors, hoveredSegment, dimensions, showHover, theme]);

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-center">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <PieChartIcon className="w-12 h-12 text-muted-foreground/20" />
          <p className="text-sm italic">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg text-center font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col items-center" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className="mx-auto cursor-pointer"
            style={{ maxWidth: "100%", height: "auto" }}
          />

          <div className="flex flex-wrap justify-center gap-3 mt-6 w-full">
            {Object.entries(data).map(([label, value], index) => (
              <div
                key={label}
                className={`
                  flex items-center gap-2 px-2 py-1 rounded-md text-xs sm:text-sm transition-colors
                  ${showHover && hoveredSegment === index ? "bg-accent text-accent-foreground font-medium ring-1 ring-border" : "text-muted-foreground"}
                `}
                onMouseEnter={() => showHover && setHoveredSegment(index)}
                onMouseLeave={() => showHover && setHoveredSegment(null)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    // CORRECCIÓN 3: Añadir fallback también aquí por seguridad
                    backgroundColor:
                      chartColors[index % chartColors.length] || "#000",
                  }}
                />
                <span
                  className={
                    showHover && hoveredSegment === index
                      ? "text-foreground"
                      : ""
                  }
                >
                  {label} <span className="opacity-70">({value})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
