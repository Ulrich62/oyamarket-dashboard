import { create } from "zustand";

export type OnUploadedHandler = (url: string, posterUrl?: string | null) => void;

interface MediaUploaderState {
  isOpen: boolean;
  lastUploadedUrl: string | null;
  lastUploadedPosterUrl: string | null;
  onUploadedCallback: OnUploadedHandler | null;
  openUploader: (options?: { onUploaded?: OnUploadedHandler } | OnUploadedHandler) => void;
  closeUploader: () => void;
  toggleUploader: () => void;
  setLastUploadedUrl: (url: string | null, posterUrl?: string | null) => void;
}

export const useMediaUploader = create<MediaUploaderState>((set) => ({
  isOpen: false,
  lastUploadedUrl: null,
  lastUploadedPosterUrl: null,
  onUploadedCallback: null,
  openUploader: (options) => {
    const callback = typeof options === "function" ? options : options?.onUploaded || null;
    return set({
      isOpen: true,
      onUploadedCallback: callback,
    });
  },
  closeUploader: () => set({ isOpen: false }),
  toggleUploader: () => set((state) => ({ isOpen: !state.isOpen })),
  setLastUploadedUrl: (url, posterUrl = null) => set({ lastUploadedUrl: url, lastUploadedPosterUrl: posterUrl }),
}));
