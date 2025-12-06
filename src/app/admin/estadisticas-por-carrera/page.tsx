"use client";

import { useState } from "react";
import { useEstadisticasCarrera } from "@/hooks/domain/useEstadisticasCarrera";
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { MetricCard } from "@/components/shared/MetricCard";
import BarChart from "@/components/charts/BarChart";
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Book, FileText, Target, BarChart3 } from "lucide-react";

const PERIODOS = [
  { value: "ULTIMO_ANIO", label: "Último año" },
  { value: "ULTIMOS_2_ANIOS", label: "Últimos 2 años" },
  { value: "ULTIMOS_5_ANIOS", label: "Últimos 5 años" },
  { value: "TODOS_LOS_TIEMPOS", label: "Todos los tiempos" },
];

export default function EstadisticasPorCarrera() {
  const [plan, setPlan] = useState<string>("");
  const [periodo, setPeriodo] = useState("ULTIMO_ANIO");

  const { planes, isLoadingPlanes } = useHistoriaAcademica(0);
  const { estadisticas, isLoading } = useEstadisticasCarrera(plan, periodo);

  const mejoresPromedios = estadisticas
    ? Object.entries(estadisticas.promedioNotasPorMateria)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
    : {};

  const peoresPromedios = estadisticas
    ? Object.entries(estadisticas.promedioNotasPorMateria)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
    : {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Estadísticas por Carrera</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={plan}
            onValueChange={setPlan}
            disabled={isLoadingPlanes}
          >
            <SelectTrigger className="w-full sm:w-[350px]">
              <SelectValue placeholder="Seleccionar carrera" />
            </SelectTrigger>
            <SelectContent>
              {planes.map((p: any) => (
                <SelectItem key={p.codigo} value={p.codigo}>
                  {p.propuesta} ({p.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODOS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!plan ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
          <Book className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>Selecciona una carrera para ver sus métricas.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton type="bar" />
        </div>
      ) : estadisticas ? (
        <div className="space-y-10">
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
            {/* AGREGADO */}
            <MetricCard
              title="% Aprobación"
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

          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-10 lg:gap-8">
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
                {estadisticas.materiaMasRendida.porcentaje.toFixed(1)}%
                Aprobación
              </div>
            </div>

            <div className="lg:col-span-3">
              <BarChart
                data={estadisticas.distribucionExamenesPorMateria}
                title="Top Materias más Rendidas"
                colors={["#3b82f6"]}
              />
            </div>
          </div>

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
      ) : null}
    </div>
  );
}

// Reutilizamos el mismo sub-componente
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
