import { create } from "zustand";

interface MediaUploaderState {
  isOpen: boolean;
  lastUploadedUrl: string | null;
  onUploadedCallback: ((url: string) => void) | null;
  openUploader: (options?: { onUploaded?: (url: string) => void }) => void;
  closeUploader: () => void;
  toggleUploader: () => void;
  setLastUploadedUrl: (url: string | null) => void;
}

export const useMediaUploader = create<MediaUploaderState>((set) => ({
  isOpen: false,
  lastUploadedUrl: null,
  onUploadedCallback: null,
  openUploader: (options) =>
    set({
      isOpen: true,
      onUploadedCallback: options?.onUploaded || null,
    }),
  closeUploader: () => set({ isOpen: false }),
  toggleUploader: () => set((state) => ({ isOpen: !state.isOpen })),
  setLastUploadedUrl: (url) => set({ lastUploadedUrl: url }),
}));
