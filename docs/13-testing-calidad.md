# 🧪 Testing y Calidad

> **⚠️ NOTA IMPORTANTE**: Este documento describe las **estrategias y herramientas recomendadas** para testing en el proyecto. Actualmente, el testing **NO está implementado** como decisión de alcance del proyecto. Esta documentación sirve como guía para implementación futura.

## Visión General

El proyecto utiliza herramientas de calidad de código (ESLint, Prettier, TypeScript) para garantizar la mantenibilidad del sistema. El testing automatizado está planificado para futuras iteraciones.

---

## Herramientas de Calidad

### ESLint

**Configuración**: `eslint.config.js`

Linter para identificar y reportar patrones problemáticos en el código.

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

**Comandos**:

```bash
# Ejecutar linter
pnpm lint

# Corregir automáticamente
pnpm lint:fix
```

---

### Prettier

**Configuración**: `.prettierrc`

Formateador de código opinionado.

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Comandos**:

```bash
# Formatear código
pnpm format

# Verificar formato
pnpm format:check
```

---

### TypeScript

**Configuración**: `tsconfig.json`

Type checking estricto.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
}
```

**Comandos**:

```bash
# Verificar tipos
pnpm type-check
```

---

## Testing (Planificado para Futuras Iteraciones)

> **Nota**: Las siguientes secciones describen cómo implementar testing en el proyecto. Actualmente no hay tests implementados.

### Jest (Configuración Futura)

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

---

### Testing Library

#### Test de Componente

```typescript
// Button.test.tsx
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

  it('debe aplicar la variante correcta', () => {
    const { container } = render(
      <Button variant="destructive">Delete</Button>
    );
    expect(container.firstChild).toHaveClass('bg-destructive');
  });
});
```

#### Test de Hook

```typescript
// useHistoriaAcademica.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHistoriaAcademica } from '@/hooks/domain/useHistoriaAcademica';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useHistoriaAcademica', () => {
  it('debe obtener historia académica', async () => {
    const { result } = renderHook(
      () => useHistoriaAcademica('123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.historia).toBeDefined();
  });

  it('debe cargar historia desde archivo', async () => {
    const { result } = renderHook(
      () => useHistoriaAcademica('123'),
      { wrapper: createWrapper() }
    );

    const file = new File(['content'], 'historia.pdf', {
      type: 'application/pdf',
    });

    result.current.cargarHistoria(file);

    await waitFor(() =>
      expect(result.current.isCargarLoading).toBe(false)
    );
  });
});
```

#### Test de Servicio

```typescript
// experienciaService.test.ts
import axiosClient from '@/lib/axios-client';
import { experienciaService } from '@/services/experienciaService';

jest.mock('@/lib/axios-client');
const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe('experienciaService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe obtener experiencias por materia', async () => {
    const mockData = [
      { id: '1', materia: 'Test', dificultad: 3 },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await experienciaService
      .obtenerExperienciasPorMateria('123');

    expect(result).toEqual(mockData);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('123')
    );
  });

  it('debe crear experiencia', async () => {
    const newExperiencia = {
      estudianteId: '1',
      materiaId: '2',
      dificultad: 4,
    };
    mockedAxios.post.mockResolvedValue({ data: newExperiencia });

    const result = await experienciaService.crearExperiencia(newExperiencia);

    expect(result).toEqual(newExperiencia);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      newExperiencia
    );
  });

  it('debe manejar errores correctamente', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(
      experienciaService.obtenerExperienciasPorMateria('123')
    ).rejects.toThrow('Network error');
  });
});
```

---

## E2E Testing (Playwright - Futuro)

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('debe permitir login con credenciales válidas', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText(
      'Credenciales inválidas'
    );
  });
});
```

---

## Git Hooks

### Husky

**Configuración**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

### lint-staged

**Configuración**: `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,md,mdx,json}": [
      "prettier --write"
    ],
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

---

## Cobertura de Código

### Configuración de Coverage

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

**Comandos**:

```bash
# Ejecutar tests con coverage
pnpm test:coverage

# Ver reporte HTML
open coverage/index.html
```

---

## Análisis de Código

### Bundle Analyzer

```bash
# Analizar tamaño de bundles
pnpm analyze
```

Genera visualización interactiva del tamaño de los bundles.

---

## Métricas de Calidad

### Lighthouse

Métricas objetivo:

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

---

## Checklist de Calidad

### Antes de Commit

- [ ] Código formateado con Prettier
- [ ] Sin errores de ESLint
- [ ] Sin errores de TypeScript
- [ ] Tests pasando (si aplica)
- [ ] Sin console.log innecesarios

### Antes de PR

- [ ] Descripción clara del PR
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] Build exitoso
- [ ] Sin conflictos con main

### Antes de Deploy

- [ ] Tests E2E pasando
- [ ] Performance verificado
- [ ] Lighthouse score > 90
- [ ] Sin errores en producción
- [ ] Changelog actualizado

---

## Convenciones de Código

### Nomenclatura

```typescript
// Variables y funciones: camelCase
const userName = 'Juan';
function fetchUserData() { }

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Componentes y tipos: PascalCase
interface User { }
function UserCard() { }

// Archivos de componentes: PascalCase
UserCard.tsx
ExperienciaForm.tsx

// Archivos de utilidades: camelCase
formatDate.ts
validators.ts
```

### Imports

```typescript
// 1. React y librerías externas
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Componentes
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Hooks
import { useHistoriaAcademica } from '@/hooks/domain/useHistoriaAcademica';

// 4. Servicios y utilidades
import { historiaService } from '@/services/historiaService';
import { cn } from '@/lib/utils';

// 5. Tipos
import type { User } from '@/lib/types';
```

### Comentarios

```typescript
// ✅ Bueno - explica el "por qué"
// Usamos setTimeout para evitar race condition con el modal
setTimeout(() => closeModal(), 100);

// ❌ Malo - explica el "qué" (obvio)
// Cierra el modal
closeModal();
```

---

## Debugging

### React DevTools

- Inspeccionar componentes
- Ver props y estado
- Profiler para performance

### TanStack Query DevTools

- Ver queries activas
- Inspeccionar cache
- Forzar refetch

### Console Logging

```typescript
// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Errores (siempre)
console.error('Error crítico:', error);
```

---

## Mejores Prácticas

### 1. Tests Descriptivos

```typescript
// ✅ Bueno
it('debe mostrar error cuando el email es inválido', () => { });

// ❌ Malo
it('test 1', () => { });
```

### 2. Arrange-Act-Assert

```typescript
it('debe crear experiencia', async () => {
  // Arrange
  const experiencia = { /* ... */ };
  
  // Act
  const result = await crearExperiencia(experiencia);
  
  // Assert
  expect(result).toBeDefined();
  expect(result.id).toBeTruthy();
});
```

### 3. Mocks Mínimos

```typescript
// ✅ Bueno - solo mockear lo necesario
jest.mock('@/services/experienciaService', () => ({
  crearExperiencia: jest.fn(),
}));

// ❌ Malo - mockear todo
jest.mock('@/services/experienciaService');
```

---

**Próximo**: [Performance y Optimización →](./14-performance.md)
