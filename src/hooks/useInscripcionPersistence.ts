"use client";

import { useState, useEffect, useCallback } from "react";

interface InscripcionState {
  // Datos básicos
  persona: any;
  historiaAcademica: any;
  materiasDisponibles: any[];
  inscripcionesEstudiante: any[];

  // Selecciones actuales
  materiaSeleccionada: any;
  mesaSeleccionada: string;
  anioSeleccionado: number | string;

  // Estado de inscripción exitosa
  inscripcionExitosa: any;
  companerosInscriptos: any[];

  // Metadatos
  lastUpdate: string;
  isDataFresh: boolean;
}

const STORAGE_KEY = "inscripcion_state";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const initialState: InscripcionState = {
  persona: null,
  historiaAcademica: null,
  materiasDisponibles: [],
  inscripcionesEstudiante: [],
  materiaSeleccionada: null,
  mesaSeleccionada: "",
  anioSeleccionado: "",
  inscripcionExitosa: null,
  companerosInscriptos: [],
  lastUpdate: "",
  isDataFresh: false,
};

export function useInscripcionPersistence() {
  const [state, setState] = useState<InscripcionState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar estado desde sessionStorage al inicializar
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setState(parsedState);
      }
    } catch (error) {
      console.error("Error al cargar estado de inscripción:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Guardar estado en sessionStorage cuando cambie
  useEffect(() => {
    if (isInitialized) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Error al guardar estado de inscripción:", error);
      }
    }
  }, [state, isInitialized]);

  const updateState = useCallback((updates: Partial<InscripcionState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
      lastUpdate: new Date().toISOString(),
    }));
  }, []);

  const clearSelections = useCallback(() => {
    setState((prev) => ({
      ...prev,
      materiaSeleccionada: null,
      mesaSeleccionada: "",
      anioSeleccionado: "",
      inscripcionExitosa: null,
      companerosInscriptos: [],
    }));
  }, []);

  const clearAllData = useCallback(() => {
    setState(initialState);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const shouldRefreshData = useCallback(() => {
    if (!state.lastUpdate) return true;

    const lastUpdateTime = new Date(state.lastUpdate).getTime();
    const now = Date.now();
    const isExpired = now - lastUpdateTime > CACHE_DURATION;

    // Refrescar si no hay datos básicos o si los datos están expirados
    const hasBasicData = state.persona && state.historiaAcademica !== undefined;
    return !hasBasicData || isExpired || !state.isDataFresh;
  }, [state]);

  const invalidateCache = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDataFresh: false,
    }));
  }, []);

  const markDataAsFresh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDataFresh: true,
      lastUpdate: new Date().toISOString(),
    }));
  }, []);

  return {
    state,
    updateState,
    clearSelections,
    clearAllData,
    shouldRefreshData,
    invalidateCache,
    markDataAsFresh,
    isInitialized,
  };
}
