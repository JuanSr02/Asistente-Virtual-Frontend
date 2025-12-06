import { z } from "zod";

export const profileSchema = z.object({
  nombreApellido: z
    .string()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, "Solo se permiten letras y espacios")
    .refine((val) => !val || val.length >= 2, {
      message: "El nombre debe tener al menos 2 caracteres",
    })
    .optional(),
  mail: z
    .string()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Ingresa un correo electrónico válido",
    })
    .optional(),
  telefono: z
    .string()
    .regex(
      /^[\d\s\-\+\(\)]*$/,
      "Formato inválido (solo números, +, -, espacios)"
    )
    .optional(),
  contrasenia: z
    .string()
    .refine((val) => !val || val.length >= 8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    })
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
