"use client";

import { useEffect, useState } from "react";
import planesEstudioService from "@/services/planesEstudioService";
import estadisticasService from "@/services/estadisticasService";
import { RefreshCw } from "lucide-react";
import BarChart from "@/components/charts/BarChart";
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton";
import { useEstadisticasPersistence } from "@/hooks/use-estadisticas-persistence";

// 🔹 Componente de métricas
const MetricCard = ({ title, value, color }) => {
  const borderColors = {
    blue: "border-blue-500",
    gray: "border-gray-500",
    green: "border-green-500",
    orange: "border-orange-500",
    teal: "border-teal-500",
  };
  return (
    <div
      className={`p-4 border-l-4 bg-white rounded shadow ${borderColors[color]}`}
    >
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
};

// 🔹 Componente para ítems de ranking
const RankingListItem = ({ rank, name, value, color }) => {
  const bgColor =
    color === "green"
      ? "bg-green-50 border-green-500"
      : "bg-red-50 border-red-500";
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${bgColor}`}
    >
      <div className="font-bold text-lg text-gray-500 w-8 text-center">
        #{rank}
      </div>
      <div className="flex-1 font-semibold text-sm text-gray-800 truncate">
        {name}
      </div>
      <div className="font-bold text-base text-gray-800">{value}%</div>
    </div>
  );
};

const PERIODOS = [
  { value: "ULTIMO_ANIO", label: "Último año" },
  { value: "ULTIMOS_2_ANIOS", label: "Últimos 2 años" },
  { value: "ULTIMOS_5_ANIOS", label: "Últimos 5 años" },
  { value: "TODOS_LOS_TIEMPOS", label: "Todos los tiempos" },
];

export default function EstadisticasPorCarrera() {
  const [planes, setPlanes] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [periodo, setPeriodo] = useState("ULTIMO_ANIO");
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  useEstadisticasPersistence(
    "planSeleccionado",
    planSeleccionado,
    setPlanSeleccionado
  );
  useEstadisticasPersistence("periodoSeleccionado", periodo, setPeriodo);

  useEffect(() => {
    planesEstudioService.obtenerPlanes().then(setPlanes);
  }, []);

  useEffect(() => {
    if (planSeleccionado) cargarEstadisticas();
  }, [planSeleccionado, periodo]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const data = await estadisticasService.obtenerEstadisticasPorCarrera(
        planSeleccionado,
        periodo
      );
      setEstadisticas(data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Título */}
      <h2 className="text-2xl font-bold text-gray-800">
        Estadísticas por Carrera
      </h2>

      {/* Controles */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Selector de carrera */}
        <select
          className="w-full lg:w-[40%] border border-gray-300 px-4 py-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={planSeleccionado || ""}
          onChange={(e) => setPlanSeleccionado(e.target.value)}
        >
          <option value="" disabled>
            Seleccionar carrera
          </option>
          {planes.map((plan) => (
            <option key={plan.codigo} value={plan.codigo}>
              {plan.propuesta} ({plan.codigo})
            </option>
          ))}
        </select>

        {/* Selector de periodo + botón refrescar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            className="flex-1 min-w-[150px] border border-gray-300 px-4 py-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base transition-colors"
            onClick={cargarEstadisticas}
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden xs:inline">Refrescar</span>
          </button>
        </div>
      </div>

      {loading && <MetricSkeleton />}

      {!loading && estadisticas && (
        <>
          {/* MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Estudiantes Activos"
              value={estadisticas.estudiantesActivos}
              color="blue"
            />
            <MetricCard
              title="Materias"
              value={estadisticas.totalMaterias}
              color="gray"
            />
            <MetricCard
              title="Exámenes Rendidos"
              value={estadisticas.totalExamenesRendidos}
              color="green"
            />
            <MetricCard
              title="% Aprobación"
              value={`${estadisticas.porcentajeAprobadosGeneral.toFixed(1)}%`}
              color="orange"
            />
            <MetricCard
              title="Promedio General"
              value={estadisticas.promedioGeneral.toFixed(2)}
              color="teal"
            />
          </div>

          {/* MATERIA MÁS RENDIDA */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg text-center">
            <h4 className="text-base font-semibold mb-2 opacity-90">
              Materia Más Rendida
            </h4>
            <p className="text-xl font-bold">
              {estadisticas.materiaMasRendida.nombre}
            </p>
            <div className="my-4">
              <p className="text-4xl font-extrabold">
                {estadisticas.cantidadMateriaMasRendida}
              </p>
              <p className="opacity-80">exámenes</p>
            </div>
            <div className="text-lg opacity-90">
              {estadisticas.materiaMasRendida.porcentaje.toFixed(1)}% de
              aprobación
            </div>
          </div>

          {/* GRÁFICOS */}
          <div className="grid grid-cols-1 gap-6">
            <BarChart
              data={Object.fromEntries(
                Object.entries(estadisticas.distribucionExamenesPorMateria)
                  // 1. Ordenar de mayor a menor (descendente) por la cantidad de exámenes (el valor, índice 1)
                  .sort((a, b) => b[1] - a[1])
                  // 2. Tomar los primeros 10 elementos
                  .slice(0, 10)
                  // 3. Reordenar de menor a mayor (ascendente) por la cantidad de exámenes
                  .sort((a, b) => a[1] - b[1])
              )}
              title="Top 10 - Materias más Rendidas"
              colors={["#4299e1"]}
              maxBars={10}
              useIntegers={true}
              showNameBelow={true}
            />
          </div>

          {/* RANKINGS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
              <h4 className="text-base font-semibold text-gray-700 mb-4">
                🏆 Top 5 Mayor Aprobación
              </h4>
              <div className="flex flex-col gap-3">
                {estadisticas.top5Aprobadas.map((materia, index) => (
                  <RankingListItem
                    key={materia.codigoMateria}
                    rank={index + 1}
                    name={materia.nombre}
                    value={materia.porcentaje.toFixed(1)}
                    color="green"
                  />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
              <h4 className="text-base font-semibold text-gray-700 mb-4">
                📉 Top 5 Menor Aprobación
              </h4>
              <div className="flex flex-col gap-3">
                {estadisticas.top5Reprobadas.map((materia, index) => (
                  <RankingListItem
                    key={materia.codigoMateria}
                    rank={index + 1}
                    name={materia.nombre}
                    value={materia.porcentaje.toFixed(1)}
                    color="red"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* PROMEDIOS DE NOTAS - MEJORES Y PEORES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              data={Object.fromEntries(
                Object.entries(estadisticas.promedioNotasPorMateria)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .reverse()
              )}
              title="Top 10 - Promedios mas altos por Materia"
              colors={["#38b2ac"]}
              maxBars={10}
              useIntegers={false}
              showNameBelow={true}
            />
            <BarChart
              data={Object.fromEntries(
                Object.entries(estadisticas.promedioNotasPorMateria)
                  .sort((a, b) => a[1] - b[1])
                  .slice(0, 10)
              )}
              title="Top 10 - Promedios mas bajos por Materia"
              colors={["#f56565"]}
              maxBars={10}
              useIntegers={false}
              showNameBelow={true}
            />
          </div>
        </>
      )}
    </div>
  );
}
