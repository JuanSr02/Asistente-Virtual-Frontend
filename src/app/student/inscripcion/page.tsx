"use client";

import { useState } from "react";
import { type User } from "@supabase/supabase-js";
import { usePersona } from "@/hooks/domain/usePersona";
import { useInscripciones } from "@/hooks/domain/useInscripciones";
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { useModalPersistence } from "@/hooks/useModalPersistence"; // Recuperado
import inscripcionService from "@/services/inscripcionService"; // Necesario para consultar inscriptos
import { MateriasDisponibles } from "@/components/student/inscripcion/MateriasDisponibles";
import { MisInscripciones } from "@/components/student/inscripcion/MisInscripciones";
import Modal from "@/components/modals/Modal"; // Recuperado
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Pencil,
  ClipboardCopy,
} from "lucide-react";
import { toast } from "sonner";

export default function Inscripcion({ user }: { user: User }) {
  // 1. Datos del usuario y dominio
  const { data: persona, isLoading: isLoadingPersona } = usePersona(
    user.id,
    user.email
  );
  const { historia, isLoadingHistoria } = useHistoriaAcademica(persona?.id);
  const {
    materiasDisponibles,
    misInscripciones,
    isLoadingData,
    inscribirse,
    isInscribiendo,
    darseDeBaja,
    isDandoseDeBaja,
  } = useInscripciones(persona?.id, !!historia);

  // 2. Estado local de selección
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<any | null>(
    null
  );
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string>("");

  // 3. Lógica del Modal de Inscriptos (RECUPERADA)
  const {
    isOpen: showInscriptos,
    data: inscripcionConsultada,
    openModal: openInscriptosModal,
    closeModal: closeInscriptosModal,
  } = useModalPersistence("inscriptos-modal");

  const [inscriptosConsulta, setInscriptosConsulta] = useState<any[]>([]);
  const [loadingInscriptos, setLoadingInscriptos] = useState(false);

  // Helpers
  const mesas = [
    "FEBRERO",
    "MARZO",
    "JULIO",
    "AGOSTO",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  const calcularAnio = (mesa: string) => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const mesMesa =
      {
        FEBRERO: 2,
        MARZO: 3,
        JULIO: 7,
        AGOSTO: 8,
        NOVIEMBRE: 11,
        DICIEMBRE: 12,
      }[mesa] || 12;
    return mesMesa < mesActual ? hoy.getFullYear() + 1 : hoy.getFullYear();
  };

  // --- FUNCIONES FALTANTES ---

  const consultarInscriptos = async (inscripcion: any) => {
    openInscriptosModal(inscripcion);
    setLoadingInscriptos(true);
    setInscriptosConsulta([]); // Limpiar anteriores
    try {
      const inscriptos = await inscripcionService.obtenerInscriptosConEmails(
        inscripcion.materiaCodigo,
        inscripcion.anio,
        inscripcion.turno
      );
      setInscriptosConsulta(inscriptos || []);
    } catch (err) {
      toast.error("Error al cargar inscriptos.");
    } finally {
      setLoadingInscriptos(false);
    }
  };

  const copiarEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success(`Email copiado: ${email}`);
    } catch (err) {
      toast.error("No se pudo copiar el email.");
    }
  };

  const handleInscribirse = async () => {
    if (!materiaSeleccionada || !mesaSeleccionada || !historia || !persona)
      return;

    try {
      await inscribirse({
        turno: mesaSeleccionada,
        anio: calcularAnio(mesaSeleccionada),
        materiaCodigo: materiaSeleccionada.codigo,
        materiaPlan: historia.plan_de_estudio_codigo,
        estudianteId: persona.id,
      });
      setMateriaSeleccionada(null);
      setMesaSeleccionada("");
    } catch (error) {
      // Error manejado en hook
    }
  };

  // --- RENDERS ---

  if (isLoadingPersona || isLoadingHistoria || (historia && isLoadingData)) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (!historia) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold">Falta Historia Académica</h3>
        <p className="text-muted-foreground mb-4">
          Debes cargar tu historia académica en la sección "Sugerencias" para
          poder inscribirte.
        </p>
        <Button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("changeTab", { detail: "recomendacion" })
            )
          }
        >
          Ir a Cargar Historia
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950/30 dark:via-background dark:to-blue-950/30 border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
            <Pencil className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Inscripción a Mesas de Examen
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Inscríbete para contactar con compañeros. Esta inscripción es
            independiente del SIU Guaraní.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <MateriasDisponibles
          materias={materiasDisponibles}
          onSelect={setMateriaSeleccionada}
          seleccionada={materiaSeleccionada}
        />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Confirmar Mesa</CardTitle>
              <CardDescription>
                {materiaSeleccionada ? (
                  <span className="font-semibold text-primary">
                    Para: {materiaSeleccionada.nombre}
                  </span>
                ) : (
                  "Selecciona una materia de la lista primero"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={mesaSeleccionada}
                onValueChange={setMesaSeleccionada}
                disabled={!materiaSeleccionada}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un turno" />
                </SelectTrigger>
                <SelectContent>
                  {mesas.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m} {calcularAnio(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="w-full"
                disabled={
                  !materiaSeleccionada || !mesaSeleccionada || isInscribiendo
                }
                onClick={handleInscribirse}
              >
                {isInscribiendo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Confirmar Inscripción
              </Button>
            </CardContent>
          </Card>

          <MisInscripciones
            inscripciones={misInscripciones}
            onBaja={darseDeBaja}
            onVer={consultarInscriptos} // ¡Ahora sí existe!
            isProcessing={isDandoseDeBaja}
          />
        </div>
      </div>

      {/* --- MODAL DE INSCRIPTOS --- */}
      <Modal
        isOpen={showInscriptos}
        onClose={closeInscriptosModal}
        title={`Inscriptos a ${
          inscripcionConsultada?.materiaNombre || "la materia"
        }`}
      >
        {inscripcionConsultada && (
          <p className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md mb-4 text-sm">
            Mesa: {inscripcionConsultada.turno} {inscripcionConsultada.anio}
          </p>
        )}
        <div className="max-h-96 overflow-y-auto pr-2">
          {loadingInscriptos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 dark:text-blue-400" />
            </div>
          ) : inscriptosConsulta.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay otros inscriptos.
            </p>
          ) : (
            <div className="space-y-2">
              {inscriptosConsulta.map((i) => (
                <div
                  key={i.id}
                  className="p-3 border rounded-md flex justify-between items-center"
                >
                  <p className="font-medium">
                    {i.estudianteNombre}{" "}
                    {i.estudianteId === persona?.id && (
                      <span className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        (Tú)
                      </span>
                    )}
                  </p>
                  {i.email && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => i.email && copiarEmail(i.email)}
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      Copiar Email
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
