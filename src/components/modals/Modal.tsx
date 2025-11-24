"use client";

import {
  useEffect,
  useRef,
  memo,
  useState,
  type FC,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}

type CombinedModalProps = ModalProps &
  Omit<HTMLAttributes<HTMLDivElement>, "title">;

const Modal: FC<CombinedModalProps> = memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "32rem",
  className,
  ...props
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  // 2. AÑADIR ESTADO PARA MANEJAR SSR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Marcar como montado solo en el cliente
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // 3. LA LÓGICA DEL PORTAL
  // No renderizar nada si no está abierto o si no estamos en el cliente
  if (!isMounted || !isOpen) {
    return null;
  }

  // Renderizar el modal en el div #modal-root usando un Portal
  return createPortal(
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
    </div>,
    document.getElementById("modal-root") as HTMLElement // El punto de aterrizaje
  );
});

export default Modal;
