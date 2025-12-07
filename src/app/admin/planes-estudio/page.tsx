"use client";

import { useState, useRef } from "react";
import { usePlanesEstudio } from "@/hooks/domain/usePlanesEstudio";
import { APP_CONFIG } from "@/lib/config";
import { TableSkeleton } from "@/components/Skeleton";
import MateriasModal from "@/components/modals/MateriasModal";
import { PlanEstudio } from "@/services/planesEstudioService";
import { useModal } from "@/stores/modal-store";
import { useConfirm } from "@/components/providers/confirm-dialog-provider";
import {
  Upload,
  BookOpen,
  Trash2,
  Loader2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PlanesEstudio() {
  const {
    planes,
    isLoading,
    isError,
    uploadPlan,
    isUploading,
    deletePlan,
    isDeleting,
  } = usePlanesEstudio();

  // Estados locales para selección
  const [selectedPlan, setSelectedPlan] = useState<PlanEstudio | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks de UI Global
  const {
    isOpen: showMateriasModal,
    openModal: openMateriasModal,
    closeModal: closeMateriasModal,
  } = useModal("admin-materias-modal");

  const { confirm } = useConfirm();

  const handleSelectPlan = (plan: PlanEstudio) => {
    setSelectedPlan((prev) => (prev?.codigo === plan.codigo ? null : plan));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
      toast.error("Formato no válido. Use .xls o .xlsx");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      await uploadPlan(file);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    const ok = await confirm({
      title: "¿Eliminar Plan de Estudio?",
      description: `Se eliminará el plan "${selectedPlan.propuesta}" y todas sus materias asociadas. Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      variant: "destructive",
    });

    if (!ok) return;

    try {
      await deletePlan(selectedPlan.codigo);
      setSelectedPlan(null);
    } catch (e) {
      // Error manejado en hook
    }
  };

  const handleVerMaterias = () => {
    if (!selectedPlan) return;
    openMateriasModal();
  };

  return (
    <Card className="w-full shadow-lg border border-border">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Planes de Estudio
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Administra los planes de estudio y sus materias.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Barra de Acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between lg:items-end gap-4 p-4 bg-muted/50 border border-border rounded-lg">
          <div className="relative w-full lg:w-auto">
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xls,.xlsx"
              className="hidden"
              disabled={isUploading}
            />
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              disabled={isUploading}
            >
              <label htmlFor="file-upload">
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Procesando..." : "Cargar Nuevo Plan"}
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center lg:text-left">
              Formatos: .xls, .xlsx
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
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
              disabled={!selectedPlan || isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <p>Error cargando los planes. Por favor recarga la página.</p>
          </div>
        )}

        {/* Tabla */}
        <div className="w-full overflow-x-auto rounded-lg border border-border">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={3} />
            </div>
          ) : planes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="mx-auto text-6xl mb-4 opacity-20" />
              <h4 className="text-lg font-semibold">
                No hay planes de estudio
              </h4>
              <p className="text-sm">Sube un archivo para comenzar.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Código</th>
                  <th className="px-4 py-3 text-left font-medium">Propuesta</th>
                  <th className="px-4 py-3 text-left font-medium">Materias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {planes.map((plan) => (
                  <tr
                    key={plan.codigo}
                    onClick={() => handleSelectPlan(plan)}
                    className={`cursor-pointer transition-colors ${
                      selectedPlan?.codigo === plan.codigo
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs sm:text-sm">
                      {plan.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium">{plan.propuesta}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          selectedPlan?.codigo === plan.codigo
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100"
                            : "bg-muted text-muted-foreground"
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
          onClose={closeMateriasModal}
          plan={selectedPlan}
        />
      </CardContent>
    </Card>
  );
}
