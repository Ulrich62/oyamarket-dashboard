import { create } from "zustand";

export type OnUploadedHandler = (url: string, posterUrl?: string | null) => void;
export type OnSelectMultipleHandler = (urls: string[]) => void;

export interface OpenUploaderOptions {
  onUploaded?: OnUploadedHandler;
  onSelectMultiple?: OnSelectMultipleHandler;
  multiple?: boolean;
  initialTab?: "library" | "upload";
  title?: string;
}

interface MediaUploaderState {
  isOpen: boolean;
  activeTab: "library" | "upload";
  allowMultiple: boolean;
  customTitle: string | null;
  lastUploadedUrl: string | null;
  lastUploadedPosterUrl: string | null;
  onUploadedCallback: OnUploadedHandler | null;
  onSelectMultipleCallback: OnSelectMultipleHandler | null;
  openUploader: (options?: OpenUploaderOptions | OnUploadedHandler) => void;
  closeUploader: () => void;
  setActiveTab: (tab: "library" | "upload") => void;
  toggleUploader: () => void;
  setLastUploadedUrl: (url: string | null, posterUrl?: string | null) => void;
}

export const useMediaUploader = create<MediaUploaderState>((set) => ({
  isOpen: false,
  activeTab: "library",
  allowMultiple: false,
  customTitle: null,
  lastUploadedUrl: null,
  lastUploadedPosterUrl: null,
  onUploadedCallback: null,
  onSelectMultipleCallback: null,
  openUploader: (options) => {
    if (typeof options === "function") {
      return set({
        isOpen: true,
        activeTab: "library",
        allowMultiple: false,
        customTitle: null,
        onUploadedCallback: options,
        onSelectMultipleCallback: null,
      });
    }

    return set({
      isOpen: true,
      activeTab: options?.initialTab || "library",
      allowMultiple: !!options?.multiple,
      customTitle: options?.title || null,
      onUploadedCallback: options?.onUploaded || null,
      onSelectMultipleCallback: options?.onSelectMultiple || null,
    });
  },
  closeUploader: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleUploader: () => set((state) => ({ isOpen: !state.isOpen })),
  setLastUploadedUrl: (url, posterUrl = null) => set({ lastUploadedUrl: url, lastUploadedPosterUrl: posterUrl }),
}));
