"use client";
import { useRef } from "react";

export default function SubirArchivo() {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Archivo seleccionado: ${file.name}`);
      // Aquí podrías llamar a tu función de subida
    } else {
      alert("No se seleccionó ningún archivo.");
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept=".pdf,.xls,.xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="absolute left-[-9999px]" // no display:none
        style={{ display: "block" }} // importante para mobile
      />
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // reset
            fileInputRef.current.click();
          }
        }}
      >
        Subir Archivo
      </button>
    </div>
  );
}
