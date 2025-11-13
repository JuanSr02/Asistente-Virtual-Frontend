"use client";

import { useState, useEffect } from "react";
import estadisticasService from "@/services/estadisticasService";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import { MetricSkeleton, ChartSkeleton } from "@/components/Skeleton";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";

// Componente auxiliar para las tarjetas de métricas
const MetricCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: "border-blue-500",
    gray: "border-gray-500",
    green: "border-green-500",
    orange: "border-orange-500",
    teal: "border-teal-500",
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

/**
 * Procesa un objeto de distribución de estadísticas:
 * 1. Normaliza los nombres de las claves (quita acentos y convierte a mayúsculas) para unificar duplicados.
 * 2. Suma las cantidades de las claves unificadas.
 * 3. Ordena el resultado de forma descendente por cantidad.
 * 4. Limita el resultado al número 'topN' especificado.
 *
 * @param {Object} data - Objeto de estadísticas, ej: {"MATERIA A": 10, "Materia a": 5}
 * @param {number} topN - Número de elementos principales a devolver (por defecto 15).
 * @returns {Array<{name: string, count: number}>} - Array de objetos ordenado.
 */
const getTopNUnificadoYOrdenado = (data, topN = 15) => {
    // Función de normalización de nombres
    const normalizeName = (name) => {
        let normalized = name.toUpperCase();
        
        // 1. Quitar acentos de forma robusta (caracteres diacríticos)
        normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 2. Corregir cualquier error tipográfico conocido (ej. el que encontré antes)
        if (normalized.includes("CO0MUNICACION")) {
            normalized = normalized.replace("CO0MUNICACION", "COMUNICACION");
        }
        
        return normalized;
    };

    // 1. Unificación y Suma
    const aggregatedData = {};

    for (const [key, count] of Object.entries(data)) {
        const normalizedName = normalizeName(key);
        // Suma las cantidades para el nombre normalizado
        aggregatedData[normalizedName] = (aggregatedData[normalizedName] || 0) + count;
    }

    // 2. Conversión a Array de Objetos
    let sortedItems = Object.entries(aggregatedData).map(([name, count]) => ({
        name: name,
        count: count
    }));

    // 3. Ordenamiento (descendente por 'count')
    sortedItems.sort((a, b) => b.count - a.count);

    // 4. Filtrar Top N y devolver
    return sortedItems.slice(0, topN);
};


// Componente auxiliar para las listas de ranking
const RankingListItem = ({ rank, name, value, color }) => {
  const colorClasses = {
    green: "bg-green-50 border-green-500",
    red: "bg-red-50 border-red-500",
  };
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${colorClasses[color]}`}
    >
      <div className="font-bold text-lg text-gray-500 w-8 text-center">
        #{rank}
      </div>
      <div className="flex-1 text-sm font-semibold text-gray-800 truncate">
        {name}
      </div>
      <div className="font-bold text-base sm:text-lg text-gray-800">
        {value}%
      </div>
    </div>
  );
};

export default function EstadisticasGenerales() {
  const [estadisticas, setEstadisticas] = useState(() => {
    const savedData = localStorage.getItem("estadisticasGenerales");
    return savedData ? JSON.parse(savedData) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [lastUpdate, setLastUpdate] = useState(() => {
    const savedTime = localStorage.getItem("estadisticasGeneralesTime");
    return savedTime ? new Date(savedTime) : null;
  });

  // --- LÓGICA DEL COMPONENTE SIN CAMBIOS ---
  useEffect(() => {
    if (!estadisticas) {
      cargarEstadisticasGeneralesRapido();
    }
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

  // --- RENDERIZADO ---
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-end items-center mb-6">
          {loadingMessage && (
            <div className="flex items-center gap-2 text-blue-600">
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
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 text-red-500" />
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
      <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-500">
        No hay datos disponibles para mostrar.
      </div>
    );
  }

  // --- JSX RESPONSIVE ---
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Vista General del Sistema
        </h3>
        <button
          onClick={refrescarDatos}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-blue-300 w-full sm:w-auto text-sm font-semibold"
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
        data={getTopNUnificadoYOrdenado(estadisticas.distribucionExamenesPorMateria,10)}
        title="Top 15 Materias más Rendidas"
        colors={["#4299e1"]}
        maxBars={10}
        useIntegers={true}
        showNameBelow={true}
      />

      {/* --- RANKINGS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
          <h4 className="text-base font-semibold text-gray-700 mb-4">
            🏆 Top 5 Materias con Mayor Aprobación
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
            📉 Top 5 Materias con Menor Aprobación
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

      {/* --- GRÁFICOS DE PROMEDIOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChart
          data={Object.entries(estadisticas.promedioNotasPorMateria)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})}
          title="Top 10 - Mejor Promedio de Notas"
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
          title="Top 10 - Peor Promedio de Notas"
          colors={["#f56565"]}
          maxBars={10}
          useIntegers={false}
          showNameBelow={true}
        />
      </div>
    </div>
  );
}
