import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * Hook para persistir el estado de apertura del modal de confirmación en sessionStorage.
 * Retorna una tupla estrictamente tipada para evitar errores de "not callable" en el linter.
 */
export function useConfirmacionPersistence(
  storageKey: string = "modal-confirmacion"
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Cargar estado inicial
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved === "true") {
        setIsOpen(true);
      }
    } catch (e) {
      console.warn("Error cargando confirmación persistida", e);
    } finally {
      setInitialized(true);
    }
  }, [storageKey]);

  // Guardar en sessionStorage
  useEffect(() => {
    if (initialized) {
      try {
        if (isOpen) {
          sessionStorage.setItem(storageKey, "true");
        } else {
          sessionStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.warn("Error guardando confirmación persistida", e);
      }
    }
  }, [isOpen, initialized, storageKey]);

  return [isOpen, setIsOpen];
}