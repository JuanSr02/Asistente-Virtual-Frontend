"use client";

import { useRef, useState } from "react";
import { Upload, Book, Youtube, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { APP_CONFIG } from "@/lib/config";
import { toast } from "sonner";

interface CargaHistoriaProps {
  planes: any[];
  onUpload: (file: File, plan: string) => Promise<any>;
  isUploading: boolean;
}

export function CargaHistoria({
  planes,
  onUpload,
  isUploading,
}: CargaHistoriaProps) {
  const [planSeleccionado, setPlanSeleccionado] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!planSeleccionado) {
      toast.error("Por favor, selecciona un plan de estudio primero.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
      toast.error("Formato de archivo no válido.");
      return;
    }

    await onUpload(file, planSeleccionado);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Carga tu Historia Académica</CardTitle>
        <CardDescription>
          Sube tu analítico (PDF o Excel) del SIU Guaraní para generar
          sugerencias.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-w-md mx-auto">
        {/* Ayuda */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center text-sm">
          <p className="mb-2 text-blue-800 dark:text-blue-300">
            ¿Necesitas ayuda para descargarlo?
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open("https://youtu.be/0MnMoquT22I", "_blank")
              }
            >
              <Youtube className="mr-2 h-4 w-4" /> Tutorial
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() =>
                window.open("https://g3.unsl.edu.ar/g3/", "_blank")
              }
            >
              <Book className="mr-2 h-4 w-4" /> SIU Guaraní
            </Button>
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>1. Plan de Estudio</Label>
            <Select
              value={planSeleccionado}
              onValueChange={setPlanSeleccionado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu plan" />
              </SelectTrigger>
              <SelectContent>
                {planes.map((p) => (
                  <SelectItem key={p.codigo} value={p.codigo}>
                    {p.propuesta} ({p.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>2. Archivo</Label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button
              className="w-full"
              disabled={isUploading || !planSeleccionado}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "Procesando..." : "Subir Historia Académica"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
