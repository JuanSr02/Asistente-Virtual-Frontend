"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import historiaAcademicaService from "@/services/historiaAcademicaService";

export default function SubidaMobile() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const personaId = searchParams.get("personaId");
  const plan = searchParams.get("plan");
  const isUpdate = searchParams.get("actualizar") === "true";

  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    if (!personaId || !plan) {
      setError("Faltan parámetros obligatorios.");
    }
  }, [personaId, plan]);

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
      const method = isUpdate
        ? historiaAcademicaService.actualizarHistoriaAcademica
        : historiaAcademicaService.cargarHistoriaAcademica;

      const resultado = await method(file, personaId, plan);

      if (resultado?.mensaje) {
        let texto = `Historia ${isUpdate ? "actualizada" : "cargada"}: ${resultado.mensaje}`;
        if (resultado.cantidadMateriasNuevas)
          texto += ` (${resultado.cantidadMateriasNuevas} materias nuevas)`;
        if (resultado.cantidadMateriasActualizadas)
          texto += ` (${resultado.cantidadMateriasActualizadas} materias actualizadas)`;
        setMensaje(texto);
      } else {
        setMensaje(
          `Historia académica ${isUpdate ? "actualizada" : "cargada"} exitosamente.`
        );
      }

      // Podés redirigir si querés:
      // setTimeout(() => router.push("/recomendacion"), 3000);
    } catch (err) {
      console.error("❌ Error en subida:", err);
      setError("Hubo un error al subir el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4 bg-white min-h-screen">
      <h1 className="text-xl font-semibold text-center">
        {isUpdate
          ? "Actualizar Historia Académica"
          : "Cargar Historia Académica"}
      </h1>

      {!personaId || !plan ? (
        <p className="text-red-600">Error: falta personaId o plan</p>
      ) : (
        <>
          <input
            type="file"
            accept=".pdf,.xls,.xlsx"
            onChange={handleChange}
            disabled={subiendo}
            className="block w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700"
          />
          {subiendo && (
            <p className="text-blue-500 text-sm">Subiendo archivo...</p>
          )}
          {mensaje && (
            <p className="text-green-600 text-sm whitespace-pre-wrap">
              {mensaje}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
          )}
        </>
      )}
    </main>
  );
}
