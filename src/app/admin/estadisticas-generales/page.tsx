"use client";

import { useState, useEffect, ReactNode } from "react";
import estadisticasService from "@/services/estadisticasService";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";

// --- INTERFACES TS ---

interface MateriaEstadistica {
  nombre: string;
  porcentaje: number;
  codigoMateria?: string; // Opcional porque a veces viene, a veces no
}

interface EstadisticasData {
  estudiantesActivos: number;
  totalMaterias: number;
  totalExamenesRendidos: number;
  porcentajeAprobadosGeneral: number;
  promedioGeneral: number;
  materiaMasRendida: {
    nombre: string;
    porcentaje: number;
  };
  cantidadMateriaMasRendida: number;
  // Asumimos que es un objeto clave-valor para los gráficos
  distribucionEstudiantesPorCarrera: Record<string, number>;
  distribucionExamenesPorMateria: Record<string, number>;
  promedioNotasPorMateria: Record<string, number>;
  top5Aprobadas: MateriaEstadistica[];
  top5Reprobadas: MateriaEstadistica[];
}

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  color: "blue" | "gray" | "green" | "orange" | "teal";
}

interface RankingListItemProps {
  rank: number;
  name: string;
  value: string | number;
  color: "green" | "red";
}

// --- SUB-COMPONENTES ---

const MetricCard = ({ icon, title, value, color }: MetricCardProps) => {
  const colorClasses = {
    blue: "border-blue-500",
    gray: "border-gray-500",
    green: "border-green-500",
    orange: "border-orange-500",
    teal: "border-teal-500",
  };

  return (
    // Se mantiene bg-background para adaptarse al tema
    <div
      className={`bg-background rounded-xl p-4 sm:p-5 shadow-md flex items-center gap-4 border-l-4 ${colorClasses[color]}`}
    >
      <div className="text-2xl sm:text-3xl opacity-80">{icon}</div>
      <div>
        <h5 className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mb-1">
          {title}
        </h5>
        <div className="text-2xl sm:text-3xl font-bold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
};

const RankingListItem = ({
  rank,
  name,
  value,
  color,
}: RankingListItemProps) => {
  // AJUSTE MODO OSCURO: Usamos dark:bg-opacity o colores específicos con alpha
  const colorClasses = {
    green:
      "bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-600",
    red: "bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-600",
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${colorClasses[color]}`}
    >
      <div className="font-bold text-lg text-muted-foreground w-8 text-center">
        #{rank}
      </div>
      <div className="flex-1 text-sm font-semibold text-foreground truncate">
        {name}
      </div>
      <div className="font-bold text-base sm:text-lg text-foreground">
        {value}%
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function EstadisticasGenerales() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(
    () => {
      // Verificación segura de window/localStorage para Next.js (SSR) aunque tenga "use client"
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem("estadisticasGenerales");
        try {
          return savedData ? JSON.parse(savedData) : null;
        } catch {
          return null;
        }
      }
      return null;
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  // Estado usado para forzar re-renders o mostrar fecha, aunque no se renderiza explícitamente en el return original
  const [, setLastUpdate] = useState<Date | null>(() => {
    if (typeof window !== "undefined") {
      const savedTime = localStorage.getItem("estadisticasGeneralesTime");
      return savedTime ? new Date(savedTime) : null;
    }
    return null;
  });

  useEffect(() => {
    if (!estadisticas) {
      cargarEstadisticasGeneralesRapido();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarEstadisticasGeneralesRapido = async () => {
    setLoading(true);
    setError(null);
    setLoadingMessage("Cargando estadísticas...");
    try {
      const data =
        await estadisticasService.obtenerEstadisticasGeneralesRapido();
      setEstadisticas(data);
      const now = new Date();
      setLastUpdate(now);
      localStorage.setItem("estadisticasGenerales", JSON.stringify(data));
      localStorage.setItem("estadisticasGeneralesTime", now.toISOString());
    } catch (err) {
      console.error("Error al cargar estadísticas generales:", err);
      setError("No se pudieron cargar las estadísticas generales.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const refrescarDatos = async () => {
    setLoading(true);
    setError(null);
    setLoadingMessage("Actualizando estadísticas...");
    try {
      const data = await estadisticasService.obtenerEstadisticasGenerales();
      setEstadisticas(data);
      const now = new Date();
      setLastUpdate(now);
      localStorage.setItem("estadisticasGenerales", JSON.stringify(data));
      localStorage.setItem("estadisticasGeneralesTime", now.toISOString());
    } catch (err) {
      console.error("Error al refrescar estadísticas generales:", err);
      setError("No se pudieron actualizar las estadísticas generales.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-end items-center mb-6">
          {loadingMessage && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">{loadingMessage}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartSkeleton type="pie" />
          <ChartSkeleton type="bar" />
        </div>
        <ChartSkeleton type="bar" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* AJUSTE MODO OSCURO: Fondo rojo oscuro transparente y borde ajustado */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 text-red-500 dark:text-red-400" />
          <div>
            <strong className="font-semibold block">
              Error al cargar estadísticas
            </strong>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={cargarEstadisticasGeneralesRapido}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center text-muted-foreground">
        No hay datos disponibles para mostrar.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
          Vista General del Sistema
        </h3>
        <button
          onClick={refrescarDatos}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-900 w-full sm:w-auto text-sm font-semibold"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* --- MÉTRICAS PRINCIPALES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          icon="👥"
          title="Estudiantes"
          value={estadisticas.estudiantesActivos}
          color="blue"
        />
        <MetricCard
          icon="📚"
          title="Materias"
          value={estadisticas.totalMaterias}
          color="gray"
        />
        <MetricCard
          icon="📝"
          title="Exámenes"
          value={estadisticas.totalExamenesRendidos}
          color="green"
        />
        <MetricCard
          icon="📊"
          title="% Aprobados"
          value={`${estadisticas.porcentajeAprobadosGeneral.toFixed(1)}%`}
          color="orange"
        />
        <MetricCard
          icon="🎯"
          title="Promedio Gral."
          value={estadisticas.promedioGeneral.toFixed(2)}
          color="teal"
        />
      </div>

      {/* --- GRÁFICOS Y MATERIA MÁS RENDIDA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <PieChart
            data={estadisticas.distribucionEstudiantesPorCarrera}
            title="Distribución de Estudiantes por Carrera"
            showHover={false}
          />
        </div>
        {/* Card Materia más Rendida: Gradient se ve bien en ambos modos, texto blanco fijo */}
        <div className="lg:col-span-2 flex flex-col justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg text-center">
          <h4 className="text-base font-semibold mb-2 opacity-90">
            Materia Más Rendida
          </h4>
          <p className="text-xl font-bold truncate">
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
      </div>

      {/* --- GRÁFICO DE MATERIAS MÁS RENDIDAS --- */}
      <BarChart
        data={Object.fromEntries(
          Object.entries(estadisticas.distribucionExamenesPorMateria)
            // 1. Ordenar de mayor a menor (descendente) por la cantidad de exámenes
            .sort((a, b) => b[1] - a[1])
            // 2. Tomar los primeros 10 elementos
            .slice(0, 10)
            // 3. Reordenar de menor a mayor (ascendente) para visualización
            .sort((a, b) => a[1] - b[1])
        )}
        title="Top 10 - Materias más Rendidas"
        colors={["#4299e1"]}
        maxBars={10}
        useIntegers={true}
        showNameBelow={true}
      />

      {/* --- RANKINGS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AJUSTE MODO OSCURO: dark:bg-card o usar bg-background ya cubre esto si está bien configurado */}
        <div className="bg-background rounded-xl p-4 sm:p-6 shadow-md">
          {/* AJUSTE MODO OSCURO: text-gray-700 -> dark:text-gray-300 */}
          <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
            🏆 Top 5 Materias con Mayor Aprobación
          </h4>
          <div className="flex flex-col gap-3">
            {estadisticas.top5Aprobadas.map((materia, index) => (
              <RankingListItem
                key={materia.codigoMateria || index}
                rank={index + 1}
                name={materia.nombre}
                value={materia.porcentaje.toFixed(1)}
                color="green"
              />
            ))}
          </div>
        </div>
        <div className="bg-background rounded-xl p-4 sm:p-6 shadow-md">
          <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
            📉 Top 5 Materias con Menor Aprobación
          </h4>
          <div className="flex flex-col gap-3">
            {estadisticas.top5Reprobadas.map((materia, index) => (
              <RankingListItem
                key={materia.codigoMateria || index}
                rank={index + 1}
                name={materia.nombre}
                value={materia.porcentaje.toFixed(1)}
                color="red"
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- GRÁFICOS DE PROMEDIOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChart
          data={Object.entries(estadisticas.promedioNotasPorMateria)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reverse()
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})}
          title="Top 10 - Promedios más altos por Materia"
          colors={["#38b2ac"]}
          maxBars={10}
          useIntegers={false}
          showNameBelow={true}
        />
        <BarChart
          data={Object.entries(estadisticas.promedioNotasPorMateria)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 10)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})}
          title="Top 10 - Promedios más bajos por Materia"
          colors={["#f56565"]}
          maxBars={10}
          useIntegers={false}
          showNameBelow={true}
        />
      </div>
    </div>
  );
}
