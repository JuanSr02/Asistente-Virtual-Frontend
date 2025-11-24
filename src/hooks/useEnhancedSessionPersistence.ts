"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "recomendacion_complete_state";

// Definimos la interfaz del estado para mejor control de tipos
interface EnhancedSessionState {
  // Estados principales
  persona: any | null; // Se podría importar la interfaz Persona de personaService
  historiaAcademica: any | null; // Se podría importar la interfaz HistoriaAcademica
  recomendaciones: any[];
  planes: any[];
  // Estados de UI
  criterioOrden: string;
  planSeleccionado: string;
  // Metadata de persistencia
  personaId: number | string | null;
  lastFetch: string | null;
  lastUpdate: string | null;
  isInitialized: boolean;
  // Estados de carga (no se persisten)
  loadingPersona: boolean;
  loadingRecomendaciones: boolean;
  loadingPlanes: boolean;
  uploading: boolean;
  // Estados de mensajes (no se persisten)
  error: string | null;
  success: string | null;
  // NUEVO: Estado para operaciones críticas
  criticalOperationInProgress: boolean;
}

const initialState: EnhancedSessionState = {
  persona: null,
  historiaAcademica: null,
  recomendaciones: [],
  planes: [],
  criterioOrden: "CORRELATIVAS",
  planSeleccionado: "",
  personaId: null,
  lastFetch: null,
  lastUpdate: null,
  isInitialized: false,
  loadingPersona: true,
  loadingRecomendaciones: false,
  loadingPlanes: false,
  uploading: false,
  error: null,
  success: null,
  criticalOperationInProgress: false,
};

export function useEnhancedSessionPersistence() {
  const [state, setState] = useState<EnhancedSessionState>(initialState);

  const initialized = useRef(false);

  // Cargar estado desde sessionStorage al inicializar
  useEffect(() => {
    if (!initialized.current) {
      if (typeof window !== "undefined") {
        try {
          const savedState = sessionStorage.getItem(STORAGE_KEY);
          if (savedState) {
            const parsed = JSON.parse(savedState);
            console.log("Cargando estado guardado:", parsed);
            // Solo cargar si los datos no están muy antiguos (menos de 1 hora según el código original)
            const lastUpdate = parsed.lastUpdate
              ? new Date(parsed.lastUpdate)
              : null;
            const now = new Date();
            const oneHour = 60 * 60 * 1000;

            if (lastUpdate && now.getTime() - lastUpdate.getTime() < oneHour) {
              setState((prevState) => ({
                ...prevState,
                ...parsed,
                isInitialized: true,
                // Reset estados temporales
                loadingPersona: false,
                loadingRecomendaciones: false,
                loadingPlanes: false,
                uploading: false,
                error: null,
                success: null,
                criticalOperationInProgress: false, // Siempre resetear esto
              }));
            } else {
              console.log("Estado guardado muy antiguo, iniciando fresh");
              setState((prevState) => ({ ...prevState, isInitialized: true }));
            }
          } else {
            setState((prevState) => ({ ...prevState, isInitialized: true }));
          }
        } catch (error) {
          console.error("Error cargando estado guardado:", error);
          setState((prevState) => ({ ...prevState, isInitialized: true }));
        }
      }
      initialized.current = true;
    }
  }, []);

  // Guardar estado en sessionStorage cuando cambie
  const saveState = useCallback((newState: EnhancedSessionState) => {
    if (typeof window === "undefined") return;
    try {
      const stateToSave: Partial<EnhancedSessionState> = {
        ...newState,
        lastUpdate: new Date().toISOString(),
        // No guardar estados temporales
        loadingPersona: undefined,
        loadingRecomendaciones: undefined,
        loadingPlanes: undefined,
        uploading: undefined,
        error: undefined,
        success: undefined,
        criticalOperationInProgress: undefined, // No persistir operaciones críticas
      };

      // Limpiar propiedades undefined
      (Object.keys(stateToSave) as Array<keyof EnhancedSessionState>).forEach(
        (key) => {
          if (stateToSave[key] === undefined) {
            delete stateToSave[key];
          }
        }
      );

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      console.log("Estado guardado en sessionStorage");
    } catch (error) {
      console.error("Error guardando estado:", error);
    }
  }, []);

  // Función para actualizar el estado
  const updateState = useCallback(
    (updates: Partial<EnhancedSessionState>) => {
      setState((prevState) => {
        const newState = { ...prevState, ...updates };
        // Solo guardar si hay cambios significativos (no estados de carga)
        const significantKeys: Array<keyof EnhancedSessionState> = [
          "persona",
          "historiaAcademica",
          "recomendaciones",
          "planes",
          "criterioOrden",
          "planSeleccionado",
          "personaId",
          "lastFetch",
        ];

        const hasSignificantChanges = Object.keys(updates).some((key) =>
          significantKeys.includes(key as keyof EnhancedSessionState)
        );

        if (hasSignificantChanges) {
          saveState(newState);
        }
        return newState;
      });
    },
    [saveState]
  );

  // NUEVA: Función para marcar inicio de operación crítica
  const startCriticalOperation = useCallback(() => {
    updateState({ criticalOperationInProgress: true });
  }, [updateState]);

  // NUEVA: Función para marcar fin de operación crítica
  const endCriticalOperation = useCallback(() => {
    updateState({ criticalOperationInProgress: false });
  }, [updateState]);

  // Función para limpiar recomendaciones
  const clearRecomendaciones = useCallback(() => {
    updateState({
      recomendaciones: [],
      lastFetch: null,
      criterioOrden: "CORRELATIVAS",
    });
  }, [updateState]);

  // Función para limpiar todo el estado
  const clearAllState = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setState({
        ...initialState,
        isInitialized: true,
        loadingPersona: true,
      });
    } catch (error) {
      console.error("Error limpiando estado:", error);
    }
  }, []);

  // Función para verificar si el estado está actualizado
  const isStateStale = useCallback(
    (maxAgeMinutes = 30) => {
      if (!state.lastUpdate) return true;
      const lastUpdate = new Date(state.lastUpdate);
      const now = new Date();
      const maxAge = maxAgeMinutes * 60 * 1000;
      return now.getTime() - lastUpdate.getTime() > maxAge;
    },
    [state.lastUpdate]
  );

  return {
    state,
    updateState,
    clearRecomendaciones,
    clearAllState,
    isStateStale,
    isInitialized: state.isInitialized,
    startCriticalOperation, // NUEVO
    endCriticalOperation, // NUEVO
  };
}
