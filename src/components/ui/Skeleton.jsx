"use client"

// Componente base de Skeleton con Tailwind
export function Skeleton({ className = "", ...props }) {
  return <div className={`skeleton ${className}`} {...props} />
}

// Skeleton para métricas
export function MetricSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border-l-4 border-gray-200">
      <div className="flex-shrink-0">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-3 w-3/5 mb-2" />
        <Skeleton className="h-6 w-2/5" />
      </div>
    </div>
  )
}

// Skeleton para tabla
export function TableSkeleton({ rows = 5, columns = 3 }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="grid gap-4 p-4 bg-gray-50 border-b border-gray-200"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-4/5" />
        ))}
      </div>
      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-3 w-4/5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton para gráficos
export function ChartSkeleton({ type = "bar" }) {
  if (type === "pie") {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <Skeleton className="h-4 w-3/5 mx-auto mb-6" />
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="w-48 h-48 rounded-full" />
          <div className="flex flex-col gap-3 w-full">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="w-3.5 h-3.5 rounded" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <Skeleton className="h-4 w-3/5 mx-auto mb-6" />
      <div className="flex items-end gap-4 h-48 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex-1 flex items-end">
            <Skeleton className="w-full rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton para selectores
export function SelectorSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

// Skeleton para lista de materias
export function MateriaListSkeleton({ count = 8 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg">
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  )
}
