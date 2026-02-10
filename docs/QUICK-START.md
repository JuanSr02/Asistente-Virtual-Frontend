# ⚡ Quick Start - Asistente Virtual UNSL

Guía rápida para comenzar a trabajar con el proyecto en menos de 5 minutos.

---

## 🚀 Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/JuanSr02/Asistente-Virtual-Frontend.git
cd Asistente-Virtual-Frontend

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
pnpm dev

# 5. Abrir en navegador
# http://localhost:3000
```

---

## 📋 Variables de Entorno Mínimas

Crear archivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**¿Dónde obtener las credenciales?**
1. Ir a [Supabase Dashboard](https://app.supabase.com/)
2. Seleccionar tu proyecto
3. Settings → API
4. Copiar URL y anon key

---

## 🎯 Comandos Esenciales

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo
pnpm dev:legacy       # Desarrollo sin Turbopack

# Build
pnpm build            # Crear build de producción
pnpm start            # Ejecutar build de producción

# Calidad de Código
pnpm lint             # Ejecutar linter
pnpm lint:fix         # Corregir errores automáticamente
pnpm type-check       # Verificar tipos TypeScript
pnpm format           # Formatear código con Prettier

# Utilidades
pnpm clean            # Limpiar cache y builds
pnpm analyze          # Analizar tamaño de bundles
```

---

## 📁 Estructura Básica

```
src/
├── app/              # Rutas (App Router de Next.js)
│   ├── student/      # Módulo de estudiantes
│   ├── admin/        # Módulo de administración
│   └── auth/         # Autenticación
├── components/       # Componentes React
│   ├── ui/           # Componentes base (ShadCN)
│   ├── student/      # Componentes de estudiantes
│   └── shared/       # Componentes compartidos
├── hooks/            # Hooks personalizados
│   └── domain/       # Hooks de dominio
├── services/         # Servicios de API
├── lib/              # Utilidades y configuración
├── stores/           # Stores de Zustand
└── supabaseClient.ts # Cliente de Supabase
```

---

## 🔑 Conceptos Clave

### App Router (Next.js 16)
- Cada carpeta en `src/app/` es una ruta
- `page.tsx` = Componente de la página
- `layout.tsx` = Layout compartido
- `'use client'` = Componente del cliente

### TanStack Query
```typescript
// Obtener datos
const { data, isLoading } = useQuery({
  queryKey: ['estudiante', userId],
  queryFn: () => fetchEstudiante(userId),
});

// Mutar datos
const { mutate } = useMutation({
  mutationFn: createEstudiante,
  onSuccess: () => queryClient.invalidateQueries(['estudiante']),
});
```

### Zustand
```typescript
// Usar store
const { isOpen, openModal } = useModalStore();

// Actualizar estado
openModal('crear-experiencia', { materiaId: '123' });
```

---

## 🎨 Crear un Componente

```typescript
// src/components/shared/MiComponente.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MiComponenteProps {
  titulo: string;
  onClick: () => void;
}

export function MiComponente({ titulo, onClick }: MiComponenteProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{titulo}</h3>
      <Button onClick={onClick}>Acción</Button>
    </Card>
  );
}
```

---

## 🔌 Crear un Servicio

```typescript
// src/services/miService.ts
import axiosClient from '@/lib/axios-client';

export const miService = {
  obtenerDatos: async (id: string) => {
    const { data } = await axiosClient.get(`/api/datos/${id}`);
    return data;
  },

  crearDato: async (dato: any) => {
    const { data } = await axiosClient.post('/api/datos', dato);
    return data;
  },
};
```

---

## 🪝 Crear un Hook

```typescript
// src/hooks/domain/useMisDatos.ts
import { useQuery } from '@tanstack/react-query';
import { miService } from '@/services/miService';

export const useMisDatos = (userId: string) => {
  return useQuery({
    queryKey: ['mis-datos', userId],
    queryFn: () => miService.obtenerDatos(userId),
    enabled: !!userId,
  });
};
```

---

## 🛣️ Crear una Ruta

```typescript
// src/app/mi-ruta/page.tsx
'use client';

import { useMisDatos } from '@/hooks/domain/useMisDatos';

export default function MiRutaPage() {
  const { data, isLoading } = useMisDatos('123');

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Mi Ruta</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## 🐛 Debugging Rápido

### Ver queries en tiempo real
```typescript
// TanStack Query DevTools ya está incluido
// Abrir en desarrollo: http://localhost:3000
// Ver panel flotante en la esquina inferior
```

### Console logging
```typescript
// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data);
}
```

### React DevTools
- Instalar extensión de navegador
- Inspeccionar componentes y props
- Ver hooks y estado

---

## 📚 Documentación Completa

Para información detallada, consultar:

- 📊 [Resumen Ejecutivo](./00-resumen-ejecutivo.md)
- 🏗️ [Arquitectura](./01-arquitectura.md)
- 🛠️ [Stack Tecnológico](./02-stack-tecnologico.md)
- 📁 [Estructura del Proyecto](./03-estructura-proyecto.md)
- 🎯 [Guía de Desarrollo](./12-guia-desarrollo.md)
- 📊 [Diagramas](./11-diagramas.md)
- 📖 [Glosario](./16-glosario.md)

---

## ❓ Preguntas Frecuentes

### ¿Cómo agregar un componente de ShadCN?
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

### ¿Cómo hacer un commit?
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad"
```

### ¿Cómo hacer deploy?
```bash
# Push a main para deploy automático en Vercel
git push origin main
```

### ¿Dónde están las rutas de API?
```typescript
// src/lib/config.ts
export const API_ROUTES = {
  SHARED: { /* ... */ },
  ESTUDIANTE: { /* ... */ },
  ADMIN: { /* ... */ },
};
```

---

## 🆘 Ayuda

### Errores Comunes

**Error: "Module not found"**
```bash
rm -rf node_modules
pnpm install
```

**Error: "Type error"**
```bash
pnpm type-check
```

**Error: "Hydration mismatch"**
```typescript
// Agregar 'use client' al componente
'use client';
```

---

## 📞 Contacto

**Desarrollador**: Juan Sánchez  
**Email**: juanma2002123@gmail.com  
**GitHub**: [@JuanSr02](https://github.com/JuanSr02)

---

## 🎉 ¡Listo!

Ya estás preparado para comenzar a desarrollar. Para más información, consulta la [documentación completa](./README.md).

**Happy Coding! 🚀**
