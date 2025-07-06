"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal"; // Asumo que el Modal base ya es responsive
import planesEstudioService from "@/services/planesEstudioService";
import { MateriaListSkeleton } from "../Skeleton";
import { AlertTriangle, Book, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MateriasModal({ isOpen, onClose, plan }) {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    if (isOpen && plan) {
      const cacheKey = `materias_${plan.codigo}`;
      const saved = sessionStorage.getItem(cacheKey);

      if (saved) {
        setMaterias(JSON.parse(saved));
        setLoading(false);
        setError(null);
        setHasFetchedOnce(true);
        return;
      }

      cargarMaterias(plan.codigo);
    }
  }, [isOpen, plan]);

  const cargarMaterias = async (codigo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await planesEstudioService.obtenerMateriasPorPlan(codigo);
      setMaterias(data);
      sessionStorage.setItem(`materias_${codigo}`, JSON.stringify(data));
      setHasFetchedOnce(true);
    } catch (err) {
      setError("No se pudieron cargar las materias del plan.");
    } finally {
      setLoading(false);
    }
  };

  // El título del modal se puede simplificar para móvil
  const modalTitle = (
    <>
      <span className="hidden sm:inline">Materias del Plan: </span>
      <span>{plan?.propuesta || "Plan"}</span>
      <span className="text-gray-500 font-normal ml-2">
        ({plan?.codigo || "N/A"})
      </span>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="48rem" // Un poco más compacto que 50rem
    >
      {/* Contenedor con scroll vertical interno */}
      <div className="max-h-[70vh] min-h-[18rem] overflow-y-auto p-1 pr-2 sm:pr-4">
        {loading && !hasFetchedOnce ? (
          <MateriaListSkeleton count={10} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => cargarMaterias(plan.codigo)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : materias.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-12 text-gray-500">
            <Book className="w-12 h-12 text-gray-300 mb-4" />
            <h4 className="text-lg font-semibold text-gray-700">
              No hay materias registradas
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Este plan de estudio no tiene materias cargadas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-600 px-2">
              {materias.length} materia{materias.length !== 1 && "s"} encontrada
              {materias.length !== 1 && "s"}
            </div>
            {/* 
              Usamos una rejilla para la lista. En pantallas pequeñas se verá como una lista
              y en más grandes podría adaptarse si fuera necesario (ej. md:grid-cols-2)
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {materias.map((materia, index) => (
                <div
                  key={materia.codigo}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200"
                >
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {materia.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      Código: {materia.codigo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
