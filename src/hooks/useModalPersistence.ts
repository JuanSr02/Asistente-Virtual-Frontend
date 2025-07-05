"use client";

import { useState, useEffect, useCallback } from "react";

interface ModalState {
  isOpen: boolean;
  data: any;
  type: string | null;
  timestamp: number;
}

const defaultState: ModalState = {
  isOpen: false,
  data: null,
  type: null,
  timestamp: 0,
};

export function useModalPersistence(storageKey: string) {
  const [state, setState] = useState<ModalState>(defaultState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Verificar si el estado no es muy antiguo (5 minutos)
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutos

        if (parsedState.timestamp && now - parsedState.timestamp < maxAge) {
          setState(parsedState);
        } else {
          // Estado muy antiguo, limpiar
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error("Error al cargar estado del modal:", error);
      localStorage.removeItem(storageKey);
    } finally {
      setIsInitialized(true);
    }
  }, [storageKey]);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    if (isInitialized) {
      if (state.isOpen) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            ...state,
            timestamp: Date.now(),
          })
        );
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [state, storageKey, isInitialized]);

  const openModal = useCallback((data: any, type = "default") => {
    setState({
      isOpen: true,
      data,
      type,
      timestamp: Date.now(),
    });
  }, []);

  const closeModal = useCallback(() => {
    setState(defaultState);
  }, []);

  const updateModalData = useCallback((data: any) => {
    setState((prev) => ({
      ...prev,
      data,
      timestamp: Date.now(),
    }));
  }, []);

  const clearModal = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    isOpen: state.isOpen,
    data: state.data,
    type: state.type,
    openModal,
    closeModal,
    updateModalData,
    clearModal,
    isInitialized,
  };
}
