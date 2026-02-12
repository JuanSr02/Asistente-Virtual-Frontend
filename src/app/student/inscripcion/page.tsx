"use client";

import { useState, useEffect } from "react";
import { type User } from "@supabase/supabase-js";
import { usePersona } from "@/hooks/domain/usePersona";
import { useInscripciones } from "@/hooks/domain/useInscripciones";
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { useModal } from "@/stores/modal-store";
import { useConfirm } from "@/components/providers/confirm-dialog-provider";
import inscripcionService from "@/services/inscripcionService";
import { MateriasDisponibles } from "@/components/student/inscripcion/MateriasDisponibles";
import { useUIStore } from "@/stores/ui-store";
import { MisInscripciones } from "@/components/student/inscripcion/MisInscripciones";
import Modal from "@/components/modals/Modal";
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
  Pencil,
  ClipboardCopy,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

// Type definitions for exam sessions (mesas)
type Mesa =
  | "FEBRERO"
  | "MARZO"
  | "JULIO"
  | "AGOSTO"
  | "NOVIEMBRE"
  | "DICIEMBRE";

const MESES_MAP: Record<Mesa, number> = {
  FEBRERO: 2,
  MARZO: 3,
  JULIO: 7,
  AGOSTO: 8,
  NOVIEMBRE: 11,
  DICIEMBRE: 12,
};

export default function Inscripcion({ user }: { user: User }) {
  const { data: persona, isLoading: isLoadingPersona } = usePersona(
    user.id,
    user.email,
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

  const { inscripcionParams, setInscripcionParams } = useUIStore();

  const [materiaSeleccionada, setMateriaSeleccionada] = useState<any | null>(
    null,
  );
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | "">("");
  const [showConfirmacionAlta, setShowConfirmacionAlta] = useState(false); // Local para el alta

  // Efecto para auto-seleccionar materia desde recomendación
  useEffect(() => {
    if (inscripcionParams && materiasDisponibles.length > 0) {
      const materia = materiasDisponibles.find(
        (m) => m.codigo === inscripcionParams.materiaCodigo,
      );
      if (materia) {
        setMateriaSeleccionada(materia);
        // Limpiamos para no re-seleccionar si el usuario cambia manualmente y luego vuelve
        setInscripcionParams(null);
      }
    }
  }, [inscripcionParams, materiasDisponibles, setInscripcionParams]);

  // Hooks Globales
  const {
    isOpen: showInscriptos,
    data: inscripcionConsultada,
    openModal: openInscriptosModal,
    closeModal: closeInscriptosModal,
  } = useModal("inscriptos-modal");

  const { confirm } = useConfirm();

  const [inscriptosConsulta, setInscriptosConsulta] = useState<any[]>([]);
  const [loadingInscriptos, setLoadingInscriptos] = useState(false);

  const mesas: Mesa[] = [
    "FEBRERO",
    "MARZO",
    "JULIO",
    "AGOSTO",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  const calcularAnio = (mesa: Mesa | string) => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const mesMesa = mesa in MESES_MAP ? MESES_MAP[mesa as Mesa] : 12;
    return mesMesa < mesActual ? hoy.getFullYear() + 1 : hoy.getFullYear();
  };

  // Filtrar inscripciones cuya fecha ya pasó (para no mostrarlas, pero no eliminarlas de BD)
  const filtrarInscripcionesActivas = (inscripciones: any[]) => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1; // 1-12
    const anioActual = hoy.getFullYear();

    return inscripciones.filter((ins) => {
      const turno = ins.turno as string;
      const mesMesa = turno in MESES_MAP ? MESES_MAP[turno as Mesa] : 12;

      const anioMesa = ins.anio;

      // Si el año de la mesa es menor al actual, está pasada
      if (anioMesa < anioActual) return false;

      // Si es del mismo año, verificar el mes
      if (anioMesa === anioActual && mesMesa < mesActual) return false;

      // En cualquier otro caso, la inscripción está vigente
      return true;
    });
  };

  const consultarInscriptos = async (inscripcion: any) => {
    openInscriptosModal(inscripcion); // Abrir con store
    setLoadingInscriptos(true);
    setInscriptosConsulta([]);
    try {
      const inscriptos = await inscripcionService.obtenerInscriptos(
        inscripcion.materiaCodigo,
        inscripcion.anio,
        inscripcion.turno,
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
      setShowConfirmacionAlta(false);
    } catch (error) {}
  };

  const handleBaja = async (id: number) => {
    // Confirmación Global
    const ok = await confirm({
      title: "¿Anular Inscripción?",
      description: "Perderás tu lugar en la mesa. Esta acción es irreversible.",
      confirmText: "Sí, anular",
      variant: "destructive",
    });

    if (ok) {
      darseDeBaja(id);
    }
  };

  if (isLoadingPersona || isLoadingHistoria || (historia && isLoadingData)) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (!historia) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold">Falta Historia Académica</h3>
        <p className="text-muted-foreground mb-4">
          Debes cargar tu historia académica en la sección "Sugerencias".
        </p>
        <Button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("changeTab", { detail: "recomendacion" }),
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
            Inscríbete para contactar con compañeros. Independiente del SIU.
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
                  "Selecciona una materia primero"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={mesaSeleccionada}
                onValueChange={(value) =>
                  setMesaSeleccionada(value as Mesa | "")
                }
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
                onClick={() => setShowConfirmacionAlta(true)}
              >
                {isInscribiendo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Inscribirse
              </Button>
            </CardContent>
          </Card>

          <MisInscripciones
            inscripciones={filtrarInscripcionesActivas(misInscripciones)}
            onBaja={handleBaja} // Usamos el handler con confirmación
            onVer={consultarInscriptos}
            isProcessing={isDandoseDeBaja}
          />
        </div>
      </div>

      {/* Modal Confirmación Alta (Local por contenido complejo) */}
      {showConfirmacionAlta && (
        <Modal
          isOpen={showConfirmacionAlta}
          onClose={() => setShowConfirmacionAlta(false)}
          title="Confirmar Inscripción"
        >
          <div className="space-y-4">
            <div>
              <p className="font-medium">Materia:</p>
              <p>{materiaSeleccionada?.nombre}</p>
            </div>
            <div>
              <p className="font-medium">Mesa:</p>
              <p>
                {mesaSeleccionada} {calcularAnio(mesaSeleccionada)}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
              Se notificará a otros estudiantes inscriptos.
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleInscribirse}
              disabled={isInscribiendo}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isInscribiendo ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Confirmar"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfirmacionAlta(false)}
              disabled={isInscribiendo}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal Inscriptos (Global) */}
      <Modal
        isOpen={showInscriptos}
        onClose={closeInscriptosModal}
        title={`Inscriptos a ${inscripcionConsultada?.materiaNombre || "la materia"}`}
      >
        {inscripcionConsultada && (
          <p className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md mb-4 text-sm">
            Mesa: {inscripcionConsultada.turno} {inscripcionConsultada.anio}
          </p>
        )}
        <div className="max-h-96 overflow-y-auto pr-2">
          {loadingInscriptos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
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
                      <span className="text-xs font-normal text-blue-600">
                        (Tú)
                      </span>
                    )}
                  </p>
                  {i.estudianteEmail && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        i.estudianteEmail && copiarEmail(i.estudianteEmail)
                      }
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" /> Copiar
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
