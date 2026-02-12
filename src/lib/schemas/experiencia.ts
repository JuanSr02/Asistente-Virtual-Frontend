import { z } from "zod";

export const experienciaSchema = z.object({
  examenId: z.string().min(1, "Debes seleccionar un examen"),
  dificultad: z
    .number()
    .min(1, "La dificultad mínima es 1")
    .max(10, "La dificultad máxima es 10"),
  diasEstudio: z
    .number()
    .min(1, "Debe ser al menos 1 día")
    .max(365, "No puede superar 365 días"),
  horasDiarias: z
    .number()
    .min(1, "Debe ser al menos 1 hora")
    .max(24, "No puede superar 24 horas"),
  intentosPrevios: z
    .number()
    .min(0, "No puede ser negativo")
    .max(3, "Valor máximo: 3"),
  modalidad: z.enum(["ESCRITO", "ORAL", "ESCRITO Y ORAL"]),
  recursos: z
    .array(z.string())
    .min(1, "Selecciona al menos un recurso utilizado"),
  motivacion: z.string().min(1, "Selecciona una motivación"),
  linkResumen: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return true;
      },
      { message: "Formato inválido" },
    ),
});

export type ExperienciaFormData = z.infer<typeof experienciaSchema>;
