"use client"

import { useEffect } from "react"

export default function Modal({ isOpen, onClose, title, children, maxWidth = "32rem" }) {
  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-h-[80vh] flex flex-col shadow-2xl"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 m-0">{title}</h3>
          <button
            className="text-gray-500 hover:bg-gray-100 p-1 rounded transition-colors text-2xl leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  )
}
