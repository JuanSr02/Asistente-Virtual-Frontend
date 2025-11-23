"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import planesEstudioService from "@/services/planesEstudioService";
import { MateriaListSkeleton } from "../Skeleton";
import { AlertTriangle, Book, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Definimos las interfaces para los tipos de datos
interface Plan {
  codigo: string;
  propuesta: string;
}

interface Materia {
  codigo: string;
  nombre: string;
}

interface MateriasModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null; // El plan puede ser null si no hay selección
}

export default function MateriasModal({
  isOpen,
  onClose,
  plan,
}: MateriasModalProps) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    if (isOpen && plan) {
      const cacheKey = `materias_${plan.codigo}`;
      const saved = sessionStorage.getItem(cacheKey);

      if (saved) {
        try {
          setMaterias(JSON.parse(saved));
          setLoading(false);
          setError(null);
          setHasFetchedOnce(true);
          return;
        } catch (e) {
          console.warn("Error parsing cached materias", e);
        }
      }

      cargarMaterias(plan.codigo);
    }
  }, [isOpen, plan]);

  const cargarMaterias = async (codigo: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await planesEstudioService.obtenerMateriasPorPlan(codigo);
      setMaterias(data);
      sessionStorage.setItem(`materias_${codigo}`, JSON.stringify(data));
      setHasFetchedOnce(true);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las materias del plan.");
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = (
    <>
      <span className="hidden sm:inline">Materias del Plan: </span>
      <span>{plan?.propuesta || "Plan"}</span>
      <span className="text-muted-foreground font-normal ml-2">
        ({plan?.codigo || "N/A"})
      </span>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="48rem"
    >
      {/* Contenedor con scroll vertical */}
      <div className="max-h-[70vh] min-h-[18rem] overflow-y-auto p-1 pr-2 sm:pr-4 custom-scrollbar">
        {loading && !hasFetchedOnce ? (
          <MateriaListSkeleton count={10} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => plan && cargarMaterias(plan.codigo)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : materias.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-12 text-muted-foreground">
            {/* Icono con color adaptativo */}
            <Book className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h4 className="text-lg font-semibold text-foreground">
              No hay materias registradas
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Este plan de estudio no tiene materias cargadas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground px-2">
              {materias.length} materia{materias.length !== 1 && "s"} encontrada
              {materias.length !== 1 && "s"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {materias.map((materia, index) => (
                <div
                  key={materia.codigo}
                  // CAMBIOS DARK MODE:
                  // - bg-muted/30 en lugar de bg-white o bg-gray-50
                  // - border-border en lugar de border-gray-200
                  // - hover:bg-accent en lugar de hover:bg-blue-50
                  // - hover:border-primary en lugar de hover:border-blue-500
                  className="flex items-center gap-4 p-3 bg-card border rounded-lg border-l-4 border-l-muted hover:border-l-primary hover:bg-accent transition-all duration-200"
                >
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {materia.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
