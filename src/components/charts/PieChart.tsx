"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "./ChartTooltip";
import { PieChart as PieChartIcon } from "lucide-react";

interface PieChartProps {
  data: Record<string, number>;
  title?: string;
  colors?: string[];
  height?: number;
}

export default function PieChart({
  data,
  title,
  colors = [],
  height = 300,
}: PieChartProps) {
  // Filtrar ceros
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);

  const defaultColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];
  const activeColors = colors.length > 0 ? colors : defaultColors;

  if (chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
        {title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-center">
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex flex-col items-center gap-4">
          <PieChartIcon className="w-12 h-12 opacity-20" />
          <p className="text-sm italic">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 p-4 flex flex-col items-center">
        {/* Gráfico */}
        <div style={{ width: "100%", height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={activeColors[index % activeColors.length]}
                    strokeWidth={2}
                    stroke="hsl(var(--card))" // Borde del color del fondo
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda HTML Fluida (Evita choques) */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {chartData.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
            >
              <span
                className="block w-3 h-3 rounded-full"
                style={{
                  backgroundColor: activeColors[index % activeColors.length],
                }}
              />
              <span>
                {entry.name}{" "}
                <span className="font-semibold text-foreground">
                  ({entry.value})
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
