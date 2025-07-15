"use client";
import { useRef, useState } from "react";
import historiaAcademicaService from "@/services/historiaAcademicaService";

export default function SubirArchivo({ personaId, planSeleccionado }) {
  const fileInputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleFileChange = (e) => {
    alert("¡Archivo seleccionado! Ahora se procederá a subirlo.");
    const archivoOriginal = e.target.files?.[0];

    if (!archivoOriginal) {
      alert("No se seleccionó ningún archivo.");
      return;
    }

    // 💥 Clonamos el archivo sin usar await todavía
    const file = new File([archivoOriginal], archivoOriginal.name, {
      type: archivoOriginal.type,
    });

    //subirArchivo(file); // delegamos a una función async separada
  };

  

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <input
        type="file"
        accept=".pdf,.xls,.xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
        onInput={handleFileChange}
        className="absolute left-[-9999px]"
        style={{ display: "block" }}
        disabled={subiendo}
      />

      <button
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
          }
        }}
        disabled={subiendo}
      >
        {subiendo ? "Cargando..." : "Subir Historia Académica"}
      </button>

      {mensaje && (
        <div className="text-center text-sm text-blue-700 bg-blue-50 p-2 rounded">
          {mensaje}
        </div>
      )}
    </div>
  );
}
