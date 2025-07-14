"use client";
import { useRef } from "react";

export default function SubirArchivo() {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) alert(`Archivo seleccionado: ${file.name}`);
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={() => fileInputRef.current?.click()}
      >
        Subir PDF
      </button>
    </div>
  );
}
