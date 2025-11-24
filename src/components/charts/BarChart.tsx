"use client";

import { useState, useEffect, useRef, memo, type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTheme } from "next-themes";

// --- INTERFACES ---
interface BarChartProps {
  data: Record<string, number>;
  title: string;
  colors?: string[];
  maxBars?: number;
  useIntegers?: boolean;
  showNameBelow?: boolean;
  showBaseLabels?: boolean;
  baseLabels?: string[];
  showHover?: boolean;
}

interface BarData {
  x: number;
  y: number;
  width: number;
  barHeight: number;
  label: string;
  value: number;
  color: string;
}

const BarChart: FC<BarChartProps> = memo(function BarChart({
  data,
  title,
  colors = [],
  maxBars = 15,
  useIntegers = false,
  showNameBelow = false,
  showBaseLabels = false,
  baseLabels = [],
  showHover = true,
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const barDataRef = useRef<BarData[]>([]);
  const [hoveredLabel, setHoveredLabel] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

  const { theme } = useTheme();

  // Colores para modo claro
  const lightColors = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#ef4444", // red-500
    "#eab308", // yellow-500
    "#6366f1", // indigo-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
  ];

  // Colores para modo oscuro (más pasteles/brillantes para resaltar sobre fondo negro)
  const darkColors = [
    "#60a5fa", // blue-400
    "#34d399", // emerald-400
    "#fbbf24", // amber-400
    "#a78bfa", // violet-400
    "#22d3ee", // cyan-400
    "#f87171", // red-400
    "#facc15", // yellow-400
    "#818cf8", // indigo-400
    "#f472b6", // pink-400
    "#2dd4bf", // teal-400
  ];

  const defaultColors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setDimensions({ width, height: width < 480 ? 250 : 300 });
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

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

    // Obtenemos estilos computados para usar las variables CSS del tema
    const computedStyles = getComputedStyle(document.documentElement);
    // Asumiendo que --foreground devuelve valores tipo "222.2 84% 4.9%" o similar
    const foregroundColor = `hsl(${computedStyles.getPropertyValue("--foreground")})`;
    const mutedColor = `hsl(${computedStyles.getPropertyValue("--muted-foreground")})`;
    const fontFamily = computedStyles.getPropertyValue("font-family");

    const isSmall = dimensions.width < 480;
    const padding = isSmall ? 25 : 40;
    const topLabelFontSize = isSmall ? 11 : 13; // Un poco más grande
    const baseLabelFontSize = isSmall ? 11 : 14;

    const chartWidth = dimensions.width - padding * 2;
    const chartHeight = dimensions.height - padding * 2;
    const entries = Object.entries(data).slice(0, maxBars);
    const values = entries.map(([, value]) => value);
    const maxValue = Math.max(...values);

    if (maxValue === 0) {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      return;
    }

    const barWidth = chartWidth / entries.length;
    const barSpacing = barWidth * 0.15; // Un poco más de espacio

    const barColors = colors.length > 0 ? colors : defaultColors;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    barDataRef.current = [];

    entries.forEach(([label, value], i) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + i * barWidth + barSpacing / 2;
      const y = dimensions.height - padding - barHeight;
      const width = barWidth - barSpacing;

      // 1. DIBUJAR BARRA
      const color = barColors[i % barColors.length] || "";
      if (color) {
        ctx.fillStyle = color;
        // Pequeño border radius simulado (opcional)
        ctx.fillRect(x, y, width, barHeight);
      }

      // 2. DIBUJAR VALOR ENCIMA (Aquí estaba el cambio solicitado)
      // Usamos foregroundColor para que sea Blanco en Dark Mode y Negro en Light Mode.
      // Si falla la variable CSS, usamos un fallback manual según el tema.
      ctx.fillStyle = foregroundColor.includes("undefined")
        ? theme === "dark"
          ? "#ffffff"
          : "#000000"
        : foregroundColor;

      ctx.font = `bold ${topLabelFontSize}px ${fontFamily}`; // Agregué 'bold' para más peso
      ctx.textAlign = "center";

      const text =
        typeof value === "number"
          ? useIntegers
            ? Math.round(value).toString()
            : value.toFixed(2)
          : value;

      // Dibujar texto un poco más arriba (y - 8)
      ctx.fillText(text, x + width / 2, y - 8);

      // Guardar datos para hover
      barDataRef.current.push({
        x,
        y,
        width,
        barHeight,
        label: String(label),
        value,
        color,
      });
    });

    // 3. ETIQUETAS INFERIORES (EJE X)
    if (showBaseLabels) {
      ctx.fillStyle = mutedColor;
      ctx.font = `${baseLabelFontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      entries.forEach((_, i) => {
        const x = padding + i * barWidth + barSpacing / 2;
        const displayLabel = baseLabels[i] || (i + 1).toString();
        ctx.fillText(
          displayLabel,
          x + (barWidth - barSpacing) / 2,
          dimensions.height - padding + baseLabelFontSize * 1.5
        );
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / dpr / rect.width;
      const scaleY = canvas.height / dpr / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const hoveredBar = barDataRef.current.find(
        (bar) =>
          mouseX >= bar.x &&
          mouseX <= bar.x + bar.width &&
          mouseY >= bar.y &&
          mouseY <= bar.y + bar.barHeight
      );

      canvas.style.cursor = hoveredBar ? "pointer" : "default";
      setHoveredLabel(hoveredBar ? hoveredBar.label : "");
    };

    if (showHover) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", () => {
        if (!canvas) return;
        canvas.style.cursor = "default";
        setHoveredLabel("");
      });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        // Clean up seguro
        canvas.removeEventListener("mouseleave", () => {});
      }
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
    theme, // Importante: re-renderizar si cambia el tema
    defaultColors,
  ]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-center font-semibold text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data || Object.keys(data).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-4">
            <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <div className="relative w-full" ref={containerRef}>
            <canvas ref={canvasRef} />
            {showNameBelow && (
              <div
                className={`text-center mt-2 min-h-[1.75rem] p-2 bg-muted rounded text-sm font-medium text-foreground transition-opacity ${
                  hoveredLabel ? "opacity-100" : "opacity-0"
                }`}
              >
                {hoveredLabel || "Pasa el cursor sobre una barra"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default BarChart;
