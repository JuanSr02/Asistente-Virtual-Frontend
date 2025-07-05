import { useEffect, useState } from "react";

export function useConfirmacionPersistence(storageKey = "modal-confirmacion") {
  const [isOpen, setIsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
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
      if (isOpen) {
        sessionStorage.setItem(storageKey, "true");
      } else {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [isOpen, initialized, storageKey]);

  return [isOpen, setIsOpen];
}
