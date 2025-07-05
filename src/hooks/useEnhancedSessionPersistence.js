// hooks/useEnhancedSessionPersistence.js
import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "recomendacion_complete_state";

export function useEnhancedSessionPersistence() {
  const [state, setState] = useState({
    // Estados principales
    persona: null,
    historiaAcademica: null,
    recomendaciones: [],
    planes: [],

    // Estados de UI
    criterioOrden: "CORRELATIVAS",
    planSeleccionado: "",

    // Metadata de persistencia
    personaId: null,
    lastFetch: null,
    lastUpdate: null,
    isInitialized: false,

    // Estados de carga (no se persisten)
    loadingPersona: true,
    loadingRecomendaciones: false,
    loadingPlanes: false,
    uploading: false,

    // Estados de mensajes (no se persisten)
    error: null,
    success: null,
  });

  const initialized = useRef(false);

  // Cargar estado desde sessionStorage al inicializar
  useEffect(() => {
    if (!initialized.current) {
      try {
        const savedState = sessionStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          console.log("Cargando estado guardado:", parsed);

          // Solo cargar si los datos no están muy antiguos (menos de 1 hora)
          const lastUpdate = parsed.lastUpdate
            ? new Date(parsed.lastUpdate)
            : null;
          const now = new Date();
          const oneHour = 60 * 60 * 1000;

          if (lastUpdate && now - lastUpdate < oneHour) {
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
      initialized.current = true;
    }
  }, []);

  // Guardar estado en sessionStorage cuando cambie
  const saveState = useCallback((newState) => {
    try {
      const stateToSave = {
        ...newState,
        lastUpdate: new Date().toISOString(),
        // No guardar estados temporales
        loadingPersona: undefined,
        loadingRecomendaciones: undefined,
        loadingPlanes: undefined,
        uploading: undefined,
        error: undefined,
        success: undefined,
      };

      // Limpiar propiedades undefined
      Object.keys(stateToSave).forEach((key) => {
        if (stateToSave[key] === undefined) {
          delete stateToSave[key];
        }
      });

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      console.log("Estado guardado en sessionStorage");
    } catch (error) {
      console.error("Error guardando estado:", error);
    }
  }, []);

  // Función para actualizar el estado
  const updateState = useCallback(
    (updates) => {
      setState((prevState) => {
        const newState = { ...prevState, ...updates };

        // Solo guardar si hay cambios significativos (no estados de carga)
        const significantKeys = [
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
          significantKeys.includes(key)
        );

        if (hasSignificantChanges) {
          saveState(newState);
        }

        return newState;
      });
    },
    [saveState]
  );

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
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setState({
        persona: null,
        historiaAcademica: null,
        recomendaciones: [],
        planes: [],
        criterioOrden: "CORRELATIVAS",
        planSeleccionado: "",
        personaId: null,
        lastFetch: null,
        lastUpdate: null,
        isInitialized: true,
        loadingPersona: true,
        loadingRecomendaciones: false,
        loadingPlanes: false,
        uploading: false,
        error: null,
        success: null,
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

      return now - lastUpdate > maxAge;
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
  };
}
