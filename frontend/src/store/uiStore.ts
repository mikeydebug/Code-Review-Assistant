import { create } from 'zustand';

interface UiState {
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedFileId: null,
  setSelectedFileId: (id) => set({ selectedFileId: id }),
}));
