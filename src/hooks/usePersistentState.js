"use client"

import { useState } from "react"

/**
 * Hook personalizado para manejar estado persistente con sessionStorage
 * @param {string} key - Clave para sessionStorage
 * @param {any} defaultValue - Valor por defecto
 * @returns {[any, function]} - [valor, setter]
 */
export function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultValue

    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error loading ${key} from sessionStorage:`, error)
      return defaultValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)

      if (typeof window !== "undefined") {
        sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error saving ${key} to sessionStorage:`, error)
    }
  }

  return [state, setValue]
}

/**
 * Hook para manejar múltiples estados persistentes relacionados con sessionStorage
 * @param {string} namespace - Namespace para agrupar las claves
 * @param {object} defaultValues - Objeto con valores por defecto
 * @returns {[object, function, function]} - [estados, setter, clear]
 */
export function usePersistentStateGroup(namespace, defaultValues) {
  const [states, setStates] = useState(() => {
    if (typeof window === "undefined") return defaultValues

    const savedStates = {}
    Object.keys(defaultValues).forEach((key) => {
      try {
        const item = sessionStorage.getItem(`${namespace}_${key}`)
        savedStates[key] = item ? JSON.parse(item) : defaultValues[key]
      } catch (error) {
        console.warn(`Error loading ${namespace}_${key} from sessionStorage:`, error)
        savedStates[key] = defaultValues[key]
      }
    })
    return savedStates
  })

  const setGroupState = (key, value) => {
    try {
      const valueToStore = value instanceof Function ? value(states[key]) : value

      setStates((prev) => ({
        ...prev,
        [key]: valueToStore,
      }))

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`${namespace}_${key}`, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error saving ${namespace}_${key} to sessionStorage:`, error)
    }
  }

  const clearGroupState = () => {
    Object.keys(defaultValues).forEach((key) => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`${namespace}_${key}`)
      }
    })
    setStates(defaultValues)
  }

  return [states, setGroupState, clearGroupState]
}
