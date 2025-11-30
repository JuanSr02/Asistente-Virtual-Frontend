"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import planesEstudioService from "@/services/planesEstudioService";
import { APP_CONFIG } from "@/lib/config";
import { TableSkeleton } from "@/components/Skeleton";
import MateriasModal from "@/components/modals/MateriasModal";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import {
  Upload,
  RefreshCw,
  BookOpen,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Interfaces
interface Plan {
  codigo: string;
  propuesta: string;
  cantidadMaterias: number;
}

const DATA_FRESHNESS_THRESHOLD = 5 * 60 * 1000;

export default function PlanesEstudio() {
  const { planesState, setPlanesState } = useSessionPersistence();

  const [planes, setPlanes] = useState<Plan[]>(planesState.planes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    planesState.selectedPlan || null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showMateriasModal, setShowMateriasModal] = useState(
    planesState.showMateriasModal || false
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (planesState.planes) setPlanes(planesState.planes);
    setSelectedPlan(planesState.selectedPlan || null);
    setShowMateriasModal(planesState.showMateriasModal || false);
  }, [planesState]);

  const shouldRefreshData = () => {
    if (!planesState.lastFetch) return true;
    const lastFetchTime = new Date(planesState.lastFetch).getTime();
    return Date.now() - lastFetchTime > DATA_FRESHNESS_THRESHOLD;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (planesState.planes.length === 0 || shouldRefreshData()) {
        await cargarPlanes();
      }
    };
    loadInitialData();
  }, []);

  const cargarPlanes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await planesEstudioService.obtenerPlanes();
      setPlanes(data);
      setPlanesState("planes", data);
      setPlanesState("lastFetch", new Date().toISOString());
      if (
        planesState.selectedPlan &&
        !data.some(
          (plan: Plan) => plan.codigo === planesState.selectedPlan.codigo
        )
      ) {
        setSelectedPlan(null);
        setPlanesState("selectedPlan", null);
      }
    } catch (err) {
      console.error("Error al cargar planes:", err);
      setError("No se pudieron cargar los planes de estudio.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    const newSelectedPlan = plan.codigo === selectedPlan?.codigo ? null : plan;
    setSelectedPlan(newSelectedPlan);
    setPlanesState("selectedPlan", newSelectedPlan);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    if (!APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError(
        `Tipo de archivo no permitido. Use: ${APP_CONFIG.FILES.ALLOWED_EXTENSIONS.join(", ")}`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    setError(null);
    setUploadSuccess(null);
    try {
      const resultado = await planesEstudioService.cargarPlan(file);
      setUploadSuccess(
        `Plan cargado: ${resultado.propuesta} (${resultado.cantidadMateriasCargadas} materias)`
      );
      await cargarPlanes();
      setPlanesState("lastUpdate", new Date().toISOString());
    } catch (err) {
      console.error("Error al cargar archivo:", err);
      setError("Error al cargar el plan. Verifique el formato del archivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    if (
      !window.confirm(
        `¿Está seguro que desea eliminar el plan ${selectedPlan.propuesta}?`
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      await planesEstudioService.eliminarPlan(selectedPlan.codigo);
      setSelectedPlan(null);
      setPlanesState("selectedPlan", null);
      await cargarPlanes();
      setUploadSuccess("Plan de estudio eliminado correctamente.");
      setPlanesState("lastUpdate", new Date().toISOString());
    } catch (err) {
      console.error("Error al eliminar plan:", err);
      setError("No se pudo eliminar el plan de estudio.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerMaterias = () => {
    if (!selectedPlan) return;
    setShowMateriasModal(true);
    setPlanesState("showMateriasModal", true);
  };

  const handleCloseMateriasModal = () => {
    setShowMateriasModal(false);
    setPlanesState("showMateriasModal", false);
  };

  return (
    <Card className="w-full shadow-lg border border-gray-200 dark:border-gray-800">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Planes de Estudio
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Administra los planes de estudio cargados en el sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* --- BARRA DE ACCIONES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between lg:items-end gap-4 p-4 bg-muted border border-border rounded-lg">
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xls,.xlsx"
              className="hidden"
              disabled={uploading}
            />
            <Button
              asChild
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white"
              disabled={uploading}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Cargando..." : "Cargar Plan"}
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Formatos permitidos: XLS, XLSX
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={cargarPlanes}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white border-0"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleVerMaterias}
              disabled={!selectedPlan}
              className="w-full sm:w-auto"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Ver Materias
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
              disabled={!selectedPlan || loading}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Plan
            </Button>
          </div>
        </div>

        {/* --- MENSAJES DE ESTADO --- */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-800 dark:text-red-300 p-4 rounded-r-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <strong className="font-semibold">Error</strong>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        {uploadSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 p-4 rounded-r-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 mt-0.5" />
            <div>
              <strong className="font-semibold">Éxito</strong>
              <p className="text-sm">{uploadSuccess}</p>
            </div>
          </div>
        )}

        {/* --- TABLA DE PLANES --- */}
        <div className="w-full overflow-x-auto rounded-lg border border-border">
          {loading ? (
            <TableSkeleton rows={5} columns={3} />
          ) : planes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="mx-auto text-6xl mb-4 text-gray-300 dark:text-gray-600" />
              <h4 className="text-xl text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                No hay planes de estudio
              </h4>
              <p className="text-sm text-muted-foreground">
                Cargue un archivo para comenzar a administrar los planes.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Propuesta
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Cant. Materias
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {planes.map((plan) => (
                  <tr
                    key={plan.codigo}
                    onClick={() => handleSelectPlan(plan)}
                    className={`cursor-pointer transition-colors duration-200 ${
                      selectedPlan?.codigo === plan.codigo
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">
                      {plan.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {plan.propuesta}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold ${
                          selectedPlan?.codigo === plan.codigo
                            ? "bg-blue-600 dark:bg-blue-700 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {plan.cantidadMaterias}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <MateriasModal
          isOpen={showMateriasModal}
          onClose={handleCloseMateriasModal}
          plan={selectedPlan}
        />
      </CardContent>
    </Card>
  );
}
