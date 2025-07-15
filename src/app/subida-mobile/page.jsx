"use client";
import { useState } from "react";
import historiaAcademicaService from "@/services/historiaAcademicaService";

export default function SubidaMobile() {
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("No se seleccionó ningún archivo.");
      return;
    }

    setSubiendo(true);
    setError(null);
    setMensaje(null);

    try {
      const resultado = await historiaAcademicaService.cargarHistoriaAcademica(
        file,
        2, // 👈 ID de prueba o del usuario logueado si lo pasás como prop/query
        "26/12" // 👈 Plan de prueba
      );

      setMensaje("Historia académica cargada con éxito.");
    } catch (err) {
      console.error(err);
      setError("Error al subir el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontWeight: "bold", marginBottom: 10 }}>
        Subir Historia Académica (modo móvil)
      </h1>
      <input
        type="file"
        accept=".pdf,.xls,.xlsx"
        onChange={handleChange}
        disabled={subiendo}
        style={{
          display: "block",
          marginBottom: 20,
          border: "1px solid gray",
          padding: 10,
          borderRadius: 5,
        }}
      />
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
