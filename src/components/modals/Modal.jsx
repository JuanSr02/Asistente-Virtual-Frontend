"use client"

import { useEffect, useRef, memo } from "react"

const Modal = memo(function Modal({ isOpen, onClose, title, children, maxWidth = "32rem" }) {
  const modalRef = useRef(null)

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden"
      // Asegurar que el modal cubra toda la pantalla
      document.documentElement.style.overflow = "hidden"
      // Agregar clase para evitar problemas de scroll
      document.body.classList.add("modal-open")
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
      document.documentElement.style.overflow = "unset"
      document.body.classList.remove("modal-open")
    }
  }, [isOpen, onClose])

  // Enfocar modal al abrir
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: "1rem",
      }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-h-[85vh] flex flex-col shadow-2xl outline-none relative"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 relative">
          <h3 className="text-xl font-semibold text-gray-800 m-0 pr-8">{title}</h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="Cerrar modal"
            style={{ zIndex: 10 }}
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  )
})

export default Modal
