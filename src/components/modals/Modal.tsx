"use client";

import {
  useEffect,
  useRef,
  memo,
  type FC,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- TIPADO CORREGIDO ---
// En lugar de extender HTMLAttributes, definimos nuestras props específicas
// y luego permitimos que el resto de las props de un div se pasen.
// Esto evita conflictos de tipos.
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  className?: string; // Permitimos pasar clases al contenedor del modal
}

// Usamos `Omit` para quitar `title` de HTMLAttributes y evitar la colisión.
// Luego, unimos nuestras ModalProps con el resto de los atributos de un div.
type CombinedModalProps = ModalProps &
  Omit<HTMLAttributes<HTMLDivElement>, "title">;

const Modal: FC<CombinedModalProps> = memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "32rem",
  className,
  ...props // El resto de las props se aplican al overlay
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      {...props}
    >
      <div
        ref={modalRef}
        className={cn(
          "bg-card text-card-foreground w-full max-h-[90vh] flex flex-col rounded-lg shadow-2xl border outline-none",
          className
        )}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            {title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
});

export default Modal;
