# 🎯 Guía de Desarrollo

## Introducción

Esta guía establece las mejores prácticas, convenciones y flujos de trabajo para el desarrollo del proyecto **Asistente Virtual UNSL**.

---

## 🚀 Setup Inicial

### Prerequisitos

```bash
Node.js >= 18.17.0
pnpm >= 8.0.0
Git
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/JuanSr02/Asistente-Virtual-Frontend.git
cd Asistente-Virtual-Frontend

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Editar .env.local con tus credenciales
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 5. Ejecutar en desarrollo
pnpm dev
```

---

## 📝 Convenciones de Código

### Nomenclatura

#### Archivos y Carpetas

```typescript
// ✅ Componentes React: PascalCase
UserCard.tsx
ExperienciaForm.tsx

// ✅ Hooks: camelCase con prefijo 'use'
useUserData.ts
useExperiencias.ts

// ✅ Servicios: camelCase con sufijo 'Service'
userService.ts
experienciaService.ts

// ✅ Utilidades: camelCase
formatDate.ts
validators.ts

// ✅ Tipos: PascalCase
User.ts
ApiResponse.ts

// ✅ Rutas (App Router): kebab-case
reset-password/
historia-academica/
```

#### Variables y Funciones

```typescript
// ✅ Variables: camelCase
const userName = "Juan";
const isActive = true;

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com";
const MAX_RETRIES = 3;

// ✅ Funciones: camelCase
function fetchUserData() {}
const handleSubmit = () => {};

// ✅ Componentes: PascalCase
function UserCard() {}
const ExperienciaForm = () => {};

// ✅ Tipos e Interfaces: PascalCase
interface User {}
type ApiResponse<T> = {};
```

---

### Estructura de Componentes

#### Componente Funcional Estándar

```typescript
'use client'; // Si es client component

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';

interface UserCardProps {
  userId: string;
  onUpdate?: () => void;
}

export function UserCard({ userId, onUpdate }: UserCardProps) {
  // 1. Hooks
  const { data, isLoading } = useUserData(userId);
  const [isEditing, setIsEditing] = useState(false);

  // 2. Handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Lógica de guardado
    onUpdate?.();
  };

  // 3. Early returns
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!data) {
    return <div>No se encontró el usuario</div>;
  }

  // 4. Render principal
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{data.name}</h3>
      <p className="text-muted-foreground">{data.email}</p>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleEdit}>Editar</Button>
        <Button onClick={handleSave} variant="outline">
          Guardar
        </Button>
      </div>
    </div>
  );
}
```

---

### TypeScript

#### Tipado Estricto

```typescript
// ✅ Siempre tipar props
interface Props {
  title: string;
  count: number;
  onClose: () => void;
}

// ✅ Tipar estados
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);

// ✅ Tipar funciones
const fetchUser = async (id: string): Promise<User> => {
  // ...
};

// ❌ Evitar 'any'
const data: any = {}; // ❌ NO

// ✅ Usar tipos específicos o unknown
const data: User = {};
const data: unknown = {};
```

#### Tipos Reutilizables

```typescript
// src/lib/types/index.ts
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: "ESTUDIANTE" | "ADMINISTRADOR";
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export type Nullable<T> = T | null;
```

---

### Estilos con Tailwind

#### Convenciones

```typescript
// ✅ Usar la función cn() para composición
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className // Permitir override externo
)} />

// ✅ Orden de clases (recomendado)
// 1. Layout (flex, grid, block)
// 2. Sizing (w-, h-, p-, m-)
// 3. Typography (text-, font-)
// 4. Colors (bg-, text-, border-)
// 5. Effects (shadow-, rounded-, opacity-)
// 6. States (hover:, focus:, active:)

<div className="
  flex items-center gap-4
  w-full p-4 m-2
  text-lg font-semibold
  bg-white text-gray-900 border border-gray-200
  rounded-lg shadow-md
  hover:bg-gray-50 focus:ring-2
" />

// ❌ Evitar estilos inline
<div style={{ color: 'red' }} /> // ❌

// ✅ Usar Tailwind
<div className="text-red-500" /> // ✅
```

---

## 🔄 Flujo de Trabajo con Git

### Branches

```bash
main          # Producción (protegida)
develop       # Desarrollo (protegida)
feature/*     # Nuevas funcionalidades
bugfix/*      # Corrección de bugs
hotfix/*      # Fixes urgentes en producción
```

### Workflow

```bash
# 1. Crear nueva rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push a remoto
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub
# - Base: develop
# - Compare: feature/nueva-funcionalidad

# 5. Code Review y Merge
# - Revisar código
# - Aprobar PR
# - Merge a develop

# 6. Deploy a producción (desde develop)
git checkout main
git merge develop
git push origin main
```

---

### Commits Convencionales

Seguimos la especificación [Conventional Commits](https://www.conventionalcommits.org/).

#### Formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

#### Tipos

```bash
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato (no afectan código)
refactor: # Refactorización de código
perf:     # Mejoras de performance
test:     # Agregar o modificar tests
chore:    # Tareas de mantenimiento
```

#### Ejemplos

```bash
# Feature
git commit -m "feat(auth): agregar login con Google OAuth"

# Bugfix
git commit -m "fix(inscripciones): corregir error al cancelar inscripción"

# Documentación
git commit -m "docs: actualizar README con instrucciones de instalación"

# Refactor
git commit -m "refactor(services): simplificar lógica de experienciaService"

# Performance
git commit -m "perf(dashboard): optimizar queries de estadísticas"

# Breaking change
git commit -m "feat(api)!: cambiar estructura de response de /experiencias

BREAKING CHANGE: El campo 'data' ahora es un array en lugar de objeto"
```

---

## 🧪 Testing (Planificado)

> **Nota**: El testing automatizado no está implementado actualmente. Esta sección describe cómo se implementaría en el futuro.

### Estructura de Tests (Ejemplo Futuro)

```typescript
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('debe renderizar correctamente', () => {
    render(<UserCard userId="123" />);
    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });

  it('debe llamar onUpdate al hacer clic en guardar', () => {
    const mockOnUpdate = jest.fn();
    render(<UserCard userId="123" onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalled();
  });
});
```

---

## 📦 Gestión de Dependencias

### Agregar Dependencia

```bash
# Dependencia de producción
pnpm add nombre-paquete

# Dependencia de desarrollo
pnpm add -D nombre-paquete

# Versión específica
pnpm add nombre-paquete@1.2.3
```

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
pnpm outdated

# Actualizar todas (cuidado!)
pnpm update

# Actualizar una específica
pnpm update nombre-paquete
```

---

## 🔍 Linting y Formatting

### ESLint

```bash
# Ejecutar linter
pnpm lint

# Corregir automáticamente
pnpm lint:fix
```

### Prettier

```bash
# Formatear código
pnpm format
```

### Pre-commit Hooks

Configurado con Husky y lint-staged:

- Formatea archivos modificados con Prettier
- Ejecuta ESLint en archivos JS/TS

---

## 🎨 Creación de Componentes

### Componente UI Base (ShadCN)

```bash
# Agregar componente de ShadCN
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

### Componente Personalizado

```typescript
// src/components/shared/CustomCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CustomCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function CustomCard({ title, children, className }: CustomCardProps) {
  return (
    <Card className={cn('shadow-md', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

---

## 🪝 Creación de Hooks

### Hook Personalizado

```typescript
// src/hooks/domain/useCustomData.ts
import { useQuery } from "@tanstack/react-query";
import { customService } from "@/services/customService";
import { studentKeys } from "@/lib/query-keys";

export const useCustomData = (userId: string) => {
  return useQuery({
    queryKey: studentKeys.customData(userId),
    queryFn: () => customService.getData(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

---

## 🔧 Debugging

### Console Logging

```typescript
// Desarrollo
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}

// Producción (evitar)
console.error("Error crítico:", error); // Solo errores
```

### React DevTools

- Instalar extensión de navegador
- Inspeccionar componentes y props
- Ver hooks y estado

### TanStack Query DevTools

```typescript
// Ya incluido en el proyecto
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// En ClientLayout
<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## 📚 Recursos Útiles

### Documentación Oficial

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [ShadCN UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/docs)

### Herramientas

- [VS Code](https://code.visualstudio.com/)
- [GitHub Desktop](https://desktop.github.com/)
- [Postman](https://www.postman.com/) (testing de APIs)

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Module not found"

```bash
# Solución: Reinstalar dependencias
rm -rf node_modules
pnpm install
```

### Error: "Type error in build"

```bash
# Solución: Verificar tipos
pnpm type-check
```

### Error: "Hydration mismatch"

```typescript
// Problema: Diferencia entre SSR y CSR
// Solución: Usar 'use client' o dynamic import

import dynamic from "next/dynamic";

const ClientComponent = dynamic(() => import("./ClientComponent"), {
  ssr: false,
});
```

---

## 🎯 Checklist de PR

Antes de crear un Pull Request, verificar:

- [ ] Código formateado con Prettier
- [ ] Sin errores de ESLint
- [ ] Sin errores de TypeScript (`pnpm type-check`)
- [ ] Commits siguen convención
- [ ] Código documentado (si es necesario)
- [ ] Build exitoso (`pnpm build`)
- [ ] Descripción clara del PR

---

**Próximo**: [Testing y Calidad →](./13-testing-calidad.md)
