import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode, isValidElement } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode | LucideIcon;
  description?: string;
  color?: "blue" | "green" | "red" | "orange" | "teal" | "purple" | "gray";
  className?: string;
}

const colorStyles = {
  blue: "border-l-blue-500 text-blue-600 dark:text-blue-400",
  green: "border-l-green-500 text-green-600 dark:text-green-400",
  red: "border-l-red-500 text-red-600 dark:text-red-400",
  orange: "border-l-orange-500 text-orange-600 dark:text-orange-400",
  teal: "border-l-teal-500 text-teal-600 dark:text-teal-400",
  purple: "border-l-purple-500 text-purple-600 dark:text-purple-400",
  gray: "border-l-gray-500 text-gray-600 dark:text-gray-400",
};

export function MetricCard({
  title,
  value,
  icon,
  description,
  color = "blue",
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "border-l-4 shadow-sm hover:shadow-md transition-shadow",
        colorStyles[color],
        className,
      )}
    >
      <CardContent className="p-4 sm:p-5 flex items-center gap-4">
        {icon && (
          <div className="p-3 bg-background/50 rounded-full border shadow-sm shrink-0 text-current">
            {/* Lógica robusta de renderizado de icono */}
            {isValidElement(icon) ? (
              // Si ya es un elemento (<Icon />) o nodo válido
              icon
            ) : typeof icon === "string" || typeof icon === "number" ? (
              // Si es un emoji o texto
              <span className="text-2xl">{icon}</span>
            ) : (
              // Si es un componente (LucideIcon, función o objeto memo/forwardRef)
              // Lo instanciamos como componente
              (() => {
                const IconComponent = icon as LucideIcon;
                return <IconComponent className="w-6 h-6" />;
              })()
            )}
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
