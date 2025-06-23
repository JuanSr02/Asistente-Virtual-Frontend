"use client"

import { useState } from "react"

/**
 * Hook personalizado para manejar estado persistente con sessionStorage
 * @param {string} key - Clave para sessionStorage
 * @param {any} defaultValue - Valor por defecto
 * @returns {[any, function]} - [valor, setter]
 */
export function usePersistentState(key, defaultValue) {
  const isClient = typeof window !== "undefined"

  const [state, setState] = useState(() => {
    if (!isClient) return defaultValue

    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch (err) {
      console.warn(`⚠️ Error al leer "${key}" desde sessionStorage:`, err)
      return defaultValue
    }
  })

  const setValue = (value) => {
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
 * @param {string} namespace - Prefijo de clave para sessionStorage
 * @param {object} defaultValues - Objeto con los valores iniciales
 * @returns {[object, function, function]} - [estado, setter, clear]
 */
export function usePersistentStateGroup(namespace, defaultValues) {
  const isClient = typeof window !== "undefined"

  const [states, setStates] = useState(() => {
    if (!isClient) return defaultValues

    const loaded = {}

    for (const key of Object.keys(defaultValues)) {
      try {
        const stored = sessionStorage.getItem(`${namespace}_${key}`)
        loaded[key] = stored !== null ? JSON.parse(stored) : defaultValues[key]
      } catch (err) {
        console.warn(`⚠️ Error al leer "${namespace}_${key}" desde sessionStorage:`, err)
        loaded[key] = defaultValues[key]
      }
    }

    return loaded
  })

  const setGroupState = (key, value) => {
    try {
      const newValue = value instanceof Function ? value(states[key]) : value

      setStates((prev) => ({
        ...prev,
        [key]: newValue,
      }))

      if (isClient) {
        sessionStorage.setItem(`${namespace}_${key}`, JSON.stringify(newValue))
      }
    } catch (err) {
      console.warn(`⚠️ Error al guardar "${namespace}_${key}" en sessionStorage:`, err)
    }
  }

  const clearGroupState = () => {
    if (isClient) {
      for (const key of Object.keys(defaultValues)) {
        sessionStorage.removeItem(`${namespace}_${key}`)
      }
    }

    setStates(defaultValues)
  }

  return [states, setGroupState, clearGroupState]
}
