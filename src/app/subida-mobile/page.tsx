"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import historiaAcademicaService from "@/services/historiaAcademicaService";

export default function SubidaMobile() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const personaId = searchParams.get("personaId");
  const plan = searchParams.get("plan");
  const isUpdate = searchParams.get("actualizar") === "true";

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    if (!personaId || !plan) {
      setError("Faltan parámetros obligatorios.");
    }
  }, [personaId, plan]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
        ? historiaAcademicaService.cargarHistoriaAcademica
        : historiaAcademicaService.cargarHistoriaAcademica;

      // Aseguramos que personaId y plan existen antes de llamar (aunque el useEffect ya valida)
      if (!personaId || !plan) throw new Error("Datos faltantes");

      const resultado = await method(file, parseInt(personaId), plan);

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-background dark:to-muted/20 p-6 flex flex-col justify-center items-center text-center space-y-4">
      <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-400">
        {isUpdate
          ? "Actualizar Historia Académica"
          : "Cargar Historia Académica"}
      </h1>

      {!personaId || !plan ? (
        <p className="text-destructive text-sm">Faltan datos en la URL.</p>
      ) : (
        <>
          <input
            type="file"
            accept=".pdf,.xls,.xlsx"
            onChange={handleChange}
            disabled={subiendo}
            className="
              block w-full max-w-xs 
              border border-input rounded px-3 py-2 text-sm 
              text-foreground bg-background shadow-sm
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900/30 dark:file:text-blue-300
            "
          />
          {subiendo && (
            <p className="text-blue-500 dark:text-blue-400 text-sm animate-pulse">
              Subiendo archivo...
            </p>
          )}
          {mensaje && (
            <p className="text-green-600 dark:text-green-400 text-sm whitespace-pre-wrap">
              {mensaje}
            </p>
          )}
          {error && (
            <p className="text-destructive text-sm whitespace-pre-wrap">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-6">
            Serás redirigido automáticamente luego de subir el archivo.
          </p>
        </>
      )}
    </main>
  );
}
