// hooks/useSessionPersistence.ts
import { useEffect } from "react";

export function useEstadisticasPersistence<T>(
  key: string,
  value: T,
  setValue: (value: T) => void
) {
  // Cargar al montar
  useEffect(() => {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setValue(parsed);
      } catch (err) {
        console.warn(`Error leyendo ${key} de sessionStorage`, err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar en sessionStorage cuando cambie
  useEffect(() => {
    if (value !== null && value !== undefined) {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);
}
