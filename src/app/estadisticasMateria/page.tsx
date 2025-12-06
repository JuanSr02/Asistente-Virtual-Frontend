"use client";

import { useState } from "react";
import { useEstadisticasMateria } from "@/hooks/domain/useEstadisticasMateria";
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { useQuery } from "@tanstack/react-query";
import planesEstudioService from "@/services/planesEstudioService";
import { sharedKeys } from "@/lib/query-keys";

// Componentes UI
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import { MetricCard } from "@/components/shared/MetricCard";
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertTriangle,
  BarChartBig,
  Info,
  Users,
  CheckCircle,
  XCircle,
  Target,
  Calendar,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PERIODOS_ESTADISTICAS = [
  { value: "ULTIMO_ANIO", label: "Último año" },
  { value: "ULTIMOS_2_ANIOS", label: "Últimos 2 años" },
  { value: "ULTIMOS_5_ANIOS", label: "Últimos 5 años" },
  { value: "TODOS_LOS_TIEMPOS", label: "Todos los tiempos" },
];

export default function EstadisticasMateria() {
  const [plan, setPlan] = useState<string>("");
  const [materia, setMateria] = useState<string>("");
  const [periodo, setPeriodo] = useState("TODOS_LOS_TIEMPOS");

  // 1. Obtener Planes (Cacheado)
  const { planes, isLoadingPlanes } = useHistoriaAcademica(0);

  // 2. Obtener Materias (Cuando cambia el plan)
  const { data: materias, isLoading: isLoadingMaterias } = useQuery({
    queryKey: sharedKeys.materiasPorPlan(plan),
    queryFn: () => planesEstudioService.obtenerMateriasPorPlan(plan),
    enabled: !!plan,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  // 3. Obtener Estadísticas (Cuando hay materia)
  const { estadisticas, isLoading, isError } = useEstadisticasMateria(
    materia,
    periodo
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in pb-20">
      {/* Header y Filtros */}
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold text-foreground">
          Estadísticas por Materia
        </h3>

        <div className="bg-muted/50 rounded-xl p-4 sm:p-6 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Selector Plan */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan de Estudio</label>
              <Select
                value={plan}
                onValueChange={(val) => {
                  setPlan(val);
                  setMateria(""); // Reset materia al cambiar plan
                }}
                disabled={isLoadingPlanes}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {planes.map((p: any) => (
                    <SelectItem key={p.codigo} value={p.codigo}>
                      {p.propuesta} ({p.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector Materia */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Materia</label>
              <Select
                value={materia}
                onValueChange={setMateria}
                disabled={!plan || isLoadingMaterias}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingMaterias
                        ? "Cargando..."
                        : !plan
                          ? "Selecciona un plan primero"
                          : "Selecciona una materia"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {materias?.map((m: any) => (
                    <SelectItem key={m.codigo} value={m.codigo}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector Periodo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select
                value={periodo}
                onValueChange={setPeriodo}
                disabled={!materia}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODOS_ESTADISTICAS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Estados de Carga y Error */}
      {isError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Error al cargar estadísticas</p>
            <p className="text-sm">
              No se encontraron datos para esta selección.
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton type="pie" />
        </div>
      )}

      {/* Resultados */}
      {estadisticas && !isLoading && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in">
          {/* Header Materia */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl text-center shadow-lg">
            <h4 className="text-2xl font-bold mb-1">
              {estadisticas.nombreMateria}
            </h4>
          </div>

          {estadisticas.totalRendidos === 0 ? (
            <div className="text-center py-12 px-4 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
              <BarChartBig className="mx-auto text-6xl mb-4 text-muted-foreground/30" />
              <h4 className="text-xl font-semibold mb-2">
                Sin datos suficientes
              </h4>
              <p className="text-muted-foreground max-w-md mx-auto">
                Esta materia aún no tiene registros de exámenes en el período
                seleccionado.
              </p>
            </div>
          ) : (
            <>
              {/* Métricas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Rendidos"
                  value={estadisticas.totalRendidos}
                  icon={Users}
                  color="blue"
                />
                <MetricCard
                  title="Aprobados"
                  value={estadisticas.aprobados}
                  icon={CheckCircle}
                  color="green"
                />
                <MetricCard
                  title="Reprobados"
                  value={estadisticas.reprobados}
                  icon={XCircle}
                  color="red"
                />
                <MetricCard
                  title="% Aprobación"
                  value={`${estadisticas.porcentajeAprobados.toFixed(1)}%`}
                  icon={BarChartBig}
                  color="orange"
                />
                <MetricCard
                  title="Promedio Notas"
                  value={estadisticas.promedioNotas.toFixed(2)}
                  icon={Target}
                  color="teal"
                />
                <MetricCard
                  title="Promedio Días"
                  value={estadisticas.promedioDiasEstudio.toFixed(1)}
                  icon={Calendar}
                  color="gray"
                />
                <MetricCard
                  title="Promedio Horas"
                  value={estadisticas.promedioHorasDiarias.toFixed(1)}
                  icon={Clock}
                  color="gray"
                />
                <MetricCard
                  title="Promedio Dificultad (1-10)"
                  value={estadisticas.promedioDificultad.toFixed(1)}
                  icon={Star}
                  color="purple"
                />
              </div>

              {/* Gráficos de Torta */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PieChart
                  data={estadisticas.distribucionModalidad}
                  title="Distribución por Modalidad"
                  colors={["#3b82f6", "#10b981", "#f59e0b"]}
                />
                <PieChart
                  data={estadisticas.distribucionRecursos}
                  title="Recursos Utilizados"
                />
              </div>

              {/* Gráfico de Dificultad */}
              <BarChart
                data={estadisticas.distribucionDificultad}
                title="Distribución de Dificultad Percibida"
                colors={["#8b5cf6"]} // Violeta
              />
            </>
          )}
        </div>
      )}

      {/* Estado Vacío Inicial */}
      {!materia && (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
          <Info className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>Selecciona un plan y una materia para ver el análisis.</p>
        </div>
      )}
    </div>
  );
}
