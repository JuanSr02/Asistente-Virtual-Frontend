import { useState, useEffect } from "react";

export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch (err) {
      console.warn(`Error leyendo ${key} de sessionStorage`, err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn(`Error escribiendo ${key} en sessionStorage`, err);
    }
  }, [key, state]);

  return [state, setState];
}
