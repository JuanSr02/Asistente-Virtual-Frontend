"use client"

import { useState } from "react"

/**
 * Hook personalizado para manejar estado persistente con sessionStorage
 * @template T - Tipo del valor almacenado
 * @param {string} key - Clave para sessionStorage
 * @param {T} defaultValue - Valor por defecto
 * @returns {[T, (value: T | ((prevState: T) => T)) => void]} - Tupla con el valor y función setter
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prevState: T) => T)) => void] {
  const isClient = typeof window !== "undefined"

  const [state, setState] = useState<T>(() => {
    if (!isClient) return defaultValue

    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch (err) {
      console.warn(`⚠️ Error al leer "${key}" desde sessionStorage:`, err)
      return defaultValue
    }
  })

  const setValue = (value: T | ((prevState: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(state) : value
      setState(newValue)

      if (isClient) {
        sessionStorage.setItem(key, JSON.stringify(newValue))
      }
    } catch (err) {
      console.warn(`⚠️ Error al guardar "${key}" en sessionStorage:`, err)
    }
  }

  return [state, setValue]
}

/**
 * Hook para manejar múltiples estados persistentes relacionados con sessionStorage
 * @template T - Tipo del objeto de valores
 * @param {string} namespace - Prefijo de clave para sessionStorage
 * @param {T} defaultValues - Objeto con los valores iniciales
 * @returns {[
 *   T,
 *   <K extends keyof T>(key: K, value: T[K] | ((prevState: T[K]) => T[K])) => void,
 *   () => void
 * ]} - [estado, setter, clear]
 */
export function usePersistentStateGroup<T extends Record<string, any>>(
  namespace: string,
  defaultValues: T
): [
  T,
  <K extends keyof T>(key: K, value: T[K] | ((prevState: T[K]) => T[K])) => void,
  () => void
] {
  const isClient = typeof window !== "undefined"

  const [states, setStates] = useState<T>(() => {
    if (!isClient) return defaultValues

    const loaded = {} as T

    for (const key of Object.keys(defaultValues) as Array<keyof T>) {
      try {
        const stored = sessionStorage.getItem(`${namespace}_${String(key)}`)
        loaded[key] = stored !== null ? JSON.parse(stored) : defaultValues[key]
      } catch (err) {
        console.warn(`⚠️ Error al leer "${namespace}_${String(key)}" desde sessionStorage:`, err)
        loaded[key] = defaultValues[key]
      }
    }

    return loaded
  })

  const setGroupState = <K extends keyof T>(
    key: K,
    value: T[K] | ((prevState: T[K]) => T[K])
  ) => {
    try {
      const newValue = value instanceof Function ? value(states[key]) : value

      setStates((prev) => ({
        ...prev,
        [key]: newValue,
      }))

      if (isClient) {
        sessionStorage.setItem(`${namespace}_${String(key)}`, JSON.stringify(newValue))
      }
    } catch (err) {
      console.warn(`⚠️ Error al guardar "${namespace}_${String(key)}" en sessionStorage:`, err)
    }
  }

  const clearGroupState = () => {
    if (isClient) {
      for (const key of Object.keys(defaultValues) as Array<keyof T>) {
        sessionStorage.removeItem(`${namespace}_${String(key)}`)
      }
    }

    setStates(defaultValues)
  }

  return [states, setGroupState, clearGroupState]
}