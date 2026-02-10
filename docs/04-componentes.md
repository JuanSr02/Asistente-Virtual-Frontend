# 🎨 Componentes

## Visión General

El proyecto utiliza una arquitectura de componentes modular y reutilizable, construida sobre **ShadCN UI** y **Radix UI**, con componentes personalizados específicos del dominio.

---

## Jerarquía de Componentes

```
┌─────────────────────────────────────────────────────┐
│              Nivel 1: Primitivos (Radix UI)         │
│  Dialog, Dropdown, Select, Checkbox, Toast, etc.   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         Nivel 2: Componentes Base (ShadCN)          │
│  Button, Card, Input, Label, Badge, etc.           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         Nivel 3: Componentes Compartidos            │
│  Skeleton, ModeToggle, ThemeProvider               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         Nivel 4: Componentes de Dominio             │
│  ExperienciaCard, HistoriaTable, etc.              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Nivel 5: Páginas                        │
│  StudentPage, AdminPage, DashboardPage             │
└─────────────────────────────────────────────────────┘
```

---

## Componentes UI Base (ShadCN)

### Button

**Ubicación**: `src/components/ui/button.tsx`

```typescript
import { Button } from '@/components/ui/button';

// Variantes disponibles
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tamaños
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Card

**Ubicación**: `src/components/ui/card.tsx`

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido de la tarjeta
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

### Input

**Ubicación**: `src/components/ui/input.tsx`

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="tu@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

### Select

**Ubicación**: `src/components/ui/select.tsx`

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona una opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opcion1">Opción 1</SelectItem>
    <SelectItem value="opcion2">Opción 2</SelectItem>
    <SelectItem value="opcion3">Opción 3</SelectItem>
  </SelectContent>
</Select>
```

### Dialog

**Ubicación**: `src/components/ui/dialog.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Modal</DialogTitle>
      <DialogDescription>
        Descripción del contenido
      </DialogDescription>
    </DialogHeader>
    {/* Contenido del modal */}
  </DialogContent>
</Dialog>
```

### Toast

**Ubicación**: `src/components/ui/toast.tsx`

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({
  title: "Éxito",
  description: "Operación completada correctamente",
});

// Error
toast({
  title: "Error",
  description: "Ocurrió un error",
  variant: "destructive",
});

// Con duración personalizada
toast({
  title: "Notificación",
  description: "Este mensaje desaparecerá en 3 segundos",
  duration: 3000,
});
```

---

## Componentes Compartidos

### Skeleton

**Ubicación**: `src/components/Skeleton.tsx`

Componente para estados de carga con animación.

```typescript
import { Skeleton } from '@/components/Skeleton';

// Skeleton de card
<Skeleton variant="card" />

// Skeleton de tabla
<Skeleton variant="table" rows={5} />

// Skeleton de texto
<Skeleton variant="text" lines={3} />

// Skeleton personalizado
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### ModeToggle

**Ubicación**: `src/components/mode-toggle.tsx`

Toggle para cambiar entre tema claro y oscuro.

```typescript
import { ModeToggle } from '@/components/mode-toggle';

<ModeToggle />
```

### ThemeProvider

**Ubicación**: `src/components/theme-provider.tsx`

Provider para gestión de temas.

```typescript
import { ThemeProvider } from '@/components/theme-provider';

<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

---

## Componentes de Estudiantes

### ExperienciaCard

**Ubicación**: `src/components/student/ExperienciaCard.tsx`

Card para mostrar experiencias de examen.

```typescript
import { ExperienciaCard } from '@/components/student/ExperienciaCard';

<ExperienciaCard
  experiencia={{
    id: '1',
    materia: 'Algoritmos y Estructuras de Datos',
    estudiante: 'Juan Pérez',
    turno: 'Marzo 2024',
    modalidad: 'PRESENCIAL',
    dificultad: 4,
    recursos: 'Apuntes de clase, ejercicios del libro',
    tips: 'Repasar bien los árboles binarios',
  }}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### HistoriaTable

**Ubicación**: `src/components/student/HistoriaTable.tsx`

Tabla para mostrar historia académica.

```typescript
import { HistoriaTable } from '@/components/student/HistoriaTable';

<HistoriaTable
  materias={[
    {
      codigo: 'INF-101',
      nombre: 'Programación I',
      estado: 'APROBADA',
      nota: 8,
      fecha: '2023-07-15',
    },
    // ...
  ]}
/>
```

### RecomendacionCard

**Ubicación**: `src/components/student/RecomendacionCard.tsx`

Card para mostrar recomendaciones de finales.

```typescript
import { RecomendacionCard } from '@/components/student/RecomendacionCard';

<RecomendacionCard
  materia={{
    codigo: 'INF-201',
    nombre: 'Algoritmos y Estructuras de Datos',
    prioridad: 'ALTA',
    razon: 'Regularidad vence en 3 meses',
    estadisticas: {
      tasaAprobacion: 65,
      dificultadPromedio: 3.5,
    },
  }}
  onInscribir={handleInscribir}
/>
```

### InscripcionCard

**Ubicación**: `src/components/student/InscripcionCard.tsx`

Card para gestionar inscripciones a mesas.

```typescript
import { InscripcionCard } from '@/components/student/InscripcionCard';

<InscripcionCard
  inscripcion={{
    id: '1',
    materia: 'Algoritmos y Estructuras de Datos',
    turno: 'Marzo 2024',
    fecha: '2024-03-15',
    inscriptos: 25,
    compartirContacto: true,
  }}
  onCancelar={handleCancelar}
  onToggleContacto={handleToggleContacto}
/>
```

---

## Componentes de Gráficos

### AprobacionChart

**Ubicación**: `src/components/charts/AprobacionChart.tsx`

Gráfico de tasas de aprobación.

```typescript
import { AprobacionChart } from '@/components/charts/AprobacionChart';

<AprobacionChart
  data={[
    { materia: 'Programación I', aprobacion: 75 },
    { materia: 'Algoritmos', aprobacion: 65 },
    { materia: 'Base de Datos', aprobacion: 80 },
  ]}
/>
```

### RendimientoChart

**Ubicación**: `src/components/charts/RendimientoChart.tsx`

Gráfico de rendimiento académico.

```typescript
import { RendimientoChart } from '@/components/charts/RendimientoChart';

<RendimientoChart
  data={[
    { periodo: '2023-1', promedio: 7.5, materiasAprobadas: 4 },
    { periodo: '2023-2', promedio: 8.0, materiasAprobadas: 5 },
    { periodo: '2024-1', promedio: 7.8, materiasAprobadas: 4 },
  ]}
/>
```

### DesertionChart

**Ubicación**: `src/components/charts/DesertionChart.tsx`

Gráfico de deserción por materia.

```typescript
import { DesertionChart } from '@/components/charts/DesertionChart';

<DesertionChart
  data={[
    { materia: 'Cálculo I', desercion: 35 },
    { materia: 'Física I', desercion: 40 },
    { materia: 'Programación I', desercion: 25 },
  ]}
/>
```

---

## Componentes de Layout

### ClientLayout

**Ubicación**: `src/components/layout/client-layout.tsx`

Layout principal del cliente con providers.

```typescript
import { ClientLayout } from '@/components/layout/client-layout';

<ClientLayout>
  {children}
</ClientLayout>
```

**Incluye**:
- QueryClientProvider (TanStack Query)
- ThemeProvider (next-themes)
- Toaster (sonner)
- ReactQueryDevtools (desarrollo)

---

## Componentes de Modales

### ConfirmModal

**Ubicación**: `src/components/modals/ConfirmModal.tsx`

Modal de confirmación reutilizable.

```typescript
import { ConfirmModal } from '@/components/modals/ConfirmModal';

<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirmar acción"
  description="¿Estás seguro de que deseas continuar?"
  confirmText="Confirmar"
  cancelText="Cancelar"
  variant="destructive"
/>
```

---

## Patrones de Componentes

### Composición

```typescript
// ✅ Componentes componibles
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <ExperienciaCard experiencia={exp} />
  </CardContent>
</Card>
```

### Props con TypeScript

```typescript
interface ComponentProps {
  title: string;
  description?: string;
  onAction: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export function Component({
  title,
  description,
  onAction,
  variant = 'default',
  className,
}: ComponentProps) {
  // ...
}
```

### Forwarding Refs

```typescript
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} className={className} {...props} />
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Render Props

```typescript
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataList<T>({
  data,
  renderItem,
  emptyMessage = 'No hay datos',
}: DataListProps<T>) {
  if (data.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return <div>{data.map(renderItem)}</div>;
}
```

---

## Mejores Prácticas

### 1. Componentes Pequeños y Enfocados

```typescript
// ✅ Bueno - componente enfocado
function UserAvatar({ user }) {
  return <img src={user.avatar} alt={user.name} />;
}

// ❌ Malo - componente que hace demasiado
function UserProfile({ user }) {
  // 200 líneas de código...
}
```

### 2. Props Explícitas

```typescript
// ✅ Bueno
<Button onClick={handleClick} disabled={isLoading}>
  Guardar
</Button>

// ❌ Malo
<Button {...props} />
```

### 3. Usar Composition sobre Props

```typescript
// ✅ Bueno
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Contenido</CardContent>
</Card>

// ❌ Malo
<Card title="Título" content="Contenido" />
```

### 4. Memoización Inteligente

```typescript
import { memo } from 'react';

// Solo memoizar componentes costosos
export const ExpensiveComponent = memo(({ data }) => {
  // Renderizado costoso
  return <div>{/* ... */}</div>;
});
```

---

## Testing de Componentes (Ejemplo Futuro)

> **Nota**: El testing no está implementado actualmente. Este es un ejemplo de cómo se testearían los componentes en el futuro.

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('debe renderizar correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('debe llamar onClick cuando se hace clic', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe estar deshabilitado cuando disabled es true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

---

**Próximo**: [Servicios y API →](./05-servicios-api.md)
