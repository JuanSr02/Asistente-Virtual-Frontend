import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function PoliticaPrivacidad() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Button
          variant="ghost"
          asChild
          className="gap-2 pl-0 hover:bg-transparent hover:text-green-600 dark:hover:text-green-400"
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
            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-3xl font-bold text-foreground">
              Política de Privacidad
            </CardTitle>
          </div>
          <p className="text-muted-foreground mt-2">
            Última actualización: Diciembre 2025
          </p>
        </CardHeader>
        <CardContent className="space-y-8 text-justify leading-relaxed">
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              1. Información que Recopilamos
            </h3>
            <p className="text-muted-foreground mb-2">
              Para el funcionamiento del Asistente Virtual, recopilamos los
              siguientes datos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">
                  Datos de Identificación:
                </strong>{" "}
                Nombre, apellido, correo electrónico (y opcionalmente teléfono)
                obtenidos a través del registro o autenticación con Google.
              </li>
              <li>
                <strong className="text-foreground">Datos Académicos:</strong>{" "}
                Información contenida en los archivos (PDF/Excel) de historia
                académica subidos por el usuario (materias aprobadas, notas,
                fechas, regularidades).
              </li>
              <li>
                <strong className="text-foreground">Datos de Uso:</strong>{" "}
                Experiencias de exámenes compartidas (dificultad, tiempo de
                estudio) e inscripciones a mesas.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              2. Uso de la Información
            </h3>
            <p className="text-muted-foreground mb-2">
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Generar sugerencias personalizadas de exámenes a rendir.</li>
              <li>
                Calcular estadísticas generales y por materia (ej. tasa de
                aprobación).{" "}
                <strong className="text-foreground">
                  Estas estadísticas son anónimas
                </strong>{" "}
                y no revelan la identidad de ningún estudiante individual.
              </li>
              <li>
                Facilitar la funcionalidad de "Inscripción Social", permitiendo
                el contacto entre estudiantes inscritos a la misma mesa (solo si
                el usuario participa activamente).
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              3. Compartición de Datos
            </h3>
            <p className="text-muted-foreground">
              No vendemos ni alquilamos información personal a terceros. Los
              datos académicos agregados (estadísticas) pueden ser visibles para
              otros usuarios del sistema (estudiantes y administradores) pero
              siempre de forma disociada de la identidad del titular, salvo en
              el módulo de Inscripciones donde el usuario acepta compartir su
              contacto con compañeros de mesa.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              4. Almacenamiento y Seguridad
            </h3>
            <p className="text-muted-foreground mb-2">
              Los datos se almacenan en bases de datos seguras. Implementamos
              medidas de seguridad técnicas, como el uso de autenticación vía
              JWT (JSON Web Tokens) y cifrado de contraseñas, para proteger su
              información contra el acceso no autorizado.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              5. Derechos del Usuario (ARCO)
            </h3>
            <p className="text-muted-foreground">
              Como titular de los datos, usted tiene derecho a acceder,
              rectificar, actualizar y suprimir su información. Puede eliminar
              su historia académica o su cuenta completa en cualquier momento
              desde la sección
              <strong className="text-foreground"> Perfil</strong> de la
              aplicación. Al eliminar su cuenta, se borran todos sus datos
              personales asociados.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              6. Cookies y Almacenamiento Local
            </h3>
            <p className="text-muted-foreground">
              Utilizamos almacenamiento local para mantener su sesión activa y
              recordar sus preferencias de visualización. No utilizamos cookies
              de rastreo publicitario.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
