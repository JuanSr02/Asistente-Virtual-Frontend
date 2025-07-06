"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Utilidad de ShadCN para fusionar clases

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

// --- SKELETON BASE (MEJORADO) ---
// Ahora usa `bg-muted` para alinearse con el sistema de diseño de shadcn/ui.
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

// --- SKELETON PARA MÉTRICAS (RESPONSIVE) ---
export const MetricSkeleton: React.FC = () => (
  // Usa bg-card para consistencia y padding responsive.
  <div className="bg-card rounded-xl p-4 sm:p-5 shadow-md flex items-center gap-4 border">
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-3/5" />
      <Skeleton className="h-6 w-2/5" />
    </div>
  </div>
);

// --- SKELETON PARA TABLA (TOTALMENTE RESPONSIVE) ---
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 3,
}) => (
  // El contenedor con overflow-x-auto es la clave para la responsividad de la tabla.
  <div className="w-full overflow-x-auto rounded-lg border">
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-4 py-3">
              <Skeleton className="h-4 w-4/5" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: columns }).map((_, j) => (
              <td key={j} className="px-4 py-3">
                <Skeleton className="h-3 w-4/5" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- SKELETON PARA GRÁFICOS (RESPONSIVE) ---
interface ChartSkeletonProps {
  type?: "bar" | "pie";
}
export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  type = "bar",
}) => {
  if (type === "pie") {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6 shadow-md border">
        <Skeleton className="h-4 w-3/5 mx-auto mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
          {/* Círculo del gráfico responsivo */}
          <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex-shrink-0" />
          {/* Leyenda */}
          <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Bar Chart Skeleton
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 shadow-md border">
      <Skeleton className="h-4 w-3/5 mx-auto mb-6" />
      <div className="flex items-end gap-2 sm:gap-4 h-40 sm:h-48">
        {Array.from({ length: 8 }).map((_, i) => {
          // Aumentado a 8 para un look más denso
          const height = `${Math.floor(Math.random() * 60 + 20)}%`; // 20% a 80%
          return (
            <div key={i} className="flex-1 flex items-end h-full">
              <Skeleton className="w-full rounded-t-md" style={{ height }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- SKELETON PARA SELECTORES (SIN CAMBIOS, YA ES FLEXIBLE) ---
export const SelectorSkeleton: React.FC = () => (
  <div className="space-y-2">
    <Skeleton className="h-3 w-2/5" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

// --- SKELETON PARA LISTA (MEJORADO) ---
interface MateriaListSkeletonProps {
  count?: number;
}
export const MateriaListSkeleton: React.FC<MateriaListSkeletonProps> = ({
  count = 5,
}) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="p-4 border rounded-lg space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />{" "}
        {/* Línea adicional para simular el código */}
      </div>
    ))}
  </div>
);
