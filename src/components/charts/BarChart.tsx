"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "./ChartTooltip";
import { useTheme } from "next-themes";
import { BarChart3 } from "lucide-react";

interface BarChartProps {
  data: Record<string, number>;
  title?: string;
  colors?: string[];
  height?: number;
}

export default function BarChart({
  data,
  title,
  colors = ["#3b82f6"],
  height = 350,
}: BarChartProps) {
  const { theme } = useTheme();

  // Transformar y filtrar ceros
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .slice(0, 15); // Top 15

  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
  const activeColors = colors.length > 0 ? colors : defaultColors;

  if (chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center min-h-[300px] p-6 text-muted-foreground">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
        <p>No hay datos significativos</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-[300px] p-4">
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
            />
            {/* EJE X SIN ETIQUETAS VISIBLES */}
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={false} // <--- Ocultamos nombres
              height={10} // Reducimos espacio
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={activeColors[index % activeColors.length]}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
