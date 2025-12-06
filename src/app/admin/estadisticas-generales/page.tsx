"use client";

import { useEstadisticasGenerales } from "@/hooks/domain/useEstadisticasGenerales";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import { MetricCard } from "@/components/shared/MetricCard";
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton";
import {
  AlertTriangle,
  Users,
  Book,
  FileText,
  BarChart3,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EstadisticasGenerales() {
  const { estadisticas, isLoading, isError, refetch } =
    useEstadisticasGenerales();

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <ChartSkeleton type="pie" />
          <ChartSkeleton type="bar" />
        </div>
      </div>
    );
  }

  if (isError || !estadisticas) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Error al cargar estadísticas</h3>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  // Datos para gráficos de promedio
  const mejoresPromedios = Object.entries(estadisticas.promedioNotasPorMateria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  const peoresPromedios = Object.entries(estadisticas.promedioNotasPorMateria)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 10)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-10 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Vista General del Sistema</h3>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Estudiantes"
          value={estadisticas.estudiantesActivos}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Materias"
          value={estadisticas.totalMaterias}
          icon={Book}
          color="gray"
        />
        <MetricCard
          title="Exámenes"
          value={estadisticas.totalExamenesRendidos}
          icon={FileText}
          color="green"
        />
        <MetricCard
          title="% Aprobados"
          value={`${estadisticas.porcentajeAprobadosGeneral.toFixed(1)}%`}
          icon={BarChart3}
          color="orange"
        />
        <MetricCard
          title="Promedio Gral."
          value={estadisticas.promedioGeneral.toFixed(2)}
          icon={Target}
          color="teal"
        />
      </div>

      {/* FIX RESPONSIVE: Pie + Card Destacada
         Usamos flex-col-reverse en mobile para que la Card quede arriba si se quiere,
         o flex-col normal. gap-10 da aire suficiente.
      */}
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-10 lg:gap-8">
        <div className="lg:col-span-3">
          <PieChart
            data={estadisticas.distribucionEstudiantesPorCarrera}
            title="Distribución de Estudiantes por Carrera"
          />
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-8 shadow-lg text-center min-h-[300px]">
          <h4 className="text-lg font-medium opacity-90 mb-2">
            Materia Más Rendida
          </h4>
          <p className="text-2xl font-bold break-words px-2">
            {estadisticas.materiaMasRendida.nombre}
          </p>
          <div className="my-6">
            <span className="text-5xl font-extrabold block">
              {estadisticas.cantidadMateriaMasRendida}
            </span>
            <span className="text-sm opacity-80 uppercase tracking-widest">
              Exámenes
            </span>
          </div>
          <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-medium">
            {estadisticas.materiaMasRendida.porcentaje.toFixed(1)}% Aprobación
          </div>
        </div>
      </div>

      <BarChart
        data={estadisticas.distribucionExamenesPorMateria}
        title="Top Materias más Rendidas"
        colors={["#3b82f6"]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RankingCard
          title="🏆 Top 5 Mayor Aprobación"
          data={estadisticas.top5Aprobadas}
          color="green"
        />
        <RankingCard
          title="📉 Top 5 Menor Aprobación"
          data={estadisticas.top5Reprobadas}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChart
          data={mejoresPromedios}
          title="Top 10 - Promedios más Altos"
          colors={["#10b981"]}
        />
        <BarChart
          data={peoresPromedios}
          title="Top 10 - Promedios más Bajos"
          colors={["#ef4444"]}
        />
      </div>
    </div>
  );
}

function RankingCard({ title, data, color }: any) {
  const isGreen = color === "green";
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm h-full">
      <h4 className="text-lg font-semibold mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((item: any, i: number) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
              isGreen
                ? "bg-green-50 border-green-500 dark:bg-green-950/20"
                : "bg-red-50 border-red-500 dark:bg-red-950/20"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="font-bold text-muted-foreground w-6 shrink-0">
                #{i + 1}
              </span>
              <span className="font-medium text-sm truncate">
                {item.nombre}
              </span>
            </div>
            <span
              className={`font-bold shrink-0 ${isGreen ? "text-green-600" : "text-red-600"}`}
            >
              {item.porcentaje.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
