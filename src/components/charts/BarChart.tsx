"use client";

import { useState, useEffect, useRef, memo, type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTheme } from "next-themes"; // <-- 1. IMPORTAR EL HOOK

// --- HELPER SIN CAMBIOS ---
const shadeColor = (color: string, percent: number): string => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.min(255, Math.floor((R * (100 + percent)) / 100));
  G = Math.min(255, Math.floor((G * (100 + percent)) / 100));
  B = Math.min(255, Math.floor((B * (100 + percent)) / 100));
  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`;
};

// --- TIPADO DE PROPS (SIN CAMBIOS) ---
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
  const barDataRef = useRef<any[]>([]);
  const [hoveredLabel, setHoveredLabel] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

  const { theme } = useTheme(); // <-- 2. OBTENER EL TEMA ACTUAL

  const defaultColors = ["#4299e1", "#48bb78", "#ed8936"];

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

    // Tu lógica para obtener los colores del tema ya es correcta
    const computedStyles = getComputedStyle(document.documentElement);
    const foregroundColor = `hsl(${computedStyles.getPropertyValue("--foreground")})`;
    const mutedColor = `hsl(${computedStyles.getPropertyValue("--muted-foreground")})`;
    const fontFamily = computedStyles.getPropertyValue("font-family");

    const isSmall = dimensions.width < 480;
    const padding = isSmall ? 25 : 40;
    const topLabelFontSize = isSmall ? 10 : 12;
    const baseLabelFontSize = isSmall ? 11 : 14;

    const chartWidth = dimensions.width - padding * 2;
    const chartHeight = dimensions.height - padding * 2;
    const entries = Object.entries(data).slice(0, maxBars);
    const values = entries.map(([, value]) => value);
    const maxValue = Math.max(...values);
    if (maxValue === 0) return;

    const barWidth = chartWidth / entries.length;
    const barSpacing = barWidth * 0.1;

    const barColors = colors.length > 0 ? colors : defaultColors;
    if (barColors.length === 0) {
      console.error(
        "BarChart: No colors provided and no default colors available."
      );
      return;
    }

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

      const color = barColors[i % barColors.length];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, barHeight);
      }

      ctx.fillStyle = "#718096";
      ctx.font = `${topLabelFontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      const text =
        typeof value === "number"
          ? useIntegers
            ? Math.round(value).toString()
            : value.toFixed(2)
          : value;
      ctx.fillText(text, x + width / 2, y - 5);

      // 👇 REEMPLAZÁ ESTO:
      barDataRef.current.push({ x, y, width, barHeight, label, color });

      // 👇 POR ESTO:
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
          dimensions.height - padding + baseLabelFontSize * 1.2
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
          mouseY <= bar.y + bar.barHeight // Cambia bar.height por bar.barHeight
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
        // Pequeña corrección aquí para evitar errores si el canvas ya no existe
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
    theme, // <-- 3. AÑADIR `theme` A LAS DEPENDENCIAS
  ]);

  // El resto del JSX del componente no necesita cambios
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
            <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <div className="relative w-full" ref={containerRef}>
            <canvas ref={canvasRef} />
            {showNameBelow && (
              <div
                className={`text-center mt-2 min-h-[1.75rem] p-2 bg-muted rounded text-sm font-medium text-muted-foreground transition-opacity ${hoveredLabel ? "opacity-100" : "opacity-0"}`}
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
