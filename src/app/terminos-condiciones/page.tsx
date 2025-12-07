import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollText, ArrowLeft } from "lucide-react";

export default function TerminosCondiciones() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Button
          variant="ghost"
          asChild
          className="gap-2 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg border-t-4 border-t-blue-600 dark:border-t-blue-500">
        <CardHeader className="pb-4 border-b mb-6">
          <div className="flex items-center gap-3">
            <ScrollText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-3xl font-bold text-foreground">
              Términos y Condiciones de Uso
            </CardTitle>
          </div>
          <p className="text-muted-foreground mt-2">
            Última actualización: Diciembre 2025
          </p>
        </CardHeader>
        <CardContent className="space-y-8 text-justify leading-relaxed">
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              1. Introducción
            </h3>
            <p className="text-muted-foreground">
              Bienvenido al{" "}
              <strong className="text-foreground">
                Asistente Virtual de Soporte Académico
              </strong>
              . Al acceder y utilizar este sistema, usted acepta cumplir con los
              presentes Términos y Condiciones.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              2. Naturaleza del Servicio
            </h3>
            <p className="text-muted-foreground mb-2">
              El Sistema es una herramienta de apoyo y orientación.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">2.1 No Oficialidad:</strong>{" "}
                Este sistema NO reemplaza al sistema oficial (SIU Guaraní).
              </li>
              <li>
                <strong className="text-foreground">
                  2.2 Carácter Informativo:
                </strong>{" "}
                Las sugerencias son estimaciones. Es responsabilidad del usuario
                verificar la información oficial.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              3. Cuentas y Seguridad
            </h3>
            <p className="text-muted-foreground">
              El usuario es responsable de mantener la confidencialidad de sus
              credenciales.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              4. Carga de Información Académica
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">4.1 Veracidad:</strong> El
                usuario se compromete a cargar archivos verídicos de su propia
                historia académica.
              </li>
              <li>
                <strong className="text-foreground">4.2 Uso de Datos:</strong>{" "}
                Al subir su historia, autoriza el procesamiento para generar
                sugerencias y estadísticas anónimas.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              5. Propiedad Intelectual
            </h3>
            <p className="text-muted-foreground">
              El diseño y código fuente son propiedad intelectual del autor del
              Proyecto Integrador,{" "}
              <strong className="text-foreground">Juan Manuel Sanchez</strong>,
              y de la UNSL.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              6. Limitación de Responsabilidad
            </h3>
            <p className="text-muted-foreground">
              El Sistema no se hace responsable por decisiones académicas
              tomadas en base a las sugerencias de la plataforma. Siempre
              prevalece la normativa oficial de la Facultad.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
