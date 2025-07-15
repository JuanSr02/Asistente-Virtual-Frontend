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

      let texto =
        resultado?.mensaje ||
        `Historia académica ${isUpdate ? "actualizada" : "cargada"} exitosamente.`;

      if (resultado?.cantidadMateriasNuevas)
        texto += ` (${resultado.cantidadMateriasNuevas} materias nuevas)`;
      if (resultado?.cantidadMateriasActualizadas)
        texto += ` (${resultado.cantidadMateriasActualizadas} materias actualizadas)`;

      setMensaje(texto);

      setTimeout(() => {
        router.push("/"); // ✅ Redirige al home
      }, 3000);
    } catch (err) {
      console.error("❌ Error en subida:", err);
      setError("Hubo un error al subir el archivo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col justify-center items-center text-center space-y-4">
      <h1 className="text-2xl font-bold text-blue-800">
        {isUpdate
          ? "Actualizar Historia Académica"
          : "Cargar Historia Académica"}
      </h1>

      {!personaId || !plan ? (
        <p className="text-red-600 text-sm">Faltan datos en la URL.</p>
      ) : (
        <>
          <input
            type="file"
            accept=".pdf,.xls,.xlsx"
            onChange={handleChange}
            disabled={subiendo}
            className="block w-full max-w-xs border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white shadow-sm"
          />
          {subiendo && (
            <p className="text-blue-500 text-sm animate-pulse">
              Subiendo archivo...
            </p>
          )}
          {mensaje && (
            <p className="text-green-600 text-sm whitespace-pre-wrap">
              {mensaje}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
          )}
          <p className="text-xs text-gray-500 mt-6">
            Serás redirigido automáticamente luego de subir el archivo.
          </p>
        </>
      )}
    </main>
  );
}
