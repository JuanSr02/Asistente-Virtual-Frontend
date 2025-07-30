"use client";

import { useState, useEffect } from "react";
import estadisticasService from "@/services/estadisticasService";
import planesEstudioService from "@/services/planesEstudioService";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  BarChartBig,
  Info,
} from "lucide-react";

// Definimos los períodos disponibles
const PERIODOS_ESTADISTICAS = [
  { value: "ULTIMO_ANIO", label: "Último año" },
  { value: "ULTIMOS_2_ANIOS", label: "Últimos 2 años" },
  { value: "ULTIMOS_5_ANIOS", label: "Últimos 5 años" },
  { value: "TODOS_LOS_TIEMPOS", label: "Todos los tiempos" },
];

export default function EstadisticasMateria() {
  const { estadisticasState, setEstadisticasState } = useSessionPersistence();

  const [estadisticas, setEstadisticas] = useState(() => {
    const savedData = localStorage.getItem("estadisticasMateria");
    return savedData ? JSON.parse(savedData) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [planes, setPlanes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState(
    estadisticasState.planSeleccionado
  );
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(
    estadisticasState.materiaSeleccionada
  );
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(
    estadisticasState.periodoSeleccionado || "TODOS_LOS_TIEMPOS"
  );

  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(() => {
    const savedTime = localStorage.getItem("estadisticasMateriaTime");
    return savedTime ? new Date(savedTime) : null;
  });

  useEffect(() => {
    setPlanSeleccionado(estadisticasState.planSeleccionado);
    setMateriaSeleccionada(estadisticasState.materiaSeleccionada);
    setPeriodoSeleccionado(
      estadisticasState.periodoSeleccionado || "TODOS_LOS_TIEMPOS"
    );
  }, [
    estadisticasState.planSeleccionado,
    estadisticasState.materiaSeleccionada,
    estadisticasState.periodoSeleccionado,
  ]);

  useEffect(() => {
    cargarPlanes();
  }, []);

  useEffect(() => {
    if (planSeleccionado) {
      setEstadisticasState("planSeleccionado", planSeleccionado);
      cargarMaterias(planSeleccionado);
      if (
        materiaSeleccionada &&
        materiaSeleccionada !== estadisticasState.materiaSeleccionada
      ) {
        setMateriaSeleccionada("");
        setEstadisticasState("materiaSeleccionada", "");
        setEstadisticas(null);
        localStorage.removeItem("estadisticasMateria");
        localStorage.removeItem("estadisticasMateriaTime");
        localStorage.removeItem("savedMateriaCode");
      }
    } else {
      setEstadisticasState("planSeleccionado", "");
      setMaterias([]);
      setMateriaSeleccionada("");
      setEstadisticasState("materiaSeleccionada", "");
      setEstadisticas(null);
      localStorage.removeItem("estadisticasMateria");
      localStorage.removeItem("estadisticasMateriaTime");
      localStorage.removeItem("savedMateriaCode");
    }
  }, [planSeleccionado]);

  useEffect(() => {
    if (materiaSeleccionada) {
      setEstadisticasState("materiaSeleccionada", materiaSeleccionada);
      const savedData = localStorage.getItem("estadisticasMateria");
      const savedMateria = localStorage.getItem("savedMateriaCode");
      if (!savedData || savedMateria !== materiaSeleccionada) {
        buscarEstadisticasRapido(materiaSeleccionada, periodoSeleccionado);
      }
    } else {
      setEstadisticasState("materiaSeleccionada", "");
      setEstadisticas(null);
      localStorage.removeItem("estadisticasMateria");
      localStorage.removeItem("estadisticasMateriaTime");
      localStorage.removeItem("savedMateriaCode");
    }
  }, [materiaSeleccionada]);

  useEffect(() => {
    if (materiaSeleccionada) {
      buscarEstadisticasRapido(materiaSeleccionada, periodoSeleccionado);
    }
  }, [periodoSeleccionado]);

  const cargarPlanes = async () => {
    setLoadingPlanes(true);
    try {
      const data = await planesEstudioService.obtenerPlanes();
      setPlanes(data);
      if (
        estadisticasState.planSeleccionado &&
        !data.some((plan) => plan.codigo === estadisticasState.planSeleccionado)
      ) {
        setPlanSeleccionado("");
        setEstadisticasState("planSeleccionado", "");
        setEstadisticasState("materiaSeleccionada", "");
        localStorage.removeItem("estadisticasMateria");
        localStorage.removeItem("estadisticasMateriaTime");
        localStorage.removeItem("savedMateriaCode");
      }
    } catch (err) {
      console.error("Error al cargar planes:", err);
      setError("No se pudieron cargar los planes de estudio.");
    } finally {
      setLoadingPlanes(false);
    }
  };

  const cargarMaterias = async (codigoPlan) => {
    setLoadingMaterias(true);
    setError(null);
    try {
      const data =
        await planesEstudioService.obtenerMateriasPorPlan(codigoPlan);
      setMaterias(data);
      if (
        estadisticasState.materiaSeleccionada &&
        !data.some(
          (materia) => materia.codigo === estadisticasState.materiaSeleccionada
        )
      ) {
        setMateriaSeleccionada("");
        setEstadisticasState("materiaSeleccionada", "");
        localStorage.removeItem("estadisticasMateria");
        localStorage.removeItem("estadisticasMateriaTime");
        localStorage.removeItem("savedMateriaCode");
      }
    } catch (err) {
      console.error("Error al cargar materias:", err);
      setError("No se pudieron cargar las materias del plan seleccionado.");
      setMaterias([]);
    } finally {
      setLoadingMaterias(false);
    }
  };

  const buscarEstadisticasRapido = async (codigoMateria, periodo) => {
    setLoading(true);
    setError(null);
    setLoadingMessage("Cargando estadísticas...");
    try {
      let data;
      if (periodo === "TODOS_LOS_TIEMPOS") {
        data =
          await estadisticasService.obtenerEstadisticasMateriaRapido(
            codigoMateria
          );
      } else {
        data = await estadisticasService.obtenerEstadisticasMateriaPorPeriodo(
          codigoMateria,
          periodo
        );
      }
      setEstadisticas(data);
      const now = new Date();
      setLastUpdate(now);
      localStorage.setItem("estadisticasMateria", JSON.stringify(data));
      localStorage.setItem("estadisticasMateriaTime", now.toISOString());
      localStorage.setItem("savedMateriaCode", codigoMateria);
      setEstadisticasState("periodoSeleccionado", periodo);
    } catch (err) {
      console.error("Error al cargar estadísticas de materia:", err);
      setError("No se encontraron estadísticas para la materia seleccionada.");
      setEstadisticas(null);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const refrescarDatos = async () => {
    if (!materiaSeleccionada) return;
    setLoading(true);
    setError(null);
    setLoadingMessage("Actualizando estadísticas...");
    try {
      let data;
      if (periodoSeleccionado === "TODOS_LOS_TIEMPOS") {
        data =
          await estadisticasService.obtenerEstadisticasMateria(
            materiaSeleccionada
          );
      } else {
        data = await estadisticasService.obtenerEstadisticasMateriaPorPeriodo(
          materiaSeleccionada,
          periodoSeleccionado
        );
      }
      setEstadisticas(data);
      const now = new Date();
      setLastUpdate(now);
      localStorage.setItem("estadisticasMateria", JSON.stringify(data));
      localStorage.setItem("estadisticasMateriaTime", now.toISOString());
      localStorage.setItem("savedMateriaCode", materiaSeleccionada);
    } catch (err) {
      console.error("Error al refrescar estadísticas de materia:", err);
      setError(
        "No se pudieron actualizar las estadísticas para la materia seleccionada."
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Estadísticas por Materia
        </h3>
        <div className="flex items-center gap-4">
          {loadingMessage && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">{loadingMessage}</span>
            </div>
          )}
          <button
            onClick={refrescarDatos}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed text-sm font-semibold"
            disabled={!materiaSeleccionada || loading}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>
      </div>

      {/* --- FILTROS --- */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="plan-select"
              className="text-sm font-semibold text-gray-700 block mb-2"
            >
              Plan de Estudio
            </label>
            <select
              id="plan-select"
              value={planSeleccionado}
              onChange={(e) => setPlanSeleccionado(e.target.value)}
              disabled={loadingPlanes}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base bg-white text-gray-800 transition-colors cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingPlanes ? "Cargando..." : "Seleccione un plan"}
              </option>
              {planes.map((plan) => (
                <option key={plan.codigo} value={plan.codigo}>
                  {`${plan.propuesta} (${plan.codigo})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="materia-select"
              className="text-sm font-semibold text-gray-700 block mb-2"
            >
              Materia
            </label>
            <select
              id="materia-select"
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
              disabled={
                !planSeleccionado || loadingMaterias || materias.length === 0
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base bg-white text-gray-800 transition-colors cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {!planSeleccionado
                  ? "Primero seleccione un plan"
                  : loadingMaterias
                    ? "Cargando..."
                    : materias.length === 0
                      ? "No hay materias disponibles"
                      : "Seleccione una materia"}
              </option>
              {materias.map((materia) => (
                <option key={materia.codigo} value={materia.codigo}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="periodo-select"
              className="text-sm font-semibold text-gray-700 block mb-2"
            >
              Período de tiempo
            </label>
            <select
              id="periodo-select"
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              disabled={!materiaSeleccionada}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base bg-white text-gray-800 transition-colors cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {PERIODOS_ESTADISTICAS.map((periodo) => (
                <option key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- ESTADOS DE LA UI --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 text-red-500" />
          <div>
            <strong className="font-semibold block">
              Error al cargar estadísticas
            </strong>
            <p className="text-sm mt-1">{error}</p>
            {materiaSeleccionada && (
              <button
                onClick={() => buscarEstadisticasRapido(materiaSeleccionada)}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartSkeleton type="pie" />
            <ChartSkeleton type="pie" />
          </div>
          <ChartSkeleton type="bar" />
        </div>
      )}

      {/* --- RESULTADOS --- */}
      {estadisticas && !loading && (
        <div className="animate-fade-in">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-8 text-center shadow-lg">
            <h4 className="text-xl sm:text-2xl font-bold mb-1">
              {estadisticas.nombreMateria}
            </h4>
            <span className="block text-sm sm:text-base opacity-90">
              Código: {estadisticas.codigoMateria}
            </span>
          </div>

          {estadisticas.totalRendidos === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <BarChartBig className="mx-auto text-6xl mb-4 text-gray-400" />
              <h4 className="text-xl sm:text-2xl text-gray-800 mb-2 font-semibold">
                No hay estadísticas disponibles
              </h4>
              <p className="text-base text-gray-600 mb-6 max-w-lg mx-auto">
                Esta materia aún no tiene exámenes rendidos registrados en el
                sistema.
              </p>
              <div className="bg-white p-4 sm:p-6 rounded-lg border-l-4 border-orange-400 max-w-md mx-auto text-left space-y-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-500" /> Total de exámenes
                  rendidos: <strong className="text-gray-800">0</strong>
                </span>
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-500" /> Los datos
                  aparecerán cuando se registren exámenes.
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* --- MÉTRICAS PRINCIPALES --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Métricas como componentes para evitar repetición, pero aquí las dejamos inline por simplicidad */}
                <MetricCard
                  icon="👥"
                  title="Total Rendidos"
                  value={estadisticas.totalRendidos}
                  color="blue"
                />
                <MetricCard
                  icon="✅"
                  title="Aprobados"
                  value={estadisticas.aprobados}
                  color="green"
                />
                <MetricCard
                  icon="❌"
                  title="Reprobados"
                  value={estadisticas.reprobados}
                  color="red"
                />
                <MetricCard
                  icon="📊"
                  title="% Aprobados"
                  value={`${estadisticas.porcentajeAprobados.toFixed(1)}%`}
                  color="orange"
                />
                <MetricCard
                  icon="🎯"
                  title="Promedio Notas"
                  value={estadisticas.promedioNotas.toFixed(2)}
                  color="teal"
                />
                <MetricCard
                  icon="📅"
                  title="Promedio Días"
                  value={estadisticas.promedioDiasEstudio.toFixed(1)}
                  color="gray"
                />
                <MetricCard
                  icon="⏰"
                  title="Promedio Horas"
                  value={estadisticas.promedioHorasDiarias.toFixed(1)}
                  color="gray"
                />
                <MetricCard
                  icon="⭐"
                  title="Promedio Dificultad"
                  value={estadisticas.promedioDificultad.toFixed(1)}
                  color="purple"
                />
              </div>

              {/* --- GRÁFICOS --- */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PieChart
                    data={estadisticas.distribucionModalidad}
                    title="Distribución por Modalidad"
                    colors={["#4299e1", "#48bb78", "#ed8936"]}
                    showHover={false}
                  />
                  <PieChart
                    data={estadisticas.distribucionRecursos}
                    title="Recursos Utilizados"
                    colors={[
                      "#9f7aea", // Morado pastel
                      "#38b2ac", // Verde azulado
                      "#f56565", // Rojo coral
                      "#4299e1", // Azul brillante
                      "#ed8936", // Naranja cálido
                      "#48bb78", // Verde esmeralda
                      "#667eea", // Azul suave
                      "#f6ad55", // Melocotón
                      "#a0aec0", // Gris azulado
                      "#e53e3e", // Rojo intenso
                      "#805ad5", // Morado vibrante
                      "#319795", // Verde turquesa
                      "#d53f8c", // Rosa fuerte
                      "#f687b3", // Rosa pastel
                      "#4fd1c5", // Cian claro
                      "#68d391", // Verde menta
                      "#fbbf24", // Amarillo dorado
                      "#fc8181", // Rosa salmón
                      "#0bc5ea", // Azul cielo
                      "#9ae6b4", // Verde manzana
                    ]}
                    showHover={false}
                  />
                </div>
                <BarChart
                  data={estadisticas.distribucionDificultad}
                  title="Distribución de Dificultad (1-10)"
                  colors={["#9f7aea"]}
                  maxBars={10}
                  useIntegers={true}
                  showBaseLabels={true}
                  baseLabels={[
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                  ]}
                  showHover={false}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* --- ESTADO VACÍO INICIAL --- */}
      {!estadisticas && !loading && !error && (
        <div className="text-center py-16 px-4 text-gray-500">
          <BarChartBig className="mx-auto text-6xl mb-4 text-gray-400" />
          <h4 className="text-xl sm:text-2xl text-gray-600 mb-2 font-semibold">
            Seleccione un plan y una materia
          </h4>
          <p className="text-base text-gray-500 max-w-md mx-auto">
            Elija un plan de estudio y luego una materia para ver las
            estadísticas detalladas.
          </p>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para las tarjetas de métricas
const MetricCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    orange: "border-orange-500",
    teal: "border-teal-500",
    gray: "border-gray-500",
    purple: "border-purple-500",
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 sm:p-5 shadow-md flex items-center gap-4 border-l-4 ${colorClasses[color]}`}
    >
      <div className="text-2xl sm:text-3xl opacity-80">{icon}</div>
      <div>
        <h5 className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </h5>
        <div className="text-2xl sm:text-3xl font-bold text-gray-800">
          {value}
        </div>
      </div>
    </div>
  );
};
