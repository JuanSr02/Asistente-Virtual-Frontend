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
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-h-[80vh] flex flex-col shadow-2xl outline-none"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 m-0">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded transition-colors text-2xl leading-none"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
})

export default Modal
