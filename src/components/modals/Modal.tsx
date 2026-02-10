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
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descId = useRef(`modal-desc-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Store the element that had focus before modal opened
    previousActiveElement.current = document.activeElement as HTMLElement;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstFocusable?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTabKey);

    return () => {
      modal.removeEventListener("keydown", handleTabKey);
      // Restore focus when modal closes
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

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

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId.current}
      aria-describedby={descId.current}
      {...props}
    >
      <div
        ref={modalRef}
        className={cn(
          "bg-card text-card-foreground w-full max-h-[90vh] flex flex-col rounded-lg shadow-2xl border outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2
            id={titleId.current}
            className="text-lg sm:text-xl font-semibold text-foreground"
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div
          id={descId.current}
          className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar"
        >
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") as HTMLElement
  );
});

export default Modal;
