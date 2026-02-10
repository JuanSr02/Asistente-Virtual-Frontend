import { create } from "zustand";

interface ModalState<T = any> {
  isOpen: boolean;
  data: T | null;
  type: string | null;
}

interface ModalsStore {
  modals: Record<string, ModalState>;
  openModal: (id: string, data?: any, type?: string) => void;
  closeModal: (id: string) => void;
}

export const useModalStore = create<ModalsStore>((set) => ({
  modals: {},
  openModal: (id, data = null, type = "default") =>
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { isOpen: true, data, type },
      },
    })),
  closeModal: (id) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: {
          ...(state.modals[id] || { data: null, type: null }),
          isOpen: false,
        },
      },
    })),
}));

/**
 * Hook helper para usar en componentes.
 * Facilita la migración desde el hook legacy.
 */
export function useModal(id: string) {
  const { modals, openModal, closeModal } = useModalStore();
  const modalState = modals[id] || { isOpen: false, data: null, type: null };

  return {
    isOpen: modalState.isOpen,
    data: modalState.data,
    type: modalState.type,
    openModal: (data?: any, type?: string) => openModal(id, data, type),
    closeModal: () => closeModal(id),
  };
}
